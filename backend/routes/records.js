const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recordController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Doctors only — add, update, delete records
router.post('/', requireRole('doctor'), ctrl.addRecord);
router.put('/:id', requireRole('doctor'), ctrl.updateRecord);
router.delete('/:id', requireRole('doctor'), ctrl.deleteRecord);

// Both doctors and hospitals can view records
router.get('/patient/:patient_id', ctrl.getRecordsByPatient);
router.get('/:id', ctrl.getRecordById);

module.exports = router;