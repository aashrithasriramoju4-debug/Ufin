const mongoose = require('mongoose');
const Produce = require('./models/Produce');

const updateDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ufin');
    
    // Find products for the user
    const products = await Produce.find({ sellerEmail: 'pushpakpogiri111@gmail.com' }).limit(2);
    
    if (products.length >= 2) {
      // Product 1
      products[0].status = 'sold';
      products[0].quantity = 100;
      products[0].basePrice = 99.99;
      await products[0].save();
      
      // Product 2
      products[1].status = 'sold';
      products[1].quantity = 50;
      products[1].basePrice = 199.98; // 100 * 99.99 = 9999, 50 * 199.98 = 9999
      await products[1].save();
      
      console.log('Updated to psychological numbers and marked as sold.');
    } else {
      console.log('Not enough products found to update.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateDB();
