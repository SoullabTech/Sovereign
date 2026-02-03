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

// ============================================================================
// PROSODY BASELINE (Conversation Prosody Memory)
// ============================================================================

/**
 * Prosody baseline persisted per session.
 * Prevents voice from "resetting" to neutral between turns.
 * MAIA's voice has continuity within a conversation.
 */
export interface SessionProsodyBaseline {
  /** Baseline warmth (drifts toward member's comfort) */
  warmth: 'cool' | 'neutral' | 'warm' | 'very_warm';
  /** Baseline pace (adjusts based on conversation rhythm) */
  pace: 'slow' | 'steady' | 'brisk';
  /** Baseline emphasis */
  emphasis: 'minimal' | 'selective' | 'strong';
  /** How "settled" the voice is (0..1). Higher = baseline sticks more. */
  continuity: number;
  /** Last update timestamp (for decay on long gaps) */
  updatedAt: number;
}

/** Turn outcome event with timestamp and optional silence intent */
export interface TurnOutcomeEvent {
  outcome: TurnOutcome
  ts: number
  intent?: SilenceIntent
}

// ============================================================================
// GUIDANCE POSTURE
// ============================================================================

/** Guidance posture for relational response shaping */
export type GuidancePosture = 'MOVE' | 'MIRROR' | 'MEET'

/** Guidance signal computed from windowed stats */
export interface GuidanceSignal {
  posture: GuidancePosture
  brevity: 'brief' | 'moderate' | 'expansive'
  modeLockMs: number // 0 = no lock
  speakBias: number // -1..+1, + favors speaking
  reason: string // lightweight debug string
}

// ============================================================================
// MOVE OUTCOME TRACKING (Soulfulness as Architecture)
// ============================================================================

/** What MAIA was trying to accomplish (Meet → Mirror → Move) */
export type MoveIntent =
  | 'MEET_REGULATE'   // Settling the nervous system
  | 'MEET_BOUNDARY'   // Honoring a limit
  | 'MIRROR_REFLECT'  // Reflecting back what was heard
  | 'MOVE_NEXT_STEP'  // Offering a concrete next action
  | 'MOVE_REFRAME'    // Offering a new perspective
  | 'MOVE_CREATIVE'   // Sparking generative imagination

/** How MAIA responded */
export type MaiaResponseType = 'SPOKEN' | 'SILENCE'

/** What happened after MAIA's move (classified on next user turn) */
export type MoveOutcome =
  | 'SETTLED'        // Activation dropped, user calmer
  | 'WARM_CONTINUE'  // Engagement continues at same or lower activation
  | 'ESCALATED'      // Activation rose, user more activated
  | 'DISENGAGED'     // User went silent or left
  | 'UNKNOWN'        // Not enough signal to classify

/** Event recording MAIA's move and its outcome */
export interface MoveOutcomeEvent {
  /** Timestamp when outcome was classified (user's next turn) */
  tsOutcome: number
  /** Timestamp when MAIA completed the move */
  tsMove: number
  /** What MAIA was trying to do */
  moveIntent: MoveIntent
  /** How MAIA responded */
  responseType: MaiaResponseType
  /** Activation at time of move */
  activationAtMove: number
  /** Activation at next user turn (filled on outcome) */
  activationAtOutcome?: number
  /** Classified outcome (filled on outcome) */
  outcome?: MoveOutcome
  /** Latency until next user turn (ms) */
  latencyToOutcomeMs?: number
}

/** Pending move awaiting outcome classification */
export interface PendingMove {
  ts: number
  moveIntent: MoveIntent
  responseType: MaiaResponseType
  activationAtMove: number
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
  /** Move awaiting outcome classification (set when MAIA completes a turn) */
  pendingMove?: PendingMove
  /** Mode lock expiration (prevents jitter) */
  modeLockUntilTs?: number
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

  /** Prosody baseline for conversation continuity (Sesame-style voice memory) */
  prosodyBaseline: SessionProsodyBaseline

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
    /** Move outcomes (intent → outcome pairs for soulfulness tracking) */
    moveOutcomes: MoveOutcomeEvent[]
    /** Last computed guidance (cached for consistency + metrics) */
    lastGuidance?: GuidanceSignal
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

