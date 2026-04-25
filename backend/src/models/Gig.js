const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  platform:    { type: String },
  startTime:   { type: Date, required: true },
  endTime:     { type: Date },
  hoursWorked: { type: Number },
  earnings:    { type: Number },
  status:      { type: String, enum: ['active','completed','disputed'], default: 'active' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  proof: {
    screenshots: [{ type: String }],
    notes:       { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);