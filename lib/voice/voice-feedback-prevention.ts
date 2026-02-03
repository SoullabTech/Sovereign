/**
 * Voice Feedback Prevention System
 * Prevents Maya from hearing and responding to her own voice
 */

import { isNativeIOS, nativePlayBase64 } from './native-audio-player';
import { arrayBufferToBase64 } from './audio-bytes';
import {
  ensureAudioReady,
  getAudioContext,
  getAudioStatus,
  unlockAudioOnUserGesture,
  startSessionKeepAlive,
} from './ios-audio-session';

// Legacy iOS Audio Unlock State (now delegated to ios-audio-session)
// Kept for backward compatibility with existing code
let iosAudioUnlocked = false;
let iosAudioContext: AudioContext | null = null;

/**
 * Get the shared iOS AudioContext (creates if needed)
 * Use this to ensure all audio uses the same unlocked context
 */
export function getIOSAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!iosAudioContext) {
    try {
      iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🔓 [iOS Audio] Created shared AudioContext');
    } catch (e) {
      console.warn('🔓 [iOS Audio] Could not create AudioContext:', e);
      return null;
    }
  }

  return iosAudioContext;
}

/**
 * iOS Audio Unlock - Must be called on user gesture to enable audio playback
 * iOS WebView suspends AudioContext and blocks audio.play() without user interaction
 */
