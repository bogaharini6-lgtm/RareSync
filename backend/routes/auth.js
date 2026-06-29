const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

// Hospital routes
router.post('/hospital/register', ctrl.hospitalRegister);
router.post('/hospital/login', ctrl.hospitalLogin);

// Doctor routes
router.post('/doctor/register', ctrl.doctorRegister);
router.post('/doctor/login', ctrl.doctorLogin);

// Public - get hospitals list for doctor register dropdown
router.get('/hospitals', ctrl.getHospitals);

module.exports = router;