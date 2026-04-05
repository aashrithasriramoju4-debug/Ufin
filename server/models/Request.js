const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedType: { type: String, enum: ['DONATE', 'SELL', 'PROCESS'], required: true },
  maxDistanceKm: { type: Number, default: 30 },
  quantity: { type: Number, default: 0 },
  status: { type: String, enum: ['OPEN', 'FULFILLED', 'CANCELLED'], default: 'OPEN' }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
