const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /api/community — public, paginated
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 6;
    const tag   = req.query.tag;

    const filter = { status: 'approved' };
    if (tag) filter.tag = tag;

    const posts = await CommunityPost.find(filter)
      .populate('userId', 'name workerType')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CommunityPost.countDocuments(filter);

    const formatted = posts.map(p => ({
      _id:       p._id,
      body:      p.body,
      tag:       p.tag,
      likes:     p.likes,
      createdAt: p.createdAt,
      name:      p.isAnonymous ? 'Anonymous Worker' : p.userId?.name || 'Worker',    // Hide identity if anonymous
      role:      p.isAnonymous ? 'Gig Worker'       : p.userId?.workerType || 'Gig Worker',
      initials:  p.isAnonymous ? 'AW'               : (p.userId?.name || 'W').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    }));

    res.json({ posts: formatted, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/community — login required
router.post('/', protect, async (req, res) => {
  try {
    const { body, tag, isAnonymous } = req.body;
    if (!body?.trim()) return res.status(400).json({ message: 'Post body is required.' });

    const post = await CommunityPost.create({
      userId: req.user._id,
      body: body.trim(),
      tag: tag || 'General',
      isAnonymous: !!isAnonymous,
    });

    res.status(201).json({ message: 'Post created.', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/community/:id/like — login required, toggle
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const alreadyLiked = post.likedBy.includes(req.user._id);
    if (alreadyLiked) {
      post.likedBy.pull(req.user._id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.user._id);
      post.likes += 1;
    }

    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;