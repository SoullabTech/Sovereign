import {
  classifyTransitScale,
  filterTransitAspects,
  sortTransitAspects,
  transitAspectLabel,
  transitInterpretiveLens,
  TRANSIT_SCOPE_COPY,
  type TransitAspectRecord,
} from '../transitField';

const aspects: TransitAspectRecord[] = [
  { transitPlanet: 'Mars', natalPlanet: 'Moon', aspectType: 'square', orb: 1.4 },
  { transitPlanet: 'Saturn', natalPlanet: 'Sun', aspectType: 'trine', orb: 2.2 },
  { transitPlanet: 'Pluto', natalPlanet: 'Venus', aspectType: 'opposition', orb: 0.8 },
  { transitPlanet: 'Chiron', natalPlanet: 'Mercury', aspectType: 'square', orb: 0.2 },
  { transitPlanet: 'Pluto', natalPlanet: 'Juno', aspectType: 'sextile', orb: 0.3 },
  { transitPlanet: 'Moon', natalPlanet: 'Mars', aspectType: 'sextile', orb: 0.5 },
];

describe('transitField', () => {
  it('orders displayed planetary contacts by geometric closeness', () => {
    expect(sortTransitAspects(aspects).map(transitAspectLabel)).toEqual([
      'Moon sextile natal Mars',
      'Pluto opposition natal Venus',
      'Mars square natal Moon',
      'Saturn trine natal Sun',
    ]);
  });

  it('keeps approximate non-planetary bodies and natal asteroid points out of the first field', () => {
    const displayed = sortTransitAspects(aspects);
    expect(displayed.some((aspect) => aspect.transitPlanet === 'Chiron')).toBe(false);
    expect(displayed.some((aspect) => aspect.natalPlanet === 'Juno')).toBe(false);
  });
  it('uses temporal scale rather than a hidden importance score', () => {
    expect(classifyTransitScale(aspects[0])).toBe('minor');
    expect(classifyTransitScale(aspects[1])).toBe('major');
    expect(classifyTransitScale(aspects[2])).toBe('major');

    expect(filterTransitAspects(aspects, 'major').map((aspect) => aspect.transitPlanet)).toEqual([
      'Pluto',
      'Saturn',
    ]);
    expect(filterTransitAspects(aspects, 'minor').map((aspect) => aspect.transitPlanet)).toEqual([
      'Moon',
      'Mars',
    ]);
  });

  it('keeps calculated geometry distinct from symbolic interpretation', () => {
    const lens = transitInterpretiveLens({
      transitPlanet: 'Saturn',
      natalPlanet: 'Moon',
      aspectType: 'square',
      orb: 0.24,
    });

    expect(lens.calculated).toBe('Saturn square natal Moon · 0.24° orb.');
    expect(lens.tradition).toMatch(/traditionally read/);
    expect(lens.wholeChart).toMatch(/not the whole chart/);
    expect(lens.inquiry).toMatch(/lived experience/);
  });

  it('normalizes camel-cased natal point names for human display', () => {
    expect(transitAspectLabel({
      transitPlanet: 'Saturn',
      natalPlanet: 'northNode',
      aspectType: 'square',
      orb: 1.1,
    })).toBe('Saturn square natal North Node');
  });

  it('defines major as longer-wave rather than more important or fated', () => {
    expect(TRANSIT_SCOPE_COPY.major).toMatch(/temporal scale/i);
    expect(TRANSIT_SCOPE_COPY.major).toMatch(/not importance or destiny/i);
  });
});
