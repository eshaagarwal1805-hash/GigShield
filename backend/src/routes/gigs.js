const express = require('express');
const router = express.Router();
const Gig = require('../models/Gig');
const Dashboard = require('../models/Dashboard');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

// POST /api/gigs/start
router.post('/start', protect, async (req, res) => {
  try {
    const existing = await Gig.findOne({ userId: req.user._id, status: 'active' });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active shift.' });
    }
    const gig = await Gig.create({
      userId: req.user._id,
      title: 'Shift',
      status: 'active',
      startTime: new Date(),
      location: {
        type: 'Point',
        coordinates: req.body.location?.coordinates || [0, 0],
        label: req.body.location?.label || '',
      },
    });
    await upsertDashboard(req.user._id, {
  activeGigId: gig._id,
  lastActiveDate: new Date(),
  $inc: { totalGigs: 1 },
  });
    res.status(201).json(gig);
  } catch (err) {
    console.error('Start shift error:', err);
    res.status(500).json({ message: 'Failed to start shift.' });
  }
});

// POST /api/gigs/stop
router.post('/stop', protect, async (req, res) => {
  try {
    const gig = await Gig.findOne({ userId: req.user._id, status: 'active' });
    if (!gig) return res.status(404).json({ message: 'No active shift found.' });
    gig.status   = 'completed';
    gig.endTime  = new Date();
    gig.earnings = req.body.earnings || 0;
    await gig.save();
    await upsertDashboard(req.user._id, {
      activeGigId: null,
      $inc: { completedGigs: 1, totalEarnings: gig.earnings },
    });
    await Transaction.create({
      userId: req.user._id,
      relatedGigId: gig._id,
      amount: gig.earnings,
      type: 'credit',
      source: gig.platform || 'General Gig',
      status: 'verified',
    });
    res.json(gig);
  } catch (err) {
    console.error('Stop shift error:', err);
    res.status(500).json({ message: 'Failed to stop shift.' });
  }
});

// GET /api/gigs/history
router.get('/history', protect, async (req, res) => {
  try {
    const gigs = await Gig.find({
      userId: req.user._id,
      status: 'completed',
      endTime: { $ne: null },
    }).sort({ startTime: -1 }).limit(50);
    res.json(gigs);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/gigs
router.get('/', protect, async (req, res) => {
  try {
    const gigs = await Gig.find({ userId: req.user._id }).sort({ startTime: -1 });
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/gigs/:id/complete
router.patch('/:id/complete', protect, async (req, res) => {
  const { earnings } = req.body;
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    gig.status   = 'completed';
    gig.endTime  = new Date();
    gig.earnings = earnings;
    await gig.save();
    await upsertDashboard(req.user._id, {
      activeGigId: null,
      $inc: { completedGigs: 1, totalEarnings: earnings },
    });
    await Transaction.create({
      userId: req.user._id,
      relatedGigId: gig._id,
      amount: earnings,
      type: 'credit',
      source: gig.platform || 'General Gig',
      status: 'verified',
    });
    res.json(gig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;