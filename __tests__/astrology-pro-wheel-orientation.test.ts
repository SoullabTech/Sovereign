/**
 * Founder walk 2026-11-05: the Pro wheel ran houses clockwise upward from the
 * Ascendant. Traditional charts run anticlockwise: house 1 just below the
 * Ascendant at 9 o'clock, IC at the bottom, Descendant right, MC at the top.
 * SVG y grows downward, so "below" means y > centre.
 */
import { radialPoint } from '../lib/astrology/proChartGeometry';

const C = 350;
const R = 100;
const asc = 123; // any Ascendant longitude

describe('Pro chart wheel orientation', () => {
  it('puts the Ascendant at 9 o\'clock', () => {
    const p = radialPoint(asc, asc, R);
    expect(p.x).toBeCloseTo(C - R);
    expect(p.y).toBeCloseTo(C);
  });

  it('places 30° past the Ascendant below the horizon on the left (house 1 → 2)', () => {
    const p = radialPoint(asc + 30, asc, R);
    expect(p.x).toBeLessThan(C);
    expect(p.y).toBeGreaterThan(C);
  });

  it('places 90° past the Ascendant at the bottom (IC side)', () => {
    const p = radialPoint(asc + 90, asc, R);
    expect(p.x).toBeCloseTo(C);
    expect(p.y).toBeCloseTo(C + R);
  });

  it('places the Descendant at 3 o\'clock and 270° past at the top', () => {
    const d = radialPoint(asc + 180, asc, R);
    expect(d.x).toBeCloseTo(C + R);
    const top = radialPoint(asc + 270, asc, R);
    expect(top.y).toBeCloseTo(C - R);
  });

  it('places 30° before the Ascendant above the horizon (house 12)', () => {
    const p = radialPoint(asc - 30, asc, R);
    expect(p.x).toBeLessThan(C);
    expect(p.y).toBeLessThan(C);
  });
});
