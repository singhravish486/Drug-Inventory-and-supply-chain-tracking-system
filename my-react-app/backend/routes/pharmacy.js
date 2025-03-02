const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Add routes for pharmacy
router.get('/inventory', auth, async (req, res) => {
  try {
    res.json({ message: 'Pharmacy inventory endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 