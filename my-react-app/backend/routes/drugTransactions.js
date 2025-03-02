const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DrugTransaction = require('../models/DrugTransaction');

// Get drug transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await DrugTransaction.find()
      .populate('drug', 'drugName dosageForm')
      .sort({ date: -1 })
      .limit(180); // Last 6 months of data

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching drug transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

module.exports = router; 