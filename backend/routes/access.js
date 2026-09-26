const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/accessController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Requesting doctor
router.post('/request', requireRole('doctor'), ctrl.requestAccess);
router.get('/my-requests', requireRole('doctor'), ctrl.getRequestsForDoctor);

// Primary doctor — sees requests for their patients and approves/rejects
router.get('/incoming', requireRole('doctor'), ctrl.getRequestsForPrimaryDoctor);
router.put('/:id/resolve', requireRole('doctor'), ctrl.resolveRequest);

// Hospital — read only reference
router.get('/hospital', requireRole('hospital'), ctrl.getRequestsForHospital);

module.exports = router;
