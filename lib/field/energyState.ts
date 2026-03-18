/**
 * Field Energy State Machine
 *
 * Tracks the conversation regulation arc as runtime state.
 * This makes Field presence a system property — not just a prompt instruction
 * that can drift as features accumulate.
 *
 * States:
 *   arrival   → fresh connection, fast response, short turns, minimal retrieval
 *   settling  → co-regulation phase, reduced density, emerging reflection
 *   presence  → deep attention, sparse language, sensory/somatic emphasis
 *
 * Storage: sessionStorage keyed by sessionId (Option A — client-side first).
 * Included in every oracle POST; server uses it to enforce constraints.
 * Server echoes confirmed state in X-Field-Energy-State response header.
 *
 * See: docs/FIELD_PRESENCE_SPECIFICATION.md §16
 */

export type FieldEnergyState = 'arrival' | 'settling' | 'presence';

export interface FieldEnergyContext {
  state: FieldEnergyState;
  turnCount: number;           // turns in this conversation
  modeIsCare: boolean;         // Care mode transitions faster
  lastUpdatedAt: number;       // timestamp for staleness checks
}

// ---------------------------------------------------------------------------
// Heuristic classifiers — lightweight, no ML
// ---------------------------------------------------------------------------

const DISTRESS_SIGNALS = [
  'panic', 'overwhelmed', 'can\'t', 'anxious', 'spiraling', 'terrified',
  'freaking out', 'falling apart', 'losing it', 'can\'t breathe', 'help me',
  'emergency', 'crisis', 'breaking down', 'not okay',
];

const REFLECTIVE_SIGNALS = [
  'i feel', 'i notice', 'i\'m sitting with', 'i\'m aware', 'something in me',
  'i sense', 'there\'s a part', 'i\'m holding', 'i\'ve been thinking',
  'it\'s like', 'i wonder', 'i realize',
];

const TASK_SIGNALS = [
  'quick question', 'how do i', 'what time', 'schedule', 'remind me',
  'can you look up', 'send a', 'what\'s the', 'how much', 'when is',
];

export type UserSignal = 'distress' | 'reflective' | 'task' | 'neutral';

export function classifyUserSignal(text: string): UserSignal {
  const lower = text.toLowerCase();
  if (DISTRESS_SIGNALS.some(s => lower.includes(s))) return 'distress';
  if (REFLECTIVE_SIGNALS.some(s => lower.includes(s))) return 'reflective';
  if (TASK_SIGNALS.some(s => lower.includes(s))) return 'task';
  return 'neutral';
}

// ---------------------------------------------------------------------------
// State transition logic
// ---------------------------------------------------------------------------

/**
 * Compute the next energy state given current context + user signal.
 * Called before sending each oracle request.
 */
export function nextEnergyState(
  current: FieldEnergyContext,
  userMessage: string,
  incomingMode: string | undefined, // 'dialogue' | 'counsel' | 'scribe'
): FieldEnergyState {
  const signal = classifyUserSignal(userMessage);
  const { state, turnCount, modeIscare: _modeIscare } = current as FieldEnergyContext & { modeIscare?: boolean };
  const isCare = current.modeIsCare ?? (incomingMode === 'counsel');

  // Safe mode always forces arrival (handled server-side, but mirror here for client accuracy)

  // Regression: distress always pulls back to settling
  if (signal === 'distress' && state === 'presence') return 'settling';

  // Stay arrival for task-focused unless Care mode
  if (signal === 'task' && !isCare) return 'arrival';

  switch (state) {
    case 'arrival':
      // Care mode: transitions after turn 1
      if (isCare && turnCount >= 1) return 'settling';
      // Reflective signal: transition early
      if (signal === 'reflective' && turnCount >= 1) return 'settling';
      // Distress: go to settling immediately
      if (signal === 'distress') return 'settling';
      // Standard: transition after turn 2
      if (turnCount >= 2) return 'settling';
      return 'arrival';

    case 'settling':
      // Care mode: transitions to presence after turn 3
      if (isCare && turnCount >= 3 && signal === 'reflective') return 'presence';
      // Standard: reflective signal after turn 4
      if (signal === 'reflective' && turnCount >= 4) return 'presence';
      // Distress: stay in settling
      if (signal === 'distress') return 'settling';
      // Standard: transition at turn 5
      if (turnCount >= 5) return 'presence';
      return 'settling';

    case 'presence':
      // Distress: regress to settling
      if (signal === 'distress') return 'settling';
      // Task: drop to arrival for that turn (handled as override, not permanent state change)
      return 'presence';
  }
}

// ---------------------------------------------------------------------------
// Constraints derived from state
// ---------------------------------------------------------------------------

export interface FieldConstraints {
  maxSentences: number;          // hard ceiling on response sentences
  retrievalLevel: 0 | 1 | 2;    // 0=none, 1=small window, 2=full
  densityLabel: 'high' | 'medium' | 'sparse'; // for prompt instruction
  paceLabel: 'conversational' | 'slowed' | 'spacious'; // for TTS hint
}

export function getConstraints(
  state: FieldEnergyState,
  safeMode: boolean,
): FieldConstraints {
  // Safe mode always forces arrival constraints — tightest possible
  if (safeMode) {
    return { maxSentences: 2, retrievalLevel: 0, densityLabel: 'sparse', paceLabel: 'spacious' };
  }

  switch (state) {
    case 'arrival':
      return { maxSentences: 3, retrievalLevel: 0, densityLabel: 'high', paceLabel: 'conversational' };
    case 'settling':
      return { maxSentences: 5, retrievalLevel: 1, densityLabel: 'medium', paceLabel: 'slowed' };
    case 'presence':
      return { maxSentences: 4, retrievalLevel: 1, densityLabel: 'sparse', paceLabel: 'spacious' };
  }
}

// ---------------------------------------------------------------------------
// Client-side persistence (sessionStorage, keyed by sessionId)
// ---------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = 'field_energy_';

export function loadEnergyContext(sessionId: string): FieldEnergyContext {
  if (typeof window === 'undefined') {
    return defaultContext();
  }
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as FieldEnergyContext;
      // Staleness: if > 30 min since last update, reset to arrival
      if (Date.now() - parsed.lastUpdatedAt > 30 * 60 * 1000) {
        return defaultContext();
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return defaultContext();
}

export function saveEnergyContext(sessionId: string, ctx: FieldEnergyContext): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      `${STORAGE_KEY_PREFIX}${sessionId}`,
      JSON.stringify({ ...ctx, lastUpdatedAt: Date.now() })
    );
  } catch { /* ignore — don't crash on sessionStorage errors */ }
}

export function advanceEnergyState(
  sessionId: string,
  userMessage: string,
  mode: string | undefined,
): FieldEnergyContext {
  const current = loadEnergyContext(sessionId);
  const nextState = nextEnergyState(current, userMessage, mode);
  const next: FieldEnergyContext = {
    state: nextState,
    turnCount: current.turnCount + 1,
    modeIsCare: mode === 'counsel' || current.modeIsCare,
    lastUpdatedAt: Date.now(),
  };
  saveEnergyContext(sessionId, next);
  return next;
}

function defaultContext(): FieldEnergyContext {
  return {
    state: 'arrival',
    turnCount: 0,
    modeIsCare: false,
    lastUpdatedAt: Date.now(),
  };
}
