import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 1. Join Battle Room
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} entered Arena ${roomId}`);
      // Opponent ko batao ki khiladi aa gaya hai
      socket.to(roomId).emit("user_joined", { userId: socket.id });
    });

    // 2. Battle Start Signal (Optional)
    // Jab dono ready hon, tabhi timer shuru hoga
    socket.on("player_ready", (roomId: string) => {
        socket.to(roomId).emit("opponent_ready", { userId: socket.id });
    });

    // --- CHANGE IS HERE ---
    
    // 3. NO CODE SHARING. Only Progress Sharing.
    // Jab Player A code submit kare, toh Player B ko bas "Result" dikhe.
    socket.on("submission_result", (data: { roomId: string; success: boolean; testCasesPassed: number }) => {
      // Opponent ko code NAHI bhejna, bas score bhejna hai
      socket.to(data.roomId).emit("opponent_progress", {
        success: data.success,
        testCasesPassed: data.testCasesPassed
      });
    });

    // 4. Game Over (Winner Announcement)
    socket.on("game_won", (data: { roomId: string; userId: string }) => {
        io.in(data.roomId).emit("battle_over", { winnerId: data.userId });
    });

    // 5. Leave Room
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });
};