const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET profile
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

// UPDATE profile (email, phone, name, workerType)
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, phone, workerType } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined && email !== user.email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (workerType !== undefined) user.workerType = workerType;

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (err) {

    // 🔥 IMPORTANT: handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already in use"
      });
    }

    return res.status(500).json({
      message: err.message
    });
  }
});

// CHANGE PASSWORD ONLY
router.put("/password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;