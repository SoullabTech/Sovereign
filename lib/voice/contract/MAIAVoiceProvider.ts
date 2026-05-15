/**
 * MAIAVoiceProvider — single contract for voice runtime across platforms.
 *
 * Replaces the 5-layer JS state machine that has bedeviled iOS voice
 * continuity for over a year. Implementations own the full lifecycle:
 * audio session, mic capture, recognition, restart, error recovery.
 *
 * The React/MAIA layer reads state and receives events. It does NOT
 * mutate voice state directly. Single source of truth lives below.
 *
 * Design doc: docs/architecture/MAIA_VOICE_CONTROLLER_DESIGN.md
 *
 * Implementations:
 * - IOSNativeVoiceProvider (Phase 1+) — wraps Swift VoiceController plugin
 * - Future: AndroidNativeVoiceProvider (Phase 8+)
 * - Emergency only: DeepgramVoiceProvider (not built unless native fails)
 *
 * Phase scope:
 * - Phase 1 (this file): scaffold + start/stop/transcript events
 * - Phase 3: pauseForTTS, resumeAfterTTS, interrupt
 * - Phase 4: background/foreground recovery (lives inside provider, not contract)
 */

export type VoiceState =
  | 'idle'           // No active session
  | 'listening'      // Actively capturing user speech
  | 'paused'         // Session active but mic temporarily off (MAIA speaking)
  | 'transitioning'  // Mid-state-change
  | 'error';         // Last operation failed; needs recovery

export interface VoiceTranscript {
  text: string;
  confidence: number;       // 0.0–1.0; provider-specific calibration
  isFinal: boolean;         // false = interim hypothesis; true = committed
  sessionId: string;        // Correlates events within one mic-engagement
  durationMs?: number;      // Length of captured utterance (optional, Phase 2+)
}

export type VoiceErrorCode =
  | 'permission_denied'
  | 'no_microphone'
  | 'recognizer_unavailable'
  | 'session_expired'        // 60-sec SFSpeech limit hit and rotation failed
  | 'audio_session_conflict' // TTS or other audio fighting for the session
  | 'background_lost'        // Backgrounded too long, recognition died
  | 'recognition_failed'     // Generic recognition error from underlying engine
  | 'unknown';

export interface VoiceError {
  code: VoiceErrorCode;
  message: string;
  recoverable: boolean;     // Can the provider self-heal, or does caller need to act?
  sessionId?: string;
  underlying?: string;      // Native error description if available
}

export type Unsubscribe = () => void;

export interface MAIAVoiceProvider {
  // ──────────── Lifecycle (Phase 1) ────────────

  /** Begin listening. Idempotent — calling while listening is a no-op. */
  start(): Promise<void>;

  /** End the listening session entirely. Tears down audio resources. */
  stop(): Promise<void>;

  // ──────────── Lifecycle (Phase 3, declared here for type stability) ────────────

  /** MAIA is about to speak — mute mic but keep session alive. */
  pauseForTTS?(): Promise<void>;

  /** MAIA finished speaking — resume listening immediately. */
  resumeAfterTTS?(): Promise<void>;

  /** User barge-in: cancel current MAIA speech, return to listening. */
  interrupt?(): Promise<void>;

  // ──────────── State ────────────

  /** Single source of truth for current voice state. */
  getState(): VoiceState;

  // ──────────── Events ────────────

  /** Partial recognition result (interim hypothesis, may change). */
  onTranscriptPartial(handler: (t: VoiceTranscript) => void): Unsubscribe;

  /** Final recognition result for one utterance. Send this to MAIA. */
  onTranscriptFinal(handler: (t: VoiceTranscript) => void): Unsubscribe;

  /** Voice state changed. Authoritative; React reads, never writes. */
  onStateChange(handler: (state: VoiceState) => void): Unsubscribe;

  /** Error occurred. May or may not be recoverable per code. */
  onError(handler: (error: VoiceError) => void): Unsubscribe;
}
