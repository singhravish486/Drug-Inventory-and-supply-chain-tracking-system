const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user (for testing)
router.post('/test', async (req, res) => {
  try {
    const user = new User({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "supplier"
    });
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this route to get users by role
router.get('/role/:role', auth, async (req, res) => {
  try {
    const users = await User.find({ 
      role: req.params.role,
      status: 'active'
    }).select('-password');
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Add this route to get all manufacturers
router.get('/manufacturers', auth, async (req, res) => {
  try {
    const manufacturers = await User.find({ 
      role: 'manufacturer',
      status: 'active' 
    }).select('-password');
    
    res.json({
      success: true,
      data: manufacturers
    });
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manufacturers',
      error: error.message
    });
  }
});

// Get all users with stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access user stats'
      });
    }

    // Get counts for each role
    const [suppliers, manufacturers, distributors, pharmacies] = await Promise.all([
      User.countDocuments({ role: 'supplier', status: 'active' }),
      User.countDocuments({ role: 'manufacturer', status: 'active' }),
      User.countDocuments({ role: 'distributor', status: 'active' }),
      User.countDocuments({ role: 'pharmacy', status: 'active' })
    ]);

    // Get recent users for display
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        suppliers,
        manufacturers,
        distributors,
        pharmacies,
        totalUsers: suppliers + manufacturers + distributors + pharmacies
      },
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
});

module.exports = router; 