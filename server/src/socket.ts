import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';

// Extend Socket interface to include user data
interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    username: string;
    elo: number;
  };
}

// In-memory room state
interface RoomPlayer {
  odId: string;
  username: string;
  elo: number;
  isReady: boolean;
}

interface Room {
  id: string;
  name: string;
  type: '1v1' | 'squad';
  code: string;
  hostId: string;
  maxPlayers: number;
  players: Map<string, RoomPlayer>;
}

const rooms = new Map<string, Room>();
const socketToRoom = new Map<string, string>();

// Generate unique 6-char room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // JWT Authentication Middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        console.log('[Socket] No token provided, using anonymous mode');
        // Allow connection but mark as anonymous
        socket.user = {
          id: socket.id,
          username: `Player_${socket.id.slice(0, 4)}`,
          elo: 1200,
        };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as { id: string };
      const user = await User.findById(decoded.id).select('username elo');

      if (!user) {
        console.log('[Socket] User not found, using socket ID');
        socket.user = {
          id: socket.id,
          username: `Player_${socket.id.slice(0, 4)}`,
          elo: 1200,
        };
        return next();
      }

      socket.user = {
        id: decoded.id,
        username: user.username,
        elo: user.rating || 1200,
      };

      console.log(`[Socket] User authenticated: ${user.username}`);
      next();
    } catch (err) {
      console.log('[Socket] Auth error:', err);
      socket.user = {
        id: socket.id,
        username: `Player_${socket.id.slice(0, 4)}`,
        elo: 1200,
      };
      next();
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const user = socket.user!;
    console.log(`[Socket] User Connected: ${user.username} (${socket.id})`);

    // ========== ROOM EVENTS ==========

    // 1. Create Room
    socket.on("room:create", (data: { name: string; type: '1v1' | 'squad' }) => {
      const roomCode = generateRoomCode();
      const roomId = roomCode; // Use code as ID for simplicity

      const room: Room = {
        id: roomId,
        name: data.name || 'Quick Battle',
        type: data.type || '1v1',
        code: roomCode,
        hostId: user.id,
        maxPlayers: data.type === 'squad' ? 4 : 2,
        players: new Map(),
      };

      // Add creator as first player
      room.players.set(socket.id, {
        odId: user.id,
        username: user.username,
        elo: user.elo,
        isReady: false,
      });

      rooms.set(roomId, room);
      socketToRoom.set(socket.id, roomId);
      socket.join(roomId);

      console.log(`[Socket] Room created: ${roomCode} by ${user.username}`);

      // Send room info back to creator
      socket.emit("room:created", {
        roomId,
        code: roomCode,
        name: room.name,
        type: room.type,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
      });

      // Send initial player list
      socket.emit("room:players", {
        players: Array.from(room.players.values()).map(p => ({
          playerId: p.odId,
          username: p.username,
          elo: p.elo,
          isReady: p.isReady,
        })),
      });
    });

    // 2. Join Room (auto-creates if not found)
    socket.on("room:join", (data: { roomId: string }) => {
      const { roomId } = data;
      let room = rooms.get(roomId);

      // Auto-create room if doesn't exist (first user becomes host)
      if (!room) {
        console.log(`[Socket] Auto-creating room: ${roomId}`);
        room = {
          id: roomId,
          name: 'Quick Battle',
          type: '1v1',
          code: roomId, // Use roomId directly as code
          hostId: user.id,
          maxPlayers: 2,
          players: new Map(),
        };
        rooms.set(roomId, room);
      }

      if (room.players.size >= room.maxPlayers) {
        socket.emit("room:error", { message: "Room is full" });
        return;
      }

      // Add player to room
      room.players.set(socket.id, {
        odId: user.id,
        username: user.username,
        elo: user.elo,
        isReady: false,
      });

      socketToRoom.set(socket.id, roomId);
      socket.join(roomId);

      console.log(`[Socket] ${user.username} joined room ${roomId}`);

      // Notify existing players
      socket.to(roomId).emit("room:player_joined", {
        playerId: user.id,
        username: user.username,
        elo: user.elo,
        isReady: false,
      });

      // Send room info to joiner
      socket.emit("room:joined", {
        roomId,
        code: room.code,
        name: room.name,
        type: room.type,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
      });

      // Send current player list to joiner
      socket.emit("room:players", {
        players: Array.from(room.players.values()).map(p => ({
          playerId: p.odId,
          username: p.username,
          elo: p.elo,
          isReady: p.isReady,
        })),
      });
    });

    // 3. Leave Room
    socket.on("room:leave", (data: { roomId: string }) => {
      const { roomId } = data;
      handleLeaveRoom(socket, roomId);
    });

    // 4. Player Ready
    socket.on("room:ready", (data: { roomId: string; isReady: boolean }) => {
      const { roomId, isReady } = data;
      const room = rooms.get(roomId);

      if (!room) return;

      const player = room.players.get(socket.id);
      if (player) {
        player.isReady = isReady;

        // Broadcast to ALL in room (including sender)
        io.in(roomId).emit("room:ready", {
          playerId: user.id,
          isReady,
        });

        console.log(`[Socket] ${user.username} ready: ${isReady}`);

        // Check if all ready for match start
        const allPlayers = Array.from(room.players.values());
        const allReady = allPlayers.every(p => p.isReady);

        if (allReady && allPlayers.length >= 2) {
          const matchId = `match_${roomId}_${Date.now()}`;
          console.log(`[Socket] All ready! Starting match: ${matchId}`);

          io.in(roomId).emit("match:start", {
            match: {
              id: matchId,
              roomId,
              players: allPlayers.map(p => ({
                id: p.odId,
                username: p.username,
                elo: p.elo,
              })),
            },
          });
        }
      }
    });

    // ========== CHAT EVENTS ==========

    socket.on("chat:message", (data: { roomId: string; message: string }) => {
      const { roomId, message } = data;
      console.log(`[Socket] Chat in ${roomId}: ${user.username}: ${message}`);

      // Broadcast to ALL in room (sender will receive too)
      // Frontend should NOT add message locally - only on socket event
      io.in(roomId).emit("chat:message", {
        odId: user.id,
        username: user.username,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // ========== BATTLE EVENTS ==========

    socket.on("code:submit", (data: { matchId: string; code: string; language: string }) => {
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        // Simulate test results
        const testsPassed = Math.floor(Math.random() * 5) + 1;

        socket.to(roomId).emit("player:update", {
          opponentId: user.id,
          username: user.username,
          testsPassed,
          totalTests: 5,
          status: 'submitted',
        });

        console.log(`[Socket] ${user.username} submitted, ${testsPassed}/5 passed`);
      }
    });

    socket.on("player:update", (data: { matchId: string; status: string }) => {
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        socket.to(roomId).emit("player:update", {
          opponentId: user.id,
          username: user.username,
          testsPassed: 0,
          totalTests: 5,
          status: data.status,
        });
      }
    });

    socket.on("game:won", () => {
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        io.in(roomId).emit("match:end", {
          winnerId: user.id,
          winnerUsername: user.username,
          reason: 'all_tests_passed',
        });
      }
    });

    // ========== DISCONNECT ==========

    socket.on("disconnect", () => {
      console.log(`[Socket] User Disconnected: ${user.username}`);
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        handleLeaveRoom(socket, roomId);
      }
    });

    // Helper function
    function handleLeaveRoom(socket: AuthenticatedSocket, roomId: string) {
      const room = rooms.get(roomId);
      if (room) {
        room.players.delete(socket.id);
        socket.leave(roomId);
        socketToRoom.delete(socket.id);

        // Notify others
        socket.to(roomId).emit("room:player_left", { playerId: user.id });

        console.log(`[Socket] ${user.username} left room ${roomId}`);

        // Clean up empty room
        if (room.players.size === 0) {
          rooms.delete(roomId);
          console.log(`[Socket] Room ${roomId} deleted (empty)`);
        }
      }
    }
  });

  return io;
};