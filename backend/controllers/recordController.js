const db = require('../config/db');
const { logAudit } = require('./auditController');

// ─── ADD MEDICAL RECORD ──────────────────────────────────────
exports.addRecord = async (req, res) => {
  const { patient_id, record_type, title, content, visit_date } = req.body;
  const doctor_id = req.user.id;

  if (!patient_id || !record_type || !content) {
    return res.status(400).json({ message: 'Patient, record type and content are required.' });
  }

  const validTypes = ['diagnosis', 'prescription', 'treatment_note', 'visit_history'];
  if (!validTypes.includes(record_type)) {
    return res.status(400).json({ message: 'Invalid record type.' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO medical_records 
       (patient_id, doctor_id, record_type, title, content, visit_date)
       VALUES (?,?,?,?,?,?)`,
      [patient_id, doctor_id, record_type, title || '', content, visit_date || null]
    );

    await logAudit(
      req.user,
      'record_created',
      'medical_record',
      result.insertId,
      `${record_type} added for patient ${patient_id}`
    );

    res.status(201).json({ message: 'Record added successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL RECORDS FOR A PATIENT ──────────────────────────
exports.getRecordsByPatient = async (req, res) => {
  const { type } = req.query;

  try {
    let query = `
      SELECT mr.*, d.name AS doctor_name
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      WHERE mr.patient_id = ?
    `;
    const params = [req.params.patient_id];

    if (type) {
      query += ' AND mr.record_type = ?';
      params.push(type);
    }

    query += ' ORDER BY mr.created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET SINGLE RECORD ───────────────────────────────────────
exports.getRecordById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT mr.*, d.name AS doctor_name
       FROM medical_records mr
       JOIN doctors d ON mr.doctor_id = d.id
       WHERE mr.id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE RECORD ───────────────────────────────────────────
exports.updateRecord = async (req, res) => {
  const { title, content, visit_date } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required.' });
  }

  try {
    await db.execute(
      `UPDATE medical_records
       SET title=?, content=?, visit_date=?
       WHERE id=? AND doctor_id=?`,
      [title || '', content, visit_date || null, req.params.id, req.user.id]
    );

    await logAudit(req.user, 'record_updated', 'medical_record', req.params.id, 'Record updated');

    res.json({ message: 'Record updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE RECORD ───────────────────────────────────────────
exports.deleteRecord = async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM medical_records WHERE id=? AND doctor_id=?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};