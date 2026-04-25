const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedGigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'INR' },
  type:         { type: String, enum: ['credit','debit'], required: true },
  source:       { type: String },
  status:       { type: String, enum: ['pending','verified','disputed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);