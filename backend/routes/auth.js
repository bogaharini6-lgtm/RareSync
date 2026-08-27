const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

router.post('/hospital/register', ctrl.hospitalRegister);
router.post('/hospital/login', ctrl.hospitalLogin);
router.post('/hospital/verify-otp', ctrl.hospitalVerifyOTP);

router.post('/doctor/register', ctrl.doctorRegister);
router.post('/doctor/login', ctrl.doctorLogin);
router.post('/doctor/verify-otp', ctrl.doctorVerifyOTP);

router.post('/resend-otp', ctrl.resendOTP);
router.get('/hospitals', ctrl.getHospitals);

module.exports = router;