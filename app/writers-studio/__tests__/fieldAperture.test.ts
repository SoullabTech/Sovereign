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
} from '../field/fieldAperture';

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
    expect(aperture(CLOSED).left).toBe(`${RAIL_REM}rem`);
    expect(aperture({ structure: true, maia: true, workbench: true }).left)
      .toContain(`${RAIL_REM}rem`);
  });

  it('an orbit that is closed costs the Work nothing', () => {
    const a = aperture(CLOSED);
    expect(a.right).toBe('0px');
    expect(a.bottom).toBe('0px');
  });

  /**
   * ⭐ EVERY ORBIT IS FIXED. This is the property that makes the centre of
   * gravity provably unchanged: nothing an orbit does can reach the Work's
   * layout, so opening one cannot reflow the writer's prose or move their
   * scroll position.
   */
  it('every orbit is position:fixed and participates in no layout', () => {
    expect(structureBox().position).toBe('fixed');
    expect(maiaBox().position).toBe('fixed');
    expect(stripBox(CLOSED).position).toBe('fixed');
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
