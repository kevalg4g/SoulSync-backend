# Dating App Backend API

A comprehensive dating app backend built with Express.js, PostgreSQL, Sequelize ORM, JWT authentication, and Socket.io for real-time features.

## 🚀 Features

- **Authentication**: User registration, login, and JWT-based authentication
- **User Profiles**: User management with photos, bio, and interests
- **Swipe System**: Left/right swipe functionality
- **Matching**: Automatic match creation when two users swipe right on each other
- **Real-time Chat**: Socket.io-powered chat system with typing indicators
- **Notifications**: Real-time notifications for matches and messages

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASS=your_password
SYNC_DB=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:4000
```

4. **Create PostgreSQL database**:
```bash
createdb mydb
```
Or using psql:
```sql
CREATE DATABASE mydb;
```

5. **Run the server**:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will automatically create all database tables on first run.

## 📚 API Endpoints

### Authentication

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Login + return token | No |
| GET | `/api/auth/me` | Get logged-in user profile | Yes |

### User Profile

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/:id` | Get single user profile | Yes |
| PUT | `/api/users/:id` | Update profile (bio, interests, photos) | Yes |
| GET | `/api/users/:id/photos` | Get all user photos | Yes |
| POST | `/api/users/:id/photos` | Upload a photo | Yes |

### Swipe / Match System

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/swipe/right` | Swipe right on a user | Yes |
| POST | `/api/swipe/left` | Swipe left on a user | Yes |
| GET | `/api/matches` | Get all matches for user | Yes |
| POST | `/api/matches/create` | Create a match (user1 + user2) | Yes |

### Chat Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/chat/:matchId` | Get chat history for a match | Yes |
| POST | `/api/chat/:matchId/send` | Send a message (store in DB) | Yes |

### Notifications

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/notifications` | Get all notifications | Yes |
| POST | `/api/notifications/read` | Mark notifications as read | Yes |

## 🔌 Socket.io Events

### Client to Server Events

#### Join Chat Room
```javascript
socket.emit('join_room', { matchId: 123 });
```

#### Send Message
```javascript
socket.emit('send_message', {
  matchId: 123,
  senderId: 1,
  text: 'Hello!'
});
```

#### Typing Indicator
```javascript
// Start typing
socket.emit('typing', { matchId: 123, userId: 1 });

// Stop typing
socket.emit('stop_typing', { matchId: 123, userId: 1 });
```

#### New Match Notification
```javascript
socket.emit('new_match', { user1: 1, user2: 2 });
```

### Server to Client Events

#### Receive Message
```javascript
socket.on('receive_message', (data) => {
  console.log('New message:', data);
  // data: { matchId, senderId, text, message, createdAt }
});
```

#### Typing Indicator
```javascript
socket.on('typing', (data) => {
  console.log('User is typing:', data);
  // data: { matchId, userId }
});

socket.on('stop_typing', (data) => {
  console.log('User stopped typing:', data);
});
```

#### New Match
```javascript
socket.on('new_match', (data) => {
  console.log('New match!', data);
  // data: { user1, user2 }
});
```

#### New Notification
```javascript
socket.on('new_notification', (data) => {
  console.log('New notification:', data);
});
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

For Socket.io connections, pass the token in the handshake:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

## 📝 Example API Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "bio": "Love traveling and photography",
    "interests": ["travel", "photography", "music"]
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Swipe Right
```bash
curl -X POST http://localhost:3000/api/swipe/right \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "swipedId": 2
  }'
```

### Get Matches
```bash
curl -X GET http://localhost:3000/api/matches \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/chat/1/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "text": "Hello! How are you?"
  }'
```

## 🗄️ Database Models

- **User**: User accounts with profile information
- **Photo**: User photos with primary photo flag
- **Swipe**: Swipe records (left/right)
- **Match**: Matched users
- **Message**: Chat messages between matched users
- **Notification**: User notifications

## 🏗️ Project Structure

```
.
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── swipeController.js   # Swipe and match logic
│   ├── chatController.js    # Chat functionality
│   └── notificationController.js  # Notifications
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Photo.js             # Photo model
│   ├── Swipe.js             # Swipe model
│   ├── Match.js             # Match model
│   ├── Message.js           # Message model
│   ├── Notification.js      # Notification model
│   └── index.js             # Model relationships
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── userRoutes.js        # User routes
│   ├── swipeRoutes.js       # Swipe routes
│   ├── matchRoutes.js       # Match routes
│   ├── chatRoutes.js        # Chat routes
│   ├── notificationRoutes.js # Notification routes
│   └── index.js             # Route index
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASS`: Database password
- `SYNC_DB`: Auto-sync database models (true/false)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration (default: 7d)
- `CORS_ORIGIN`: CORS allowed origin

## 🐛 Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information (in development)"
}
```

## 📝 Notes

- Passwords are automatically hashed using bcryptjs
- JWT tokens expire after 7 days (configurable)
- Database tables are automatically created/synced on server start
- Socket.io connections require JWT authentication
- Users can only see users they haven't swiped on yet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 👤 Author

Created for the Dating App project

## 🆘 Support

For issues and questions, please open an issue on the repository.

# SoulSync-backend
# SoulSync-backend
# SoulSync-backend
