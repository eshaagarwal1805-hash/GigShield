const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// POST /api/contact — open to everyone (guests + logged in)
router.post('/', async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'All fields are required.' });

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      userId: userId || null,
    });

    res.status(201).json({ message: 'Message received. We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;