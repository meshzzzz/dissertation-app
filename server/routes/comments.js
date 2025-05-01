const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authoriseDelete } = require('../middleware/auth');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');

const formatComment = (comment, userId) => ({
    id: comment._id,
    content: comment.content,
    createdAt: comment.createdAt,
    parent: comment.parent,
    likes: comment.likes.length,
    userHasLiked: userId ? comment.likes.includes(userId) : false,
    replyCount: comment.replyCount || 0,
    hasReplies: comment.replyCount > 0,
    author: {
      id: comment.author._id,
      name: comment.author.preferredName || `${comment.author.firstName} ${comment.author.lastName}`,
      profileImage: comment.author.profileImage
    }
});

// create a new comment on a post
router.post("/posts/:postId/comments", authenticate, async (req, res) => {
    const { postId } = req.params;
    const { content, parent } = req.body;
    const user = req.user;
  
    try {
      const post = await Post.findById(postId);
      if (!post) return res.send({ status: "error", data: "Post not found" });
  
      const newComment = await Comment.create({
        post: postId,
        author: user._id,
        content,
        parent: parent || null
      });
  
      await newComment.populate("author", "firstName lastName preferredName profileImage");
      await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
      if (parent) {
        await Comment.findByIdAndUpdate(parent, { $inc: { replyCount: 1 } });
      }
  
      return res.send({ status: "ok", data: formatComment(newComment, user._id) });
    } catch (err) {
      console.error("Comment creation error:", err);
      return res.send({ status: "error", data: "Failed to post comment" });
    }
});

// get all comments for a post
router.get("/posts/:postId/comments", authenticate, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;
  
    try {
      const comments = await Comment.find({ post: postId })
        .sort({ createdAt: 1 })
        .populate("author", "firstName lastName preferredName profileImage");
  
      return res.send({ 
        status: "ok", 
        data: comments.map(c => formatComment(c, userId)) 
      });
    } catch (err) {
      console.error("Fetch comments error:", err);
      return res.send({ status: "error", data: "Failed to load comments" });
    }
});

// get replies for a comment - only going to use if decide on lazy loading
router.get("/comments/:commentId/replies", authenticate, async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
  
    try {
      const replies = await Comment.find({ parent: commentId })
        .sort({ createdAt: 1 })
        .populate("author", "firstName lastName preferredName profileImage");
  
      return res.send({ 
        status: "ok", 
        data: replies.map(reply => formatComment(reply, userId)) 
      });
    } catch (err) {
      console.error("Fetch replies error:", err);
      return res.send({ status: "error", data: "Failed to load replies" });
    }
});

// toggle like on a comment
router.post("/comments/:commentId/like", authenticate, async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;
  
    try {
      const comment = await Comment.findById(commentId).populate("author", "firstName lastName preferredName profileImage");
      if (!comment) return res.send({ status: "error", data: "Comment not found" });
  
      const index = comment.likes.indexOf(user._id);
      if (index === -1) {
        comment.likes.push(user._id);
      } else {
        comment.likes.splice(index, 1);
      }
  
      await comment.save();
  
      return res.send({ status: "ok", data: formatComment(comment, user._id) });
    } catch (err) {
      console.error("Toggle like error:", err);
      return res.send({ status: "error", data: "Failed to toggle like" });
    }
});

// delete a comment
router.delete("/comments/:commentId", authenticate, authoriseDelete('comment'), async (req, res) => {
    const comment = req.comment;
    const commentId = comment._id;
    const postId = comment.post;
    const isParentComment = comment.parent === null;
    
    try {
        // if parent comment, delete all replies
        if (isParentComment) {
            await Comment.deleteMany({ parent: commentId });
        } else if (comment.parent) {
            // if reply, decrease parent's reply count
            await Comment.findByIdAndUpdate(comment.parent, {
                $inc: { replyCount: -1 }
            });
        }
        
        // delete comment
        await Comment.findByIdAndDelete(commentId);
        
        // decrement post's comment count
        await Post.findByIdAndUpdate(postId, {
            $inc: { commentCount: isParentComment ? -(1 + comment.replyCount) : -1 }
        });
        
        return res.send({ 
            status: "ok", 
            data: { 
                message: "Comment deleted successfully",
                postId: postId.toString()
            } 
        });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.send({ status: "error", data: "Error deleting comment" });
    }
});

module.exports = router;
  
  
  
  