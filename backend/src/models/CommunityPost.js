const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body:        { type: String, required: true, trim: true, maxlength: 500 },
  tag:         { type: String, enum: ['Safety', 'Wages', 'SOS', 'General'], default: 'General' },
  likes:       { type: Number, default: 0 },
  likedBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);