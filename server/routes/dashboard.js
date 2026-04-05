const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { authMiddleware } = require('../services/auth');

router.get('/stats', authMiddleware, getStats);

module.exports = router;
