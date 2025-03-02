const mongoose = require('mongoose');

const pharmacyReceivedDrugSchema = new mongoose.Schema({
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  transferDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  receivedDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'received'],
    default: 'pending',
    required: true
  }
}, {
  timestamps: true
});

pharmacyReceivedDrugSchema.pre('validate', function(next) {
  if (this.quantity <= 0) {
    next(new Error('Quantity must be greater than 0'));
  }
  next();
});

pharmacyReceivedDrugSchema.pre('save', function(next) {
  if (this.status === 'received' && !this.receivedDate) {
    this.receivedDate = new Date();
  }
  next();
});

module.exports = mongoose.model('PharmacyReceivedDrug', pharmacyReceivedDrugSchema); 