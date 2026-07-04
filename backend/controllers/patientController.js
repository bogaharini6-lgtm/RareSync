const db = require('../config/db');
const { logAudit } = require('./auditController');

// ─── ADD PATIENT ────────────────────────────────────────────
exports.addPatient = async (req, res) => {
  const { name, dob, gender, contact, address, blood_group, emergency_contact } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Patient name is required.' });
  }

  // hospital_id comes from the logged in user (hospital staff or doctor's hospital)
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

// ─── GET ALL PATIENTS (with search) ────────────────────────
exports.getPatients = async (req, res) => {
  const hospital_id = req.user.role === 'hospital' ? req.user.id : req.user.hospital_id;
  const search = req.query.search || '';

  try {
    const [rows] = await db.execute(
      `SELECT * FROM patients 
       WHERE hospital_id = ? AND (name LIKE ? OR contact LIKE ?) 
       ORDER BY created_at DESC`,
      [hospital_id, `%${search}%`, `%${search}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET SINGLE PATIENT ─────────────────────────────────────
exports.getPatientById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    await logAudit(req.user, 'record_viewed', 'patient', req.params.id, `Viewed patient ${rows[0].name}`);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE PATIENT ──────────────────────────────────────────
exports.updatePatient = async (req, res) => {
  const { name, dob, gender, contact, address, blood_group, emergency_contact } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Patient name is required.' });
  }

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

// ─── DELETE PATIENT ──────────────────────────────────────────
exports.deletePatient = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT name FROM patients WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    await db.execute('DELETE FROM patients WHERE id = ?', [req.params.id]);

    await logAudit(req.user, 'patient_deleted', 'patient', req.params.id, `Patient ${rows[0].name} deleted`);

    res.json({ message: 'Patient deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};