const express = require('express');
const router = express.Router();
const DrugRequest = require('../models/DrugRequest');
const auth = require('../middleware/auth');

// Create drug request
router.post('/', auth, async (req, res) => {
  try {
    const {
      manufacturerId,
      drugName,
      quantity,
      requiredBy,
      notes
    } = req.body;

    const request = new DrugRequest({
      manufacturer: manufacturerId,
      distributor: req.user.userId,
      drugName,
      quantity,
      requiredBy,
      notes
    });

    const savedRequest = await request.save();
    await savedRequest.populate([
      { path: 'manufacturer', select: 'name organizationName email' },
      { path: 'distributor', select: 'name organizationName email' }
    ]);

    res.status(201).json({
      success: true,
      request: savedRequest
    });
  } catch (error) {
    console.error('Error creating drug request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create request'
    });
  }
});

// Get manufacturer's requests
router.get('/manufacturer', auth, async (req, res) => {
  try {
    const requests = await DrugRequest.find({ manufacturer: req.user.userId })
      .populate('distributor', 'name organizationName email')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

// Update request status
router.patch('/:requestId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { requestId } = req.params;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find the request
    const request = await DrugRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization based on user role and request type
    const isAuthorized = 
      (req.user.role === 'manufacturer' && request.manufacturer.toString() === req.user.userId) ||
      (req.user.role === 'distributor' && request.distributor.toString() === req.user.userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Update the request status
    request.status = status;
    await request.save();

    // Populate the response data
    await request.populate([
      { path: 'manufacturer', select: 'name organizationName email' },
      { path: 'distributor', select: 'name organizationName email' }
    ]);

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request: request
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status',
      error: error.message
    });
  }
});

// Create pharmacy drug request
router.post('/pharmacy', auth, async (req, res) => {
  try {
    const {
      distributorId,
      drugName,
      quantity,
      requiredBy,
      notes
    } = req.body;

    // Validate required fields
    if (!distributorId || !drugName || !quantity || !requiredBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const request = new DrugRequest({
      distributor: distributorId,
      pharmacy: req.user.userId,
      drugName,
      quantity,
      requiredBy: new Date(requiredBy),
      notes,
      requestType: 'pharmacy_request'
    });

    const savedRequest = await request.save();
    
    // Populate the saved request
    await savedRequest.populate([
      { path: 'distributor', select: 'name organizationName email' },
      { path: 'pharmacy', select: 'name organizationName email' }
    ]);

    res.status(201).json({
      success: true,
      request: savedRequest
    });
  } catch (error) {
    console.error('Error creating pharmacy drug request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create request',
      details: error.errors
    });
  }
});

// Get pharmacy's requests
router.get('/pharmacy', auth, async (req, res) => {
  try {
    const requests = await DrugRequest.find({ pharmacy: req.user.userId })
      .populate('distributor', 'name organizationName email')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching pharmacy requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

// Get distributor's requests
router.get('/distributor', auth, async (req, res) => {
  try {
    const requests = await DrugRequest.find({ 
      distributor: req.user.userId,
      type: 'pharmacy_request'
    })
    .populate('pharmacy', 'name organizationName email')
    .sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching distributor requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

module.exports = router; 