const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, requireSuperuser } = require('../middleware/auth');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const Event = mongoose.model('Event');
const upload = require('../middleware/upload');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const DEFAULT_EVENT_PICTURE = 'https://res.cloudinary.com/dtey1y2fw/image/upload/v1745500388/eventimg_default_c_fill_w_300_h_200_xedger.jpg';

// Helper function to format event response
function formatEventResponse(event) {
    return {
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        group: event.group,
        groupId: event.group._id,
        groupName: event.group.name,
        eventImage: event.eventImage || DEFAULT_EVENT_PICTURE,
        interestedUsers: event.interestedUsers || [],
        createdBy: event.createdBy,
        createdAt: event.createdAt
    };
}

// get all events
router.get("/events", async (req, res) => {
    try {
        const events = await Event.find()
            .populate('group', 'name')
            .populate('createdBy', 'firstName lastName preferredName')
            .sort({ date: 1 }); // Sort by date ascending (upcoming events first)
        
            const formattedEvents = events.map(event => formatEventResponse(event));
        
        return res.send({ status: "ok", data: formattedEvents });
    } catch (error) {
        console.error("Error fetching events:", error);
        return res.send({ status: "error", data: "Error fetching events" });
    }
});

// get events for a specific group
router.get("/groups/:groupId/events", async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const events = await Event.find({ group: groupId })
            .populate('group', 'name')
            .populate('createdBy', 'firstName lastName preferredName')
            .sort({ date: 1 });
        
            const formattedEvents = events.map(event => formatEventResponse(event));
        
        return res.send({ status: "ok", data: formattedEvents });
    } catch (error) {
        console.error("Error fetching group events:", error);
        return res.send({ status: "error", data: "Error fetching group events" });
    }
});

// get a specific event's details
router.get("/events/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('group', 'name')
            .populate('createdBy', 'firstName lastName preferredName')
            .populate('interestedUsers', 'firstName lastName preferredName profileImage');
            
        if (!event) return res.send({ status: "error", data: "Event not found" });
        
        // Get user interest status if authenticated
        let userInterested = false;
        if (req.user) {
            userInterested = event.interestedUsers.some(
                user => user._id.toString() === req.user._id.toString()
            );
        }

        return res.send({ 
            status: "ok", 
            data: {
                ...formatEventResponse(event),
                interestedUsers: event.interestedUsers,
                userInterested
            }
        });
    } catch (error) {
        console.error("Error fetching event:", error);
        return res.send({ status: "error", data: "Error fetching event" });
    }
});

// get all events for the current user
router.get("/user/events", authenticate, async (req, res) => {
    try {
        // Get groups the user is in
        const user = await User.findById(req.user._id);
        
        // Get events from those groups
        const events = await Event.find({ group: { $in: user.groups } })
            .populate('group', 'name')
            .populate('createdBy', 'firstName lastName preferredName')
            .sort({ date: 1 });
        
        const formattedEvents = events.map(event => {
            const isInterested = event.interestedUsers.includes(user._id);
            return {
                ...formatEventResponse(event),
                userInterested: isInterested
            };
        });
            
        
        return res.send({ status: "ok", data: formattedEvents });
    } catch (error) {
        console.error("Error fetching user events:", error);
        return res.send({ status: "error", data: "Error fetching user events" });
    }
});

// toggle interest
router.post("/events/:id/interest", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        
        const event = await Event.findById(id);
        if (!event) return res.send({ status: "error", data: "Event not found" });
        
        // Check if user is already interested
        const userIndex = event.interestedUsers.findIndex(
            userId => userId.toString() === user._id.toString()
        );
        
        if (userIndex !== -1) {
            // If already interested, remove interest
            event.interestedUsers.splice(userIndex, 1);
            await event.save();
            return res.send({ 
                status: "ok", 
                data: { 
                    message: "Interest removed", 
                    interested: false, 
                    count: event.interestedUsers.length,
                    userId: user._id 
                } 
            });
        } else {
            // If not interested, add interest
            event.interestedUsers.push(user._id);
            await event.save();
            return res.send({ 
                status: "ok", 
                data: { 
                    message: "Interest registered", 
                    interested: true, 
                    count: event.interestedUsers.length,
                    userId: user._id
                } 
            });
        }
    } catch (error) {
        console.error("Error registering interest:", error);
        return res.send({ status: "error", data: "Error registering interest" });
    }
});

// SUPERUSER ONLY ROUTES

// create a new event
router.post("/groups/:groupId/events", authenticate, requireSuperuser, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title, description, date, eventImage } = req.body;
        
        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) return res.send({ status: "error", data: "Group not found" });
        
       // Create new event
       const newEvent = await Event.create({
            title,
            description: description || '',
            date: new Date(date),
            group: groupId,
            eventImage: eventImage,
            createdBy: req.user._id,
            interestedUsers: []
        });
        
        return res.send({ 
            status: "ok", 
            data: {
                id: newEvent._id,
                title: newEvent.title,
                description: newEvent.description,
                date: newEvent.date,
                groupId: newEvent.group,
                eventImage: newEvent.eventImage || DEFAULT_EVENT_PICTURE,
                interestedCount: 0
            }
        });
    } catch (error) {
        console.error("Error creating event:", error);
        return res.send({ status: "error", data: "Error creating event" });
    }
});

// add event image
router.post("/events/:id/image", authenticate, requireSuperuser, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const event = await Event.findById(id);
        if (!event) return res.send({ status: 'error', data: 'Event not found' });

        if (!req.file) return res.send({ status: 'error', data: 'No image provided' });

        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'event_pictures',
            folder: 'event_pictures',
            public_id: `event_${event._id}`,
            overwrite: true,
        });

        // delete temporary file
        fs.unlinkSync(req.file.path);

        event.eventImage = result.secure_url;
        await event.save();

        return res.send({ status: 'ok', data: { eventImage: result.secure_url } });
    } catch (error) {
        console.error('Event image upload error:', error);
        return res.send({ status: 'error', data: 'Upload failed' });
    }
});

// delete an event
router.delete("/events/:id", authenticate, requireSuperuser, async (req, res) => {
    try {
        const { id } = req.params;
        
        const event = await Event.findById(id);
        if (!event) return res.send({ status: "error", data: "Event not found" });
        
        // delete event image from Cloudinary if it exists
        if (event.eventImage) {
            const publicId = `event_pictures/event_${event._id}`;
            await cloudinary.uploader.destroy(publicId);
        }
        
        // delete the event
        await Event.findByIdAndDelete(id);
        
        return res.send({ status: "ok", data: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        return res.send({ status: "error", data: "Error deleting event" });
    }
});

module.exports = router;