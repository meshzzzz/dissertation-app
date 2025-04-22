const express = require('express');
const router = express.Router();

// import route modules
const authRoutes = require('./auth');
const profileRoutes = require('./profile');

// register routes
router.use(authRoutes);
router.use(profileRoutes);

module.exports = router;