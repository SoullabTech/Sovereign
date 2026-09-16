/**
 * VOICE_TIMING — mode-level floor timing for voice conversation modes.
 *
 * Edit here to tune the system. All values in milliseconds.
 * TURN-01 owns member-specific endpoint timing; these are mode-level floors.
 *
 * Design intent: MAIA is a contemplative companion, not a rapid-fire assistant.
 * Thresholds should tolerate natural pauses between thoughts without cutting off.
 */
export const VOICE_TIMING = {
  // ─── Web Speech API (PWA / desktop Chrome) ──────────────────────────────────

  /** Talk mode: 3.5s allows mid-thought pauses without premature finalization */
  WEB_SILENCE_TALK_MS: 3500,

  /** Care mode: 10s — spacious room for emotional processing */
  WEB_SILENCE_CARE_MS: 10000,

  /** Scribe mode: never auto-send — manual trigger only */
  WEB_SILENCE_SCRIBE_MS: 999999,

  // Native endpoint timing moved to lib/voice/turnTaking.ts (TURN-01).
  // Keep this module only for mode-level floors (Talk/Care/Scribe); there must
  // not be a second native silence authority here.
} as const;
