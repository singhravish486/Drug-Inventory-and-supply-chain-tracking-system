const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true
  },
  composition: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial'
    },
    quantity: Number,
    unit: String
  }],
  dosageForm: {
    type: String,
    required: true
  },
  strength: String,
  price: {
    type: Number,
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

module.exports = mongoose.model('Drug', drugSchema); 