const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Add routes for manufacturer
router.get('/drugs', auth, async (req, res) => {
  try {
    res.json({ message: 'Manufacturer drugs endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 