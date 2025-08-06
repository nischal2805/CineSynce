const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://your-deployment-url.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://your-deployment-url.com'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000 // Increase timeout for better connection stability
});

// Store room information
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a room
  socket.on('join-room', (roomId, peerId, username, isHost) => {
    // Leave any previous rooms
    if (socket.roomId) {
      socket.leave(socket.roomId);
      
      // Remove user from previous room
      if (rooms[socket.roomId] && rooms[socket.roomId].users) {
        delete rooms[socket.roomId].users[socket.id];
        
        // Clean up empty rooms
        if (Object.keys(rooms[socket.roomId].users).length === 0) {
          delete rooms[roomId];
        }
      }
    }
    
    // Join the new room
    socket.join(roomId);
    socket.roomId = roomId;
    
    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        hostId: isHost ? socket.id : null,
        users: {}
      };
    } else if (isHost && !rooms[roomId].hostId) {
      // If room exists but has no host, set this user as host
      rooms[roomId].hostId = socket.id;
    }
    
    // Add user to room
    rooms[roomId].users[socket.id] = {
      peerId,
      username,
      isHost
    };
    
    console.log(`User ${username} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-connected', peerId, username, isHost);
    
    // Send the current list of users to the new user
    const roomUsers = Object.entries(rooms[roomId].users).map(([id, user]) => ({
      socketId: id,
      peerId: user.peerId,
      username: user.username,
      isHost: user.isHost
    }));
    
    socket.emit('room-users', roomUsers);
  });
  
  // Handle chat messages
  socket.on('send-chat-message', (roomId, messageData) => {
    socket.to(roomId).emit('chat-message', messageData);
  });
  
  // Handle playback controls
  socket.on('playback-control', (roomId, controlData) => {
    socket.to(roomId).emit('playback-control', controlData);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from room
    if (socket.roomId && rooms[socket.roomId]) {
      const room = rooms[socket.roomId];
      const user = room.users[socket.id];
      
      if (user) {
        // Notify others that user has left
        socket.to(socket.roomId).emit('user-disconnected', user.peerId);
        
        // If host leaves, try to assign a new host
        if (room.hostId === socket.id && Object.keys(room.users).length > 1) {
          // Find first non-host user to promote
          const newHostId = Object.keys(room.users).find(id => id !== socket.id);
          if (newHostId) {
            room.hostId = newHostId;
            room.users[newHostId].isHost = true;
            
            // Notify room of new host
            io.to(socket.roomId).emit('host-changed', room.users[newHostId].peerId);
          }
        }
        
        // Remove user from room
        delete room.users[socket.id];
        
        // Clean up empty rooms
        if (Object.keys(room.users).length === 0) {
          delete rooms[socket.roomId];
        }
      }
    }
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('CineSync Backend Server is running');
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', rooms: Object.keys(rooms).length });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});