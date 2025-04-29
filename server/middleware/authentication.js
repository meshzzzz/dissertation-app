const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = async function authenticate(req, res, next) {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.query.token || req.body.token;
    if (!token) {
      return res.status(401).json({ status: 'error', data: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ status: 'error', data: 'User not found' });
    }

    req.user = user; // attach to request
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ status: 'error', data: 'Invalid or expired token' });
  }
};
