<script>
  import { goto } from '$app/navigation';
  
  let roomIdInput = '';
  let username = '';
  let usernameSet = false;
  
  function createNewRoom() {
    // Generate a random room ID (8 characters)
    const roomId = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('username', username);
    goto(`/room/${roomId}`);
  }
  
  function joinRoom() {
    if (roomIdInput.trim()) {
      localStorage.setItem('username', username);
      goto(`/room/${roomIdInput.trim()}`);
    }
  }
  
  function setUsername() {
    if (username.trim()) {
      usernameSet = true;
      localStorage.setItem('username', username);
    }
  }
  
  // Check if username is already stored
  import { onMount } from 'svelte';
  
  onMount(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      username = storedUsername;
      usernameSet = true;
    }
  });
</script>

<svelte:head>
  <title>CineSync - Watch Movies Together</title>
</svelte:head>

<div class="home-container">
  <div class="home-content">
    <h1>CineSync</h1>
    <p class="tagline">Watch movies together with friends, perfectly synchronized</p>
    
    {#if !usernameSet}
      <div class="username-section">
        <h2>First, tell us your name</h2>
        <div class="input-group">
          <input 
            type="text" 
            placeholder="Enter your display name" 
            bind:value={username}
            on:keypress={(e) => e.key === 'Enter' && setUsername()}
          />
          <button on:click={setUsername}>Continue</button>
        </div>
      </div>
    {:else}
      <div class="room-options">
        <div class="option-card">
          <h2>Create a New Room</h2>
          <p>Start a new watch party and invite your friends</p>
          <button on:click={createNewRoom}>Create Room</button>
        </div>
        
        <div class="option-card">
          <h2>Join Existing Room</h2>
          <p>Enter a room ID to join an existing watch party</p>
          <div class="input-group">
            <input 
              type="text" 
              placeholder="Enter Room ID" 
              bind:value={roomIdInput}
              on:keypress={(e) => e.key === 'Enter' && joinRoom()}
            />
            <button on:click={joinRoom}>Join Room</button>
          </div>
        </div>
      </div>
      
      <div class="user-info">
        Signed in as: <strong>{username}</strong>
        <button class="text-button" on:click={() => usernameSet = false}>Change</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: white;
  }
  
  .home-content {
    background: rgba(0, 0, 0, 0.5);
    padding: 40px;
    border-radius: 10px;
    text-align: center;
    max-width: 800px;
    width: 100%;
  }
  
  h1 {
    font-size: 3rem;
    margin-bottom: 10px;
    color: #e94560;
  }
  
  .tagline {
    font-size: 1.2rem;
    margin-bottom: 40px;
    color: #ccc;
  }
  
  .room-options {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .option-card {
    flex: 1;
    min-width: 280px;
    background: rgba(255, 255, 255, 0.1);
    padding: 25px;
    border-radius: 8px;
    transition: transform 0.2s;
  }
  
  .option-card:hover {
    transform: translateY(-5px);
  }
  
  h2 {
    color: #0f97ff;
    margin-bottom: 15px;
  }
  
  p {
    margin-bottom: 20px;
    color: #ddd;
  }
  
  .input-group {
    display: flex;
    margin-top: 15px;
  }
  
  input {
    flex: 1;
    padding: 10px 15px;
    border: none;
    border-radius: 4px 0 0 4px;
    font-size: 16px;
  }
  
  button {
    padding: 10px 20px;
    background-color: #e94560;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #d6334f;
  }
  
  .username-section {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .user-info {
    margin-top: 20px;
    font-size: 0.9rem;
    color: #ccc;
  }
  
  .text-button {
    background: none;
    border: none;
    color: #0f97ff;
    cursor: pointer;
    padding: 0 5px;
    font-size: 0.9rem;
  }
  
  .text-button:hover {
    text-decoration: underline;
  }
</style>