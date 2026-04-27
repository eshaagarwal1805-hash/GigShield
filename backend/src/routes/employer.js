const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Employer = require('../models/Employer');
const JobPosting = require('../models/Jobposting');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// ─── POST /api/employer/register ─────────────────────────────────────────────
// Public — create a new employer account
router.post('/register', async (req, res) => {
  try {
    const { companyName, email, phone, password, industry } = req.body;

    // Basic field validation
    if (!companyName || !email || !phone || !password) {
      return res.status(400).json({ message: 'companyName, email, phone, and password are required.' });
    }

    // Duplicate email check
    const existing = await Employer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An employer account with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save the employer document
    const employer = await Employer.create({
      companyName,
      email,
      phone,
      passwordHash,
      industry,
    });

    // Sign JWT
    const token = jwt.sign(
      { id: employer._id, role: 'employer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token + employer (without passwordHash)
    const { passwordHash: _omit, ...employerObj } = employer.toObject();
    return res.status(201).json({ token, employer: employerObj });
  } catch (err) {
    console.error('Employer register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ─── POST /api/employer/login ─────────────────────────────────────────────────
// Public — authenticate an employer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const employer = await Employer.findOne({ email: email.toLowerCase() });
    if (!employer) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, employer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: employer._id, role: 'employer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _omit, ...employerObj } = employer.toObject();
    return res.status(200).json({ token, employer: employerObj });
  } catch (err) {
    console.error('Employer login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// ─── POST /api/employer/jobs ──────────────────────────────────────────────────
// Protected — create a new job posting for the authenticated employer
router.post('/jobs', protect, async (req, res) => {
  try {
    const { title, platform, pay, location, description } = req.body;

    if (!title || !platform || pay == null || !location || !description) {
      return res.status(400).json({ message: 'title, platform, pay, location, and description are required.' });
    }

    const job = await JobPosting.create({
      employerId: req.user.id,
      title,
      platform,
      pay,
      location,
      description,
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    return res.status(500).json({ message: 'Server error while creating job posting.' });
  }
});

// ─── GET /api/employer/jobs ───────────────────────────────────────────────────
// Protected — list all job postings belonging to the authenticated employer
router.get('/jobs', protect, async (req, res) => {
  try {
    const jobs = await JobPosting.find({ employerId: req.user.id }).sort({ postedAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error('Fetch employer jobs error:', err);
    return res.status(500).json({ message: 'Server error while fetching job postings.' });
  }
});

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
// Public — list all open job postings (mounted under /api/employer, so the
// full path becomes /api/employer/open-jobs when reached via /api/employer).
// Because server.js mounts this router at /api/employer, we expose a separate
// top-level public path by exporting a second mini-router below.
// See the server.js note at the bottom of this file.
router.get('/open-jobs', async (req, res) => {
  try {
    const jobs = await JobPosting.find({ status: 'open' })
      .populate('employerId', 'companyName industry')
      .sort({ postedAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error('Fetch open jobs error:', err);
    return res.status(500).json({ message: 'Server error while fetching open jobs.' });
  }
});

module.exports = router;