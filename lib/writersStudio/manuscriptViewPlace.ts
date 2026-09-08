/**
 * WS-WHOLE-MANUSCRIPT-01 — where the writer is, per view, without inventing it.
 *
 * Two views observe place by different means, and the surfaces that REPRESENT
 * place — the outline's gold current row, the `s=` parameter in the address bar
 * — must consume what was observed rather than reach for whatever value is
 * nearest to hand.
 *
 *   Section view   the single mounted editor IS the place
 *   Whole view     the focused section, else the top of the viewport
 *
 * ⛔ THE FOUNDER'S INVARIANT (2026-09-08): *the mode switch may TRANSFER place,
 * but it may not INFER place.* A fallback that quietly substitutes the old
 * Section location for an unestablished Whole location — while the URL and the
 * gold row update as though continuity were known — states a fact about the
 * writer's position that nothing observed. `ManuscriptOutline` already refuses
 * to draw its marker without a known current section for exactly that reason.
 *
 * So `null` is a real answer here and must survive to the caller. A renderer may
 * choose what to show when there is no known place; it may not launder that
 * choice back into a claim that the writer was there.
 */

export type ManuscriptViewMode = 'section' | 'whole';

export interface PlaceInputs {
  /** The section whose editor is mounted in Section view. */
  sectionActiveId: string | null;
  /** What Whole Manuscript has actually observed. Null until it observes one. */
  wholePlaceId: string | null;
}

/**
 * The place a representational surface may assert, for the view in force.
 *
 * Deliberately no cross-mode fallback. In Whole view, `sectionActiveId` names
 * where the writer WAS when they arrived, which is precisely the stale value
 * this exists to keep out of the URL and the gold row.
 */
export function placeForMode(view: ManuscriptViewMode, inputs: PlaceInputs): string | null {
  return view === 'section' ? inputs.sectionActiveId : inputs.wholePlaceId;
}

/**
 * Which section Section view should open when the writer comes back from Whole.
 *
 * TRANSFER, NOT INFERENCE. Returns the observed Whole place if there is one, and
 * `null` otherwise — meaning "nothing to transfer", which leaves Section view
 * where it already was rather than moving the writer somewhere no one observed.
 */
export function returningSection(wholePlaceId: string | null): string | null {
  return wholePlaceId;
}

/**
 * Which section Whole Manuscript should open at when the writer goes there from
 * Section view.
 *
 * The asymmetry with `returningSection` is deliberate and matches how the two
 * views know things: Section view's place is unambiguous — one editor is
 * mounted, and it is where the writer is — so it transfers as an OPENING
 * position. Whole view's place is observed by scrolling and focus, so what
 * transfers back is the last thing actually observed.
 */
export function openingWholeSection(sectionActiveId: string | null): string | null {
  return sectionActiveId;
}
