/**
 * VoiceSessionState — Public contract between voice transport and orchestration
 *
 * This interface is the SEAM: transport internals hidden, only observables and
 * methods exposed. Session code (OracleConversation, depth routing, practitioner
 * setup) sees this, not the state machine details.
 */

/**
 * VoicePhase — Descriptive state (what is happening right now)
 *
 * Note: Phase alone is NOT sufficient for UI permission logic.
 * Same phase can have different permissions under different modes.
 * Example: "listening" during wake-word mode differs from "listening" during tap-to-talk.
 * Use `capabilities` for action enablement, phase for UI rendering/feedback.
 */
export type VoicePhase =
  | 'idle'           // Ready for user tap or auto-start
  | 'arming'         // Permissions/setup in progress
  | 'listening'      // Mic active, waiting for speech
  | 'capturing'      // User speaking, accumulating transcript
  | 'submitting'     // Transcript sent to server
  | 'processing'     // MAIA processing, mic suppressed/soft
  | 'speaking'       // MAIA speaking, mic paused
  | 'interrupted'    // iOS audio interruption (phone call, Siri, etc.)
  | 'error';         // Recoverable error

/**
 * VoiceCapabilities — What actions are currently legal
 *
 * These are derived from phase + mode + context (not from phase alone).
 * UI should prefer capabilities for action enablement, not phase comparisons.
 *
 * Future modes (wake-word, continuous, passive) will change capability
 * rules even when phase is identical.
 *
 * ⚠️ SEAM RULE: Consumer components MUST use capabilities for action enablement.
 * Do not re-derive permissions from phase in OracleConversation or UI components.
 * Bad: const canInterrupt = state.phase === 'speaking';
 * Good: const canInterrupt = state.capabilities.canInterrupt;
 * This rule prevents seam leakage when transport behavior evolves.
 */
export interface VoiceCapabilities {
  canStartListening: boolean;   // Safe to call startListening()?
  canStopListening: boolean;    // Safe to stop (or will it error)?
  canInterrupt: boolean;        // Safe to interrupt MAIA?
  canSubmit: boolean;           // Can user submit current transcript?
  canClearError: boolean;       // Can user dismiss error state?
}

export interface VoiceSessionState {
  // ─── STATE (what is happening) ───────────────────────────────────────
  phase: VoicePhase;
  transcript: string;           // Current accumulated speech from user
  interimTranscript: string;    // Partial speech (pending confirmation)
  error: Error | null;          // Recoverable error (permission, timeout, etc.)

  // ─── CONTEXT (where we are) ──────────────────────────────────────────
  isRecording: boolean;         // Mic actually capturing audio
  platform: 'web' | 'ios' | 'android';
  isRecovering: boolean;        // Arming recovery in progress? (for UI feedback)

  // ─── CAPABILITIES (what can we do) ────────────────────────────────────
  // ⚠️ SEAM RULE: Use ONLY for action enablement. Never re-derive in components.
  // phase is for UI rendering/feedback. capabilities is for permissions.
  capabilities: VoiceCapabilities;

  // ─── METADATA ─────────────────────────────────────────────────────────
  lastSpeechAt: number;         // Timestamp of last confirmed user speech (ms)
  startedAt: number;            // Session start time (ms)
  conversationAlive: boolean;   // Is conversation still active? (gate for auto-restart)

  // ─── FUTURE: Reserved for mode distinction ────────────────────────────
  // Once you add push-to-talk, wake-word, continuous, passive modes,
  // you'll want:
  //   mode: VoiceInteractionMode; // 'tap_to_talk' | 'continuous' | 'wake_word' | 'passive'
  // This lets phase + mode answer: "listening" under what rules?
}

export interface VoiceSessionMethods {
  // Actions (may fail, return Promise or void)
  startListening(reason: string): Promise<void>;
  stopListening(): void;
  interrupt(): void;
  clearError(): void;

  // Lifecycle
  cleanup(): void;
}

/**
 * Event handler types — orchestration registers these callbacks
 * and reacts to voice events without knowing how they're generated.
 */
export type TranscriptHandler = (text: string) => void;
export type PhaseChangeHandler = (phase: VoicePhase) => void;
export type ErrorHandler = (err: Error) => void;

export interface UseVoiceSessionResult {
  // State + Methods (the two halves of the public interface)
  state: VoiceSessionState;
  methods: VoiceSessionMethods;

  /**
   * The phase RIGHT NOW, read through the live ref rather than the render that
   * produced this object.
   *
   * ⛔ PLATFORM-SOVEREIGN-REENTRY-01. `state` is a plain object literal built
   * once per render, so `state.phase` is frozen at the moment the consumer's
   * closure captured it. A caller that starts the microphone and then checks
   * `state.phase` inside a `setTimeout` is asking the past whether the future
   * happened, and the answer is always no. Anything verifying the effect of an
   * action it just took must call this instead.
   */
  getPhase(): VoicePhase;

  // Event registration (returns unsubscribe function)
  onTranscript(handler: TranscriptHandler): () => void;
  onPhaseChange(handler: PhaseChangeHandler): () => void;
  onError(handler: ErrorHandler): () => void;
}
