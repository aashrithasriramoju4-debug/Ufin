const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
      
      // Try to find user in real DB first
      let user = null;
      try {
        if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
          user = await User.findById(decoded.id);
        }
      } catch (dbError) {
        // If DB not available, fall back to mock users
        const { mockUsers } = require('../mockAuth');
        user = mockUsers.find(u => u._id === decoded.id);
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

const roleCheck = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
  }

  next();
};

module.exports = { authMiddleware, roleCheck };
