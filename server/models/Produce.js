const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
  farmer: { type: String, required: true, default: '1000' }, // For demo simplicity
  name: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  freshness: { type: Number, required: true, min: 0, max: 10, default: 8 },
  damage: { type: Number, required: true, min: 0, max: 10, default: 2 },
  expiryHours: { type: Number, required: true, default: 24 },
  demand: { type: Number, required: true, default: 10 },
  quality: { type: String, enum: ['SELL', 'DONATE', 'PROCESS'], default: 'SELL' },
  status: { type: String, enum: ['available', 'on_hold', 'sold'], default: 'available' },
  sellerName: { type: String, required: true },
  sellerPhone: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042&auto=format&fit=crop' },
  basePrice: { type: Number, required: true, min: 0 },
  pricingType: { type: String, enum: ['per_kg', 'per_item', 'per_dozen'], default: 'per_kg' },
  // AI/Smart fields
  recommendedAction: { type: String },
  predictedPrice: { type: Number },
  priceHistory: [{ date: String, price: Number }],
  demandLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  aiScore: { type: Number, default: 80 },
  alerts: [String]
}, { timestamps: true });

produceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Produce', produceSchema);
