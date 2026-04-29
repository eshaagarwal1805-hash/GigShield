const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Denormalised employer ref — enables scoped queries in employer.js
    // e.g. Application.find({ employer: req.user.id })
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting", // matches mongoose.model('JobPosting', ...) in Jobposting.js
      required: true,
    },
    status: {
      type: String,
      // Capitalised to match employer dashboard actions and STATUS_COLORS map
      enum: ["Pending", "Shortlisted", "Hired", "Rejected"],
      default: "Pending",
    },
    coverNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Prevent a worker from applying to the same job twice
applicationSchema.index({ worker: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
