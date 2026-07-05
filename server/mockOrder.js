// Mock in-memory orders and payments for development
const mockOrders = [];
let orderIdCounter = 1;

const mockPaymentMethods = [
  { id: 'card_visa', name: 'Visa Card', type: 'card' },
  { id: 'card_mastercard', name: 'Mastercard', type: 'card' },
  { id: 'upi_google', name: 'Google Pay', type: 'upi' },
  { id: 'wallet_paytm', name: 'Paytm', type: 'wallet' }
];

const mockPayouts = [];
let payoutIdCounter = 1000;

// Create order
const createOrder = (orderData) => {
  const order = {
    _id: `order_${orderIdCounter++}`,
    orderId: `ORD_${Date.now()}`,
    ...orderData,
    status: 'pending',
    payment: { status: 'pending', method: null, transactionId: null },
    delivery: { status: 'pending', estimatedTime: '2-3 hours' },
    payout: { status: 'pending', farmerAmount: 0, platformFee: 0 },
    createdAt: new Date()
  };
  mockOrders.push(order);
  return order;
};

// Process payment
const processPayment = (orderId, paymentId, method) => {
  const order = mockOrders.find(o => o._id === orderId || o.orderId === orderId);
  if (!order) return null;

  order.payment.status = 'completed';
  order.payment.paymentId = paymentId;
  order.payment.method = method;
  order.payment.completedAt = new Date();
  order.status = 'confirmed';

  // Calculate payout to farmer
  const subtotal = order.pricing.subtotal;
  const platformFee = order.pricing.commissionAmount;
  const farmerAmount = subtotal - platformFee;

  order.payout.status = 'calculated';
  order.payout.farmerAmount = Math.round(farmerAmount * 100) / 100;
  order.payout.platformFee = platformFee;
  order.payout.paymentId = paymentId;

  return order;
};

// Create payout (settlement to farmer)
const createPayout = (orderId, farmerId) => {
  const order = mockOrders.find(o => o._id === orderId);
  if (!order || order.payout.status !== 'calculated') return null;

  const payout = {
    _id: `payout_${payoutIdCounter++}`,
    payoutId: `PAY_${Date.now()}`,
    orderId: order._id,
    farmerId,
    amount: order.payout.farmerAmount,
    method: 'bank_transfer',
    status: 'scheduled', // scheduled, processing, completed, failed
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    createdAt: new Date()
  };

  mockPayouts.push(payout);
  order.payout.status = 'payout_created';
  order.payout.payoutId = payout._id;

  return payout;
};

// Get payment methods
const getPaymentMethods = () => mockPaymentMethods;

// Get order payouts
const getOrderPayouts = () => mockPayouts;

// Update delivery status
const updateDeliveryStatus = (orderId, status) => {
  const order = mockOrders.find(o => o._id === orderId);
  if (order) {
    order.delivery.status = status;
  }
  return order;
};

// Get order by ID
const getOrderById = (orderId) => {
  return mockOrders.find(o => o._id === orderId || o.orderId === orderId);
};

// Get all orders by buyer email
const getOrdersByBuyer = (email) => {
  return mockOrders.filter(o => o.buyerEmail === email);
};

// Get all orders by farmer
const getOrdersByFarmer = (farmerId) => {
  return mockOrders.filter(o => o.farmer === farmerId);
};

module.exports = {
  mockOrders,
  mockPaymentMethods,
  mockPayouts,
  createOrder,
  processPayment,
  createPayout,
  getPaymentMethods,
  getOrderPayouts,
  updateDeliveryStatus,
  getOrderById,
  getOrdersByBuyer,
  getOrdersByFarmer
};
