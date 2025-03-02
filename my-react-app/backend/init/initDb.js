const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const RawMaterial = require('../models/RawMaterial');
const Drug = require('../models/Drug');
const Batch = require('../models/Batch');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await RawMaterial.deleteMany({});
    await Drug.deleteMany({});
    await Batch.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        username: 'admin1',
        email: 'admin@pharmachain.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      },
      {
        username: 'supplier1',
        email: 'supplier@rawmaterials.com',
        password: hashedPassword,
        role: 'supplier',
        organizationName: 'Global Raw Materials Ltd',
        status: 'active'
      },
      {
        username: 'manufacturer1',
        email: 'manufacturer@drugco.com',
        password: hashedPassword,
        role: 'manufacturer',
        organizationName: 'DrugCo Pharmaceuticals',
        status: 'active'
      }
    ]);

    // Create raw materials
    const rawMaterials = await RawMaterial.insertMany([
      {
        name: 'Paracetamol API',
        description: 'Active Pharmaceutical Ingredient for Paracetamol',
        quantity: 5000,
        unit: 'kg',
        price: 800,
        manufacturer: 'Global Raw Materials Ltd',
        batchNumber: 'RM-PCM-001',
        status: 'available',
        supplier: users[1]._id // supplier1
      }
    ]);

    console.log('Database initialized successfully');
    console.log('\nTest Credentials:');
    console.log('------------------');
    console.log('Admin: admin@pharmachain.com / password123');
    console.log('Supplier: supplier@rawmaterials.com / password123');
    console.log('Manufacturer: manufacturer@drugco.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 