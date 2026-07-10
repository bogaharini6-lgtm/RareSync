const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patientController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkPatientAccess } = require('../middleware/accessControl');

router.use(verifyToken);

// List and add — no access check needed (list handles it internally)
router.post('/', ctrl.addPatient);
router.get('/', ctrl.getPatients);

// Single patient — access check runs first
router.get('/:id', checkPatientAccess, ctrl.getPatientById);
router.put('/:id', checkPatientAccess, ctrl.updatePatient);

// Delete — hospital only
router.delete('/:id', requireRole('hospital'), ctrl.deletePatient);

module.exports = router;