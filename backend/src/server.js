const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ── Core routes ───────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/gigs',      require('./routes/gigs'));
app.use('/api/safety',    require('./routes/safety.js'));   // safety heatmap, SOS, report

// ── Employer / Jobs routes ─────────────────────────────────────
app.use('/api/employer',  require('./routes/employer'));    // /api/employer/login, register, jobs

// ── Public jobs alias ──────────────────────────────────────────
// GET /api/jobs  →  same handler as GET /api/employer/open-jobs
// Lets the worker dashboard call a clean /api/jobs endpoint
// without coupling it to the employer router path.
const JobPosting = require('./models/Jobposting');
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await JobPosting.find({ status: 'open' })
      .populate('employerId', 'companyName industry')
      .sort({ postedAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error('GET /api/jobs error:', err);
    return res.status(500).json({ message: 'Failed to fetch job listings.' });
  }
});

// ── Phase 2 (uncomment when ready) ────────────────────────────
// app.use('/api/alerts',       require('./routes/alerts'));
// app.use('/api/transactions', require('./routes/transactions'));

app.get('/', (_req, res) => res.send('GigShield API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));