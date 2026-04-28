const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Faq", faqSchema);