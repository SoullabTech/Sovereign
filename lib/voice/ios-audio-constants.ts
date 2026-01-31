/**
 * iOS Audio Session Constants
 *
 * SINGLE SOURCE OF TRUTH for all iOS audio timing.
 * iOS needs time to transition between playback and record modes.
 * Without these delays, SpeechRecognition.start() crashes with:
 *   AUIOClient_StartIO failed (error 2003329396)
 *
 * DO NOT scatter timing values across files. Reference THIS file.
 */

/**
 * Time (ms) iOS needs to transition audio session from playback to record mode.
 * Used after MAIA finishes speaking, before starting speech recognition.
 *
 * Too short (< 1000ms): Crashes in native SpeechRecognition plugin
 * Too long (> 2000ms): Feels unresponsive
 *
 * 1200ms tested working on iOS 18 - fast enough to feel responsive,
 * long enough for audio session handoff.
 */
export const IOS_AUDIO_SESSION_HANDOFF_MS = 1200;

/**
 * Additional cooldown (ms) before mic restart after streaming audio completes.
 * This is ON TOP OF the handoff delay - used for echo suppression and ensuring
 * the audio pipeline has fully cleared.
 */
export const IOS_STREAMING_COOLDOWN_MS = 1000;

/**
 * Delay (ms) between retry attempts when speech recognition fails to start.
 * Each retry needs its own handoff window.
 */
export const IOS_SR_RETRY_DELAY_MS = 1500;

/**
 * Maximum number of consecutive restart attempts before giving up.
 * Prevents infinite crash loops.
 */
export const IOS_MAX_RESTART_ATTEMPTS = 5;

/**
 * Check if current platform is iOS (Capacitor native app)
 */
export function isIOSCapacitor(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Capacitor native
  const capacitor = (window as any).Capacitor;
  if (capacitor?.isNativePlatform?.() && capacitor?.getPlatform?.() === 'ios') {
    return true;
  }

  // Fallback to user agent for PWA/Safari
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Get the appropriate delay for the current platform.
 * Returns 0 for non-iOS platforms (no delay needed).
 */
export function getAudioHandoffDelay(): number {
  return isIOSCapacitor() ? IOS_AUDIO_SESSION_HANDOFF_MS : 0;
}

/**
 * Get the streaming cooldown for the current platform.
 */
export function getStreamingCooldown(): number {
  return isIOSCapacitor() ? IOS_STREAMING_COOLDOWN_MS : 0;
}
