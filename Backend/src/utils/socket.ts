import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: IOServer;

export const initSocket = (server: HTTPServer) => {
  io = new IOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const userId = socket.handshake.query.userId as string;
    if (userId) socket.join(userId); // room per user
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
