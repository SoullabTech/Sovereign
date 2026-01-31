/**
 * Voice System Constants - Single Source of Truth
 *
 * All timing constants for iOS voice handling in ONE place.
 * No more scattered 300ms/500ms/800ms across different files.
 *
 * NOTE: iOS-specific constants are also exported from ios-audio-constants.ts
 * for backwards compatibility. This file re-exports those for consistency.
 */

// Re-export from the primary iOS constants file
export {
  IOS_AUDIO_SESSION_HANDOFF_MS,
  IOS_STREAMING_COOLDOWN_MS,
  IOS_SR_RETRY_DELAY_MS,
  IOS_MAX_RESTART_ATTEMPTS,
  isIOSCapacitor,
  getAudioHandoffDelay,
  getStreamingCooldown,
} from './ios-audio-constants';

/**
 * Time to wait after user finishes speaking before processing.
 * Allows for natural pauses in speech without cutting off.
 */
export const SPEECH_SILENCE_THRESHOLD_MS = 2000;

/**
 * Maximum time MAIA can be in "speaking" state before forced recovery.
 * Prevents stuck state if audio fails silently.
 */
export const MAX_MAIA_SPEAKING_MS = 60000;

/**
 * Minimum time between speaking sessions.
 * Prevents audio feedback loop where MAIA's voice triggers her own mic.
 */
export const ECHO_SUPPRESSION_GAP_MS = 300;

/**
 * Audio watchdog timeout - if audio events received but nothing played.
 */
export const AUDIO_WATCHDOG_MS = 6000;

/**
 * Debounce time for mic restart attempts.
 * Prevents rapid-fire startListening calls that crash the plugin.
 */
export const MIC_RESTART_DEBOUNCE_MS = 500;

/**
 * Maximum consecutive restart attempts before giving up.
 */
export const MAX_RESTART_ATTEMPTS = 5;

/**
 * Delay between restart attempt retries.
 */
export const RESTART_RETRY_DELAY_MS = 300;
