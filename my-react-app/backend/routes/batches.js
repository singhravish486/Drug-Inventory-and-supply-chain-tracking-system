const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const DistributorReceivedBatch = require('../models/DistributorReceivedBatch');
const auth = require('../middleware/auth');
const BatchTransfer = require('../models/BatchTransfer');
const Drug = require('../models/Drug');
const PharmacyTransfer = require('../models/PharmacyTransfer');
const PharmacyReceivedDrug = require('../models/PharmacyReceivedDrug');

// Get batches for distributor
router.get('/distributor', auth, async (req, res) => {
  try {
    // Find all batches that have been transferred to this distributor
    const batches = await BatchTransfer.find({ 
      distributor: req.user.userId,
      status: { $ne: 'received' } // Don't show already received batches
    })
    .populate({
      path: 'batch',
      populate: {
        path: 'drug',
        select: 'drugName dosageForm'
      }
    })
    .populate('manufacturer', 'name organizationName')
    .sort({ transferDate: -1 });

    // Map the data to match the expected format
    const formattedBatches = batches.map(transfer => ({
      transferId: transfer._id,
      _id: transfer.batch._id,
      batchNumber: transfer.batch.batchNumber,
      drug: transfer.batch.drug,
      manufacturer: transfer.manufacturer,
      quantity: transfer.quantity,
      manufacturingDate: transfer.batch.manufacturingDate,
      expiryDate: transfer.batch.expiryDate,
      unitPrice: transfer.batch.unitPrice,
      status: 'pending'
    }));

    res.json({
      success: true,
      batches: formattedBatches
    });
  } catch (error) {
    console.error('Error fetching distributor batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches'
    });
  }
});

// Create a new batch
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received batch data:', req.body);
    const {
      drugId,
      manufacturingDate,
      expiryDate,
      quantity,
      unitPrice
    } = req.body;

    // Generate batch number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await Batch.countDocuments() + 1;
    const batchNumber = `B${year}${month}-${count.toString().padStart(4, '0')}`;

    const batch = new Batch({
      batchNumber,
      drug: drugId,
      manufacturer: req.user.userId,
      manufacturingDate,
      expiryDate,
      quantity,
      unitPrice
    });

    console.log('Creating batch:', batch);

    const savedBatch = await batch.save();

    // Update drug stock
    const drug = await Drug.findById(drugId);
    if (drug) {
      drug.stock = (drug.stock || 0) + quantity;
      await drug.save();
    }

    await savedBatch.populate([
      { path: 'drug', select: 'drugName dosageForm' },
      { path: 'manufacturer', select: 'name organizationName' }
    ]);

    res.status(201).json({
      success: true,
      batch: savedBatch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create batch'
    });
  }
});

// Get manufacturer's batches
router.get('/manufacturer', auth, async (req, res) => {
  try {
    console.log('Fetching batches for manufacturer:', req.user.userId);
    const batches = await Batch.find({ manufacturer: req.user.userId })
      .populate('drug', 'drugName dosageForm')
      .populate('manufacturer', 'name organizationName')
      .sort({ createdAt: -1 });

    console.log('Found batches:', batches);

    res.json({
      success: true,
      batches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches'
    });
  }
});

// Transfer batch to distributor
router.post('/transfer', auth, async (req, res) => {
  try {
    const { batchId, distributorId, quantity } = req.body;

    // Find the batch
    const batch = await Batch.findById(batchId)
      .populate('drug');
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Verify manufacturer owns this batch
    if (batch.manufacturer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to transfer this batch'
      });
    }

    // Update batch status
    batch.status = 'transferred';
    await batch.save();

    // Create transfer record
    const transfer = new BatchTransfer({
      batch: batchId,
      drug: batch.drug._id,
      manufacturer: req.user.userId,
      distributor: distributorId,
      quantity,
      transferDate: new Date()
    });

    await transfer.save();

    // Update drug stock
    const drug = await Drug.findById(batch.drug._id);
    if (drug) {
      drug.stock = (drug.stock || 0) - quantity;
      await drug.save();
    }

    res.json({
      success: true,
      message: 'Batch transferred successfully',
      transfer
    });
  } catch (error) {
    console.error('Error transferring batch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to transfer batch'
    });
  }
});

// Receive batch
router.post('/:batchId/receive', auth, async (req, res) => {
  try {
    console.log('Receiving batch transfer:', req.params.batchId);
    console.log('User:', req.user.userId);

    // Find the batch transfer first
    const batchTransfer = await BatchTransfer.findById(req.params.batchId)
      .populate({
        path: 'batch',
        populate: [
          { path: 'drug' },
          { path: 'manufacturer' }
        ]
      });

    if (!batchTransfer) {
      return res.status(404).json({
        success: false,
        message: 'Batch transfer not found'
      });
    }

    const batch = batchTransfer.batch;

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (batchTransfer.distributor.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to receive this batch'
      });
    }

    batchTransfer.status = 'received';
    await batchTransfer.save();

    // Create received batch record
    const receivedBatch = new DistributorReceivedBatch({
      batch: batch._id,
      distributor: req.user.userId,
      drug: batch.drug._id,
      manufacturer: batch.manufacturer._id,
      quantity: batchTransfer.quantity,
      unitPrice: batch.unitPrice,
      totalValue: batchTransfer.quantity * batch.unitPrice
    });

    console.log('Creating received batch:', receivedBatch);

    await receivedBatch.save();

    // Update original batch status
    await Batch.findByIdAndUpdate(batch._id, { status: 'received' });

    res.json({
      success: true,
      message: 'Batch received successfully',
      receivedBatch: await receivedBatch.populate([
        { path: 'drug', select: 'drugName dosageForm' },
        { path: 'manufacturer', select: 'name organizationName' },
        { path: 'batch', select: 'batchNumber' }
      ])
    });
  } catch (error) {
    console.error('Error receiving batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to receive batch: ' + (error.message || 'Unknown error')
    });
  }
});

