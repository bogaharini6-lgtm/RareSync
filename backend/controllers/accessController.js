const db = require('../config/db');
const { logAudit } = require('./auditController');

// ─── DOCTOR REQUESTS ACCESS TO PATIENT ──────────────────────
exports.requestAccess = async (req, res) => {
  const { patient_id, reason } = req.body;
  const doctor_id = req.user.id;

  if (!patient_id) {
    return res.status(400).json({ message: 'Patient ID is required.' });
  }

  try {
    // Get patient's hospital
    const [patient] = await db.execute(
      'SELECT hospital_id, name FROM patients WHERE id = ?',
      [patient_id]
    );
    if (!patient.length) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Check if request already pending
    const [existing] = await db.execute(
      `SELECT id FROM access_requests 
       WHERE doctor_id = ? AND patient_id = ? AND status = 'Pending'`,
      [doctor_id, patient_id]
    );
    if (existing.length) {
      return res.status(400).json({ message: 'You already have a pending request for this patient.' });
    }

    await db.execute(
      `INSERT INTO access_requests (doctor_id, patient_id, hospital_id, reason)
       VALUES (?,?,?,?)`,
      [doctor_id, patient_id, patient[0].hospital_id, reason || '']
    );

    await logAudit(
      req.user, 'access_requested', 'patient',
      patient_id, `Doctor requested access to patient ${patient[0].name}`
    );

    res.status(201).json({ message: 'Access request submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HOSPITAL SEES ALL REQUESTS ──────────────────────────────
exports.getRequestsForHospital = async (req, res) => {
  const hospital_id = req.user.id;
  const { status } = req.query;

  try {
    let query = `
      SELECT ar.*, 
             d.name AS doctor_name, d.specialization,
             p.name AS patient_name
      FROM access_requests ar
      JOIN doctors d ON ar.doctor_id = d.id
      JOIN patients p ON ar.patient_id = p.id
      WHERE ar.hospital_id = ?
    `;
    const params = [hospital_id];

    if (status) {
      query += ' AND ar.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ar.requested_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DOCTOR SEES THEIR OWN REQUESTS ─────────────────────────
exports.getRequestsForDoctor = async (req, res) => {
  const doctor_id = req.user.id;

  try {
    const [rows] = await db.execute(
      `SELECT ar.*,
              p.name AS patient_name,
              h.name AS hospital_name
       FROM access_requests ar
       JOIN patients p ON ar.patient_id = p.id
       JOIN hospitals h ON ar.hospital_id = h.id
       WHERE ar.doctor_id = ?
       ORDER BY ar.requested_at DESC`,
      [doctor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HOSPITAL APPROVES OR REJECTS ───────────────────────────
exports.resolveRequest = async (req, res) => {
  const { status } = req.body;
  const hospital_id = req.user.id;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
  }

  try {
    const [request] = await db.execute(
      'SELECT * FROM access_requests WHERE id = ? AND hospital_id = ?',
      [req.params.id, hospital_id]
    );
    if (!request.length) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await db.execute(
      `UPDATE access_requests 
       SET status = ?, resolved_at = NOW() 
       WHERE id = ? AND hospital_id = ?`,
      [status, req.params.id, hospital_id]
    );

    const action = status === 'Approved' ? 'access_approved' : 'access_rejected';
    await logAudit(req.user, action, 'access_request', req.params.id, `Request ${status}`);

    res.json({ message: `Request ${status} successfully.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};