export async function unlockIOSAudio(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (iosAudioUnlocked) return;

  console.log('🔓 [iOS Audio] Attempting to unlock audio...');

  try {
    // Create or get AudioContext
    if (!iosAudioContext) {
      iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume if suspended
    if (iosAudioContext.state === 'suspended') {
      await iosAudioContext.resume();
      console.log('🔓 [iOS Audio] AudioContext resumed');
    }

    // Play silent buffer to fully unlock
    const buffer = iosAudioContext.createBuffer(1, 1, 22050);
    const source = iosAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(iosAudioContext.destination);
    source.start(0);

    // Also create and play a silent Audio element
    const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAFeAFf9AAAIi8Va/80IREAAQAQAAAAAMQAAAAAAAAADSA0MAAAQAMA0MAAABAAACYBhAwKGAIYBBASFgYYBBwEMCAMJAgoJBAfBwyLiwMDAoFDBMODQkLCQcDgsHBQOCAYEAnZubm5ubm5ubkAAAAD/+1DEIgAAADSAAAAAAAAANIAAAAAubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubk=');
    silentAudio.volume = 0.01;
    await silentAudio.play().catch(() => {});

    iosAudioUnlocked = true;
    console.log('🔓 [iOS Audio] Audio unlocked successfully!');
  } catch (error) {
    console.warn('🔓 [iOS Audio] Unlock failed:', error);
  }
}

/**
 * Ensure iOS audio is ready before playback
 * This is called BEFORE every audio.play() to keep iOS audio unlocked
 *
 * FIX: Now handles context being closed/killed by iOS between responses
 */
export async function ensureIOSAudioReady(): Promise<void> {
  if (typeof window === 'undefined') return;

  console.log('🔓 [iOS Audio] Ensuring audio ready for playback...');

  try {
    // Create AudioContext if it doesn't exist
    if (!iosAudioContext) {
      iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🔓 [iOS Audio] Created new AudioContext');
    }

    // FIX: Recreate if iOS killed the context (state === 'closed')
    if (iosAudioContext.state === 'closed') {
      console.log('🔓 [iOS Audio] Context was CLOSED by iOS - recreating');
      iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      iosAudioUnlocked = false; // Need to re-unlock
    }

    // Resume if suspended (iOS suspends after each audio ends!)
    if (iosAudioContext.state === 'suspended') {
      console.log('🔓 [iOS Audio] Context suspended - attempting resume');
      await iosAudioContext.resume();
      console.log('🔓 [iOS Audio] Resumed suspended AudioContext, state now:', iosAudioContext.state);
    }

    // CRITICAL: Play a silent buffer to "warm up" iOS audio before real playback
    // iOS WebView requires this to keep audio system active
    const buffer = iosAudioContext.createBuffer(1, 1, 22050);
    const source = iosAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(iosAudioContext.destination);
    source.start(0);
    console.log('🔓 [iOS Audio] Played silent warm-up buffer');

    // Mark as unlocked
    iosAudioUnlocked = true;

    // Ensure keep-alive is running for this and subsequent chunks
    startIOSAudioKeepAlive();
  } catch (e) {
    console.warn('🔓 [iOS Audio] Could not ensure audio ready:', e);
    // Try to recreate context on failure
    try {
      iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await iosAudioContext.resume();
      console.log('🔓 [iOS Audio] Recreated context after failure');
    } catch (recreateError) {
      console.error('🔓 [iOS Audio] Failed to recreate context:', recreateError);
    }
  }
}

/**
 * Install iOS audio unlock on first user interaction
 */
export function installIOSAudioUnlock(): void {
  if (typeof window === 'undefined') return;

  const unlockEvents = ['touchstart', 'touchend', 'click', 'keydown'];

  const doUnlock = () => {
    unlockIOSAudio();
    // Remove listeners after first unlock
    unlockEvents.forEach(event => {
      document.removeEventListener(event, doUnlock, true);
    });
  };

  unlockEvents.forEach(event => {
    document.addEventListener(event, doUnlock, true);
  });

  console.log('🔓 [iOS Audio] Unlock listeners installed');
}

// iOS Audio Keep-Alive - prevents AudioContext suspension
let keepAliveInterval: NodeJS.Timeout | null = null;
let keepAliveFailCount = 0;
const MAX_KEEP_ALIVE_FAILURES = 3;

/**
 * Start iOS audio keep-alive - plays silent sound every 2 seconds
 * to prevent iOS from suspending the AudioContext between audio chunks
 *
 * NOTE: iOS WebView aggressively suspends AudioContext even during active
 * streaming playback. 2 seconds is more aggressive than the default 10s
 * to prevent dropouts between sentence chunks.
 *
 * FIX: Now restarts if context is deeply suspended (iOS kills it between responses)
 */
export function startIOSAudioKeepAlive(): void {
  if (typeof window === 'undefined') return;

  // Reset failure counter when explicitly starting
  keepAliveFailCount = 0;

  if (keepAliveInterval) {
    console.log('🔓 [iOS Audio] Keep-alive already running, ensuring context is ready');
    // Even if already running, ensure context is active NOW
    ensureKeepAliveContextActive();
    return;
  }

  console.log('🔓 [iOS Audio] Starting keep-alive ping (every 2s)');

  keepAliveInterval = setInterval(async () => {
    await ensureKeepAliveContextActive();
  }, 2000); // Every 2 seconds - iOS suspends aggressively between chunks
}

/**
 * Ensure the keep-alive context is active - recreates if iOS killed it
 */
async function ensureKeepAliveContextActive(): Promise<void> {
  try {
    // If no context exists, create one
    if (!iosAudioContext) {
      console.log('🔓 [iOS Audio] Keep-alive: creating new AudioContext');
      iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // If context is closed (iOS killed it), recreate
    if (iosAudioContext.state === 'closed') {
      console.log('🔓 [iOS Audio] Keep-alive: context was CLOSED, recreating');
      iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      iosAudioUnlocked = false; // Need to re-unlock
    }

    // Resume if suspended
    if (iosAudioContext.state === 'suspended') {
      await iosAudioContext.resume();
      console.log('🔓 [iOS Audio] Keep-alive resumed suspended context');
    }

    // Play silent buffer to keep iOS audio active
    const buffer = iosAudioContext.createBuffer(1, 1, 22050);
    const source = iosAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(iosAudioContext.destination);
    source.start(0);

    // Reset failure count on success
    keepAliveFailCount = 0;
  } catch (e) {
    keepAliveFailCount++;
    console.warn(`🔓 [iOS Audio] Keep-alive ping failed (${keepAliveFailCount}/${MAX_KEEP_ALIVE_FAILURES}):`, e);

    // If we fail too many times, recreate the context entirely
    if (keepAliveFailCount >= MAX_KEEP_ALIVE_FAILURES) {
      console.log('🔓 [iOS Audio] Keep-alive: too many failures, recreating context');
      try {
        iosAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        iosAudioUnlocked = false;
        keepAliveFailCount = 0;
      } catch (createError) {
        console.error('🔓 [iOS Audio] Failed to recreate context:', createError);
      }
    }
  }
}

/**
 * Stop iOS audio keep-alive
 */
export function stopIOSAudioKeepAlive(): void {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🔓 [iOS Audio] Stopped keep-alive ping');
  }
}

// Auto-install on module load
if (typeof window !== 'undefined') {
  installIOSAudioUnlock();

  // Start/ensure keep-alive on EVERY voice start (not just first!)
  // iOS suspends AudioContext between responses, so we need to re-ensure on each
  window.addEventListener('maya-voice-start', () => {
    console.log('🔓 [iOS Audio] Voice start event - ensuring keep-alive active');
    startIOSAudioKeepAlive();
  }); // Removed { once: true } - we need this for EVERY response!
}

export class VoiceFeedbackPrevention {
  private static instance: VoiceFeedbackPrevention;
  private isMayaSpeaking = false;
  private recognitionInstances = new Set<any>();
  private audioElements = new Set<HTMLAudioElement>();
  private speechSynthesis: SpeechSynthesis | null = null;

  private constructor() {
    this.initializeListeners();
  }

  static getInstance(): VoiceFeedbackPrevention {
    if (!VoiceFeedbackPrevention.instance) {
      VoiceFeedbackPrevention.instance = new VoiceFeedbackPrevention();
    }
    return VoiceFeedbackPrevention.instance;
  }

  /**
   * Initialize event listeners for Maya's speaking state
   */
  private initializeListeners() {
    if (typeof window === 'undefined') return;

    // Listen for Maya voice start
    window.addEventListener('maya-voice-start', () => {
      console.log('🔇 Maya started speaking - muting microphone');
      this.setMayaSpeaking(true);
    });

    // Listen for Maya voice end
    window.addEventListener('maya-voice-end', () => {
      console.log('🎤 Maya finished speaking - unmuting microphone');
      // Add a small delay before re-enabling mic to ensure audio has finished
      setTimeout(() => {
        this.setMayaSpeaking(false);
      }, 500);
    });

    // Track speech synthesis
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  /**
   * Register a speech recognition instance
   */
  registerRecognition(recognition: any) {
    this.recognitionInstances.add(recognition);

    // Override the original start method
    const originalStart = recognition.start.bind(recognition);
    recognition.start = () => {
      if (this.isMayaSpeaking) {
        console.log('⏸️ Delaying recognition start - Maya is speaking');
        // Queue the start for when Maya finishes
        const checkInterval = setInterval(() => {
          if (!this.isMayaSpeaking) {
            clearInterval(checkInterval);
            originalStart();
          }
        }, 100);
      } else {
        originalStart();
      }
    };

    // Track when recognition is actually running
    recognition.addEventListener('start', () => {
      if (this.isMayaSpeaking) {
        console.log('⚠️ Recognition started while Maya speaking - ABORTING immediately');
        // Use abort() instead of stop() for immediate termination
        if (recognition.abort) {
          recognition.abort();
        } else {
          recognition.stop();
        }
      }
    });

    // Auto-restart after Maya finishes speaking
    recognition.addEventListener('end', () => {
      if (!this.isMayaSpeaking) {
        // Recognition ended naturally, not due to Maya speaking
        return;
      }

      // Queue restart for when Maya finishes
      const restartCheck = setInterval(() => {
        if (!this.isMayaSpeaking) {
          clearInterval(restartCheck);
          try {
            recognition.start();
            console.log('🔄 Recognition restarted after Maya finished');
          } catch (error) {
            console.error('Failed to restart recognition:', error);
          }
        }
      }, 100);
    });
  }

  /**
   * Register an audio element (for Maya's voice)
   */
  registerAudioElement(audio: HTMLAudioElement) {
    this.audioElements.add(audio);

    // Track play and end events
    audio.addEventListener('play', () => {
      this.setMayaSpeaking(true);
    });

    audio.addEventListener('ended', () => {
      // Check if any other audio is still playing
      const anyPlaying = Array.from(this.audioElements).some(a => !a.paused);
      if (!anyPlaying) {
        setTimeout(() => this.setMayaSpeaking(false), 300);
      }
    });

    audio.addEventListener('pause', () => {
      const anyPlaying = Array.from(this.audioElements).some(a => !a.paused);
      if (!anyPlaying) {
        this.setMayaSpeaking(false);
      }
    });
  }

  /**
   * Set Maya's speaking state and stop/start recognition accordingly
   */
  private setMayaSpeaking(speaking: boolean) {
    const wasSpeaking = this.isMayaSpeaking;
    this.isMayaSpeaking = speaking;

    if (speaking && !wasSpeaking) {
      // Maya just started speaking - stop all recognition
      this.stopAllRecognition();
    } else if (!speaking && wasSpeaking) {
      // Maya just finished - can restart recognition
      // This is handled by the recognition's end event listener
    }

    // Broadcast state change
    window.dispatchEvent(new CustomEvent('maya-speaking-state', {
      detail: { isSpeaking: speaking }
    }));
  }

  /**
   * Stop all registered speech recognition
   */
  private stopAllRecognition() {
    this.recognitionInstances.forEach(recognition => {
      try {
        if (recognition.abort) {
          recognition.abort(); // Immediately stop without triggering end event
        } else {
          recognition.stop();
        }
        console.log('🛑 Stopped recognition while Maya speaks');
      } catch (error) {
        // Recognition might not be active
      }
    });
  }

  /**
   * Check if Maya is currently speaking
   */
  isSpeaking(): boolean {
    // Check audio elements
    const audioPlaying = Array.from(this.audioElements).some(audio => !audio.paused);

    // Check speech synthesis
    const synthSpeaking = this.speechSynthesis?.speaking || false;

    return this.isMayaSpeaking || audioPlaying || synthSpeaking;
  }

  /**
   * 🛑 INTERRUPT: Stop Maya immediately when user starts speaking
   * This allows natural conversation flow where user can interrupt
   */
  interruptMaya() {
    console.log('🛑 [INTERRUPT] User started speaking - stopping MAIA immediately');

    // Stop all audio elements
    this.audioElements.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        console.log('  ✓ Stopped audio playback');
      } catch (error) {
        // Audio might already be stopped
      }
    });

    // Stop speech synthesis
    if (this.speechSynthesis) {
      try {
        this.speechSynthesis.cancel();
        console.log('  ✓ Cancelled speech synthesis');
      } catch (error) {
        // Synthesis might not be active
      }
    }

    // Dispatch custom event for other components (like MaiaVoiceSystem)
    window.dispatchEvent(new CustomEvent('maya-voice-interrupted', {
      detail: { reason: 'user_started_speaking' }
    }));

    // Mark as not speaking
    this.isMayaSpeaking = false;

    console.log('  ✅ MAIA interrupted successfully');
  }

  /**
   * Clean up audio element when done
   */
  unregisterAudioElement(audio: HTMLAudioElement) {
    this.audioElements.delete(audio);
  }

  /**
   * Clean up recognition instance
   */
  unregisterRecognition(recognition: any) {
    this.recognitionInstances.delete(recognition);
  }
}

