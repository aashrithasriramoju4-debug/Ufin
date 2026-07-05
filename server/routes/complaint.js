const express = require('express');
const router = express.Router();
const { 
  generateQR, 
  submitComplaint, 
  getComplaints, 
  getAnalytics,
  resolveComplaint 
} = require('../controllers/complaintController');

// @route   GET /api/complaint/qr/:farmerId
// @desc    Generate QR code for a farmer
router.get('/qr/:farmerId', generateQR);

// @route   POST /api/complaint
// @desc    Submit a new complaint
router.post('/', submitComplaint);

// @route   GET /api/complaint/analytics
// @desc    Get analytics for complaints
// NOTE: /analytics must be defined BEFORE /:farmerId to prevent "analytics" being treated as farmerId
router.get('/analytics', getAnalytics);

// @route   PATCH /api/complaint/:id/resolve
// @desc    Resolve a complaint
router.patch('/:id/resolve', resolveComplaint);

// @route   GET /api/complaint/:farmerId
// @desc    Get all complaints for a specific farmer
router.get('/:farmerId', getComplaints);

module.exports = router;
