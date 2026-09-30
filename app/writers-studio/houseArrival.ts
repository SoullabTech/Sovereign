/**
 * HOUSE → WRITER'S STUDIO — the Work the member pointed at.
 *
 * The House lists a member's living Works. Before this seam, every one of
 * those rows linked to bare `/writers-studio`: the member said "this Work",
 * and the door forgot which one.
 *
 * ── WHAT CROSSES ────────────────────────────────────────────────────────────
 *
 * One identity: the living-work id the member clicked. Nothing else — no
 * title, no excerpt, no intention, no "last movement", no question. The URL
 * carries an identity, never content, which is the same discipline the Canvas
 * already uses for the manuscript (`?m=`).
 *
 * ── WHAT IS NOT CREATED ─────────────────────────────────────────────────────
 *
 * No transition record, no continuation token, no store. Navigation is not a
 * member act that produces an artifact, so it leaves no row (compare
 * `member_facet_crossings`, which is written only when the member MAKES
 * something). A log of where a member walks would be stealth memory.
 *
 * ── HOW THE STUDIO RECEIVES IT ──────────────────────────────────────────────
 *
 * The id is a request, never an authority. It is resolved only against the
 * member's OWN Works, as returned by the authenticated living-works API — an
 * id that is not theirs resolves to `unknown` and the Studio behaves exactly
 * as if nothing had been carried.
 *
 * A known Work then resolves by its declarations (WS2-03B), never by guessing:
 *
 *   exactly one manuscript declared   open it — the member already answered
 *                                     "which writing?" by declaring it
 *   none, or several                  `orient`: stay on Studio Home. Picking
 *                                     "the first" or "the most recent" would
 *                                     be a guess wearing the costume of a
 *                                     default.
 *
 * This is what `arrivalWork()` in useLivingWorks.ts deferred: with several
 * Works, "which of your works did you come back to?" is a real question the
 * Studio may not answer by guessing. A click in the House is the member
 * answering it.
 */

import type { LivingWork, LivingWorksPhase } from './useLivingWorks';

/** Query parameter naming the Work the member chose in the House. */
export const HOUSE_WORK_PARAM = 'work';

/** Where a House "What's alive" row sends the member. */
export function houseWorkHref(workId: string): string {
  const params = new URLSearchParams({ from: 'house', [HOUSE_WORK_PARAM]: workId });
  return '/writers-studio?' + params.toString();
}

export type HouseArrival =
  /** Nothing was carried. The Studio arrives as it always has. */
  | { kind: 'none' }
  /** The member's Works have not been read yet. Assert nothing meanwhile. */
  | { kind: 'pending' }
  /** Not one of this member's Works (or the Works could not be read). */
  | { kind: 'unknown' }
  /** Exactly one declared manuscript: open it. */
  | { kind: 'open'; workId: string; manuscriptId: string }
  /** The Work is theirs, but no single manuscript is declared. Do not pick. */
  | { kind: 'orient'; workId: string; manuscriptCount: number };

export function resolveHouseArrival(
  requestedWorkId: string | null | undefined,
  phase: LivingWorksPhase,
  works: readonly LivingWork[],
): HouseArrival {
  const requested = requestedWorkId?.trim();
  if (!requested) return { kind: 'none' };
  if (phase === 'loading') return { kind: 'pending' };
  if (phase !== 'ready') return { kind: 'unknown' };

  const work = works.find((w) => w.id === requested);
  if (!work) return { kind: 'unknown' };

  const manuscriptIds = [
    ...new Set(
      work.expressions
        .filter((e) => e.expressionType === 'manuscript')
        .map((e) => e.expressionId),
    ),
  ];
  if (manuscriptIds.length === 1) {
    return { kind: 'open', workId: work.id, manuscriptId: manuscriptIds[0]! };
  }
  return { kind: 'orient', workId: work.id, manuscriptCount: manuscriptIds.length };
}
