/**
 * MAIA Decision/Change Recognition
 *
 * Detects commitment (Decision) and directional shift (Change) signals in a
 * member's Ideas thread, and provides the naming + invitation grammar MAIA
 * uses to offer formalization.
 *
 * Design principles:
 *   - Pure detection functions (no DB, unit-testable)
 *   - Fire-and-forget event writes (never block oracle response)
 *   - Append-only event log (member_idea_recognition_events) for cooldown,
 *     decline tracking, oscillation detection, quiet-zone enforcement
 *   - Sanctuary mode is an absolute gate: no detection, no events, no-op
 *   - Member is always the author of created objects; MAIA only recognizes
 *     and offers (see docs/maia/decision-change-recognition-plan.md §3g)
 *
 * Templates and thresholds are locked in the plan document. Changes to the
 * naming lines or restraint rules should be reflected there first.
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type SignalKind = 'decision' | 'change';
export type SignalStrength = 'weak' | 'medium' | 'strong';

export type RecognitionEventType =
  | 'naming_fired'
  | 'invitation_offered'
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'invitation_ignored';

export interface DecisionSignal {
  kind: 'decision';
  strength: SignalStrength;
  matchedPhrase?: string;
}

export interface ChangeSignal {
  kind: 'change';
  strength: SignalStrength;
  matchedPhrase?: string;
  xy?: { x: string; y: string };
}

export type RecognitionSignal = DecisionSignal | ChangeSignal;

export interface RecognitionEventRow {
  id: number;
  thread_id: string;
  member_id: string;
  fired_at: string;
  event_type: RecognitionEventType;
  signal_kind: SignalKind;
  signal_strength: 'medium' | 'strong';
  meta: Record<string, unknown>;
}

export interface RestraintCheck {
  allowNaming: boolean;
  allowInvitation: boolean;
  reason?: string;
}

export interface RecognitionOutcome {
  signal: RecognitionSignal;
  namingLine: string | null;
  offerInvitation: boolean;
  restraintReason?: string;
}

// ═══════════════════════════════════════════════════════════════
// Signal markers
//
// High-precision patterns — the spec mandates that most threads have no
// naming at all. Err toward specificity, not recall.
// ═══════════════════════════════════════════════════════════════

// Decision patterns (case-insensitive against lowercased user text)
const DECISION_STRONG_PATTERNS: RegExp[] = [
  /\bi(?:'| a)m going to\b/i,
  /\bi(?:'| ha)ve decided\b/i,
  /\bi(?:'| wi)ll (?:start|build|focus|do|make|try|go)\b/i,
  /\bthis is what i want to (?:build|do|start|make|try)\b/i,
  /\bi want to (?:start|build|focus|do|make|try) .{0,40}? first\b/i,
  /\bi(?:'m| am) committing to\b/i,
];

const DECISION_MEDIUM_PATTERNS: RegExp[] = [
  /\bi think i should\b/i,
  /\bi probably (?:will|should)\b/i,
  /\bit makes sense to\b/i,
  /\bi(?:'m| am) leaning toward\b/i,
  /\bi think we should start\b/i,
];

// Change patterns
const CHANGE_STRONG_PATTERNS: RegExp[] = [
  /\bi no longer\b/i,
  /\bi(?:'| ha)ve shifted\b/i,
  /\bi(?:'m| am) shifting from\b/i,
  /\binstead of .{0,60}? i(?:'m| am| will)\b/i,
  /\bused to .{0,80}? now i\b/i,
  /\bwas .{0,80}? now i\b/i,
];

const CHANGE_MEDIUM_PATTERNS: RegExp[] = [
  /\bthis feels different\b/i,
  /\bi(?:'m| am) leaning away from\b/i,
  /\bit(?:'s| is) less about .{0,40}? (?:and )?more about\b/i,
  /\bi(?:'m| am) starting to see .{0,40}? differently\b/i,
];

// X → Y extraction: locate "used to X, now Y" / "was X, now Y" /
// "thought X, now think Y" shapes and pull near-verbatim snippets.
const XY_EXTRACTION_PATTERNS: RegExp[] = [
  /\b(?:i )?used to (?:think |believe |feel )?(.{5,120}?)[,.\s]+(?:but |and )?now (?:i )?(?:think |believe |feel |see )?(.{5,120}?)(?:[.!?]|$)/i,
  /\b(?:at first )?i thought (.{5,120}?)[,.\s]+(?:but |and )?now (?:i )?think (.{5,120}?)(?:[.!?]|$)/i,
  /\b(?:i )?was (.{5,80}?)[,.\s]+(?:but |and )?now (?:i )?(?:am |'m )(.{5,80}?)(?:[.!?]|$)/i,
  /\bfrom (.{5,80}?) to (.{5,80}?)(?:[.!?]|$)/i,
];

// ═══════════════════════════════════════════════════════════════
// Naming templates (locked; see plan §3)
// ═══════════════════════════════════════════════════════════════

const DECISION_NAMING = {
  medium: 'This is starting to settle into a direction.',
  strong_primary: 'This is taking the shape of a decision.',
  strong_fallback: "There's a decision forming here.",
  repeat_variant: 'Something here is becoming a decision.',
};

const CHANGE_NAMING = {
  medium_primary: 'This is starting to turn.',
  medium_secondary: "There's a shift beginning here.",
  strong_xy: (x: string, y: string) => `There's a shift here — from "${x}" to "${y}".`,
  strong_fallback: 'Something here has moved.',
  repeat_variant: 'Something here is turning.',
};

// ═══════════════════════════════════════════════════════════════
// Thresholds (locked; see plan §4-6)
// ═══════════════════════════════════════════════════════════════

// No naming within this many turns of last naming_fired
const NAMING_COOLDOWN_TURNS = 2;

// Quiet zone length after invitation_accepted
const QUIET_ZONE_TURNS = 3;

// Minimum prior reflections before medium-signal invitation is allowed
const MEDIUM_INVITATION_MIN_HISTORY = 2;

// ═══════════════════════════════════════════════════════════════
// 1. Pure detection
// ═══════════════════════════════════════════════════════════════

/**
 * Score a user message against Decision patterns.
 * Returns strongest match found, or 'weak' if no patterns match.
 */
