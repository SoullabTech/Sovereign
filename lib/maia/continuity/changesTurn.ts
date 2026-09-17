/**
 * MAIA-NODE-05 — conversational invocation of Changes continuity.
 *
 * The one seam where member language reaches the governed Changes READ:
 *
 *   utterance → intent → canonical read → factual answer
 *
 * ⛔ NO NEW DOMAIN LOGIC. The open-state predicate, ordering, phrasing and
 * member scoping all come from `changesContinuity`; the query comes from
 * `readMemberChanges`, the same function `GET /api/changes` calls. This module
 * decides only *whether the member asked* and *what to say back*.
 *
 * ── Why the answer is deterministic ───────────────────────────────────────
 *
 * §8: the capability result outranks model recall. That cannot be guaranteed by
 * asking a model nicely, so the response text is CONSTRUCTED here and the turn
 * returns before cognition. A Change absent from the capability result is
 * absent from the answer because the model never sees the question.
 *
 * ── Why nothing is written ────────────────────────────────────────────────
 *
 * §12 requires no write. So this turn deliberately does NOT pass through the
 * orchestrator and forms no conversation turn, no memory and no episode.
 * Consequently a follow-up ("the beta one") re-invokes the canonical read
 * rather than relying on stored state — the result set is re-derived, still
 * authoritative, and still only a read.
 */

import { readMemberChanges } from '@/lib/changes/readMemberChanges';
import {
  selectOpenChanges,
  matchChangesByTitle,
  isChangesContinuityRequest,
  describeOpenChanges,
  describeChange,
  type ChangeRecord,
} from './changesContinuity';

/** What the conversation route does with the result. */
export type ChangesTurnOutcome =
  | { handled: false }
  | { handled: true; message: string; capability: 'changes.continuity'; count: number }
  | { handled: true; message: string; capability: 'changes.continuity'; failed: true };

/**
 * A follow-up reference to one Change from a list just given.
 *
 * Only a short phrase that names part of a title counts. ⛔ Never an ordinal
 * ("the first one") — position in a list is not a name, and honouring it would
 * quietly make the canonical ordering meaningful in a way §13 says it is not.
 */
const FOLLOW_UP = /^(?:the\s+)?(.{3,40}?)\s*(?:one|change)\s*[.!?]?$/i;

/**
 * Ordinals, refused explicitly.
 *
 * ⚠️ Not hypothetical: "the first one" reaches FOLLOW_UP with the fragment
 * "first", and "Sharing MAIA with the FIRST beta testers" contains it — so
 * without this the ordinal would resolve by coincidence, and the canonical
 * ordering would silently start meaning something §13 says it does not.
 */
const ORDINAL = /^(?:first|second|third|fourth|fifth|last|latest|next|previous|1st|2nd|3rd|\d+(?:th)?)$/i;

function toRecord(c: { id: string; memberId: string; title: string; status: string; createdAt: string | Date | null; updatedAt: string | Date | null }): ChangeRecord {
  return {
    id: c.id, memberId: c.memberId, title: c.title, status: c.status,
    createdAt: c.createdAt, updatedAt: c.updatedAt,
  };
}

/**
 * Try to answer a Changes-continuity question.
 *
 * Returns `{ handled: false }` for everything else — which is the common and
 * correct case, and is what lets MAIA simply stay with a member who is talking
 * about their life rather than querying their records.
 *
 * @param memberId a CREDENTIAL-VERIFIED member id. ⛔ Never a header or body value.
 */
export async function tryChangesContinuityTurn(
  memberId: string | null | undefined,
  utterance: string,
): Promise<ChangesTurnOutcome> {
  if (!memberId || !utterance) return { handled: false };

  const asksAboutChanges = isChangesContinuityRequest(utterance);
  const followUp = utterance.trim().match(FOLLOW_UP);
  if (!asksAboutChanges && !followUp) return { handled: false };

  let rows: ChangeRecord[];
  try {
    rows = (await readMemberChanges(memberId)).map(toRecord);
  } catch {
    // §9 — never fabricate continuity, and never quietly fall back to a generic
    // memory search dressed up as this capability.
    if (!asksAboutChanges) return { handled: false };
    return {
      handled: true,
      capability: 'changes.continuity',
      failed: true,
      message: "I couldn't retrieve your Changes just now.",
    };
  }

  const open = selectOpenChanges(rows, memberId);

  // ── Follow-up: resolve ONLY against the set just derived ──────────────────
  if (followUp && !asksAboutChanges) {
    const fragment = followUp[1].trim();
    if (ORDINAL.test(fragment)) return { handled: false };
    const matches = matchChangesByTitle(open, fragment);
    if (matches.length === 0) return { handled: false }; // not a reference we can honour
    if (matches.length > 1) {
      return {
        handled: true,
        capability: 'changes.continuity',
        count: matches.length,
        message:
          `More than one of your open Changes matches that — ` +
          matches.map((m) => `“${m.title}”`).join(', ') +
          `. Which one do you mean?`,
      };
    }
    return {
      handled: true,
      capability: 'changes.continuity',
      count: 1,
      message: describeChange(matches[0]),
    };
  }

  // ── The list ─────────────────────────────────────────────────────────────
  if (open.length === 0) {
    return {
      handled: true,
      capability: 'changes.continuity',
      count: 0,
      message: describeOpenChanges([]),
    };
  }

  if (open.length === 1) {
    return {
      handled: true,
      capability: 'changes.continuity',
      count: 1,
      message: `You have one open Change: “${open[0].title}.” Its status is ${open[0].status}.`,
    };
  }

  // Several: one per line, canonical order preserved, plus an OFFER — never a
  // choice. MAIA does not pick one for the member.
  const lines = open.map((c) => `“${c.title}” — ${c.status}`).join('\n');
  const count = open.length === 2 ? 'two' : open.length === 3 ? 'three' : String(open.length);
  return {
    handled: true,
    capability: 'changes.continuity',
    count: open.length,
    message: `You have ${count} open Changes:\n${lines}\n\nWant to look at one of them?`,
  };
}
