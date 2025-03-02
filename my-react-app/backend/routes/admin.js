const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = {
      totalManufacturers: await User.countDocuments({ role: 'manufacturer' }),
      totalDistributors: await User.countDocuments({ role: 'distributor' }),
      totalPharmacies: await User.countDocuments({ role: 'pharmacy' }),
      totalRequests: await Request.countDocuments()
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 