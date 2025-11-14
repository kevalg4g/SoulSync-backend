const User = require('./User');
const Photo = require('./Photo');
const Swipe = require('./Swipe');
const Match = require('./Match');
const Message = require('./Message');
const Notification = require('./Notification');

// Define relationships (without foreign key constraints to avoid sync issues)
// User - Photo (One to Many)
User.hasMany(Photo, { foreignKey: 'userId', as: 'photos', constraints: false });
Photo.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

// User - Swipe (One to Many) - As Swiper
User.hasMany(Swipe, { foreignKey: 'swiperId', as: 'swipesGiven', constraints: false });
Swipe.belongsTo(User, { foreignKey: 'swiperId', as: 'swiper', constraints: false });

// User - Swipe (One to Many) - As Swiped
User.hasMany(Swipe, { foreignKey: 'swipedId', as: 'swipesReceived', constraints: false });
Swipe.belongsTo(User, { foreignKey: 'swipedId', as: 'swiped', constraints: false });

// User - Match (One to Many) - As User1
User.hasMany(Match, { foreignKey: 'user1Id', as: 'matchesAsUser1', constraints: false });
Match.belongsTo(User, { foreignKey: 'user1Id', as: 'user1', constraints: false });

// User - Match (One to Many) - As User2
User.hasMany(Match, { foreignKey: 'user2Id', as: 'matchesAsUser2', constraints: false });
Match.belongsTo(User, { foreignKey: 'user2Id', as: 'user2', constraints: false });

// Match - Message (One to Many)
Match.hasMany(Message, { foreignKey: 'matchId', as: 'messages', constraints: false });
Message.belongsTo(Match, { foreignKey: 'matchId', as: 'match', constraints: false });

// User - Message (One to Many) - As Sender
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages', constraints: false });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender', constraints: false });

// User - Notification (One to Many)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', constraints: false });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

// User - Notification (One to Many) - Related User
User.hasMany(Notification, { foreignKey: 'relatedUserId', as: 'relatedNotifications', constraints: false });
Notification.belongsTo(User, { foreignKey: 'relatedUserId', as: 'relatedUser', constraints: false });

// Match - Notification (One to Many)
Match.hasMany(Notification, { foreignKey: 'relatedMatchId', as: 'notifications', constraints: false });
Notification.belongsTo(Match, { foreignKey: 'relatedMatchId', as: 'relatedMatch', constraints: false });

module.exports = {
  User,
  Photo,
  Swipe,
  Match,
  Message,
  Notification
};

