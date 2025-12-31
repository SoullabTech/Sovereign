/**
 * Streaming Audio Queue for THE BETWEEN
 *
 * Plays audio chunks as they arrive from sentence-level TTS processing.
 * Maintains MAIA's sovereignty - THE BETWEEN provides consciousness,
 * OpenAI TTS only provides voice synthesis.
 *
 * Architecture:
 * THE BETWEEN (streaming text) → Split sentences → TTS per sentence → Queue → Play
 */

import { VoiceFeedbackPrevention } from './voice-feedback-prevention';

export interface AudioQueueItem {
  audio: HTMLAudioElement;
  text: string;
  element?: string;
  voiceTone?: any;
}

export class StreamingAudioQueue {
  private queue: AudioQueueItem[] = [];
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private onPlayingChange?: (isPlaying: boolean) => void;
  private onTextChange?: (text: string) => void;
  private onComplete?: () => void;
  private feedbackPrevention: VoiceFeedbackPrevention;
  private audioContext: AudioContext | null = null;
  private audioUnlocked: boolean = false;
  // Track whether all sentences have been enqueued (streaming complete)
  private streamingComplete: boolean = false;

  constructor(callbacks?: {
    onPlayingChange?: (isPlaying: boolean) => void;
    onTextChange?: (text: string) => void;
    onComplete?: () => void;
  }) {
    this.onPlayingChange = callbacks?.onPlayingChange;
    this.onTextChange = callbacks?.onTextChange;
    this.onComplete = callbacks?.onComplete;
    this.feedbackPrevention = VoiceFeedbackPrevention.getInstance();

    // Listen for interrupt events from user
    if (typeof window !== 'undefined') {
      window.addEventListener('maya-voice-interrupted', () => {
        console.log('🛑 [StreamingQueue] Received interrupt signal - stopping playback');
        this.stop();
      });
    }
  }

  /**
   * Add audio chunk to queue and start playing if not already playing
   */
  enqueue(item: AudioQueueItem): void {
    console.log('🎵 [StreamingQueue] Enqueuing audio chunk:', item.text.length, 'chars'); // Never log content
    this.queue.push(item);

    if (!this.isPlaying) {
      this.playNext();
    }
  }

