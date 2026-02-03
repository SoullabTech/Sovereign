/**
 * Aspect Pattern Detector
 *
 * Detects complex geometric patterns in birth charts:
 * - Grand Trine (3 planets, 120° apart, same element)
 * - T-Square (opposition + 2 squares to focal planet)
 * - Grand Cross (2 oppositions + 4 squares, cardinal/fixed/mutable)
 * - Yod (Finger of God - 2 quincunxes + 1 sextile)
 * - Stellium (3+ planets in same sign or house)
 * - Mystic Rectangle (2 trines + 2 sextiles + 2 oppositions)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type PatternType =
  | 'grand-trine'
  | 't-square'
  | 'grand-cross'
  | 'yod'
  | 'stellium'
  | 'mystic-rectangle';

export type Element = 'fire' | 'water' | 'earth' | 'air';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export interface Planet {
  name: string;
  sign: string;
  house: number;
  degree: number;
  longitude?: number; // Absolute ecliptic longitude (0-360)
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'quincunx';
  orb: number;
  exactDegrees?: number;
}

export interface AspectPattern {
  type: PatternType;
  planets: string[];
  element?: Element;
  modality?: Modality;
  sign?: string;
  house?: number;
  focalPlanet?: string; // For T-Square, Yod
  strength: number; // 0-1, based on orb tightness and planet weight
  interpretation: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const SIGN_ELEMENTS: Record<string, Element> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const SIGN_MODALITIES: Record<string, Modality> = {
  Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
  Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
  Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
};

// Personal planets weight more heavily in pattern significance
const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 1.0, Moon: 1.0,
  Mercury: 0.8, Venus: 0.8, Mars: 0.8,
  Jupiter: 0.6, Saturn: 0.6,
  Uranus: 0.5, Neptune: 0.5, Pluto: 0.5,
  'North Node': 0.4, 'South Node': 0.4, Chiron: 0.4,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════════

function getElement(sign: string): Element | undefined {
  return SIGN_ELEMENTS[sign];
}

function getModality(sign: string): Modality | undefined {
  return SIGN_MODALITIES[sign];
}

function getPlanetWeight(name: string): number {
  return PLANET_WEIGHTS[name] ?? 0.5;
}

/**
 * Calculate average orb for a set of aspects (lower = tighter = stronger)
 */
function calculateOrbStrength(aspects: Aspect[]): number {
  if (aspects.length === 0) return 0;
  const avgOrb = aspects.reduce((sum, a) => sum + a.orb, 0) / aspects.length;
  // Convert to 0-1 scale (0° orb = 1.0, 8° orb = 0)
  return Math.max(0, 1 - (avgOrb / 8));
}

/**
 * Calculate pattern strength based on orb, planets involved, and element purity
 */
function calculatePatternStrength(
  aspects: Aspect[],
  planets: string[],
  elementPurity: boolean = false
): number {
  const orbStrength = calculateOrbStrength(aspects);
  const planetWeight = planets.reduce((sum, p) => sum + getPlanetWeight(p), 0) / planets.length;
  const purityBonus = elementPurity ? 0.1 : 0;
  return Math.min(1, orbStrength * 0.5 + planetWeight * 0.4 + purityBonus);
}

/**
 * Find all aspects of a given type
 */
function filterAspects(aspects: Aspect[], type: Aspect['type']): Aspect[] {
  return aspects.filter(a => a.type === type);
}

/**
 * Find aspects involving a specific planet
 */
function findPlanetAspects(aspects: Aspect[], planet: string): Aspect[] {
  return aspects.filter(a => a.planet1 === planet || a.planet2 === planet);
}

/**
 * Get the other planet in an aspect
 */
