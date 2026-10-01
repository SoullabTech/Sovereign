/**
 * HOUSE-STUDIO-CIRCULATION-01R1 — Work-context continuity (law layer).
 *
 * ── THE LAW ────────────────────────────────────────────────────────────────
 *
 *   A member's explicit movement may declare the context in which something
 *   is being encountered without declaring what that thing ultimately is or
 *   exclusively belongs to.            (founder ruling R3, 2026-09-30)
 *
 *   Choice resolves context, not ontology.
 *
 * Two kinds of truth, kept apart:
 *
 *   STRUCTURAL   the member's durable declarations (living_work_expressions).
 *                M may belong to W and W2. WS2-03B stays correct not to
 *                manufacture a unique Work from ambiguous structure.
 *   SITUATIONAL  the member's present act. Entering M through W says "I am
 *                entering M as part of W right now" — never "M belongs only
 *                to W". It rewrites nothing.
 *
 * ── WS2-03B AMENDMENT: PRECEDENCE, NOT WEAKENING ──────────────────────────
 *
 *   valid explicit context  →  relationship inference  →  ambiguity
 *
 * The ambiguity rule is untouched. What changes is that a VALID explicit
 * context is consulted first, and it says so: the resolved Work carries its
 * authority, so explicit context never masquerades as inference.
 *
 * ── WHY THE URL IS NEVER TRUSTED ───────────────────────────────────────────
 *
 * The carried Work id is a claim. It has authority only when, at this render,
 * all three hold against the member's own declarations:
 *
 *   1. the member holds M (it is on the table),
 *   2. the member holds W (W is in their member-scoped works),
 *   3. the member has declared M into W.
 *
 * `works` is the member-scoped list (credential-scoped server-side; no
 * parameter can name another member), so (2) is ownership, not a lookup.
 * Any failure falls through to inference QUIETLY — a foreign, unknown or
 * withdrawn id is simply absent, and nothing about it is disclosed. Because
 * validation re-runs on every render, a declaration the member withdraws
 * cannot survive in a bookmarked URL: the claim stops validating.
 *
 * ── WHAT IS NOT HERE, DELIBERATELY ─────────────────────────────────────────
 *
 *   no store, cookie, localStorage or "last Work"   (WS2-03B: derived, never stored)
 *   no memberId in any address                      (identity is the session)
 *   no recency, no first row                        (a guess wearing a default's costume)
 *   no "recently entered", no inferred intent       (intention custody)
 *
 * Movement is not artifact production: nothing here writes.
 */

import type { LivingWork, LivingWorksPhase } from './useLivingWorks';
import { declaringWorks, type WorkContext } from './workContext';
import { CANVAS_MANUSCRIPT_PARAM } from './canvasIdentity';

/** How the Studio came to name a Work. Never collapsed into one. */
export type WorkContextAuthority = 'member_explicit' | 'relationship_inferred';

export type SituatedWorkContext =
  | { kind: 'unknown' }
  | { kind: 'none' }
  | { kind: 'work'; work: LivingWork; authority: WorkContextAuthority }
  | { kind: 'ambiguous'; works: LivingWork[] };

/**
 * The carried contextual Work. One definition, every leg. Same wire name as
 * the Studio → MAIA handoff's Work param: in both places it means "the Work
 * this is being encountered within", and in both it is validated, never trusted.
 */
export const STUDIO_WORK_PARAM = 'work';

/** Origin marker for arrivals from the House. Orientation only; confers nothing. */
export const FROM_HOUSE = 'house';

/**
 * Resolve the Studio's current Work for manuscript M, honouring a member's
 * explicit context W when — and only when — it validates.
 */
