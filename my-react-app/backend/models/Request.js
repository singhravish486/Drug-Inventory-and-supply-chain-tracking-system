const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['Drug Request', 'Drug Approval', 'Supply Request']
  },
  from: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true }
  },
  details: {
    drugName: String,
    quantity: String,
    category: String,
    urgency: String,
    date: { type: Date, default: Date.now },
    description: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema); 