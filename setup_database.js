const mongoose = require('mongoose');

// Connection URI
const MONGODB_URI = 'mongodb://127.0.0.1:27017/drug_supply_chain';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Collections
db.createCollection('users');
db.createCollection('raw_materials');
db.createCollection('drugs');
db.createCollection('batches');
db.createCollection('inventory');
db.createCollection('orders');

// Insert Initial Users
db.users.insertMany([
  {
    username: "admin1",
    email: "admin@pharmachain.com",
    password: "admin123",
    role: "admin",
    status: "active"
  },
  {
    username: "supplier1",
    email: "supplier@rawmaterials.com",
    password: "supplier123",
    role: "supplier",
    organizationName: "Global Raw Materials Ltd",
    phone: "+1234567890",
    status: "active"
  },
  {
    username: "manufacturer1",
    email: "manufacturer@drugco.com",
    password: "manufacturer123",
    role: "manufacturer",
    organizationName: "DrugCo Pharmaceuticals",
    phone: "+1234567891",
    status: "active"
  },
  {
    username: "distributor1",
    email: "distributor@medidist.com",
    password: "distributor123",
    role: "distributor",
    organizationName: "MediDist Solutions",
    phone: "+1234567892",
    status: "active"
  },
  {
    username: "pharmacy1",
    email: "pharmacy@healthplus.com",
    password: "pharmacy123",
    role: "pharmacy",
    organizationName: "HealthPlus Pharmacy",
    phone: "+1234567893",
    status: "active"
  }
]);

// Insert Raw Materials
db.raw_materials.insertMany([
  {
    name: "Paracetamol API",
    description: "Active Pharmaceutical Ingredient for Paracetamol",
    quantity: 5000,
    unit: "kg",
    price: 800,
    manufacturer: "Global Raw Materials Ltd",
    batchNumber: "RM-PCM-001",
    status: "available"
  },
  {
    name: "Amoxicillin API",
    description: "Active Pharmaceutical Ingredient for Amoxicillin",
    quantity: 3000,
    unit: "kg",
    price: 1200,
    manufacturer: "Global Raw Materials Ltd",
    batchNumber: "RM-AMX-001",
    status: "available"
  }
]);

// Insert Drugs
db.drugs.insertMany([
  {
    name: "Paracetamol 500mg",
    description: "Pain relief and fever reduction tablet",
    category: "Analgesics",
    dosageForm: "tablet",
    strength: "500mg",
    price: 50,
    approvalStatus: "approved"
  },
  {
    name: "Amoxicillin 250mg",
    description: "Antibiotic capsule",
    category: "Antibiotics",
    dosageForm: "capsule",
    strength: "250mg",
    price: 75,
    approvalStatus: "approved"
  }
]);

// Insert Batches
db.batches.insertMany([
  {
    batchNumber: "PCM-B001",
    quantity: 100000,
    status: "manufactured",
    price: 45000
  },
  {
    batchNumber: "AMX-B001",
    quantity: 50000,
    status: "manufactured",
    price: 35000
  }
]);

// Insert Inventory
db.inventory.insertMany([
  {
    quantity: 5000,
    status: "in_stock"
  },
  {
    quantity: 3000,
    status: "in_stock"
  }
]);

// Insert Orders
db.orders.insertMany([
  {
    orderType: "raw_material",
    quantity: 1000,
    price: 800,
    totalAmount: 800000,
    status: "pending",
    paymentStatus: "pending"
  }
]);

console.log('Database setup completed');