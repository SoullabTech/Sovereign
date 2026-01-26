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

/** Turn decision outcome for ring buffer */
export type TurnOutcome = 'SILENCE' | 'BACKCHANNEL' | 'SPEAK'

/** Turn outcome event with timestamp and optional silence intent */
export interface TurnOutcomeEvent {
  outcome: TurnOutcome
  ts: number
  intent?: SilenceIntent
}

/**
 * Relational stack state for voice sessions.
 * Mirrors the text session structure for unified governance.
 */
export interface VoiceRelationalStack {
  currentMode: MaiaMode
  /** When current mode started (for timeInCurrentModeMs) */
  currentModeSinceTs: number
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

  /** Tuning data (per-turn history for aggregates) */
  tuning: {
    /** Activation values per turn (for distribution stats) */
    activationHistory: number[]
    /** Tempo multiplier per turn (for pacing stats) */
    tempoHistory: number[]
    /** Per-turn decision outcomes with timestamps (ring buffer for windowed stats) */
    turnOutcomes: TurnOutcomeEvent[]
    /** Silence intent counts */
    silenceIntentCounts: Record<SilenceIntent, number>
    /** Silence duration per intent (ms) */
    silenceIntentDurationMs: Record<SilenceIntent, number>
    /** Total mode transitions in session */
    modeTransitions: number
    /** Mode transition timestamps (for per-5m calculation) */
    modeTransitionTimestamps: number[]
    /** Sum of backchannel probabilities (for expected rate calc) */
    backchannelProbabilitySum: number
  }
}

// ============================================================================
// SESSION REGISTRY
// ============================================================================

/**
 * Session store for voice connections.
 * In production, this would be Redis or similar for horizontal scaling.
 */
const voiceSessions = new Map<string, MoshiVoiceSession>()
const SESSION_MAX_AGE_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Get a voice session by ID.
 * Returns null if session doesn't exist or has expired.
 */
export function getVoiceSessionById(sessionId: string): MoshiVoiceSession | null {
  const session = voiceSessions.get(sessionId)
  if (!session) return null

  // Check if expired
  if (Date.now() - session.lastActivity > SESSION_MAX_AGE_MS) {
    voiceSessions.delete(sessionId)
    return null
  }

  return session
}

/**
 * Get or create a voice session.
 * Handles expiration and cleanup.
 */
export function getOrCreateVoiceSession(sessionId: string): MoshiVoiceSession {
  const existing = getVoiceSessionById(sessionId)
  if (existing) return existing

  // Clean up expired sessions periodically
  if (voiceSessions.size > 100) {
    const now = Date.now()
    for (const [id, session] of voiceSessions) {
      if (now - session.lastActivity > SESSION_MAX_AGE_MS) {
        voiceSessions.delete(id)
      }
    }
  }

  const session = createMoshiVoiceSession(sessionId)
  voiceSessions.set(sessionId, session)
  return session
}

/**
 * Get all active session IDs (for debugging/admin).
 */
