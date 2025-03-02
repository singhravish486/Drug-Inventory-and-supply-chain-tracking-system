const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RawMaterial = require('../models/RawMaterial');

// Get supplier's inventory
router.get('/inventory', auth, async (req, res) => {
  try {
    const inventory = await RawMaterial.find({ supplier: req.user.id });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new material
router.post('/inventory', auth, async (req, res) => {
  try {
    const material = new RawMaterial({
      ...req.body,
      supplier: req.user.id,
      status: req.body.quantity <= 100 ? 'low' : 'available'
    });
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 