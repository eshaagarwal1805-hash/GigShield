const express = require('express');
const router = express.Router();

const Alert = require('../models/Alert');
const RiskReport = require('../models/RiskReport');
const { protect } = require('../middleware/authMiddleware');

// POST /api/safety/sos — protected
router.post('/sos', protect, async (req, res) => {
  try {
    const { location, message } = req.body;

    const alert = new Alert({
      userId: req.user.id,
      type: 'SOS',
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      message,
    });

    const savedAlert = await alert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create SOS alert', error: error.message });
  }
});

// POST /api/safety/report — public
router.post('/report', async (req, res) => {
  try {
    const { description, category, location } = req.body;

    const report = new RiskReport({
      description,
      category,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit risk report', error: error.message });
  }
});

// GET /api/safety/nearby — protected
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lng, lat } = req.query;
    if (!lng || !lat) return res.status(400).json({ message: 'Coordinates required' });

    const reports = await RiskReport.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000,
        },
      },
    }).limit(5);

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/safety/heatmap — public
router.get('/heatmap', async (req, res) => {
  try {
    const reports = await RiskReport.find({}, 'location category reportedAt');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch heatmap data', error: error.message });
  }
});

module.exports = router;