export function getActiveSessionIds(): string[] {
  return Array.from(voiceSessions.keys())
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
      currentModeSinceTs: now,
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

    tuning: {
      activationHistory: [],
      tempoHistory: [],
      turnOutcomes: [],
      silenceIntentCounts: {
        REGULATORY: 0,
        REFLECTIVE: 0,
        BOUNDARY: 0,
      },
      silenceIntentDurationMs: {
        REGULATORY: 0,
        REFLECTIVE: 0,
        BOUNDARY: 0,
      },
      modeTransitions: 0,
      modeTransitionTimestamps: [],
      backchannelProbabilitySum: 0,
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

  // Record tuning data (per-turn history)
  const { tuning } = session
  tuning.activationHistory.push(smoothedActivation)
  tuning.tempoHistory.push(prosody.tempoMultiplier)
  tuning.backchannelProbabilitySum += prosody.backchannelProbability

  // Cap history arrays to prevent unbounded growth (keep last 500 turns)
  const maxHistory = 500
  if (tuning.activationHistory.length > maxHistory) {
    tuning.activationHistory.shift()
  }
  if (tuning.tempoHistory.length > maxHistory) {
    tuning.tempoHistory.shift()
  }

  // Record turn outcome in ring buffer (for windowed stats)
  const MAX_OUTCOMES = 20
  if (shouldSilence) {
    session.metrics.silenceResponses++
    relationalStack.silenceCount++
    // Record silence intent for tuning
    if (silenceIntent) {
      tuning.silenceIntentCounts[silenceIntent]++
    }
    tuning.turnOutcomes.push({
      outcome: 'SILENCE',
      ts: now,
      intent: silenceIntent,
    })
  } else if (shouldBackchannel) {
    session.metrics.backchannelCount++
    tuning.turnOutcomes.push({
      outcome: 'BACKCHANNEL',
      ts: now,
    })
  } else {
    session.metrics.spokenResponses++
    tuning.turnOutcomes.push({
      outcome: 'SPEAK',
      ts: now,
    })
  }

  // Cap ring buffer
  if (tuning.turnOutcomes.length > MAX_OUTCOMES) {
    tuning.turnOutcomes.shift()
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
  relationalStack.currentModeSinceTs = now
  session.lastActivity = now

  // Track transition for tuning metrics
  session.tuning.modeTransitions++
  session.tuning.modeTransitionTimestamps.push(now)

  // Cap timestamps array (keep last 50 for 5m window calculation)
  if (session.tuning.modeTransitionTimestamps.length > 50) {
    session.tuning.modeTransitionTimestamps.shift()
  }

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

  // Track silence duration per intent for tuning
  session.tuning.silenceIntentDurationMs[intent] += durationMs

  console.log(
    `[Relational] Silence recorded: ${durationMs}ms (${intent}), total: ${session.relationalStack.silenceCount}`
  )
}

// ============================================================================
// SESSION METRICS
// ============================================================================

/**
 * Compute percentile from sorted array.
 */
function percentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0
  const idx = Math.ceil((p / 100) * sortedArr.length) - 1
  return sortedArr[Math.max(0, idx)]
}

/**
 * Compute mean of array.
 */
function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/**
 * Build histogram buckets for [0, 1] values.
 */
function buildBuckets(arr: number[]): Record<string, number> {
  const buckets: Record<string, number> = {
    '0.0-0.2': 0,
    '0.2-0.4': 0,
    '0.4-0.6': 0,
    '0.6-0.8': 0,
    '0.8-1.0': 0,
  }
  for (const v of arr) {
    if (v < 0.2) buckets['0.0-0.2']++
    else if (v < 0.4) buckets['0.2-0.4']++
    else if (v < 0.6) buckets['0.4-0.6']++
    else if (v < 0.8) buckets['0.6-0.8']++
    else buckets['0.8-1.0']++
  }
  return buckets
}

// ============================================================================
// WINDOWED STATS HELPERS
// ============================================================================

/**
 * Compute silence ratio from turn outcomes ring buffer.
 */
function computeRecentSilenceRatioFromOutcomes(
  outcomes: TurnOutcomeEvent[],
  lastN = 20
): number {
  const slice = outcomes.slice(-lastN)
  if (slice.length === 0) return 0
  const silences = slice.filter((o) => o.outcome === 'SILENCE').length
  return silences / slice.length
}

/**
 * Compute silence intent counts from turn outcomes ring buffer.
 */
function computeRecentSilenceIntentCountsFromOutcomes(
  outcomes: TurnOutcomeEvent[],
  lastN = 20
): Record<SilenceIntent, number> {
  const slice = outcomes.slice(-lastN)
  const counts: Record<SilenceIntent, number> = {
    REGULATORY: 0,
    REFLECTIVE: 0,
    BOUNDARY: 0,
  }
  for (const o of slice) {
    if (o.outcome === 'SILENCE' && o.intent) {
      counts[o.intent]++
    }
  }
  return counts
}

/**
 * Compute mode transitions in last 5 minutes from timestamps.
 */
function computeModeTransitionsPer5mFromTimestamps(
  timestamps: number[],
  now: number
): number {
  const windowStart = now - 5 * 60 * 1000
  return timestamps.filter((ts) => ts >= windowStart).length
}

/**
 * Get session metrics for success tracking.
 * Per canon: track silence frequency, duration, mode dwell time.
 * Extended with tuning payload for threshold optimization.
 */
export function getSessionMetrics(session: MoshiVoiceSession) {
  const { relationalStack, metrics, tuning, createdAt, id } = session
  const now = Date.now()
  const sessionDurationMs = now - createdAt

  // Windowed stats (for "signal not vibes" tuning)
  const silenceRatioLast20 = computeRecentSilenceRatioFromOutcomes(tuning.turnOutcomes, 20)
  const silenceIntentCountsLast20 = computeRecentSilenceIntentCountsFromOutcomes(tuning.turnOutcomes, 20)
  const modeTransitionsPer5m = computeModeTransitionsPer5mFromTimestamps(tuning.modeTransitionTimestamps, now)
  const timeInCurrentModeMs = now - relationalStack.currentModeSinceTs

  // Activation stats
  const activationSorted = [...tuning.activationHistory].sort((a, b) => a - b)
  const activationStats = {
    mean: mean(tuning.activationHistory),
    p50: percentile(activationSorted, 50),
    p90: percentile(activationSorted, 90),
    buckets: buildBuckets(tuning.activationHistory),
  }

  // Tempo stats
  const tempoSorted = [...tuning.tempoHistory].sort((a, b) => a - b)
  const tempoStats = {
    mean: mean(tuning.tempoHistory),
    p50: percentile(tempoSorted, 50),
    p90: percentile(tempoSorted, 90),
    min: tempoSorted[0] ?? 0,
    max: tempoSorted[tempoSorted.length - 1] ?? 0,
  }

  // Backchannel expected vs actual
  const backchannelExpectedRate =
    metrics.totalTurns > 0
      ? tuning.backchannelProbabilitySum / metrics.totalTurns
      : 0
  const backchannelActualRate =
    metrics.totalTurns > 0
      ? metrics.backchannelCount / metrics.totalTurns
      : 0

  return {
    sessionId: id,
    sessionDurationMs,

    // Core decision outcomes
    totalTurns: metrics.totalTurns,
    spokenResponses: metrics.spokenResponses,
    silenceResponses: metrics.silenceResponses,
    backchannelCount: metrics.backchannelCount,
    silenceRatio:
      metrics.totalTurns > 0
        ? metrics.silenceResponses / metrics.totalTurns
        : 0,
    totalSilenceDurationMs: relationalStack.totalSilenceDurationMs,

    // Mode state
    currentMode: relationalStack.currentMode,
    modeDwellTimeMs: { ...relationalStack.modeDwellTimeMs },
    modeTransitions: tuning.modeTransitions,

    // Activation distribution (key for tuning thresholds)
    activation: activationStats,

    // Tempo distribution (felt pacing)
    tempoMultiplier: tempoStats,

    // Silence intent breakdown
    silenceIntents: {
      counts: { ...tuning.silenceIntentCounts },
      durationMs: { ...tuning.silenceIntentDurationMs },
    },

    // Backchannel tuning
    backchannel: {
      expectedRate: backchannelExpectedRate,
      actualRate: backchannelActualRate,
      delta: backchannelActualRate - backchannelExpectedRate,
    },

    // Current state snapshot
    currentActivation: relationalStack.smoother.lastActivation,

    // Windowed stats (the 3 numbers for "signal not vibes")
    windowed: {
      silenceRatioLast20,
      silenceIntentCountsLast20,
      modeTransitionsPer5m,
      currentMode: relationalStack.currentMode,
      timeInCurrentModeMs,
    },
  }
}

/** Tuning payload type for external consumption */
export type TuningMetrics = ReturnType<typeof getSessionMetrics>

// ============================================================================
// RED FLAG DETECTION
// ============================================================================

/**
 * Red flags for tuning alerts.
 * These indicate the relational stack may need threshold adjustments.
 */
export interface RelationalRedFlags {
  /** Silence ratio > 30% in last 20 turns (over-silencing) */
  silenceOver30Last20: boolean
  /** More than 6 mode transitions in last 5 minutes (mode jitter) */
  modeJitterOver6Per5m: boolean
  /** Activation stuck below 0.1 for last 20 turns (under-detecting) */
  lowActivationStuck: boolean
  /** Activation stuck above 0.8 for last 20 turns (over-detecting) */
  highActivationStuck: boolean
}


/**
 * Check if activation is stuck at extreme values.
 */
function checkActivationStuck(
  session: MoshiVoiceSession,
  lastN = 20
): { low: boolean; high: boolean } {
  const history = session.tuning.activationHistory
  if (history.length < lastN) return { low: false, high: false }

  const window = history.slice(-lastN)
  const allLow = window.every((a) => a < 0.1)
  const allHigh = window.every((a) => a > 0.8)

  return { low: allLow, high: allHigh }
}

/**
 * Get red flags for a session.
 * Use these for tuning alerts and dashboard indicators.
 */
export function getRelationalRedFlags(session: MoshiVoiceSession): RelationalRedFlags {
  const now = Date.now()
  const silenceRatioLast20 = computeRecentSilenceRatioFromOutcomes(session.tuning.turnOutcomes, 20)
  const modeTransitionsPer5m = computeModeTransitionsPer5mFromTimestamps(session.tuning.modeTransitionTimestamps, now)
  const activationStuck = checkActivationStuck(session, 20)

  const flags: RelationalRedFlags = {
    silenceOver30Last20: silenceRatioLast20 > 0.3,
    modeJitterOver6Per5m: modeTransitionsPer5m > 6,
    lowActivationStuck: activationStuck.low,
    highActivationStuck: activationStuck.high,
  }

  // Log red flags when they fire (for immediate signal)
  const activeFlags = Object.entries(flags)
    .filter(([_, v]) => v)
    .map(([k]) => k)

  if (activeFlags.length > 0) {
    console.warn(
      `🚩 [Relational] Red flags for ${session.id}: ${activeFlags.join(', ')}`
    )
  }

  return flags
}
