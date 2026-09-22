/**
 * WS-CONVERGENCE-01 · C3 — the place law, PURE.
 *
 * ⭐ Separated from the component on purpose: *where the writer is* and *how it
 * is drawn* are different things, and only the first is a law worth asserting
 * without a browser. (The discipline `scope.ts` and `observationIdentity.ts`
 * already follow.)
 *
 * ⛔ CREATES NO LOCATION SYSTEM. It composes the existing `SECTION_PARAM`.
 */

import { SECTION_PARAM } from './placeInWork';

export interface PlaceCrumb {
  readonly workName: string;
  /** The authored division, where the Work has one. ⛔ Never invented. */
  readonly unitLabel: string | null;
  /** ⛔ Null is a truthful state, not a default to be filled. */
  readonly sectionId: string | null;
  readonly sectionLabel: string | null;
}

/**
 * ⭐ The address to return to is the CURRENT place, ⛔ not the Work root.
 *
 * ⛔ With no current section the param is ABSENT — never `s=<first section>`.
 * ⭐ Inventing a place is exactly how "Back to manuscript" quietly becomes
 * "back to the top" and the writer loses the thing they were looking at.
 */
export function backToManuscriptHref(
  canvasHref: string,
  manuscriptId: string,
  sectionId: string | null,
): string {
  const params = new URLSearchParams({ m: manuscriptId });
  if (sectionId) params.set(SECTION_PARAM, sectionId);
  return `${canvasHref}?${params.toString()}`;
}

/** ⭐ Reads as a place in a book, ⛔ never as a path through software. */
export function placeLine(crumb: PlaceCrumb): string {
  return [crumb.workName, crumb.unitLabel, crumb.sectionLabel]
    .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
    .join(' › ');
}