function getOtherPlanet(aspect: Aspect, planet: string): string {
  return aspect.planet1 === planet ? aspect.planet2 : aspect.planet1;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern Detection Algorithms
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect Grand Trines (3 planets forming equilateral triangle, same element)
 */
export function detectGrandTrines(aspects: Aspect[], planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const trines = filterAspects(aspects, 'trine');

  if (trines.length < 3) return patterns;

  // Build adjacency map for trine connections
  const trineMap = new Map<string, Set<string>>();
  for (const trine of trines) {
    if (!trineMap.has(trine.planet1)) trineMap.set(trine.planet1, new Set());
    if (!trineMap.has(trine.planet2)) trineMap.set(trine.planet2, new Set());
    trineMap.get(trine.planet1)!.add(trine.planet2);
    trineMap.get(trine.planet2)!.add(trine.planet1);
  }

  // Find triangles: A-B-C where A→B, B→C, C→A
  const found = new Set<string>();

  for (const [planetA, neighborsA] of trineMap) {
    for (const planetB of neighborsA) {
      const neighborsB = trineMap.get(planetB);
      if (!neighborsB) continue;

      for (const planetC of neighborsB) {
        if (planetC === planetA) continue;
        if (!neighborsA.has(planetC)) continue;

        // Found a triangle!
        const trio = [planetA, planetB, planetC].sort();
        const key = trio.join('-');
        if (found.has(key)) continue;
        found.add(key);

        // Check element purity
        const planetData = planets.filter(p => trio.includes(p.name));
        const elements = planetData.map(p => getElement(p.sign)).filter(Boolean);
        const uniqueElements = new Set(elements);
        const elementPurity = uniqueElements.size === 1;
        const element = elementPurity ? elements[0] : undefined;

        // Get relevant trines for strength calculation
        const relevantTrines = trines.filter(t =>
          trio.includes(t.planet1) && trio.includes(t.planet2)
        );

        patterns.push({
          type: 'grand-trine',
          planets: trio,
          element,
          strength: calculatePatternStrength(relevantTrines, trio, elementPurity),
          interpretation: generateGrandTrineInterpretation(trio, element),
        });
      }
    }
  }

  return patterns;
}

/**
 * Detect T-Squares (opposition with planet squaring both ends)
 */
export function detectTSquares(aspects: Aspect[], planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const oppositions = filterAspects(aspects, 'opposition');
  const squares = filterAspects(aspects, 'square');

  if (oppositions.length === 0 || squares.length < 2) return patterns;

  const found = new Set<string>();

  for (const opp of oppositions) {
    // Find planets that square BOTH ends of the opposition
    const squaresToP1 = squares.filter(s =>
      s.planet1 === opp.planet1 || s.planet2 === opp.planet1
    );
    const squaresToP2 = squares.filter(s =>
      s.planet1 === opp.planet2 || s.planet2 === opp.planet2
    );

    // Find common square planet (focal point)
    for (const sq1 of squaresToP1) {
      const focalCandidate = getOtherPlanet(sq1, opp.planet1);
      if (focalCandidate === opp.planet2) continue;

      const hasSquareToOther = squaresToP2.some(sq2 =>
        sq2.planet1 === focalCandidate || sq2.planet2 === focalCandidate
      );

      if (hasSquareToOther) {
        const trio = [opp.planet1, opp.planet2, focalCandidate].sort();
        const key = trio.join('-');
        if (found.has(key)) continue;
        found.add(key);

        // Get modality from focal planet
        const focalData = planets.find(p => p.name === focalCandidate);
        const modality = focalData ? getModality(focalData.sign) : undefined;

        const relevantAspects = [opp, sq1, ...squaresToP2.filter(s =>
          s.planet1 === focalCandidate || s.planet2 === focalCandidate
        )];

        patterns.push({
          type: 't-square',
          planets: trio,
          focalPlanet: focalCandidate,
          modality,
          strength: calculatePatternStrength(relevantAspects, trio),
          interpretation: generateTSquareInterpretation(trio, focalCandidate, modality),
        });
      }
    }
  }

  return patterns;
}

/**
 * Detect Grand Crosses (2 oppositions + 4 squares forming cross)
 */
export function detectGrandCrosses(aspects: Aspect[], planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const oppositions = filterAspects(aspects, 'opposition');
  const squares = filterAspects(aspects, 'square');

  if (oppositions.length < 2 || squares.length < 4) return patterns;

  const found = new Set<string>();

  // Try each pair of oppositions
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];

      // All 4 planets must be different
      const quadPlanets = [opp1.planet1, opp1.planet2, opp2.planet1, opp2.planet2];
      if (new Set(quadPlanets).size !== 4) continue;

      // Check for 4 squares connecting the quadrants
      const squareCount = squares.filter(sq => {
        const inOpp1 = quadPlanets.slice(0, 2).includes(sq.planet1) || quadPlanets.slice(0, 2).includes(sq.planet2);
        const inOpp2 = quadPlanets.slice(2, 4).includes(sq.planet1) || quadPlanets.slice(2, 4).includes(sq.planet2);
        return inOpp1 && inOpp2;
      }).length;

      if (squareCount >= 4) {
        const quad = quadPlanets.sort();
        const key = quad.join('-');
        if (found.has(key)) continue;
        found.add(key);

        // Get modality
        const planetData = planets.filter(p => quad.includes(p.name));
        const modalities = planetData.map(p => getModality(p.sign)).filter(Boolean);
        const uniqueModalities = new Set(modalities);
        const modality = uniqueModalities.size === 1 ? modalities[0] : undefined;

        const relevantAspects = [...oppositions.slice(i, j + 1), ...squares.slice(0, 4)];

        patterns.push({
          type: 'grand-cross',
          planets: quad,
          modality,
          strength: calculatePatternStrength(relevantAspects, quad),
          interpretation: generateGrandCrossInterpretation(quad, modality),
        });
      }
    }
  }

  return patterns;
}

