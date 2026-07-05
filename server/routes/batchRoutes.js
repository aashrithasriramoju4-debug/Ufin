const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Crate = require('../models/Crate');

// POST /api/batch/create
router.post('/create', async (req, res) => {
  try {
    const { batchId, farmerId, product, totalQuantity, crateSize } = req.body;
    
    const totalCrates = Math.ceil(totalQuantity / crateSize);
    
    const newBatch = new Batch({
      batchId,
      farmerId,
      product,
      totalQuantity,
      crateSize,
      totalCrates
    });

    await newBatch.save();

    // Auto-generate crates
    const crates = [];
    for (let i = 1; i <= totalCrates; i++) {
      const crateId = `${batchId}_CR${i}`;
      crates.push({
        crateId,
        batchId,
        farmerId,
        product,
        quantity: i === totalCrates ? (totalQuantity % crateSize || crateSize) : crateSize,
        status: 'created',
        history: [{ status: 'created' }]
      });
    }

    await Crate.insertMany(crates);

    res.status(201).json({ success: true, batch: newBatch, crateCount: crates.length });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ success: false, message: 'Server error creating batch' });
  }
});

// GET /api/batch/:batchId
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    
    const crates = await Crate.find({ batchId });
    res.status(200).json({ success: true, batch, crates });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ success: false, message: 'Server error fetching batch details' });
  }
});

module.exports = router;
