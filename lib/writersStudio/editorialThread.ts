/**
 * W1 — THE EDITORIAL THREAD, AS A PURE PROJECTION.
 *
 * ⭐⭐ WHAT THIS REPLACES. The retired card was a NOTIFICATION about a database
 * row: one change, a count where the thought belonged, and no way to answer.
 * The chain has always been a succession — `MAIA v1 → member v2 → MAIA v3`,
 * each authored, each with its own rationale — and no surface has ever rendered
 * it. W1 renders exactly what already exists and INVENTS NOTHING.
 *
 * ── ⛔ WHAT W1 MAY NOT DO ──────────────────────────────────────────────────
 *
 * ⛔ No authorization state. No `mayAccept`, no executability, in any spelling.
 *    Discussing a formulation and asking whether a permission can execute are
 *    different reads (R6), and this is the first one.
 * ⛔ No Insight, Direction or Discourse — they have no home until W5, and an
 *    empty placeholder for a missing object teaches the surface a shape the
 *    ontology has not earned.
 * ⛔ No chain-level "MAIA thinks…" manufactured out of a version's rationale. A
 *    rationale belongs to the version whose author supplied it.
 * ⛔ Read-only. Reading a proposal changes nothing.
 *
 * ── ⭐ MULTI-VERSION FROM DAY ONE (founder, 2026-09-14) ────────────────────
 *
 * Most chains in the data today hold one version, because no UI has ever
 * authored a second. ⛔ That is a fact about the DATA, never about the
 * CONTRACT: `readProposalWork()` returns the whole lineage and Step 1 exists to
 * preserve interleaved authorship. The absence of UI-generated succession must
 * not become a one-version UI architecture, so this projection is written and
 * witnessed against a real interleaved chain.
 */

/** ⛔ Exactly the fields the chain read already returns. Nothing derived. */
export interface ThreadVersionInput {
  readonly id: string;
  readonly author: 'maia' | 'member';
  readonly supersedes: string | null;
  readonly replacementText: string;
  readonly rationale?: string;
  readonly authoredAt: string;
}

export interface ThreadInput {
  readonly chainId: string;
  /** The chain's immutable locus. `expectedText` is the Work wording it opened against. */
  readonly locus: { readonly expectedText: string };
  readonly versions: readonly ThreadVersionInput[];
  readonly focusedVersionId: string | null;
}

/**
 * ⭐ `original` IS NOT A VERSION, and is deliberately a different kind.
 *
 * It is the manuscript wording the chain was opened against — nobody authored
 * it *in this exchange*. Styling it as a fourth participant would credit the
 * writer's existing prose to a turn in a conversation that had not begun.
 */
export type ThreadRow =
  | { readonly kind: 'original'; readonly text: string }
  | {
      readonly kind: 'version';
      readonly id: string;
      /** 1-based position IN THE LINEAGE — display only, never identity. */
      readonly ordinal: number;
      readonly author: 'maia' | 'member';
      readonly text: string;
      /** ⛔ TWO STATES. Absent is `null`; it is never an empty string. */
      readonly rationale: string | null;
      /** ⭐ Exactly the version the room named. */
      readonly focused: boolean;
    };

export type ThreadRefusal =
  /**
   * ⛔⭐ THE ORDER IS NOT THE STRUCTURE. Succession is carried by `supersedes`;
   * a transport that sorted by `authoredAt` would produce a plausible list that
   * is not the lineage anybody authored. This does not RE-DERIVE the order —
   * `lineage()` already owns that — it refuses to render an order that does not
   * agree with the links, which is a guard, not a second implementation.
   */
  | 'not_structural'
  /** The room named a version this chain does not contain. ⛔ Never the head. */
  | 'focus_unknown';

export type ThreadResult =
  | { readonly ok: true; readonly rows: readonly ThreadRow[] }
  | { readonly ok: false; readonly reason: ThreadRefusal };

export function editorialThread(input: ThreadInput): ThreadResult {
  const vs = input.versions;

  /* ⛔ The root supersedes nothing, and every later version supersedes exactly
     the one before it. Anything else is not the succession that was authored. */
  for (let i = 0; i < vs.length; i += 1) {
    const expected = i === 0 ? null : vs[i - 1].id;
    if (vs[i].supersedes !== expected) return { ok: false, reason: 'not_structural' };
  }

  /* ⭐ The focus is EXACT. If the writer arrived on MAIA v1 while v3 is now the
     head, the thread shows the whole lineage — ⛔ but it must never quietly
     pretend v3 is what they came to inspect. */
  if (input.focusedVersionId !== null
      && !vs.some((v) => v.id === input.focusedVersionId)) {
    return { ok: false, reason: 'focus_unknown' };
  }

  const rows: ThreadRow[] = [{ kind: 'original', text: input.locus.expectedText }];
  vs.forEach((v, i) => {
    rows.push({
      kind: 'version',
      id: v.id,
      ordinal: i + 1,
      author: v.author,
      text: v.replacementText,
      /* ⛔ Absent stays absent. `?? null`, never `?? ''` — an empty rationale
         would render as "Why:" with nothing after it, which reads as MAIA
         having failed to explain rather than as her not having spoken. */
      rationale: v.rationale ?? null,
      focused: v.id === input.focusedVersionId,
    });
  });
  return { ok: true, rows };
}

/** ⭐ Authorship is never implicit. A writer must always be able to tell their
 *  own sentence from MAIA's, so the label is part of the projection, not a
 *  styling decision taken later. */
export const authorLabel = (a: 'maia' | 'member'): string =>
  (a === 'maia' ? 'MAIA' : 'You');
