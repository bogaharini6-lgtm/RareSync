const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getDashboardStats);

module.exports = router;