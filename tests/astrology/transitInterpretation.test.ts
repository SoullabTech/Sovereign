/**
 * TRANSIT INTERPRETATION TESTS — transitInterpretation.ts
 *
 * Verifies:
 *   1. Planet → Spiralogic element mapping
 *   2. Aspect detection from position data
 *   3. TransitImpact grouping and structure
 *   4. Spiralogic voice generation
 *   5. Somatic signature fallback
 *   6. Graceful handling of empty / missing data
 */

import {
  buildTransitImpacts,
  formatTransitImpacts,
  PLANET_ELEMENT_MAP,
  PLANET_DOMAIN_MAP,
  PLANET_SOMATIC_MAP,
  type TransitPosition,
} from '@/lib/astrology/transitInterpretation';
import { type BirthChart } from '@/lib/astrology/ephemerisCalculator';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Build a minimal BirthChart stub with just the positions we need */
function makeBirthChart(overrides: Partial<Record<string, { sign: string; degree: number; house: number; retrograde: boolean }>>): BirthChart {
  const defaults = {
    sign: 'Aries', degree: 0, house: 1, retrograde: false,
  };
  const planet = (o?: Partial<typeof defaults>) => ({ ...defaults, ...o });

  return {
    sun:       planet(overrides.sun),
    moon:      planet(overrides.moon),
    mercury:   planet(overrides.mercury),
    venus:     planet(overrides.venus),
    mars:      planet(overrides.mars),
    jupiter:   planet(overrides.jupiter),
    saturn:    planet(overrides.saturn),
    uranus:    planet(overrides.uranus),
    neptune:   planet(overrides.neptune),
    pluto:     planet(overrides.pluto),
    chiron:    planet(overrides.chiron),
    ascendant: planet(),
    midheaven: planet(),
    northNode: planet(),
    southNode: planet(),
    aspects:   [],
    dominantElements: { fire: 0, earth: 0, air: 0, water: 0 },
    dominantModalities: { cardinal: 0, fixed: 0, mutable: 0 },
    lilith: undefined,
  } as unknown as BirthChart;
}

