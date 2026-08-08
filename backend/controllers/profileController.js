const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ─── GET PROFILE ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role === 'doctor') {
      const [rows] = await db.execute(
        `SELECT d.id, d.name, d.email, d.phone, d.specialization,
                d.created_at, h.name AS hospital_name
         FROM doctors d
         LEFT JOIN hospitals h ON d.hospital_id = h.id
         WHERE d.id = ?`,
        [id]
      );
      if (!rows.length) return res.status(404).json({ message: 'Doctor not found.' });
      res.json(rows[0]);
    } else {
      const [rows] = await db.execute(
        `SELECT id, name, email, phone, address, created_at
         FROM hospitals WHERE id = ?`,
        [id]
      );
      if (!rows.length) return res.status(404).json({ message: 'Hospital not found.' });
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role === 'doctor') {
      const { name, phone, specialization, bio, experience_years, education, languages } = req.body;
      await db.execute(
        `UPDATE doctors SET name=?, phone=?, specialization=?, bio=?, 
         experience_years=?, education=?, languages=? WHERE id=?`,
        [name, phone, specialization, bio || '', experience_years || 0, education || '', languages || '', id]
      );
    } else {
      const { name, phone, address, description, established_year, website, bed_count, specialties } = req.body;
      await db.execute(
        `UPDATE hospitals SET name=?, phone=?, address=?, description=?,
         established_year=?, website=?, bed_count=?, specialties=? WHERE id=?`,
        [name, phone, address, description || '', established_year || null, website || '', bed_count || 0, specialties || '', id]
      );
    }
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { id, role } = req.user;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Both current and new password are required.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  try {
    const table = role === 'doctor' ? 'doctors' : 'hospitals';
    const [rows] = await db.execute(`SELECT password FROM ${table} WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(current_password, rows[0].password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.execute(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashed, id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};