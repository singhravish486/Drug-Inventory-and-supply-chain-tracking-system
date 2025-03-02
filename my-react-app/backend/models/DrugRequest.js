const mongoose = require('mongoose');

const drugRequestSchema = new mongoose.Schema({
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  drugName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  requiredBy: {
    type: Date,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestType: {
    type: String,
    enum: ['distributor_request', 'pharmacy_request'],
    required: true,
    default: 'pharmacy_request'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DrugRequest', drugRequestSchema); 