const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// initial signup interests to group mapping
const INTEREST_TO_GROUP_MAP = {
    '1': 'Animals',
    '2': 'Music',
    '3': 'Dancing',
    '4': 'London Days Out',
    '5': 'Books & Reading',
    '6': 'Cooking & Food',
    '7': 'Movies & Film',
    '8': 'Gaming',
    '9': 'Sports & Fitness',
    '10': 'Travel',
    '11': 'Art & Design',
    '12': 'Photography'
};

// signup route
router.post('/signup', async(req, res) => {
    const {
        email, 
        firstName, 
        lastName,
        preferredName, 
        password,
        courseOfStudy,
        yearOfEntry,
        yearOfGraduation,
        interests
    } = req.body;

    try {
        const existingUser = await User.findOne({email: email})

        if(existingUser) {
            return res.send({status: "error", data: "User already exists."});
        }

        const encryptedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            email, 
            firstName, 
            lastName, 
            preferredName,
            password: encryptedPassword,
            courseOfStudy,
            yearOfEntry,
            yearOfGraduation,
            interests
        });

        // if the user selected interests, find the corresponding groups and add them
        if (interests && interests.length > 0) {
            // map interest IDs to group names
            const groupNames = interests.map(interestId => INTEREST_TO_GROUP_MAP[interestId])
                               .filter(name => name);

            const groups = await Group.find({ name: { $in: groupNames } });
            if (groups.length > 0) {
                // add group IDs to user's groups array
                const groupIds = groups.map(group => group._id);
                newUser.groups = groupIds;
                await newUser.save();
                
                // add user to each group's members array
                for (const group of groups) {
                    group.members.push(newUser._id);
                    await group.save();
                }
            }
        }
        res.send({status: "ok", data: "User created"});
    } catch (error) {
        console.error("Signup error:", error);
        res.send({status: "error", data: error.message || "Error creating user"});
    }
});

// login route
router.post("/login", async(req, res) => {
    const {email, password} = req.body;
    const existingUser = await User.findOne({email: email});

    if (!existingUser) {
        return res.send({status:"error", data: "User does not exist."})
    }
    
    if (await bcrypt.compare(password, existingUser.password)) {
        const token = jwt.sign({email: existingUser.email}, process.env.JWT_SECRET);

        if (res.status(201)) {
            return res.send({
                status:"ok", 
                token: token,
                role: existingUser.role || "user"
            })
        }
        else {
            return res.send({status:"error"})
        }
    }
});

module.exports = router;