const mongoose = require('mongoose');

const riskReportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['theft', 'harassment', 'accident', 'road hazard', 'other'],
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
});

riskReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RiskReport', riskReportSchema);