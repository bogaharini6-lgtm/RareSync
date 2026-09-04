const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { body, validationResult } = require('express-validator');

// ─── VALIDATION RULES ─────────────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const validateOTP = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
  body('otp')
    .notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.')
    .isNumeric().withMessage('OTP must contain numbers only.'),
];

const validateRegisterDoctor = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&).'),
  body('hospital_id').notEmpty().withMessage('Please select a hospital.'),
];

const validateRegisterHospital = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Hospital name must be between 2 and 100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&).'),
];

const validateResendOTP = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
  body('role').isIn(['doctor', 'hospital']).withMessage('Invalid role.'),
];

// ─── ROUTES ───────────────────────────────────────────────────
router.post('/hospital/register', validateRegisterHospital, handleValidation, ctrl.hospitalRegister);
router.post('/hospital/login',    validateLogin,            handleValidation, ctrl.hospitalLogin);
router.post('/hospital/verify-otp', validateOTP,           handleValidation, ctrl.hospitalVerifyOTP);

router.post('/doctor/register',   validateRegisterDoctor,  handleValidation, ctrl.doctorRegister);
router.post('/doctor/login',      validateLogin,           handleValidation, ctrl.doctorLogin);
router.post('/doctor/verify-otp', validateOTP,             handleValidation, ctrl.doctorVerifyOTP);

router.post('/resend-otp',        validateResendOTP,       handleValidation, ctrl.resendOTP);
router.get('/hospitals',                                                      ctrl.getHospitals);

module.exports = router;