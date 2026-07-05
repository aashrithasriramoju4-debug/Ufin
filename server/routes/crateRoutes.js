const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Crate = require('../models/Crate');

// A) Generate QR
// GET /api/crate/qr/:crateId
router.get('/qr/:crateId', async (req, res) => {
  try {
    const { crateId } = req.params;
    const url = `http://localhost:5173/scan?crateId=${crateId}`;
    
    const qrCodeImage = await QRCode.toDataURL(url);
    res.status(200).json({ success: true, qrCode: qrCodeImage });
  } catch (error) {
    console.error('Error generating crate QR:', error);
    res.status(500).json({ success: false, message: 'Server error generating QR code' });
  }
});

// C) Scan / Update Status
// POST /api/crate/scan
router.post('/scan', async (req, res) => {
  try {
    const { crateId, status } = req.body;
    
    const crate = await Crate.findOne({ crateId });
    if (!crate) {
      return res.status(404).json({ success: false, message: 'Crate not found' });
    }

    crate.status = status;
    crate.history.push({ status, timestamp: new Date() });
    
    await crate.save();
    res.status(200).json({ success: true, crate });
  } catch (error) {
    console.error('Error updating crate status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// D) Get Crate Details
// GET /api/crate/:crateId
router.get('/:crateId', async (req, res) => {
  try {
    const { crateId } = req.params;
    const crate = await Crate.findOne({ crateId });
    
    if (!crate) {
      return res.status(404).json({ success: false, message: 'Crate not found' });
    }

    res.status(200).json({ success: true, crate });
  } catch (error) {
    console.error('Error fetching crate details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching details' });
  }
});

module.exports = router;
