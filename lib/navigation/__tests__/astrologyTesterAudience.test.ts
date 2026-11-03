/**
 * ASTRO-FREE-TESTERS-ONLY — the navigation follows the proxy gate.
 *
 * The proxy 404s every Free Astrology room page unless members.tester is true
 * (lib/astrology/testerGate.ts). A link shown to anyone else opens onto a 404,
 * so both the rail and the House must hide Astrology from non-testers, and
 * founder status alone must not reveal it.
 */
import { getHouseDestinations } from '../houseDestinations';
import { getVisibleBoundaries, ASTROLOGY_RAIL_ITEM } from '../maiaNav';

const houseIds = (isFounder: boolean, isTester?: boolean) =>
  getHouseDestinations(isFounder, isTester).map((d) => d.id);
const railIds = (isFounder: boolean, isTester?: boolean) =>
  getVisibleBoundaries(isFounder, isTester).map((b) => b.id);

describe('Free Astrology links follow the tester gate', () => {
  it('the House hides Astrology from non-testers, founder or not', () => {
    expect(houseIds(false)).not.toContain('astrology');
    expect(houseIds(false, false)).not.toContain('astrology');
    expect(houseIds(true, false)).not.toContain('astrology');
  });

  it('the House shows Astrology to testers', () => {
    expect(houseIds(false, true)).toContain('astrology');
    expect(houseIds(true, true)).toContain('astrology');
  });

  it('the rail hides Astrology from non-testers, founder or not', () => {
    expect(ASTROLOGY_RAIL_ITEM.audience).toBe('tester');
    expect(railIds(false)).not.toContain('astrology');
    expect(railIds(true, false)).not.toContain('astrology');
  });

  it('the rail shows Astrology to testers', () => {
    expect(railIds(false, true)).toContain('astrology');
    expect(railIds(true, true)).toContain('astrology');
  });

  it('being a tester reveals no founder-only room', () => {
    const founderOnlyRail = getVisibleBoundaries(true, false)
      .filter((b) => b.audience === 'founder')
      .map((b) => b.id);
    for (const id of founderOnlyRail) expect(railIds(false, true)).not.toContain(id);
    const founderOnlyHouse = getHouseDestinations(true, false)
      .filter((d) => d.audience === 'founder')
      .map((d) => d.id);
    for (const id of founderOnlyHouse) expect(houseIds(false, true)).not.toContain(id);
  });
});