export function detectDecisionSignal(text: string): DecisionSignal {
  const trimmed = text.trim();
  if (!trimmed) return { kind: 'decision', strength: 'weak' };

  for (const pattern of DECISION_STRONG_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        kind: 'decision',
        strength: 'strong',
        matchedPhrase: match[0],
      };
    }
  }

  for (const pattern of DECISION_MEDIUM_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        kind: 'decision',
        strength: 'medium',
        matchedPhrase: match[0],
      };
    }
  }

  return { kind: 'decision', strength: 'weak' };
}

/**
 * Score a user message against Change patterns.
 * Attempts X → Y extraction when signal is strong.
 */
export function detectChangeSignal(text: string): ChangeSignal {
  const trimmed = text.trim();
  if (!trimmed) return { kind: 'change', strength: 'weak' };

  for (const pattern of CHANGE_STRONG_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const xy = extractXY(trimmed);
      return {
        kind: 'change',
        strength: 'strong',
        matchedPhrase: match[0],
        ...(xy ? { xy } : {}),
      };
    }
  }

  for (const pattern of CHANGE_MEDIUM_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        kind: 'change',
        strength: 'medium',
        matchedPhrase: match[0],
      };
    }
  }

  // Even without a strong marker, if X → Y is cleanly extractable, treat as strong.
  const xy = extractXY(trimmed);
  if (xy) {
    return { kind: 'change', strength: 'strong', xy };
  }

  return { kind: 'change', strength: 'weak' };
}

/**
 * Extract near-verbatim X and Y snippets from user text.
 * Returns null if no clean "from X to Y" or "used to X, now Y" shape is present,
 * or if the extracted snippets are suspiciously short/generic.
 */
export function extractXY(text: string): { x: string; y: string } | null {
  for (const pattern of XY_EXTRACTION_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    const x = (match[1] || '').trim();
    const y = (match[2] || '').trim();

    if (!isValidXYSnippet(x) || !isValidXYSnippet(y)) continue;

    // Safety: the spec requires near-verbatim. The regex captured from the
    // source text, so the substrings exist in it. Reject if either side is
    // just a pronoun or a connector that would make a bad quote.
    if (isGenericSnippet(x) || isGenericSnippet(y)) continue;

    return { x, y };
  }
  return null;
}

function isValidXYSnippet(s: string): boolean {
  if (!s) return false;
  const words = s.split(/\s+/).filter(Boolean);
  return words.length >= 2 && s.length >= 5 && s.length <= 140;
}

