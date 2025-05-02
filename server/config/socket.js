const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// initialise Socket.IO with an HTTP server
const initialiseSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // handle connections
    io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // authenticate user and join their group rooms
    socket.on('authenticate', async ({ token }) => {
        try {
        // verify token and get user email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // find user by email
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            socket.disconnect();
            return;
        }
        
        socket.userId = user._id.toString();
        
        // join socket rooms for each group
        if (user.groups.length > 0) {
            user.groups.forEach(groupId => {
                socket.join(`group:${groupId.toString()}`);
            });
            
            console.log(`User ${user._id} joined their group rooms`);
        }
        } catch (error) {
            console.error('Socket authentication error:', error);
            socket.disconnect();
        }
    });

    // join a specific group chat room
    socket.on('join_group', ({ groupId }) => {
        if (!socket.userId) return;
        socket.join(`group:${groupId}`);
        console.log(`User ${socket.userId} joined group ${groupId}`);
    });

    // leave a specific group chat room
    socket.on('leave_group', ({ groupId }) => {
        socket.leave(`group:${groupId}`);
        console.log(`User ${socket.userId} left group ${groupId}`);
    });

    // handle user typing indicator
    socket.on('typing', ({ groupId, isTyping }) => {
        socket.to(`group:${groupId}`).emit('user_typing', { 
        userId: socket.userId, 
        isTyping 
        });
    });

    // disconnect handling
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
    });

    return io;
};

module.exports = { initialiseSocket };