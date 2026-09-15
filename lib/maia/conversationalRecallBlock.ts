/**
 * Conversational Recall Block — Phase 2 prompt influence for the conversational layer.
 *
 * Authority chain:
 *   - docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md
 *   - docs/canon/MAIA_CANON_v1.1.md (§V Interpretive Displacement refusal)
 *   - docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md
 *   - Memory: project_substrate_label_split_declared_unfed
 *   - Memory: project_different_channel_same_principle
 *   - Memory: project_breakthrough_memory_member_ratified
 *   - Memory: project_no_static_ui_claim_without_verified_state
 *
 * What this module does:
 *   Renders bounded prior cross-session exchanges into a provenance-grounded
 *   prompt block. The block tells MAIA the structural fact — "this member said
 *   X on date Y in another session" — and instructs MAIA not to synthesize,
 *   not to interpret, not to fabricate themes across exchanges.
 *
 * What this module does NOT do:
 *   - Does NOT score relevance — order is recency only (as retrieved).
 *   - Does NOT compute themes / patterns / clusters across exchanges.
 *   - Does NOT inject the block when member has opted out (gate: members.conversational_recall_enabled).
 *   - Does NOT inject the block during Sanctuary Mode (defense-in-depth; Sanctuary
 *     sessions structurally do not enter conversation_turns, but the formatter
 *     still refuses to emit if mode is asserted as 'Sanctuary' by the caller).
 *   - Does NOT inject the block when count is zero.
 *   - Does NOT mark exchanges as "important" or "breakthrough" — the breakthrough
 *     substrate is member-marked atoms only.
 *
 * Suppression rules (§II.C of spec):
 *   1. recallEnabled === false → suppress (member opt-out)
 *   2. mode === 'Sanctuary' → suppress (defense-in-depth)
 *   3. exchanges.length === 0 → suppress (nothing to surface)
 *   4. recent session resumption (within 30 min, fewer than 3 current-session turns)
 *      → suppress (recentTurns covers this)
 *
 * Observability:
 *   Returned { emitted, surfacedCount, suppressedReason } feeds the
 *   [Oracle] conversational-block log line. memoryHealth.conversational remains
 *   the retriever's count (already wired in commit 3f0191231); this module
 *   governs emission, not the layer's health signal.
 *
 * Continuity repair (Memory Organism Pass 1, 2026-09-03):
 *   A production witness showed a member's decisive I Ching detail at character
 *   ~273 of a 306-character turn. The former 280-character prefix-only clip
 *   therefore reported the exchange as surfaced while removing the fact MAIA
 *   was being asked to remember. Bounded recall remains, but the budget is now
 *   materially larger and, for very long turns, preserves both beginning and end.
 *   A prompt budget may omit a middle; it may not systematically erase the tail.
 *
 * Drift canaries (per §V of spec):
 *   - Any future addition of cross-exchange synthesis (themes/patterns) violates
 *     the no-synthesis discipline; substrate must refuse such a PR.
 *   - Any rendering that drops provenance (recency + speaker) silently asserts
 *     authority over the content; do not remove the (Member|MAIA): "..." form.
 *   - Any code path that emits the block while recallEnabled === false is a
 *     consent-gate bypass; the gate test must remain the first branch.
 */

import type { PriorExchangeSnapshot } from './memoryLoaders';

export type SuppressionContext = {
  /** members.conversational_recall_enabled — false means member opted out */
  recallEnabled: boolean;
  /** Talk | Care | Note | Sanctuary | null — Sanctuary suppresses (defense-in-depth) */
  mode?: string | null;
  /** length of the current session's conversationHistory at this turn */
  currentSessionTurnCount: number;
  /**
   * minutes since most-recent prior cross-session turn. Combined with low
   * currentSessionTurnCount this signals session-resumption rather than
   * cross-session recall — suppress because recentTurns already covers it.
   */
  lastPriorSessionMinutesAgo: number | null;
};

export type ConversationalBlockResult = {
  block: string;
  emitted: boolean;
  surfacedCount: number;
  suppressedReason?: 'opt-out' | 'sanctuary' | 'empty' | 'session-resumption';
};

const SESSION_RESUMPTION_WINDOW_MIN = 30;
const SESSION_RESUMPTION_TURN_THRESHOLD = 3;

// Six retrieved exchanges at this ceiling are at most ~14.4k content chars before
// provenance/header overhead — deliberately generous for beta continuity while
// remaining bounded. Prefix-only truncation is forbidden because it caused a
// witnessed false negative when the member's operative detail sat near the tail.
const MAX_LINE_CONTENT_CHARS = 2400;
const OMITTED_MIDDLE_MARKER = ' …[middle omitted for recall budget]… ';

