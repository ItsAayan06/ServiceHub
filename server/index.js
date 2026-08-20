import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import providerRoutes from './routes/providers.js';
import bookingRoutes from './routes/bookings.js';
import categoryRoutes from './routes/categories.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
  origin: ['http://localhost:5173', 'https://service-hub-lilac.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connected users map
export const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);

  socket.on('user_connected', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    connectedUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
      }
    });
  });
});

// Middleware
app.use(cors({
origin: [
  'http://localhost:5173',
  'https://service-hub-lilac.vercel.app',
  'https://service-v4mqf0wem-service-hub4.vercel.app'
],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ServiceHub API is running 🚀' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
});
