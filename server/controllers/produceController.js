const { validationResult } = require('express-validator');
const Produce = require('../models/Produce');
const { classifyProduce, estimateImpact } = require('../services/classification');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const addProduce = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, quantity, freshness, damage, location, imageUrl, sellerName, sellerPhone, sellerEmail } = req.body;
    const quality = classifyProduce({ freshness, damage });

    const produce = await Produce.create({
      farmer: req.user._id,
      type,
      quantity,
      freshness,
      damage,
      quality,
      location: { type: 'Point', coordinates: location },
      imageUrl,
      sellerName,
      sellerPhone,
      sellerEmail
    });

    const impact = estimateImpact({ quantity, type: quality });
    await Transaction.create({ produce: produce._id, from: req.user._id, to: req.user._id, type: quality, quantity, status: 'COMPLETED', ...impact });

    res.status(201).json({ produce, quality, impact });
  } catch (error) {
    console.error('addProduce error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllProduce = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const produce = await Produce.find(filter).populate('farmer', 'name email role location');
    res.json({ produce });
  } catch (error) {
    console.error('getAllProduce error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProduce = async (req, res) => {
  try {
    const produce = await Produce.find({ farmer: req.user._id });
    res.json({ produce });
  } catch (error) {
    console.error('getMyProduce error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'on_hold', 'sold'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const produce = await Produce.findById(id);
    if (!produce) return res.status(404).json({ message: 'Produce not found' });

    // Check if user owns this produce or is admin
    if (produce.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    produce.status = status;
    await produce.save();

    res.json({ produce });
  } catch (error) {
    console.error('updateProduceStatus error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const matchProduce = async (req, res) => {
  try {
    const { produceId, targetId } = req.body;
    const produce = await Produce.findById(produceId);
    if (!produce) return res.status(404).json({ message: 'Produce not found' });
    if (produce.status !== 'available') return res.status(400).json({ message: 'Produce not available' });

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'Target user not found' });

    produce.status = 'on_hold';
    produce.matchedTo = target._id;
    await produce.save();

    const impact = estimateImpact({ quantity: produce.quantity, type: produce.quality });
    const transaction = await Transaction.create({ produce: produce._id, from: produce.farmer, to: target._id, type: produce.quality, quantity: produce.quantity, status: 'PENDING', ...impact });

    return res.json({ produce, transaction });
  } catch (error) {
    console.error('matchProduce error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addProduce, getAllProduce, getMyProduce, updateProduceStatus, matchProduce };
