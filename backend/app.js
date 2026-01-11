import 'dotenv/config';

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';

import connectDB from './database/connectDB.js';
import userRoutes from './routes/userRoutes.js';
import msgRoutes from './routes/messagesRoutes.js';
import socketAuth from './middleware/socketAuth.js';
import { pubClient, subClient } from './database/redis.js';

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { 
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
    }
});

io.adapter(createAdapter(pubClient, subClient));

io.use(socketAuth);

io.on('connection', async (socket) => {
    const userId = socket.userId;

    if (!userId) {
        socket.disconnect(true);
        return;
    }

    console.log('user connected', userId);

    await pubClient.hSet("online_users", userId.toString(), socket.id);

    const onlineUsers = await pubClient.hKeys("online_users");

    io.emit("getOnlineUsers", onlineUsers);

    socket.on('initiateVoiceCall', async ({ toUserId, callId, metadata}) => {
        const fromUserId = socket.userId;
        const recipientSocketId = await pubClient.hGet("online_users", toUserId);
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

    socket.on('initiateVideoCall', async ({ toUserId, callId, metadata}) => {
        const fromUserId = socket.userId;
        const recipientSocketId = await pubClient.hGet("online_users", toUserId);
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

    socket.on('acceptCall', async ({ toUserId, callId }) => {
        const fromUserId = socket.userId;
        const callerSocketId = await pubClient.hGet("online_users", toUserId);
        if(callerSocketId) {
            io.to(callerSocketId).emit('callAccepted', { fromUserId, callId, calleeSocketId: socket.id });
        }
    });

    socket.on('rejectCall', async ({ toUserId, callId, reason }) => {
        const fromUserId = socket.userId;
        const callerSocketId = await pubClient.hGet("online_users", toUserId);
        if(callerSocketId) {
            io.to(callerSocketId).emit('callRejected', { fromUserId, callId, reason });
        }
    });

    socket.on('sendOffer', async ({ toUserId, callId, description }) => {
        const fromUserId =  socket.userId;
        const targetSocketId = await pubClient.hGet("online_users", toUserId);
        if(targetSocketId) {
            io.to(targetSocketId).emit('receiveOffer', { fromUserId, callId, description });
        }
    });

    socket.on('sendAnswer', async ({ toUserId, callId, description }) => {
        const fromUserId =  socket.userId;
        const targetSocketId = await pubClient.hGet("online_users", toUserId);
        if(targetSocketId) {
            io.to(targetSocketId).emit('receiveAnswer', { fromUserId, callId, description });
        }
    });

    socket.on('sendIceCandidate', async ({ toUserId, callId, candidate }) => {
        const fromUserId =  socket.userId;
        const targetSocketId = await pubClient.hGet("online_users", toUserId);
        if(targetSocketId) {
            io.to(targetSocketId).emit('receiveIceCandidate', { fromUserId, callId, candidate });
        }
    });

    socket.on('initiateScreenShare', async ({ toUserId, callId }) => {
        const fromUserId =  socket.userId;
        const recipientSocketId = await pubClient.hGet("online_users", toUserId);
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('incomingScreenShare', { fromUserId, callId });
        }
    });

    socket.on('stopScreenShare', async ({ toUserId, callId }) => {
        const fromUserId =  socket.userId;
        const recipientSocketId = await pubClient.hGet("online_users", toUserId);
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('stopScreenShare', { fromUserId, callId });
        }
    });

    socket.on('endCall', async ({ toUserId, callId }) => {
        const fromUserId =  socket.userId;
        const recipientSocketId = await pubClient.hGet("online_users", toUserId);
        if(recipientSocketId) {
            io.to(recipientSocketId).emit('callEnded', { fromUserId, callId });
        }
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected', userId);
        await pubClient.hDel("online_users", userId.toString());

        const updatedUsers = await pubClient.hKeys('online_users');
        io.emit('getOnlineUsers', updatedUsers);
    });
});

app.use(express.json({limit: '10mb'}));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
}));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "connect-src": ["'self'", process.env.FRONTEND_URL, "wss:"],
            "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "frame-ancestors": ["'none'"],
            "upgrade-insecure-requests": []
        }
    }
}));

app.use('/api/status', (req, res) => {
    res.send("server is live");
});

app.use('/api/auth', userRoutes);
app.use('/api/messages', msgRoutes);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        const db = await connectDB(process.env.MONGO_URI);
        server.listen(port, () => {
            console.log(`Server is listening to port ${port}...`);
        });
    } catch (err) {
        console.log(err);
    }
}

start();