export function resolveSituatedWorkContext(
  phase: LivingWorksPhase,
  works: readonly LivingWork[],
  manuscriptId: string | null,
  explicitWorkId: string | null,
): SituatedWorkContext {
  if (phase !== 'ready') return { kind: 'unknown' };
  if (!manuscriptId) return { kind: 'none' };

  const declaring = declaringWorks(works, manuscriptId);

  // 1 · valid explicit context. Validation IS membership in `declaring`:
  //     W is the member's (it is in `works`) and W declares M.
  if (explicitWorkId) {
    const chosen = declaring.find((w) => w.id === explicitWorkId);
    if (chosen) return { kind: 'work', work: chosen, authority: 'member_explicit' };
    // Invalid claim: fall through. Quietly. Never trust the URL.
  }

  // 2 · relationship inference (WS2-03B, unchanged) · 3 · ambiguity.
  if (declaring.length === 0) return { kind: 'none' };
  if (declaring.length === 1) {
    return { kind: 'work', work: declaring[0], authority: 'relationship_inferred' };
  }
  return { kind: 'ambiguous', works: declaring };
}

/** Structural view, for consumers that must not see authority. */
export function asWorkContext(ctx: SituatedWorkContext): WorkContext {
  return ctx.kind === 'work' ? { kind: 'work', work: ctx.work } : ctx;
}

/**
 * Arriving in the Studio through a Work (the reverse lookup). The inverse of
 * WS2-03B over the SAME declarations — no second source of truth.
 *
 *   absent        W is not the member's (unknown, foreign, withdrawn). Discloses
 *                 nothing: no title, no existence verdict.
 *   no-manuscript W exists without one — a correct state (D-018), not a fault.
 *   one           exactly one declared manuscript. Not a guess: there is one.
 *   several       the member chooses. `manuscriptIds` keeps declaration order,
 *                 and ORDER IS NEVER A RANKING — no recency, no first-as-default.
 */
export type WorkArrival =
  | { kind: 'unknown' }
  | { kind: 'absent' }
  | { kind: 'no-manuscript'; work: LivingWork }
  | { kind: 'one'; work: LivingWork; manuscriptId: string }
  | { kind: 'several'; work: LivingWork; manuscriptIds: string[] };

export function resolveWorkArrival(
  phase: LivingWorksPhase,
  works: readonly LivingWork[],
  workId: string | null,
): WorkArrival {
  if (phase !== 'ready') return { kind: 'unknown' };
  if (!workId) return { kind: 'absent' };
  const work = works.find((w) => w.id === workId);
  if (!work) return { kind: 'absent' };

  const ids: string[] = [];
  for (const e of work.expressions) {
    if (e.expressionType === 'manuscript' && !ids.includes(e.expressionId)) {
      ids.push(e.expressionId);
    }
  }
  if (ids.length === 0) return { kind: 'no-manuscript', work };
  if (ids.length === 1) return { kind: 'one', work, manuscriptId: ids[0] };
  return { kind: 'several', work, manuscriptIds: ids };
}

/** House → Writing doorway, carrying the Work the member pointed at. Nothing else. */
export function studioArrivalFromHouse(workId: string): string {
  return `/writers-studio?from=${FROM_HOUSE}&${STUDIO_WORK_PARAM}=${encodeURIComponent(workId)}`;
}

/**
 * The address of M encountered within W. The pair means
 *   manuscript = M (the thing entered) · work = W (context chosen)
 * and NEVER "M uniquely belongs to W". It is re-validated on every load.
 */
export function situatedManuscriptAddress(manuscriptId: string, workId: string | null): string {
  // The canonical host (C11): /writers-studio with query-addressed modes. Mode
  // changes inside the host copy every param, so `work` rides along unaided —
  // and falls through to inference wherever it stops validating.
  const base = `/writers-studio?mode=write&${CANVAS_MANUSCRIPT_PARAM}=${encodeURIComponent(manuscriptId)}`;
  return workId ? `${base}&${STUDIO_WORK_PARAM}=${encodeURIComponent(workId)}` : base;
}

/** The carried contextual Work, read raw. A claim until resolved above. */
export type StudioSearchParams = string | Pick<URLSearchParams, 'get'>;

export function readStudioWorkParam(search: StudioSearchParams): string | null {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const v = params.get(STUDIO_WORK_PARAM);
  return v && v.trim() ? v : null;
}

/**
 * Internal room → Studio Home transport. Preserve the manuscript and validated
 * contextual Work claim, but remove the House-arrival marker and room-local
 * transient state. Returning Home is not a second House arrival.
 */
