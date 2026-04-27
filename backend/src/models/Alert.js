// backend/src/models/Alert.js
// Phase 2 — SOS events, safety warnings, and info broadcasts

const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["SOS", "warning", "info"],
      required: [true, "Alert type is required"],
    },
    location: {
      // GeoJSON Point (same convention as Gig.location)
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      label: {
        type: String,
        default: null, // e.g. "HSR Layout Sector 2, Bengaluru"
      },
    },
    message: {
      type: String,
      trim: true,
      default: null,
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto-set resolvedAt when resolved flips to true ───────────
alertSchema.pre("save", function (next) {
  if (this.isModified("resolved") && this.resolved && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────
// Primary query: all unresolved alerts for a user
alertSchema.index({ userId: 1, resolved: 1 });

// Admin dashboard: all active SOS events by time
alertSchema.index({ type: 1, resolved: 1, triggeredAt: -1 });

// Geo queries: alerts near a coordinate (heatmap, nearby warnings)
alertSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Alert", alertSchema);