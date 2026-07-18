const db = require('../config/db');

const checkPatientAccess = async (req, res, next) => {
  const user = req.user;
  const patient_id = req.params.id || req.params.patient_id || req.body.patient_id;

  try {
    const [patients] = await db.execute(
      'SELECT * FROM patients WHERE id = ?',
      [patient_id]
    );

    if (!patients.length) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const patient = patients[0];

    // ── HOSPITAL: must own the patient ───────────────────────
    if (user.role === 'hospital') {
      if (patient.hospital_id !== user.id) {
        return res.status(403).json({ message: 'This patient does not belong to your hospital.' });
      }
      req.patient = patient;
      req.accessLevel = 'full';
      return next();
    }

    // ── DOCTOR ───────────────────────────────────────────────
    if (user.role === 'doctor') {

      // Rule 1: Assigned doctor always has full access
      if (patient.created_by_doctor === user.id) {
        req.patient = patient;
        req.accessLevel = 'full';
        return next();
      }

      // Rule 2: Approved access request
      const [approved] = await db.execute(
        `SELECT id FROM access_requests 
         WHERE doctor_id = ? AND patient_id = ? AND status = 'Approved'`,
        [user.id, patient_id]
      );
      if (approved.length > 0) {
        req.patient = patient;
        req.accessLevel = 'full';
        return next();
      }

      // Rule 3: Pending or no access → limited
      req.patient = patient;
      req.accessLevel = 'limited';
      return next();
    }

    return res.status(403).json({ message: 'Access denied.' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { checkPatientAccess };