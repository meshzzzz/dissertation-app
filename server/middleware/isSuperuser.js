const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// middleware to check if user is a superuser
const isSuperuser = async (req, res, next) => {
    try {
        // token can be extracted from req.body or query param/headers depending so works for all reqs
        const token = req.body.token || req.query.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        if (!token) return res.send({ status: "error", data: "No token provided" });
        
        const decoded = verifyToken(token);
        if (!decoded) return res.send({ status: "error", data: "Invalid token" });
        
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) return res.send({ status: "error", data: "User not found" });
        if (user.role !== 'superuser') return res.send({ status: "error", data: "Unauthorized: Superuser access required" });
        
        // user is superuser so can proceed
        req.user = user;
        next();
    } catch (error) {
        console.error("Authorization error:", error);
        return res.send({ status: "error", data: "Authorization error" });
    }
};

module.exports = isSuperuser;