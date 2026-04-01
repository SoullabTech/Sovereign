/**
 * SacredEncounterService — Controls when and how sacred passages surface in MAIA.
 *
 * Governing principle:
 *   MAIA introduces the passage and then gets out of the way.
 *
 * Hard rules:
 * - Never on the first reply
 * - Minimum 3 user turns before eligible
 * - Max 1 passage per session
 * - Block for crisis language, urgent practical requests, analytical mode
 * - Max 1 tradition switch per session
 * - MAIA does not explain why the passage was chosen
 */

import type {
  SacredPassage,
  SacredTradition,
  Element,
  EncounterSessionContext,
  TraditionDisclaimer,
} from './types';
import { toSacredPassage } from './types';
import { selectSacredPassage } from './selectSacredPassage';
import { SacredTextRegistry } from './SacredTextRegistry';

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT / OUTPUT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EncounterInput {
  latestMessage: string;
  recentTurns: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId: string;
  timestamp: string | Date;
  affect?: {
    mood?: 'bright' | 'concerned' | 'calm';
    archetype?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  };
  /** SpiralogicCell element if available */
  element?: Element;
}

export interface EncounterResult {
  passage: SacredPassage;
  introduction: string;
  followUp?: string;
  disclaimer?: TraditionDisclaimer;
  showDisclaimer: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type EncounterState = 'strain' | 'searching' | 'remorse' | 'restlessness' | 'endurance';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MIN_USER_TURNS = 3;
const FAST_EXCHANGE_THRESHOLD = 40;

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION TRACKING (in-memory, per-process)
// ═══════════════════════════════════════════════════════════════════════════════

interface SessionRecord {
  shownAt: string;
  passageId: string;
  tradition: SacredTradition;
  sessionContext: EncounterSessionContext;
}

const sessionLog = new Map<string, SessionRecord>();
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

function getSessionContext(sessionId: string, now: Date): EncounterSessionContext & { alreadyShown: boolean } {
  const record = sessionLog.get(sessionId);
  if (!record) {
    return { activeTradition: undefined, hasSwitchedTradition: false, disclaimerShown: false, alreadyShown: false };
  }
  // Expire stale
  if (now.getTime() - new Date(record.shownAt).getTime() > SESSION_TTL_MS) {
    sessionLog.delete(sessionId);
    return { activeTradition: undefined, hasSwitchedTradition: false, disclaimerShown: false, alreadyShown: false };
  }
  return { ...record.sessionContext, alreadyShown: true };
}

function recordShown(sessionId: string, passageId: string, tradition: SacredTradition, prevContext: EncounterSessionContext, now: Date): EncounterSessionContext {
  const hasSwitched = prevContext.activeTradition !== undefined && prevContext.activeTradition !== tradition;
  const ctx: EncounterSessionContext = {
    activeTradition: tradition,
    hasSwitchedTradition: prevContext.hasSwitchedTradition || hasSwitched,
    disclaimerShown: true,
  };
  sessionLog.set(sessionId, { shownAt: now.toISOString(), passageId, tradition, sessionContext: ctx });
  // Lazy cleanup
  if (sessionLog.size > 500) {
    for (const [key, val] of sessionLog) {
      if (now.getTime() - new Date(val.shownAt).getTime() > SESSION_TTL_MS) sessionLog.delete(key);
    }
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK PATTERNS
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

// ═══════════════════════════════════════════════════════════════════════════════
// INTRODUCTION LINES
// ═══════════════════════════════════════════════════════════════════════════════

const INTRODUCTIONS = [
  'Something comes to mind \u2014 not as an answer, just something you might sit with.',
  'There is a passage that surfaces here \u2014 not to explain, just to be with.',
  'Something quiet comes to mind. You can take it or leave it.',
] as const;

function pickIntroduction(): string {
  return INTRODUCTIONS[Math.floor(Math.random() * INTRODUCTIONS.length)];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

export function evaluateEncounter(input: EncounterInput): EncounterResult | null {
  const now = typeof input.timestamp === 'string' ? new Date(input.timestamp) : input.timestamp;
  const text = input.latestMessage;

  // Gate 1: Minimum conversation depth
  if (countUserTurns(input.recentTurns) < MIN_USER_TURNS) return null;

  // Gate 2: Session check (once per session)
  const { alreadyShown, ...sessionContext } = getSessionContext(input.sessionId, now);
  if (alreadyShown) return null;

  // Gate 3: Crisis
  if (CRISIS_PATTERNS.test(text)) return null;

  // Gate 4: Practical help-seeking
  if (PRACTICAL_PATTERNS.test(text)) return null;

  // Gate 5: Analytical mode
  if (ANALYTICAL_PATTERNS.test(text)) return null;

  // Gate 6: Fast exchange
  if (isFastExchange(input.recentTurns)) return null;

  // Gate 7: Bright mood
  if (input.affect?.mood === 'bright') return null;

  // Gate 8: Detect state
  const state = detectState(text);
  if (!state) return null;

  // Gate 9: Select passage (multi-tradition, mode-aware)
  const selection = selectSacredPassage({
    state,
    element: input.element,
    sessionContext,
  });
  if (!selection) return null;

  // Record and build result
  const entry = selection.entry;
  const updatedContext = recordShown(input.sessionId, entry.id, entry.tradition, sessionContext, now);
  const disclaimer = SacredTextRegistry.getDisclaimer(entry.tradition);

  return {
    passage: toSacredPassage(entry),
    introduction: pickIntroduction(),
    disclaimer,
    showDisclaimer: !sessionContext.disclaimerShown,
  };
}
