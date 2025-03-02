const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderType: {
    type: String,
    enum: ['raw_material', 'drug'],
    required: true
  },
  from: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: String
  },
  to: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: String
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'orderType'
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'shipped', 'delivered'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Order', orderSchema); 