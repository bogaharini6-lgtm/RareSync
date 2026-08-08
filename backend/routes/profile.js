const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ctrl.getProfile);
router.put('/update', ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);

module.exports = router;