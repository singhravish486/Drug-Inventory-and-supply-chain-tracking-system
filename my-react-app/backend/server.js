const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// More detailed CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drug-categories', require('./routes/drugCategories'));
app.use('/api/drugs', require('./routes/drugs'));
app.use('/api/drug-transactions', require('./routes/drugTransactions'));
app.use('/api/drug-requests', require('./routes/drugRequests'));
app.use('/api/raw-materials', require('./routes/rawMaterials'));
app.use('/api/users', require('./routes/users'));
app.use('/api/material-requests', require('./routes/materialRequests'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/supplier', require('./routes/supplier'));
app.use('/api/manufacturer', require('./routes/manufacturer'));
app.use('/api/distributor', require('./routes/distributor'));
app.use('/api/pharmacy', require('./routes/pharmacy'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});