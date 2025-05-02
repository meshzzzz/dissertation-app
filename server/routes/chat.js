const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const Message = mongoose.model('Message');
const User = mongoose.model('User');

// get all messages for a specific group
router.get('/chat/:groupId', authenticate, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // check if user is a member of the group
        const user = await User.findById(req.user._id);
        if (!user.groups.includes(groupId)) {
            return res.send({ status: "error", data: "You are not a member of this group" });
        }
        
        // fetch messages
        const messages = await Message.find({ groupId })
            .sort({ createdAt: -1 }) // Most recent first
            .skip(skip)
            .limit(parseInt(limit))
            .populate('senderId', 'firstName lastName preferredName profileImage');
            
        const totalMessages = await Message.countDocuments({ groupId });
        
        return res.send({ 
            status: "ok", 
            data: { 
                messages, 
                pagination: {
                    total: totalMessages,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(totalMessages / parseInt(limit))
                }
            } 
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.send({ status: "error", data: "Error fetching messages" });
    }
});

// send a message to a group
router.post('/chat', authenticate, async (req, res) => {
    try {
        const { groupId, text, attachments } = req.body;
        
        // check if user is a member of the group
        const user = await User.findById(req.user._id);
        if (!user.groups.includes(groupId)) {
            return res.send({ status: "error", data: "You are not a member of this group" });
        }
        
        // create message
        const message = new Message({
            groupId,
            senderId: req.user._id,
            text,
            attachments: attachments || [],
            createdAt: new Date()
        });
        
        await message.save();
        
        // return message with populated sender info
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'firstName lastName preferredName profileImage');
        
        // emit event to Socket.IO
        req.app.get('io').to(`group:${groupId}`).emit('new_message', populatedMessage);
        
        return res.send({ status: "ok", data: populatedMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.send({ status: "error", data: "Error sending message" });
    }
});

module.exports = router;