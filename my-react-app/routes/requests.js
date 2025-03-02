const router = require('express').Router();
const Request = require('../../my-react-app/models/Request');
const auth = require('../middleware/auth');

// Get all requests
router.get('/', auth, async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const requests = await Request.find({ status: req.params.status });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests by user role
router.get('/role/:role', auth, async (req, res) => {
  try {
    const requests = await Request.find({ 'from.role': req.params.role });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new request
router.post('/', async (req, res) => {
  try {
    const request = new Request(req.body);
    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 