function makeTransit(planet: string, sign: string, degree: number, retrograde = false): TransitPosition {
  return { planet, sign, degree, retrograde };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PLANET ELEMENT MAP
// ─────────────────────────────────────────────────────────────────────────────

describe('PLANET_ELEMENT_MAP — doctrinal assignments', () => {
  test('Sun is fire', () => expect(PLANET_ELEMENT_MAP.sun).toBe('fire'));
  test('Moon is water', () => expect(PLANET_ELEMENT_MAP.moon).toBe('water'));
  test('Mercury is air', () => expect(PLANET_ELEMENT_MAP.mercury).toBe('air'));
  test('Venus is earth', () => expect(PLANET_ELEMENT_MAP.venus).toBe('earth'));
  test('Mars is fire', () => expect(PLANET_ELEMENT_MAP.mars).toBe('fire'));
  test('Jupiter is fire', () => expect(PLANET_ELEMENT_MAP.jupiter).toBe('fire'));
  test('Saturn is earth', () => expect(PLANET_ELEMENT_MAP.saturn).toBe('earth'));
  test('Uranus is air', () => expect(PLANET_ELEMENT_MAP.uranus).toBe('air'));
  test('Neptune is water', () => expect(PLANET_ELEMENT_MAP.neptune).toBe('water'));
  test('Pluto is aether', () => expect(PLANET_ELEMENT_MAP.pluto).toBe('aether'));
  test('Chiron is water', () => expect(PLANET_ELEMENT_MAP.chiron).toBe('water'));

  test('all keys are lowercase', () => {
    for (const key of Object.keys(PLANET_ELEMENT_MAP)) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOMAIN + SOMATIC MAPS COMPLETENESS
// ─────────────────────────────────────────────────────────────────────────────

describe('Support maps completeness', () => {
  const corePersonal = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  const outerPlanets = ['saturn', 'uranus', 'neptune', 'pluto', 'jupiter'];

  test('PLANET_DOMAIN_MAP covers personal planets', () => {
    for (const p of corePersonal) {
      expect(PLANET_DOMAIN_MAP[p]).toBeTruthy();
    }
  });

  test('PLANET_SOMATIC_MAP covers personal + outer planets', () => {
    for (const p of [...corePersonal, ...outerPlanets]) {
      expect(PLANET_SOMATIC_MAP[p]).toBeDefined();
      expect(PLANET_SOMATIC_MAP[p].length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. ASPECT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

describe('buildTransitImpacts — aspect detection', () => {
  test('exact opposition (Saturn at 15° Libra opposes natal Mars at 15° Aries)', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 15, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 15)];
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(1);
    expect(impacts[0].natalPlanet).toBe('mars');
    expect(impacts[0].forces[0].transitPlanet).toBe('saturn');
    expect(impacts[0].forces[0].aspectType).toBe('opposition');
    expect(impacts[0].forces[0].orb).toBe(0);
  });

  test('exact conjunction (Neptune at 22° Scorpio conjunct natal Moon at 22° Scorpio)', () => {
    const chart = makeBirthChart({ moon: { sign: 'Scorpio', degree: 22, house: 8, retrograde: false } });
    const transits = [makeTransit('Neptune', 'Scorpio', 22)];
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(1);
    expect(impacts[0].natalPlanet).toBe('moon');
    expect(impacts[0].forces[0].aspectType).toBe('conjunction');
  });

  test('exact square (Uranus at 15° Cancer squares natal Venus at 15° Aries)', () => {
    const chart = makeBirthChart({ venus: { sign: 'Aries', degree: 15, house: 1, retrograde: false } });
    const transits = [makeTransit('Uranus', 'Cancer', 15)];
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(1);
    expect(impacts[0].forces[0].aspectType).toBe('square');
  });

  test('aspect within orb (5.8° is within 6° threshold)', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 10, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 15.8)]; // 5.8° orb opposition
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(1);
    expect(impacts[0].forces[0].orb).toBeCloseTo(5.8, 0);
  });

  test('aspect outside orb (7°) is not detected', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 10, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 17)]; // 7° orb — outside threshold
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(0);
  });

  test('inner planet (Mercury) transit is not included — only outer planets', () => {
    const chart = makeBirthChart({ sun: { sign: 'Aries', degree: 0, house: 1, retrograde: false } });
    const transits = [makeTransit('Mercury', 'Libra', 0)]; // Mercury is not outer
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GROUPING AND STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

describe('buildTransitImpacts — grouping', () => {
  test('two outer planets aspecting the same natal planet → one impact with two forces', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 15, house: 1, retrograde: false } });
    const transits = [
      makeTransit('Saturn', 'Libra', 15),  // opposition
      makeTransit('Neptune', 'Libra', 16), // opposition, 1° orb
    ];
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(1);
    expect(impacts[0].natalPlanet).toBe('mars');
    expect(impacts[0].forces.length).toBe(2);
  });

  test('outer planets aspecting different natal planets → separate impacts', () => {
    const chart = makeBirthChart({
      mars: { sign: 'Aries', degree: 15, house: 1, retrograde: false },
      moon: { sign: 'Scorpio', degree: 22, house: 8, retrograde: false },
    });
    const transits = [
      makeTransit('Saturn', 'Libra', 15),   // opposes mars
      makeTransit('Pluto', 'Scorpio', 22),  // conjuncts moon
    ];
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts.length).toBe(2);
    const natalPlanets = impacts.map(i => i.natalPlanet).sort();
    expect(natalPlanets).toContain('mars');
    expect(natalPlanets).toContain('moon');
  });

  test('forces sorted tightest orb first', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 15, house: 1, retrograde: false } });
    const transits = [
      makeTransit('Neptune', 'Libra', 17), // 2° orb
      makeTransit('Saturn',  'Libra', 16), // 1° orb (tighter)
    ];
    const impacts = buildTransitImpacts(chart, transits);

    expect(impacts[0].forces[0].transitPlanet).toBe('saturn'); // tighter first
    expect(impacts[0].forces[1].transitPlanet).toBe('neptune');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. ELEMENT ASSIGNMENT IN IMPACTS
// ─────────────────────────────────────────────────────────────────────────────

describe('buildTransitImpacts — elemental assignments', () => {
  test('Mars impact has element fire', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 0, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 0)];
    const [impact] = buildTransitImpacts(chart, transits);

    expect(impact.element).toBe('fire');
    expect(impact.forces[0].transitElement).toBe('earth'); // Saturn = earth
  });

  test('Moon impact has element water', () => {
    // Moon at Cancer 0° — Pluto at Capricorn 0° = exact opposition
    // Other default planets are at Aries 0° and also get aspected; find Moon specifically
    const chart = makeBirthChart({ moon: { sign: 'Cancer', degree: 0, house: 4, retrograde: false } });
    const transits = [makeTransit('Pluto', 'Capricorn', 0)];
    const impacts = buildTransitImpacts(chart, transits);

    const moonImpact = impacts.find(i => i.natalPlanet === 'moon');
    expect(moonImpact).toBeDefined();
    expect(moonImpact!.element).toBe('water');
    expect(moonImpact!.forces[0].transitElement).toBe('aether'); // Pluto = aether
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. SPIRALOGIC VOICE
// ─────────────────────────────────────────────────────────────────────────────

describe('buildTransitImpacts — Spiralogic voice', () => {
  test('contains element name (Fire) for Mars', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 0, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 0)];
    const [impact] = buildTransitImpacts(chart, transits);

    expect(impact.spiralogicVoice).toContain('Fire');
  });

  test('contains Earth for Saturn transit', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 0, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 0)];
    const [impact] = buildTransitImpacts(chart, transits);

    expect(impact.spiralogicVoice).toContain('Earth');
  });

  test('multi-force voice mentions both elements', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 15, house: 1, retrograde: false } });
    const transits = [
      makeTransit('Saturn',  'Libra', 15),
      makeTransit('Neptune', 'Libra', 16),
    ];
    const [impact] = buildTransitImpacts(chart, transits);

    expect(impact.spiralogicVoice).toContain('Earth');
    expect(impact.spiralogicVoice).toContain('Water');
  });

  test('synthesis contains high-effort-low-clarity phrase for Fire under Earth+Water', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 15, house: 1, retrograde: false } });
    const transits = [
      makeTransit('Saturn',  'Libra', 15), // Earth opposing Fire
      makeTransit('Neptune', 'Libra', 16), // Water opposing Fire
    ];
    const [impact] = buildTransitImpacts(chart, transits);

    expect(impact.synthesis.toLowerCase()).toContain('high effort');
    expect(impact.synthesis.toLowerCase()).toContain('low clarity');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. SOMATIC SIGNATURES
