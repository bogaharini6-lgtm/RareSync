const db = require('../config/db');

// ─── LOG AN AUDIT ACTION ─────────────────────────────────────
const logAudit = async (user, action, targetType, targetId, details = '') => {
  try {
    await db.execute(
      `INSERT INTO audit_logs 
       (actor_type, actor_id, action, target_type, target_id, details) 
       VALUES (?,?,?,?,?,?)`,
      [user.role, user.id, action, targetType, targetId, details]
    );
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
};

// ─── GET AUDIT LOGS ──────────────────────────────────────────
const getLogs = async (req, res) => {
  const hospital_id = req.user.role === 'hospital' ? req.user.id : req.user.hospital_id;

  try {
    const [rows] = await db.execute(
      `SELECT al.*,
        CASE 
          WHEN al.actor_type = 'doctor' THEN d.name
          WHEN al.actor_type = 'hospital' THEN h.name
        END AS actor_name
       FROM audit_logs al
       LEFT JOIN doctors d ON al.actor_type = 'doctor' AND al.actor_id = d.id
       LEFT JOIN hospitals h ON al.actor_type = 'hospital' AND al.actor_id = h.id
       WHERE (d.hospital_id = ? OR h.id = ?)
       ORDER BY al.created_at DESC
       LIMIT 100`,
      [hospital_id, hospital_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

module.exports = { logAudit, getLogs };