const express = require('express');
const router = express.Router();

// import route modules
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const groupsRoutes = require('./groups');

// register routes
router.use(authRoutes);
router.use(profileRoutes);
router.use(groupsRoutes);

module.exports = router;