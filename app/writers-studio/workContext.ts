/**
 * WS2-03B — the Studio's persistent Work context, and the seam it hands off.
 *
 * ── WHAT A "CURRENT WORK" IS ALLOWED TO BE ─────────────────────────────────
 *
 * A Work becomes the Studio's current context only through a member's own
 * declaration — a living_work_expressions row they created placing this
 * manuscript in that Work. Nothing here infers, ranks, or picks. The three
 * cases are the founder's, stated as three and kept as three:
 *
 *   0 declaring Works   claim no Work identity. The manuscript is on the
 *                       table and that is all the room knows.
 *   1 declaring Work    that Work is the explicit persistent context.
 *   2+ declaring Works  ambiguous. Never guess — an expression may belong to
 *                       several Works by design (D-018), so this is a correct
 *                       state, not a data fault, and the room says so.
 *
 * Note what the ambiguous case does NOT do: it does not fall back to "the
 * first one", to "the most recently declared", or to the member's only other
 * Work. Every one of those is a guess wearing the costume of a default.
 *
 * ── WHY IT IS DERIVED, NOT STORED ──────────────────────────────────────────
 *
 * "Reload must preserve the resolved current Work." That could have been a
 * cookie, a localStorage key, or a server-side "last Work" column, and each
 * would have introduced a second source of truth that can disagree with the
 * declarations. Instead the Work is a pure function of (manuscript identity,
 * the member's declarations), and the MANUSCRIPT identity is what persists —
 * pinned into the URL by the Canvas so a reload resolves the same Work by
 * re-deriving it rather than by remembering it.
 *
 * That is strictly safer: stored context can go stale against a declaration
 * the member has since withdrawn. Derived context cannot.
 */

import type { LivingWork, LivingWorksPhase } from './useLivingWorks';
import { CANVAS_MANUSCRIPT_PARAM } from './canvasIdentity';

export type WorkContext =
  /** The declarations have not been read yet. Assert nothing meanwhile. */
  | { kind: 'unknown' }
  /** No Work declares this manuscript. The room claims no Work identity. */
  | { kind: 'none' }
  /** Exactly one. This is the persistent context the shell carries. */
  | { kind: 'work'; work: LivingWork }
  /** Several declare it. A real question; the room does not answer it. */
  | { kind: 'ambiguous'; works: LivingWork[] };

/** Every Work in which the member has declared this manuscript. */
export function declaringWorks(
  works: readonly LivingWork[],
  manuscriptId: string,
): LivingWork[] {
  return works.filter((w) =>
    w.expressions.some(
      (e) => e.expressionType === 'manuscript' && e.expressionId === manuscriptId,
    ),
  );
}

export function resolveWorkContext(
  phase: LivingWorksPhase,
  works: readonly LivingWork[],
  manuscriptId: string | null,
): WorkContext {
  if (phase !== 'ready') return { kind: 'unknown' };
  if (!manuscriptId) return { kind: 'none' };
  const declaring = declaringWorks(works, manuscriptId);
  if (declaring.length === 0) return { kind: 'none' };
  if (declaring.length === 1) return { kind: 'work', work: declaring[0] };
  return { kind: 'ambiguous', works: declaring };
}

/** The one Work the shell may name, or null. Never a guess. */
export function currentWork(context: WorkContext): LivingWork | null {
  return context.kind === 'work' ? context.work : null;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE STUDIO → MAIA HANDOFF, AS A CONTRACT

   The founder's minimum semantic contract:

     current Work identity → MAIA exchange situated in same Work
       → return to Studio → same Work remains current

   Both ENDS of that round trip are built here and tested as a round trip:
   the outbound carries the Work identity and an exact return address, and the
   return address carries the manuscript identity from which the same Work is
   re-derived. `assertRoundTripPreservesWork` is the executable form of the
   contract — it fails if either leg starts guessing.

   WHAT IS DELIBERATELY NOT DONE: this does not make the MAIA band's
   Conversations destination available. The middle term of the contract —
   "MAIA exchange situated in same Work" — is not this lane's to assert:
   /maia is a generic conversational surface that does not read a Work, and
   handing it an identity it ignores would satisfy the URL and not the
   contract. Per the founder's rule for §5, Conversations stays unavailable
   until the exchange is genuinely situated. The contract is built and proven
   here so that when the MAIA side lands, the Studio side is not the unknown.
   ══════════════════════════════════════════════════════════════════════════ */

/** The parameter a situated MAIA exchange would read. One definition. */
export const MAIA_WORK_PARAM = 'work';
/** Where MAIA returns the member. One definition, both legs. */
export const MAIA_RETURN_PARAM = 'return';

export interface Handoff {
  workId: string;
  manuscriptId: string;
}

/** Where the Studio sends the member, carrying identity and a way back. */
export function handoffToMaia(base: string, h: Handoff): string {
  const back = returnAddress(h.manuscriptId);
  const sep = base.includes('?') ? '&' : '?';
  return (
    `${base}${sep}${MAIA_WORK_PARAM}=${encodeURIComponent(h.workId)}` +
    `&${MAIA_RETURN_PARAM}=${encodeURIComponent(back)}`
  );
}

/** The Studio address that resolves to this exact manuscript, and no other. */
export function returnAddress(manuscriptId: string): string {
  return `/writers-studio/canvas?${CANVAS_MANUSCRIPT_PARAM}=${encodeURIComponent(manuscriptId)}`;
}

/**
 * The contract, executable.
 *
 * Walks the whole round trip on real data and asserts the Work the member
 * comes back to is the Work they left with — re-derived from declarations,
 * never carried as a claim.
 */
export function assertRoundTripPreservesWork(
  works: readonly LivingWork[],
  manuscriptId: string,
): void {
  const before = resolveWorkContext('ready', works, manuscriptId);
  if (before.kind !== 'work') {
    throw new Error('Handoff requires exactly one declaring Work — nothing to carry.');
  }
  const out = handoffToMaia('/maia', { workId: before.work.id, manuscriptId });
  const carried = new URLSearchParams(out.slice(out.indexOf('?'))).get(MAIA_WORK_PARAM);
  if (carried !== before.work.id) {
    throw new Error('Handoff dropped the Work identity on the outbound leg.');
  }
  const back = new URLSearchParams(out.slice(out.indexOf('?'))).get(MAIA_RETURN_PARAM);
  if (!back) throw new Error('Handoff carries no return address.');
  const returned = new URLSearchParams(back.slice(back.indexOf('?'))).get(
    CANVAS_MANUSCRIPT_PARAM,
  );
  if (returned !== manuscriptId) {
    throw new Error('Return address does not name the manuscript that was left.');
  }
  const after = resolveWorkContext('ready', works, returned);
  if (after.kind !== 'work' || after.work.id !== before.work.id) {
    throw new Error('The Work did not survive the return leg.');
  }
}
