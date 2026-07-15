const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patientController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkPatientAccess } = require('../middleware/accessControl');

router.use(verifyToken);

router.post('/', ctrl.addPatient);
router.get('/', ctrl.getPatients);
router.get('/:id', checkPatientAccess, ctrl.getPatientById);
router.put('/:id', checkPatientAccess, ctrl.updatePatient);
router.delete('/:id', requireRole('hospital'), ctrl.deletePatient);

module.exports = router;