const db = require('../config/db');
const { logAudit } = require('./auditController');

// ─── ADD PATIENT ─────────────────────────────────────────────
exports.addPatient = async (req, res) => {
  const { name, dob, gender, contact, address, blood_group, emergency_contact } = req.body;
  if (!name) return res.status(400).json({ message: 'Patient name is required.' });

  const hospital_id = req.user.role === 'hospital' ? req.user.id : req.user.hospital_id;

  try {
    const [result] = await db.execute(
      `INSERT INTO patients 
       (hospital_id, name, dob, gender, contact, address, blood_group, emergency_contact) 
       VALUES (?,?,?,?,?,?,?,?)`,
      [hospital_id, name, dob || null, gender || null, contact, address, blood_group, emergency_contact]
    );
    await logAudit(req.user, 'patient_created', 'patient', result.insertId, `Patient ${name} added`);
    res.status(201).json({ message: 'Patient added successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL PATIENTS (with search) ──────────────────────────
// Doctors see limited info unless they have access
exports.getPatients = async (req, res) => {
  const hospital_id = req.user.role === 'hospital' ? req.user.id : req.user.hospital_id;
  const search = req.query.search || '';

  try {
    const [rows] = await db.execute(
      `SELECT id, name, gender, contact, blood_group, created_at, hospital_id
       FROM patients 
       WHERE hospital_id = ? AND (name LIKE ? OR contact LIKE ?) 
       ORDER BY created_at DESC`,
      [hospital_id, `%${search}%`, `%${search}%`]
    );

    // For doctors: mark which patients they have full access to
    if (req.user.role === 'doctor') {
      const [approvedRequests] = await db.execute(
        `SELECT patient_id FROM access_requests 
         WHERE doctor_id = ? AND status = 'Approved'`,
        [req.user.id]
      );

      const [ownRecords] = await db.execute(
        `SELECT DISTINCT patient_id FROM medical_records WHERE doctor_id = ?`,
        [req.user.id]
      );

      const approvedIds = new Set([
        ...approvedRequests.map((r) => r.patient_id),
        ...ownRecords.map((r) => r.patient_id),
      ]);

      const patientsWithAccess = rows.map((p) => ({
        ...p,
        access_level: approvedIds.has(p.id) ? 'full' : 'limited',
      }));

      return res.json(patientsWithAccess);
    }

    // Hospital sees everything
    const patientsWithAccess = rows.map((p) => ({ ...p, access_level: 'full' }));
    res.json(patientsWithAccess);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET SINGLE PATIENT ───────────────────────────────────────
// accessLevel set by checkPatientAccess middleware
exports.getPatientById = async (req, res) => {
  const patient = req.patient;
  const accessLevel = req.accessLevel;

  await logAudit(req.user, 'record_viewed', 'patient', patient.id, `Viewed patient ${patient.name}`);

  if (accessLevel === 'limited') {
    // Return only basic info
    return res.json({
      id: patient.id,
      name: patient.name,
      hospital_id: patient.hospital_id,
      access_level: 'limited',
    });
  }

  // Full access
  res.json({ ...patient, access_level: 'full' });
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
    const [rows] = await db.execute('SELECT name FROM patients WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Patient not found.' });

    await db.execute('DELETE FROM patients WHERE id = ?', [req.params.id]);
    await logAudit(req.user, 'patient_deleted', 'patient', req.params.id, `Patient ${rows[0].name} deleted`);
    res.json({ message: 'Patient deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};