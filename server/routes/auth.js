const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['farmer', 'ngo', 'buyer', 'admin'])
], register);

router.post('/login', [body('email').isEmail(), body('password').exists()], login);

module.exports = router;
