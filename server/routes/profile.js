const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const DEFAULT_PROFILE_PICTURE = 'https://res.cloudinary.com/dtey1y2fw/image/upload/v1745352913/pfp_rwmsby.jpg';

// helper function to verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// helper function to apply default profile image
const applyDefaultProfileImage = (user) => {
    if (!user) return null;
    return {
        ...user.toObject(),
        profileImage: user.profileImage || DEFAULT_PROFILE_PICTURE
    };
};
  
// get user data
router.post("/userdata", async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });

        const user = await User.findOne({ email: decoded.email });
        if (!user) return res.send({ status: "error", data: "User not found" });

        const userWithImage = applyDefaultProfileImage(user);
        return res.send({ status: "ok", data: userWithImage });
    } catch (error) {
        console.error("User data fetch error:", error);
        return res.send({ status: "error", data: "Error fetching user data" });
    }
});

// update profile
router.post("/update-profile", async (req, res) => {
    const { token, preferredName, aboutMe, country, campus, accomodation } = req.body;
    try {
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });

        const validatedAboutMe = aboutMe?.length > 120 ? aboutMe.substring(0, 120) : aboutMe;

        const updatedUser = await User.findOneAndUpdate(
            { email: decoded.email },
            { preferredName, aboutMe: validatedAboutMe, country, campus, accomodation },
            { new: true }
        );

        if (!updatedUser) return res.send({ status: "error", data: "User not found" });

        return res.send({ status: "ok", data: "Profile updated successfully" });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.send({ status: "error", data: "Error updating profile" });
    }
});

// upload profile image
router.post("/profile-image", upload.single('image'), async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });

        if (!req.file) return res.send({ status: "error", data: "No image provided" });

        const user = await User.findOne({ email: decoded.email });
        if (!user) return res.send({ status: "error", data: "User not found" });

        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'profile_pictures',
            folder: 'profile_pictures',
            public_id: `user_${user._id}`,
            overwrite: true,
        });

        fs.unlinkSync(req.file.path);

        user.profileImage = result.secure_url;
        await user.save();

        return res.send({ status: "ok", data: { profileImage: result.secure_url } });
    } catch (error) {
        console.error('Upload error:', error);
        return res.send({ status: "error", data: "Failed to upload image" });
    }
});

// remove profile image
router.post("/remove-profile-image", async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });

        const user = await User.findOne({ email: decoded.email });
        if (!user) return res.send({ status: "error", data: "User not found" });

        if (user.profileImage) {
            const publicId = `profile_pictures/user_${user._id}`;
            await cloudinary.uploader.destroy(publicId);
        }

        user.profileImage = ''; 
        await user.save();

        return res.send({ status: "ok", data: "Profile picture removed" });
    } catch (error) {
        console.error('Remove profile image error:', error);
        return res.send({ status: "error", data: "Failed to remove profile picture" });
    }
});

module.exports = router;