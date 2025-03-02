const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DrugCategory',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  composition: {
    type: String,
    required: true
  },
  dosageForm: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  }
});

module.exports = mongoose.model('Drug', drugSchema); 
module.exports = mongoose.model('Drug', drugSchema); 