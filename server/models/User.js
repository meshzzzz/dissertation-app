const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    preferredName: {
        type: String,
        default: '' // optional field
    },
    password: {
        type: String,
        required: true
    },
    courseOfStudy: {
        type: String,
        required: true
    },
    yearOfEntry: {
        type: String,
        required: true
    },
    yearOfGraduation: {
        type: String,
        required: true
    },
    aboutMe: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    campus: {
        type: String,
        default: ''
    },
    accomodation: {
        type: String,
        default: ''
    },
    interests: {
        type: [String],
        default: []  
    },
    profileImage: {
        type: String,
        default: ''
    },
    groups: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
        default: []
    },
    role: {
        type: String,
        enum: ['user', 'superuser'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "User"
})

mongoose.model("User", UserSchema);