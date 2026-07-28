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

// Keep-alive is now handled by the shared oscillator in ios-audio-session.ts

/**
 * Start iOS audio keep-alive.
 *
 * Delegates to the shared oscillator-based keep-alive in ios-audio-session.ts
 * which runs a continuous 1Hz near-silent oscillator — no clicks or pops.
 *
 * The previous interval-based approach (playing 1-sample buffers every 2s)
 * caused audible clicks at each buffer boundary and has been replaced.
 */
export function startIOSAudioKeepAlive(): void {
  if (typeof window === 'undefined') return;

  // Delegate to the shared oscillator keep-alive which is already managing
  // the AudioContext lifecycle via ios-audio-session.ts.
  // It started on first user gesture and runs continuously.
  const status = getAudioStatus();
  if (status.keepAliveActive) {
    console.log('🔓 [iOS Audio] Shared oscillator keep-alive already running — no interval needed');
    return;
  }

  // Fall back to starting the oscillator keep-alive if not yet running
  console.log('🔓 [iOS Audio] Starting shared oscillator keep-alive (delegating to ios-audio-session)');
  startSessionKeepAlive();
}

/**
 * Stop iOS audio keep-alive (no-op — lifecycle managed by ios-audio-session.ts)
 */
export function stopIOSAudioKeepAlive(): void {
  // The shared oscillator keep-alive in ios-audio-session.ts manages its own
  // lifecycle. Nothing to stop here from this module.
  console.log('🔓 [iOS Audio] stopIOSAudioKeepAlive: delegated to ios-audio-session lifecycle');
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
   * Register a speech recognition instance.
   *
   * NOTE (2026-07-28): This method used to monkey-patch `start()` to queue-
   * while-speaking, abort recognition that started during MAIA's voice, AND
   * auto-restart the SAME instance when MAIA finished. That made VFP a second,
   * racy restart authority competing with ContinuousConversation's own state
   * machine — and, fatally, it restarted an instance the component had already
   * abandoned, which is how Chrome's Web Speech object ended up a zombie
   * (onstart keeps firing, onresult never does; the mic button looks live but
   * MAIA hears nothing). See lib/voice/webSpeechLifecycle.ts.
   *
   * The recognition lifecycle is now owned entirely by the component: it
   * SUSPENDS (discards) recognition while MAIA speaks and RESUMES with a FRESH
   * instance afterward. VFP no longer patches, aborts, or restarts recognition.
   * It only keeps a reference for cleanup bookkeeping and continues to own
   * audio-element + speech-synthesis feedback state.
   */
  registerRecognition(recognition: any) {
    this.recognitionInstances.add(recognition);
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
    this.isMayaSpeaking = speaking;

    // Recognition suspend/resume around MAIA's voice is owned by the component
    // (it discards the instance while MAIA speaks and rebuilds a fresh one
    // afterward). VFP no longer aborts or restarts recognition here — doing so
    // raced the component and left Chrome's recognition object zombied. We only
    // track + broadcast the speaking state.

    // Broadcast state change
    window.dispatchEvent(new CustomEvent('maya-speaking-state', {
      detail: { isSpeaking: speaking }
    }));
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