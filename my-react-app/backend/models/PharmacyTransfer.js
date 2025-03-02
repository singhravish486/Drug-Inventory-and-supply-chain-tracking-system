const mongoose = require('mongoose');

const pharmacyTransferSchema = new mongoose.Schema({
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
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'received'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Calculate total value before saving
pharmacyTransferSchema.pre('save', function(next) {
  if (this.quantity && this.unitPrice) {
    this.totalValue = this.quantity * this.unitPrice;
  }
  next();
});

module.exports = mongoose.model('PharmacyTransfer', pharmacyTransferSchema); 