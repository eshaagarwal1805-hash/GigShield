// backend/src/models/Gig.js

const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Gig title is required"],
      trim: true,
      default: "Shift", // sensible default so workers can start without a title
    },
    platform: {
      type: String,
      trim: true,
      default: null,
      // Examples: "Uber", "Swiggy", "Zomato", "Urban Company"
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    hoursWorked: {
      // Computed automatically when endTime is set (see pre-save hook)
      type: Number,
      default: 0,
      min: 0,
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "disputed"],
      default: "active",
    },
    location: {
      // GeoJSON Point — { lat, lng } stored as { coordinates: [lng, lat] }
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude] — GeoJSON standard order
        type: [Number],
        default: [0, 0],
      },
      // Human-readable label stored alongside coordinates
      label: {
        type: String,
        default: null,
      },
    },
    proof: {
      screenshots: {
        type: [String], // array of URLs
        default: [],
      },
      notes: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// ── Auto-compute hoursWorked when endTime is set ──────────────
gigSchema.pre("save", function (next) {
  if (this.endTime && this.startTime) {
    const ms = new Date(this.endTime) - new Date(this.startTime);
    this.hoursWorked = parseFloat((ms / 3600000).toFixed(2)); // hours, 2dp
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────
// Compound: userId + status  (most common query: "my active gigs")
gigSchema.index({ userId: 1, status: 1 });

// Platform index for analytics queries
gigSchema.index({ platform: 1 });

// 2dsphere for geo queries (nearby gigs, heatmaps)
gigSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Gig", gigSchema);