const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const roleCheck = (allowedRoles = []) => (req, res, next) => {
  if (allowedRoles.includes(req.user.role)) return next();
  return res.status(403).json({ message: 'Forbidden' });
};

module.exports = { authMiddleware, roleCheck };
