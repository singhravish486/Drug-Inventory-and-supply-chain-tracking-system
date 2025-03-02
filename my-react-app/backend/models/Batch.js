const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    unique: true
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
  manufacturingDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
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
  status: {
    type: String,
    enum: ['manufactured', 'quality_check', 'ready', 'transferred', 'received'],
    default: 'manufactured'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique batch number before saving
batchSchema.pre('validate', async function(next) {
  if (this.isNew) {
    try {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const count = await this.constructor.countDocuments() + 1;
      this.batchNumber = `B${year}${month}-${count.toString().padStart(4, '0')}`;
      console.log('Generated batch number:', this.batchNumber);
    } catch (error) {
      console.error('Error generating batch number:', error);
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Batch', batchSchema); 