require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const produceRoutes = require('./routes/produce');
const dashboardRoutes = require('./routes/dashboard');
const orderRoutes = require('./routes/orders');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/payment');
const complaintRoutes = require('./routes/complaint');
const crateRoutes = require('./routes/crateRoutes');
const batchRoutes = require('./routes/batchRoutes');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/crate', crateRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.send('U-FIN Backend is running. Use /api/health.'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'u-fin backend' }));

// Seed demo data
const seedDemoData = async () => {
  try {
    const Produce = require('./models/Produce');
    const User = require('./models/User');

    // Check if demo data already exists
    const existingProduce = await Produce.countDocuments();
    if (existingProduce > 0) {
      console.log('Demo data already exists, skipping seed');
      return;
    }

    // Create demo users
    const demoUsers = [
      {
        name: 'Rajesh Kumar',
        email: 'farmer@demo.com',
        password: 'password123',
        role: 'farmer',
        location: { type: 'Point', coordinates: [78.4867, 17.3850] }
      },
      {
        name: 'Priya Sharma',
        email: 'buyer@demo.com',
        password: 'password123',
        role: 'buyer',
        location: { type: 'Point', coordinates: [78.4867, 17.3850] }
      }
    ];

    const Farmer = require('./models/Farmer');

    for (const userData of demoUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }
      
      if (user.role === 'farmer') {
        const existingFarmer = await Farmer.findOne({ userId: user._id });
        if (!existingFarmer) {
          await Farmer.create({
            name: user.name,
            userId: user._id,
            rating: 4.5 + Math.random() * 0.5,
            trustScore: 85 + Math.floor(Math.random() * 15)
          });
        }
      }
    }

    // Create a special "Farmer 1" for demo produce matching
    const farmer1 = await Farmer.findOne({ name: 'Farmer 1' });
    if (!farmer1) {
      await Farmer.create({
        name: 'Farmer 1',
        rating: 4.8,
        trustScore: 95
      });
    }

    // Create demo produce
    const farmerUser = await User.findOne({ email: 'farmer@demo.com' });
    const farmerId = farmerUser ? farmerUser._id : new mongoose.Types.ObjectId();

    const demoProduce = [
      {
        farmer: farmerId,
        name: 'Organic Tomatoes',
        type: 'vegetable',
        quantity: 50,
        freshness: 9,
        damage: 1,
        expiryHours: 48,
        demand: 8,
        quality: 'SELL',
        status: 'available',
        sellerName: 'Rajesh Kumar',
        sellerPhone: '+91-9876543210',
        sellerEmail: 'farmer@demo.com',
        location: { type: 'Point', coordinates: [78.4867, 17.3850] }, // Hyderabad, Telangana
        imageUrl: 'https://images.unsplash.com/photo-1546470427-e9e826f9e5dc?q=80&w=1000&auto=format&fit=crop',
        basePrice: 25,
        pricingType: 'per_kg',
        alerts: ['📈 Demand rising in your area']
      },
      {
        farmer: farmerId,
        name: 'Fresh Bananas',
        type: 'fruit',
        quantity: 30,
        freshness: 8,
        damage: 2,
        expiryHours: 72,
        demand: 7,
        quality: 'SELL',
        status: 'available',
        sellerName: 'Suresh Patel',
        sellerPhone: '+91-9876543211',
        sellerEmail: 'farmer2@demo.com',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore, Karnataka
        imageUrl: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?q=80&w=1000&auto=format&fit=crop',
        basePrice: 35,
        pricingType: 'per_kg',
        alerts: ['💡 Better to buy now']
      },
      {
        farmer: farmerId,
        name: 'Mixed Vegetables',
        type: 'vegetable',
        quantity: 40,
        freshness: 7,
        damage: 3,
        expiryHours: 24,
        demand: 6,
        quality: 'SELL',
        status: 'available',
        sellerName: 'Anita Singh',
        sellerPhone: '+91-9876543212',
        sellerEmail: 'farmer3@demo.com',
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }, // Chennai, Tamil Nadu
        imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=1000&auto=format&fit=crop',
        basePrice: 45,
        pricingType: 'per_kg',
        alerts: ['⚠️ Expiring soon']
      },
      {
        farmer: farmerId,
        name: 'Organic Potatoes',
        type: 'vegetable',
        quantity: 60,
        freshness: 9,
        damage: 1,
        expiryHours: 96,
        demand: 9,
        quality: 'SELL',
        status: 'available',
        sellerName: 'Vikram Rao',
        sellerPhone: '+91-9876543213',
        sellerEmail: 'farmer4@demo.com',
        location: { type: 'Point', coordinates: [76.2711, 10.8505] }, // Kochi, Kerala
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1000&auto=format&fit=crop',
        basePrice: 20,
        pricingType: 'per_kg',
        alerts: []
      },
      {
        farmer: farmerId,
        name: 'Fresh Mangoes',
        type: 'fruit',
        quantity: 25,
        freshness: 9,
        damage: 1,
        expiryHours: 48,
        demand: 8,
        quality: 'SELL',
        status: 'available',
        sellerName: 'Karthik Reddy',
        sellerPhone: '+91-9876543214',
        sellerEmail: 'farmer5@demo.com',
        location: { type: 'Point', coordinates: [83.2185, 17.6868] }, // Visakhapatnam, Andhra Pradesh
        imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1000&auto=format&fit=crop',
        basePrice: 80,
        pricingType: 'per_kg',
        alerts: ['🌟 Premium quality available']
      },
      {
        farmer: farmerId,
        name: 'Green Spinach',
        type: 'vegetable',
        quantity: 35,
        freshness: 8,
        damage: 2,
        expiryHours: 24,
        demand: 6,
        quality: 'SELL',
        status: 'available',
        sellerName: 'Priya Nair',
        sellerPhone: '+91-9876543215',
        sellerEmail: 'farmer6@demo.com',
        location: { type: 'Point', coordinates: [74.8581, 12.9141] }, // Mangalore, Karnataka
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=1000&auto=format&fit=crop',
        basePrice: 40,
        pricingType: 'per_kg',
        alerts: ['🥬 Fresh harvest today']
      }
    ];

    for (const produceData of demoProduce) {
      await Produce.create(produceData);
    }

    console.log('✅ Demo data seeded successfully');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};

const start = async () => {
  try {
    // Try to connect to MongoDB if available (with timeout)
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      try {
        const connectPromise = mongoose.connect(mongoUri, { 
          useNewUrlParser: true, 
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000
        });
        
        // Wait max 3 seconds for connection
        await Promise.race([
          connectPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB timeout')), 3000))
        ]);
        
        console.log('Connected to MongoDB');
        
        // Seed demo data
        await seedDemoData();
      } catch (err) {
        console.log('📝 MongoDB not available - using in-memory mock auth for development');
      }
    } else {
      console.log('📝 MONGO_URI not set - using in-memory mock auth for development');
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`✅ U-FIN server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
