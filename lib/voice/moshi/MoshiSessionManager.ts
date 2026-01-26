/**
 * MOSHI VOICE SESSION MANAGER
 *
 * Per-WebSocket-connection session state for Moshi/PersonaPlex voice pipeline.
 * Owns the same relational stack as text sessions, ensuring unified governance.
 *
 * Key invariant: NO GLOBAL STATE. Each connection has its own session.
 * This prevents cross-user activation leakage.
 */

import {
  createSmootherState,
  getAdaptiveProsodicConfig,
  type ActivationSmootherState,
} from '@/lib/voice/relationalStack/loadConfig'
import type {
  MaiaMode,
  ProsodicConfig,
  SilenceIntent,
} from '@/lib/voice/relationalStack/types'

// ============================================================================
// SESSION STATE
// ============================================================================

/**
 * Relational stack state for voice sessions.
 * Mirrors the text session structure for unified governance.
 */
export interface VoiceRelationalStack {
  currentMode: MaiaMode
  smoother: ActivationSmootherState
  silenceCount: number
  totalSilenceDurationMs: number
  modeDwellTimeMs: Record<MaiaMode, number>
}

/**
 * Full voice session state.
 * One instance per WebSocket connection.
 */
export interface MoshiVoiceSession {
  id: string
  createdAt: number
  lastActivity: number

  /** Relational stack for prosodic governance */
  relationalStack: VoiceRelationalStack

  /** Audio timing state */
  timing: {
    lastUserSpeechEndMs: number | null
    lastMaiaSpeechEndMs: number | null
    currentSilenceDurationMs: number
  }

  /** Session metrics (for success tracking per canon) */
  metrics: {
    totalTurns: number
    spokenResponses: number
    silenceResponses: number
    backchannelCount: number
  }
}

// ============================================================================
// SESSION FACTORY
// ============================================================================

/**
 * Create a new voice session for a WebSocket connection.
 * Always starts in REGULATOR mode (canon: stabilize before strategize).
 */
export function createMoshiVoiceSession(connectionId: string): MoshiVoiceSession {
  const now = Date.now()

  return {
    id: connectionId,
    createdAt: now,
    lastActivity: now,

    relationalStack: {
      currentMode: 'REGULATOR',
      smoother: createSmootherState(),
      silenceCount: 0,
      totalSilenceDurationMs: 0,
      modeDwellTimeMs: {
        REGULATOR: 0,
        NAVIGATOR: 0,
        MYTHOPOET: 0,
      },
    },

    timing: {
      lastUserSpeechEndMs: null,
      lastMaiaSpeechEndMs: null,
      currentSilenceDurationMs: 0,
    },

    metrics: {
      totalTurns: 0,
      spokenResponses: 0,
      silenceResponses: 0,
      backchannelCount: 0,
    },
  }
}

// ============================================================================
// TURN DECISION
// ============================================================================

/**
 * Turn decision output from the relational stack.
 */
export interface TurnDecision {
  /** Blended prosodic config for this turn */
  prosody: ProsodicConfig
  /** False = return SILENCE response */
  shouldSpeak: boolean
  /** True = soft acknowledgment only (not full response) */
  shouldBackchannel: boolean
  /** Computed pause before MAIA speaks (ms) */
  nextPauseMs: number
  /** If !shouldSpeak, the reason */
  silenceIntent?: SilenceIntent
}

/**
 * Context for computing a turn decision.
 */
export interface TurnContext {
  /** The user's message text (for text proxy activation) */
  userText: string
  /** When user stopped speaking (ms timestamp) */
  userSpeechEndTime?: number
  /** When MAIA last finished speaking (ms timestamp) */
  maiaSpeechEndTime?: number
  /** Current timestamp (defaults to Date.now()) */
  now?: number
}

/**
 * Process a turn and get the prosodic decision.
 * Updates session state in place and returns the decision.
 *
 * @param session - The voice session (mutated)
 * @param context - Turn context with user text and timing
 * @returns Turn decision with prosody and speak/silence/backchannel choice
 */
