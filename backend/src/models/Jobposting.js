const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  platform: {
    type: String,
    required: true,
    trim: true,
    // e.g. 'Swiggy', 'Dunzo', 'Urban Company'
  },
  pay: {
    type: Number,
    required: true, // in INR
  },
  location: {
    type: String,
    required: true,
    trim: true, // city/area name, plain text
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('JobPosting', jobPostingSchema);