export function studioHomeReturnSearch(search: string): string {
  const next = new URLSearchParams(search);
  next.set('mode', 'home');
  next.delete('from');
  for (const key of [
    'reviewRun', 'reviewFinding', 'developField', 'developIntent', 'r',
    'insightReading', 'insightObservation', 'insightAction', 'attentionItem',
  ]) next.delete(key);
  return next.toString();
}

/**
 * The Work Home may focus after an internal Studio return. This is a consumer
 * of the existing situated-Work resolver, never a second resolution rule.
 */
export function resolveStudioHomeReturnWork(
  phase: LivingWorksPhase,
  works: readonly LivingWork[],
  manuscriptId: string | null,
  explicitWorkId: string | null,
): LivingWork | null {
  const context = resolveSituatedWorkContext(phase, works, manuscriptId, explicitWorkId);
  return context.kind === 'work' ? context.work : null;
}

/* ══════════════════════════════════════════════════════════════════════════
   STUDIO ARRIVAL THROUGH A GOVERNED CROSSING  (founder ruling H1-3)

     explicit Work  >  member choice  >  existing Studio fallback

   Recency is an algorithmic substitute for relationship, and the House has
   already supplied the relationship. So when a Work arrives, "the most recent
   manuscript" is never consulted: the Work's own declared manuscripts are the
   whole field, and where there are several the member chooses.

   `fallback` means the carried claim conferred nothing (absent, or nothing
   carried) — the Studio's existing arrival resumes, unchanged. A Work the
   member does not hold is indistinguishable from no Work at all.

   Only manuscripts the member HOLDS are offered: a declaration can outlive the
   manuscript it names, and an entry that cannot be opened is a dead end.
   ══════════════════════════════════════════════════════════════════════════ */

export interface ArrivalManuscript {
  id: string;
  title: string | null;
}

export type StudioArrival =
  | { kind: 'fallback' }
  | { kind: 'unknown' }
  | { kind: 'no-manuscript'; work: LivingWork }
  | { kind: 'one'; work: LivingWork; manuscript: ArrivalManuscript }
  | { kind: 'several'; work: LivingWork; manuscripts: ArrivalManuscript[] };

export type HeldManuscriptsPhase = 'loading' | 'none' | 'ready' | 'unauthorized' | 'error';

export function resolveStudioArrival(
  worksPhase: LivingWorksPhase,
  works: readonly LivingWork[],
  heldPhase: HeldManuscriptsPhase,
  held: readonly ArrivalManuscript[],
  workId: string | null,
): StudioArrival {
  if (!workId) return { kind: 'fallback' };
  // `unknown` means "not read YET" — loading only. A read that FAILED
  // (unauthorized, error) is not pending: the carried Work confers nothing and
  // the Studio's own handling ("Sign in…", its error state) must be reached.
  // Reporting a failure as `unknown` would hold the member on "Opening…"
  // forever. (Found by the founder's real-stack walk, 2026-09-30.)
  if (worksPhase === 'loading' || heldPhase === 'loading') return { kind: 'unknown' };
  if (worksPhase !== 'ready') return { kind: 'fallback' };
  // A failed manuscripts read must never read as "this Work has none": that
  // would offer *Begin this Work* and create a duplicate beside manuscripts the
  // member already has. Only a readable list (or a read that found none) may
  // produce the arrival states.
  if (heldPhase !== 'ready' && heldPhase !== 'none') return { kind: 'fallback' };
  const base = resolveWorkArrival(worksPhase, works, workId);
  if (base.kind === 'unknown') return { kind: 'unknown' };
  if (base.kind === 'absent') return { kind: 'fallback' };
  const pool = heldPhase === 'ready' ? held : [];

  const ids =
    base.kind === 'one' ? [base.manuscriptId]
      : base.kind === 'several' ? base.manuscriptIds
        : [];
  // Declaration order, filtered to what the member holds. Never re-sorted.
  const offered: ArrivalManuscript[] = [];
  for (const id of ids) {
    const m = pool.find((x) => x.id === id);
    if (m) offered.push({ id: m.id, title: m.title });
  }

  if (offered.length === 0) return { kind: 'no-manuscript', work: base.work };
  if (offered.length === 1) return { kind: 'one', work: base.work, manuscript: offered[0] };
  return { kind: 'several', work: base.work, manuscripts: offered };
}
