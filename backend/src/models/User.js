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
      required: function () {
        // Required only for workers, not for employer
        return this.role === "worker";
      },
      enum: ["Delivery", "Driver", "Freelancer", "Domestic", "Construction", "Other"],
      set: (v) =>
        v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v,
    },
    role: {
      type: String,
      enum: ["worker", "employer"],
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
    timestamps: true,
  }
);

// Indexes
userSchema.index({ workerType: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);