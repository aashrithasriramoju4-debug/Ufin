const express = require('express');
const router = express.Router();

// Mock payment processing
const processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock success response
    const paymentResult = {
      success: true,
      paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      amount,
      paymentMethod,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: paymentResult
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

module.exports = { processPayment };