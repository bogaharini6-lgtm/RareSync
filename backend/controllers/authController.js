const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
};

// ─── HOSPITAL REGISTER ───────────────────────────────────────
exports.hospitalRegister = async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO hospitals (name, email, password, address, phone) VALUES (?,?,?,?,?)',
      [name, email, hashed, address, phone]
    );
    res.status(201).json({ message: 'Hospital registered successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ─── HOSPITAL LOGIN ───────────────────────────────────────────
exports.hospitalLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM hospitals WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const hospital = rows[0];
    const match = await bcrypt.compare(password, hospital.password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: hospital.id,
      role: 'hospital',
    });

    res.json({
      token,
      role: 'hospital',
      id: hospital.id,
      name: hospital.name,
      email: hospital.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DOCTOR REGISTER ─────────────────────────────────────────
exports.doctorRegister = async (req, res) => {
  const { name, email, password, specialization, phone, hospital_id } = req.body;

  if (!name || !email || !password || !hospital_id) {
    return res.status(400).json({ message: 'Name, email, password and hospital are required.' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO doctors (name, email, password, specialization, phone, hospital_id) VALUES (?,?,?,?,?,?)',
      [name, email, hashed, specialization, phone, hospital_id]
    );
    res.status(201).json({ message: 'Doctor registered successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ─── DOCTOR LOGIN ─────────────────────────────────────────────
exports.doctorLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM doctors WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const doctor = rows[0];
    const match = await bcrypt.compare(password, doctor.password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: doctor.id,
      role: 'doctor',
      hospital_id: doctor.hospital_id,
    });

    res.json({
      token,
      role: 'doctor',
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      hospital_id: doctor.hospital_id,
      specialization: doctor.specialization,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL HOSPITALS (for doctor register dropdown) ─────────
exports.getHospitals = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name FROM hospitals ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};