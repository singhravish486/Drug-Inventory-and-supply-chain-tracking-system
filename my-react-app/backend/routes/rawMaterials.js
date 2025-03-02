const express = require('express');
const router = express.Router();
const RawMaterial = require('../models/RawMaterial');
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');

// Add new raw material
router.post('/', auth, async (req, res) => {
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
router.get('/supplier/:supplierId', auth, async (req, res) => {
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

// Sell material route
router.post('/sell', auth, async (req, res) => {
  try {
    const { materialId, manufacturerId, quantity, price } = req.body;
    // Validate input
    if (!materialId || !manufacturerId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the material
    const material = await RawMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if supplier owns this material
    if (material.supplier.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to sell this material'
      });
    }

    // Check if enough quantity is available
    if (material.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity available'
      });
    }

    // Update material quantity
    material.quantity -= quantity;
    await material.save();

    // Create sale record
    const sale = new Sale({
      material: materialId,
      supplier: req.user.userId,
      manufacturer: manufacturerId,
      quantity,
      price,
      totalAmount: quantity * price,
      date: new Date()
    });
    await sale.save();

    res.json({
      success: true,
      message: 'Material sold successfully',
      updatedMaterial: material,
      sale
    });
  } catch (error) {
    console.error('Error selling material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sell material',
      error: error.message
    });
  }
});

// Get sales reports
router.get('/sales-reports', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { supplier: req.user.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const sales = await Sale.find(query)
      .populate('material')
      .populate({
        path: 'manufacturer',
        select: 'username organizationName email'
      })
      .sort({ date: -1 });
    
    res.json({
      success: true,
      sales
    });
  } catch (error) {
    console.error('Error fetching sales reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales reports',
      error: error.message
    });
  }
});

module.exports = router;