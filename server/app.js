const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(cors());
require ('dotenv').config();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database connected.")
    })
    .catch((e) => {
        console.log(e);
    })
require("./UserDetails");
const User = mongoose.model("User");

app.get("/", (req, res) => {
    res.send({status:"Started"})
})

app.post('/signup', async(req, res) => {
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
})

app.post("/login", async(req, res) => {
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
})

app.post("/userdata", async(req, res) => {
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

app.listen(5001, () => {
    console.log("Node js server started.")
})