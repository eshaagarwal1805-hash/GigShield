const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');


// GET /api/transactions/summary — today, week, month, all-time totals
router.get('/summary', protect, async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, week, month, all] = await Promise.all([
      Transaction.find({ userId: req.user._id, type: 'credit', createdAt: { $gte: startOfDay } }),
      Transaction.find({ userId: req.user._id, type: 'credit', createdAt: { $gte: startOfWeek } }),
      Transaction.find({ userId: req.user._id, type: 'credit', createdAt: { $gte: startOfMonth } }),
      Transaction.find({ userId: req.user._id, type: 'credit' }),
    ]);

    const sum = (arr) => arr.reduce((s, t) => s + (t.amount || 0), 0);

    res.json({
      today:  sum(today),
      week:   sum(week),
      month:  sum(month),
      total:  sum(all),
      count:  all.length,
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ message: 'Failed to fetch summary.' });
  }
});

// GET /api/transactions — all transactions newest first
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Transactions error:', err);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
});

// POST /api/transactions/manual — worker adds earning manually
router.post('/manual', protect, async (req, res) => {
  try {
    const { amount, source, note, type } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }
    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      type:   type || 'credit',
      source: source || 'Manual Entry',
      status: 'verified',
      proof:  { notes: note || '' },
    });
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Manual transaction error:', err);
    res.status(500).json({ message: 'Failed to save earning.' });
  }
});

module.exports = router;