const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ─── GET PROFILE ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const { id, role } = req.user;

  try {
    if (role === 'doctor') {
      const [rows] = await db.execute(
        `SELECT 
          d.id,
          d.name,
          d.email,
          d.phone,
          d.specialization,
          d.bio,
          d.experience_years,
          d.education,
          d.languages,
          d.created_at,
          h.name AS hospital_name
         FROM doctors d
         LEFT JOIN hospitals h ON d.hospital_id = h.id
         WHERE d.id = ?`,
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({
          message: 'Doctor not found.'
        });
      }

      return res.json(rows[0]);
    }

    // Hospital profile
    const [rows] = await db.execute(
      `SELECT 
        id,
        name,
        email,
        phone,
        address,
        description,
        established_year,
        website,
        bed_count,
        specialties,
        created_at
       FROM hospitals
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'Hospital not found.'
      });
    }

    return res.json(rows[0]);

  } catch (err) {
    console.error('Get Profile Error:', err);

    return res.status(500).json({
      message: err.message
    });
  }
};


// ─── UPDATE PROFILE ───────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { id, role } = req.user;

  try {
    if (role === 'doctor') {
      const {
        name,
        phone,
        specialization,
        bio,
        experience_years,
        education,
        languages
      } = req.body;

      await db.execute(
        `UPDATE doctors
         SET
          name = ?,
          phone = ?,
          specialization = ?,
          bio = ?,
          experience_years = ?,
          education = ?,
          languages = ?
         WHERE id = ?`,
        [
          name,
          phone,
          specialization,
          bio || '',
          experience_years || 0,
          education || '',
          languages || '',
          id
        ]
      );

    } else {
      const {
        name,
        phone,
        address,
        description,
        established_year,
        website,
        bed_count,
        specialties
      } = req.body;

      await db.execute(
        `UPDATE hospitals
         SET
          name = ?,
          phone = ?,
          address = ?,
          description = ?,
          established_year = ?,
          website = ?,
          bed_count = ?,
          specialties = ?
         WHERE id = ?`,
        [
          name,
          phone,
          address,
          description || '',
          established_year || null,
          website || '',
          bed_count || 0,
          specialties || '',
          id
        ]
      );
    }

    return res.json({
      message: 'Profile updated successfully.'
    });

  } catch (err) {
    console.error('Update Profile Error:', err);

    return res.status(500).json({
      message: err.message
    });
  }
};


// ─── CHANGE PASSWORD ──────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { id, role } = req.user;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({
      message: 'Both current and new password are required.'
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      message: 'New password must be at least 6 characters.'
    });
  }

  try {
    const table = role === 'doctor' ? 'doctors' : 'hospitals';

    const [rows] = await db.execute(
      `SELECT password FROM ${table} WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const match = await bcrypt.compare(
      current_password,
      rows[0].password
    );

    if (!match) {
      return res.status(400).json({
        message: 'Current password is incorrect.'
      });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await db.execute(
      `UPDATE ${table} SET password = ? WHERE id = ?`,
      [hashed, id]
    );

    return res.json({
      message: 'Password changed successfully.'
    });

  } catch (err) {
    console.error('Change Password Error:', err);

    return res.status(500).json({
      message: err.message
    });
  }
};


// ─── UPDATE EMAIL ─────────────────────────────────────────────
exports.updateEmail = async (req, res) => {
  const { id, role } = req.user;
  const { new_email, password } = req.body;

  // Validate required fields
  if (!new_email || !password) {
    return res.status(400).json({
      message: 'New email and password are required.'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(new_email)) {
    return res.status(400).json({
      message: 'Please enter a valid email address.'
    });
  }

  try {
    const table = role === 'doctor' ? 'doctors' : 'hospitals';

    // ─── Verify current password ─────────────────────────────
    const [rows] = await db.execute(
      `SELECT password FROM ${table} WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const match = await bcrypt.compare(
      password,
      rows[0].password
    );

    if (!match) {
  return res.status(400).json({
    message: 'Current password is incorrect.'
  });
}
    // ─── Check email in doctors table ────────────────────────
    const [existingDoctors] = await db.execute(
      `SELECT id
       FROM doctors
       WHERE email = ?
       AND id != ?`,
      [
        new_email,
        role === 'doctor' ? id : 0
      ]
    );

    // ─── Check email in hospitals table ──────────────────────
    const [existingHospitals] = await db.execute(
      `SELECT id
       FROM hospitals
       WHERE email = ?
       AND id != ?`,
      [
        new_email,
        role === 'hospital' ? id : 0
      ]
    );

    // ─── Email already exists ────────────────────────────────
    if (
      existingDoctors.length > 0 ||
      existingHospitals.length > 0
    ) {
      return res.status(400).json({
        message: 'This email is already registered.'
      });
    }

    // ─── Update email ────────────────────────────────────────
    await db.execute(
      `UPDATE ${table}
       SET email = ?
       WHERE id = ?`,
      [new_email, id]
    );

    return res.json({
      message: 'Email updated successfully.',
      new_email: new_email
    });

  } catch (err) {
    console.error('Update Email Error:', err);

    return res.status(500).json({
      message: err.message
    });
  }
};