<script>
  export let messages = [];
  export let onSendMessage;
  
  let messageText = '';
  
  function handleSubmit() {
    if (messageText.trim()) {
      onSendMessage(messageText);
      messageText = '';
    }
  }
</script>

<div class="chat-container">
  <div class="messages-container">
    {#each messages as message}
      <div class="message {message.isSelf ? 'self' : 'other'}">
        <span class="username">{message.username}:</span>
        <span class="content">{message.text}</span>
      </div>
    {/each}
  </div>
  
  <form on:submit|preventDefault={handleSubmit} class="message-form">
    <input 
      type="text" 
      placeholder="Type a message..." 
      bind:value={messageText}
    />
    <button type="submit">Send</button>
  </form>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-left: 1px solid #ccc;
  }
  
  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  
  .message {
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 8px;
    max-width: 80%;
  }
  
  .self {
    align-self: flex-end;
    background-color: #dcf8c6;
  }
  
  .other {
    align-self: flex-start;
    background-color: #f1f0f0;
  }
  
  .username {
    font-weight: bold;
    margin-right: 5px;
  }
  
  .message-form {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  
  input {
    flex: 1;
    padding: 8px;
    margin-right: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  
  button {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>