function isGenericSnippet(s: string): boolean {
  const generic = /^(that|this|it|everything|nothing|something|anything)\s*$/i;
  return generic.test(s.trim());
}

// ═══════════════════════════════════════════════════════════════
// 2. Naming template selection
// ═══════════════════════════════════════════════════════════════

/**
 * Pick the naming line for a signal, accounting for recent naming history
 * (repeat-variant grammar when a naming of the same kind fired recently).
 *
 * Returns null for weak signals (no naming).
 */
export function selectNamingLine(
  signal: RecognitionSignal,
  recentEvents: RecognitionEventRow[]
): string | null {
  if (signal.strength === 'weak') return null;

  const sameKindRecentNaming = recentEvents.some(
    (e) => e.event_type === 'naming_fired' && e.signal_kind === signal.kind
  );

  if (signal.kind === 'decision') {
    if (signal.strength === 'medium') {
      return DECISION_NAMING.medium;
    }
    // strong
    if (sameKindRecentNaming) return DECISION_NAMING.repeat_variant;
    return DECISION_NAMING.strong_primary;
  }

  // change
  if (signal.strength === 'medium') {
    // medium_secondary is held in reserve for future variety; v1 uses
    // medium_primary always. Cooldown prevents close repetition.
    return CHANGE_NAMING.medium_primary;
  }
  // strong
  if (sameKindRecentNaming) return CHANGE_NAMING.repeat_variant;
  if (signal.kind === 'change' && signal.xy) {
    return CHANGE_NAMING.strong_xy(signal.xy.x, signal.xy.y);
  }
  return CHANGE_NAMING.strong_fallback;
}

// ═══════════════════════════════════════════════════════════════
// 3. Restraint checks
// ═══════════════════════════════════════════════════════════════

/**
 * Determine whether naming and invitation should be allowed given recent
 * recognition events and the current signal strength.
 *
 * Rules (from plan §3 and §5):
 *   - NAMING_COOLDOWN_TURNS after any naming_fired → no new naming
 *   - Quiet zone (QUIET_ZONE_TURNS after invitation_accepted) → no naming/invitation
 *   - After invitation_declined or invitation_ignored for a signal kind →
 *     no further invitation of that kind in the thread
 *   - Medium signal → invitation requires MEDIUM_INVITATION_MIN_HISTORY prior reflections
 *   - Weak signal → no naming, no invitation
 */
export function checkRestraint(
  signal: RecognitionSignal,
  recentEvents: RecognitionEventRow[],
  priorTurnCount: number
): RestraintCheck {
  if (signal.strength === 'weak') {
    return { allowNaming: false, allowInvitation: false, reason: 'weak_signal' };
  }

  if (isInQuietZone(recentEvents)) {
    return { allowNaming: false, allowInvitation: false, reason: 'quiet_zone' };
  }

  if (isInNamingCooldown(recentEvents)) {
    return { allowNaming: false, allowInvitation: false, reason: 'naming_cooldown' };
  }

  const kindDeclined = recentEvents.some(
    (e) =>
      (e.event_type === 'invitation_declined' || e.event_type === 'invitation_ignored') &&
      e.signal_kind === signal.kind
  );

  if (signal.strength === 'medium') {
    if (priorTurnCount < MEDIUM_INVITATION_MIN_HISTORY) {
      // Name only, no invitation
      return { allowNaming: true, allowInvitation: false, reason: 'medium_insufficient_history' };
    }
    return {
      allowNaming: true,
      allowInvitation: !kindDeclined,
      reason: kindDeclined ? 'kind_previously_declined' : undefined,
    };
  }

  // strong
  return {
    allowNaming: true,
    allowInvitation: !kindDeclined,
    reason: kindDeclined ? 'kind_previously_declined' : undefined,
  };
}

/**
 * Quiet zone: active for QUIET_ZONE_TURNS after most recent invitation_accepted.
 * "Turns" here is approximated as events in the thread (close enough for v1;
 * will be refined against real data).
 */
function isInQuietZone(recentEvents: RecognitionEventRow[]): boolean {
  const acceptedIdx = recentEvents.findIndex((e) => e.event_type === 'invitation_accepted');
  if (acceptedIdx === -1) return false;
  return acceptedIdx < QUIET_ZONE_TURNS;
}

