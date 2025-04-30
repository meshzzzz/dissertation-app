const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticate = require('../middleware/authentication');
const Group = mongoose.model('Group');
const Post = mongoose.model('Post');

// format post data for response to client
const formatPost = (post, userId=null) => ({
    id: post._id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    author: {
        id: post.author._id,
        name: post.author.preferredName || `${post.author.firstName} ${post.author.lastName}`,
        profileImage: post.author.profileImage
    },
    group: post.group ? {
        id: post.group._id,
        name: post.group.name
    } : null,
    likes: post.likes?.length || 0,
    comments: post.commentCount || 0,
    userHasLiked: userId ? post.likes.includes(userId) : false
});

// pagination settings
const getPaginationSettings = (req) => {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    return { limit: parseInt(limit), skip };
  };

// create a new post
router.post("/posts", authenticate, async (req, res) => {
    const { title, content, groupId } = req.body;
    const user = req.user;
    
    try {
        // check if user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        // verify user is a member of the group
        if (!user.groups.includes(groupId)) {
            return res.send({ status: "error", data: "You must be a member of the group to post" });
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

        const formattedPosts = formatPost(newPost, user._id);

        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.send({ status: "error", data: "Error creating post" });
    }
});

// get posts for a specific group
router.get("/groups/:groupId/posts", authenticate, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    try {
        // check if group exists
        const group = await Group.findById(groupId);
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        const { limit, skip } = getPaginationSettings(req);
        
        // get posts
        const posts = await Post.find({ group: groupId })
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        // format post data
        const formattedPosts = posts.map(post => formatPost(post, userId));
        
        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error fetching group posts:", error);
        return res.send({ status: "error", data: "Error fetching group posts" });
    }
});

// get posts for the feed (all posts from user's groups)
router.get("/posts/feed", authenticate, async (req, res) => {
    const user = req.user; 

    try {
        const { limit, skip } = getPaginationSettings(req);
        
        // get all posts from groups the user is a member of
        const posts = await Post.find({ group: { $in: user.groups }})
            .sort({ createdAt: -1 }) // newest first (for now, TODO: add more filtering options)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        // format post data
        const formattedPosts = posts.map(post => formatPost(post, user._id));
        
        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error fetching feed posts:", error);
        return res.send({ status: "error", data: "Error fetching feed posts" });
    }
});

// get current user's posts
router.get("/posts/my", authenticate, async (req, res) => {
    const user = req.user;

    try {
        const { limit, skip } = getPaginationSettings(req);
        
        // get posts
        const posts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        // format post data
        const formattedPosts = posts.map(post => formatPost(post, user._id));
        
        return res.send({ status: "ok", data: formattedPosts });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return res.send({ status: "error", data: "Error fetching user posts" });
    }
});

// get a specific post by id
router.get("/posts/:postId", authenticate, async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    
    try {
        // get post
        const post = await Post.findById(postId)
            .populate('author', 'firstName lastName preferredName profileImage')
            .populate('group', 'name');
        
        if (!post) return res.send({ status: "error", data: "Post not found" });
        
        // format post data
        const formattedPost = formatPost(post, user._id);
        
        return res.send({ status: "ok", data: formattedPost });
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.send({ status: "error", data: "Error fetching post" });
    }
});

// toggle post like
router.post("/posts/:postId/like", authenticate, async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    
    try {
        // get post
        const post = await Post.findById(postId);
        if (!post) return res.send({ status: "error", data: "Post not found" });
        
        // check if user already liked the post
        const likeIndex = post.likes.indexOf(user._id);
        
        if (likeIndex === -1) {
            // user hasn't liked the post yet, add like
            post.likes.push(user._id);
        } else {
            // user already liked the post, remove like
            post.likes.splice(likeIndex, 1);
        }
        
        await post.save();
        
        // populate post details
        await post.populate('author', 'firstName lastName preferredName profileImage');
        await post.populate('group', 'name');
        
        // format post data
        const formattedPost = formatPost(post, user._id);
        
        return res.send({ 
            status: "ok", 
            data: formattedPost
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        return res.send({ status: "error", data: "Error toggling like" });
    }
});

module.exports = router;
