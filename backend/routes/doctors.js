const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const db = require('../config/db');

router.get('/', verifyToken, requireRole('hospital'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, email, phone, specialization, created_at
       FROM doctors WHERE hospital_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;