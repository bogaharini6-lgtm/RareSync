const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/diseaseController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', ctrl.addDisease);
router.get('/', ctrl.getDiseases);
router.get('/:id', ctrl.getDiseaseById);
router.put('/:id', ctrl.updateDisease);

// Link / unlink patient to disease (doctors only)
router.post('/link/patient', requireRole('doctor'), ctrl.linkPatientToDisease);
router.delete('/link/:id', requireRole('doctor'), ctrl.unlinkPatientDisease);

// Get all diseases for a specific patient
router.get('/patient/:patient_id', ctrl.getPatientDiseases);

module.exports = router;