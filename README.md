# CineSync

CineSync is a real-time movie watch party application that allows users to host and join private rooms to watch movies in sync with friends. The application includes features for text and voice chat, making it a perfect solution for a fun movie night.

## Project Structure

The project is divided into two main parts: the backend and the frontend.

### Backend

The backend is built using Node.js with Express and Socket.IO. It handles signaling for WebRTC connections and manages chat messages.

- **Directory:** `cinesync-backend`
  - `src/server.js`: Entry point for the backend signaling server.
  - `.gitignore`: Specifies files to be ignored by Git.
  - `package.json`: Contains metadata and dependencies for the backend.
  - `README.md`: Documentation for the backend.

### Frontend

The frontend is built using SvelteKit and is configured for static site generation to be deployed on GitHub Pages. It provides the user interface for creating and joining rooms, as well as video playback and chat functionality.

- **Directory:** `cinesync-frontend`
  - `src/app.html`: Main HTML template for the SvelteKit application.
  - `src/routes/+layout.js`: Layout component for the application.
  - `src/routes/+layout.svelte`: Defines the layout for the application.
  - `src/routes/+page.svelte`: Home page with options to create or join a room.
  - `src/routes/room/[id]/+page.svelte`: Main watch party page with video player and chat.
  - `src/lib/components/ChatBox.svelte`: Component for displaying and sending chat messages.
  - `src/lib/components/RoomControls.svelte`: Component for video playback controls.
  - `src/lib/components/VideoPlayer.svelte`: Component for managing video playback and synchronization.
  - `src/lib/utils/peer.js`: Utility functions for managing PeerJS connections.
  - `src/lib/utils/socket.js`: Utility functions for managing Socket.IO connections.
  - `src/app.css`: Styles for the SvelteKit application.
  - `static/favicon.png`: Favicon for the application.
  - `.gitignore`: Specifies files to be ignored by Git.
  - `package.json`: Contains metadata and dependencies for the frontend.
  - `svelte.config.js`: Configures SvelteKit for deployment on GitHub Pages.
  - `vite.config.js`: Configures Vite for the SvelteKit application.

## Setup Instructions

### Backend

1. Navigate to the `cinesync-backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

### Frontend

1. Navigate to the `cinesync-frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Build the application:
   ```
   npm run build
   ```
4. Deploy to GitHub Pages as per the SvelteKit documentation.

## Usage

- Create a new room to host a movie or join an existing room using the room ID.
- Use the chat feature to communicate with friends while watching.
- Enjoy synchronized playback of movies with voice chat capabilities.

## License

This project is open-source and available for anyone to use and modify. Enjoy your movie nights with CineSync!