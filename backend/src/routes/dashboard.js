const express = require("express");
const router = express.Router();
const Dashboard = require("../models/Dashboard");
const Gig = require("../models/Gig");
const RiskReport = require("../models/RiskReport");
const { protect } = require("../middleware/authMiddleware");

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.user._id })
      .populate('activeGigId');

    // Today's earnings from completed gigs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayGigs = await Gig.find({
      userId: req.user._id,
      status: 'completed',
      endTime: { $gte: todayStart },
    });

    const todayEarnings = todayGigs.reduce((sum, g) => sum + (g.earnings || 0), 0);

    // Nearby risk reports (within 5km of last known location)
    let nearbyReports = [];
    const coords = dashboard?.lastKnownLocation?.coordinates;
    if (coords && coords[0] !== 0 && coords[1] !== 0) {
      nearbyReports = await RiskReport.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: coords },
            $maxDistance: 5000,
          },
        },
      }).limit(5);
    }

    // Safety score based on nearby reports
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
      nearbyReports,
      safetyScore: parseFloat(safetyScore),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/dashboard/status
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
      { new: true }
    );

    res.json({ success: true, dashboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;