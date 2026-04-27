const express = require('express');
const router = express.Router();
const Gig = require('../models/Gig');
const Dashboard = require('../models/Dashboard');
const Transaction = require('../models/Transaction'); // Added this import
const { protect } = require('../middleware/authMiddleware');

// POST /api/gigs — start a new gig
router.post('/', protect, async (req, res) => {
  const { title, platform, location } = req.body;
  try {
    // 1. Check if user already has an active gig
    const activeGig = await Gig.findOne({ userId: req.user._id, status: 'active' });
    if (activeGig) {
      return res.status(400).json({ message: 'Please complete your current active gig first.' });
    }

    const gig = await Gig.create({
      userId: req.user._id,
      title, platform, location,
      startTime: new Date(),
      status: 'active'
    });

    await Dashboard.findOneAndUpdate(
      { userId: req.user._id },
      { activeGigId: gig._id, lastActiveDate: new Date(), $inc: { totalGigs: 1 } }
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

    // Update Gig fields
    gig.status = 'completed';
    gig.endTime = new Date();
    gig.earnings = earnings;
    
    // Save triggers the pre-save hook in models/Gig.js to calculate hoursWorked
    await gig.save();

    // 1. Update Dashboard
    await Dashboard.findOneAndUpdate(
      { userId: req.user._id },
      { 
        activeGigId: null, 
        $inc: { completedGigs: 1, totalEarnings: earnings } 
      }
    );

    // 2. Create financial Transaction record
    await Transaction.create({
      userId: req.user._id,
      relatedGigId: gig._id,
      amount: earnings,
      type: 'credit',
      source: gig.platform || 'General Gig',
      status: 'verified'
    });

    res.json(gig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;