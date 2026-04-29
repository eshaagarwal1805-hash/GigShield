const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    // Optional: explicit role for clarity
    role: {
      type: String,
      default: "admin",
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index by email for login and uniqueness
adminSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Admin", adminSchema);