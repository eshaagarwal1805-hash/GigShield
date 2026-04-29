const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Employer = require('../models/Employer');
const JobPosting = require('../models/Jobposting');
const Application = require('../models/Application');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── POST /api/employer/register ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { companyName, email, phone, password, industry } = req.body;

    if (!companyName || !email || !phone || !password) {
      return res.status(400).json({ message: 'companyName, email, phone, and password are required.' });
    }

    const existing = await Employer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An employer account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const employer = await Employer.create({
      companyName,
      email,
      phone,
      passwordHash,
      industry,
    });

    const token = jwt.sign(
      { id: employer._id, role: 'employer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _omit, ...employerObj } = employer.toObject();
    return res.status(201).json({ token, employer: employerObj });
  } catch (err) {
    console.error('Employer register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ─── POST /api/employer/login ─────────────────────────────────────────────────
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

// ─── GET /api/employer/profile ────────────────────────────────────────────────
// Protected — return the authenticated employer's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const employer = await Employer.findById(req.user.id).select('-passwordHash');
    if (!employer) return res.status(404).json({ message: 'Employer not found.' });
    return res.status(200).json(employer);
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PATCH /api/employer/profile ──────────────────────────────────────────────
// Protected — update company profile fields
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['companyName', 'phone', 'industry'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const employer = await Employer.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!employer) return res.status(404).json({ message: 'Employer not found.' });
    return res.status(200).json(employer);
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ─── POST /api/employer/jobs ──────────────────────────────────────────────────
// Protected — create a new job posting
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

// ─── GET /api/employer/jobs/mine ─────────────────────────────────────────────
// Protected — list this employer's own postings
// NOTE: must be declared BEFORE /jobs/:id to avoid Express treating "mine" as an id
router.get('/jobs/mine', protect, async (req, res) => {
  try {
    const jobs = await JobPosting.find({ employerId: req.user.id }).sort({ postedAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error('Fetch jobs error:', err);
    return res.status(500).json({ message: 'Server error while fetching jobs.' });
  }
});

// ─── GET /api/employer/jobs ───────────────────────────────────────────────────
// Protected — same as /mine (kept for backward compat)
router.get('/jobs', protect, async (req, res) => {
  try {
    const jobs = await JobPosting.find({ employerId: req.user.id }).sort({ postedAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error('Fetch employer jobs error:', err);
    return res.status(500).json({ message: 'Server error while fetching job postings.' });
  }
});

// ─── GET /api/employer/open-jobs ─────────────────────────────────────────────
// Public — all open listings (for worker-facing browse page)
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

// ─── PATCH /api/employer/jobs/:id/status ─────────────────────────────────────
// Protected — toggle a job between 'open' and 'closed'
router.patch('/jobs/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ message: "status must be 'open' or 'closed'." });
    }

    const job = await JobPosting.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user.id }, // scoped to owner
      { $set: { status } },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: 'Job not found or not yours.' });
    return res.status(200).json(job);
  } catch (err) {
    console.error('Update job status error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ─── DELETE /api/employer/jobs/:id ───────────────────────────────────────────
// Protected — scoped to the owning employer
router.delete('/jobs/:id', protect, async (req, res) => {
  try {
    const job = await JobPosting.findOneAndDelete({
      _id: req.params.id,
      employerId: req.user.id,   // prevent cross-employer deletion
    });
    if (!job) return res.status(404).json({ message: 'Job not found or not yours.' });
    return res.status(200).json({ message: 'Job deleted.' });
  } catch (err) {
    console.error('Delete job error:', err);
    return res.status(500).json({ message: 'Server error while deleting job.' });
  }
});

// ─── GET /api/employer/applications/mine ─────────────────────────────────────
// Protected — all applications for this employer's jobs
router.get('/applications/mine', protect, async (req, res) => {
  try {
    // Application.employer (not employerId) — matches the model field name
    const apps = await Application.find({ employer: req.user.id })
      .populate('worker', 'name email phone')
      .populate('job', 'title platform pay location')
      .sort({ createdAt: -1 });

    return res.status(200).json(apps);
  } catch (err) {
    console.error('Fetch applications error:', err);
    return res.status(500).json({ message: 'Error fetching applications.' });
  }
});

// ─── PATCH /api/employer/applications/:id/status ─────────────────────────────
// Protected — move an application through its lifecycle
router.patch('/applications/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Shortlisted', 'Rejected', 'Hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, employer: req.user.id }, // scoped to owner
      { $set: { status } },
      { new: true }
    ).populate('worker', 'name email');

    if (!app) return res.status(404).json({ message: 'Application not found or not yours.' });
    return res.status(200).json(app);
  } catch (err) {
    console.error('Update application status error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