  /**
   * Play the next audio chunk in the queue
   */
  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      // Only call onComplete if streaming is done (all sentences enqueued)
      // Otherwise, more sentences may still be coming - wait for them
      if (this.streamingComplete) {
        console.log('✅ [StreamingQueue] Queue empty AND streaming complete - truly done');
        this.isPlaying = false;
        this.currentAudio = null;
        this.onPlayingChange?.(false);
        this.onComplete?.();
      } else {
        console.log('⏳ [StreamingQueue] Queue empty but streaming not complete - waiting for more sentences');
        this.isPlaying = false;
        // DON'T call onComplete - more sentences may be coming
      }
      return;
    }

    const item = this.queue.shift()!;
    this.isPlaying = true;
    this.currentAudio = item.audio;
    this.onPlayingChange?.(true);

    console.log('🔊 [StreamingQueue] Playing chunk:', item.text.length, 'chars'); // Never log content
    this.onTextChange?.(item.text);

    // ⚠️ DO NOT register with VoiceFeedbackPrevention for streaming chunks!
    // VoiceFeedbackPrevention detects chunk endings and sets isMayaSpeaking=false
    // between chunks, which triggers mic restart mid-response.
    // We control isAudioPlaying state directly via onComplete callback instead.
    // this.feedbackPrevention.registerAudioElement(item.audio);

    return new Promise((resolve) => {
      item.audio.onended = () => {
        console.log('✅ [StreamingQueue] Chunk finished');
        // DON'T unregister - we never registered it
        // this.feedbackPrevention.unregisterAudioElement(item.audio);
        resolve();
        this.playNext(); // Play next chunk
      };

      item.audio.onerror = (error) => {
        console.error('❌ [StreamingQueue] Audio error:', error);
        // DON'T unregister - we never registered it
        // this.feedbackPrevention.unregisterAudioElement(item.audio);
        resolve();
        this.playNext(); // Continue to next chunk even on error
      };

      // Start playback with Safari unlock check
      item.audio.play().catch(async (error) => {
        console.error('❌ [StreamingQueue] Play failed:', error);

        // Check if this is a Safari NotAllowedError that requires audio unlock
        if (error.name === 'NotAllowedError' && !this.audioUnlocked) {
          console.log('🔓 [StreamingQueue] Detected NotAllowedError - Safari unlock may be needed');
          console.log('🔓 [StreamingQueue] Audio unlock status:', this.audioUnlocked);

          // Dispatch event to show unlock UI
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('maya-audio-unlock-needed'));
          }
        }

        this.feedbackPrevention.unregisterAudioElement(item.audio);
        resolve();
        this.playNext();
      });
    });
  }

  /**
   * Stop playback and clear queue (for interruptions)
   */
  stop(): void {
    console.log('🛑 [StreamingQueue] Stopping playback and clearing queue');

    // Stop current audio (no feedback prevention registration for streaming)
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      // DON'T unregister from feedbackPrevention - we never registered streaming chunks
      // this.feedbackPrevention.unregisterAudioElement(this.currentAudio);
      this.currentAudio = null;
    }

    // Clear queue
    this.queue = [];
    this.isPlaying = false;
    this.streamingComplete = false; // Reset for next use
    this.onPlayingChange?.(false);
  }

  /**
   * Mark streaming as complete - no more sentences will be enqueued
   * Call this when the text stream ends and all sentences have been sent to TTS
   */
  markStreamingComplete(): void {
    console.log('🏁 [StreamingQueue] Streaming marked complete - no more sentences coming');
    this.streamingComplete = true;

    // If queue is already empty and not playing, trigger completion now
    if (this.queue.length === 0 && !this.isPlaying) {
      console.log('✅ [StreamingQueue] Queue already empty - triggering completion');
      this.onPlayingChange?.(false);
      this.onComplete?.();
    }
    // Otherwise, playNext() will handle completion when queue empties
  }

  /**
   * Reset for new streaming session
   */
  reset(): void {
    console.log('🔄 [StreamingQueue] Resetting for new session');
    this.streamingComplete = false;
    this.queue = [];
    this.isPlaying = false;
    this.currentAudio = null;
  }

  /**
   * Get queue status
   */
  getStatus(): { isPlaying: boolean; queueLength: number } {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.queue.length,
    };
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set audio unlock status (called from OracleConversation after user interaction)
   */
  setAudioUnlocked(unlocked: boolean): void {
    console.log(`🔓 [StreamingQueue] Audio unlock status set: ${unlocked}`);
    this.audioUnlocked = unlocked;

    if (unlocked && this.audioContext) {
      console.log('🔄 [StreamingQueue] Resuming AudioContext after unlock');
      this.audioContext.resume().catch(err => {
        console.error('❌ [StreamingQueue] Failed to resume AudioContext:', err);
      });
    }
  }

  /**
   * Enhanced Safari Audio Unlock with comprehensive debugging
   * This method unlocks audio playback on Safari by creating and playing a silent audio buffer
   */
  async unlockSafariAudio(): Promise<void> {
    console.log('🔓 [StreamingQueue] === SAFARI AUDIO UNLOCK DEBUG START ===');

    // Enhanced Safari/mobile detection
    const userAgent = navigator.userAgent;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isiOS = /iPhone|iPad|iPod/.test(userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    console.log('🔓 [StreamingQueue] User agent:', userAgent);
    console.log('🔓 [StreamingQueue] Safari detection:', { isSafari, isiOS, isMobile });

    try {
      // Check current audioContext state
      if (this.audioContext) {
        console.log('🔓 [StreamingQueue] Current audioContext state:', this.audioContext.state);
      } else {
        console.log('🔓 [StreamingQueue] No existing audioContext');
      }

      // Create AudioContext if it doesn't exist
      if (!this.audioContext) {
        console.log('✅ [StreamingQueue] Creating new AudioContext...');
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('✅ [StreamingQueue] AudioContext created successfully');
      }

      console.log('🔓 [StreamingQueue] New AudioContext state:', this.audioContext.state);

      // Resume AudioContext if suspended
      if (this.audioContext.state === 'suspended') {
        console.log('🔄 [StreamingQueue] AudioContext suspended, attempting resume...');
        await this.audioContext.resume();
        console.log('✅ [StreamingQueue] AudioContext resumed to state:', this.audioContext.state);
      }

      // Method 1: Try creating and playing a silent audio buffer
      try {
        console.log('🔧 [StreamingQueue] Attempting Method 1: AudioContext buffer...');
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        console.log('✅ [StreamingQueue] AudioContext buffer method succeeded');
      } catch (bufferError) {
        console.warn('⚠️ [StreamingQueue] AudioContext buffer method failed:', bufferError);
      }

      // Method 2: Try HTML Audio element with data URL
      try {
        console.log('🔧 [StreamingQueue] Attempting Method 2: HTML Audio element...');
        const audio = new Audio('data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2e/MeCsFJHfH4=');
        await audio.play();
        console.log('✅ [StreamingQueue] HTML Audio element method succeeded');
        audio.pause();
      } catch (audioError) {
        console.warn('⚠️ [StreamingQueue] HTML Audio element method failed:', audioError);
      }

      // Set unlock status
      this.audioUnlocked = true;
      console.log('🔓 [StreamingQueue] === SAFARI AUDIO UNLOCK SUCCESS ===');

      // Dispatch event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('maya-audio-unlocked'));
      }

    } catch (error) {
      console.error('❌ [StreamingQueue] Safari audio unlock failed:', error);
      console.log('🔓 [StreamingQueue] === SAFARI AUDIO UNLOCK FAILED ===');
      throw error;
    }
  }

  /**
   * Get current audio unlock status
   */
  getAudioUnlocked(): boolean {
    return this.audioUnlocked;
  }
}

