const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Shift',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    platform: {
      type: String,
      default: 'General Gig',
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      label: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

GigSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Gig', GigSchema);