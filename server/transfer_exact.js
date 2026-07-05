const mongoose = require('mongoose');
const Produce = require('./models/Produce');
const User = require('./models/User');

const updateDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ufin');
    
    // 1. Find the target user
    const targetUser = await User.findOne({ email: 'pushpakpogiri111@gmail.com' });
    if (!targetUser) {
      console.log('Target user not found! Please make sure the account is created.');
      process.exit(1);
    }
    
    const targetUserId = targetUser._id.toString();
    console.log(`Found target user: ${targetUser.email} (ID: ${targetUserId})`);
    
    // 2. Find the products we seeded previously
    const products = await Produce.find({ name: { $in: ['Organic Sweet Corn', 'Farm Fresh Strawberries'] } }).limit(2);
    
    if (products.length >= 2) {
      // Transfer them
      products[0].farmer = targetUserId;
      products[0].sellerEmail = targetUser.email;
      products[0].status = 'sold';
      products[0].quantity = 100;
      products[0].basePrice = 99.99;
      await products[0].save();
      
      products[1].farmer = targetUserId;
      products[1].sellerEmail = targetUser.email;
      products[1].status = 'sold';
      products[1].quantity = 50;
      products[1].basePrice = 199.98;
      await products[1].save();
      
      console.log('Products successfully transferred and values reset to psychological numbers.');
    } else {
      console.log('Could not find the seeded products. Re-creating them...');
      
      await Produce.create({
        farmer: targetUserId,
        name: 'Organic Sweet Corn',
        type: 'vegetable',
        quantity: 100,
        freshness: 9,
        damage: 0,
        expiryHours: 72,
        demand: 8,
        quality: 'SELL',
        status: 'sold',
        sellerName: targetUser.name || 'Demo Farmer',
        sellerPhone: '+91-9999999999',
        sellerEmail: targetUser.email,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1000&auto=format&fit=crop',
        basePrice: 99.99,
        pricingType: 'per_kg',
        alerts: ['🌽 Fresh harvest']
      });

      await Produce.create({
        farmer: targetUserId,
        name: 'Farm Fresh Strawberries',
        type: 'fruit',
        quantity: 50,
        freshness: 10,
        damage: 0,
        expiryHours: 48,
        demand: 9,
        quality: 'SELL',
        status: 'sold',
        sellerName: targetUser.name || 'Demo Farmer',
        sellerPhone: '+91-9999999999',
        sellerEmail: targetUser.email,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=1000&auto=format&fit=crop',
        basePrice: 199.98,
        pricingType: 'per_kg',
        alerts: ['🍓 High demand']
      });
      console.log('Products created directly for the target user.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateDB();
