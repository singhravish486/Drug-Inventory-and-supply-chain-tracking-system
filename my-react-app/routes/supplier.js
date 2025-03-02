const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Add routes for supplier
router.get('/materials', auth, async (req, res) => {
  try {
    res.json({ message: 'Supplier materials endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 