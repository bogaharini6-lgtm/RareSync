const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patientController');
const { verifyToken } = require('../middleware/auth');

// All patient routes require login
router.use(verifyToken);

router.post('/', ctrl.addPatient);
router.get('/', ctrl.getPatients);
router.get('/:id', ctrl.getPatientById);
router.put('/:id', ctrl.updatePatient);
router.delete('/:id', ctrl.deletePatient);

module.exports = router;