const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = guest
  status:  { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);