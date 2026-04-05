const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  freshness: { type: Number, required: true, min: 0, max: 10 },
  damage: { type: Number, required: true, min: 0, max: 10 },
  quality: { type: String, enum: ['SELL', 'DONATE', 'PROCESS'], required: true },
  status: { type: String, enum: ['available', 'on_hold', 'sold'], default: 'available' },
  sellerName: { type: String, required: true },
  sellerPhone: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  imageUrl: { type: String },
  matchedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

produceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Produce', produceSchema);
