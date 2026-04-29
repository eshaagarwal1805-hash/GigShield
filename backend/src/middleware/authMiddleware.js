const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employer = require('../models/Employer');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'employer') {
      // Employer token — look up in Employer collection
      req.user = await Employer.findById(decoded.id).select('-passwordHash');
      if (!req.user) return res.status(401).json({ message: 'Employer not found' });
      req.user.role = 'employer'; // ensure role is always accessible on req.user
    } else {
      // Worker/user token (could be worker/admin depending on your model)
      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    console.error('JWT ERROR:', err);
    res.status(401).json({ message: 'Token invalid' });
  }
};

module.exports = { protect };