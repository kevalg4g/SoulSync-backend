const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /notifications - Get all notifications
router.get('/', getNotifications);

// POST /notifications/read - Mark notifications as read
router.post('/read', markAsRead);

module.exports = router;

