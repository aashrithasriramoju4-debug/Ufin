const mongoose = require('mongoose');
const Produce = require('../models/Produce');
const { validationResult } = require('express-validator');

const processSmartLogic = (produce) => {
  // Decision Logic
  if (produce.expiryHours < 2) {
    produce.recommendedAction = 'Urgent Delivery 🚚';
  } else if (produce.demand < 5) {
    produce.recommendedAction = 'Donate ❤️';
  } else {
    produce.recommendedAction = 'Sell 💰';
  }

  // Pricing Intelligence
  const currentPrice = produce.basePrice;
  produce.predictedPrice = currentPrice + (Math.random() * 8 - 3); // -3 to +5 fluctuation

  // AI Price History (Last 5 days) + Prediction (Next 2 days)
  const history = [];
  for (let i = 4; i >= 0; i--) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - i);
    history.push({
      date: pastDate.toISOString().split('T')[0],
      price: currentPrice - (Math.random() * 5 + 1)
    });
  }
  produce.priceHistory = history;

  // AI Scoring & Demand
  produce.demandLevel = produce.demand > 7 ? 'High' : produce.demand > 4 ? 'Medium' : 'Low';
  produce.aiScore = Math.floor(Math.random() * 20 + 75); // Score between 75-95

  // Alert System
  const alerts = [];
  if (produce.expiryHours < 2) alerts.push('⚠️ Expiring soon');
  if (produce.predictedPrice > currentPrice) alerts.push('📈 Price rising');
  if (produce.predictedPrice < currentPrice) alerts.push('📉 Price dropping');
  produce.alerts = alerts;

  return produce;
};

const addProduce = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let produceData = { ...req.body };
    
    // Default values if not provided
    if (!produceData.location) produceData.location = { type: 'Point', coordinates: [78.4867, 17.3850] }; // Hyderabad
    if (Array.isArray(produceData.location)) {
      produceData.location = { type: 'Point', coordinates: produceData.location };
    }

    // Set default image if not provided
    if (!produceData.imageUrl) {
      // Simple logic to assign appropriate images
      const name = (produceData.name || '').toLowerCase();
      const type = (produceData.type || '').toLowerCase();
      
      if (name.includes('tomato')) {
        produceData.imageUrl = 'https://images.unsplash.com/photo-1546470427-e9e826f9e5dc?q=80&w=1000&auto=format&fit=crop';
      } else if (name.includes('banana')) {
        produceData.imageUrl = 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?q=80&w=1000&auto=format&fit=crop';
      } else if (name.includes('potato')) {
        produceData.imageUrl = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1000&auto=format&fit=crop';
      } else if (type === 'vegetable') {
        produceData.imageUrl = 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=1000&auto=format&fit=crop';
      } else if (type === 'fruit') {
        produceData.imageUrl = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop';
      } else {
        produceData.imageUrl = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042&auto=format&fit=crop';
      }
    }

    let produce = new Produce(produceData);
    produce = processSmartLogic(produce);

    await produce.save();
    res.status(201).json({ success: true, produce });
  } catch (error) {
    console.error('addProduce error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Farmer = require('../models/Farmer');

const getAllProduce = async (req, res) => {
  try {
    const { status = 'available' } = req.query;
    let query = {};
    if (status !== 'all') {
      query.status = status;
    }
    let produce = await Produce.find(query).lean();
    
    // Enrich with Farmer Trust Data
    const enrichedProduce = await Promise.all(produce.map(async (item) => {
      let farmer = null;
      try {
        if (item.farmer && mongoose.Types.ObjectId.isValid(item.farmer)) {
          farmer = await Farmer.findOne({ userId: item.farmer }) || await Farmer.findById(item.farmer);
        } else if (item.farmer) {
          // If it's a demo string, try to find by name for better UX
          farmer = await Farmer.findOne({ name: new RegExp(item.farmer.replace('demo_farmer_', 'Farmer '), 'i') });
        }
      } catch (err) {
        console.error('Error fetching farmer trust data:', err);
      }

      const processed = processSmartLogic(item);
      return {
        ...processed,
        farmerTrust: farmer ? {
          rating: farmer.rating || 4.0,
          trustScore: farmer.trustScore || 80,
          complaintCount: farmer.complaintCount || 0,
          badge: (farmer.rating >= 4.2 && farmer.trustScore >= 80) ? 'Star Seller' : 'Trusted Farmer'
        } : {
          rating: 4.0,
          trustScore: 80,
          complaintCount: 0,
          badge: 'Trusted Farmer'
        }
      };
    }));
    
    res.json({ success: true, produce: enrichedProduce });
  } catch (error) {
    console.error('getAllProduce error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProduce = async (req, res) => {
  try {
    const farmerId = req.user?.id || '1000';
    const produce = await Produce.find({ farmer: farmerId });
    res.json({ success: true, produce });
  } catch (error) {
    console.error('getMyProduce error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const produce = await Produce.findByIdAndUpdate(id, { status }, { new: true });
    if (!produce) return res.status(404).json({ message: 'Produce not found' });

    res.json({ success: true, produce });
  } catch (error) {
    console.error('updateProduceStatus error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const matchProduce = async (req, res) => {
  try {
    const { produceId } = req.body;
    const produce = await Produce.findById(produceId);
    if (!produce) return res.status(404).json({ message: 'Produce not found' });

    // Simulate nearest NGO/market
    const matchingInfo = "Matched with center 1.2 km away";
    
    res.json({ success: true, matchingInfo, produce });
  } catch (error) {
    console.error('matchProduce error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addProduce, getAllProduce, getMyProduce, updateProduceStatus, matchProduce };
