const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String },
  passwordHash: { type: String, required: true },
  workerType:   { type: String, enum: ['delivery','driver','freelancer','domestic','construction','other'], required: true },
  role:         { type: String, enum: ['worker','admin'], default: 'worker' },
  isVerified:   { type: Boolean, default: false },
  profilePicUrl:{ type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);