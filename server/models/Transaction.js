const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  produce: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['SELL', 'DONATE', 'PROCESS'], required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
  mealsSaved: { type: Number, default: 0 },
  co2SavedKg: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
