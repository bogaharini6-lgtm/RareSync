const db = require('../config/db');
const { logAudit } = require('./auditController');
const sendEmail = require('../utils/sendEmail');
const templates = require('../utils/emailTemplates');

// ─── ADD PATIENT ─────────────────────────────────────────────
exports.addPatient = async (req, res) => {
  const { name, dob, gender, contact, address, blood_group, emergency_contact } = req.body;
  if (!name) return res.status(400).json({ message: 'Patient name is required.' });

  const hospital_id = req.user.role === 'hospital' ? req.user.id : req.user.hospital_id;
  const created_by_doctor = req.user.role === 'doctor' ? req.user.id : null;

  try {
    const [result] = await db.execute(
      `INSERT INTO patients 
       (hospital_id, name, dob, gender, contact, address, blood_group, emergency_contact, created_by_doctor) 
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [hospital_id, name, dob || null, gender || null, contact, address, blood_group, emergency_contact, created_by_doctor]
    );

    await logAudit(req.user, 'patient_created', 'patient', result.insertId, `Patient ${name} added`);

    if (req.user.role === 'doctor') {
      const [hospitals] = await db.execute('SELECT name, email FROM hospitals WHERE id = ?', [hospital_id]);
      const [doctors] = await db.execute('SELECT name FROM doctors WHERE id = ?', [req.user.id]);
      if (hospitals.length && doctors.length) {
        sendEmail({
          to: hospitals[0].email,
          subject: `New patient added — ${name}`,
          html: templates.patientAdded({
            hospitalName: hospitals[0].name,
            doctorName: doctors[0].name,
            patientName: name,
            gender,
            bloodGroup: blood_group,
            addedAt: new Date(),
          }),
        });
      }
    }

    res.status(201).json({ message: 'Patient added successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL PATIENTS ─────────────────────────────────────────
exports.getPatients = async (req, res) => {
  const search = req.query.search || '';

  try {
    // ── HOSPITAL: own patients only ──────────────────────────
    if (req.user.role === 'hospital') {
      const [rows] = await db.execute(
        `SELECT p.*, h.name AS hospital_name,
           GROUP_CONCAT(DISTINCT rd.name SEPARATOR ', ') AS disease_names
         FROM patients p
         JOIN hospitals h ON p.hospital_id = h.id
         LEFT JOIN patient_diseases pd ON pd.patient_id = p.id
         LEFT JOIN rare_diseases rd ON rd.id = pd.disease_id
         WHERE p.hospital_id = ? AND (p.name LIKE ? OR p.contact LIKE ?)
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [req.user.id, `%${search}%`, `%${search}%`]
      );
      return res.json(rows.map((p) => ({ ...p, access_level: 'full', access_status: 'approved' })));
    }

    // ── DOCTOR: all patients across all hospitals ─────────────
    const doctor_id = req.user.id;

    const [approvedRequests] = await db.execute(
      `SELECT patient_id FROM access_requests WHERE doctor_id = ? AND status = 'Approved'`,
      [doctor_id]
    );
    const [pendingRequests] = await db.execute(
      `SELECT patient_id FROM access_requests WHERE doctor_id = ? AND status = 'Pending'`,
      [doctor_id]
    );
    const [ownRecords] = await db.execute(
      `SELECT DISTINCT patient_id FROM medical_records WHERE doctor_id = ?`,
      [doctor_id]
    );

    const approvedIds = new Set([
      ...approvedRequests.map((r) => r.patient_id),
      ...ownRecords.map((r) => r.patient_id),
    ]);
    const pendingIds = new Set(pendingRequests.map((r) => r.patient_id));
    const ownRecordIds = new Set(ownRecords.map((r) => r.patient_id));

    const [rows] = await db.execute(
      `SELECT p.id, p.name, p.dob, p.gender, p.hospital_id, p.created_at,
              p.created_by_doctor,
              h.name AS hospital_name,
              GROUP_CONCAT(DISTINCT rd.name SEPARATOR ', ') AS disease_names
       FROM patients p
       JOIN hospitals h ON p.hospital_id = h.id
       LEFT JOIN patient_diseases pd ON pd.patient_id = p.id
       LEFT JOIN rare_diseases rd ON rd.id = pd.disease_id
       WHERE (p.name LIKE ? OR h.name LIKE ?)
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [`%${search}%`, `%${search}%`]
    );

    const result = rows.map((p) => {
      let age = null;
      if (p.dob) {
        const today = new Date();
        const dob = new Date(p.dob);
        age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      }

     const isAssignedDoctor = p.created_by_doctor === doctor_id;
const hasOwnRecords = ownRecordIds.has(p.id);
const isApproved = approvedIds.has(p.id);
const isPending = pendingIds.has(p.id) && !isAssignedDoctor && !hasOwnRecords && !isApproved;

let access_level = 'limited';
let access_status = 'none';

// Full access ONLY if:
// 1. Doctor created this patient
// 2. Doctor has posted records for this patient
// 3. Doctor has an approved access request
if (isAssignedDoctor || hasOwnRecords || isApproved) {
  access_level = 'full';
  access_status = isAssignedDoctor || hasOwnRecords ? 'assigned' : 'approved';
} else if (isPending) {
  access_level = 'limited';
  access_status = 'pending';
} else {
  access_level = 'limited';
  access_status = 'none';
}

      return {
        id: p.id,
        name: p.name,
        age,
        gender: p.gender,
        hospital_name: p.hospital_name,
        hospital_id: p.hospital_id,
        disease_names: p.disease_names || null,
        created_at: p.created_at,
        created_by_doctor: p.created_by_doctor,
        access_level,
        access_status,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET SINGLE PATIENT ───────────────────────────────────────
exports.getPatientById = async (req, res) => {
  const patient = req.patient;
  const accessLevel = req.accessLevel;

  await logAudit(req.user, 'record_viewed', 'patient', patient.id, `Viewed patient ${patient.name}`);

  const [hospitals] = await db.execute(
    'SELECT name FROM hospitals WHERE id = ?',
    [patient.hospital_id]
  );
  const hospital_name = hospitals[0]?.name || '';

  let age = null;
  if (patient.dob) {
    const today = new Date();
    const dob = new Date(patient.dob);
    age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  }

  if (accessLevel === 'limited') {
    const [diseases] = await db.execute(
      `SELECT rd.name FROM patient_diseases pd
       JOIN rare_diseases rd ON pd.disease_id = rd.id
       WHERE pd.patient_id = ?`,
      [patient.id]
    );
    return res.json({
      id: patient.id,
      name: patient.name,
      age,
      gender: patient.gender,
      hospital_id: patient.hospital_id,
      hospital_name,
      disease_names: diseases.map((d) => d.name).join(', '),
      access_level: 'limited',
    });
  }

  res.json({ ...patient, age, hospital_name, access_level: 'full' });
};

// ─── UPDATE PATIENT ───────────────────────────────────────────
exports.updatePatient = async (req, res) => {
  if (req.accessLevel !== 'full') {
    return res.status(403).json({ message: 'You do not have full access to edit this patient.' });
  }
  const { name, dob, gender, contact, address, blood_group, emergency_contact } = req.body;
  if (!name) return res.status(400).json({ message: 'Patient name is required.' });

  try {
    await db.execute(
      `UPDATE patients 
       SET name=?, dob=?, gender=?, contact=?, address=?, blood_group=?, emergency_contact=? 
       WHERE id=?`,
      [name, dob || null, gender || null, contact, address, blood_group, emergency_contact, req.params.id]
    );
    await logAudit(req.user, 'patient_updated', 'patient', req.params.id, `Patient ${name} updated`);
    res.json({ message: 'Patient updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE PATIENT ───────────────────────────────────────────
exports.deletePatient = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT name FROM patients WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Patient not found.' });

    await db.execute('DELETE FROM patients WHERE id = ?', [req.params.id]);
    await logAudit(req.user, 'patient_deleted', 'patient', req.params.id, `Patient ${rows[0].name} deleted`);
    res.json({ message: 'Patient deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};