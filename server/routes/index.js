const express = require('express');
const router = express.Router();

// import route modules
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const groupsRoutes = require('./groups');
const postsRoutes = require('./posts');
const commentsRoutes = require('./comments');
const chatRoutes = require('./chat');
const eventsRoutes = require('./events');

// register routes
router.use(authRoutes);
router.use(profileRoutes);
router.use(groupsRoutes);
router.use(postsRoutes);
router.use(commentsRoutes);
router.use(chatRoutes);
router.use(eventsRoutes);

module.exports = router;