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
import { pushVoiceDebug } from './voiceDebugBus';
import { logVoiceEvent } from './voiceDiagnostics';

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
  // 🛡️ iOS hang guard — per-chunk playback watchdog handle (see playNext).
  // Cleared on natural end/error, stop(), and reset() so it can never advance
  // a stopped queue.
  private playbackWatchdog: ReturnType<typeof setTimeout> | null = null;

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
  /**
   * Media-element state at a moment in time. Deliberately excludes anything
   * derived from the spoken text: this is a witness for HOW playback behaved,
   * never for WHAT was said.
   *
   * `currentTimeMs` is the load-bearing field. It is what separates "the retry
   * replayed something already audible" from "nothing had been heard yet" —
   * the whole question the AbortError path turns on.
   */
  private snapshot(audio: HTMLAudioElement, chunkId: number, attempt: number) {
    return {
      chunkId,
      attempt,
      currentTimeMs: Math.round((audio.currentTime || 0) * 1000),
      durationMs: Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : -1,
      readyState: audio.readyState,
      networkState: audio.networkState,
      paused: audio.paused,
      ended: audio.ended,
    };
  }

  private async attemptPlay(audio: HTMLAudioElement, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // CRITICAL: Resume AudioContext before EVERY play attempt
        // iOS does not care about your assumptions
        await this.ensureAudioContextReady();

        // Set playsinline for iOS
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');

        const chunkId = this.chunksPlayed + 1;
        // Sampled BEFORE play() resolves: a non-zero currentTime here means
        // this element has already emitted audio, so this attempt is a REPLAY,
        // not a first start.
        const pre = this.snapshot(audio, chunkId, attempt);
        await audio.play();
        logVoiceEvent(
          attempt === 1 ? 'voice_playback_started' : 'voice_playback_resumed',
          { ...pre, replayedAudible: attempt > 1 && pre.currentTimeMs === 0 },
        );
        console.log(`✅ [StreamingQueue] Play succeeded on attempt ${attempt}`);
        return true;
      } catch (error: any) {
        const status = getAudioStatus();
        logVoiceEvent('voice_playback_interrupted', {
          ...this.snapshot(audio, this.chunksPlayed + 1, attempt),
          errorName: error?.name ?? 'unknown',
        });
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
            logVoiceEvent('voice_playback_retry', {
              ...this.snapshot(audio, this.chunksPlayed + 1, attempt),
              errorName: error?.name ?? 'unknown',
              delayMs: delay,
            });
            console.log(`🔄 [StreamingQueue] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            // ensureAudioContextReady will be called again at top of loop
          } else {
            // Final attempt failed
            logVoiceEvent('voice_playback_failed', {
              ...this.snapshot(audio, this.chunksPlayed + 1, attempt),
              errorName: error?.name ?? 'unknown',
              reason: 'retries_exhausted',
            });
            console.error(`❌ [StreamingQueue] All ${retries} play attempts failed`);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('maya-audio-unlock-needed'));
            }
          }
        } else {
          // Non-recoverable error - don't retry
          logVoiceEvent('voice_playback_failed', {
            ...this.snapshot(audio, this.chunksPlayed + 1, attempt),
            errorName: error?.name ?? 'unknown',
            reason: 'non_recoverable',
          });
          console.error(`❌ [StreamingQueue] Non-recoverable error:`, error.name);
          break;
        }
      }
    }
    return false;
  }

  /**
   * Clear the per-chunk playback watchdog if one is armed.
   */
  private clearPlaybackWatchdog(): void {
    if (this.playbackWatchdog) {
      clearTimeout(this.playbackWatchdog);
      this.playbackWatchdog = null;
    }
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
        this.isPlaying = false;
        this.currentAudio = null;
        this.onPlayingChange?.(false);
        // PR 15 diagnostic: prove queue.onComplete actually fires.
        pushVoiceDebug(`🎬 onComplete firing (queue path, ${this.chunksPlayed}/${this.chunksEnqueued})`);
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
      let settled = false;

      // 🛡️ Single, idempotent completion path for this chunk. Whichever signal
      // fires first — natural end, error, failed start, or the iOS hang
      // watchdog below — advances the queue exactly once.
      const settleChunk = () => {
        if (settled) return;
        settled = true;
        this.clearPlaybackWatchdog();
        // 🔥 Count the chunk so markStreamingComplete()/playNext() can converge.
        this.chunksPlayed++;
        resolve();
        this.playNext();
      };

      // 🛡️ iOS hang guard — HTMLAudioElement.onended can silently NEVER fire on
      // iOS/WebView (AudioContext interruption, app backgrounding, audio-route
      // change, or the onpause-without-ended stall warned about below). Without
      // a timeout the whole queue strands here and isResponding hangs until the
      // 75s recovery backstop ("I seem to have gotten stuck"). This mirrors the
      // duration+margin playbackTimeout idiom already used in maiaSpeak's iOS
      // paths. Sized to the chunk's real duration + grace so legitimate speech
      // is never cut off — only true stalls are caught.
      const armWatchdog = () => {
        this.clearPlaybackWatchdog();
        const ceilingMs = (expectedDuration > 0 ? expectedDuration * 1000 : 20000) + 15000;
        this.playbackWatchdog = setTimeout(() => {
          if (settled) return;
          // Stop the zombie element so it can't later resume and overlap the next chunk.
          try { item.audio.pause(); } catch { /* element may already be torn down */ }
          console.warn(`⏱️ [StreamingQueue] Playback watchdog: chunk #${this.chunksPlayed + 1}/${this.chunksEnqueued} never fired onended after ~${Math.round(ceilingMs / 1000)}s — advancing so the queue can't strand isResponding`);
          pushVoiceDebug(`⏱️ watchdog advance ${this.chunksPlayed + 1}/${this.chunksEnqueued}`);
          settleChunk();
        }, ceilingMs);
      };

      item.audio.onloadedmetadata = () => {
        expectedDuration = item.audio.duration;
        console.log(`⏱️ [StreamingQueue] Chunk metadata loaded: ${expectedDuration.toFixed(1)}s duration`);
        // Re-arm with the real duration once we know it (only if already playing).
        if (playbackStarted) armWatchdog();
      };

      item.audio.onplay = () => {
        playbackStarted = true;
        console.log(`▶️ [StreamingQueue] Chunk playback started`);
        armWatchdog();
      };

      // 🔍 DEBUG: Detect unexpected pause (before audio ends naturally)
      item.audio.onpause = () => {
        if (!item.audio.ended) {
          const playedTime = item.audio.currentTime;
          console.warn(`⚠️ [StreamingQueue] UNEXPECTED PAUSE at ${playedTime.toFixed(1)}s of ${expectedDuration.toFixed(1)}s - audio stopped before completing!`);
          console.warn(`⚠️ [StreamingQueue] Text chunk that was cut off: "${item.text.substring(0, 50)}..."`); // leak-guard:ignore
        }
      };

      item.audio.onended = () => {
        // Closes the per-chunk trace. A chunk with started/resumed but no
        // ended is as diagnostic as one that failed — absence of this event
        // is how a stranded chunk becomes visible.
        logVoiceEvent('voice_playback_ended', this.snapshot(item.audio, this.chunksPlayed + 1, 0));
        if (settled) return;
        const playedTime = item.audio.currentTime;
        const completionRatio = expectedDuration > 0 ? playedTime / expectedDuration : 1;
        // PR 15 diagnostic: prove audio.onended fires on Capacitor/iOS. If we see
        // "🔚 ended N/M" but never the downstream "🎬 onComplete firing", the hang
        // is in markStreamingComplete logic; if "⏱️ watchdog advance" shows instead,
        // the WebView never delivered onended (the original stuck-thinking bug).
        pushVoiceDebug(`🔚 audio ended ${this.chunksPlayed + 1}/${this.chunksEnqueued}`);
        if (completionRatio < 0.9) {
          console.warn(`⚠️ [StreamingQueue] Chunk #${this.chunksPlayed + 1} may have been cut short: played ${playedTime.toFixed(1)}s of ${expectedDuration.toFixed(1)}s (${(completionRatio * 100).toFixed(0)}%)`);
        } else {
          console.log(`✅ [StreamingQueue] Chunk #${this.chunksPlayed + 1}/${this.chunksEnqueued} finished completely (${playedTime.toFixed(1)}s)`);
        }
        // DON'T unregister - we never registered it
        settleChunk();
      };

      item.audio.onerror = (error) => {
        if (settled) return;
        console.error(`❌ [StreamingQueue] Audio error on chunk #${this.chunksPlayed + 1}:`, error);
        console.error(`❌ [StreamingQueue] Failed chunk: "${item.text.substring(0, 50)}..."`); // leak-guard:ignore
        // DON'T unregister - we never registered it
        settleChunk(); // Continue to next chunk even on error
      };

      // Start playback with retry logic for iOS audio unlock issues
      const playSucceeded = await this.attemptPlay(item.audio);

      if (!playSucceeded) {
        // All retries failed - count as failed and move on
        console.error(`❌ [StreamingQueue] All play attempts failed for chunk #${this.chunksPlayed + 1}`);
        settleChunk();
      } else if (!this.playbackWatchdog && !settled) {
        // Defensive: play() resolved but onplay/onloadedmetadata may not fire in
        // some iOS WebView states — arm the watchdog regardless so a missing
        // onended can never strand the queue.
        armWatchdog();
      }
      // If playback started, onended/onerror (or the watchdog) settles the chunk.
    });
  }

  /**
   * Stop playback and clear queue (for interruptions)
   */
  stop(): void {
    console.log(`🛑 [StreamingQueue] Stopping playback and clearing queue (played ${this.chunksPlayed}/${this.chunksEnqueued})`);

    // 🛡️ Cancel any armed playback watchdog so it can't advance a stopped queue.
    this.clearPlaybackWatchdog();

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
    this.onPlayingChange?.(false);
  }

  /**
   * Mark streaming as complete - no more sentences will be enqueued
   * Call this when the text stream ends and all sentences have been sent to TTS
   */
  markStreamingComplete(): void {
    console.log(`🏁 [StreamingQueue] Streaming marked complete - ${this.chunksEnqueued} chunks enqueued, ${this.chunksPlayed} played`);
    this.streamingComplete = true;
    // PR 15 diagnostic: prove markStreamingComplete is reached.
    // If we never see this marker, the stream-reader 'done' path didn't run,
    // OR checkFinalize's condition (pendingTTSCount === 0) never holds on Android.
    pushVoiceDebug(`🏁 markStreamingComplete (${this.chunksPlayed}/${this.chunksEnqueued})`);

    // 🔥 FIX: Only trigger completion if ALL enqueued chunks have been played
    const allChunksPlayed = this.chunksPlayed >= this.chunksEnqueued;

    // If queue is already empty, not playing, AND all chunks have been played
    if (this.queue.length === 0 && !this.isPlaying && allChunksPlayed) {
      console.log(`✅ [StreamingQueue] Queue already empty and all ${this.chunksPlayed} chunks played - triggering completion`);
      this.onPlayingChange?.(false);
      // PR 15 diagnostic: prove this onComplete-entry path fires.
      pushVoiceDebug(`🎬 onComplete firing (mark path, ${this.chunksPlayed}/${this.chunksEnqueued})`);
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
    this.clearPlaybackWatchdog();
    this.streamingComplete = false;
    this.queue = [];
    this.isPlaying = false;
    this.currentAudio = null;
    // 🔥 FIX: Reset counters
    this.chunksEnqueued = 0;
    this.chunksPlayed = 0;
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
    // Phase 0: lets the caller cancel an in-flight TTS request on stop/interrupt/unmount.
    signal?: AbortSignal;
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
      // Phase 0: abortable — a stop/interrupt/unmount cancels the network round-trip.
      signal: options?.signal,
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

  } catch (error: any) {
    // Phase 0: a caller-initiated abort is interruption/cleanup, not a failure. Rethrow so the
    // caller can distinguish and drop the chunk quietly — the written response is unaffected.
    if (error?.name === 'AbortError') {
      console.log('🛑 [TTS] Audio generation aborted (interrupt/cleanup)');
      throw error;
    }
    console.error('❌ [TTS] Failed to generate audio:', error);
    throw error;
  }
}