export function processTurn(
  session: MoshiVoiceSession,
  context: TurnContext
): TurnDecision {
  const now = context.now ?? Date.now()
  const { relationalStack, timing } = session

  // Update timing state
  if (context.userSpeechEndTime) {
    timing.lastUserSpeechEndMs = context.userSpeechEndTime
  }
  timing.currentSilenceDurationMs = timing.lastUserSpeechEndMs
    ? now - timing.lastUserSpeechEndMs
    : 0

  // Compute activation from text proxies
  const rawActivation = computeTextActivation(context.userText)

  // Get adaptive prosodic config (updates smoother state)
  const { config: prosody, smootherState } = getAdaptiveProsodicConfig(
    relationalStack.currentMode,
    relationalStack.smoother,
    rawActivation
  )
  relationalStack.smoother = smootherState

  // Update dwell time for current mode
  const dwellDelta = now - session.lastActivity
  relationalStack.modeDwellTimeMs[relationalStack.currentMode] += dwellDelta

  // Compute next pause (random within blended range)
  const pauseRange = prosody.maxPauseBeforeSpeechMs - prosody.minPauseBeforeSpeechMs
  const nextPauseMs = prosody.minPauseBeforeSpeechMs + Math.random() * pauseRange

  // Backchannel decision (probabilistic)
  const shouldBackchannel = Math.random() < prosody.backchannelProbability

  // Silence decision
  // High activation + REGULATOR mode + allowNonResponse = prefer silence
  const activationThreshold = 0.6
  const smoothedActivation = smootherState.lastActivation
  const shouldSilence =
    prosody.allowNonResponse &&
    smoothedActivation > activationThreshold &&
    relationalStack.currentMode === 'REGULATOR'

  // Determine silence intent
  let silenceIntent: SilenceIntent | undefined
  if (shouldSilence) {
    if (smoothedActivation > 0.8) {
      silenceIntent = 'REGULATORY' // Nervous system needs settling
    } else if (relationalStack.currentMode === 'MYTHOPOET') {
      silenceIntent = 'REFLECTIVE' // Meaning needs to emerge
    } else {
      silenceIntent = 'BOUNDARY' // Speaking would intrude
    }
  }

  // Update session activity and metrics
  session.lastActivity = now
  session.metrics.totalTurns++

  if (shouldSilence) {
    session.metrics.silenceResponses++
    relationalStack.silenceCount++
  } else if (shouldBackchannel) {
    session.metrics.backchannelCount++
  } else {
    session.metrics.spokenResponses++
  }

  return {
    prosody,
    shouldSpeak: !shouldSilence,
    shouldBackchannel: !shouldSilence && shouldBackchannel,
    nextPauseMs: Math.round(nextPauseMs),
    silenceIntent,
  }
}

// ============================================================================
// TEXT PROXY ACTIVATION
// ============================================================================

/**
 * Compute activation scalar from text proxies.
 * Returns [0..1] where 0 = calm, 1 = activated.
 *
 * Signals (from config):
 * - punctuationDensity (0.15)
 * - messageLengthBurst (0.20)
 * - urgencyMarkers (0.25)
 * - capsRatio (0.10)
 * - repetitionFrequency (0.15)
 * - cognitiveLoadMarkers (0.15)
 */
export function computeTextActivation(text: string): number {
  if (!text || text.length === 0) return 0

  const signals: Record<string, number> = {}

  // Punctuation density: !, ?, ... per character
  const punctuationCount = (text.match(/[!?…]+/g) || []).length
  signals.punctuationDensity = Math.min(1, punctuationCount / Math.max(1, text.length / 20))

  // Message length burst: very long messages indicate activation
  const wordCount = text.split(/\s+/).length
  signals.messageLengthBurst = Math.min(1, wordCount / 100)

  // Urgency markers: help, urgent, now, please, need
  const urgencyPattern = /\b(help|urgent|now|please|need|asap|immediately|desperate)\b/gi
  const urgencyMatches = (text.match(urgencyPattern) || []).length
  signals.urgencyMarkers = Math.min(1, urgencyMatches / 3)

  // Caps ratio: proportion of uppercase letters
  const letters = text.replace(/[^a-zA-Z]/g, '')
  const capsCount = (letters.match(/[A-Z]/g) || []).length
  signals.capsRatio = letters.length > 0 ? capsCount / letters.length : 0
  // Normalize: all caps = 1, normal = ~0.1
  signals.capsRatio = Math.min(1, signals.capsRatio * 2)

  // Repetition frequency: repeated words or characters
  const words = text.toLowerCase().split(/\s+/)
  const wordFreq = new Map<string, number>()
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  }
  const maxRepeat = Math.max(...wordFreq.values(), 1)
  signals.repetitionFrequency = Math.min(1, (maxRepeat - 1) / 3)

  // Cognitive load markers: I don't know, confused, overwhelmed, can't think
  const loadPattern = /\b(don'?t know|confused|overwhelmed|can'?t think|lost|stuck|too much)\b/gi
  const loadMatches = (text.match(loadPattern) || []).length
  signals.cognitiveLoadMarkers = Math.min(1, loadMatches / 2)

  // Weighted sum (weights from config)
  const weights = {
    punctuationDensity: 0.15,
    messageLengthBurst: 0.20,
    urgencyMarkers: 0.25,
    capsRatio: 0.10,
    repetitionFrequency: 0.15,
    cognitiveLoadMarkers: 0.15,
  }

  let activation = 0
  for (const [signal, weight] of Object.entries(weights)) {
    activation += (signals[signal] || 0) * weight
  }

  // Apply sigmoid mapping (from config: centerPoint=0.5, steepness=2.0)
  const centerPoint = 0.5
  const steepness = 2.0
  const mapped = 1 / (1 + Math.exp(-steepness * (activation - centerPoint)))

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, mapped))
}