function isInNamingCooldown(recentEvents: RecognitionEventRow[]): boolean {
  const namingIdx = recentEvents.findIndex((e) => e.event_type === 'naming_fired');
  if (namingIdx === -1) return false;
  return namingIdx < NAMING_COOLDOWN_TURNS;
}

// ═══════════════════════════════════════════════════════════════
// 4. Orchestrator
// ═══════════════════════════════════════════════════════════════

/**
 * Run full recognition pass on a user message given current thread state.
 *
 * Sanctuary mode absolute gate: if sanctuaryMode === true, this function is
 * a no-op (returns null). No detection, no events, no naming.
 *
 * Caller is responsible for:
 *   - Loading recent events via getRecentRecognitionEvents()
 *   - Writing the outcome event via storeRecognitionEvent() (fire-and-forget)
 *   - Appending namingLine to MAIA response
 *   - Attaching invitation affordance when offerInvitation is true
 */
export function runRecognition(input: {
  userText: string;
  priorTurnCount: number;
  sanctuaryMode: boolean;
  recentEvents: RecognitionEventRow[];
}): RecognitionOutcome | null {
  if (input.sanctuaryMode) return null;

  // Detect both kinds; prefer stronger signal, tie-break toward Change
  // (Change is usually the more structural event when both fire).
  const decisionSignal = detectDecisionSignal(input.userText);
  const changeSignal = detectChangeSignal(input.userText);

  const chosen: RecognitionSignal = pickStrongerSignal(decisionSignal, changeSignal);

  if (chosen.strength === 'weak') return null;

  const restraint = checkRestraint(chosen, input.recentEvents, input.priorTurnCount);
  if (!restraint.allowNaming) {
    return {
      signal: chosen,
      namingLine: null,
      offerInvitation: false,
      restraintReason: restraint.reason,
    };
  }

  const namingLine = selectNamingLine(chosen, input.recentEvents);

  return {
    signal: chosen,
    namingLine,
    offerInvitation: restraint.allowInvitation,
    restraintReason: restraint.reason,
  };
}

function pickStrongerSignal(d: DecisionSignal, c: ChangeSignal): RecognitionSignal {
  const rank: Record<SignalStrength, number> = { weak: 0, medium: 1, strong: 2 };
  if (rank[c.strength] >= rank[d.strength]) return c;
  return d;
}

// ═══════════════════════════════════════════════════════════════
// 5. Persistence — fire-and-forget write
// ═══════════════════════════════════════════════════════════════

/**
 * Fire-and-forget write to member_idea_recognition_events.
 * Returns void to prevent accidental await. Never blocks oracle response.
 */
export function storeRecognitionEvent(input: {
  threadId: string;
  memberId: string;
  eventType: RecognitionEventType;
  signalKind: SignalKind;
  signalStrength: 'medium' | 'strong';
  meta?: Record<string, unknown>;
}): void {
  const sql = `
    INSERT INTO member_idea_recognition_events
      (thread_id, member_id, event_type, signal_kind, signal_strength, meta)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  query(sql, [
    input.threadId,
    input.memberId,
    input.eventType,
    input.signalKind,
    input.signalStrength,
    JSON.stringify(input.meta ?? {}),
  ]).catch((error) => {
    console.warn('[decision-change-recognition] Failed to store event:', {
      threadId: input.threadId,
      eventType: input.eventType,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 6. Persistence — load recent events (graceful degradation)
// ═══════════════════════════════════════════════════════════════

/**
 * Load recent recognition events for a thread, most recent first.
 * Returns empty array on error so recognition can still run (without history,
 * all restraint checks are bypassed except weak-signal — this is acceptable
 * because a DB error shouldn't silence MAIA entirely).
 */
export async function getRecentRecognitionEvents(
  threadId: string,
  limit = 20
): Promise<RecognitionEventRow[]> {
  try {
    const result = await query<RecognitionEventRow>(
      `SELECT
        id, thread_id, member_id, fired_at,
        event_type, signal_kind, signal_strength, meta
      FROM member_idea_recognition_events
      WHERE thread_id = $1
      ORDER BY fired_at DESC
      LIMIT $2`,
      [threadId, limit]
    );
    return result.rows;
  } catch (error) {
    console.warn('[decision-change-recognition] Failed to load events:', {
      threadId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
