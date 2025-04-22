const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();
require('./config/db');

// middleware
app.use(express.json());
app.use(cors());

// home route
app.get("/", (req, res) => {
    res.send({status:"Started"})
});

const routes = require('./routes');
app.use(routes);

app.listen(5001, () => {
    console.log("Node js server started.")
});

module.exports = app;