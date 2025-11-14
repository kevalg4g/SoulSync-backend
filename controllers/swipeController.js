const { Swipe, Match, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Get io instance (will be set from server.js)
let io = null;
const setIO = (socketIO) => {
  io = socketIO;
};

// Swipe right on a user
const swipeRight = async (req, res) => {
  try {
    const swiperId = req.userId;
    const { swipedId } = req.body;

    if (!swipedId) {
      return res.status(400).json({ error: 'swipedId is required' });
    }

    if (swiperId === parseInt(swipedId)) {
      return res.status(400).json({ error: 'You cannot swipe on yourself' });
    }

    // Check if already swiped
    const existingSwipe = await Swipe.findOne({
      where: { swiperId, swipedId }
    });

    if (existingSwipe) {
      return res.status(400).json({ error: 'You have already swiped on this user' });
    }

    // Create swipe record
    const swipe = await Swipe.create({
      swiperId,
      swipedId,
      direction: 'right'
    });

    // Check if there's a mutual swipe (match)
    const mutualSwipe = await Swipe.findOne({
      where: {
        swiperId: swipedId,
        swipedId: swiperId,
        direction: 'right'
      }
    });

    let match = null;
    let isMatch = false;

    if (mutualSwipe) {
      // Create match
      isMatch = true;
      const user1Id = Math.min(swiperId, swipedId);
      const user2Id = Math.max(swiperId, swipedId);

      match = await Match.findOrCreate({
        where: {
          [Op.or]: [
            { user1Id, user2Id },
            { user1Id: user2Id, user2Id: user1Id }
          ]
        },
        defaults: {
          user1Id,
          user2Id
        }
      });

      match = match[0];

      // Create notifications for both users
      const swiper = await User.findByPk(swiperId);
      const swiped = await User.findByPk(swipedId);

      await Notification.create({
        userId: swiperId,
        type: 'match',
        title: "It's a Match!",
        message: `You and ${swiped.name} liked each other!`,
        relatedUserId: swipedId,
        relatedMatchId: match.id
      });

      await Notification.create({
        userId: swipedId,
        type: 'match',
        title: "It's a Match!",
        message: `You and ${swiper.name} liked each other!`,
        relatedUserId: swiperId,
        relatedMatchId: match.id
      });

      // Emit socket event for new match (if io is available)
      if (io) {
        io.to(`user_${swiperId}`).emit('new_match', {
          user1: swiper.toJSON(),
          user2: swiped.toJSON()
        });
        io.to(`user_${swipedId}`).emit('new_match', {
          user1: swiper.toJSON(),
          user2: swiped.toJSON()
        });
      }
    }

    res.json({
      message: isMatch ? "It's a match!" : 'Swipe recorded',
      swipe,
      isMatch,
      match
    });
  } catch (error) {
    console.error('Swipe right error:', error);
    res.status(500).json({ error: 'Error processing swipe', details: error.message });
  }
};

// Swipe left on a user
const swipeLeft = async (req, res) => {
  try {
    const swiperId = req.userId;
    const { swipedId } = req.body;

    if (!swipedId) {
      return res.status(400).json({ error: 'swipedId is required' });
    }

    if (swiperId === parseInt(swipedId)) {
      return res.status(400).json({ error: 'You cannot swipe on yourself' });
    }

    // Check if already swiped
    const existingSwipe = await Swipe.findOne({
      where: { swiperId, swipedId }
    });

    if (existingSwipe) {
      return res.status(400).json({ error: 'You have already swiped on this user' });
    }

    // Create swipe record
    const swipe = await Swipe.create({
      swiperId,
      swipedId,
      direction: 'left'
    });

    res.json({
      message: 'Swipe recorded',
      swipe
    });
  } catch (error) {
    console.error('Swipe left error:', error);
    res.status(500).json({ error: 'Error processing swipe', details: error.message });
  }
};

// Get all matches for user
const getMatches = async (req, res) => {
  try {
    const userId = req.userId;

    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: { exclude: ['password'] },
          include: [
            {
              model: require('../models/Photo'),
              as: 'photos',
              required: false
            }
          ]
        },
        {
          model: User,
          as: 'user2',
          attributes: { exclude: ['password'] },
          include: [
            {
              model: require('../models/Photo'),
              as: 'photos',
              required: false
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format matches to show the other user
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      return {
        matchId: match.id,
        user: otherUser.toJSON(),
        matchedAt: match.createdAt
      };
    });

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Error fetching matches', details: error.message });
  }
};

// Create a match manually
const createMatch = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
      return res.status(400).json({ error: 'user1Id and user2Id are required' });
    }

    if (user1Id === user2Id) {
      return res.status(400).json({ error: 'Users cannot match with themselves' });
    }

    const id1 = Math.min(user1Id, user2Id);
    const id2 = Math.max(user1Id, user2Id);

    // Check if match already exists
    const existingMatch = await Match.findOne({
      where: {
        [Op.or]: [
          { user1Id: id1, user2Id: id2 },
          { user1Id: id2, user2Id: id1 }
        ]
      }
    });

    if (existingMatch) {
      return res.status(400).json({ error: 'Match already exists' });
    }

    const match = await Match.create({
      user1Id: id1,
      user2Id: id2
    });

    // Create notifications
    const user1 = await User.findByPk(id1);
    const user2 = await User.findByPk(id2);

    await Notification.create({
      userId: id1,
      type: 'match',
      title: "It's a Match!",
      message: `You and ${user2.name} matched!`,
      relatedUserId: id2,
      relatedMatchId: match.id
    });

      await Notification.create({
        userId: id2,
        type: 'match',
        title: "It's a Match!",
        message: `You and ${user1.name} matched!`,
        relatedUserId: id1,
        relatedMatchId: match.id
      });

      // Emit socket event for new match (if io is available)
      if (io) {
        io.to(`user_${id1}`).emit('new_match', {
          user1: user1.toJSON(),
          user2: user2.toJSON()
        });
        io.to(`user_${id2}`).emit('new_match', {
          user1: user1.toJSON(),
          user2: user2.toJSON()
        });
      }

    res.status(201).json({
      message: 'Match created successfully',
      match
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: 'Error creating match', details: error.message });
  }
};

module.exports = {
  swipeRight,
  swipeLeft,
  getMatches,
  createMatch,
  setIO
};

