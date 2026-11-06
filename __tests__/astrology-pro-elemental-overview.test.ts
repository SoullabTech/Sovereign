/**
 * Elemental Alchemy overview: counts only, and the pathway words come from
 * the canonical Spiralogic house mapping.
 */
import { calculateBirthChart } from '../lib/astrology/proEphemerisCalculator';
import { chartBodies } from '../lib/astrology/proChartGeometry';
import { elementalOverview, ELEMENT_ORDER } from '../lib/astrology/proElementalOverview';
import { SPIRALOGIC_HOUSE_MAPPING } from '../lib/astrology/spiralogicHouseMapping';

describe('Elemental Alchemy overview', () => {
  it('counts the ten planets and the Ascendant once each, and maps every house to one pathway', async () => {
    const chart = await calculateBirthChart({
      date: '1990-06-15', time: '14:30',
      location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' }, houseSystem: 'porphyry',
    });
    const o = elementalOverview(chart);
    const counted = ELEMENT_ORDER.flatMap((e) => o.elements[e]);
    expect(counted).toHaveLength(11);
    expect(new Set(counted).size).toBe(11);
    expect(o.elements.air).toContain('Sun'); // Sun in Gemini
    expect(o.modalities.cardinal.length + o.modalities.fixed.length + o.modalities.mutable.length).toBe(11);

    const stations = ELEMENT_ORDER.flatMap((e) => o.pathways[e]);
    expect(stations.map((s) => s.house).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const s of stations) expect(s.facet).toBe(SPIRALOGIC_HOUSE_MAPPING[s.house].facet);
    expect(o.pathways.fire.map((s) => s.phase)).toEqual(['vector', 'circle', 'spiral']);
    const placedBodies = stations.reduce((n, s) => n + s.bodies.length, 0);
    expect(placedBodies).toBe(chartBodies(chart).length);
  });
});
