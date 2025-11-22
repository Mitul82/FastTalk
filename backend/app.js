import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './database/connectDB.js';
import userRoutes from './routes/userRoutes.js';
import msgRoutes from './routes/messagesRoutes.js';

const app = express();
const server = http.createServer(app);

// creating the websockets server
export const io = new Server(server, {
    cors: { origin: '*' }
});

export const userSocketMap = {};  //{ userId: socketId }

// defining the socket functionality and event handlers
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    console.log('user connected', userId);

    if(userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('usr disconnected', userId);
        delete userSocketMap[userId];

        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

app.use(express.json({limit: '10mb'}));
app.use(cors());

app.use('/api/status', (req, res) => {
    res.send("server is live");
});
app.use('/api/auth', userRoutes);
app.use('/api/messages', msgRoutes);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        server.listen(port, () => {
            console.log(`Server is listening to port ${port}...`);
        });
    } catch (err) {
        console.log(err);
    }
}

start();