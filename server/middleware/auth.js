const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');

// middleware to authenticate users
const authenticate = async (req, res, next) => {
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

// middleware to check if user is a superuser
const requireSuperuser = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', data: 'Authentication required' });
    }
  
    if (req.user.role !== 'superuser') {
        return res.status(403).json({ status: 'error', data: 'Forbidden: Superuser access required' });
    }
  
    next();
};

// middleware to authorise delete operations
// author of content or superusers can delete
const authoriseDelete = (type) => {
    return async (req, res, next) => {
        try {
            let content;
            let contentIdParam;
            
            if (type === 'post') {
                contentIdParam = 'postId';
                content = await Post.findById(req.params[contentIdParam]);
            } else if (type === 'comment') {
                contentIdParam = 'commentId';
                content = await Comment.findById(req.params[contentIdParam]);
            } else {
                return res.status(500).json({ status: 'error', data: 'Invalid content type' });
            }
            
            if (!content) {
                return res.status(404).json({ 
                status: 'error', 
                data: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` 
                });
            }
            
            // check if user is the author or a superuser
            const isAuthor = content.author.toString() === req.user._id.toString();
            const isSuperuser = req.user.role === 'superuser';
            
            if (!isAuthor && !isSuperuser) {
                return res.status(403).json({ 
                    status: 'error', 
                    data: `You don't have permission to delete this ${type}` 
                });
            }
            
            // add content to the request object for use in the route handler
            req[type] = content;
            next();
            
        } catch (error) {
            console.error(`Error in authoriseDelete middleware (${type}):`, error);
        return res.status(500).json({ 
            status: 'error', 
            data: `Error checking ${type} authorisation` 
        });
        }
    };
};

module.exports = {
    authenticate,
    requireSuperuser,
    authoriseDelete
};