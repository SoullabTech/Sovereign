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
import { ensureAudioReady, getAudioStatus } from './ios-audio-session';

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
  // 🔥 FIX: Track audio chunks through pipeline
  private chunksEnqueued: number = 0;
  private chunksPlayed: number = 0;
  // Per-turn prosody diagnostics — emitted as [pfi.voice] at turn completion.
  private _turnStartMs: number | null = null;
  private _chunkCharCounts: number[] = [];
  private _lastChunkEndMs: number | null = null;
  private _gapMsValues: number[] = [];
  // How many raw sentences were collapsed by mergeShortSentences() this turn.
  // Wired from OracleConversation via noteMergedCount(). High = effective merging.
  private _mergedCount: number = 0;

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
    // Per-turn diagnostics: start clock on first chunk, accumulate char counts
    if (this._turnStartMs === null) this._turnStartMs = Date.now();
    this._chunkCharCounts.push(item.text.length);
    this.chunksEnqueued++;
    console.log(`🎵 [StreamingQueue] Enqueuing audio chunk #${this.chunksEnqueued}:`, item.text.length, 'chars'); // Never log content
    this.queue.push(item);

    if (!this.isPlaying) {
      console.log(`▶️ [StreamingQueue] Starting playback (queue was idle)`);
      this.playNext();
    }
  }

  /**
   * Ensure AudioContext is ready before EVERY playback
   *
   * iOS rule: Resume AudioContext before EVERY play, not just first.
   * iOS does not care about your assumptions.
   */
  private async ensureAudioContextReady(): Promise<void> {
    // Log status BEFORE attempting playback (debugging iOS silent failures)
    const statusBefore = getAudioStatus();
    console.log('[iOS Audio] Before playback:', statusBefore);

    // Use centralized iOS audio session manager
    // This handles: resume, recreation, and keep-alive
    this.audioContext = await ensureAudioReady();

    // Log status AFTER to confirm we're running
    const statusAfter = getAudioStatus();
    console.log('[iOS Audio] After ensureAudioReady:', statusAfter);

    if (statusAfter.state !== 'running') {
      console.error('[iOS Audio] WARNING: AudioContext still not running after ensureAudioReady!');
    }
  }

  /**
   * Attempt to play audio with retry logic for iOS unlock issues
   *
   * Key: ensureAudioReady() is called before EVERY attempt, not just first.
   */
  private async attemptPlay(audio: HTMLAudioElement, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // CRITICAL: Resume AudioContext before EVERY play attempt
        // iOS does not care about your assumptions
        await this.ensureAudioContextReady();

        // Gain ramp-in: 40ms linear fade prevents click at chunk seam (iOS + desktop)
        // MediaElementAudioSourceNode can only be created once per element — guard with flag.
        if (this.audioContext && this.audioContext.state === 'running' && !audio.dataset.gainNodeCreated) {
          try {
            const mediaSource = this.audioContext.createMediaElementSource(audio);
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.04);
            mediaSource.connect(gain);
            gain.connect(this.audioContext.destination);
            audio.dataset.gainNodeCreated = 'true';
          } catch (gainErr) {
            // Non-fatal: ramp failed (e.g. already connected), play without ramp
            console.warn('[StreamingQueue] Gain ramp skipped:', gainErr);
          }
        }

        // Set playsinline for iOS
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');

        await audio.play();
        console.log(`✅ [StreamingQueue] Play succeeded on attempt ${attempt}`);
        return true;
      } catch (error: any) {
        const status = getAudioStatus();
        console.warn(`⚠️ [StreamingQueue] Play attempt ${attempt}/${retries} failed:`, {
          errorName: error.name,
          errorMessage: error.message,
          audioContextState: status.state,
          unlocked: status.unlocked,
          keepAlive: status.keepAliveActive,
        });

        if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
          if (attempt < retries) {
            // Wait with exponential backoff before retry
            const delay = Math.min(100 * Math.pow(2, attempt - 1), 500);
            console.log(`🔄 [StreamingQueue] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            // ensureAudioContextReady will be called again at top of loop
          } else {
            // Final attempt failed
            console.error(`❌ [StreamingQueue] All ${retries} play attempts failed`);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('maya-audio-unlock-needed'));
            }
          }
        } else {
          // Non-recoverable error - don't retry
          console.error(`❌ [StreamingQueue] Non-recoverable error:`, error.name);
          break;
        }
      }
    }
    return false;
  }

  /**
   * Play the next audio chunk in the queue
   */
  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      // Only call onComplete if streaming is done (all sentences enqueued)
      // 🔥 FIX: Also verify all enqueued chunks have been played
      const allChunksPlayed = this.chunksPlayed >= this.chunksEnqueued;

      if (this.streamingComplete && allChunksPlayed) {
        console.log(`✅ [StreamingQueue] Queue empty AND streaming complete - truly done (played ${this.chunksPlayed}/${this.chunksEnqueued} chunks)`);
        this._emitChunkStats();
        this.isPlaying = false;
        this.currentAudio = null;
        this.onPlayingChange?.(false);
        this.onComplete?.();
      } else if (this.streamingComplete) {
        console.log(`⏳ [StreamingQueue] Queue empty, streaming complete, but only played ${this.chunksPlayed}/${this.chunksEnqueued} chunks - waiting...`);
        this.isPlaying = false;
      } else {
        console.log(`⏳ [StreamingQueue] Queue empty but streaming not complete - waiting for more sentences (played ${this.chunksPlayed}/${this.chunksEnqueued})`);
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

    return new Promise(async (resolve) => {
      // 🔍 DEBUG: Track playback progress to detect unexpected cutoffs
      let playbackStarted = false;
      let expectedDuration = 0;

      item.audio.onloadedmetadata = () => {
        expectedDuration = item.audio.duration;
        console.log(`⏱️ [StreamingQueue] Chunk metadata loaded: ${expectedDuration.toFixed(1)}s duration`);
      };

      item.audio.onplay = () => {
        playbackStarted = true;
        // Gap measurement: time from last chunk ending to this chunk starting
        if (this._lastChunkEndMs !== null) {
          this._gapMsValues.push(Date.now() - this._lastChunkEndMs);
        }
        console.log(`▶️ [StreamingQueue] Chunk playback started`);
      };

      // 🔍 DEBUG: Detect unexpected pause (before audio ends naturally)
      item.audio.onpause = () => {
        if (!item.audio.ended) {
          const playedTime = item.audio.currentTime;
          console.warn(`⚠️ [StreamingQueue] UNEXPECTED PAUSE at ${playedTime.toFixed(1)}s of ${expectedDuration.toFixed(1)}s - audio stopped before completing!`);
          console.warn(`⚠️ [StreamingQueue] Text chunk that was cut off: "${item.text.substring(0, 50)}..."`);
        }
      };

      item.audio.onended = () => {
        const playedTime = item.audio.currentTime;
        const completionRatio = expectedDuration > 0 ? playedTime / expectedDuration : 1;
        // 🔥 FIX: Track successfully played chunks
        this.chunksPlayed++;
        // Record when this chunk finished — used by onplay of next chunk for gap measurement
        this._lastChunkEndMs = Date.now();
        if (completionRatio < 0.9) {
          console.warn(`⚠️ [StreamingQueue] Chunk #${this.chunksPlayed} may have been cut short: played ${playedTime.toFixed(1)}s of ${expectedDuration.toFixed(1)}s (${(completionRatio * 100).toFixed(0)}%)`);
        } else {
          console.log(`✅ [StreamingQueue] Chunk #${this.chunksPlayed}/${this.chunksEnqueued} finished completely (${playedTime.toFixed(1)}s)`);
        }
        // DON'T unregister - we never registered it
        // this.feedbackPrevention.unregisterAudioElement(item.audio);
        resolve();
        this.playNext(); // Play next chunk
      };

      item.audio.onerror = (error) => {
        // 🔥 FIX: Still count failed chunks so we don't wait forever
        this.chunksPlayed++;
        console.error(`❌ [StreamingQueue] Audio error on chunk #${this.chunksPlayed}:`, error);
        console.error(`❌ [StreamingQueue] Failed chunk: "${item.text.substring(0, 50)}..."`);
        // DON'T unregister - we never registered it
        // this.feedbackPrevention.unregisterAudioElement(item.audio);
        resolve();
        this.playNext(); // Continue to next chunk even on error
      };

      // Start playback with retry logic for iOS audio unlock issues
      const playSucceeded = await this.attemptPlay(item.audio);

      if (!playSucceeded) {
        // All retries failed - count as failed and move on
        this.chunksPlayed++;
        console.error(`❌ [StreamingQueue] All play attempts failed for chunk #${this.chunksPlayed}`);
        resolve();
        this.playNext();
      }
      // If playback started, the onended/onerror handlers will call resolve() and playNext()
    });
  }

  /**
   * Emit per-turn chunk stats as a structured [pfi.chunks] log.
   *
   * Called exactly once per turn at the "truly done" completion point.
   * The key diagnostic is avg_gap_ms_between_chunks — gaps > 300ms are
   * perceptible silence seams that break prosody. avg_chunk_chars tells
   * whether mergeShortSentences() is consolidating effectively.
   *
   * Sample output (grep for tag: '[pfi.chunks]'):
   *   {"tag":"[pfi.chunks]","chunks_total":4,"avg_chunk_chars":142,
   *    "avg_gap_ms_between_chunks":87,"total_turn_duration_ms":6240,
   *    "gap_samples":[92,83,85]}
   */
  private _emitChunkStats(): void {
    if (this._chunkCharCounts.length === 0) return;
    const totalTurnMs = this._turnStartMs !== null ? Date.now() - this._turnStartMs : 0;
    const avgChunkChars = Math.round(
      this._chunkCharCounts.reduce((a, b) => a + b, 0) / this._chunkCharCounts.length
    );
    const avgGapMs = this._gapMsValues.length > 0
      ? Math.round(this._gapMsValues.reduce((a, b) => a + b, 0) / this._gapMsValues.length)
      : 0;
    console.info(JSON.stringify({
      tag: '[pfi.voice]',
      chunks_total: this._chunkCharCounts.length,
      chunks_merged_count: this._mergedCount,
      avg_chunk_chars: avgChunkChars,
      avg_gap_ms_between_chunks: avgGapMs,
      total_turn_duration_ms: totalTurnMs,
      gap_samples: this._gapMsValues,
    }));
  }

  /**
   * Stop playback and clear queue (for interruptions)
   */
  stop(): void {
    console.log(`🛑 [StreamingQueue] Stopping playback and clearing queue (played ${this.chunksPlayed}/${this.chunksEnqueued})`);

    // Stop current audio (no feedback prevention registration for streaming)
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      // DON'T unregister from feedbackPrevention - we never registered streaming chunks
      // this.feedbackPrevention.unregisterAudioElement(this.currentAudio);
      this.currentAudio = null;
    }

    // Clear queue and reset counters
    this.queue = [];
    this.isPlaying = false;
    this.streamingComplete = false; // Reset for next use
    this.chunksEnqueued = 0;
    this.chunksPlayed = 0;
    // Reset per-turn diagnostic accumulators
    this._turnStartMs = null;
    this._chunkCharCounts = [];
    this._lastChunkEndMs = null;
    this._gapMsValues = [];
    this._mergedCount = 0;
    this.onPlayingChange?.(false);
  }

  /**
   * Mark streaming as complete - no more sentences will be enqueued
   * Call this when the text stream ends and all sentences have been sent to TTS
   */
  markStreamingComplete(): void {
    console.log(`🏁 [StreamingQueue] Streaming marked complete - ${this.chunksEnqueued} chunks enqueued, ${this.chunksPlayed} played`);
    this.streamingComplete = true;

    // 🔥 FIX: Only trigger completion if ALL enqueued chunks have been played
    const allChunksPlayed = this.chunksPlayed >= this.chunksEnqueued;

    // If queue is already empty, not playing, AND all chunks have been played
    if (this.queue.length === 0 && !this.isPlaying && allChunksPlayed) {
      console.log(`✅ [StreamingQueue] Queue already empty and all ${this.chunksPlayed} chunks played - triggering completion`);
      this._emitChunkStats();
      this.onPlayingChange?.(false);
      this.onComplete?.();
    } else if (this.queue.length === 0 && !this.isPlaying) {
      console.log(`⏳ [StreamingQueue] Queue empty but only ${this.chunksPlayed}/${this.chunksEnqueued} chunks played - waiting`);
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
    // 🔥 FIX: Reset counters
    this.chunksEnqueued = 0;
    this.chunksPlayed = 0;
    // Reset per-turn diagnostic accumulators
    this._turnStartMs = null;
    this._chunkCharCounts = [];
    this._lastChunkEndMs = null;
    this._gapMsValues = [];
    this._mergedCount = 0;
  }

  /**
   * Accumulate the number of raw sentences collapsed by mergeShortSentences() this turn.
   * Called from OracleConversation after each merge pass:
   *   audioQueue.noteMergedCount(rawBatch.length - mergedBatch.length)
   * If this is always 0 the merge threshold is too high (or responses are already dense).
   */
  noteMergedCount(n: number): void {
    if (n > 0) this._mergedCount += n;
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
 * Merge adjacent short sentences into chunks of at least minMergedChars.
 *
 * Prevents MAIA from firing a TTS request per short phrase ("Yes. I see.")
 * which causes stitching seams and choppy prosody.
 * Target: 80–180 chars per TTS call. Default threshold: 160.
 */
export function mergeShortSentences(sentences: string[], minMergedChars = 160): string[] {
  const out: string[] = [];
  let buf = '';

  const flush = () => {
    const s = buf.trim();
    if (s) out.push(s);
    buf = '';
  };

  for (const sRaw of sentences) {
    const s = (sRaw ?? '').trim();
    if (!s) continue;

    if (!buf) {
      buf = s;
      continue;
    }

    // Three reasons to keep sentences joined:
    //
    // 1. Standard length merge: combined stays under threshold
    const combinesFine = buf.length + 1 + s.length < minMergedChars;
    //
    // 2. Continuation punctuation: buf ends with colon, semicolon, or em/en dash —
    //    syntactic signal that the next clause belongs to this thought.
    //    e.g. "The three things are:" → must stay attached to what follows.
    const bufEndsWithContinuation = /[:;—–]$/.test(buf);
    //
    // 3. Very short follow-up: next clause is too short to stand alone prosodically.
    //    e.g. "And so it is." (13 chars) sounds clipped after a gap; attach it always.
    const nextIsVeryShort = s.length < 40;

    if (combinesFine || bufEndsWithContinuation || nextIsVeryShort) {
      buf = `${buf} ${s}`;
    } else {
      flush();
      buf = s;
    }
  }

  flush();
  return out;
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
    instructions?: string;
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
        instructions: options?.instructions,
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
