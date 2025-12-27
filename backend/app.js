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

    socket.on('initiateVoiceCall', (data) => {
        const { toUserId, fromUserId, callId, metadata } = data;
        const recipientSocketId = userSocketMap[toUserId];
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('incomingVoiceCall', {
                fromUserId,
                callId,
                metadata
            });
        } else {
            io.to(socket.id).emit('calleeNotAvailable', { toUserId });
        }
    });

    socket.on('initiateVideoCall', (data) => {
        const { toUserId, fromUserId, callId, metadata } = data;
        const recipientSocketId = userSocketMap[toUserId];
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('incomingVideoCall', {
                fromUserId,
                callId,
                metadata
            });
        } else {
            io.to(socket.id).emit('calleeNotAvailable', { toUserId });
        }
    });

    socket.on('acceptCall', (data) => {
        const { toUserId, fromUserId, callId } = data; // toUserId is caller's user id
        const callerSocketId = userSocketMap[toUserId];
        if(callerSocketId) {
            io.to(callerSocketId).emit('callAccepted', { fromUserId, callId, calleeSocketId: socket.id });
        }
    });

    socket.on('rejectCall', (data) => {
        const { toUserId, fromUserId, callId, reason } = data;
        const callerSocketId = userSocketMap[toUserId];
        if(callerSocketId) {
            io.to(callerSocketId).emit('callRejected', { fromUserId, callId, reason });
        }
    });

    socket.on('sendOffer', (data) => {
        const { toUserId, fromUserId, callId, description } = data;
        const targetSocketId = userSocketMap[toUserId];
        if(targetSocketId) {
            io.to(targetSocketId).emit('receiveOffer', { fromUserId, callId, description });
        }
    });

    socket.on('sendAnswer', (data) => {
        const { toUserId, fromUserId, callId, description } = data;
        const targetSocketId = userSocketMap[toUserId];
        if(targetSocketId) {
            io.to(targetSocketId).emit('receiveAnswer', { fromUserId, callId, description });
        }
    });

    socket.on('sendIceCandidate', (data) => {
        const { toUserId, fromUserId, callId, candidate } = data;
        const targetSocketId = userSocketMap[toUserId];
        if(targetSocketId) {
            io.to(targetSocketId).emit('receiveIceCandidate', { fromUserId, callId, candidate });
        }
    });

    socket.on('initiateScreenShare', (data) => {
        const { toUserId, fromUserId, callId } = data;
        const recipientSocketId = userSocketMap[toUserId];
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('incomingScreenShare', { fromUserId, callId });
        }
    });

    // Notify remote that screen share stopped so UI can update
    socket.on('stopScreenShare', (data) => {
        const { toUserId, fromUserId, callId } = data;
        const recipientSocketId = userSocketMap[toUserId];
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('stopScreenShare', { fromUserId, callId });
        }
    });

    socket.on('endCall', (data) => {
        const { toUserId, fromUserId, callId } = data;
        const recipientSocketId = userSocketMap[toUserId];
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('callEnded', { fromUserId, callId });
        }
    });

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