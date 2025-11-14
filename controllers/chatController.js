const { Message, Match, User } = require('../models');
const { Op } = require('sequelize');

// Get chat history for a match
const getChatHistory = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    // Verify user is part of this match
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return res.status(403).json({ error: 'You are not part of this match' });
    }

    // Get messages
    const messages = await Message.findAll({
      where: { matchId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Error fetching chat history', details: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Verify user is part of this match
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return res.status(403).json({ error: 'You are not part of this match' });
    }

    // Create message
    const message = await Message.create({
      matchId,
      senderId: userId,
      text
    });

    // Get message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageWithSender
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Error sending message', details: error.message });
  }
};

module.exports = {
  getChatHistory,
  sendMessage
};

