const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');

// helper function to verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

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

module.exports = router;