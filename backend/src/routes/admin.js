const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const Admin      = require('../models/Admin');
const User       = require('../models/User');
const Alert      = require('../models/Alert');
const SOSAlert   = require('../models/SOSAlerts');         
const JobPosting = require('../models/Jobposting');
const CommunityPost = require('../models/CommunityPost'); 
const Contact    = require('../models/ContactMessage');  

const router = express.Router();

// JWT helper
const generateToken = (id) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * POST /api/admin/register
 * Create a new admin account
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // 1) Check if ANY admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists. Only one admin account is allowed.' });
    }

    // 2) Also guard by email (defensive)
    const existsByEmail = await Admin.findOne({ email });
    if (existsByEmail) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      passwordHash,
    });

    const adminResponse = admin.toObject();
    delete adminResponse.passwordHash;

    const token = generateToken(admin._id);

    return res.status(201).json({ token, user: adminResponse });
  } catch (err) {
    console.error('Admin register error:', err);
    return res.status(500).json({ message: 'Failed to register admin.' });
  }
});

/**
 * GET /api/admin/stats
 * Overview stats for the admin dashboard
 * - totalWorkers
 * - totalEmployers
 * - activeSOS
 * - resolvedSOS
 * - totalPosts
 * - unreadMessages
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalWorkers,
      totalEmployers,
      totalAdmins,
      activeSOS,
      resolvedSOS,
      totalPosts,
      unreadMessages,
    ] = await Promise.all([
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'employer' }),
      Admin.countDocuments({}),
      Alert.countDocuments({ status: 'active' }),
      Alert.countDocuments({ status: 'resolved' }),
      CommunityPost.countDocuments({}),            
      Contact.countDocuments({ status: 'unread' }),  // unread contact messages
    ]);

    return res.json({
      totalWorkers,
      totalEmployers,
      activeSOS,
      resolvedSOS,
      totalPosts,
      unreadMessages,
      totalAdmins,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ message: 'Failed to fetch admin stats.' });
  }
});

/**
 * GET /api/admin/sos
 * List SOS alerts (for SOS tab)
 */
router.get('/sos', async (req, res) => {
  try {
    const alerts = await Alert.find({})
      .populate('userId', 'name email phone workerType')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(alerts);
  } catch (err) {
    console.error('Admin SOS error:', err);
    return res.status(500).json({ message: 'Failed to load SOS alerts.' });
  }
});

/**
 * GET /api/admin/workers
 * List worker users (for Workers tab)
 */
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json(workers);
  } catch (err) {
    console.error('Admin workers error:', err);
    return res.status(500).json({ message: 'Failed to load workers.' });
  }
});

/**
 * GET /api/admin/employers
 * List employers (for Employers tab)
 */
router.get('/employers', async (req, res) => {
  try {
    const employers = await User.find({ role: 'employer' })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json(employers);
  } catch (err) {
    console.error('Admin employers error:', err);
    return res.status(500).json({ message: 'Failed to load employers.' });
  }
});

/**
 * GET /api/admin/messages
 * Contact messages (Messages tab)
 */
router.get('/messages', async (req, res) => {
  try {
    const messages = await Contact.find({})
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json(messages);
  } catch (err) {
    console.error('Admin messages error:', err);
    return res.status(500).json({ message: 'Failed to load messages.' });
  }
});

/**
 * GET /api/admin/community
 * Community posts (optional extra endpoint)
 */
router.get('/community', async (req, res) => {
  try {
    const posts = await CommunityPost.find({})
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json(posts);
  } catch (err) {
    console.error('Admin community error:', err);
    return res.status(500).json({ message: 'Failed to load community posts.' });
  }
});

module.exports = router;