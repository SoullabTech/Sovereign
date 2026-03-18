/**
 * VOICE_TIMING — single source of truth for all voice turn-taking thresholds.
 *
 * Edit here to tune the system. All values in milliseconds.
 * Applies to both PWA (Web Speech API) and native iOS (Capacitor SpeechRecognition).
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

  // ─── Native iOS (Capacitor SpeechRecognition) ────────────────────────────────

  /** 2.5s of low audio after last speech = end of utterance */
  NATIVE_SILENCE_MS: 2500,

  /**
   * How long after last high-audio level to still consider speech "recent".
   * Prevents false-positive silence detection from breath gaps between clauses.
   */
  NATIVE_RECENT_SPEECH_MS: 3500,

  // ─── Grace window (both paths) ────────────────────────────────────────────────

  /**
   * After the silence timer fires, wait this additional window before committing
   * the transcript to the oracle. If speech resumes during the grace window,
   * finalization is cancelled and the silence timer resets.
   *
   * This protects against cutting off speakers who pause briefly between clauses
   * — common for reflective, thoughtful speech.
   */
  GRACE_WINDOW_MS: 750,
} as const;
