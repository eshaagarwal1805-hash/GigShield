const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard');
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.user._id })
      .populate('activeGigId');
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;