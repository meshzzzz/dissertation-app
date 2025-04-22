const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

    const existingUser = await User.findOne({email: email})

    if(existingUser) {
        return res.send({status: "error", data: "User already exists."});
    }

    const encryptedPassword = await bcrypt.hash(password, 12);

    try {
        await User.create({
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
        res.send({status:"ok", data: "User created"})
    } catch (error) {
        res.send({status:"error", data: error})
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
            return res.send({status:"ok", token: token})
        }
        else {
            return res.send({status:"error"})
        }
    }
});

module.exports = router;