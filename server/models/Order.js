const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Product details
  productType: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },

  // Pricing (5% commission)
  basePrice: { type: Number, required: true, min: 0 }, // Price per unit/kg
  pricingType: { type: String, enum: ['per_kg', 'per_item', 'per_dozen'], default: 'per_kg' },
  commissionRate: { type: Number, default: 0.05 }, // 5%
  commissionAmount: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }, // basePrice * quantity

  // Delivery
  deliveryFee: { type: Number, default: 50 }, // Fixed delivery fee
  pickupLocation: {
    address: { type: String },
    coordinates: { type: [Number] } // [lng, lat]
  },
  deliveryLocation: {
    address: { type: String, required: true },
    coordinates: { type: [Number] } // [lng, lat]
  },
  estimatedDeliveryTime: { type: String, default: '2-3 hours' },

  // Total calculation
  totalAmount: { type: Number, required: true, min: 0 }, // subtotal + commission + deliveryFee

  // Buyer details
  buyerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }
  },

  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentMethod: { type: String, default: 'razorpay' },

  // Order status
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },

  // Impact tracking
  impact: {
    peopleFed: { type: Number, default: 0 },
    wastePrevented: { type: Number, default: 0 } // in kg
  },

  // Timestamps
  orderPlacedAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date }
}, { timestamps: true });

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.basePrice * this.quantity;

  // Calculate commission
  this.commissionAmount = this.subtotal * this.commissionRate;

  // Calculate total
  this.totalAmount = this.subtotal + this.commissionAmount + this.deliveryFee;

  // Calculate impact (rough estimate)
  this.impact.peopleFed = Math.floor(this.quantity / 2); // 2kg feeds 1 person roughly
  this.impact.wastePrevented = this.quantity;

  next();
});

module.exports = mongoose.model('Order', orderSchema);