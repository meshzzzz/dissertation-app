const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const Post = mongoose.model('Post');
const jwt = require('jsonwebtoken');

// format post data for response to client
const formatPost = (post) => ({
    id: post._id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    author: {
        id: post.author._id,
        name: post.author.preferredName || `${post.author.firstName} ${post.author.lastName}`,
        profileImage: post.author.profileImage
    },
    group: {
        id: post.group._id,
        name: post.group.name
    },
    likes: post.likes?.length || 0,
    comments: post.comments?.length || 0
});

// pagination settings
const getPaginationSettings = (req) => {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    return { limit: parseInt(limit), skip };
  };

// helper function to verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// create a new post
router.post("/posts", async (req, res) => {
    const { token, title, content, groupId } = req.body;
    
    try {
        // verify user token
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });
        
        const userEmail = decoded.email;
        const user = await User.findOne({ email: userEmail });
        
        if (!user) return res.send({ status: "error", data: "User not found" });
        
        // if groupId is provided, check if user is a member of the group
        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) return res.send({ status: "error", data: "Group not found" });
            
            // verify user is a member of the group
            if (!user.groups.includes(groupId)) {
                return res.send({ status: "error", data: "You must be a member of the group to post" });
            }
        }
        
        // create the post
        const newPost = await Post.create({
            author: user._id,
            title: title || undefined, 
            content,
            group: groupId || undefined,
            createdAt: new Date()
        });
        
        // populate author details for the response
        await newPost.populate('author', 'firstName lastName preferredName profileImage');
        if (groupId) {
            await newPost.populate('group', 'name');
        }

        const formattedPosts = formatPost(newPost);

        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.send({ status: "error", data: "Error creating post" });
    }
});

// get posts for a specific group
router.get("/groups/:groupId/posts", async (req, res) => {
    const { groupId } = req.params;
    
    try {
        // check if group exists
        const group = await Group.findById(groupId);
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        const { limit, skip } = getPaginationSettings(req);
        
        // get posts
        const posts = await Post.find({ group: groupId })
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        // format post data
        const formattedPosts = posts.map(formatPost);
        
        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error fetching group posts:", error);
        return res.send({ status: "error", data: "Error fetching group posts" });
    }
});

// get posts for the feed (all posts from user's groups)
router.get("/posts/feed", async (req, res) => {
    const { token } = req.query;
    
    try {
        // verify user token
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });
        
        const userEmail = decoded.email;
        const user = await User.findOne({ email: userEmail });
        
        if (!user) return res.send({ status: "error", data: "User not found" });
        
        const { limit, skip } = getPaginationSettings(req);
        
        // get all posts from groups the user is a member of
        const posts = await Post.find({ 
            group: { $in: user.groups } 
        })
            .sort({ createdAt: -1 }) // newest first (for now, TODO: add more filtering options)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        // format post data
        const formattedPosts = posts.map(formatPost);
        
        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error fetching feed posts:", error);
        return res.send({ status: "error", data: "Error fetching feed posts" });
    }
});

// get posts for a specific user
router.get("/users/:userId/posts", async (req, res) => {
    const { userId } = req.params;
    
    try {
        // check if user exists
        const user = await User.findById(userId);
        if (!user) return res.send({ status: "error", data: "User not found" });
        
        const { limit, skip } = getPaginationSettings(req);
        
        // get posts
        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        // format post data
        const formattedPosts = posts.map(formatPost);
        
        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return res.send({ status: "error", data: "Error fetching user posts" });
    }
});

// get current user's posts
router.get("/posts/my", async (req, res) => {
    const { token } = req.query;
    
    try {
        // verify user token
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });
        
        const userEmail = decoded.email;
        const user = await User.findOne({ email: userEmail });
        
        if (!user) return res.send({ status: "error", data: "User not found" });
        
        const { limit, skip } = getPaginationSettings(req);
        
        // get posts
        const posts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        // format post data
        const formattedPosts = posts.map(formatPost);
        
        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return res.send({ status: "error", data: "Error fetching user posts" });
    }
});

// get a specific post by id
router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    const { token } = req.query;
    
    try {
        // verify user token
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });
        
        // get post
        const post = await Post.findById(postId)
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        if (!post) return res.send({ status: "error", data: "Post not found" });
        
        // format post data
        const formattedPost = formatPost(post);
        
        return res.send({ status: "ok", data: formattedPost });
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.send({ status: "error", data: "Error fetching post" });
    }
});

module.exports = router;
