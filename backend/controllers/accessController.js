const db = require('../config/db');
const { logAudit } = require('./auditController');
const sendEmail = require('../utils/sendEmail');
const templates = require('../utils/emailTemplates');

// ─── DOCTOR REQUESTS ACCESS ───────────────────────────────────
exports.requestAccess = async (req, res) => {
  const { patient_id, reason, purpose, duration_days, requested_info } = req.body;
  const doctor_id = req.user.id;

  if (!patient_id) return res.status(400).json({ message: 'Patient ID is required.' });
  if (!purpose) return res.status(400).json({ message: 'Please select a purpose for access.' });

  try {
    const [patient] = await db.execute(
      `SELECT p.*, h.name AS hospital_name, h.email AS hospital_email 
       FROM patients p JOIN hospitals h ON p.hospital_id = h.id WHERE p.id = ?`,
      [patient_id]
    );
    if (!patient.length) return res.status(404).json({ message: 'Patient not found.' });

    const [existing] = await db.execute(
      `SELECT id FROM access_requests 
       WHERE doctor_id = ? AND patient_id = ? AND status = 'Pending'`,
      [doctor_id, patient_id]
    );
    if (existing.length) {
      return res.status(400).json({ message: 'You already have a pending request for this patient.' });
    }

    await db.execute(
      `INSERT INTO access_requests 
       (doctor_id, patient_id, hospital_id, reason, purpose, duration_days, requested_info) 
       VALUES (?,?,?,?,?,?,?)`,
      [doctor_id, patient_id, patient[0].hospital_id, reason || '', purpose, duration_days || 30, requested_info || '']
    );

    await logAudit(req.user, 'access_requested', 'patient', patient_id,
      `Doctor requested access for: ${purpose}`);

    const [doctors] = await db.execute(
      'SELECT name, specialization FROM doctors WHERE id = ?', [doctor_id]
    );

    sendEmail({
      to: patient[0].hospital_email,
      subject: `New access request from Dr. ${doctors[0]?.name}`,
      html: templates.newAccessRequest({
        hospitalName: patient[0].hospital_name,
        doctorName: doctors[0]?.name,
        doctorSpecialization: doctors[0]?.specialization,
        patientName: patient[0].name,
        purpose,
        duration_days: duration_days || 30,
        requested_info: requested_info || '',
        reason,
        requestedAt: new Date(),
      }),
    });

    res.status(201).json({ message: 'Access request submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HOSPITAL SEES ALL REQUESTS ───────────────────────────────
exports.getRequestsForHospital = async (req, res) => {
  const hospital_id = req.user.id;
  const { status } = req.query;

  try {
    let query = `
      SELECT ar.*, 
             d.name AS doctor_name, d.specialization, d.email AS doctor_email,
             p.name AS patient_name
      FROM access_requests ar
      JOIN doctors d ON ar.doctor_id = d.id
      JOIN patients p ON ar.patient_id = p.id
      WHERE ar.hospital_id = ?
    `;
    const params = [hospital_id];
    if (status) { query += ' AND ar.status = ?'; params.push(status); }
    query += ' ORDER BY ar.requested_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DOCTOR SEES THEIR REQUESTS ───────────────────────────────
exports.getRequestsForDoctor = async (req, res) => {
  const doctor_id = req.user.id;
  try {
    const [rows] = await db.execute(
      `SELECT ar.*, p.name AS patient_name, h.name AS hospital_name
       FROM access_requests ar
       JOIN patients p ON ar.patient_id = p.id
       JOIN hospitals h ON ar.hospital_id = h.id
       WHERE ar.doctor_id = ? ORDER BY ar.requested_at DESC`,
      [doctor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HOSPITAL APPROVES OR REJECTS ────────────────────────────
exports.resolveRequest = async (req, res) => {
  const { status } = req.body;
  const hospital_id = req.user.id;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
  }

  try {
    const [requests] = await db.execute(
      `SELECT ar.*,
              d.name AS doctor_name, d.email AS doctor_email,
              p.name AS patient_name,
              h.name AS hospital_name
       FROM access_requests ar
       JOIN doctors d ON ar.doctor_id = d.id
       JOIN patients p ON ar.patient_id = p.id
       JOIN hospitals h ON ar.hospital_id = h.id
       WHERE ar.id = ? AND ar.hospital_id = ?`,
      [req.params.id, hospital_id]
    );

    if (!requests.length) return res.status(404).json({ message: 'Request not found.' });

    const request = requests[0];

    // Calculate expiry date based on duration
    const expires_at = status === 'Approved'
      ? new Date(Date.now() + (request.duration_days || 30) * 24 * 60 * 60 * 1000)
      : null;

    await db.execute(
      `UPDATE access_requests 
       SET status = ?, resolved_at = NOW(), expires_at = ?
       WHERE id = ? AND hospital_id = ?`,
      [status, expires_at, req.params.id, hospital_id]
    );

    const action = status === 'Approved' ? 'access_approved' : 'access_rejected';
    await logAudit(req.user, action, 'access_request', req.params.id, `Request ${status}`);

    if (status === 'Approved') {
      sendEmail({
        to: request.doctor_email,
        subject: `Access approved — ${request.patient_name}`,
        html: templates.accessApproved({
          doctorName: request.doctor_name,
          patientName: request.patient_name,
          hospitalName: request.hospital_name,
          purpose: request.purpose,
          duration_days: request.duration_days,
          expires_at,
          approvedAt: new Date(),
        }),
      });
    } else {
      sendEmail({
        to: request.doctor_email,
        subject: `Access request rejected — ${request.patient_name}`,
        html: templates.accessRejected({
          doctorName: request.doctor_name,
          patientName: request.patient_name,
          hospitalName: request.hospital_name,
          rejectedAt: new Date(),
        }),
      });
    }

    res.json({ message: `Request ${status} successfully.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};