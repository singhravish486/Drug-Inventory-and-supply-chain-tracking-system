const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const DrugRequest = require('../models/DrugRequest');
const MaterialRequest = require('../models/MaterialRequest');

// Get all requests (for admin)
router.get('/', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view all requests'
      });
    }

    // Fetch drug requests
    const drugRequests = await DrugRequest.find()
      .populate('distributor', 'organizationName email')
      .populate('pharmacy', 'organizationName email')
      .populate('manufacturer', 'organizationName email')
      .sort({ requestDate: -1 });

    // Fetch material requests
    const materialRequests = await MaterialRequest.find()
      .populate('manufacturer', 'organizationName email')
      .populate('supplier', 'organizationName email')
      .sort({ requestDate: -1 });

    // Combine and format requests
    const allRequests = [
      ...drugRequests.map(req => ({
        ...req.toObject(),
        type: 'Drug Request',
        from: req.pharmacy || req.distributor,
        to: req.distributor || req.manufacturer
      })),
      ...materialRequests.map(req => ({
        ...req.toObject(),
        type: 'Material Request',
        from: req.manufacturer,
        to: req.supplier
      }))
    ].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    res.json({
      success: true,
      requests: allRequests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

module.exports = router;