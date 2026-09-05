const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();  
const rateLimit = require('express-rate-limit');

// General API limit — 200 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login limit — 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP limit — 5 attempts per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// Specific limiters MUST come before general limiter
app.use('/api/auth/doctor/login', loginLimiter);
app.use('/api/auth/hospital/login', loginLimiter);
app.use('/api/auth/doctor/verify-otp', otpLimiter);
app.use('/api/auth/hospital/verify-otp', otpLimiter);
app.use('/api/auth/resend-otp', otpLimiter);

// General limiter applies to everything else
app.use('/api/', apiLimiter);
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

app.use(helmet());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'RareSync API is running', version: '1.0.0', status: 'OK' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/diseases', require('./routes/diseases'));
app.use('/api/records', require('./routes/records'));
app.use('/api/access', require('./routes/access'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/collaboration', require('./routes/collaboration'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`RareSync server running on http://localhost:${PORT}`);
});