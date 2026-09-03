const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const templates = require('../utils/emailTemplates');
const generateOTP = require('../utils/generateOTP');

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

// ─── HOSPITAL REGISTER ────────────────────────────────────────
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
    sendEmail({
      to: email,
      subject: 'Welcome to RareSync',
      html: templates.welcomeHospital({ hospitalName: name, email }),
    });
    res.status(201).json({ message: 'Hospital registered successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already registered.' });
    res.status(500).json({ message: err.message });
  }
};

// ─── HOSPITAL LOGIN — Step 1: Send OTP ───────────────────────
exports.hospitalLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const [rows] = await db.execute('SELECT * FROM hospitals WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid email or password.' });

    const hospital = rows[0];
    const match = await bcrypt.compare(password, hospital.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password.' });

    // Generate OTP
    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this email
    await db.execute('DELETE FROM otp_codes WHERE email = ? AND role = "hospital"', [email]);

    // Save new OTP
    await db.execute(
      'INSERT INTO otp_codes (email, otp, role, expires_at) VALUES (?, ?, "hospital", ?)',
      [email, otp, expires_at]
    );

    // Send OTP email
    sendEmail({
      to: email,
      subject: `${otp} is your RareSync login OTP`,
      html: templates.otpEmail({ name: hospital.name, otp, role: 'hospital' }),
    });

    res.json({
      message: 'OTP sent to your email. Please verify to login.',
      requires_otp: true,
      email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HOSPITAL LOGIN — Step 2: Verify OTP ─────────────────────
exports.hospitalVerifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const [otpRows] = await db.execute(
      `SELECT * FROM otp_codes 
       WHERE email = ? AND role = 'hospital' AND used = FALSE 
       AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (!otpRows.length) {
      return res.status(400).json({ message: 'OTP expired or invalid. Please login again.' });
    }

    if (otpRows[0].otp !== otp.trim()) {
  const currentAttempts = otpRows[0].attempts || 0;

  if (currentAttempts >= 4) {
    await db.execute('UPDATE otp_codes SET used = TRUE WHERE id = ?', [otpRows[0].id]);
    return res.status(400).json({ message: 'Too many incorrect attempts. Please login again to get a new OTP.' });
  }

  await db.execute(
    'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?',
    [otpRows[0].id]
  );

  const attemptsLeft = 4 - currentAttempts;
  return res.status(400).json({
    message: `Incorrect OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
  });
}

    // Mark OTP as used
    await db.execute('UPDATE otp_codes SET used = TRUE WHERE id = ?', [otpRows[0].id]);

    // Get hospital data
    const [rows] = await db.execute('SELECT * FROM hospitals WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Account not found.' });

    const hospital = rows[0];
    const token = generateToken({ id: hospital.id, role: 'hospital' });

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

// ─── DOCTOR REGISTER ──────────────────────────────────────────
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

    const [hospitals] = await db.execute('SELECT name, email FROM hospitals WHERE id = ?', [hospital_id]);
    const hospital = hospitals[0];

    sendEmail({
      to: email,
      subject: 'Welcome to RareSync',
      html: templates.welcomeDoctor({ doctorName: name, hospitalName: hospital?.name, email }),
    });

    if (hospital) {
      sendEmail({
        to: hospital.email,
        subject: `New doctor registered — Dr. ${name}`,
        html: templates.doctorRegistered({
          hospitalName: hospital.name,
          doctorName: name,
          doctorEmail: email,
          specialization,
          registeredAt: new Date(),
        }),
      });
    }

    res.status(201).json({ message: 'Doctor registered successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already registered.' });
    res.status(500).json({ message: err.message });
  }
};

// ─── DOCTOR LOGIN — Step 1: Send OTP ─────────────────────────
exports.doctorLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const [rows] = await db.execute('SELECT * FROM doctors WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid email or password.' });

    const doctor = rows[0];
    const match = await bcrypt.compare(password, doctor.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password.' });

    // Generate OTP
    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    // Delete old OTPs
    await db.execute('DELETE FROM otp_codes WHERE email = ? AND role = "doctor"', [email]);

    // Save OTP
    await db.execute(
      'INSERT INTO otp_codes (email, otp, role, expires_at) VALUES (?, ?, "doctor", ?)',
      [email, otp, expires_at]
    );

    // Send OTP email
    sendEmail({
      to: email,
      subject: `${otp} is your RareSync login OTP`,
      html: templates.otpEmail({ name: doctor.name, otp, role: 'doctor' }),
    });

    res.json({
      message: 'OTP sent to your email. Please verify to login.',
      requires_otp: true,
      email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DOCTOR LOGIN — Step 2: Verify OTP ───────────────────────
exports.doctorVerifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const [otpRows] = await db.execute(
      `SELECT * FROM otp_codes 
       WHERE email = ? AND role = 'doctor' AND used = FALSE 
       AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (!otpRows.length) {
      return res.status(400).json({ message: 'OTP expired or invalid. Please login again.' });
    }

    if (otpRows[0].otp !== otp.trim()) {
  const currentAttempts = otpRows[0].attempts || 0;

  if (currentAttempts >= 4) {
    await db.execute('UPDATE otp_codes SET used = TRUE WHERE id = ?', [otpRows[0].id]);
    return res.status(400).json({ message: 'Too many incorrect attempts. Please login again to get a new OTP.' });
  }

  await db.execute(
    'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?',
    [otpRows[0].id]
  );

  const attemptsLeft = 4 - currentAttempts;
  return res.status(400).json({
    message: `Incorrect OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
  });
}

    // Mark OTP used
    await db.execute('UPDATE otp_codes SET used = TRUE WHERE id = ?', [otpRows[0].id]);

    // Get doctor
    const [rows] = await db.execute('SELECT * FROM doctors WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Account not found.' });

    const doctor = rows[0];
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

// ─── RESEND OTP ───────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ message: 'Email and role are required.' });

  try {
    const table = role === 'doctor' ? 'doctors' : 'hospitals';
    const nameField = role === 'doctor' ? 'name' : 'name';
    const [rows] = await db.execute(`SELECT ${nameField} FROM ${table} WHERE email = ?`, [email]);
    if (!rows.length) return res.status(400).json({ message: 'Account not found.' });

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(`DELETE FROM otp_codes WHERE email = ? AND role = ?`, [email, role]);
    await db.execute(
      'INSERT INTO otp_codes (email, otp, role, expires_at) VALUES (?, ?, ?, ?)',
      [email, otp, role, expires_at]
    );

    sendEmail({
      to: email,
      subject: `${otp} is your RareSync login OTP`,
      html: templates.otpEmail({ name: rows[0].name, otp, role }),
    });

    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL HOSPITALS ────────────────────────────────────────
exports.getHospitals = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name FROM hospitals ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};