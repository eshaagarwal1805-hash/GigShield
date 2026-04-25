const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['SOS','warning','info'], required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  message:    { type: String },
  resolved:   { type: Boolean, default: false },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);