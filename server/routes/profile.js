const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// helper function to verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// multer storage for temporarily storing files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp'); // /tmp directory for temporary storage
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
// file size limit set to 5MB
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});
  

// get user data
router.post("/userdata", async(req, res) => {
    const {token} = req.body;
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = user.email;

        User.findOne({email:userEmail}).then((data) => {
            return res.send({status:"ok", data: data});
        }).catch(err => {
            return res.send({status:"error", data: "User not found"});
        })
    } catch (error) {
        return res.send({status:"error", data: "Invalid token"});
    }
});

// update profile
router.post("/update-profile", async(req, res) => {
    const { token, preferredName, aboutMe, country, campus, accomodation } = req.body;
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = user.email;
        const validatedAboutMe = aboutMe && aboutMe.length > 120 
            ? aboutMe.substring(0, 120) 
            : aboutMe;
        const updatedUser = await User.findOneAndUpdate(
            { email: userEmail },
            {
                preferredName,
                aboutMe: validatedAboutMe,
                country,
                campus,
                accomodation
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.send({ status: "error", data: "User not found" });
        }

        return res.send({ status: "ok", data: "Profile updated successfully" });
    } catch (error) {
        console.error('Update profile error: ', error);
        return res.send({ status: "error", data: "Invalid token" });
    }
});

// upload profile image
router.post("/profile-image", upload.single('image'), async(req, res) => {
    try {
        const { token } = req.body;
        
        // verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.send({ status: 'error', data: 'Invalid token' });
        }

        // check if file was uploaded
        if (!req.file) {
            return res.send({ status: 'error', data: 'No image provided' });
        }

        const userEmail = decoded.email;
        
        // find user
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.send({ status: 'error', data: 'User not found' });
        }

        // upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'profile_pictures',
            folder: 'profile_pictures',
            public_id: `user_${user._id}`,
            overwrite: true,
        });

        // delete temporary file
        fs.unlinkSync(req.file.path);

        // update user in database
        const updatedUser = await User.findOneAndUpdate(
            { email: userEmail },
            { profileImage: result.secure_url },
            { new: true }
        );

        return res.send({ 
            status: 'ok', 
            data: {
                profileImage: result.secure_url
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.send({ status: 'error', data: error.message });
    }
});

// remove profile image
router.post("/remove-profile-image", async (req, res) => {
    const { token } = req.body;

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

        // only attempt to delete if there is a profile image saved
        if (user.profileImage) {
            const publicId = `profile_pictures/user_${user._id}`;

            // delete from Cloudinary
            await cloudinary.uploader.destroy(publicId);
        }

        // update the user document to remove the profileImage field
        user.profileImage = ''; 
        await user.save();

        return res.send({ status: "ok", data: "Profile picture removed" });
    } catch (error) {
        console.error('Remove profile image error:', error);
        return res.send({ status: "error", data: "Failed to remove profile picture" });
    }
});



module.exports = router;