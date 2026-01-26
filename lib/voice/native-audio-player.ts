/**
 * Native Audio Player - Capacitor plugin for iOS
 * Bypasses WKWebView audio issues by using AVAudioPlayer directly
 *
 * SOVEREIGN ARCHITECTURE:
 * - playBase64 resolves IMMEDIATELY with durationMs (JS never hangs)
 * - playbackEnded event fires when audio actually finishes
 * - Duration-based timeout acts as final governor
 * - MAIA's state machine stays self-consistent even if iOS misbehaves
 *
 * FALLBACK: If native plugin isn't available, uses HTMLAudioElement with data URL
 */

import { Capacitor, registerPlugin, PluginListenerHandle } from '@capacitor/core';

type PlaybackEndedEvent = {
  success: boolean;
  reason?: string;
  error?: string;
};

type NativeAudioPlayerPlugin = {
  playBase64(options: { base64: string }): Promise<{ ok: boolean; durationMs?: number }>;
  stop(): Promise<{ ok: boolean }>;
  addListener(
    eventName: 'playbackEnded',
    callback: (data: PlaybackEndedEvent) => void
  ): Promise<PluginListenerHandle>;
};

const NativeAudioPlayer = registerPlugin<NativeAudioPlayerPlugin>('NativeAudioPlayer');

// Track active listener for cleanup
let activeListener: PluginListenerHandle | null = null;
let activeTimeout: ReturnType<typeof setTimeout> | null = null;

// Pre-warmed HTMLAudioElement for fallback playback
let warmedAudioElement: HTMLAudioElement | null = null;

/**
 * Get or create a pre-warmed audio element for fallback playback
 */
function getWarmedAudioElement(): HTMLAudioElement {
  if (!warmedAudioElement && typeof window !== 'undefined') {
    warmedAudioElement = new Audio();
    warmedAudioElement.preload = 'auto';
    // Play a silent sound to "warm" the audio element (iOS requirement)
    warmedAudioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    warmedAudioElement.volume = 0;
    warmedAudioElement.play().catch(() => {});
    warmedAudioElement.pause();
    warmedAudioElement.volume = 1;
    console.log('🎧 [Native iOS] Pre-warmed HTMLAudioElement for fallback');
  }
  return warmedAudioElement!;
}

/**
 * Check if the native plugin is available
 */
function isNativePluginAvailable(): boolean {
  try {
    // Capacitor.isPluginAvailable checks if plugin is registered
    return Capacitor.isPluginAvailable('NativeAudioPlayer');
  } catch {
    return false;
  }
}

/**
 * Play audio using HTMLAudioElement fallback (data URL approach)
 * Includes timeout governor as belt-and-suspenders for iOS quirks
 */
async function playViaHTMLAudio(base64: string): Promise<void> {
  console.log('🎧 [Fallback] Playing via HTMLAudioElement, base64 length:', base64.length);

  return new Promise((resolve, reject) => {
    const audio = getWarmedAudioElement();
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finish = (reason: string) => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      console.log(`🎧 [Fallback] Playback finished: ${reason}`);
      resolve();
    };

    // Clean up previous handlers
    audio.onended = null;
    audio.onerror = null;
    audio.oncanplaythrough = null;
    audio.ontimeupdate = null;

    // Set up data URL source (MP3 from OpenAI TTS)
    audio.src = `data:audio/mpeg;base64,${base64}`;

    audio.onended = () => {
      finish('onended');
    };

    audio.onerror = (e) => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      console.error('🎧 [Fallback] HTMLAudioElement error:', e);
      reject(new Error('HTMLAudioElement playback failed'));
    };

    // Start playback
    audio.load();
    const playPromise = audio.play();

    if (playPromise) {
      playPromise
        .then(() => {
          console.log('🎧 [Fallback] HTMLAudioElement playback started');

          // Set up timeout governor based on duration
          // If onended doesn't fire, resolve after duration + 500ms
          const durationMs = (audio.duration || 10) * 1000;
          const governorMs = durationMs + 500;
          console.log(`🎧 [Fallback] Setting timeout governor: ${governorMs}ms`);

          timeoutId = setTimeout(() => {
            finish('timeout_governor');
          }, governorMs);
        })
        .catch((err) => {
          if (resolved) return;
          resolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          console.error('🎧 [Fallback] HTMLAudioElement play() rejected:', err);
          reject(err);
        });
    }
  });
}

