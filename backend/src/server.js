const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security: Rate limiting for auth endpoints (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please try again later.' }
});

app.use(generalLimiter);

// ── Core Worker Routes ─────────────────────────────────────────
app.use('/api/auth',      authLimiter, require('./routes/auth'));
app.use('/api/user',      require('./routes/account'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/gigs',      require('./routes/gigs'));
app.use('/api/safety',    require('./routes/safety'));
app.use('/api/faq',       require('./routes/faq'));

// ── Employer / Jobs Routes ─────────────────────────────────────
app.use('/api/employer', require('./routes/employer'));

// ── Public Jobs API (Worker Dashboard) ─────────────────────────
const JobPosting = require('./models/Jobposting');
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await JobPosting.find({ status: 'open' })
      .populate('employerId', 'companyName industry')
      .sort({ postedAt: -1 })
      .limit(50);
    res.status(200).json(jobs);
  } catch (err) {
    console.error('GET /api/jobs error:', err);
    res.status(500).json({ message: 'Failed to fetch job listings' });
  }
});

// ── Phase 2 Features (Enabled) ─────────────────────────────────
app.use('/api/transactions', require('./routes/transactions')); // ← fixed (was pointing to a Model)

// ── Health Check & Root ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'GigShield API 🚀', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {                                        // ← fixed (was `'*'`)
  res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GigShield API running on port ${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'localhost:3000'}`);
});