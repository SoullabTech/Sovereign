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

// ──────────── Recognition evidence (VOICE-RECOGNITION-ENGINE-01) ────────────
//
// Three orthogonal facts replace started/stopped/partial/final. A fourth —
// the human turn — is deliberately NOT something a recognizer may express.

/** Are audio buffers reaching the recognition boundary? */
export type CaptureEvidence = 'flowing' | 'unavailable';

/** Is voiced audio turning into transcript segments? */
export type RecognitionEvidence = 'producing' | 'stalled';

/** May the recognizer still revise this text? */
export type TranscriptStability = 'volatile' | 'finalized';

/**
 * How a segment's text relates to earlier segments of the same utterance.
 * - cumulative: text is the whole utterance so far (SFSpeechRecognizer)
 * - incremental: text is a chunk; finalized appends, volatile replaces the tail (SpeechAnalyzer)
 */
export type TranscriptComposition = 'cumulative' | 'incremental';

/**
 * open | complete — owned by MAIA's silence / turn authority
 * (lib/voice/recognition/humanTurnAuthority.ts). No engine event carries it.
 * Recognizer finality ≠ turn finality.
 */
export type HumanTurnState = 'open' | 'complete';

export type RecognitionEngineKind =
  | 'legacy_sfspeech'                // SFSpeechRecognizer — the baseline / control
  | 'speech_analyzer_transcriber'    // iOS 26 SpeechAnalyzer + SpeechTranscriber
  | 'speech_analyzer_dictation';     // iOS 26 SpeechAnalyzer + DictationTranscriber

/**
 * What the caller asks for. `baseline` is the default and resolves to the
 * legacy engine until the modern engine wins its device witness.
 */
export type RecognitionEnginePreference = 'baseline' | 'modern' | 'dictation' | 'legacy';

/** M7 — capability telemetry. Facts about device + choice. Never transcript content. */
export interface RecognitionCapabilities {
  osVersion: string;
  localeRequested: string;
  preference: RecognitionEnginePreference | string;
  policy: string;
  engineSelected: RecognitionEngineKind | string;
  selectionReason: string;
  speechAnalyzerApiPresent: boolean;
  speechTranscriberAvailable: boolean | null;
  speechTranscriberLocaleSupported: boolean | null;
  dictationTranscriberAvailable: boolean | null;
  dictationTranscriberLocaleSupported: boolean | null;
  legacyAvailable: boolean;
  sessionId?: string;
}

export interface VoiceStartOptions {
  engine?: RecognitionEnginePreference;
  locale?: string;
}

export interface VoiceTranscript {
  text: string;
  confidence: number;       // 0.0–1.0; provider-specific calibration; 0 when not reported
  /**
   * Recognizer finality: the engine will not revise this text.
   * NOT the end of the human turn — see HumanTurnState.
   */
  isFinal: boolean;
  sessionId: string;        // Correlates events within one mic-engagement
  durationMs?: number;      // Length of captured utterance (optional, Phase 2+)

  // ── VOICE-RECOGNITION-ENGINE-01 additions (optional for older providers) ──
  stability?: TranscriptStability;
  composition?: TranscriptComposition;
  engine?: RecognitionEngineKind;
  /** Engine-local, monotonically increasing per session. */
  segmentId?: number;
  /** false when the engine reports no confidence and `confidence` is a placeholder 0. */
  confidenceReported?: boolean;
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
  start(options?: VoiceStartOptions): Promise<void>;

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

  // ──────────── Recognition evidence (VOICE-RECOGNITION-ENGINE-01, optional) ────────────

  /** Buffers flowing to the recognition boundary, or not. */
  onCaptureEvidence?(handler: (e: CaptureEvidence) => void): Unsubscribe;

  /** Voiced audio becoming words, or stalled. */
  onRecognitionEvidence?(handler: (e: RecognitionEvidence) => void): Unsubscribe;

  /** Which engine a session selected and why. No transcript content. */
  onEngineSelected?(handler: (c: RecognitionCapabilities) => void): Unsubscribe;

  /** Probe device capability for a preference/locale without starting. */
  getRecognitionCapabilities?(options?: VoiceStartOptions): Promise<RecognitionCapabilities>;
}
