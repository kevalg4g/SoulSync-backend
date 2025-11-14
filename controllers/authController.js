const jwt = require('jsonwebtoken');
const { User } = require('../models');
const Photo = require('../models/Photo');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE || '7d'
});

const register = async (req, res) => {
  try {
    const { name, email, password, } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'User registered successfully', token: generateToken(user.id), user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', token: generateToken(user.id), user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in', details: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, { include: [{ model: Photo, as: 'photos' }] });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile', details: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};

