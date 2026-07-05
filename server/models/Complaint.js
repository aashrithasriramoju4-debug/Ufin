const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  farmerId: {
    type: String, // String to make it simpler to integrate without strict ObjectId references if farmerId is just a string in some places
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['quality', 'delivery', 'fraud', 'other'],
    default: 'other'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  status: {
    type: String,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
