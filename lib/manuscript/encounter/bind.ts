/**
 * WS2-ENCOUNTER-01 — server-owned evidence binding, by exact correspondence.
 *
 * Founder ruling 2026-09-08, after the first live witness:
 *
 *   The cognition identifies the evidence by reproducing it.
 *   The server establishes where that evidence actually is.
 *
 *   The server may establish an EXACT correspondence.
 *   It may never infer an INTENDED correspondence.
 *
 * Those are different powers. The first is evidence binding. The second is the
 * forbidden repair, and every tempting form of it is refused here:
 *
 *   0 exact matches   → does not bind       (a fabricated or altered excerpt)
 *   1 exact match     → binds; server computes the range and the digest
 *   2+ exact matches  → does not bind       (ambiguous — the server chooses NOTHING)
 *
 * The model may quote a longer surrounding passage to make its evidence unique.
 * If it still is not unique, the proposal does not bind. **That is lawful
 * failure**, and it is preferable to a server that guesses which occurrence was
 * meant — guessing is the thing the prohibition exists to prevent.
 *
 * ⛔ EXACTNESS MEANS EXACTNESS. No curly-to-straight apostrophes, no whitespace
 * normalization, no case folding, no punctuation repair, no fuzzy matching, no
 * edit distance, no substring approximation, no semantic similarity. If the model
 * changes the Work while quoting it, it does not bind. That will suppress some
 * lawful observations; measure it later rather than hiding it behind a forgiving
 * matcher.
 *
 * ── CODE POINTS, NOT UTF-16 ───────────────────────────────────────────────
 *
 * JavaScript's string APIs index UTF-16 units, and the external anchor contract
 * is code points. Every offset that leaves this module is converted, so an em
 * dash or an emoji in a manuscript cannot silently shift an anchor.
 */
import { createHash } from 'crypto';
import type { CandidateNotice, Anchor, EncounterScope } from './contract';
import type { ModelNoticeProposal } from './parse';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

export interface VisibleRange {
  /** Inclusive code-point start of what this inference call was shown. */
  readonly visibleStart: number;
  /** Exclusive code-point end of what this inference call was shown. */
  readonly visibleEnd: number;
}

export type BindOutcome =
  | { readonly ok: true; readonly anchor: Anchor; readonly boundText: string }
  | { readonly ok: false; readonly reason: 'not_found' | 'ambiguous' };

/**
 * Bind ONE excerpt against the exact text this call was shown.
 *
 * Exposure is structural rather than checked: the search happens inside the
 * visible slice only, so an excerpt that exists elsewhere in the Work but was
 * not shown to this call simply is not there to be found.
 */
export function bindExcerpt(
  text: string,
  visible: VisibleRange,
  excerpt: string,
): BindOutcome {
  const points = Array.from(text);
  const windowText = points.slice(visible.visibleStart, visible.visibleEnd).join('');

  /* Every occurrence, because the second one is what makes the first unusable. */
  const hits: number[] = [];
  for (let at = windowText.indexOf(excerpt); at !== -1; at = windowText.indexOf(excerpt, at + 1)) {
    hits.push(at);
    if (hits.length > 1) break; // two is already ambiguous; no need to count further
  }

  if (hits.length === 0) return { ok: false, reason: 'not_found' };
  if (hits.length > 1) return { ok: false, reason: 'ambiguous' };

  /* UTF-16 index → code-point index, then into whole-draft coordinates. */
  const startInWindow = Array.from(windowText.slice(0, hits[0])).length;
  const startCodePoint = visible.visibleStart + startInWindow;
  const endCodePoint = startCodePoint + Array.from(excerpt).length;
  const boundText = points.slice(startCodePoint, endCodePoint).join('');

  return {
    ok: true,
    boundText,
    anchor: { startCodePoint, endCodePoint, spanDigest: sha256(boundText) },
  };
}

/**
 * Bind proposals. Returns only what bound completely.
 *
 * `text` is the snapshot's own captured text — never re-read, so a draft that
 * moved mid-Encounter cannot be bound against its new state.
 *
 * ── SCOPE IS ATTACHED HERE, FROM THE SAME RANGE THE EVIDENCE IS BOUND IN ──
 *
 * Founder ruling 2026-09-08 (F-2): *a cognition may not assert more than the
 * evidence field it was actually permitted to perceive.* The visible range is
 * already the authority for what may be bound; making it the authority for what
 * may be claimed puts both facts on one server-owned value, so a notice cannot
 * carry evidence from one field and authority from another. The model has no
 * say in it, and no wider `kind` exists to widen it to.
 */
export function bindProposals(
  text: string,
  proposals: readonly ModelNoticeProposal[],
  visible: VisibleRange,
): CandidateNotice[] {
  const bound: CandidateNotice[] = [];
  const scope: EncounterScope = {
    kind: 'visible_window',
    startCodePoint: visible.visibleStart,
    endCodePoint: visible.visibleEnd,
  };

  for (const p of proposals) {
    const anchors: Anchor[] = [];
    let allBound = true;

    for (const e of p.evidence) {
      const outcome = bindExcerpt(text, visible, e.excerpt);
      if (!outcome.ok) { allBound = false; break; }
      anchors.push(outcome.anchor);
    }

    /* One unbindable member discards the whole notice: an observation half of
       whose evidence cannot be established is not half true. */
    if (!allBound || anchors.length === 0) continue;

    /* `text` on the candidate is MAIA'S ASSERTION ONLY. The evidence does not
       travel in it, which is what gives the vocabulary screen an authorship
       boundary — and that exemption is earned here, by the binding above having
       proved the evidence is literally Work material. */
    bound.push({ family: p.family, text: p.assertion, anchors, scope });
  }

  return bound;
}
