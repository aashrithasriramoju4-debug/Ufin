require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const produceRoutes = require('./routes/produce');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.send('U-FIN Backend is running. Use /api/health.'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'u-fin backend' }));

const start = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not set');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`U-FIN server running on ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
