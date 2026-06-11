const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("./utils/logger");

let io;
const userSockets = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`User connected to socket: ${socket.userId}`);
    userSockets.set(socket.userId, socket.id);

    socket.on("disconnect", () => {
      userSockets.delete(socket.userId);
      logger.info(`User disconnected from socket: ${socket.userId}`);
    });
  });

  return io;
};

const notifyUser = (userId, event, data) => {
  if (!io) return;
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = { initSocket, notifyUser };
