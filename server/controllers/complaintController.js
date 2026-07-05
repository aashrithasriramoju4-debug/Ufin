const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const QRCode = require('qrcode');

const Farmer = require('../models/Farmer');

const updateFarmerTrust = async (farmerId) => {
  try {
    let farmer = null;
    if (farmerId && mongoose.Types.ObjectId.isValid(farmerId)) {
      farmer = await Farmer.findOne({ userId: farmerId }) || await Farmer.findById(farmerId);
    } else if (farmerId) {
      farmer = await Farmer.findOne({ name: new RegExp(farmerId.replace('demo_farmer_', 'Farmer '), 'i') });
    }
    
    if (!farmer) return;

    const complaints = await Complaint.countDocuments({ farmerId });
    const resolved = await Complaint.countDocuments({ farmerId, status: 'resolved' });
    
    // Logic: trustScore = 100 - (complaints * 2) + (resolved * 3) + (rating * 5)
    // Capped 0-100
    let score = 100 - (complaints * 2) + (resolved * 3) + (farmer.rating * 5);
    farmer.trustScore = Math.max(0, Math.min(100, score));
    farmer.complaintCount = complaints;
    farmer.resolvedCount = resolved;
    
    await farmer.save();
  } catch (error) {
    console.error('Error updating farmer trust:', error);
  }
};

exports.generateQR = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const url = `http://localhost:5173/report?farmerId=${farmerId}`;
    
    // Generate QR code as a base64 string
    const qrCodeImage = await QRCode.toDataURL(url);
    
    res.status(200).json({ success: true, qrCode: qrCodeImage });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ success: false, message: 'Server error generating QR code' });
  }
};

exports.submitComplaint = async (req, res) => {
  try {
    const { farmerId, message, rating = 4 } = req.body;
    
    if (!farmerId || !message) {
      return res.status(400).json({ success: false, message: 'farmerId and message are required' });
    }

    const msgLower = message.toLowerCase();
    
    // Categorization Logic
    let category = 'other';
    if (msgLower.includes('rotten') || msgLower.includes('bad') || msgLower.includes('quality')) {
      category = 'quality';
    } else if (msgLower.includes('late') || msgLower.includes('delay') || msgLower.includes('delivery')) {
      category = 'delivery';
    } else if (msgLower.includes('fake') || msgLower.includes('fraud') || msgLower.includes('scam')) {
      category = 'fraud';
    }

    // Sentiment Logic
    let sentiment = 'positive';
    const negativeWords = ['rotten', 'bad', 'late', 'delay', 'fake', 'fraud', 'scam', 'terrible', 'worst', 'poor', 'never'];
    const neutralWords = ['okay', 'fine', 'average', 'normal', 'alright'];
    
    const hasNegative = negativeWords.some(word => msgLower.includes(word));
    const hasNeutral = neutralWords.some(word => msgLower.includes(word));
    
    if (hasNegative) {
      sentiment = 'negative';
    } else if (hasNeutral) {
      sentiment = 'neutral';
    }

    const complaint = new Complaint({
      farmerId,
      message,
      category,
      sentiment
    });

    await complaint.save();
    await updateFarmerTrust(farmerId);

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ success: false, message: 'Server error submitting complaint' });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'resolved';
    await complaint.save();
    
    await updateFarmerTrust(complaint.farmerId);

    res.status(200).json({ success: true, message: 'Complaint resolved' });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ success: false, message: 'Server error resolving complaint' });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const complaints = await Complaint.find({ farmerId }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    console.error('Error getting complaints:', error);
    res.status(500).json({ success: false, message: 'Server error fetching complaints' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    
    // Aggregate category distribution
    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const complaintsPerCategory = categoryAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Aggregate sentiment distribution
    const sentimentAgg = await Complaint.aggregate([
      { $group: { _id: "$sentiment", count: { $sum: 1 } } }
    ]);
    const complaintsPerSentiment = sentimentAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Aggregate complaints per farmer
    const farmerAgg = await Complaint.aggregate([
      { $group: { _id: "$farmerId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalComplaints,
        complaintsPerCategory,
        complaintsPerSentiment,
        complaintsPerFarmer: farmerAgg
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};
