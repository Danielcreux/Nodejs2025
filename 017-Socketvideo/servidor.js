const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const path = require('path');

const options = {
    key: fs.readFileSync('/etc/apache2/ssl/freire.key'),
    cert: fs.readFileSync('/etc/apache2/ssl/freire_combined.cer')
};

const app = express();
const server = https.createServer(options, app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit('user-disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 8443;
server.listen(PORT, () => console.log(`Server running on https://217.154.6.203`));


