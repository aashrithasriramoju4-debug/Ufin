const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  // Adding userId to link this Farmer model to an existing User if needed,
  // or it can act standalone.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    default: 4.0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  complaintCount: {
    type: Number,
    default: 0
  },
  resolvedCount: {
    type: Number,
    default: 0
  },
  trustScore: {
    type: Number,
    default: 80
  }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
