const express = require('express');
const router = express.Router();
const MaterialRequest = require('../models/MaterialRequest');
const auth = require('../middleware/auth');

// Create a new material request
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('User from auth:', req.user);

    const { supplierId, materialName, quantity, requiredBy, notes } = req.body;

    if (!supplierId || !materialName || !quantity) {
      console.log('Missing fields:', { supplierId, materialName, quantity });
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${[
          !supplierId && 'supplierId',
          !materialName && 'materialName',
          !quantity && 'quantity'
        ].filter(Boolean).join(', ')}`
      });
    }

    // Ensure we have a valid manufacturer ID from auth
    if (!req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Manufacturer ID not found in auth token'
      });
    }

    // Validate quantity is a positive number
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    const materialRequest = new MaterialRequest({
      manufacturer: req.user.userId || req.user.id,
      supplier: supplierId,
      materialName,
      quantity: Number(quantity),
      requiredBy: new Date(requiredBy),
      notes,
      status: 'pending'
    });

    console.log('Creating material request:', materialRequest);

    const savedRequest = await materialRequest.save();

    await savedRequest.populate([
      { path: 'manufacturer', select: 'name organizationName email' },
      { path: 'supplier', select: 'name organizationName email' }
    ]);

    res.status(201).json({
      success: true,
      request: savedRequest
    });
  } catch (error) {
    console.error('Error creating material request:', error);
    // Send more detailed error message
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create material request: ' + error.message
    });
  }
});

// Get requests for manufacturer
router.get('/manufacturer', auth, async (req, res) => {
  try {
    const requests = await MaterialRequest.find({ manufacturer: req.user.userId })
      .populate('supplier', 'name organizationName email')
      .populate('manufacturer', 'name organizationName email')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching manufacturer requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

// Get requests for supplier
router.get('/supplier', auth, async (req, res) => {
  try {
    const requests = await MaterialRequest.find({ supplier: req.user.userId })
      .populate('manufacturer', 'name organizationName email')
      .populate('supplier', 'name organizationName email')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching supplier requests:', error);
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

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await MaterialRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.supplier.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    request.status = status;
    await request.save();

    await request.populate([
      { path: 'manufacturer', select: 'name organizationName email' },
      { path: 'supplier', select: 'name organizationName email' }
    ]);

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status'
    });
  }
});

module.exports = router; 