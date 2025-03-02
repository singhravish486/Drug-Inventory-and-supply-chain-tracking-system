const mongoose = require('mongoose');

const supplierInventorySchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  materialName: {
    type: String,
    required: true
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'units']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  manufacturer: String,
  batchNumber: String,
  manufacturingDate: Date,
  expiryDate: Date,
  status: {
    type: String,
    enum: ['available', 'low', 'out_of_stock'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

module.exports = mongoose.model('SupplierInventory', supplierInventorySchema); 