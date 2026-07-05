const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getFarmerOrders,
  updateOrderStatus,
  processPayment,
  createPayout,
  getAllOrders
} = require('../controllers/orderController');
const { authMiddleware } = require('../services/auth');

router.post('/create', authMiddleware, [
  body('produceId').notEmpty().withMessage('Produce ID is required'),
  body('quantity').isNumeric().custom(v => v > 0),
  body('buyerName').notEmpty(),
  body('buyerPhone').notEmpty(),
  body('buyerEmail').isEmail(),
  body('deliveryLocation.address').notEmpty()
], createOrder);

router.get('/', authMiddleware, getUserOrders);
router.get('/farmer', authMiddleware, getFarmerOrders);
router.get('/all', authMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.post('/payment', authMiddleware, processPayment);
router.post('/payout', authMiddleware, createPayout);

module.exports = router;