/**
 * THE APERTURE LAW.
 *
 * ⭐ An orbit may reduce the field around the Work. It may not lie on top of it.
 *
 * Recovered verbatim in intent from the accepted D9 Field + Orbit form:
 *
 *   Every orbit is OUT OF FLOW. None participates in layout.
 *
 *   ⭐ THE INVARIANT IS THE ABSENCE OF REFLOW, NOT THE TOKEN `fixed`. The room
 *   is the WRITE interior of the persistent Writer's Studio, so its orbits are
 *   positioned against the room rather than the viewport — otherwise they would
 *   slide under the Studio's own header and mode bar, which do not belong to
 *   any one mode. `absolute` inside the room's own containing block satisfies
 *   the law exactly as `fixed` did: the Work's column and scroll position are
 *   untouched by an orbit's arrival. A test that asserted the word would have
 *   failed this change while the law it names held perfectly.
 *   THE WORK CANNOT REFLOW WHEN A CAPABILITY ENTERS, because nothing an orbit
 *   does can touch it.
 *
 * Two things follow, and they are the whole of this module:
 *
 *  1 · An orbit never pushes the Work sideways. It is fixed; the Work's own
 *      column and its scroll position are untouched by its arrival.
 *  2 · An orbit never covers the Work either. The room's aperture narrows by
 *      exactly the orbit's width, so the writer never has words underneath a
 *      panel — the same words, the same scroll position, a narrower aperture.
 *
 * ⛔ This is a different law from the canonical Writer's Studio room, where
 * panels are flex children in a row and therefore DO push the writing field.
 * That difference is the integration: the room changes, the engine does not.
 *
 * ⛔ NOTHING HERE SCROLLS ANYTHING. Aperture is geometry. The one mechanism
 * that moves a writer through their book stays where the census found it, in
 * the substrate, unchanged and defect included.
 */

/** Recovered from the accepted form. Kept in rem, as it was authored. */
export const RAIL_REM = 3.25;
export const STRUCTURE_REM = 17.5;
export const MAIA_REM = 23.5;
export const WORKBENCH_REM = 15;
/** How far the workbench sits above the bottom, leaving the composer its band. */
export const WORKBENCH_BOTTOM_REM = 5.6;

/** Narrow room: an orbit may not take the whole screen, and may not take none of it. */
export const COMPACT_MAX_PX = 720;
export const STRUCTURE_MAX_VW = 78;
export const MAIA_MAX_VW = 88;

export interface OrbitState {
  structure: boolean;
  maia: boolean;
  workbench: boolean;
}

export const CLOSED: OrbitState = { structure: false, maia: false, workbench: false };

export interface Aperture {
  /** CSS length for the room's left inset: always at least the rail. */
  left: string;
  right: string;
  bottom: string;
}

const structureWidth = (compact: boolean) =>
  compact ? `min(${STRUCTURE_REM}rem, ${STRUCTURE_MAX_VW}vw)` : `${STRUCTURE_REM}rem`;

const maiaWidth = (compact: boolean) =>
  compact ? `min(${MAIA_REM}rem, ${MAIA_MAX_VW}vw)` : `${MAIA_REM}rem`;

/**
 * The room's insets for a given set of open orbits.
 *
 * ⭐ The rail is in `left` unconditionally. It is always present and always
 * fixed, so the Work's left edge never depends on whether the writer has opened
 * anything — which is the same reason the orbits are fixed: arrival and use
 * must not be two different rooms.
 */
/**
 * ⭐⭐ THE ROOM HAS AN APERTURE. THE WORK DOES NOT BECOME ONE.
 *
 * Founder ruling R1, 2026-09-10. An earlier form varied these insets with
 * `open`, so opening Struct or MAIA narrowed the box the manuscript is measured
 * in and the writer's paragraphs acquired different line breaks — because they
 * asked for assistance. That is the deeper principle behind WS2-02B:
 *
 *     conversation must not physically perturb the writing it is about.
 *
 * So the insets are now CONSTANT. Space for every orbit is reserved whether or
 * not it is open, and an orbit's arrival changes what is drawn in reserved
 * space, never what the Work measures. The room recomposes around the Work; the
 * Work does not recompose because an orbit opened.
 *
 * ⛔ Do not reintroduce `open` here. A narrower room when nothing is open is
 * not the saving it appears to be: it is paid for with the writer's line
 * breaks, every time they open a panel.
 *
 * `open` remains in the signature because the caller has it and a future
 * inset that is genuinely independent of the Work may need it — but nothing
 * that reaches the manuscript's measure may read it.
 */