/**
 * Check if running on native iOS (Capacitor)
 */
export function isNativeIOS(): boolean {
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();
  const ok = platform === 'ios' && isNative;

  if (typeof window !== 'undefined') {
    (window as any).__maia_native_ios__ = ok;
  }

  console.log('🎧 [Native iOS] isNativeIOS=', ok, 'platform=', platform, 'native=', isNative);
  return ok;
}

/**
 * Play audio from base64 string using native AVAudioPlayer
 *
 * Returns a promise that resolves when playback ends (via event or timeout).
 * The native call resolves immediately - we wait for the playbackEnded event.
 *
 * If native plugin isn't available, falls back to HTMLAudioElement with data URL.
 */
export async function nativePlayBase64(base64: string): Promise<void> {
  console.log('🎧 [Native iOS] Calling playBase64, length:', base64.length);

  // Check if native plugin is available
  const hasNativePlugin = isNativePluginAvailable();
  console.log('🎧 [Native iOS] Native plugin available:', hasNativePlugin);

  // If native plugin not available, use HTMLAudioElement fallback immediately
  if (!hasNativePlugin) {
    console.log('🎧 [Native iOS] Using HTMLAudioElement fallback (native plugin unavailable)');
    return playViaHTMLAudio(base64);
  }

  // Clean up any previous listener/timeout
  if (activeListener) {
    await activeListener.remove();
    activeListener = null;
  }
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }

  return new Promise(async (resolve, reject) => {
    let resolved = false;

    const cleanup = async () => {
      if (activeListener) {
        await activeListener.remove();
        activeListener = null;
      }
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        activeTimeout = null;
      }
    };

    const finish = (success: boolean, reason?: string) => {
      if (resolved) return;
      resolved = true;
      console.log('🎧 [Native iOS] Playback finished:', { success, reason });
      cleanup();
      resolve();
    };

    try {
      // Set up event listener BEFORE calling playBase64
      activeListener = await NativeAudioPlayer.addListener('playbackEnded', (data) => {
        console.log('🎧 [Native iOS] playbackEnded event:', data);
        finish(data.success, data.reason);
      });

      // Call native - resolves immediately with duration
      const result = await NativeAudioPlayer.playBase64({ base64 });
      console.log('🎧 [Native iOS] playBase64 returned:', result);

      if (!result.ok) {
        finish(false, 'native_rejected');
        return;
      }

      // Duration-based timeout as FINAL GOVERNOR
      // Even if delegate never fires, we resolve after duration + buffer
      const durationMs = result.durationMs || 5000;
      const timeoutMs = durationMs + 1000; // 1 second buffer

      console.log('🎧 [Native iOS] Setting timeout governor:', timeoutMs, 'ms');

      activeTimeout = setTimeout(() => {
        console.log('🎧 [Native iOS] ⏱️ Timeout governor fired (no event received)');
        finish(false, 'timeout_governor');
      }, timeoutMs);

    } catch (error: any) {
      console.error('🎧 [Native iOS] Error:', error);
      cleanup();

      // If error indicates plugin not available, try fallback
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('not implemented') || errorMsg.includes('not available')) {
        console.log('🎧 [Native iOS] Plugin error, falling back to HTMLAudioElement');
        try {
          await playViaHTMLAudio(base64);
          resolve();
          return;
        } catch (fallbackErr) {
          reject(fallbackErr);
          return;
        }
      }

      reject(error);
    }
  });
}

/**
 * Stop audio playback immediately (native or fallback)
 */
export async function nativeStop(): Promise<void> {
  console.log('🎧 [Native iOS] Stopping playback');

  // Clean up listener/timeout
  if (activeListener) {
    await activeListener.remove();
    activeListener = null;
  }
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }

  // Stop HTMLAudioElement fallback if active
  if (warmedAudioElement) {
    warmedAudioElement.pause();
    warmedAudioElement.currentTime = 0;
  }

  // Try native stop if available
  if (isNativePluginAvailable()) {
    try {
      await NativeAudioPlayer.stop();
    } catch (e) {
      console.log('🎧 [Native iOS] Native stop failed (expected if using fallback):', e);
    }
  }
}

/**
 * Pre-warm the audio element for instant playback
 * Call this early (e.g., on user interaction) to avoid iOS audio delays
 */
export function prewarmAudioElement(): void {
  if (typeof window !== 'undefined') {
    getWarmedAudioElement();
  }
}
