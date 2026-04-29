const express = require('express');
const router = express.Router();

const Alert = require('../models/Alert');
const RiskReport = require('../models/RiskReport');
const { protect } = require('../middleware/authMiddleware');

// ── POST /api/safety/sos — Trigger SOS ───────────────────────
router.post('/sos', protect, async (req, res) => {
  try {
    const { location, message, onShift } = req.body;
    const [lng, lat] = location.coordinates;

    // Check if there is already an active SOS for this user
    const existing = await Alert.findOne({
      userId: req.user._id,
      type: 'SOS',
      resolved: false,
    });

    if (existing) {
      return res.status(400).json({
        message: 'An SOS alert is already active.',
        alert: existing,
      });
    }

    // Default fallback: generic emergency info
    let nearestService = {
      name: 'India Emergency Services',
      address: 'Dial 112 for immediate assistance',
      type: 'Emergency',
      emergencyNumber: '112',
      lat: '',
      lng: '',
    };

    // Try to find nearest police station using OpenStreetMap Nominatim
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=police+station&lat=${lat}&lon=${lng}&format=json&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'GigShield/1.0' } }
      );
      const geoData = await geoRes.json();

      if (geoData?.[0]) {
        nearestService = {
          name: geoData[0].display_name.split(',')[0],
          address: geoData[0].display_name,
          type: 'Police Station',
          emergencyNumber: '112',
          lat: geoData[0].lat,
          lng: geoData[0].lon,
        };
      }
    } catch (geoErr) {
      console.error('Nearest service lookup failed:', geoErr.message);
    }

    const alert = await Alert.create({
      userId: req.user._id,
      type: 'SOS',
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        label: location.label || null,
      },
      message: message || null,
      onShift: onShift ?? false,   // <— keep onShift support
      nearestService,
    });

    res.status(201).json(alert);
  } catch (err) {
    console.error('SOS trigger error:', err);
    res.status(500).json({
      message: 'Failed to create SOS alert',
      error: err.message,
    });
  }
});

// ── GET /api/safety/sos/active ────────────────────────────────
router.get('/sos/active', protect, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      userId: req.user._id,
      type: 'SOS',
      resolved: false,
    }).sort({ createdAt: -1 });

    res.json(alert || null);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch active SOS',
      error: err.message,
    });
  }
});

// ── PATCH /api/safety/sos/:id/resolve ────────────────────────
router.patch('/sos/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, type: 'SOS' },
      { resolved: true, resolvedAt: new Date() }, // we also have pre-save, but this is fine
      { new: true }                               // returnDocument:'after' equivalent
    );

    if (!alert) {
      return res.status(404).json({
        message: 'Alert not found or not authorized.',
      });
    }

    res.json(alert);
  } catch (err) {
    console.error('SOS resolve error:', err);
    res.status(500).json({
      message: 'Failed to resolve SOS',
      error: err.message,
    });
  }
});

// ── GET /api/safety/sos/history ───────────────────────────────
router.get('/sos/history', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({
      userId: req.user._id,
      type: 'SOS',
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(alerts);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch SOS history',
      error: err.message,
    });
  }
});

// ── POST /api/safety/report ───────────────────────────────────
router.post('/report', async (req, res) => {
  try {
    const { description, category, location } = req.body;

    const report = await RiskReport.create({
      description,
      category,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to submit risk report',
      error: err.message,
    });
  }
});

// ── GET /api/safety/heatmap ───────────────────────────────────
router.get('/heatmap', async (req, res) => {
  try {
    const reports = await RiskReport.find(
      {},
      'location category reportedAt'
    );
    res.json(reports);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch heatmap data',
      error: err.message,
    });
  }
});

// ── GET /api/safety/nearby ────────────────────────────────────
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lng, lat, radius = 5000 } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ message: 'lng and lat are required' });
    }

    const reports = await RiskReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    }).limit(10);

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/safety/alerts/nearby ────────────────────────────
router.get('/alerts/nearby', protect, async (req, res) => {
  try {
    const { lng, lat, radius = 3000 } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ message: 'lng and lat are required' });
    }

    const since = new Date(Date.now() - 30 * 60 * 1000); // last 30 mins

    const alerts = await Alert.find({
      resolved: false,
      triggeredAt: { $gte: since },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .select('type message location triggeredAt')
      .limit(10);

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;