export function formatPriorExchangesForPrompt(
  exchanges: PriorExchangeSnapshot[],
  ctx: SuppressionContext,
): ConversationalBlockResult {
  // §II.C.1 — opt-out (the consent gate; must remain the first branch)
  if (ctx.recallEnabled === false) {
    return { block: '', emitted: false, surfacedCount: 0, suppressedReason: 'opt-out' };
  }
  // §II.C.2 — Sanctuary defense-in-depth
  if (ctx.mode === 'Sanctuary') {
    return { block: '', emitted: false, surfacedCount: 0, suppressedReason: 'sanctuary' };
  }
  // §II.C.3 — nothing to surface
  if (!exchanges || exchanges.length === 0) {
    return { block: '', emitted: false, surfacedCount: 0, suppressedReason: 'empty' };
  }
  // §II.C.4 — session resumption (recentTurns covers this)
  if (
    ctx.lastPriorSessionMinutesAgo !== null &&
    ctx.lastPriorSessionMinutesAgo < SESSION_RESUMPTION_WINDOW_MIN &&
    ctx.currentSessionTurnCount < SESSION_RESUMPTION_TURN_THRESHOLD
  ) {
    return { block: '', emitted: false, surfacedCount: 0, suppressedReason: 'session-resumption' };
  }

  // Render: literal recall with provenance grounding (Candidate A per spec §II.B).
  // Order is recency-DESC as retrieved; no re-ranking.
  const lines = exchanges
    .map((ex) => renderExchangeLine(ex))
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { block: '', emitted: false, surfacedCount: 0, suppressedReason: 'empty' };
  }

  const block = [
    '',
    '## PRIOR EXCHANGES (cross-session continuity, structural recall only)',
    'These are this member\'s words and your responses from sessions other than the',
    'current one. Recency is the only ordering — there is no relevance score, no',
    'thematic clustering, no system interpretation. Reference these only if directly',
    'relevant to what the member is bringing now. Do not synthesize across them.',
    'Do not name patterns that cross sessions unless the member names them first.',
    '',
    ...lines,
    '',
    '(End of prior exchanges. The member retains the meaning of their own words.)',
    '',
  ].join('\n');

  return {
    block,
    emitted: true,
    surfacedCount: lines.length,
  };
}

function renderExchangeLine(ex: PriorExchangeSnapshot): string {
  const recency = formatRecency(ex.created_at);
  const speaker = ex.role === 'user' ? 'Member' : 'MAIA';
  const content = (ex.content ?? '').trim().replace(/\s+/g, ' ');
  if (content.length === 0) return '';
  return `- ${recency}, ${speaker}: "${boundExchangeContent(content)}"`;
}

function boundExchangeContent(content: string): string {
  if (content.length <= MAX_LINE_CONTENT_CHARS) return content;

  const available = MAX_LINE_CONTENT_CHARS - OMITTED_MIDDLE_MARKER.length;
  const headChars = Math.ceil(available / 2);
  const tailChars = Math.floor(available / 2);
  const head = content.slice(0, headChars).trimEnd();
  const tail = content.slice(content.length - tailChars).trimStart();
  return `${head}${OMITTED_MIDDLE_MARKER}${tail}`;
}

function formatRecency(when: Date | string): string {
  const then = when instanceof Date ? when.getTime() : new Date(when).getTime();
  if (!Number.isFinite(then)) return 'recently';
  const diffMs = Math.max(0, Date.now() - then);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay >= 14) return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay >= 2) return `${diffDay} days ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffHr >= 2) return `${diffHr} hours ago`;
  if (diffHr === 1) return '1 hour ago';
  if (diffMin >= 2) return `${diffMin} minutes ago`;
  return 'just now';
}

export function summarizePriorExchangesForLog(result: ConversationalBlockResult): {
  emitted: boolean;
  surfacedCount: number;
  suppressedReason?: string;
} {
  return {
    emitted: result.emitted,
    surfacedCount: result.surfacedCount,
    suppressedReason: result.suppressedReason,
  };
}

/**
 * Helper to compute lastPriorSessionMinutesAgo from a retrieved exchanges array.
 * Returns null when no exchanges exist. Used by the route handler to build
 * SuppressionContext without duplicating timestamp math.
 */
export function computeLastPriorSessionMinutesAgo(
  exchanges: PriorExchangeSnapshot[],
): number | null {
  if (!exchanges || exchanges.length === 0) return null;
  const mostRecent = exchanges[0]?.created_at;
  if (!mostRecent) return null;
  const then = mostRecent instanceof Date ? mostRecent.getTime() : new Date(mostRecent).getTime();
  if (!Number.isFinite(then)) return null;
  return Math.floor(Math.max(0, Date.now() - then) / 60000);
}