/**
 * Detect Yods (Finger of God - 2 quincunxes meeting at apex, base in sextile)
 */
export function detectYods(aspects: Aspect[], planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const quincunxes = filterAspects(aspects, 'quincunx');
  const sextiles = filterAspects(aspects, 'sextile');

  if (quincunxes.length < 2 || sextiles.length === 0) return patterns;

  const found = new Set<string>();

  // Build map of quincunx connections
  const quincunxMap = new Map<string, Aspect[]>();
  for (const q of quincunxes) {
    if (!quincunxMap.has(q.planet1)) quincunxMap.set(q.planet1, []);
    if (!quincunxMap.has(q.planet2)) quincunxMap.set(q.planet2, []);
    quincunxMap.get(q.planet1)!.push(q);
    quincunxMap.get(q.planet2)!.push(q);
  }

  // Find apex: planet with 2+ quincunxes
  for (const [apex, apexQuincunxes] of quincunxMap) {
    if (apexQuincunxes.length < 2) continue;

    // Try each pair of quincunxes from this apex
    for (let i = 0; i < apexQuincunxes.length; i++) {
      for (let j = i + 1; j < apexQuincunxes.length; j++) {
        const base1 = getOtherPlanet(apexQuincunxes[i], apex);
        const base2 = getOtherPlanet(apexQuincunxes[j], apex);

        // Check if base planets are in sextile
        const hasSextile = sextiles.some(s =>
          (s.planet1 === base1 && s.planet2 === base2) ||
          (s.planet1 === base2 && s.planet2 === base1)
        );

        if (hasSextile) {
          const trio = [apex, base1, base2].sort();
          const key = trio.join('-');
          if (found.has(key)) continue;
          found.add(key);

          const relevantAspects = [apexQuincunxes[i], apexQuincunxes[j]];

          patterns.push({
            type: 'yod',
            planets: trio,
            focalPlanet: apex,
            strength: calculatePatternStrength(relevantAspects, trio),
            interpretation: generateYodInterpretation(trio, apex),
          });
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Stelliums (3+ planets in same sign or house)
 */
export function detectStelliums(planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  // Group by sign
  const bySign = new Map<string, Planet[]>();
  for (const p of planets) {
    if (!bySign.has(p.sign)) bySign.set(p.sign, []);
    bySign.get(p.sign)!.push(p);
  }

  for (const [sign, signPlanets] of bySign) {
    if (signPlanets.length >= 3) {
      const names = signPlanets.map(p => p.name).sort();
      patterns.push({
        type: 'stellium',
        planets: names,
        sign,
        element: getElement(sign),
        strength: calculateStelliumStrength(signPlanets),
        interpretation: generateStelliumInterpretation(names, sign),
      });
    }
  }

  // Group by house
  const byHouse = new Map<number, Planet[]>();
  for (const p of planets) {
    if (!byHouse.has(p.house)) byHouse.set(p.house, []);
    byHouse.get(p.house)!.push(p);
  }

  for (const [house, housePlanets] of byHouse) {
    if (housePlanets.length >= 3) {
      const names = housePlanets.map(p => p.name).sort();
      // Avoid duplicate if same planets in sign
      const existingSignStellium = patterns.find(
        p => p.type === 'stellium' && JSON.stringify(p.planets) === JSON.stringify(names)
      );
      if (existingSignStellium) {
        // Add house info to existing
        existingSignStellium.house = house;
      } else {
        patterns.push({
          type: 'stellium',
          planets: names,
          house,
          strength: calculateStelliumStrength(housePlanets),
          interpretation: generateStelliumInterpretation(names, undefined, house),
        });
      }
    }
  }

  return patterns;
}

function calculateStelliumStrength(planets: Planet[]): number {
  // More planets = stronger, personal planets = stronger
  const countBonus = Math.min(1, planets.length / 5);
  const weightSum = planets.reduce((sum, p) => sum + getPlanetWeight(p.name), 0);
  const avgWeight = weightSum / planets.length;
  return countBonus * 0.5 + avgWeight * 0.5;
}

/**
 * Detect Mystic Rectangles (2 trines + 2 sextiles + 2 oppositions)
 */
export function detectMysticRectangles(aspects: Aspect[], planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const trines = filterAspects(aspects, 'trine');
  const sextiles = filterAspects(aspects, 'sextile');
  const oppositions = filterAspects(aspects, 'opposition');

  if (trines.length < 2 || sextiles.length < 2 || oppositions.length < 2) return patterns;

  const found = new Set<string>();

  // Try each pair of oppositions
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];

      const quadPlanets = [opp1.planet1, opp1.planet2, opp2.planet1, opp2.planet2];
      if (new Set(quadPlanets).size !== 4) continue;

      // Check for 2 trines and 2 sextiles
      let trineCount = 0;
      let sextileCount = 0;

      for (const trine of trines) {
        if (quadPlanets.includes(trine.planet1) && quadPlanets.includes(trine.planet2)) {
          trineCount++;
        }
      }

      for (const sextile of sextiles) {
        if (quadPlanets.includes(sextile.planet1) && quadPlanets.includes(sextile.planet2)) {
          sextileCount++;
        }
      }

      if (trineCount >= 2 && sextileCount >= 2) {
        const quad = quadPlanets.sort();
        const key = quad.join('-');
        if (found.has(key)) continue;
        found.add(key);

        patterns.push({
          type: 'mystic-rectangle',
          planets: quad,
          strength: calculatePatternStrength([opp1, opp2], quad),
          interpretation: generateMysticRectangleInterpretation(quad),
        });
      }
    }
  }

  return patterns;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Interpretation Generation
// ═══════════════════════════════════════════════════════════════════════════════

function generateGrandTrineInterpretation(planets: string[], element?: Element): string {
  const elementDescriptions: Record<Element, string> = {
    fire: 'creative vision and enthusiastic expression',
    earth: 'material mastery and grounded manifestation',
    air: 'intellectual brilliance and social connection',
    water: 'emotional depth and intuitive wisdom',
  };

  const planetList = planets.join(', ');
  if (element) {
    return `A Grand Trine in ${element} flows between ${planetList}, offering natural gifts of ${elementDescriptions[element]}. This harmonious triangle represents talents that come easily — your task is to activate rather than rest upon them.`;
  }
  return `A Grand Trine connects ${planetList}, creating a circuit of flowing energy. These planets support each other naturally, though this ease can become complacency without conscious engagement.`;
}

function generateTSquareInterpretation(planets: string[], focal: string, modality?: Modality): string {
  const modalityDescriptions: Record<Modality, string> = {
    cardinal: 'initiation and action',
    fixed: 'persistence and determination',
    mutable: 'adaptation and flexibility',
  };

  const mode = modality ? ` in the ${modality} mode of ${modalityDescriptions[modality]}` : '';
  return `A T-Square${mode} creates dynamic tension between ${planets.join(', ')}, with ${focal} as the focal point where pressure seeks release. This configuration drives growth through challenge — the friction is your fuel for transformation.`;
}

function generateGrandCrossInterpretation(planets: string[], modality?: Modality): string {
  const modalityDescriptions: Record<Modality, string> = {
    cardinal: 'constant initiation and new beginnings',
    fixed: 'stubborn persistence and powerful will',
    mutable: 'perpetual change and adaptation',
  };

  const mode = modality ? ` This ${modality} cross demands ${modalityDescriptions[modality]}.` : '';
  return `A Grand Cross locks ${planets.join(', ')} in a crucible of opposing forces.${mode} The four-way tension may feel like being pulled in every direction — yet this very pressure forges remarkable strength and integration.`;
}

function generateYodInterpretation(planets: string[], apex: string): string {
  const base = planets.filter(p => p !== apex);
  return `The Finger of God points to ${apex}, activated by the sextile between ${base.join(' and ')}. This Yod signals a fated mission — an adjustment is required that cannot be avoided. The apex planet carries a special purpose that unfolds through life's redirections.`;
}

function generateStelliumInterpretation(planets: string[], sign?: string, house?: number): string {
  const location = sign ? `${sign}` : house ? `the ${house}th house` : 'one area';
  return `A Stellium gathers ${planets.join(', ')} in ${location}, concentrating tremendous energy in this domain. Life themes here will be intense and unavoidable — this is where your story demands to be told.`;
}

function generateMysticRectangleInterpretation(planets: string[]): string {
  return `A Mystic Rectangle forms between ${planets.join(', ')}, weaving trines and sextiles around two oppositions. This rare configuration offers both creative flow and productive tension — the oppositions provide motivation while the harmonious aspects ease the way.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Detection Function
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect all aspect patterns in a chart
 */
export function detectAllPatterns(aspects: Aspect[], planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  patterns.push(...detectGrandTrines(aspects, planets));
  patterns.push(...detectTSquares(aspects, planets));
  patterns.push(...detectGrandCrosses(aspects, planets));
  patterns.push(...detectYods(aspects, planets));
  patterns.push(...detectStelliums(planets));
  patterns.push(...detectMysticRectangles(aspects, planets));

  // Sort by strength (strongest first)
  return patterns.sort((a, b) => b.strength - a.strength);
}
