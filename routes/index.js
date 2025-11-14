const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const swipeRoutes = require('./swipeRoutes');
const matchRoutes = require('./matchRoutes');
const chatRoutes = require('./chatRoutes');
const notificationRoutes = require('./notificationRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/swipe', swipeRoutes);
router.use('/matches', matchRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

