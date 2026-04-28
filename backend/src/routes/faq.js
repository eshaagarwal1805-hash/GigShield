const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Faq = require("../models/Faq");

// GET all FAQs for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const faqs = await Faq.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new question
router.post("/", protect, async (req, res) => {
  try {
    const faq = await Faq.create({ userId: req.user._id, question: req.body.question });
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;