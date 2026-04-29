const express = require('express');
const router = express.Router();

const Dashboard = require('../models/Dashboard');
const Gig = require('../models/Gig');
const RiskReport = require('../models/RiskReport');
const Transaction = require('../models/Transaction'); // Added for complete earnings
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard - Complete user dashboard with earnings & safety
router.get('/', protect, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.user._id })
      .populate('activeGigId');

    // Today's earnings (gigs + manual transactions)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Gigs earnings
    const todayGigs = await Gig.find({
      userId: req.user._id,
      status: 'completed',
      endTime: { $gte: todayStart },
    });
    const todayGigsTotal = todayGigs.reduce((sum, g) => sum + (g.earnings || 0), 0);

    // Manual transactions (credits only)
    const todayTransactions = await Transaction.find({
      userId: req.user._id,
      type: 'credit',
      createdAt: { $gte: todayStart },
    });
    const todayManualTotal = todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const todayEarnings = todayGigsTotal + todayManualTotal;

    // Nearby risk reports (5km radius)
    let nearbyReports = [];
    const coords = dashboard?.lastKnownLocation?.coordinates;
    if (coords && coords[0] !== 0 && coords[1] !== 0) {
  try {
    nearbyReports = await RiskReport.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: 5000,
        },
      },
    }).sort({ reportedAt: -1 }).limit(5);
  } catch (e) {
    console.error("Nearby query failed:", e.message);
    nearbyReports = await RiskReport.find({}).sort({ reportedAt: -1 }).limit(5);
  }
}
    // Dynamic safety score (10 - 1.5 per nearby report, min 4)
    const safetyScore = Math.max(10 - nearbyReports.length * 1.5, 4).toFixed(1);

    res.json({
      dashboard,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        workerType: req.user.workerType,
      },
      todayEarnings,
      earningsBreakdown: {
        gigs: todayGigsTotal,
        manual: todayManualTotal,
      },
      nearbyReports,
      safetyScore: parseFloat(safetyScore),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/dashboard/status - Update location & activity
router.patch('/status', protect, async (req, res) => {
  try {
    const { location } = req.body;
    const update = { lastActiveDate: new Date() };

    if (location) {
      update.lastKnownLocation = {
        label: location.label,
        coordinates: location.coordinates,
        updatedAt: new Date(),
      };
    }

    const dashboard = await Dashboard.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { new: true, upsert: true } // Create if doesn't exist
    );

    res.json({ success: true, dashboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;