/**
 * iOS Audio Session Manager
 *
 * The ONLY place that controls AudioContext lifecycle on iOS.
 *
 * iOS WKWebView is ruthless about audio:
 * - AudioContext suspends after each playback ends
 * - AVAudioSession deactivates between plays
 * - No visible errors - just silent failure
 *
 * This module solves it with:
 * 1. Single shared AudioContext
 * 2. Resume before EVERY playback (not just first)
 * 3. Silent oscillator to keep AVAudioSession warm
 * 4. Gesture-based unlock on app boot
 */

let sharedAudioContext: AudioContext | null = null;
let audioUnlocked = false;
let sessionKeepAliveStop: (() => void) | null = null;

/**
 * Get or create the shared AudioContext
 * ALWAYS use this - never create AudioContext elsewhere
 */
export function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('[iOS Audio] Created shared AudioContext');
  }
  return sharedAudioContext;
}

/**
 * MUST be called before EVERY playback
 * Not "once at startup" - EVERY SINGLE TIME
 *
 * iOS does not care about your assumptions.
 */
export async function ensureAudioReady(): Promise<AudioContext> {
  const ctx = getAudioContext();

  console.log('[iOS Audio] ensureAudioReady - state:', ctx.state);

  if (ctx.state !== 'running') {
    try {
      await ctx.resume();
      console.log('[iOS Audio] AudioContext resumed → state:', ctx.state);
    } catch (err) {
      console.warn('[iOS Audio] Failed to resume AudioContext:', err);
      // Try to recreate
      sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await sharedAudioContext.resume();
      console.log('[iOS Audio] Recreated AudioContext → state:', sharedAudioContext.state);
      return sharedAudioContext;
    }
  }

  return ctx;
}

/**
 * Unlock audio via first user gesture
 * Call this ONCE on app boot, not per TTS
 *
 * WKWebView sometimes suspends audio between responses
 * unless anchored to a gesture
 */
export function unlockAudioOnUserGesture(): void {
  if (typeof window === 'undefined') return;
  if (audioUnlocked) return;

  const unlock = async () => {
    try {
      const ctx = getAudioContext();
      await ctx.resume();

      // Play silent buffer to fully unlock
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      audioUnlocked = true;
      console.log('[iOS Audio] Audio unlocked via gesture, state:', ctx.state);

      // Start session keep-alive after unlock
      startSessionKeepAlive();

    } catch (err) {
      console.warn('[iOS Audio] Gesture unlock failed:', err);
    }

    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('touchend', unlock);
    window.removeEventListener('click', unlock);
  };

  window.addEventListener('touchstart', unlock, { once: true, passive: true });
  window.addEventListener('touchend', unlock, { once: true, passive: true });
  window.addEventListener('click', unlock, { once: true });

  console.log('[iOS Audio] Gesture unlock listeners installed');
}

/**
 * Keep AVAudioSession alive with silent oscillator
 *
 * This is the TestFlight-only killer fix.
 * AVAudioSession deactivates between plays on iOS.
 * A near-silent oscillator keeps it warm.
 *
 * Apple won't admit this. Everyone ships it.
 */
export function startSessionKeepAlive(): void {
  if (sessionKeepAliveStop) {
    console.log('[iOS Audio] Session keep-alive already running');
    return;
  }

  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    // Inaudible but keeps session alive
    gain.gain.value = 0.0001;
    oscillator.frequency.value = 1; // 1Hz - below human hearing

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();

    sessionKeepAliveStop = () => {
      try {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
      } catch {}
    };

    console.log('[iOS Audio] Session keep-alive started (silent oscillator)');
  } catch (err) {
    console.warn('[iOS Audio] Failed to start session keep-alive:', err);
  }
}

/**
 * Stop session keep-alive (call on app unmount if needed)
 */
export function stopSessionKeepAlive(): void {
  if (sessionKeepAliveStop) {
    sessionKeepAliveStop();
    sessionKeepAliveStop = null;
    console.log('[iOS Audio] Session keep-alive stopped');
  }
}

/**
 * Check if audio is ready for playback
 * Use this for debugging - log before every play
 */
export function getAudioStatus(): { state: string; unlocked: boolean; keepAliveActive: boolean } {
  return {
    state: sharedAudioContext?.state ?? 'no-context',
    unlocked: audioUnlocked,
    keepAliveActive: sessionKeepAliveStop !== null,
  };
}

/**
 * Hard assertion - throws if audio is not ready
 * Use during development to catch silent failures
 */
export function assertAudioReady(): void {
  const status = getAudioStatus();
  if (status.state !== 'running') {
    throw new Error(`[iOS Audio] ASSERTION FAILED: AudioContext state is "${status.state}", expected "running"`);
  }
}

// Auto-install gesture unlock on module load
if (typeof window !== 'undefined') {
  unlockAudioOnUserGesture();
}
