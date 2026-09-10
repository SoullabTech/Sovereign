import {
  CLOSED,
  MAIA_REM,
  RAIL_REM,
  STRUCTURE_REM,
  aperture,
  apertureMatchesOrbits,
  maiaBox,
  stripBox,
  structureBox,
  type OrbitState,
  OUT_OF_FLOW,
  apertureIsIndependentOfOrbits,
  resolveWorkMeasure,
  roomHoldsWorkAndOrbits,
  REM_PX,
  RAIL_REM as RAIL,
  STRUCTURE_REM as STRUCT,
  MAIA_REM as MAIA,
} from '../field/fieldAperture';
import { writingFieldLayout } from '../studioTheme';

const ALL: OrbitState[] = [
  CLOSED,
  { structure: true, maia: false, workbench: false },
  { structure: false, maia: true, workbench: false },
  { structure: false, maia: false, workbench: true },
  { structure: true, maia: true, workbench: true },
];

describe('the aperture law', () => {
  /** ⭐ An orbit may reduce the field around the Work. It may not lie on top of it. */
  it.each(ALL)('gives up exactly what the orbits occupy (%j)', (open) => {
    expect(apertureMatchesOrbits(open)).toBe(true);
    expect(apertureMatchesOrbits(open, true)).toBe(true);
  });

  it('always reserves the rail, open or closed', () => {
    expect(aperture(CLOSED).left).toContain(`${RAIL_REM}rem`);
    expect(aperture({ structure: true, maia: true, workbench: true }).left)
      .toContain(`${RAIL_REM}rem`);
  });

  /**
   * ⭐⭐ R1 AND WHAT IT COSTS. Founder ruling, 2026-09-10.
   *
   * This asserted that a CLOSED orbit costs the Work nothing — `right` and
   * `bottom` were `0px` until something opened. That was the generous reading,
   * and it was paid for at the wrong moment: the Work grew while nothing was
   * open and then RE-MEASURED the instant the writer asked for help, so their
   * paragraphs acquired new line breaks as the price of opening MAIA.
   *
   *     conversation must not physically perturb the writing it is about.
   *
   * ⛔ SO THE COST IS PAID ONCE, UP FRONT, AND NEVER AGAIN. Space for every
   * orbit is reserved whether or not it is open. The Work is narrower in the
   * quiet room than it used to be — that is the real and deliberate price of
   * R1, and it is recorded here rather than hidden: a permanently slightly
   * smaller measure, in exchange for a measure that never moves.
   *
   * What a closed orbit costs is therefore not "nothing". What it costs is
   * "exactly what an open one costs", which is the property that matters.
   */
  it('a closed orbit costs exactly what an open one costs — the Work never re-measures', () => {
    expect(apertureIsIndependentOfOrbits(false)).toBe(true);
    expect(apertureIsIndependentOfOrbits(true)).toBe(true);
    const closed = aperture(CLOSED);
    const all = aperture({ structure: true, maia: true, workbench: true });
    expect(closed).toEqual(all);
    /* And the reservation is real, not a zero pretending to be one. */
    expect(closed.right).not.toBe('0px');
    expect(closed.bottom).not.toBe('0px');
  });

  /**
   * ⭐ EVERY ORBIT IS OUT OF FLOW. This is the property that makes the centre of
   * gravity provably unchanged: nothing an orbit does can reach the Work's
   * layout, so opening one cannot reflow the writer's prose or move their
   * scroll position.
   *
   * ⛔ THE LAW IS THE ABSENCE OF REFLOW, NOT THE WORD `fixed`. This assertion
   * used to name the token, and it failed the moment the room became the WRITE
   * interior of the Studio — where orbits must be positioned against the room
   * rather than the viewport, or they slide under the Studio's own header. The
   * law held perfectly through that change; only the spelling moved. A test
   * that fails when its subject is still true is testing the wrong thing.
   *
   * What is asserted instead: every orbit is out of flow, they all agree on
   * which out-of-flow they are, and none is `static` or `relative` — the two
   * values that would put a panel INTO the Work's layout.
   */
  it('every orbit is out of flow, so no orbit can reflow the Work', () => {
    const boxes = [structureBox(), maiaBox(), stripBox(CLOSED)];
    for (const b of boxes) {
      expect(b.position).toBe(OUT_OF_FLOW);
      expect(['static', 'relative']).not.toContain(b.position);
    }
    /* One containing block, or an orbit could be measured against something the
       others are not — and then "beside the rail" would mean two things. */
    expect(new Set(boxes.map((b) => b.position)).size).toBe(1);
  });

  it('the structure orbit sits beside the rail, never over it', () => {
    expect(structureBox().left).toBe(`${RAIL_REM}rem`);
    expect(structureBox().width).toBe(`${STRUCTURE_REM}rem`);
  });

  it('the MAIA orbit takes the right edge', () => {
    expect(maiaBox().right).toBe('0px');
    expect(maiaBox().width).toBe(`${MAIA_REM}rem`);
  });

  /** The strip belongs to the Work, so it stops where the Work stops. */
  it('the focus strip ends where the MAIA orbit begins', () => {
    const withMaia = stripBox({ structure: false, maia: true, workbench: false });
    expect(withMaia.right).toBe(`${MAIA_REM}rem`);
    const withoutMaia = stripBox(CLOSED);
    expect(withoutMaia.right).toBe('0px');
  });

  it('the focus strip starts where the Work starts', () => {
    const open: OrbitState = { structure: true, maia: false, workbench: false };
    expect(stripBox(open).left).toBe(aperture(open).left);
  });

  it('a narrow room bounds an orbit rather than letting it take the screen', () => {
    const a = aperture({ structure: true, maia: true, workbench: false }, true);
    expect(a.left).toContain('min(');
    expect(a.left).toContain('vw');
    expect(a.right).toContain('min(');
  });
});


