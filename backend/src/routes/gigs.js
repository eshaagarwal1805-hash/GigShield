const express = require('express');
const router = express.Router();
const Gig = require('../models/Gig');
const Dashboard = require('../models/Dashboard');
const { protect } = require('../middleware/authMiddleware');

// GET /api/gigs — get all gigs for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const gigs = await Gig.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gigs — start a new gig
router.post('/', protect, async (req, res) => {
  const { title, platform, location } = req.body;
  try {
    const gig = await Gig.create({
      userId: req.user._id,
      title, platform, location,
      startTime: new Date(),
      status: 'active'
    });
    await Dashboard.findOneAndUpdate(
      { userId: req.user._id },
      { activeGigId: gig._id, lastActive: new Date(), $inc: { totalGigs: 1 } }
    );
    res.status(201).json(gig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/gigs/:id/complete — complete a gig
router.patch('/:id/complete', protect, async (req, res) => {
  const { earnings } = req.body;
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    gig.status = 'completed';
    gig.endTime = new Date();
    gig.earnings = earnings;
    gig.hoursWorked = ((gig.endTime - gig.startTime) / 3600000).toFixed(2);
    await gig.save();

    await Dashboard.findOneAndUpdate(
      { userId: req.user._id },
      { activeGigId: null, $inc: { completedGigs: 1, totalEarnings: earnings } }
    );
    res.json(gig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;