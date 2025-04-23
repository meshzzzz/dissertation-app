const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const jwt = require('jsonwebtoken');

// helper function to verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// get all groups
router.get("/groups", async (req, res) => {
    try {
        const groups = await Group.find().select('_id name description backgroundColor members');
        
        // get member count for each group
        const groupsWithMemberCount = groups.map(group => ({
            id: group._id,
            name: group.name,
            description: group.description,
            backgroundColor: group.backgroundColor,
            membersCount: group.members.length
        }));
        
        return res.send({ status: "ok", data: groupsWithMemberCount });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return res.send({ status: "error", data: "Error fetching groups" });
    }
});

// get a specific group's details
router.get("/groups/:id", async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'firstName lastName preferredName profileImage');
            
        if (!group) {
            return res.send({ status: "error", data: "Group not found" });
        }
        
        return res.send({ 
            status: "ok", 
            data: {
                id: group._id,
                name: group.name,
                description: group.description,
                backgroundColor: group.backgroundColor,
                members: group.members,
                membersCount: group.members.length
            } 
        });
    } catch (error) {
        console.error("Error fetching group:", error);
        return res.send({ status: "error", data: "Error fetching group" });
    }
});

// create a new group (admin only)
router.post("/groups", async (req, res) => {
    const { name, description, backgroundColor } = req.body;
    
    try {
        const existingGroup = await Group.findOne({ name });
        
        if (existingGroup) {
            return res.send({ status: "error", data: "A group with this name already exists" });
        }
        
        const newGroup = await Group.create({
            name,
            description: description || '',
            backgroundColor
        });
        
        return res.send({ 
            status: "ok", 
            data: {
                id: newGroup._id,
                name: newGroup.name,
                description: newGroup.description,
                backgroundColor: newGroup.backgroundColor,
                membersCount: 0
            }
        });
    } catch (error) {
        console.error("Error creating group:", error);
        return res.send({ status: "error", data: "Error creating group" });
    }
});

// get all groups for a specific user
router.post("/my-groups", async (req, res) => {
    const { token } = req.body;
    
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.send({ status: "error", data: "Invalid token" });
        }
        
        const userEmail = decoded.email;
        const user = await User.findOne({ email: userEmail }).populate('groups');
        
        if (!user) {
            return res.send({ status: "error", data: "User not found" });
        }
        
        // format the groups data
        const myGroups = user.groups.map(group => ({
            id: group._id,
            name: group.name,
            description: group.description,
            backgroundColor: group.backgroundColor,
            membersCount: group.members.length
        }));
        
        return res.send({ status: "ok", data: myGroups });
    } catch (error) {
        console.error("Error fetching user groups:", error);
        return res.send({ status: "error", data: "Error fetching user groups" });
    }
});

// join a group
router.post("/join-group", async (req, res) => {
    const { token, groupId } = req.body;
    
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.send({ status: "error", data: "Invalid token" });
        }
        
        const userEmail = decoded.email;
        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            return res.send({ status: "error", data: "User not found" });
        }
        
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.send({ status: "error", data: "Group not found" });
        }
        
        // check if user is already a member
        if (user.groups.includes(groupId)) {
            return res.send({ status: "error", data: "User is already a member of this group" });
        }
        
        // add group to user's groups
        user.groups.push(groupId);
        await user.save();
        
        // add user to group's members
        group.members.push(user._id);
        await group.save();
        
        return res.send({ status: "ok", data: "Successfully joined group" });
    } catch (error) {
        console.error("Error joining group:", error);
        return res.send({ status: "error", data: "Error joining group" });
    }
});

// leave a group
router.post("/leave-group", async (req, res) => {
    const { token, groupId } = req.body;
    
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.send({ status: "error", data: "Invalid token" });
        }
        
        const userEmail = decoded.email;
        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            return res.send({ status: "error", data: "User not found" });
        }
        
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.send({ status: "error", data: "Group not found" });
        }
        
        // check if user is a member
        if (!user.groups.includes(groupId)) {
            return res.send({ status: "error", data: "User is not a member of this group" });
        }
        
        // remove group from user's groups
        user.groups = user.groups.filter(id => id.toString() !== groupId);
        await user.save();
        
        // remove user from group's members
        group.members = group.members.filter(id => id.toString() !== user._id.toString());
        await group.save();
        
        return res.send({ status: "ok", data: "Successfully left group" });
    } catch (error) {
        console.error("Error leaving group:", error);
        return res.send({ status: "error", data: "Error leaving group" });
    }
});

module.exports = router;