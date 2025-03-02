const mongoose = require('mongoose');

const distributorReceivedBatchSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug',
    required: true
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalValue: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['received', 'in_stock', 'transferred'],
    default: 'received'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DistributorReceivedBatch', distributorReceivedBatchSchema); 