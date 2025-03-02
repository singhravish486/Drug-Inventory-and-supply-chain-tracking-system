const express = require('express');
const router = express.Router();
const DrugCategory = require('../models/DrugCategory');
const auth = require('../middleware/auth');

// Create a new drug category
router.post('/', auth, async (req, res) => {
  try {
    const { categoryName, description, status } = req.body;

    // Check if category already exists
    const existingCategory = await DrugCategory.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = new DrugCategory({
      categoryName,
      description,
      status,
      createdBy: req.user.userId
    });

    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      category: savedCategory
    });
  } catch (error) {
    console.error('Error creating drug category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create drug category'
    });
  }
});

// Get all drug categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await DrugCategory.find()
      .populate('createdBy', 'name organizationName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching drug categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drug categories'
    });
  }
});

module.exports = router; 