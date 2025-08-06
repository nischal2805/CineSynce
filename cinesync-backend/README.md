# CineSync Backend

CineSync is a real-time movie watch party application that allows users to host and join private rooms to watch movies in sync with friends. This backend serves as the signaling server for WebRTC connections and handles chat messages.

## Project Structure

```
cinesync-backend
├── src
│   └── server.js        # Entry point for the backend signaling server
├── .gitignore           # Files and directories to ignore by Git
├── package.json         # Project metadata and dependencies
└── README.md            # Documentation for the backend
```

## Setup Instructions

1. **Clone the Repository:**
   ```
   git clone <repository-url>
   cd cinesync-backend
   ```

2. **Install Dependencies:**
   Ensure you have Node.js installed. Then run:
   ```
   npm install
   ```

3. **Run the Server:**
   Start the server with:
   ```
   npm start
   ```

   The server will be running on `http://localhost:3000` by default.

## Usage

- The backend uses Socket.IO for real-time communication. Users can connect to the server and join rooms to watch movies together.
- The server handles the following events:
  - `join-room`: Users can join a specific room.
  - `send-chat-message`: Users can send chat messages to others in the room.
  - `playback-control`: Users can synchronize playback controls (play, pause, seek).
  
## License

This project is licensed under the MIT License. Feel free to modify and use it for your own purposes!