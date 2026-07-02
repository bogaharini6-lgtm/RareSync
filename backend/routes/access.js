const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/accessController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Doctor routes
router.post('/request', requireRole('doctor'), ctrl.requestAccess);
router.get('/my-requests', requireRole('doctor'), ctrl.getRequestsForDoctor);

// Hospital routes
router.get('/hospital', requireRole('hospital'), ctrl.getRequestsForHospital);
router.put('/:id/resolve', requireRole('hospital'), ctrl.resolveRequest);

module.exports = router;