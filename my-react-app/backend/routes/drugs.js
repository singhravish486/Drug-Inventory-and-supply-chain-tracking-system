const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');
const auth = require('../middleware/auth');
const DrugCategory = require('../models/DrugCategory');

// Create a new drug
router.post('/', auth, async (req, res) => {
  try {
    const {
      drugName,
      category,
      description,
      composition,
      dosageForm,
      manufacturer,
      manufacturingDate,
      expiryDate,
      price
    } = req.body;

    // Validate category exists
    const existingCategory = await DrugCategory.findById(category);
    if (!existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    const drug = new Drug({
      drugName,
      category,
      description,
      composition,
      dosageForm,
      manufacturer,
      manufacturingDate,
      expiryDate,
      price,
      stock: req.body.stock || 0,
      createdBy: req.user.userId
    });

    const savedDrug = await drug.save();
    await savedDrug.populate('category', 'categoryName');

    res.status(201).json({
      success: true,
      drug: savedDrug
    });
  } catch (error) {
    console.error('Error creating drug:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create drug'
    });
  }
});

// Get all drugs
router.get('/', auth, async (req, res) => {
  try {
    const drugs = await Drug.find()
      .populate('category', 'categoryName')
      .populate('createdBy', 'name organizationName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      drugs
    });
  } catch (error) {
    console.error('Error fetching drugs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drugs'
    });
  }
});

module.exports = router; 