const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'ngo', 'buyer', 'admin', 'hub'], default: 'farmer' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  impactPoints: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
