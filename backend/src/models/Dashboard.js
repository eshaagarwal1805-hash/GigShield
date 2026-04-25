const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  uniqueWorkerId: { type: String, unique: true },
  totalGigs:      { type: Number, default: 0 },
  completedGigs:  { type: Number, default: 0 },
  activeGigId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', default: null },
  totalEarnings:  { type: Number, default: 0 },
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  lastActive:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dashboard', dashboardSchema);