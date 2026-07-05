const mongoose = require('mongoose');
const Produce = require('../models/Produce');

// Mock AI prediction logic (in production, this would use ML models)
const predictPrice = async (req, res) => {
  try {
    const { productId, pricePerKg, location } = req.body;

    let product;
    let currentPrice;

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Produce.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      currentPrice = product.basePrice;
    } else if (productId) {
      // Handle demo productId (if any)
      currentPrice = pricePerKg || 50; 
    } else if (pricePerKg) {
      currentPrice = pricePerKg;
    } else {
      return res.status(400).json({ message: 'Either productId or pricePerKg is required' });
    }

    // Generate historical prices (last 5 days)
    const historyPrices = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 20; // -10 to +10 variation
      historyPrices.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(10, currentPrice + variation)
      });
    }

    // Generate predicted prices (next 2 days)
    const predictedPrices = [];
    for (let i = 1; i <= 2; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const trend = Math.random() > 0.6 ? 1 : -1; // 60% chance of increase
      const change = trend * (Math.random() * 15 + 5); // 5-20 change
      predictedPrices.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(10, currentPrice + change)
      });
    }

    // Determine trend
    const lastPrice = historyPrices[historyPrices.length - 1].price;
    const nextPrice = predictedPrices[0].price;
    const trend = nextPrice > lastPrice ? 'rising' : nextPrice < lastPrice ? 'falling' : 'stable';

    // Generate suggestion based on trend and current conditions
    let suggestion;
    let explanation;
    const confidenceScore = Math.floor(Math.random() * 20 + 80); // 80-100

    if (trend === 'rising') {
      suggestion = 'BUY_NOW';
      explanation = `Price expected to increase by ₹${(nextPrice - currentPrice).toFixed(1)} due to rising demand. Buy now to get the best price.`;
    } else if (trend === 'falling') {
      suggestion = 'WAIT';
      explanation = `Price expected to decrease by ₹${(currentPrice - nextPrice).toFixed(1)} in the next 24 hours. Consider waiting for better pricing.`;
    } else {
      suggestion = 'HOLD';
      explanation = `Price is stable with minimal fluctuation expected. Current price is competitive for this time of day.`;
    }

    // Add location-based factors if location provided
    if (location) {
      const locationFactor = Math.random();
      if (locationFactor > 0.7) {
        explanation += ` Local demand in your area is ${locationFactor > 0.85 ? 'high' : 'moderate'}.`;
      }
    }

    res.json({
      success: true,
      data: {
        historyPrices,
        predictedPrices,
        trend,
        suggestion,
        confidenceScore,
        explanation,
        currentPrice,
        location: location || null
      }
    });

  } catch (error) {
    console.error('AI prediction error:', error);
    res.status(500).json({ message: 'Failed to generate prediction', error: error.message });
  }
};

module.exports = { predictPrice };