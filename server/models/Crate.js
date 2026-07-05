const mongoose = require('mongoose');

const crateSchema = new mongoose.Schema({
  crateId: { type: String, required: true, unique: true },
  batchId: { type: String, required: true },
  farmerId: { type: String, required: true },
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: 'created' },
  history: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Crate', crateSchema);
