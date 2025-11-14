const { Notification } = require('../models');

// Get all notifications for user
const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        {
          model: require('../models/User'),
          as: 'relatedUser',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: require('../models/Match'),
          as: 'relatedMatch',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Error fetching notifications', details: error.message });
  }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'notificationIds array is required' });
    }

    // Update notifications
    await Notification.update(
      { isRead: true },
      {
        where: {
          id: {
            [require('sequelize').Op.in]: notificationIds
          },
          userId // Ensure user can only mark their own notifications as read
        }
      }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Error updating notifications', details: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};

