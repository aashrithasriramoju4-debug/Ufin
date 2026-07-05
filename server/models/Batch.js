const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  farmerId: { type: String, required: true },
  product: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  crateSize: { type: Number, required: true },
  totalCrates: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
