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
        return res.status(403).json({
          message: 'This patient does not belong to your hospital.',
        });
      }
      req.patient = patient;
      req.accessLevel = 'full';
      return next();
    }

    // ── DOCTOR ───────────────────────────────────────────────
    if (user.role === 'doctor') {

      // Rule 1: Doctor who CREATED the patient
      if (patient.created_by_doctor === user.id) {
        req.patient = patient;
        req.accessLevel = 'full';
        return next();
      }

      // Rule 2: Doctor who has posted ANY medical record for this patient
      const [ownRecords] = await db.execute(
        `SELECT id FROM medical_records 
         WHERE patient_id = ? AND doctor_id = ? LIMIT 1`,
        [patient_id, user.id]
      );

      if (ownRecords.length > 0) {
        req.patient = patient;
        req.accessLevel = 'full';
        return next();
      }

      // Rule 3: Doctor has an approved access request
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

      // Rule 4: No access → limited view
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