import dotenv from 'dotenv';
// Config
dotenv.config();
import  type { Application, Request, Response } from 'express';
import express from 'express';
import http from 'http';
import cors from 'cors';


const app: Application = express();
const PORT = process.env.PORT || 3000;



// Middleware
app.use(cors());
app.use(express.json());


// Import Modular Setups
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { initializeSocket } from './socket.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import submissionRoutes from './routes/submission.routes.js';



// Initialize Services
// 1. Database
connectDB();
// 2. Redis
connectRedis();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('CodeBattle Arena API is Running ');
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
// Global Error Handler
app.use(errorHandler);

// Server & Socket Setup
const httpServer = http.createServer(app);
initializeSocket(httpServer); // Initialize Socket.io

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});