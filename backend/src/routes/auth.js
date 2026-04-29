const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Dashboard = require('../models/Dashboard');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// WORKER AUTH

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, phone, password, workerType } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      workerType:
        workerType &&
        workerType.charAt(0).toUpperCase() + workerType.slice(1).toLowerCase(),
      role: 'worker', // <-- ensure workers get role
    });

    await Dashboard.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id },
      { upsert: true, new: true }
    );

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      token: generateToken(user._id, user.role),
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({
      token: generateToken(user._id, user.role),
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN AUTH

// POST /api/admin/register
router.post('/admin/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin', // key difference
    });

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      token: generateToken(user._id, user.role),
      user: userResponse,
    });
  } catch (err) {
    console.error('Admin register error:', err);
    res.status(500).json({ message: 'Failed to register admin' });
  }
});

// POST /api/admin/login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({
      token: generateToken(user._id, user.role),
      user: userResponse,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Failed to login admin' });
  }
});

module.exports = router;