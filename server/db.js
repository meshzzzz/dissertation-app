const mongoose = require("mongoose");
require('dotenv').config();

// connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database connected.")
    })
    .catch((e) => {
        console.log(e);
    });

// models
require("./models/User");

module.exports = mongoose;