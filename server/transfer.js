const mongoose = require('mongoose');
const Produce = require('./models/Produce');

const updateDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ufin');
    const db = mongoose.connection.db;
    
    // Find the absolute latest user created
    const latestUsers = await db.collection('users').find().sort({ _id: -1 }).limit(1).toArray();
    
    if (latestUsers.length === 0) {
      console.log('No users found in database.');
      process.exit(1);
    }
    
    const latestUserId = latestUsers[0]._id.toString();
    const latestUserEmail = latestUsers[0].email;
    console.log(`Transferring to latest user: ${latestUserEmail} (ID: ${latestUserId})`);
    
    // Find the products we previously seeded
    const products = await Produce.find({ name: { $in: ['Organic Sweet Corn', 'Farm Fresh Strawberries'] } }).limit(2);
    
    if (products.length >= 2) {
      // Update Product 1
      products[0].farmer = latestUserId;
      products[0].sellerEmail = latestUserEmail;
      await products[0].save();
      
      // Update Product 2
      products[1].farmer = latestUserId;
      products[1].sellerEmail = latestUserEmail;
      await products[1].save();
      
      console.log('Products successfully transferred.');
    } else {
      console.log('Could not find the seeded products. Creating them now...');
      
      await Produce.create({
        farmer: latestUserId,
        name: 'Organic Sweet Corn',
        type: 'vegetable',
        quantity: 100,
        freshness: 9,
        damage: 0,
        expiryHours: 72,
        demand: 8,
        quality: 'SELL',
        status: 'sold',
        sellerName: latestUsers[0].name || 'Demo Farmer',
        sellerPhone: '+91-9999999999',
        sellerEmail: latestUserEmail,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1000&auto=format&fit=crop',
        basePrice: 99.99,
        pricingType: 'per_kg',
        alerts: ['🌽 Fresh harvest']
      });

      await Produce.create({
        farmer: latestUserId,
        name: 'Farm Fresh Strawberries',
        type: 'fruit',
        quantity: 50,
        freshness: 10,
        damage: 0,
        expiryHours: 48,
        demand: 9,
        quality: 'SELL',
        status: 'sold',
        sellerName: latestUsers[0].name || 'Demo Farmer',
        sellerPhone: '+91-9999999999',
        sellerEmail: latestUserEmail,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=1000&auto=format&fit=crop',
        basePrice: 199.98,
        pricingType: 'per_kg',
        alerts: ['🍓 High demand']
      });
      console.log('Products created for the latest user.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateDB();
