const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  const hospital_id = req.user.role === 'hospital' ? req.user.id : req.user.hospital_id;

  try {
    // Total patients
    const [[{ patients }]] = await db.execute(
      'SELECT COUNT(*) AS patients FROM patients WHERE hospital_id = ?',
      [hospital_id]
    );

    // Total doctors
    const [[{ doctors }]] = await db.execute(
      'SELECT COUNT(*) AS doctors FROM doctors WHERE hospital_id = ?',
      [hospital_id]
    );

    // Total rare diseases in system
    const [[{ diseases }]] = await db.execute(
      'SELECT COUNT(*) AS diseases FROM rare_diseases'
    );

    // Total medical records
    const [[{ records }]] = await db.execute(
      `SELECT COUNT(*) AS records FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.id
       WHERE p.hospital_id = ?`,
      [hospital_id]
    );

    // Pending access requests
    const [[{ pending_requests }]] = await db.execute(
      `SELECT COUNT(*) AS pending_requests FROM access_requests
       WHERE hospital_id = ? AND status = 'Pending'`,
      [hospital_id]
    );

    // Approved access requests
    const [[{ approved_requests }]] = await db.execute(
      `SELECT COUNT(*) AS approved_requests FROM access_requests
       WHERE hospital_id = ? AND status = 'Approved'`,
      [hospital_id]
    );

    // Patients added this month
    const [[{ new_patients }]] = await db.execute(
      `SELECT COUNT(*) AS new_patients FROM patients
       WHERE hospital_id = ?
       AND MONTH(created_at) = MONTH(NOW())
       AND YEAR(created_at) = YEAR(NOW())`,
      [hospital_id]
    );

    // Records by type
    const [records_by_type] = await db.execute(
      `SELECT mr.record_type, COUNT(*) AS count
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.id
       WHERE p.hospital_id = ?
       GROUP BY mr.record_type`,
      [hospital_id]
    );

    // Recent audit logs
    const [recent_activity] = await db.execute(
      `SELECT al.action, al.created_at, al.details,
         CASE
           WHEN al.actor_type = 'doctor' THEN d.name
           WHEN al.actor_type = 'hospital' THEN h.name
         END AS actor_name,
         al.actor_type
       FROM audit_logs al
       LEFT JOIN doctors d ON al.actor_type = 'doctor' AND al.actor_id = d.id
       LEFT JOIN hospitals h ON al.actor_type = 'hospital' AND al.actor_id = h.id
       WHERE (d.hospital_id = ? OR h.id = ?)
       ORDER BY al.created_at DESC
       LIMIT 8`,
      [hospital_id, hospital_id]
    );

    // Recent patients
    const [recent_patients] = await db.execute(
      `SELECT id, name, gender, blood_group, created_at
       FROM patients WHERE hospital_id = ?
       ORDER BY created_at DESC LIMIT 5`,
      [hospital_id]
    );

    res.json({
      stats: {
        patients,
        doctors,
        diseases,
        records,
        pending_requests,
        approved_requests,
        new_patients,
      },
      records_by_type,
      recent_activity,
      recent_patients,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};