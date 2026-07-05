const mongoose = require('mongoose');
const Produce = require('./models/Produce');
const User = require('./models/User');

const seedProducts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ufin');

    const email = 'pushpakpogiri111@gmail.com';
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log(`Creating user ${email}`);
      user = await User.create({
        name: 'Pushpak',
        email: email,
        password: 'password123', // Dummy password
        role: 'farmer',
        location: { type: 'Point', coordinates: [78.4867, 17.3850] }
      });
    }

    // Add 2 products
    const products = [
      {
        farmer: user._id.toString(),
        name: 'Organic Sweet Corn',
        type: 'vegetable',
        quantity: 150,
        freshness: 9,
        damage: 0,
        expiryHours: 72,
        demand: 8,
        quality: 'SELL',
        status: 'available',
        sellerName: user.name || 'Pushpak',
        sellerPhone: '+91-9999999999',
        sellerEmail: email,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1000&auto=format&fit=crop',
        basePrice: 40,
        pricingType: 'per_kg',
        alerts: ['🌽 Fresh harvest']
      },
      {
        farmer: user._id.toString(),
        name: 'Farm Fresh Strawberries',
        type: 'fruit',
        quantity: 50,
        freshness: 10,
        damage: 0,
        expiryHours: 48,
        demand: 9,
        quality: 'SELL',
        status: 'available',
        sellerName: user.name || 'Pushpak',
        sellerPhone: '+91-9999999999',
        sellerEmail: email,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=1000&auto=format&fit=crop',
        basePrice: 200,
        pricingType: 'per_kg',
        alerts: ['🍓 High demand']
      }
    ];

    for (const p of products) {
      await Produce.create(p);
      console.log(`Created product: ${p.name}`);
    }

    console.log('Successfully added products for pushpakpogiri111@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedProducts();