export function aperture(_open: OrbitState, compact = false): Aperture {
  return {
    left: `calc(${RAIL_REM}rem + ${structureWidth(compact)})`,
    right: maiaWidth(compact),
    bottom: `calc(${WORKBENCH_BOTTOM_REM}rem + ${WORKBENCH_REM}rem)`,
  };
}

/**
 * Where the orbit itself is pinned. Returned separately from the aperture so a
 * component can never derive one from the other by hand and get them out of
 * step — a panel one pixel wider than the inset it caused is exactly the
 * "text underneath a panel" this law forbids.
 */
/**
 * ⭐ ONE DECISION, ONE PLACE. Every orbit and the strip share it, so the room
 * cannot half-contain itself — and a future move back to the viewport, or into
 * some other container, is one edit rather than six.
 */
export const OUT_OF_FLOW = 'absolute' as const;

export interface OrbitBox {
  position: typeof OUT_OF_FLOW;
  top: 0;
  bottom: 0;
  left?: string;
  right?: string;
  width: string;
}

export function structureBox(compact = false): OrbitBox {
  return { position: OUT_OF_FLOW, top: 0, bottom: 0, left: `${RAIL_REM}rem`, width: structureWidth(compact) };
}

export function maiaBox(compact = false): OrbitBox {
  return { position: OUT_OF_FLOW, top: 0, bottom: 0, right: '0px', width: maiaWidth(compact) };
}

/**
 * ⭐ The focus strip belongs to the Work, so it stops where the Work stops.
 *
 * It is the same attention as the frame in the manuscript, carried into the
 * conversation — not a separate band spanning the room. If it ran under the
 * MAIA orbit it would read as chrome belonging to the building rather than to
 * the writer's own attention.
 */
export function stripBox(open: OrbitState, compact = false) {
  const a = aperture(open, compact);
  return {
    position: OUT_OF_FLOW,
    left: a.left,
    right: open.maia ? maiaWidth(compact) : '0px',
    bottom: '0px',
  };
}

/**
 * The invariant, as a predicate, so a test can state it rather than re-derive
 * it: whatever an orbit occupies, the aperture gives up — never less (words
 * under a panel), never more (a gap the Work is not allowed to use).
 */
export function apertureMatchesOrbits(open: OrbitState, compact = false): boolean {
  const a = aperture(open, compact);
  /* Each inset reserves exactly its orbit's extent, whether or not it is open —
     so an orbit is drawn into space the Work never had, and closing one gives
     the Work nothing it must then re-measure. */
  return a.left === `calc(${RAIL_REM}rem + ${structureWidth(compact)})`
      && a.right === maiaWidth(compact)
      && a.bottom === `calc(${WORKBENCH_BOTTOM_REM}rem + ${WORKBENCH_REM}rem)`;
}

/**
 * ⭐ THE R1 LAW, DIRECTLY. Opening or closing any orbit must leave the Work's
 * box identical — not merely similar, identical — because line breaks are a
 * property of that box and the writer did not ask for new ones.
 *
 * Stated as a function rather than only as a test so the room itself can be
 * asked, and so a future inset cannot quietly reintroduce the dependency.
 */
export function apertureIsIndependentOfOrbits(compact = false): boolean {
  const states: OrbitState[] = [
    { structure: false, maia: false, workbench: false },
    { structure: true, maia: false, workbench: false },
    { structure: false, maia: true, workbench: false },
    { structure: false, maia: false, workbench: true },
    { structure: true, maia: true, workbench: true },
  ];
  const [first, ...rest] = states.map((o) => aperture(o, compact));
  return rest.every((a) =>
    a.left === first.left && a.right === first.right && a.bottom === first.bottom);
}
