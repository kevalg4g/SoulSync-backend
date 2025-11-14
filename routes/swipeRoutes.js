const express = require('express');
const router = express.Router();
const { swipeRight, swipeLeft } = require('../controllers/swipeController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// POST /swipe/right - Swipe right on a user
router.post('/right', swipeRight);

// POST /swipe/left - Swipe left on a user
router.post('/left', swipeLeft);

module.exports = router;

