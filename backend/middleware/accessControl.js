const db = require('../config/db');

const checkPatientAccess = async (req, res, next) => {
  const user = req.user;
  const patient_id = req.params.id || req.params.patient_id || req.body.patient_id;

  try {
    const [patients] = await db.execute('SELECT * FROM patients WHERE id = ?', [patient_id]);
    if (!patients.length) return res.status(404).json({ message: 'Patient not found.' });

    const patient = patients[0];

    if (user.role === 'hospital') {
      if (Number(patient.hospital_id) !== Number(user.id)) {
        return res.status(403).json({ message: 'This patient does not belong to your hospital.' });
      }
      req.patient = patient;
      req.accessLevel = 'full';
      return next();
    }

    if (user.role === 'doctor') {
      const doctor_id = Number(user.id);

      // Rule 1: Primary doctor — created the patient
      if (patient.created_by_doctor && Number(patient.created_by_doctor) === doctor_id) {
        req.patient = patient;
        req.accessLevel = 'full';
        return next();
      }

      // Rule 2: Doctor posted medical records for this patient
      const [ownRec] = await db.execute(
        'SELECT id FROM medical_records WHERE patient_id = ? AND doctor_id = ? LIMIT 1',
        [patient_id, doctor_id]
      );
      if (ownRec.length > 0) {
        req.patient = patient;
        req.accessLevel = 'full';
        return next();
      }

      // Rule 3: Approved access request
      const [approved] = await db.execute(
        "SELECT id FROM access_requests WHERE doctor_id = ? AND patient_id = ? AND status = 'Approved'",
        [doctor_id, patient_id]
      );
      if (approved.length > 0) {
        req.patient = patient;
        req.accessLevel = 'full';
        return next();
      }

      // Rule 4: Limited access
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