    // Start with neutral baseline — continuity builds over turns
    prosodyBaseline: {
      warmth: 'neutral',
      pace: 'steady',
      emphasis: 'minimal',
      continuity: 0,
      updatedAt: now,
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
      moveOutcomes: [],
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
  /** If a pending move was classified this turn, the outcome event (for SSE emission) */
  classifiedOutcome?: MoveOutcomeEvent
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

  // ── GUIDANCE POSTURE ──
  // Compute stable posture signal from windowed stats (pass `now` for consistent timebase)
  const guidance = computeGuidancePosture(session, now)

  // Cache guidance for metrics + consistency
  session.tuning.lastGuidance = guidance

  // Apply mode lock if guidance suggests it
  if (guidance.modeLockMs > 0) {
    const until = now + guidance.modeLockMs
    // Only extend, never shorten
    relationalStack.modeLockUntilTs = Math.max(
      relationalStack.modeLockUntilTs ?? 0,
      until
    )
  }

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

  // ── MOVE OUTCOME EMISSION ──
  // If there's a pending move from MAIA's last turn, classify its outcome
  // Uses smoothed activation for both move and outcome (comparable deltas)
  let classifiedOutcome: MoveOutcomeEvent | undefined
  if (relationalStack.pendingMove) {
    const pending = relationalStack.pendingMove
    const latencyMs = now - pending.ts
    const activationNow = smootherState.lastActivation
    const outcome = classifyMoveOutcome(
      pending.activationAtMove,
      activationNow,
      latencyMs
    )

    // Record the completed move outcome event
    classifiedOutcome = {
      tsOutcome: now,
      tsMove: pending.ts,
      moveIntent: pending.moveIntent,
      responseType: pending.responseType,
      activationAtMove: pending.activationAtMove,
      activationAtOutcome: activationNow,
      outcome,
      latencyToOutcomeMs: latencyMs,
    }
    session.tuning.moveOutcomes.push(classifiedOutcome)

    // Cap buffer (keep last 100 move outcomes)
    if (session.tuning.moveOutcomes.length > 100) {
      session.tuning.moveOutcomes.shift()
    }

    console.log(
      `[Relational] Move outcome: ${pending.moveIntent} → ${outcome} (Δactivation: ${(activationNow - pending.activationAtMove).toFixed(2)}, latency: ${latencyMs}ms)`
    )

    // Clear pending move
    relationalStack.pendingMove = undefined
  }

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
  // Bias threshold based on guidance: speakBias > 0 raises threshold (favors speaking)
  const baseActivationThreshold = 0.6
  const biasedThreshold = Math.max(
    0,
    Math.min(1, baseActivationThreshold + guidance.speakBias * 0.15)
  )
  const smoothedActivation = smootherState.lastActivation
  const shouldSilence =
    prosody.allowNonResponse &&
    smoothedActivation > biasedThreshold &&
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
    classifiedOutcome,
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
// MOVE OUTCOME CLASSIFICATION
// ============================================================================

// Outcome classification thresholds (tunable)
const SETTLED_DELTA = -0.15
const ESCALATED_DELTA = 0.15
const DISENGAGED_MS = 60_000

/**
 * Classify the outcome of MAIA's previous move based on user's next turn.
 *
 * @param activationAtMove - Activation when MAIA completed the move
 * @param activationAtOutcome - Activation on next user turn
 * @param latencyMs - Time between move and next user turn
 * @returns Classified outcome
 */
export function classifyMoveOutcome(
  activationAtMove: number,
  activationAtOutcome: number,
  latencyMs: number
): MoveOutcome {
  const delta = activationAtOutcome - activationAtMove

  // Long silence = disengaged
  if (latencyMs > DISENGAGED_MS) {
    return 'DISENGAGED'
  }

  // Activation dropped significantly = settled
  if (delta < SETTLED_DELTA) {
    return 'SETTLED'
  }

  // Activation rose significantly = escalated
  if (delta > ESCALATED_DELTA) {
    return 'ESCALATED'
  }

  // Activation stayed roughly same = warm continue
  if (Math.abs(delta) <= ESCALATED_DELTA) {
    return 'WARM_CONTINUE'
  }

  return 'UNKNOWN'
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
 * @param contextNow - Optional timestamp for consistent timebase (defaults to Date.now())
 */
export function transitionMode(
  session: MoshiVoiceSession,
  toMode: MaiaMode,
  trigger: string,
  contextNow?: number
): boolean {
  const { relationalStack } = session
  const fromMode = relationalStack.currentMode
  const now = contextNow ?? Date.now()

  // Check mode lock (prevents jitter)
  const lockUntil = relationalStack.modeLockUntilTs ?? 0
  if (lockUntil > now) {
    console.log(
      `[Relational] Transition ${fromMode} → ${toMode} blocked by mode lock (${lockUntil - now}ms remaining)`
    )
    return false
  }

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
 * Set a pending move for outcome tracking.
 * Call this when MAIA completes a spoken or silence response.
 *
 * If there's already a pending move (user never responded), close it
 * as DISENGAGED or UNKNOWN before setting the new one.
 *
 * @param session - The voice session
 * @param moveIntent - What MAIA was trying to accomplish
 * @param responseType - Whether MAIA spoke or was silent
 * @param activation - Current activation at time of move
 */
export function setPendingMove(
  session: MoshiVoiceSession,
  moveIntent: MoveIntent,
  responseType: MaiaResponseType,
  activation: number
): void {
  const now = Date.now()

  // Close any existing pending move that was never resolved
  const existing = session.relationalStack.pendingMove
  if (existing) {
    const latencyMs = now - existing.ts
    const outcomeEvent: MoveOutcomeEvent = {
      tsOutcome: now,
      tsMove: existing.ts,
      moveIntent: existing.moveIntent,
      responseType: existing.responseType,
      activationAtMove: existing.activationAtMove,
      activationAtOutcome: undefined,
      outcome: latencyMs > DISENGAGED_MS ? 'DISENGAGED' : 'UNKNOWN',
      latencyToOutcomeMs: latencyMs,
    }
    session.tuning.moveOutcomes.push(outcomeEvent)
    if (session.tuning.moveOutcomes.length > 100) {
      session.tuning.moveOutcomes.shift()
    }
    console.log(
      `[Relational] Closing stale pending move: ${existing.moveIntent} → ${outcomeEvent.outcome} (latency: ${latencyMs}ms)`
    )
    // Explicit clear before setting new (defensive)
    session.relationalStack.pendingMove = undefined
  }

  session.relationalStack.pendingMove = {
    ts: now,
    moveIntent,
    responseType,
    activationAtMove: activation,
  }
  console.log(
    `[Relational] Pending move set: ${moveIntent} (${responseType}, activation: ${activation.toFixed(2)})`
  )
}

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

// ============================================================================
// GUIDANCE POSTURE COMPUTATION
// ============================================================================

/**
 * Find the dominant silence intent from counts.
 */
function dominantSilenceIntent(
  counts: Record<SilenceIntent, number>
): SilenceIntent | null {
  let best: SilenceIntent | null = null
  let bestVal = -1
  ;(Object.keys(counts) as SilenceIntent[]).forEach((k) => {
    const v = counts[k] ?? 0
    if (v > bestVal) {
      bestVal = v
      best = k
    }
  })
  return bestVal > 0 ? best : null
}

/**
 * Compute a single stable posture signal per turn from windowed stats.
 * Source of truth: turnOutcomes + modeTransitionTimestamps.
 *
 * @param session - Voice session
 * @param now - Current timestamp (for consistent timebase across all decisions)
 */
export function computeGuidancePosture(
  session: MoshiVoiceSession,
  now: number
): GuidanceSignal {
  const { relationalStack, tuning } = session

  // If mode is locked, preserve last posture for stability (hold the shape)
  const lockUntil = relationalStack.modeLockUntilTs ?? 0
  if (lockUntil > now && tuning.lastGuidance) {
    // Return cached guidance with updated reason
    return {
      ...tuning.lastGuidance,
      reason: `locked_${tuning.lastGuidance.reason}`,
    }
  }

  const silenceRatioLast20 = computeRecentSilenceRatioFromOutcomes(
    tuning.turnOutcomes,
    20
  )
  const silenceIntentCountsLast20 = computeRecentSilenceIntentCountsFromOutcomes(
    tuning.turnOutcomes,
    20
  )
  const modeTransitionsPer5m = computeModeTransitionsPer5mFromTimestamps(
    tuning.modeTransitionTimestamps,
    now
  )

  const domIntent = dominantSilenceIntent(silenceIntentCountsLast20)

  // Default: MEET (normal flow)
  let posture: GuidancePosture = 'MEET'
  let brevity: GuidanceSignal['brevity'] = 'moderate'
  let modeLockMs = 0
  let speakBias = 0
  let reason = 'default_meet'

  // Priority 1: jitter → MIRROR + lock mode
  if (modeTransitionsPer5m > 4) {
    posture = 'MIRROR'
    brevity = 'brief'
    modeLockMs = 60_000
    speakBias = 0
    reason = `mode_jitter_${modeTransitionsPer5m}_per5m`
    return { posture, brevity, modeLockMs, speakBias, reason }
  }

  // Priority 2: over-silencing → MOVE/MEET depending on intent
  if (silenceRatioLast20 > 0.25) {
    if (domIntent === 'BOUNDARY') {
      posture = 'MEET'
      brevity = 'brief'
      modeLockMs = 20_000
      speakBias = 0.1
      reason = `silence_high_boundary_${(silenceRatioLast20 * 100).toFixed(0)}pct`
    } else {
      // REGULATORY or REFLECTIVE (or unknown) → MOVE (bring speech back gently)
      posture = 'MOVE'
      brevity = 'brief'
      modeLockMs = 20_000
      speakBias = 0.3
      reason = `silence_high_${domIntent ?? 'unknown'}_${(silenceRatioLast20 * 100).toFixed(0)}pct`
    }
    return { posture, brevity, modeLockMs, speakBias, reason }
  }

  // Stable & present → MEET
  if (silenceRatioLast20 < 0.1 && modeTransitionsPer5m <= 2) {
    posture = 'MEET'
    brevity = 'moderate'
    modeLockMs = 0
    speakBias = 0
    reason = 'stable_present'
    return { posture, brevity, modeLockMs, speakBias, reason }
  }

  return { posture, brevity, modeLockMs, speakBias, reason }
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

  // Use cached guidance from last processTurn() call, or compute fresh if none
  const guidance = tuning.lastGuidance ?? computeGuidancePosture(session, now)

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

    // Guidance posture (single stable signal for response shaping)
    guidance,
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
