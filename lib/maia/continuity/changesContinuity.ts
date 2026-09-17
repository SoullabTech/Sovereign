/**
 * MAIA-NODE-04 — truthful continuity over Changes.
 *
 * Pure. No network, no database, no model. Given rows from the canonical
 * Changes read authority, it selects the ones the member has left open and
 * states what is recorded. Nothing here decides what matters.
 *
 *   MAIA may remind the member of what the member has actually left open;
 *   she may not decide what remains unresolved.
 *
 * ── Why a Change can be called "open" at all ───────────────────────────────
 *
 * Because the member put it in that state and left it there. `studio_changes`
 * carries a member-controlled lifecycle, and `PATCH /api/changes/[id]` accepts
 * exactly five of its seven values — the two it does not accept, `casting` and
 * `consulting`, are set only by the I Ching cast and council consult
 * sub-routes. Those are transient states INSIDE an interaction, so treating
 * them as continuity would surface a Change because a machine step was
 * mid-flight rather than because a person left something unfinished.
 *
 * ⛔ No inference layer. A status is a recorded domain fact. `integrating` means
 * the member set it to integrating — it is not a psychological reading, and
 * nothing in this module may present it as one.
 */

/** Member-authored unfinished lifecycle states. Ruled, MAIA-NODE-04 §II. */
export const OPEN_CHANGE_STATUSES = ['naming', 'active', 'integrating'] as const;

/** Transient interaction states — ⛔ never continuity. */
export const TRANSIENT_CHANGE_STATUSES = ['casting', 'consulting'] as const;

/** Finished. */
export const CLOSED_CHANGE_STATUSES = ['complete', 'archived'] as const;

export type OpenChangeStatus = (typeof OPEN_CHANGE_STATUSES)[number];

/** The subset of the canonical read's shape this capability uses. */
export interface ChangeRecord {
  id: string;
  memberId: string;
  title: string;
  status: string;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

/**
 * Is this a state the member left open?
 *
 * An allowlist, deliberately. A status this module has never heard of is NOT
 * open — a new lifecycle value must be ruled before it can become continuity,
 * rather than becoming continuity by default the moment someone adds it.
 */
export function isOpenChange(status: string): status is OpenChangeStatus {
  return (OPEN_CHANGE_STATUSES as readonly string[]).includes(status);
}

/**
 * The member's open Changes, in the canonical order.
 *
 * ── Ownership ──
 * The security boundary is the canonical read authority's own
 * `WHERE c.member_id = $1`, under `getMemberIdFromRequest`. `memberId` is
 * re-checked here as defence in depth, never as the primary guard: a row for
 * another member should be impossible, and if one ever arrives it is dropped
 * rather than shown.
 *
 * ── Ordering ──
 * The canonical route already orders `created_at DESC`, and that order is
 * PRESERVED rather than replaced. Re-sorting by `updatedAt` was considered and
 * refused: it would make MAIA's list disagree with the member's own Changes
 * surface for no factual gain. So the order means exactly one thing —
 * **most recently named** — and it means nothing about importance.
 *
 * ⛔ No semantic relevance, emotional content, model score, affinity,
 * frequency or inferred urgency participates. This function cannot rank: it
 * filters and preserves.
 */
export function selectOpenChanges(rows: ChangeRecord[], memberId: string): ChangeRecord[] {
  if (!memberId) return [];
  return rows.filter((r) => r.memberId === memberId && isOpenChange(r.status));
}

/**
 * Narrow to a Change the member named in their own words.
 *
 * Matches against the member's own authored `title` only. This is string
 * containment over text the member wrote — ⛔ not a semantic search, not an
 * embedding, and never a guess about which Change they "must have meant".
 * Ambiguity returns everything that matched, so the caller can ask rather than
 * choose for them.
 */
export function matchChangesByTitle(rows: ChangeRecord[], fragment: string): ChangeRecord[] {
  const f = fragment.trim().toLowerCase();
  if (f.length < 3) return [];
  return rows.filter((r) => r.title.toLowerCase().includes(f));
}

// ── Intent ─────────────────────────────────────────────────────────────────

/**
 * Requests this capability answers. Each names Changes explicitly.
 *
 * ⛔ Deliberately excluded, because the Change lifecycle does not authorize the
 * judgment they ask for: "what should I work on", "what matters most right
 * now", "what haven't I dealt with", "what am I avoiding".
 */
const CHANGES_CONTINUITY_PATTERNS: RegExp[] = [
  /\bwhat changes?\b.*\b(open|still|not complete|unfinished|working)\b/,
  /\b(which|what) changes?\b.*\b(have i|do i|am i)\b/,
  /\bchanges?\b.*\bstill (open|going|active)\b/,
  /\bam i working (with|on) any changes?\b/,
  /\bremind me (which|what) changes?\b/,
  /\bwhat changes have i named\b/,
  /\bmy open changes?\b/,
  /\bopen changes?\b/,
  /\bstatus of my change\b/,
];

/**
 * Does this utterance ask about Changes continuity?
 *
 * Requires the word "change(s)" — this capability never answers a question the
 * member did not ask about Changes. A broad "what were we working on
 * yesterday?" is NOT silently reinterpreted as "show my Changes"
 * (MAIA-NODE-04 §XI); it simply does not match here.
 */
export function isChangesContinuityRequest(utterance: string): boolean {
  const text = utterance.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!/\bchanges?\b/.test(text)) return false;
  return CHANGES_CONTINUITY_PATTERNS.some((re) => re.test(text));
}

// ── Presentation ───────────────────────────────────────────────────────────

/**
 * A factual sentence about what is recorded.
 *
 * Reports title and status and stops. ⛔ No interpretation: nothing here may
 * say a Change is important, unresolved, avoided, stuck, or worth returning
 * to. `integrating` is reported as the domain status it is.
 */
export function describeOpenChanges(open: ChangeRecord[]): string {
  if (open.length === 0) {
    return "You don't currently have any Changes in an open state.";
  }
  const parts = open.map((c) => `“${c.title}” is ${c.status}`);
  if (parts.length === 1) return `${parts[0]}.`;
  const head = parts.slice(0, -1).join(', ');
  const count = open.length === 2 ? 'two' : open.length === 3 ? 'three' : String(open.length);
  return `You have ${count} open Changes: ${head}, and ${parts[parts.length - 1]}.`;
}

/** Factual single-Change report. */
export function describeChange(change: ChangeRecord): string {
  return `“${change.title}” is currently ${change.status}.`;
}
