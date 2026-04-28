// backend/src/models/Application.js

const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // Worker who applied (GigShield User with role: 'worker')
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Job being applied to (your employer Job model)
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    // Employer who owns the job (denormalized for fast queries)
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer", // or "User" if you store employers in User
      required: true,
    },

    // Optional short message / cover note
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Expected daily pay or shift pay from worker’s side (optional)
    expectedPay: {
      type: Number,
      min: 0,
    },

    // Shift preference (e.g. "Day", "Night", "Flexible")
    shiftPreference: {
      type: String,
      enum: ["Day", "Night", "Flexible", "Not specified"],
      default: "Not specified",
    },

    // Status of application
    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected", "Hired"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Each worker should apply only once per job (prevent duplicates)
applicationSchema.index({ worker: 1, job: 1 }, { unique: true });

// Fast lookup by employer for dashboard
applicationSchema.index({ employer: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);