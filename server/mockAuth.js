// Mock in-memory auth for development (no MongoDB required)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user store
const mockUsers = [
  {
    _id: '1000',
    name: 'Demo Farmer',
    email: 'farmer@demo.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMye', // demo123 hashed
    role: 'farmer',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] }
  },
  {
    _id: '1001',
    name: 'Demo Buyer',
    email: 'buyer@demo.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMye', // demo123 hashed
    role: 'buyer',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] }
  }
];

let userIdCounter = 1002;

const register = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    // Check if email exists
    if (mockUsers.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      _id: String(userIdCounter++),
      name,
      email,
      password: hash,
      role,
      location: typeof location === 'string' 
        ? { type: 'Point', coordinates: location.split(',').map(Number) }
        : location
    };

    mockUsers.push(newUser);

    // Generate token
    const token = jwt.sign({ id: newUser._id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location
      }
    });
  } catch (error) {
    console.error('register error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    console.error('login error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get users for debugging
const getUsers = (req, res) => {
  res.json(mockUsers.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role
  })));
};

module.exports = { register, login, getUsers, mockUsers };
