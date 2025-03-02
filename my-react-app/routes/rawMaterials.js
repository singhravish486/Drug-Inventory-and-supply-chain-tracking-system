const express = require('express');
const router = express.Router();
const RawMaterial = require('../models/RawMaterial');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Add new raw material
router.post('/', async (req, res) => {
  try {
    console.log('Received material data:', req.body);
    console.log('User from token:', req.user);

    const newMaterial = new RawMaterial({
      name: req.body.name,
      description: req.body.description,
      quantity: req.body.quantity,
      unit: req.body.unit,
      price: req.body.price || 0,
      supplier: req.user.userId,
      status: 'available'
    });

    const savedMaterial = await newMaterial.save();
    console.log('Material saved:', savedMaterial);

    res.status(201).json({
      success: true,
      message: 'Raw material added successfully',
      material: savedMaterial
    });
  } catch (error) {
    console.error('Error adding raw material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add raw material',
      error: error.message
    });
  }
});

// Get all raw materials for a supplier
router.get('/supplier/:supplierId', async (req, res) => {
  try {
    console.log('Fetching materials for supplier:', req.params.supplierId);
    const materials = await RawMaterial.find({ supplier: req.params.supplierId });
    console.log('Found materials:', materials);
    
    res.json({
      success: true,
      materials
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch raw materials',
      error: error.message
    });
  }
});

module.exports = router;