import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Production mein isse frontend URL se replace karna
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('⚡ User Connected:', socket.id);

    // Basic Room Logic (Example)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected:', socket.id);
    });
  });

  return io;
};

// Helper to get IO instance anywhere in controllers
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};