/**
 * Helper function to wrap audio playback with feedback prevention
 * Includes iOS audio unlock for Capacitor WebView compatibility
 *
 * iOS STRATEGY: Use Web Audio API to decode and play audio buffer directly
 * This bypasses iOS's aggressive Audio element suspension
 */
export async function playAudioWithFeedbackPrevention(audio: HTMLAudioElement): Promise<void> {
  const prevention = VoiceFeedbackPrevention.getInstance();
  prevention.registerAudioElement(audio);

  // ✅ NATIVE iOS PATH (Capacitor): bypass WKWebView audio entirely
  // Uses AVAudioPlayer which doesn't have the "works once then silent" issue
  // CRITICAL: Check native FIRST - don't touch WebAudio on native path!
  const nativeCheck = isNativeIOS();
  console.log('🎧 [Voice] isNativeIOS check:', nativeCheck);

  if (nativeCheck) {
    console.log('🎧 [Native iOS] === ENTERING NATIVE PATH ===');
    console.log('🎧 [Native iOS] audio.src:', audio.src?.substring(0, 80));

    try {
      // Fetch bytes behind whatever src (blob:, https:, capacitor:// etc.)
      console.log('🎧 [Native iOS] Step 1: Fetching...');
      const resp = await fetch(audio.src);
      console.log('🎧 [Native iOS] Step 2: Got response, status:', resp.status);

      const buf = await resp.arrayBuffer();
      console.log('🎧 [Native iOS] Step 3: Got bytes:', buf.byteLength);

      // Convert to base64 for native plugin
      const base64 = arrayBufferToBase64(buf);
      console.log('🎧 [Native iOS] Step 4: Base64 length:', base64.length);

      // Dispatch voice start
      window.dispatchEvent(new Event('maya-voice-start'));
      console.log('🎧 [Native iOS] Step 5: Dispatched maya-voice-start');

      // Play via native AVAudioPlayer
      console.log('🎧 [Native iOS] Step 6: Calling nativePlayBase64...');
      await nativePlayBase64(base64);
      console.log('🎧 [Native iOS] Step 7: nativePlayBase64 returned');

      // Playback finished
      prevention.unregisterAudioElement(audio);
      window.dispatchEvent(new Event('maya-voice-end'));
      console.log('🎧 [Native iOS] === NATIVE PATH COMPLETE ===');
      return;
    } catch (e) {
      console.error('❌ [Native iOS] FAILED at some step:', e);
      prevention.unregisterAudioElement(audio);
      window.dispatchEvent(new Event('maya-voice-end'));
      throw e;
    }
  }

  // 🔓 iOS FIX (WebView path only): Ensure audio is ready BEFORE every playback
  // This is the key fix - resume AudioContext before EVERY play, not just first
  // iOS does not care about your assumptions.
  const statusBefore = getAudioStatus();
  console.log('[iOS Audio] Before playback:', statusBefore);

  await ensureAudioReady();

  const statusAfter = getAudioStatus();
  console.log('[iOS Audio] After ensureAudioReady:', statusAfter);

  // Dispatch event before playing
  window.dispatchEvent(new Event('maya-voice-start'));

  // 🔓 iOS FIX: Configure audio for iOS compatibility
  audio.setAttribute('playsinline', 'true');
  audio.setAttribute('webkit-playsinline', 'true');

  // Standard path for non-iOS or fallback
  return new Promise((resolve, reject) => {
    audio.addEventListener('ended', () => {
      prevention.unregisterAudioElement(audio);
      window.dispatchEvent(new Event('maya-voice-end'));
      resolve();
    }, { once: true });

    audio.addEventListener('error', (error) => {
      prevention.unregisterAudioElement(audio);
      window.dispatchEvent(new Event('maya-voice-end'));
      reject(error);
    }, { once: true });

    // Play with retry logic
    const attemptPlay = async (attempt: number): Promise<void> => {
      try {
        // CRITICAL: Ensure audio ready before EVERY attempt
        await ensureAudioReady();
        await audio.play();
        console.log(`✅ [iOS Audio] audio.play() succeeded on attempt ${attempt}`);
      } catch (error: any) {
        const status = getAudioStatus();
        console.error(`❌ [iOS Audio] Play attempt ${attempt} failed:`, {
          errorName: error?.name,
          errorMessage: error?.message,
          audioContextState: status.state,
          unlocked: status.unlocked,
          keepAlive: status.keepAliveActive,
        });

        if (attempt < 3 && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
          // Wait and retry
          const delay = Math.min(100 * Math.pow(2, attempt - 1), 500);
          console.log(`🔄 [iOS Audio] Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          return attemptPlay(attempt + 1);
        }

        reject(error);
      }
    };

    attemptPlay(1);
  });
}

/**
 * Helper to wrap speech synthesis with feedback prevention
 */
export function speakWithFeedbackPrevention(utterance: SpeechSynthesisUtterance): void {
  window.dispatchEvent(new Event('maya-voice-start'));

  utterance.addEventListener('end', () => {
    window.dispatchEvent(new Event('maya-voice-end'));
  }, { once: true });

  utterance.addEventListener('error', () => {
    window.dispatchEvent(new Event('maya-voice-end'));
  }, { once: true });

  window.speechSynthesis.speak(utterance);
}

export default VoiceFeedbackPrevention;