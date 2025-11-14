const express = require('express');
const router = express.Router();
const { getMatches, createMatch } = require('../controllers/swipeController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /matches - Get all matches for user
router.get('/', getMatches);

// POST /matches/create - Create a match (user1 + user2)
router.post('/create', createMatch);

module.exports = router;

