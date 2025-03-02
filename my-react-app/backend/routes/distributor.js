const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Add routes for distributor
router.get('/batches', auth, async (req, res) => {
  try {
    res.json({ message: 'Distributor batches endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 