// ============================================================================
// MODE TRANSITIONS
// ============================================================================

/**
 * Attempt to transition to a new mode.
 * Returns true if transition was allowed and applied.
 *
 * @param session - The voice session (mutated if transition allowed)
 * @param toMode - Target mode
 * @param trigger - Why the transition is being requested
 */
export function transitionMode(
  session: MoshiVoiceSession,
  toMode: MaiaMode,
  trigger: string
): boolean {
  const { relationalStack } = session
  const fromMode = relationalStack.currentMode

  // Import transition checker
  // Note: We inline the logic here to avoid circular imports
  // Forbidden transitions (from config):
  // - DEFAULT → MYTHOPOET
  // - NAVIGATOR → MYTHOPOET

  const forbidden = [
    { from: 'DEFAULT', to: 'MYTHOPOET' },
    { from: 'NAVIGATOR', to: 'MYTHOPOET' },
  ]

  const isForbidden = forbidden.some(
    (t) => t.from === fromMode && t.to === toMode
  )
  if (isForbidden) {
    console.log(
      `[Relational] Transition ${fromMode} → ${toMode} forbidden (trigger: ${trigger})`
    )
    return false
  }

  // Update dwell time before switching
  const now = Date.now()
  const dwellDelta = now - session.lastActivity
  relationalStack.modeDwellTimeMs[fromMode] += dwellDelta

  // Apply transition
  relationalStack.currentMode = toMode
  session.lastActivity = now

  console.log(
    `[Relational] Transition ${fromMode} → ${toMode} (trigger: ${trigger})`
  )
  return true
}

// ============================================================================
// SILENCE RECORDING
// ============================================================================

/**
 * Record a silence response in the session.
 * Call this when MAIA chooses silence instead of speaking.
 */
export function recordSilence(
  session: MoshiVoiceSession,
  durationMs: number,
  intent: SilenceIntent
): void {
  session.relationalStack.silenceCount++
  session.relationalStack.totalSilenceDurationMs += durationMs
  session.lastActivity = Date.now()

  console.log(
    `[Relational] Silence recorded: ${durationMs}ms (${intent}), total: ${session.relationalStack.silenceCount}`
  )
}

// ============================================================================
// SESSION METRICS
// ============================================================================

/**
 * Get session metrics for success tracking.
 * Per canon: track silence frequency, duration, mode dwell time.
 */
export function getSessionMetrics(session: MoshiVoiceSession) {
  const { relationalStack, metrics, createdAt } = session
  const sessionDurationMs = Date.now() - createdAt

  return {
    sessionDurationMs,
    totalTurns: metrics.totalTurns,
    spokenResponses: metrics.spokenResponses,
    silenceResponses: metrics.silenceResponses,
    backchannelCount: metrics.backchannelCount,
    silenceRatio:
      metrics.totalTurns > 0
        ? metrics.silenceResponses / metrics.totalTurns
        : 0,
    totalSilenceDurationMs: relationalStack.totalSilenceDurationMs,
    modeDwellTimeMs: { ...relationalStack.modeDwellTimeMs },
    currentMode: relationalStack.currentMode,
    currentActivation: relationalStack.smoother.lastActivation,
  }
}
