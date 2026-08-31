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

  // ─── Session liveness (how long the mic stays fluently open) ────────────────

  /**
   * How long a member-started listening session stays ALIVE across silence.
   *
   * This is NOT "how long to wait before submitting a turn" (that is the
   * WEB_SILENCE_* / NATIVE_SILENCE_MS thresholds above). This is the window in
   * which the mic keeps re-arming itself after the platform ends a recognition
   * epoch on its own.
   *
   * WHY THIS EXISTS (Kelly, 2026-08-31, PWA on Chrome): the browser's Web
   * Speech API ends a recognition epoch after ~5-8s of silence. The onend
   * handler re-arms only while the conversation reads as "recently active";
   * that liveness window used to be 15-45 SECONDS, so a member who paused to
   * think — or who was simply listening — found the mic had stood down after
   * roughly twenty seconds. Silence is not absence. A contemplative companion
   * that stops hearing you the moment you stop talking is not listening; it is
   * waiting for input.
   *
   * The requirement is explicit: fluent listening for at least the first hour
   * of a conversation, longer for some. So the window is one hour, and the
   * post-MAIA window is the same — a member reflecting on what MAIA just said
   * is mid-conversation, not idle.
   *
   * SOVEREIGNTY NOTE. This lengthens a session the member STARTED and can end
   * at any moment (the bar's stop control, the mic toggle). It does not open
   * the mic on its own, does not change the push-to-talk default, and does not
   * survive an explicit stop. It is paired with the on-screen transcript layer
   * (VoiceInteractionBar) so an open mic is always a VISIBLE mic: the member
   * can see what is being registered rather than trusting that it is.
   */
  CONVERSATION_ALIVE_MS: 60 * 60 * 1000,

  /**
   * Liveness window measured from the end of MAIA's own speech. Held equal to
   * CONVERSATION_ALIVE_MS: the pause after MAIA finishes is the single most
   * common place a member goes quiet, and it is the last place the mic should
   * give up.
   */
  POST_RESPONSE_ALIVE_MS: 60 * 60 * 1000,

  /**
   * Liveness window measured from an explicit mic tap. Shorter than the two
   * above only because a tap with nothing following it is the one case where
   * the member may have armed the mic by accident.
   */
  MIC_TAP_ALIVE_MS: 5 * 60 * 1000,
} as const;
