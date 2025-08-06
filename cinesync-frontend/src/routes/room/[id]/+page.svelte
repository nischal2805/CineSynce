<script>
  // Import Svelte and SvelteKit utilities
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  // Import components
  import VideoPlayer from '$lib/components/VideoPlayer.svelte';
  import ChatBox from '$lib/components/ChatBox.svelte';
  import RoomControls from '$lib/components/RoomControls.svelte';
  
  // Import socket.io and peerjs
  import { io } from 'socket.io-client';
  import Peer from 'peerjs';
  
  // Room state
  const roomId = $page.params.id;
  let isHost = false;
  let username = '';
  let participants = [];
  let messages = [];
  let videoSrc = null;
  let voiceChatActive = false;
  
  // WebRTC related variables
  let socket;
  let peer;
  let localStream;
  let peerId;
  let connections = {};
  let videoPlayer;
  
  // Connection status and errors
  let socketConnected = false;
  let peerConnected = false;
  let connectionError = null;
  let streamError = null;
  
  // Connect to socket server and initialize peer
  onMount(async () => {
    // Get username before proceeding
    username = localStorage.getItem('username') || 
      prompt('Enter your display name for the chat:', 'Guest_' + Math.floor(Math.random() * 1000));
    localStorage.setItem('username', username);
    
    // First time joining? Become host
    if (!localStorage.getItem('visited_' + roomId)) {
      isHost = true;
      localStorage.setItem('visited_' + roomId, 'true');
    }
    
    try {
      // Connect to Socket.IO server
      socket = io('http://localhost:3000', {
        reconnectionAttempts: 5,
        timeout: 10000
      });
      
      socket.on('connect', () => {
        socketConnected = true;
        connectionError = null;
      });
      
      socket.on('connect_error', (err) => {
        connectionError = `Failed to connect to server: ${err.message}`;
        console.error('Socket connection error:', err);
      });
      
      // Initialize PeerJS
      peer = new Peer({
        config: { 
          'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ] 
        }
      });
      
      peer.on('open', (id) => {
        peerId = id;
        peerConnected = true;
        socket.emit('join-room', roomId, id, username, isHost);
      });
      
      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        connectionError = `WebRTC error: ${err.type}`;
      });
      
      // Handle socket events
      setupSocketEvents();
      
      // Handle peer events
      setupPeerEvents();
    } catch (err) {
      connectionError = `Failed to initialize connections: ${err.message}`;
      console.error('Initialization error:', err);
    }
  });
  
  function setupSocketEvents() {
    socket.on('user-connected', (userId, userName, userIsHost) => {
      console.log('User connected:', userId, userName);
      participants = [...participants, {
        id: userId,
        username: userName,
        isHost: userIsHost
      }];
      
      // If you're the host, prepare to accept calls
      if (isHost && videoSrc) {
        // Host logic will handle incoming calls
      }
    });
    
    socket.on('user-disconnected', (userId) => {
      console.log('User disconnected:', userId);
      participants = participants.filter(p => p.id !== userId);
      
      // Clean up peer connection
      if (connections[userId]) {
        connections[userId].close();
        delete connections[userId];
      }
    });
    
    socket.on('chat-message', (data) => {
      messages = [...messages, {
        username: data.username,
        text: data.text,
        isSelf: false
      }];
    });
    
    socket.on('playback-control', (data) => {
      if (!isHost) {
        handlePlaybackControl(data);
      }
    });
  }
  
  function setupPeerEvents() {
    if (isHost) {
      peer.on('call', async (call) => {
        try {
          // Get audio stream for voice chat
          let stream;
          if (voiceChatActive) {
            try {
              localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
              console.error('Failed to get user media:', err);
              streamError = 'Microphone access denied. Voice chat disabled.';
            }
          }
          
          // If we have a video element with a valid source
          if (videoSrc && videoPlayer) {
            // Try to get video stream
            const videoStream = videoPlayer.getVideoStream();
            
            if (videoStream) {
              // If we have both audio and video, combine them
              if (localStream) {
                const combinedStream = new MediaStream();
                videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
                localStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
                stream = combinedStream;
              } else {
                stream = videoStream;
              }
            } else {
              stream = localStream || new MediaStream();
              streamError = 'Video capture not supported. Only sharing audio.';
            }
          } else {
            stream = localStream || new MediaStream();
          }
          
          call.answer(stream);
          
          call.on('stream', (remoteStream) => {
            // Host receives guest's audio stream
            connections[call.peer] = call;
          });
          
          call.on('error', (err) => {
            console.error('Call error:', err);
          });
        } catch (err) {
          console.error('Error handling call:', err);
          streamError = `Error in WebRTC call: ${err.message}`;
        }
      });
    } else {
      // Guest logic - find the host and call them
      socket.on('user-connected', async (userId, userName, userIsHost) => {
        if (userIsHost) {
          try {
            let stream = null;
            if (voiceChatActive) {
              try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStream = stream;
              } catch (err) {
                console.error('Failed to get user media:', err);
                streamError = 'Microphone access denied. Voice chat disabled.';
                stream = new MediaStream(); // Empty stream
              }
            } else {
              stream = new MediaStream(); // Empty stream
            }
            
            const call = peer.call(userId, stream);
            connections[userId] = call;
            
            call.on('stream', (remoteStream) => {
              // Set the video source to the remote stream
              const video = document.querySelector('video');
              if (video) {
                video.srcObject = remoteStream;
              }
            });
            
            call.on('error', (err) => {
              console.error('Call error:', err);
            });
          } catch (err) {
            console.error('Error calling host:', err);
            streamError = `Failed to connect to host: ${err.message}`;
          }
        }
      });
    }
  }
  
  function handleSendMessage(text) {
    if (!text.trim()) return;
    
    socket.emit('send-chat-message', roomId, {
      username,
      text
    });
    
    messages = [...messages, {
      username,
      text,
      isSelf: true
    }];
  }
  
  function handlePlaybackControl(data) {
    if (!videoPlayer) return;
    
    switch (data.action) {
      case 'play':
        videoPlayer.seekTo(data.time);
        videoPlayer.play();
        break;
      case 'pause':
        videoPlayer.seekTo(data.time);
        videoPlayer.pause();
        break;
      case 'seek':
        videoPlayer.seekTo(data.time);
        break;
    }
  }
  
  async function toggleVoiceChat() {
    voiceChatActive = !voiceChatActive;
    
    if (voiceChatActive) {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Update active connections with audio
        // This is simplified - in a real app you'd need to update existing calls
      } catch (err) {
        console.error('Failed to get user media:', err);
        streamError = 'Microphone access denied. Voice chat disabled.';
        voiceChatActive = false;
      }
    } else {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.stop());
        localStream = null;
      }
    }
  }
  
  function handleVideoEvent(event) {
    if (isHost && socketConnected) {
      socket.emit('playback-control', roomId, event.detail);
    }
  }
  
  function handleVideoSelected(event) {
    videoSrc = event.detail.videoSrc;
  }
  
  onDestroy(() => {
    // Clean up resources
    if (socket) {
      socket.disconnect();
    }
    
    if (peer) {
      peer.destroy();
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    Object.values(connections).forEach(conn => {
      if (conn.close) conn.close();
    });
    
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
  });
</script>

<svelte:head>
  <title>CineSync - Room {roomId}</title>
</svelte:head>

<div class="room-page">
  {#if connectionError}
    <div class="error-message">
      {connectionError}
      <button on:click={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  {/if}
  
  {#if streamError}
    <div class="warning-message">
      {streamError}
    </div>
  {/if}
  
  <div class="main-content">
    <div class="video-section">
      <VideoPlayer 
        bind:this={videoPlayer}
        {isHost}
        {videoSrc}
        on:playback={handleVideoEvent}
        on:videoSelected={handleVideoSelected}
      />
      
      <RoomControls 
        {roomId}
        {isHost}
        {participants}
        onToggleVoiceChat={toggleVoiceChat}
        {voiceChatActive}
      />
    </div>
    
    <div class="chat-section">
      <ChatBox 
        {messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  </div>
</div>

<style>
  .room-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 20px;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .warning-message {
    background-color: #fff3cd;
    color: #856404;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
  }
  
  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .video-section {
    flex: 3;
    display: flex;
    flex-direction: column;
    margin-right: 20px;
  }
  
  .chat-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 300px;
  }
  
  button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>