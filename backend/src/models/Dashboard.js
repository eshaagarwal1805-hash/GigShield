// backend/src/models/Dashboard.js

const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // enforces 1:1 with User
    },
    uniqueWorkerId: {
      type: String,
      unique: true,
      // Format: GS-IND-XXXXX  — generated on creation, see pre-save hook below
    },
    totalGigs: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedGigs: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeGigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      default: null,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto-generate uniqueWorkerId before first save ────────────
dashboardSchema.pre("save", async function (next) {
  if (!this.uniqueWorkerId) {
    // Generate a random 5-digit suffix, retry until unique
    let unique = false;
    while (!unique) {
      const suffix = Math.floor(10000 + Math.random() * 90000); // 10000–99999
      const candidate = `GS-IND-${suffix}`;
      const existing = await mongoose.model("Dashboard").findOne({
        uniqueWorkerId: candidate,
      });
      if (!existing) {
        this.uniqueWorkerId = candidate;
        unique = true;
      }
    }
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────
// userId unique index created by unique:true above.
// uniqueWorkerId unique index created by unique:true above.
dashboardSchema.index({ lastActiveDate: -1 }); // for sorting by recent activity

module.exports = mongoose.model("Dashboard", dashboardSchema);