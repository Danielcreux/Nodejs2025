const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const path = require('path');

// SSL Certificate
const options = {
    key: fs.readFileSync('/etc/apache2/ssl/freire.key'),
    cert: fs.readFileSync('/etc/apache2/ssl/freire_combined.cer')
};

const app = express();
const server = https.createServer(options, app);
const io = new Server(server);

// Serve static files from "public" folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


   io.on("connection", (socket) => {
    console.log(`🟢 Usuario conectado: ${socket.id}`);

    // Cuando el usuario se une a una sala
    socket.on("join-room", (data) => {
        if (!data || !data.roomId || !data.username) {
            console.log("⚠️ join-room: Datos inválidos recibidos");
            return;
        }

        const { roomId, username } = data;
        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = username;

        console.log(`✅ ${username} (${socket.id}) se unió a la sala ${roomId}`);

        // Notificar al usuario que se unió correctamente
        socket.emit("joined-room", {
            roomId,
            username,
            userId: socket.id,
        });

        // Notificar a los demás usuarios en la sala
        socket.to(roomId).emit("user-joined", {
            userId: socket.id,
            username,
        });
    });

    // Mensajes del chat
    socket.on("chat-message", (messageText) => {
        if (!messageText || !socket.roomId) {
            console.log("⚠️ chat-message: Mensaje vacío o usuario no en sala");
            return;
        }

        console.log(`📩 Mensaje en ${socket.roomId} de ${socket.username}: ${messageText}`);

        io.to(socket.roomId).emit("chat-message", {
            userId: socket.id,
            username: socket.username,
            text: messageText,
        });
    });

    // Desconexión del usuario
    socket.on("disconnect", () => {
        console.log(`🔴 Usuario desconectado: ${socket.id}`);
        if (socket.roomId) {
            io.to(socket.roomId).emit("user-disconnected", socket.id);
        }
    });
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🔒 Secure server running on https://localhost:${PORT}`);
});

