const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
//router.use(authenticateToken);

// GET /chat/:matchId - Get chat history for a match
router.get('/:matchId', getChatHistory);

// POST /chat/:matchId/send - Send a message (store in DB)
router.post('/:matchId/send', sendMessage);

module.exports = router;