// Get distributor's received batches
router.get('/distributor/received', auth, async (req, res) => {
  try {
    const receivedBatches = await DistributorReceivedBatch.find({
      distributor: req.user.userId
    })
    .populate('batch', 'batchNumber')
    .populate('drug', 'drugName dosageForm')
    .populate('manufacturer', 'name organizationName')
    .sort({ receivedDate: -1 });

    res.json({
      success: true,
      receivedBatches
    });
  } catch (error) {
    console.error('Error fetching received batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch received batches'
    });
  }
});

// Transfer batch to pharmacy
router.post('/transfer-to-pharmacy', auth, async (req, res) => {
  let batch;
  try {
    const { batchId, pharmacyId, quantity } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    console.log('Transfer request received:', {
      batchId,
      pharmacyId,
      quantity,
      userId: req.user.userId
    });

    // Find the batch
    batch = await DistributorReceivedBatch.findById(batchId)
      .populate('drug')
      .populate('batch');
    
    if (!batch) {
      console.log('Batch not found:', batchId);
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    console.log('Found batch:', {
      id: batch._id,
      drug: batch.drug?._id,
      drugName: batch.drug?.drugName,
      batchNumber: batch.batch?.batchNumber,
      quantity: batch.quantity,
      distributor: batch.distributor
    });

    // Verify distributor owns this batch
    if (batch.distributor.toString() !== req.user.userId) {
      console.log('Authorization failed:', {
        batchDistributor: batch.distributor.toString(),
        requestingUser: req.user.userId
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to transfer this batch'
      });
    }

    // Check quantity
    if (batch.quantity < Number(quantity)) {
      console.log('Insufficient quantity:', {
        available: batch.quantity,
        requested: quantity
      });
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity available'
      });
    }

    // Update batch quantity
    batch.quantity -= Number(quantity);
    if (batch.quantity === 0) {
      batch.status = 'transferred';
    }
    await batch.save();

    try {
      // Create pharmacy received drug record
      const pharmacyDrug = new PharmacyReceivedDrug({
        pharmacy: pharmacyId,
        distributor: req.user.userId,
        drug: batch.drug._id,
        batch: batch.batch._id,
        quantity: Number(quantity),
        status: 'pending',
        transferDate: new Date()
      });

      console.log('Creating pharmacy drug record:', {
        pharmacy: pharmacyId,
        distributor: req.user.userId,
        drug: batch.drug._id,
        batch: batch.batch._id,
        quantity: Number(quantity)
      });

      await pharmacyDrug.save();

      // Populate the response data
      const populatedDrug = await PharmacyReceivedDrug.findById(pharmacyDrug._id)
        .populate('drug', 'drugName dosageForm')
        .populate('distributor', 'name organizationName')
        .populate('batch', 'batchNumber');

      res.json({
        success: true,
        message: 'Batch transferred to pharmacy successfully',
        pharmacyDrug: populatedDrug
      });
    } catch (saveError) {
      // If saving pharmacy drug fails, restore the batch quantity
      batch.quantity += Number(quantity);
      if (batch.status === 'transferred') {
        batch.status = 'in_stock';
      }
      await batch.save();
      
      throw saveError;
    }
  } catch (error) {
    console.error('Transfer error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      validationErrors: error.errors,
      requestBody: req.body
    });

    // If batch was already updated, try to restore it
    if (batch && batch.isModified('quantity')) {
      try {
        batch.quantity += Number(quantity);
        if (batch.status === 'transferred') {
          batch.status = 'in_stock';
        }
        await batch.save();
      } catch (restoreError) {
        console.error('Failed to restore batch quantity:', restoreError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to transfer batch: ' + error.message,
      validationErrors: error.errors
    });
  }
});

// Get pharmacy's received drugs
router.get('/pharmacy/received', auth, async (req, res) => {
  try {
    const receivedDrugs = await PharmacyReceivedDrug.find({
      pharmacy: req.user.userId
    })
    .populate('drug', 'drugName dosageForm')
    .populate('distributor', 'name organizationName')
    .populate('batch', 'batchNumber')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      receivedDrugs
    });
  } catch (error) {
    console.error('Error fetching received drugs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch received drugs'
    });
  }
});

// Receive drug
router.post('/pharmacy/:drugId/receive', auth, async (req, res) => {
  try {
    const drug = await PharmacyReceivedDrug.findById(req.params.drugId);
    
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found'
      });
    }

    if (drug.pharmacy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to receive this drug'
      });
    }

    drug.status = 'received';
    drug.receivedDate = new Date();
    await drug.save();

    res.json({
      success: true,
      message: 'Drug received successfully',
      drug
    });
  } catch (error) {
    console.error('Error receiving drug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to receive drug'
    });
  }
});

// Get pharmacy's stock
router.get('/pharmacy/stock', auth, async (req, res) => {
  try {
    const stock = await PharmacyReceivedDrug.find({
      pharmacy: req.user.userId,
      status: 'received'  // Only show received drugs
    })
    .populate('drug', 'drugName dosageForm')
    .populate('distributor', 'name organizationName')
    .populate('batch', 'batchNumber')
    .sort({ receivedDate: -1 });

    res.json({
      success: true,
      stock
    });
  } catch (error) {
    console.error('Error fetching pharmacy stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock'
    });
  }
});

module.exports = router; 