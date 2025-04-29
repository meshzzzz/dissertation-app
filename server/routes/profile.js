const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticate = require('../middleware/authentication');
const User = mongoose.model('User');
const upload = require('../middleware/upload');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const DEFAULT_PROFILE_PICTURE = 'https://res.cloudinary.com/dtey1y2fw/image/upload/v1745352913/pfp_rwmsby.jpg';

// apply default profile image if not set
const applyDefaultProfileImage = (user) => {
    if (!user) return null;
    return {
        ...user.toObject(),
        profileImage: user.profileImage || DEFAULT_PROFILE_PICTURE
    };
};
  
// get user data
router.post("/userdata", authenticate, async (req, res) => {
    try {
        const user = req.user;
        const userWithImage = applyDefaultProfileImage(user);
        return res.send({ status: "ok", data: userWithImage });
    } catch (error) {
        console.error("User data fetch error:", error);
        return res.send({ status: "error", data: "Error fetching user data" });
    }
});

// update profile
router.post("/update-profile", authenticate, async (req, res) => {
    const { preferredName, aboutMe, country, campus, accomodation } = req.body;
    try {
        const user = req.user;
        const validatedAboutMe = aboutMe?.length > 120 ? aboutMe.substring(0, 120) : aboutMe;

        user.preferredName = preferredName;
        user.aboutMe = validatedAboutMe;
        user.country = country;
        user.campus = campus;
        user.accomodation = accomodation;
        await user.save();

        return res.send({ status: "ok", data: "Profile updated successfully" });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.send({ status: "error", data: "Error updating profile" });
    }
});

// upload profile image
router.post("/profile-image",authenticate, upload.single('image'), async (req, res) => {
    try {
        const user = req.user;
        if (!req.file) return res.send({ status: "error", data: "No image provided" });

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
router.post("/remove-profile-image", authenticate, async (req, res) => {
    try {
        const user = req.user;
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