// ─────────────────────────────────────────────────────────────────────────────

describe('buildTransitImpacts — somatic signatures', () => {
  test('Mars impact returns a somatic signature string', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 0, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 0)];
    const [impact] = buildTransitImpacts(chart, transits);

    expect(impact.somaticSignature).toBeTruthy();
    expect(typeof impact.somaticSignature).toBe('string');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────

describe('buildTransitImpacts — edge cases', () => {
  test('empty transits returns empty array', () => {
    const chart = makeBirthChart({});
    expect(buildTransitImpacts(chart, [])).toHaveLength(0);
  });

  test('no aspects within orb returns empty array', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 0, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Taurus', 0)]; // ~30° — no standard aspect
    expect(buildTransitImpacts(chart, transits)).toHaveLength(0);
  });

  test('formatTransitImpacts returns empty string for empty input', () => {
    expect(formatTransitImpacts([])).toBe('');
  });

  test('formatTransitImpacts contains planet name and element for valid input', () => {
    const chart = makeBirthChart({ mars: { sign: 'Aries', degree: 0, house: 1, retrograde: false } });
    const transits = [makeTransit('Saturn', 'Libra', 0)];
    const impacts = buildTransitImpacts(chart, transits);
    const formatted = formatTransitImpacts(impacts);

    expect(formatted).toContain('Mars');
    expect(formatted).toContain('Fire');
    expect(formatted).toContain('Saturn');
    expect(formatted).toContain('Combined');
    expect(formatted).toContain('Spiralogic');
  });
});
