const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { register: mockRegister, login: mockLogin } = require('../mockAuth');

// Try to use real DB, fall back to mock
let User = null;
try {
  User = require('../models/User');
} catch (err) {
  console.log('User model not available, using mock auth');
}

const register = async (req, res) => {
  if (!User) {
    return mockRegister(req, res);
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, location } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Process location
    let processedLocation = location;
    if (Array.isArray(location)) {
      processedLocation = { type: 'Point', coordinates: location };
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role, location: processedLocation });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email, role, location } });
  } catch (error) {
    console.error('register error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  if (!User) {
    return mockLogin(req, res);
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, location: user.location } });
  } catch (error) {
    console.error('login error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };
