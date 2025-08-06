<script>
  export let roomId;
  export let isHost;
  export let participants = [];
  export let onToggleVoiceChat;
  export let voiceChatActive = false;
  
  function copyRoomLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => alert('Room link copied to clipboard!'),
      (err) => console.error('Could not copy text: ', err)
    );
  }
</script>

<div class="room-controls">
  <div class="room-info">
    <h2>Room: {roomId}</h2>
    <button on:click={copyRoomLink}>Copy Invite Link</button>
  </div>
  
  <div class="participants">
    <h3>Participants ({participants.length})</h3>
    <ul>
      {#each participants as participant}
        <li>{participant.username} {participant.isHost ? '(Host)' : ''}</li>
      {/each}
    </ul>
  </div>
  
  <div class="voice-controls">
    <button 
      on:click={onToggleVoiceChat}
      class:active={voiceChatActive}
    >
      {voiceChatActive ? 'Disable Voice Chat' : 'Enable Voice Chat'}
    </button>
  </div>
</div>

<style>
  .room-controls {
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  
  .room-info {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h2 {
    margin: 0;
    font-size: 18px;
  }
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    padding: 5px 0;
  }
  
  button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button.active {
    background-color: #dc3545;
  }
</style>