const mongoose = require('mongoose');

const checkDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ufin');
    
    // We don't even need models to check raw data
    const db = mongoose.connection.db;
    
    const user = await db.collection('users').findOne({ email: 'pushpakpogiri111@gmail.com' });
    console.log("USER:", user);
    
    if (user) {
      const products = await db.collection('produces').find({ sellerEmail: 'pushpakpogiri111@gmail.com' }).toArray();
      console.log("PRODUCTS:", products);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDB();
