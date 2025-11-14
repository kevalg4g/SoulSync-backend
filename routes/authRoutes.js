const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /auth/register - Create new user account
router.post('/register', register);   // TEST THE REGISTER ENDPOINT (localhost:3000/api/auth/register)

// POST /auth/login - Login + return token
router.post('/login', login);

// GET /auth/me - Get logged-in user profile
router.get('/me', authenticateToken, getMe);

module.exports = router;

