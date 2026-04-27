// backend/src/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    workerType: {
      type: String,
      required: [true, "Worker type is required"],
      enum: ["Delivery", "Driver", "Freelancer", "Domestic", "Construction", "Other"],
      set: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v,
    },
    role: {
      type: String,
      enum: ["worker", "admin"],
      default: "worker",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ── Indexes ──────────────────────────────────────────────────
// email unique index is created by `unique: true` above.
// Compound index: workerType + role (for filtering workers by type and role)
userSchema.index({ workerType: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);