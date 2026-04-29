const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    relatedGigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      default: null, // null for non-gig transactions (e.g. bonus, penalty)
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: [true, "Transaction type is required"],
    },
    source: {
      type: String,
      trim: true,
      default: null,  // Platform name: "Swiggy", "Uber", "GigShield Bonus", etc.
    },
    status: {
      type: String,
      enum: ["pending", "verified", "disputed"],
      default: "pending",
    },
  },
  {
    timestamps: true,  // createdAt only needed per schema, but updatedAt is free
  }
);

// ── Indexes ───────────────────────────────────────────────────

// Most common query: all transactions for a user, newest first
transactionSchema.index({ userId: 1, createdAt: -1 });

// Filter by status (e.g. all disputed transactions for admin review)
transactionSchema.index({ status: 1 });

// Lookup by gig (when completing a gig, find its transaction)
transactionSchema.index({ relatedGigId: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);