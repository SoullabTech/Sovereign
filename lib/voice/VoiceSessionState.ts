/**
 * VoiceSessionState — Public contract between voice transport and orchestration
 *
 * This interface is the SEAM: transport internals hidden, only observables and
 * methods exposed. Session code (OracleConversation, depth routing, practitioner
 * setup) sees this, not the state machine details.
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

export interface VoiceSessionState {
  // Observables (read-only to orchestration)
  phase: VoicePhase;
  transcript: string;           // Current accumulated speech from user
  error: Error | null;          // Recoverable error (permission, timeout, etc.)
  isRecording: boolean;         // Mic actually capturing audio
  platform: 'web' | 'ios' | 'android';

  // Capabilities (what can orchestration do right now?)
  canStartListening: boolean;   // Safe to call startListening()?
  canInterrupt: boolean;        // Safe to interrupt MAIA?

  // Metadata
  lastSpeechAt: number;         // Timestamp of last confirmed user speech (ms)
  startedAt: number;            // Session start time (ms)
  conversationAlive: boolean;   // Is conversation still active? (gate for auto-restart)
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

  // Event registration (returns unsubscribe function)
  onTranscript(handler: TranscriptHandler): () => void;
  onPhaseChange(handler: PhaseChangeHandler): () => void;
  onError(handler: ErrorHandler): () => void;
}
