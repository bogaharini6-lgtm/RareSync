const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/collaborationController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/my-rooms', ctrl.getMyRooms);
router.get('/specialist-requests', ctrl.getMySpecialistRequests);
router.get('/patient/:patient_id', ctrl.getOrCreateRoom);
router.get('/specialists/:patient_id', ctrl.findSpecialists);
router.post('/:room_id/message', ctrl.sendMessage);
router.post('/:room_id/request-specialist', ctrl.requestSpecialistOpinion);
router.put('/specialist-request/:request_id/respond', ctrl.respondToSpecialistRequest);

module.exports = router;