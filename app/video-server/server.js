/**
 * Soullab Video Signaling Server
 * WebRTC signaling server using Socket.IO for peer-to-peer video calling
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3003",
      "http://localhost:3000",
      "https://soullab.life",
      "https://www.soullab.life"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Express middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: io.sockets.sockets.size
  });
});

// Store active sessions and their participants
const activeSessions = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

  /**
   * Join Session Room
   */
  socket.on('join-session', (data) => {
    const { sessionId, userId, userName, isInitiator } = data;

    console.log(`[${new Date().toISOString()}] User ${userName} (${userId}) joining session ${sessionId} as ${isInitiator ? 'initiator' : 'participant'}`);

    // Join the socket room
    socket.join(sessionId);

    // Store user info in socket
    socket.userId = userId;
    socket.userName = userName;
    socket.sessionId = sessionId;
    socket.isInitiator = isInitiator;

    // Track session participants
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Map());
    }

    const sessionParticipants = activeSessions.get(sessionId);
    sessionParticipants.set(socket.id, {
      userId,
      userName,
      isInitiator,
      joinedAt: new Date()
    });

    // Notify others in the room
    socket.to(sessionId).emit('peer-connected', {
      userId,
      userName,
      isInitiator
    });

    // Send current participants to the new joiner
    const otherParticipants = Array.from(sessionParticipants.values())
      .filter(p => p.userId !== userId);

    socket.emit('session-joined', {
      sessionId,
      participants: otherParticipants
    });

    console.log(`[${new Date().toISOString()}] Session ${sessionId} now has ${sessionParticipants.size} participants`);
  });

  /**
   * WebRTC Offer
   */
  socket.on('offer', (data) => {
    const { sessionId, offer } = data;

    console.log(`[${new Date().toISOString()}] Forwarding offer in session ${sessionId}`);

    // Forward offer to other participants in the session
    socket.to(sessionId).emit('offer', {
      offer,
      from: {
        userId: socket.userId,
        userName: socket.userName
      }
    });
  });

  /**
   * WebRTC Answer
   */
  socket.on('answer', (data) => {
    const { sessionId, answer } = data;

    console.log(`[${new Date().toISOString()}] Forwarding answer in session ${sessionId}`);

    // Forward answer to other participants in the session
    socket.to(sessionId).emit('answer', {
      answer,
      from: {
        userId: socket.userId,
        userName: socket.userName
      }
    });
  });

  /**
   * ICE Candidate
   */
  socket.on('ice-candidate', (data) => {
    const { sessionId, candidate } = data;

    console.log(`[${new Date().toISOString()}] Forwarding ICE candidate in session ${sessionId}`);

    // Forward ICE candidate to other participants
    socket.to(sessionId).emit('ice-candidate', {
      candidate,
      from: {
        userId: socket.userId,
        userName: socket.userName
      }
    });
  });

  /**
   * Leave Session
   */
  socket.on('leave-session', (data) => {
    const { sessionId } = data;
    handleUserDisconnection(socket, sessionId);
  });

  /**
   * Disconnection handling
   */
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`);

    if (socket.sessionId) {
      handleUserDisconnection(socket, socket.sessionId);
    }
  });

  /**
   * Error handling
   */
  socket.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Socket error for ${socket.id}:`, error);
  });
});

/**
 * Handle user disconnection from session
 */
function handleUserDisconnection(socket, sessionId) {
  if (!sessionId || !activeSessions.has(sessionId)) {
    return;
  }

  const sessionParticipants = activeSessions.get(sessionId);

  if (sessionParticipants.has(socket.id)) {
    const participant = sessionParticipants.get(socket.id);

    console.log(`[${new Date().toISOString()}] User ${participant.userName} leaving session ${sessionId}`);

    // Remove from session
    sessionParticipants.delete(socket.id);

    // Leave socket room
    socket.leave(sessionId);

    // Notify other participants
    socket.to(sessionId).emit('peer-disconnected', {
      userId: participant.userId,
      userName: participant.userName
    });

    // Clean up empty sessions
    if (sessionParticipants.size === 0) {
      activeSessions.delete(sessionId);
      console.log(`[${new Date().toISOString()}] Session ${sessionId} cleaned up (no participants)`);
    } else {
      console.log(`[${new Date().toISOString()}] Session ${sessionId} now has ${sessionParticipants.size} participants`);
    }
  }
}

/**
 * Graceful shutdown handling
 */
process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] Received SIGINT, gracefully shutting down...`);

  // Notify all clients of server shutdown
  io.emit('server-shutdown', {
    message: 'Server is shutting down for maintenance',
    timestamp: new Date().toISOString()
  });

  // Close all connections
  io.close(() => {
    console.log(`[${new Date().toISOString()}] All connections closed`);
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🎥 Soullab Video Signaling Server running on port ${PORT}`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
});