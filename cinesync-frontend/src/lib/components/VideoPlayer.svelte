<script>
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let isHost = false;
  export let videoSrc = null;
  
  const dispatch = createEventDispatcher();
  let videoElement;
  
  // Browser compatibility check for captureStream
  let streamCaptureSupported = true;
  
  onMount(() => {
    if (!HTMLVideoElement.prototype.captureStream && 
        !HTMLVideoElement.prototype.mozCaptureStream) {
      streamCaptureSupported = false;
      console.warn('Video capture stream not supported in this browser');
    }
  });
  
  function getVideoStream() {
    if (!videoElement) return null;
    
    try {
      if (HTMLVideoElement.prototype.captureStream) {
        return videoElement.captureStream();
      } else if (HTMLVideoElement.prototype.mozCaptureStream) {
        return videoElement.mozCaptureStream();
      }
    } catch (err) {
      console.error('Failed to capture video stream:', err);
      return null;
    }
    
    return null;
  }
  
  export function getCurrentTime() {
    return videoElement ? videoElement.currentTime : 0;
  }
  
  export function play() {
    if (videoElement) {
      videoElement.play().catch(err => {
        console.error('Failed to play video:', err);
      });
    }
  }
  
  export function pause() {
    if (videoElement) videoElement.pause();
  }
  
  export function seekTo(time) {
    if (videoElement) videoElement.currentTime = time;
  }
  
  function handlePlay() {
    if (isHost) {
      dispatch('playback', { action: 'play', time: videoElement.currentTime });
    }
  }
  
  function handlePause() {
    if (isHost) {
      dispatch('playback', { action: 'pause', time: videoElement.currentTime });
    }
  }
  
  function handleSeek() {
    if (isHost) {
      dispatch('playback', { action: 'seek', time: videoElement.currentTime });
    }
  }
  
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      videoSrc = URL.createObjectURL(file);
      dispatch('videoSelected', { videoSrc });
    }
  }
</script>

<div class="video-container">
  {#if !streamCaptureSupported && isHost}
    <div class="warning">
      Your browser doesn't support video streaming. Other users won't be able to see your video.
    </div>
  {/if}
  
  <video
    bind:this={videoElement}
    src={videoSrc}
    controls
    on:play={handlePlay}
    on:pause={handlePause}
    on:seeked={handleSeek}
  >
    <track kind="captions" />
  </video>
  
  {#if isHost && !videoSrc}
    <div class="file-selector">
      <label for="video-file">Select a video file to share</label>
      <input 
        type="file" 
        id="video-file"
        accept="video/*"
        on:change={handleFileSelect}
      />
    </div>
  {/if}
</div>

<style>
  .video-container {
    width: 100%;
    position: relative;
  }
  
  video {
    width: 100%;
    max-height: 70vh;
    background: #000;
  }
  
  .file-selector {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0,0,0,0.7);
    color: white;
  }
  
  .warning {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
  }
  
  input[type="file"] {
    margin-top: 10px;
  }
</style>