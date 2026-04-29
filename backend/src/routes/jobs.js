const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Jobposting = require("../models/Jobposting");
const Application = require("../models/Application");

// ─────────────────────────────────────────────────────────────
//  GET /api/jobs  — fetch open job postings (worker view)
//  Query params:
//    search   — partial match on title or platform (case-insensitive)
//    location — partial match on location field   (case-insensitive)
// ─────────────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const { search, location } = req.query;

    const filter = { status: "open" };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title:    searchRegex },
        { platform: searchRegex },
      ];
    }

    if (location && location.trim()) {
      filter.location = new RegExp(location.trim(), "i");
    }

    const jobs = await Jobposting.find(filter)
      .sort({ postedAt: -1 })
      .lean();

    res.json(jobs);
  } catch (err) {
    console.error("GET /jobs error:", err);
    res.status(500).json({ message: "Failed to fetch jobs." });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/jobs/my-applications  — all applications by the
//  logged-in worker, newest first
// ─────────────────────────────────────────────────────────────
router.get("/my-applications", protect, async (req, res) => {
  try {
    const applications = await Application.find({ worker: req.user.id })
      .populate("job", "title platform location pay description")
      .sort({ createdAt: -1 })
      .lean();
    res.json(applications);
  } catch (err) {
    console.error("GET /jobs/my-applications error:", err);
    res.status(500).json({ message: "Failed to fetch applications." });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/jobs/:id/apply  — worker applies to a job posting
// ─────────────────────────────────────────────────────────────
router.post("/:id/apply", protect, async (req, res) => {
  try {
    const job = await Jobposting.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    if (job.status !== "open") {
      return res.status(400).json({ message: "This job is no longer accepting applications." });
    }

    // Duplicate-application guard (also enforced by unique index)
    const existing = await Application.findOne({
      worker: req.user.id,
      job: job._id,
    });
    if (existing) {
      return res.status(409).json({ message: "You have already applied to this job." });
    }

    const application = await Application.create({
      worker:   req.user.id,
      employer: job.employerId, // denormalised — required for employer-scoped queries
      job:      job._id,
      coverNote: req.body.coverNote || "",
    });

    res.status(201).json({
      message: "Application submitted successfully!",
      application,
    });
  } catch (err) {
    // Mongo duplicate-key error (race condition fallback)
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already applied to this job." });
    }
    console.error("POST /jobs/:id/apply error:", err);
    res.status(500).json({ message: "Failed to submit application." });
  }
});

module.exports = router;
