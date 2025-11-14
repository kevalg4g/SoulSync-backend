const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  getUserPhotos,
  uploadPhoto
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /users - Get all users
router.get('/', getAllUsers);

// GET /users/:id - Get single user profile
router.get('/:id', getUserById);

// PUT /users/:id - Update profile (bio, interests, photos)
router.put('/:id', updateProfile);

// GET /users/:id/photos - Get all user photos
router.get('/:id/photos', getUserPhotos);

// POST /users/:id/photos - Upload a photo
router.post('/:id/photos', uploadPhoto);

module.exports = router;

