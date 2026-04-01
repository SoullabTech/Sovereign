/**
 * SacredEncounterService — Controls when and how sacred passages surface in MAIA.
 *
 * Governing principle:
 *   MAIA introduces the passage and then gets out of the way.
 *
 * This is an encounter layer, not a delivery system.
 * Passages are rare, non-intrusive, and never explained.
 *
 * Hard rules:
 * - Never on the first reply
 * - Minimum 3 user turns before eligible
 * - Max 1 passage per session (tracked by sessionId)
 * - Block for crisis language, urgent practical requests, analytical mode
 * - MAIA does not explain why the passage was chosen
 * - MAIA does not interpret the passage after showing it
 * - Reason codes are internal only — never surfaced
 */

import { QURAN_ENTRIES, type QuranEntry } from './quran';

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EncounterInput {
  /** The user's latest message text */
  latestMessage: string;
  /** Recent conversation turns (role + content pairs), most recent last */
  recentTurns: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Session or conversation identifier — used for once-per-session tracking */
  sessionId: string;
  /** Current timestamp (ISO string or Date) */
  timestamp: string | Date;
  /** Optional affect data from upstream detection */
  affect?: {
    mood?: 'bright' | 'concerned' | 'calm';
    archetype?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  };
  /** Current conversation mode if available */
  mode?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OUTPUT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SacredPassagePayload {
  id: string;
  title: string;
  citation: string;
  arabic?: string;
  translation: string;
  translator: string;
  contextualFraming?: string;
  reflectionPrompts?: string[];
  integrationPractice?: string;
}

export interface EncounterResult {
  /** The passage payload to render, or null if no encounter */
  passage: SacredPassagePayload;
  /** The introduction line MAIA uses before the passage */
  introduction: string;
  /** Optional single follow-up question (undefined = silence, which is v1 default) */
  followUp?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL TYPES (never exposed)
// ═══════════════════════════════════════════════════════════════════════════════

/** Internal reason codes — for logging/debugging only, never surfaced */
type GateReason =
  | 'too_early'           // fewer than MIN_TURNS user messages
  | 'already_shown'       // passage already surfaced this session
  | 'crisis_block'        // crisis/safety language detected
  | 'practical_block'     // user seeking concrete advice/steps
  | 'analytical_block'    // analytical/evaluative mode
  | 'fast_exchange'       // rapid back-and-forth (short turns)
  | 'no_state_match'      // no detectable encounter state
  | 'no_passage_found';   // state matched but no passage (shouldn't happen)

/** Detectable lived states that may resonate with a passage */
type EncounterState =
  | 'strain'       // overwhelm, pressure, difficulty
  | 'searching'    // seeking direction, feeling lost
  | 'remorse'      // regret, desire for repair
  | 'restlessness' // agitation, inability to settle
  | 'endurance';   // sustained effort, needing steadfastness

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MIN_USER_TURNS = 3;
const FAST_EXCHANGE_THRESHOLD = 40; // avg chars per recent user message

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION TRACKING (in-memory, per-process)
//
// Simple Map keyed by sessionId. Entries are cleaned on check if stale.
// This is intentionally lightweight — no database, no persistence.
// Server restart resets tracking, which is acceptable (errs toward showing
// fewer passages, not more, since most sessions don't span restarts).
// ═══════════════════════════════════════════════════════════════════════════════

const sessionLog = new Map<string, { shownAt: string; passageId: string }>();
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function hasShownThisSession(sessionId: string, now: Date): boolean {
  const entry = sessionLog.get(sessionId);
  if (!entry) return false;
  // Expire stale entries
  if (now.getTime() - new Date(entry.shownAt).getTime() > SESSION_TTL_MS) {
    sessionLog.delete(sessionId);
    return false;
  }
  return true;
}

function recordShown(sessionId: string, passageId: string, now: Date): void {
  sessionLog.set(sessionId, { shownAt: now.toISOString(), passageId });
  // Lazy cleanup: prune entries older than TTL
  if (sessionLog.size > 500) {
    for (const [key, val] of sessionLog) {
      if (now.getTime() - new Date(val.shownAt).getTime() > SESSION_TTL_MS) {
        sessionLog.delete(key);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK PATTERNS (three separate categories for clear reason codes)
// ═══════════════════════════════════════════════════════════════════════════════

const CRISIS_PATTERNS = /\b(kill myself|suicide|want to die|self.harm|end it all|emergency|panic attack|can't breathe|hurting myself)\b/i;
const PRACTICAL_PATTERNS = /\b(what should i do|give me steps|action plan|how do i fix|help me with|i need to|can you help me|what's the solution|next steps)\b/i;
const ANALYTICAL_PATTERNS = /\b(analyze|compare|evaluate|technically|objectively|statistically|data|metrics|performance|efficiency)\b/i;

// ═══════════════════════════════════════════════════════════════════════════════
// STATE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const STATE_PATTERNS: Record<EncounterState, RegExp> = {
  strain: /\b(overwhelm(?:ed|ing)?|exhausted|too much|can't cope|breaking|crushed|drowning|heavy|weight of|burden|hard right now|falling apart)\b/i,
  searching: /\b(lost|don't know where|no direction|so confused|searching for|seeking|which way|where do i go|feel directionless|adrift)\b/i,
  remorse: /\b(regret|wish i hadn't|made a mistake|messed up|let .{0,15}down|ashamed|guilt|did the wrong thing|shouldn't have|i failed)\b/i,
  restlessness: /\b(restless|can't settle|agitated|unsettled|racing thoughts|spinning|can't stop thinking|wound up|on edge|can't sit still)\b/i,
  endurance: /\b(holding on|keep going|endure|persevere|running out of patience|waiting so long|tired of trying|pushing through|how much longer|worn down)\b/i,
};

function detectState(text: string): EncounterState | null {
  for (const [state, pattern] of Object.entries(STATE_PATTERNS) as [EncounterState, RegExp][]) {
    if (pattern.test(text)) return state;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE → PASSAGE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const STATE_TO_PASSAGE: Record<EncounterState, string> = {
  strain: 'quran-ease-01',         // 94:5-6 — hardship and ease coexist
  searching: 'quran-guidance-01',  // 1:6   — the opening prayer for direction
  remorse: 'quran-mercy-01',      // 6:54  — mercy after error
  restlessness: 'quran-remembrance-01', // 13:28 — hearts at rest
  endurance: 'quran-patience-01', // 2:153 — patience and prayer
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTRODUCTION LINES
// ═══════════════════════════════════════════════════════════════════════════════

const INTRODUCTIONS = [
  'Something comes to mind \u2014 not as an answer, just something you might sit with.',
  'There is a passage that surfaces here \u2014 not to explain, just to be with.',
  'Something quiet comes to mind. You can take it or leave it.',
] as const;

// v1: follow-up is suppressed by default. The passage speaks; MAIA stops.
// Future: gate on tone, whether MAIA's response already ends with a question, etc.
const FOLLOW_UP: string | undefined = undefined;

function pickIntroduction(): string {
  return INTRODUCTIONS[Math.floor(Math.random() * INTRODUCTIONS.length)];
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function countUserTurns(turns: EncounterInput['recentTurns']): number {
  return turns.filter(t => t.role === 'user').length;
}

function isFastExchange(turns: EncounterInput['recentTurns']): boolean {
  const userMessages = turns.filter(t => t.role === 'user');
  if (userMessages.length < 3) return false;
  const recent = userMessages.slice(-3);
  const avgLen = recent.reduce((sum, t) => sum + t.content.length, 0) / recent.length;
  return avgLen < FAST_EXCHANGE_THRESHOLD;
}

function stripInternalFields(entry: QuranEntry): SacredPassagePayload {
  return {
    id: entry.id,
    title: entry.title,
    citation: entry.citation,
    arabic: entry.arabic,
    translation: entry.translation,
    translator: entry.translator,
    contextualFraming: entry.contextualFraming,
    reflectionPrompts: entry.reflectionPrompts,
    integrationPractice: entry.integrationPractice,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Evaluate whether a sacred passage encounter should occur.
 *
 * Returns an EncounterResult if a passage should surface, or null if not.
 * All gating logic is internal. Callers should treat null as "do nothing."
 *
 * Usage:
 *   const encounter = evaluateEncounter({ latestMessage, recentTurns, sessionId, timestamp });
 *   if (encounter) {
 *     // Append encounter.introduction + passage block to MAIA's response
 *   }
 */
export function evaluateEncounter(input: EncounterInput): EncounterResult | null {
  const now = typeof input.timestamp === 'string' ? new Date(input.timestamp) : input.timestamp;
  const text = input.latestMessage;

  // ── Gate 1: Minimum conversation depth ──
  const userTurns = countUserTurns(input.recentTurns);
  if (userTurns < MIN_USER_TURNS) return null; // reason: too_early

  // ── Gate 2: Once per session ──
  if (hasShownThisSession(input.sessionId, now)) return null; // reason: already_shown

  // ── Gate 3: Crisis language (highest priority block) ──
  if (CRISIS_PATTERNS.test(text)) return null; // reason: crisis_block

  // ── Gate 4: Practical help-seeking ──
  if (PRACTICAL_PATTERNS.test(text)) return null; // reason: practical_block

  // ── Gate 5: Analytical mode ──
  if (ANALYTICAL_PATTERNS.test(text)) return null; // reason: analytical_block

  // ── Gate 6: Fast-paced exchange ──
  if (isFastExchange(input.recentTurns)) return null; // reason: fast_exchange

  // ── Gate 7: Affect hint — skip if mood is bright (no need) ──
  if (input.affect?.mood === 'bright') return null; // reason: no_state_match

  // ── Gate 8: Detect lived state ──
  const state = detectState(text);
  if (!state) return null; // reason: no_state_match

  // ── Gate 9: Find matching passage ──
  const passageId = STATE_TO_PASSAGE[state];
  const entry = QURAN_ENTRIES.find(e => e.id === passageId);
  if (!entry) return null; // reason: no_passage_found

  // ── All gates passed — record and return ──
  recordShown(input.sessionId, entry.id, now);

  return {
    passage: stripInternalFields(entry),
    introduction: pickIntroduction(),
    followUp: FOLLOW_UP,
  };
}
