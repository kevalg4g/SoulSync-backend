// Load environment variables
const dotenv = require('dotenv');
const result = dotenv.config({ path: '.env' });

if (result.error) {
  console.warn('.env file not found. Using default values where possible.');
}

// Verify .env is loaded
if (process.env.NODE_ENV !== 'production') {
  console.log('.env file loaded successfully');
}

// Required environment variables
const required = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST', 'JWT_SECRET'];
const missing = required.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('Please check your .env file and ensure all required variables are set');

}

// Dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const routes = require('./routes');
const { Message, Match, User, Notification } = require('./models');
const { setIO: setSwipeIO } = require('./controllers/swipeController');
const jwt = require('jsonwebtoken');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Token required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) return next(new Error('User not found'));

    socket.userId = user.id;
    socket.user = user.toJSON();
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.userId}`);

  socket.join(`user_${socket.userId}`);

  // Join Room
  socket.on('join_room', async ({ matchId }) => {
    try {
      const match = await Match.findByPk(matchId);
      if (!match || (match.user1Id !== socket.userId && match.user2Id !== socket.userId)) {
        return socket.emit('app_error', { message: 'Invalid match' });
      }
      const roomName = `match_${matchId}`;
      socket.join(roomName);
      socket.emit('joined_room', { matchId, roomName });
    } catch (error) {
      socket.emit('app_error', { message: 'Error joining room' });
    }
  });

  // Send Message
  socket.on('send_message', async ({ matchId, senderId, text }) => {
    try {
      if (senderId !== socket.userId)
        return socket.emit('app_error', { message: 'Unauthorized' });

      const match = await Match.findByPk(matchId);
      if (!match || (match.user1Id !== socket.userId && match.user2Id !== socket.userId)) {
        return socket.emit('app_error', { message: 'Invalid match' });
      }

      const message = await Message.create({ matchId, senderId, text });
      const messageWithSender = await Message.findByPk(message.id, {
        include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }]
      });

      const roomName = `match_${matchId}`;
      io.to(roomName).emit('receive_message', {
        matchId,
        senderId,
        text,
        message: messageWithSender.toJSON(),
        createdAt: message.createdAt
      });

      const otherUserId = match.user1Id === socket.userId ? match.user2Id : match.user1Id;
      const sender = await User.findByPk(socket.userId);

      try {
        await Notification.create({
          userId: otherUserId,
          type: 'message',
          title: 'New Message',
          message: `${sender.name} sent you a message`,
          relatedUserId: socket.userId,
          relatedMatchId: matchId
        });
      } catch (err) {
        console.warn('Failed to create notification:', err.message);
      }

      io.to(`user_${otherUserId}`).emit('new_notification', {
        type: 'message',
        title: 'New Message',
        message: `${sender.name} sent you a message`
      });

    } catch (error) {
      socket.emit('app_error', { message: 'Error sending message' });
    }
  });

  // Typing Indicators
  socket.on('typing', ({ matchId, userId }) => {
    if (userId === socket.userId)
      socket.to(`match_${matchId}`).emit('typing', { matchId, userId });
  });

  socket.on('stop_typing', ({ matchId, userId }) => {
    if (userId === socket.userId)
      socket.to(`match_${matchId}`).emit('stop_typing', { matchId, userId });
  });

  // New Match Event
  socket.on('new_match', async ({ user1, user2 }) => {
    try {
      const [user1Data, user2Data] = await Promise.all([
        User.findByPk(user1),
        User.findByPk(user2)
      ]);
      if (!user1Data || !user2Data)
        return socket.emit('app_error', { message: 'Users not found' });

      const matchData = { user1: user1Data.toJSON(), user2: user2Data.toJSON() };
      io.to(`user_${user1}`).emit('new_match', matchData);
      io.to(`user_${user2}`).emit('new_match', matchData);
    } catch (error) {
      socket.emit('app_error', { message: 'Error sending match notification' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.userId}`);
  });
});

// Start Server
const startServer = async () => {
  try {
    await testConnection();

    if (process.env.SYNC_DB === 'true') {
      // Sync models in dependency order
      const { User, Photo, Swipe, Match, Message, Notification } = require('./models');
      await User.sync({ force: false });
      await Photo.sync({ force: false });
      await Swipe.sync({ force: false });
      await Match.sync({ force: false });
      await Message.sync({ force: false });
      await Notification.sync({ force: false });

      console.log('Models synchronized');
    }

    setSwipeIO(io);

    // Start the HTTP server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        console.error(` Solution: lsof -ti:${PORT} | xargs kill -9`);
        console.error(` Or change PORT in .env file`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Start error:', error.message);
    if (error.original) console.error('Original:', error.original.message);
    if (error.stack) console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled:', err.message);
  process.exit(1);
});

startServer();

module.exports = { app, server, io };
