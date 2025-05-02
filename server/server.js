const http = require("http");
const app = require('./app');
const { initialiseSocket } = require('./config/socket');

// create HTTP server using the Express app
const server = http.createServer(app);

// initialise Socket.IO
const io = initialiseSocket(server);

// make io accessible to routes
app.set('io', io);

// start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Node js server started on port ${PORT}`);
});