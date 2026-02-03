// MAIA Relational Stack - Type Definitions
// Canonical spec: docs/maia/MAIA_RELATIONAL_STACK_SPEC.md

/**
 * MAIA operates in three modes - these are timing + restraint profiles, not personalities.
 * Default is always REGULATOR (stabilize before strategize).
 */
export type MaiaMode = 'REGULATOR' | 'NAVIGATOR' | 'MYTHOPOET'

/**
 * Silence is a first-class response type with explicit intent.
 * - REGULATORY: nervous system needs settling, not language
 * - REFLECTIVE: meaning needs to emerge in the user, not be supplied
 * - BOUNDARY: speaking would intrude, perform, or overstep
 */
export type SilenceIntent = 'REGULATORY' | 'REFLECTIVE' | 'BOUNDARY'

/**
 * Prosodic configuration for each mode.
 * Controls timing, pacing, and restraint - not tone or personality.
 */
export interface ProsodicConfig {
  /** Tempo relative to baseline words-per-second (e.g., 0.6 = 60% speed) */
  tempoMultiplier: number
  /** Minimum delay before MAIA begins speaking (ms) */
  minPauseBeforeSpeechMs: number
  /** Maximum delay before MAIA begins speaking (ms) */
  maxPauseBeforeSpeechMs: number
  /** How long silence is tolerated before considering a response (ms) */
  silenceToleranceMs: number
  /** Whether MAIA can choose not to respond at all */
  allowNonResponse: boolean
  /** Maximum utterance length constraint */
  maxUtteranceLength: 'short' | 'medium' | 'long'
  /** Probability of soft backchannels (0.0 - 1.0) */
  backchannelProbability: number
}

/**
 * MAIA's response is either spoken audio or intentional silence.
 * Silence is chosen, logged, and observable - not a failure state.
 */
export type MaiaResponse =
  | { type: 'SPOKEN'; audioStream: ReadableStream<Uint8Array> }
  | { type: 'SILENCE'; durationMs: number; intent: SilenceIntent }

/**
 * Mode transition rules - defines what triggers are allowed/forbidden.
 */
export interface ModeTransition {
  from: MaiaMode | 'DEFAULT'
  to: MaiaMode
  when?: string
  why?: string
}

/**
 * Full prosody configuration file shape.
 */
export interface ProsodyConfigFile {
  version: string
  defaultMode: MaiaMode
  modes: Record<MaiaMode, ProsodicConfig>
  transitions: {
    allowed: ModeTransition[]
    forbidden: ModeTransition[]
  }
  silence: {
    enabled: boolean
    intents: SilenceIntent[]
  }
  voiceEmbedding: {
    default: string
    policy: 'instrument_only'
  }
}

/**
 * Session-scoped activation smoother state.
 * Each session/connection should have its own instance.
 */
export interface ActivationSmootherState {
  lastActivation: number
  lastTime: number
}

/**
 * Runtime state for the relational stack.
 * Should be stored per-session, not globally.
 */
export interface RelationalStackState {
  currentMode: MaiaMode
  lastTransitionTime: number
  silenceCount: number
  totalSilenceDurationMs: number
  modeDwellTimeMs: Record<MaiaMode, number>
  /** Session-scoped activation smoother */
  smoother: ActivationSmootherState
}

// ============================================================================
// ADAPTIVE SCALING TYPES
// ============================================================================

/**
 * Individual signal that contributes to activation measurement.
 */
export interface ActivationSignal {
  name: string
  weight: number
}

/**
 * Text-based proxy signals for activation detection.
 * Works without audio analysis.
 */
export interface TextProxyInputs {
  enabled: boolean
  signals: ActivationSignal[]
}

/**
 * Audio-based signals for activation detection.
 * Requires duplex audio stream.
 */
export interface AudioSignalInputs {
  enabled: boolean
  signals: ActivationSignal[]
}

/**
 * How raw signals are mapped to activation scalar.
 */
export interface ActivationMapping {
  method: 'weighted_sigmoid' | 'linear' | 'exponential'
  centerPoint: number
  steepness: number
  floor: number
  ceiling: number
}

/**
 * How a single parameter blends with activation.
 */
export interface BlendParameter {
  /** 'direct' = increases with activation, 'inverse' = decreases */
  direction: 'direct' | 'inverse'
  /** Maximum delta applied at full activation */
  maxDelta: number
  comment?: string
}

/**
 * Hysteresis and smoothing to prevent jitter.
 * MAIA responds to trends, not spikes.
 */
export interface RateLimits {
  /** Window for smoothing activation changes (ms) */
  smoothingWindowMs: number
  /** Maximum change in activation per second */
  maxChangePerSecond: number
  /** Minimum change threshold to register (prevents micro-adjustments) */
  hysteresisThreshold: number
  /** How long to wait before confirming a new stable state (ms) */
  settleDurationMs: number
  comment?: string
}

/**
 * Per-mode overrides for blend parameters.
 * Allows tuning how much each mode shifts with activation.
 */
export type BlendOverrides = Partial<Record<MaiaMode, {
  tempoMultiplier?: Partial<BlendParameter>
  pauseBeforeSpeechMs?: Partial<BlendParameter>
  silenceToleranceMs?: Partial<BlendParameter>
  backchannelProbability?: Partial<BlendParameter>
  comment?: string
}>>

/**
 * Adaptive scaling configuration - enables continuous affect-responsive modulation.
 */
export interface AdaptiveScalingConfig {
  enabled: boolean
  description?: string
  inputs: {
    textProxies: TextProxyInputs
    audioSignals: AudioSignalInputs
  }
  mapping: ActivationMapping
  blend: {
    description?: string
    tempoMultiplier: BlendParameter
    pauseBeforeSpeechMs: BlendParameter
    silenceToleranceMs: BlendParameter
    backchannelProbability: BlendParameter
    overrides?: BlendOverrides
  }
  rateLimits: RateLimits
}

/**
 * Full prosody configuration file shape (with adaptive scaling).
 */
export interface ProsodyConfigFile {
  version: string
  defaultMode: MaiaMode
  modes: Record<MaiaMode, ProsodicConfig>
  transitions: {
    allowed: ModeTransition[]
    forbidden: ModeTransition[]
  }
  silence: {
    enabled: boolean
    intents: SilenceIntent[]
  }
  voiceEmbedding: {
    default: string
    policy: 'instrument_only'
  }
  adaptiveScaling: AdaptiveScalingConfig
}