/* ══ R1 · BEHAVIOURAL ACCEPTANCE ══════════════════════════════════════════════

   ⭐⭐ THIS IS THE INSTRUMENT R1 IS CLOSED ON. Not the source scan in
   shellProjection — that remains a cheap tripwire for one known regression and
   may not carry the law.

   ⛔ WHY IT IS HERE AND SHAPED THIS WAY. R1 was twice declared closed on
   instruments that could not fail. The first compared `writingFieldLayout(N, X)`
   with `writingFieldLayout(N, X)` — the same call twice — and passed while the
   manuscript rendered at ~401px against canonical's ~694px. The second asserted
   three CSS property names were absent from a style object, which fails on
   rewording and passes on restatement.

   So this suite calls `resolveWorkMeasure` — the SAME function the room's Work
   slot consumes. A test that recreates production's arithmetic agrees with it
   by coincidence; one that calls it agrees by construction, and disagrees when
   production is wrong. */

const ROOM = 1680;
const NOTIONAL = 100000;
const ORDINARY = ['rail', 'outlinePanel', 'writingField', 'maiaPanel'] as const;
const SHARE = writingFieldLayout(NOTIONAL, ORDINARY as never).writingField / NOTIONAL;

describe('R1 — the Work keeps its measure', () => {
  /**
   * ⭐ R1 · A — STATE INVARIANCE. Opening or closing any orbit, in any
   * combination, must leave the Work's effective measure identical. Not
   * similar — identical, because line breaks are a property of that number and
   * the writer did not ask for new ones.
   */
  it('R1 · A — no orbit state changes the Work’s effective measure', () => {
    const states: OrbitState[] = [
      { structure: false, maia: false, workbench: false },
      { structure: true, maia: false, workbench: false },
      { structure: false, maia: true, workbench: false },
      { structure: false, maia: false, workbench: true },
      { structure: true, maia: true, workbench: false },
      { structure: true, maia: true, workbench: true },
    ];
    const widths = states.map((o) => resolveWorkMeasure(ROOM, SHARE, false, o).widthPx);
    for (const w of widths) expect(w).toBe(widths[0]);
    expect(new Set(widths).size).toBe(1);
  });

  /**
   * ⭐ R1 · B — BASELINE CONTINUITY. Invariance alone is satisfied by a Work
   * 400px wide forever, which is formally perfect and substantively absurd — and
   * is precisely what the padding defect produced. So the NUMBER is pinned to
   * canonical's ordinary arrival geometry: a Work with sections opened its
   * outline and MAIA was present by default.
   */
  it('R1 · B — the measure is canonical’s ordinary arrival geometry', () => {
    const { widthPx } = resolveWorkMeasure(ROOM, SHARE, false);
    expect(widthPx).toBeCloseTo(ROOM * SHARE, 6);
    /* ⛔ AND IT IS TAKEN OF THE ROOM. The defect applied the orbits' full extent
       first and the share afterwards; that arithmetic is stated here so the
       instrument fails on it rather than describing it. */
    const reserved = (RAIL + STRUCT + MAIA) * REM_PX;
    expect(widthPx).not.toBeCloseTo((ROOM - reserved) * SHARE, 0);
    /* The concrete numbers this lane argued over. */
    expect(Math.round(widthPx)).toBe(694);
    expect(Math.round((ROOM - reserved) * SHARE)).toBe(401);
  });

  /**
   * ⭐ THE PROPERTY A SMALL WORK CANNOT FAKE. Work plus everything reserved
   * around it must fit the room. If it does not, either an orbit covers the
   * manuscript or the Work was narrowed to make room for one — the two failures
   * R1 forbids, and neither is satisfiable by simply shrinking the Work, which
   * makes this the check that survives a lazy repair.
   */
  it('the room holds the Work and its orbits without overlap', () => {
    expect(roomHoldsWorkAndOrbits(ROOM, SHARE, false)).toBe(true);
    const m = resolveWorkMeasure(ROOM, SHARE, false);
    expect(m.widthPx + m.reservedPx).toBeLessThanOrEqual(ROOM);
  });

  /** Compact stacks; the Work takes the room and reserves nothing beside it. */
  it('compact gives the Work the room and reserves nothing', () => {
    const m = resolveWorkMeasure(ROOM, SHARE, true);
    expect(m.widthPx).toBe(ROOM);
    expect(m.reservedPx).toBe(0);
  });
});
