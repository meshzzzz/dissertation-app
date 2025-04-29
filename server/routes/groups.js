const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticate = require('../middleware/authentication');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const upload = require('../middleware/upload');
const isSuperuser = require('../middleware/isSuperuser');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const DEFAULT_GROUP_PICTURE = 'https://res.cloudinary.com/dtey1y2fw/image/upload/v1745500388/groupimg_zu73fp_c_fill_w_300_h_200_xefgsh.jpg';

// get all groups
router.get("/groups", async (req, res) => {
    try {
        const groups = await Group.find().select('_id name description groupImage members');
        
        // get member count for each group
        const groupsWithMemberCount = groups.map(group => ({
            id: group._id,
            name: group.name,
            description: group.description,
            groupImage: group.groupImage || DEFAULT_GROUP_PICTURE,
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
            
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        return res.send({ 
            status: "ok", 
            data: {
                id: group._id,
                name: group.name,
                description: group.description,
                groupImage: group.groupImage || DEFAULT_GROUP_PICTURE,
                members: group.members,
                membersCount: group.members.length
            } 
        });
    } catch (error) {
        console.error("Error fetching group:", error);
        return res.send({ status: "error", data: "Error fetching group" });
    }
});

// get all groups for a specific user
router.post("/user/groups", authenticate, async (req, res) => { 
    try {
        const user = await User.findById(req.user._id).populate('groups');
        if (!user) {
            return res.send({ status: "error", data: "User not found" });
        }
        
        // format the groups data
        const myGroups = user.groups.map(group => ({
            id: group._id,
            name: group.name,
            description: group.description,
            groupImage: group.groupImage || DEFAULT_GROUP_PICTURE,
            membersCount: group.members.length
        }));
        
        return res.send({ status: "ok", data: myGroups });
    } catch (error) {
        console.error("Error fetching user groups:", error);
        return res.send({ status: "error", data: "Error fetching user groups" });
    }
});

// join a group
router.post("/groups/join", authenticate, async (req, res) => {
    const { groupId } = req.body;
    const user = req.user;
    
    try {
        const group = await Group.findById(groupId);
        
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        // check if user is already a member
        if (user.groups.includes(groupId)) return res.send({ status: "error", data: "User is already a member of this group" });
        
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
router.post("/groups/leave", authenticate, async (req, res) => {
    const { groupId } = req.body;
    const user = req.user;
    
    try {
        const group = await Group.findById(groupId);
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        // check if user is a member
        if (!user.groups.includes(groupId)) return res.send({ status: "error", data: "User is not a member of this group" });
        
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

// SUPERUSER (me) ONLY ROUTES

// create a new group
router.post("/groups", authenticate, isSuperuser, async (req, res) => {
    const { name, description, groupImage } = req.body;
    
    try {
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) return res.send({ status: "error", data: "A group with this name already exists" });
        
        const newGroup = await Group.create({
            name,
            description: description || '',
            groupImage: groupImage || '',
        });
        
        return res.send({ 
            status: "ok", 
            data: {
                id: newGroup._id,
                name: newGroup.name,
                description: newGroup.description,
                groupImage: newGroup.groupImage,
                membersCount: 0
            }
        });
    } catch (error) {
        console.error("Error creating group:", error);
        return res.send({ status: "error", data: "Error creating group" });
    }
});

// update group details
router.put("/groups/:id", authenticate, isSuperuser, async (req, res) => {
    const { id } = req.params;
    const { name, description, groupImage } = req.body;
    
    try {
        const group = await Group.findById(id);
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        // update fields if provided
        if (name) group.name = name;
        if (description !== undefined) group.description = description;
        if (groupImage) group.groupImage = groupImage;
        
        await group.save();
        
        return res.send({
            status: "ok",
            data: {
                id: group._id,
                name: group.name,
                description: group.description,
                groupImage: group.groupImage || DEFAULT_GROUP_PICTURE,
                membersCount: group.members.length
            }
        });
    } catch (error) {
        console.error("Error updating group:", error);
        return res.send({ status: "error", data: "Error updating group" });
    }
});

// add group image (currently used in creation, to also be used in editing)
router.post("/groups/:id/image", authenticate, isSuperuser, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const group = await Group.findById(id);
        if (!group) return res.send({ status: 'error', data: 'Group not found' });

        if (!req.file) return res.send({ status: 'error', data: 'No image provided' });

        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'group_pictures',
            folder: 'group_pictures',
            public_id: `group_${group._id}`,
            overwrite: true,
        });

        // delete temporary file
        fs.unlinkSync(req.file.path);

        group.groupImage = result.secure_url;
        await group.save();

        return res.send({ status: 'ok', data: { groupImage: result.secure_url } });
    } catch (error) {
        console.error('Group image upload error:', error);
        return res.send({ status: 'error', data: 'Upload failed' });
    }
});

// delete a group
router.delete("/groups/:id", authenticate, isSuperuser, async (req, res) => {
    const { id } = req.params;
    
    try {
        const group = await Group.findById(id);
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
        // remove group from all users that have it
        await User.updateMany(
            { groups: id },
            { $pull: { groups: id } }
        );
        
        // delete the group
        await Group.findByIdAndDelete(id);
        
        return res.send({ status: "ok", data: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        return res.send({ status: "error", data: "Error deleting group" });
    }
});

module.exports = router;