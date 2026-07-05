const mongoose = require('mongoose');
const Order = require('../models/Order');
const Produce = require('../models/Produce');
const { validationResult } = require('express-validator');

const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { produceId, quantity, buyerName, buyerPhone, buyerEmail, deliveryLocation } = req.body;

    let produce = null;
    if (produceId && mongoose.Types.ObjectId.isValid(produceId)) {
      produce = await Produce.findById(produceId);
    }
    
    if (!produce) return res.status(404).json({ message: 'Produce not found' });
    if (produce.quantity < quantity) return res.status(400).json({ message: 'Not enough quantity available' });

    const order = new Order({
      productId: produceId,
      buyerId: req.user?.id || '2000', // Demo buyer
      sellerId: produce.farmer,
      productType: produce.type,
      quantity,
      basePrice: produce.basePrice,
      pricingType: produce.pricingType,
      buyerDetails: {
        name: buyerName,
        phone: buyerPhone,
        email: buyerEmail
      },
      deliveryLocation,
      pickupLocation: {
        address: 'Farmer Location',
        coordinates: produce.location.coordinates
      }
    });

    await order.save();

    // Update produce quantity
    produce.quantity -= quantity;
    if (produce.quantity === 0) produce.status = 'sold';
    await produce.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('createOrder error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || '2000';
    const orders = await Order.find({ buyerId: userId }).populate('productId');
    res.json({ success: true, orders });
  } catch (error) {
    console.error('getUserOrders error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user?.id || '1000';
    const orders = await Order.find({ sellerId: farmerId }).populate('productId');
    res.json({ success: true, orders });
  } catch (error) {
    console.error('getFarmerOrders error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let order = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    }
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    console.error('updateOrderStatus error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const processPayment = async (req, res) => {
  res.json({ success: true, message: 'Payment processed successfully (Mock)' });
};

const createPayout = async (req, res) => {
  res.json({ success: true, message: 'Payout initialized (Mock)' });
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('productId');
    res.json({ success: true, orders });
  } catch (error) {
    console.error('getAllOrders error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getUserOrders, getFarmerOrders, updateOrderStatus, processPayment, createPayout, getAllOrders };