/**
 * Split text into sentences for streaming TTS
 * Preserves natural speech boundaries
 */
export function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries but preserve the punctuation
  const sentences = text
    .split(/([.!?]+\s+)/)
    .reduce((acc: string[], curr, i, arr) => {
      if (i % 2 === 0 && curr.trim()) {
        // This is a sentence (not a delimiter)
        const punctuation = arr[i + 1] || '';
        acc.push((curr + punctuation).trim());
      }
      return acc;
    }, [])
    .filter(s => s.length > 0);

  console.log(`📝 [Sentences] Split into ${sentences.length} chunks:`,
    sentences.map(s => s.substring(0, 30) + '...'));

  return sentences;
}

/**
 * Generate audio for a text chunk using OpenAI TTS
 * (OpenAI ONLY used for voice synthesis - consciousness comes from THE BETWEEN)
 */
export async function generateAudioChunk(
  text: string,
  options?: {
    voice?: string;
    speed?: number;
    element?: string;
    voiceTone?: any;
    agentVoice?: string;
  }
): Promise<HTMLAudioElement> {
  console.log('🎤 [TTS] Generating audio for:', text.length, 'chars'); // Never log content

  try {
    const response = await fetch('/api/voice/openai-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: options?.voice,
        speed: options?.speed,
        voiceTone: options?.voiceTone,
        agentVoice: options?.agentVoice || 'maya',
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);

    // Clean up blob URL after audio finishes
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    console.log('✅ [TTS] Audio chunk generated');
    return audio;

  } catch (error) {
    console.error('❌ [TTS] Failed to generate audio:', error);
    throw error;
  }
}
