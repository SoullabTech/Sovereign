// StreamingAudioQueue.ts - Manages queued audio chunk playback for seamless streaming
import { EventEmitter } from 'events';

interface AudioChunk {
  id: string;
  url: string;
  text: string;
  status: 'pending' | 'loading' | 'ready' | 'playing' | 'played' | 'error';
  audio?: HTMLAudioElement;
  timestamp: number;
}

export class StreamingAudioQueue extends EventEmitter {
  private queue: AudioChunk[] = [];
  private currentChunk: AudioChunk | null = null;
  private isPlaying = false;
  private preloadCount = 2; // Preload next 2 chunks
  private audioContext: AudioContext | null = null;

  constructor() {
    super();
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio API context for better control
   */
  private async initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Handle Safari auto-play restrictions
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', () => {
          this.audioContext?.resume();
        }, { once: true });
      }
    }
  }

  /**
   * Add audio chunk to queue
   */
  addChunk(chunkData: { id: string; url: string; text: string }) {
    const chunk: AudioChunk = {
      ...chunkData,
      status: 'pending',
      timestamp: Date.now()
    };

    this.queue.push(chunk);
    this.emit('chunk:added', chunk);

    // Start preloading
    this.preloadChunks();

    // Start playing if not already
    if (!this.isPlaying && this.queue.length === 1) {
      this.playNext();
    }
  }

  /**
   * Preload upcoming chunks for smooth playback
   */
  private async preloadChunks() {
    const chunksToPreload = this.queue
      .filter(chunk => chunk.status === 'pending')
      .slice(0, this.preloadCount);

    for (const chunk of chunksToPreload) {
      if (chunk.status === 'pending') {
        chunk.status = 'loading';
        this.loadAudioChunk(chunk);
      }
    }
  }

  /**
   * Load audio element for chunk
   */
  private async loadAudioChunk(chunk: AudioChunk) {
    try {
      const audio = new Audio(chunk.url);
      audio.preload = 'auto';
      
      // Set up event listeners
      audio.addEventListener('canplaythrough', () => {
        chunk.status = 'ready';
        chunk.audio = audio;
        this.emit('chunk:ready', chunk);
        
        // If this is the next chunk to play and nothing is playing, start it
        if (!this.isPlaying && this.queue[0]?.id === chunk.id) {
          this.playNext();
        }
      });

      audio.addEventListener('error', (error) => {
        console.error('[StreamingAudioQueue] Audio load error:', error);
        chunk.status = 'error';
        this.emit('chunk:error', { chunk, error });
        
        // Skip to next chunk on error
        if (this.currentChunk?.id === chunk.id) {
          this.playNext();
        }
      });

      // Start loading
      audio.load();
      
    } catch (error) {
      console.error('[StreamingAudioQueue] Failed to create audio element:', error);
      chunk.status = 'error';
      this.emit('chunk:error', { chunk, error });
    }
  }

  /**
   * Play next chunk in queue
   */
  private async playNext() {
    // Clean up current chunk
    if (this.currentChunk?.audio) {
      this.currentChunk.audio.pause();
      this.currentChunk.audio.src = '';
      this.currentChunk.status = 'played';
    }

    // Get next chunk
    const nextChunk = this.queue.shift();
    if (!nextChunk) {
      this.isPlaying = false;
      this.currentChunk = null;
      this.emit('queue:empty');
      return;
    }

    // Wait for chunk to be ready if still loading
    if (nextChunk.status === 'pending' || nextChunk.status === 'loading') {
      // Re-add to front of queue and wait
      this.queue.unshift(nextChunk);
      
      // Try loading if pending
      if (nextChunk.status === 'pending') {
        nextChunk.status = 'loading';
        await this.loadAudioChunk(nextChunk);
      }
      
      // Try again in a moment
      setTimeout(() => this.playNext(), 100);
      return;
    }

    // Skip if error
    if (nextChunk.status === 'error') {
      this.playNext();
      return;
    }

    // Play the chunk
    if (nextChunk.audio && nextChunk.status === 'ready') {
      this.currentChunk = nextChunk;
      this.isPlaying = true;
      nextChunk.status = 'playing';
      
      this.emit('chunk:playing', nextChunk);

      // Set up completion handler
      nextChunk.audio.addEventListener('ended', () => {
        this.emit('chunk:finished', nextChunk);
        this.playNext();
      }, { once: true });

      // Play with error handling
      try {
        // Resume audio context if suspended (Safari)
        if (this.audioContext?.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        const playPromise = nextChunk.audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('[StreamingAudioQueue] Playback error:', error);
            this.emit('chunk:error', { chunk: nextChunk, error });
            
            // Try next chunk
            setTimeout(() => this.playNext(), 100);
          });
        }
      } catch (error) {
        console.error('[StreamingAudioQueue] Failed to play audio:', error);
        this.emit('chunk:error', { chunk: nextChunk, error });
        this.playNext();
      }
    } else {
      // Shouldn't happen, but handle gracefully
      this.playNext();
    }

    // Preload more chunks
    this.preloadChunks();
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.currentChunk?.audio && this.isPlaying) {
      this.currentChunk.audio.pause();
      this.isPlaying = false;
      this.emit('playback:paused');
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (this.currentChunk?.audio && !this.isPlaying) {
      this.currentChunk.audio.play();
      this.isPlaying = true;
      this.emit('playback:resumed');
    } else if (!this.isPlaying && this.queue.length > 0) {
      this.playNext();
    }
  }

  /**
   * Stop and clear queue
   */
  stop() {
    this.pause();
    
    // Clean up all audio elements
    if (this.currentChunk?.audio) {
      this.currentChunk.audio.src = '';
    }
    
    for (const chunk of this.queue) {
      if (chunk.audio) {
        chunk.audio.src = '';
      }
    }
    
    this.queue = [];
    this.currentChunk = null;
    this.isPlaying = false;
    this.emit('playback:stopped');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.queue.length,
      currentChunk: this.currentChunk ? {
        id: this.currentChunk.id,
        text: this.currentChunk.text,
        status: this.currentChunk.status
      } : null,
      pendingChunks: this.queue.filter(c => c.status === 'pending').length,
      readyChunks: this.queue.filter(c => c.status === 'ready').length
    };
  }

  /**
   * Handle Safari audio unlock
   */
  async unlockAudio() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    // Create and play a silent audio to unlock
    const silentAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    try {
      await silentAudio.play();
      this.emit('audio:unlocked');
      return true;
    } catch (error) {
      console.warn('[StreamingAudioQueue] Could not unlock audio:', error);
      return false;
    }
  }
}

// Export singleton instance
let instance: StreamingAudioQueue | null = null;

export function getStreamingAudioQueue(): StreamingAudioQueue {
  if (!instance && typeof window !== 'undefined') {
    instance = new StreamingAudioQueue();
  }
  return instance!;
}