const { User, Photo, Swipe } = require('../models');

// Get all users (excluding current user and already swiped users)
const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Get all users that current user has swiped
    const swipedUsers = await Swipe.findAll({
      where: { swiperId: currentUserId },
      attributes: ['swipedId']
    });
    const swipedUserIds = swipedUsers.map(swipe => swipe.swipedId);
    swipedUserIds.push(currentUserId);

    // Get users excluding current user and already swiped users
    const users = await User.findAll({
      where: {
        id: {
          [require('sequelize').Op.notIn]: swipedUserIds
        }
      },
      include: [
        {
          model: Photo,
          as: 'photos',
          required: false
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Error fetching users', details: error.message });
  }
};

// Get single user profile
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Photo,
          as: 'photos',
          required: false
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Error fetching user', details: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userId;

    // Check if user is updating their own profile
    if (parseInt(id) !== currentUserId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { bio, interests, age, location, name } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (interests !== undefined) user.interests = interests;
    if (age !== undefined) user.age = age;
    if (location !== undefined) user.location = location;
    if (name !== undefined) user.name = name;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile', details: error.message });
  }
};

// Get all user photos
const getUserPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    const photos = await Photo.findAll({
      where: { userId: id },
      order: [['isPrimary', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json({ photos });
  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({ error: 'Error fetching photos', details: error.message });
  }
};

// Upload a photo
const uploadPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userId;

    // Check if user is uploading to their own profile
    if (parseInt(id) !== currentUserId) {
      return res.status(403).json({ error: 'You can only upload photos to your own profile' });
    }

    const { photoUrl, isPrimary } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    // If this is set as primary, unset other primary photos
    if (isPrimary) {
      await Photo.update(
        { isPrimary: false },
        { where: { userId: id } }
      );
    }

    const photo = await Photo.create({
      userId: id,
      photoUrl,
      isPrimary: isPrimary || false
    });

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Error uploading photo', details: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  getUserPhotos,
  uploadPhoto
};

