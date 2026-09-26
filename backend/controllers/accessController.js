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
      'SELECT p.*, h.name AS hospital_name FROM patients p JOIN hospitals h ON p.hospital_id = h.id WHERE p.id = ?',
      [patient_id]
    );
    if (!patient.length) return res.status(404).json({ message: 'Patient not found.' });

    // Cannot request access to your own patient
    if (Number(patient[0].created_by_doctor) === Number(doctor_id)) {
      return res.status(400).json({ message: 'You are the primary doctor for this patient.' });
    }

    // Check for existing pending request
    const [existing] = await db.execute(
      "SELECT id FROM access_requests WHERE doctor_id = ? AND patient_id = ? AND status = 'Pending'",
      [doctor_id, patient_id]
    );
    if (existing.length) {
      return res.status(400).json({ message: 'You already have a pending request for this patient.' });
    }

    // Get primary doctor info
    const [primaryDoctor] = await db.execute(
      'SELECT id, name, email FROM doctors WHERE id = ?',
      [patient[0].created_by_doctor]
    );
    if (!primaryDoctor.length) {
      return res.status(400).json({ message: 'Primary doctor not found for this patient.' });
    }

    // Get requesting doctor info
    const [requestingDoctor] = await db.execute(
      'SELECT name, specialization FROM doctors WHERE id = ?',
      [doctor_id]
    );

    // Save request — hospital_id still stored for reference
    await db.execute(
      'INSERT INTO access_requests (doctor_id, patient_id, hospital_id, reason, purpose, duration_days, requested_info) VALUES (?,?,?,?,?,?,?)',
      [doctor_id, patient_id, patient[0].hospital_id, reason || '', purpose, duration_days || 30, requested_info || '']
    );

    await logAudit(req.user, 'access_requested', 'patient', patient_id, 'Doctor requested access for: ' + purpose);

    // Email goes to PRIMARY DOCTOR not hospital admin
    sendEmail({
      to: primaryDoctor[0].email,
      subject: 'Access request from Dr. ' + requestingDoctor[0]?.name + ' — ' + patient[0].name,
      html: templates.newAccessRequest({
        hospitalName: patient[0].hospital_name,
        doctorName: requestingDoctor[0]?.name,
        doctorSpecialization: requestingDoctor[0]?.specialization,
        patientName: patient[0].name,
        purpose,
        duration_days: duration_days || 30,
        requested_info: requested_info || '',
        reason,
        requestedAt: new Date(),
        recipientName: primaryDoctor[0].name,
      }),
    });

    res.status(201).json({ message: 'Access request sent to the primary doctor.' });
  } catch (err) {
    console.error('requestAccess error:', err);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// ─── PRIMARY DOCTOR SEES REQUESTS FOR THEIR PATIENTS ─────────
exports.getRequestsForPrimaryDoctor = async (req, res) => {
  const doctor_id = req.user.id;
  const { status } = req.query;

  try {
    let query = 
      SELECT ar.*,
             d.name AS doctor_name, d.specialization, d.email AS doctor_email,
             p.name AS patient_name
      FROM access_requests ar
      JOIN doctors d ON ar.doctor_id = d.id
      JOIN patients p ON ar.patient_id = p.id
      WHERE p.created_by_doctor = ?
    ;
    const params = [doctor_id];
    if (status) { query += ' AND ar.status = ?'; params.push(status); }
    query += ' ORDER BY ar.requested_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getRequestsForPrimaryDoctor error:', err);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// ─── DOCTOR SEES THEIR OWN REQUESTS ──────────────────────────
exports.getRequestsForDoctor = async (req, res) => {
  const doctor_id = req.user.id;
  try {
    const [rows] = await db.execute(
      SELECT ar.*, p.name AS patient_name, h.name AS hospital_name
       FROM access_requests ar
       JOIN patients p ON ar.patient_id = p.id
       JOIN hospitals h ON ar.hospital_id = h.id
       WHERE ar.doctor_id = ? ORDER BY ar.requested_at DESC,
      [doctor_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('getRequestsForDoctor error:', err);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// ─── HOSPITAL SEES REQUESTS (read-only reference) ────────────
exports.getRequestsForHospital = async (req, res) => {
  const hospital_id = req.user.id;
  const { status } = req.query;

  try {
    let query = 
      SELECT ar.*,
             d.name AS doctor_name, d.specialization,
             p.name AS patient_name
      FROM access_requests ar
      JOIN doctors d ON ar.doctor_id = d.id
      JOIN patients p ON ar.patient_id = p.id
      WHERE ar.hospital_id = ?
    ;
    const params = [hospital_id];
    if (status) { query += ' AND ar.status = ?'; params.push(status); }
    query += ' ORDER BY ar.requested_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getRequestsForHospital error:', err);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// ─── PRIMARY DOCTOR APPROVES OR REJECTS ──────────────────────
exports.resolveRequest = async (req, res) => {
  const { status } = req.body;
  const doctor_id = req.user.id;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
  }

  try {
    // Verify the logged-in doctor is the primary doctor for this patient
    const [requests] = await db.execute(
      SELECT ar.*,
              d.name AS doctor_name, d.email AS doctor_email,
              p.name AS patient_name, p.created_by_doctor,
              h.name AS hospital_name,
              pd.name AS primary_doctor_name
       FROM access_requests ar
       JOIN doctors d ON ar.doctor_id = d.id
       JOIN patients p ON ar.patient_id = p.id
       JOIN hospitals h ON ar.hospital_id = h.id
       LEFT JOIN doctors pd ON p.created_by_doctor = pd.id
       WHERE ar.id = ?,
      [req.params.id]
    );

    if (!requests.length) return res.status(404).json({ message: 'Request not found.' });

    const request = requests[0];

    // Only primary doctor can approve/reject
    if (Number(request.created_by_doctor) !== Number(doctor_id)) {
      return res.status(403).json({ message: 'Only the primary doctor can approve or reject this request.' });
    }

    // Calculate expiry
    const expires_at = status === 'Approved'
      ? new Date(Date.now() + (request.duration_days || 30) * 24 * 60 * 60 * 1000)
      : null;

    await db.execute(
      'UPDATE access_requests SET status = ?, resolved_at = NOW(), expires_at = ? WHERE id = ?',
      [status, expires_at, req.params.id]
    );

    const action = status === 'Approved' ? 'access_approved' : 'access_rejected';
    await logAudit(req.user, action, 'access_request', req.params.id, 'Request ' + status);

    // Email to requesting doctor
    if (status === 'Approved') {
      sendEmail({
        to: request.doctor_email,
        subject: 'Access approved — ' + request.patient_name,
        html: templates.accessApproved({
          doctorName: request.doctor_name,
          patientName: request.patient_name,
          hospitalName: request.hospital_name,
          purpose: request.purpose,
          duration_days: request.duration_days,
          expires_at,
          approvedAt: new Date(),
          approvedBy: request.primary_doctor_name,
        }),
      });
    } else {
      sendEmail({
        to: request.doctor_email,
        subject: 'Access request rejected — ' + request.patient_name,
        html: templates.accessRejected({
          doctorName: request.doctor_name,
          patientName: request.patient_name,
          hospitalName: request.hospital_name,
          rejectedAt: new Date(),
          rejectedBy: request.primary_doctor_name,
        }),
      });
    }

    res.json({ message: 'Request ' + status + ' successfully.' });
  } catch (err) {
    console.error('resolveRequest error:', err);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};
