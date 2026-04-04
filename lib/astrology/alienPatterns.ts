/**
 * Steinbrecher Alien Pattern Detection
 *
 * Based on Edward Steinbrecher's "Inner Guide Meditation" and
 * DK Brainard's extension of the work.
 *
 * "Alien patterns" describe how outer planets (Saturn, Uranus, Neptune, Pluto)
 * fuse with personal points (Sun, Moon, Ascendant) to create specific
 * archetypal configurations. These are not decorative — they describe
 * real forces that must be met consciously through the guide work.
 *
 * Five types: Power, Vessel, Instrument, Mutual Reception, Adept
 */

import type { BirthChart } from './ephemerisCalculator';

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export type AlienPatternType =
  | 'power'
  | 'vessel'
  | 'instrument'
  | 'mutual_reception'
  | 'adept';

export type OuterPlanet = 'saturn' | 'uranus' | 'neptune' | 'pluto';
export type PersonalPoint = 'sun' | 'moon' | 'ascendant';

export interface AlienPattern {
  type: AlienPatternType;
  planet?: OuterPlanet;
  point?: PersonalPoint;
  orb?: number;
  element?: string;
  mode?: string;
  label: string;         // e.g. "Plutonian Power"
  description: string;   // What this force does through you
  livePrompt?: string;   // Encounter prompt for this force
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const SIGN_MODES: Record<string, string> = {
  Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
  Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
  Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
};

// Modern rulerships for mutual reception
const MODERN_RULERS: Record<string, string> = {
  Aries: 'mars', Taurus: 'venus', Gemini: 'mercury', Cancer: 'moon',
  Leo: 'sun', Virgo: 'mercury', Libra: 'venus', Scorpio: 'pluto',
  Sagittarius: 'jupiter', Capricorn: 'saturn', Aquarius: 'uranus', Pisces: 'neptune',
};

// Orbs per Steinbrecher
const POWER_ORB = 15;
const VESSEL_ORB = 12;
const INSTRUMENT_ORB = 10;

const OUTER_PLANETS: OuterPlanet[] = ['saturn', 'uranus', 'neptune', 'pluto'];

// ═══════════════════════════════════════════════════════════════════════
// DESCRIPTIONS — rooted in Steinbrecher, not invented
// ═══════════════════════════════════════════════════════════════════════

const PLANET_NAMES: Record<OuterPlanet, string> = {
  saturn: 'Saturnian',
  uranus: 'Uranian',
  neptune: 'Neptunian',
  pluto: 'Plutonian',
};

const POWER_DESCRIPTIONS: Record<OuterPlanet, string> = {
  saturn: 'You radiate structure, discipline, and karmic authority. The world rearranges around your sense of order. You initiate the demand for maturity wherever you go.',
  uranus: 'You initiate disruption and liberation. Old forms break in your presence whether you intend it or not. You carry the lightning.',
  neptune: 'You dissolve boundaries and open imaginal space. Reality softens around you. You carry the capacity to make the invisible visible.',
  pluto: 'You carry the force of death and regeneration. What is false cannot survive your presence. You initiate transformation at depth.',
};

const VESSEL_DESCRIPTIONS: Record<OuterPlanet, string> = {
  saturn: 'You magnetize the teacher, the authority, the demand for responsibility in everyone you meet. You draw up the structure-maker in others.',
  uranus: 'You draw up the revolutionary and the liberator in everyone around you. People feel their own desire for freedom more intensely in your presence.',
  neptune: 'You magnetize the mystic, the dreamer, the dissolved in everyone you connect with. Others project their longing for transcendence onto you.',
  pluto: 'You draw up the shadow, the transformer, the death-rebirth cycle in everyone close to you. People encounter their own depth through you.',
};

const INSTRUMENT_DESCRIPTIONS: Record<OuterPlanet, string> = {
  saturn: 'The Saturnian force operates through your body and presence directly. You are an amplifier of structure, limitation, and time-mastery without needing to initiate it.',
  uranus: 'The Uranian force moves through your body. You are a lightning rod — disruption, insight, and liberation happen through you as a natural function.',
  neptune: 'The Neptunian force lives in your body. You are naturally porous to the imaginal, the psychic, the dissolved. Boundaries are thinner for you than for most.',
  pluto: 'The Plutonian force inhabits your physical presence. You carry an intensity that others feel immediately. The underworld is always close.',
};

const MUTUAL_RECEPTION_DESCRIPTIONS: Record<OuterPlanet, string> = {
  saturn: 'A secondary Saturnian activation through dignitary exchange. The structure-builder and your personal point communicate across signs, creating a subtle but persistent pull toward authority and discipline.',
  uranus: 'A secondary Uranian activation through mutual reception. The liberator and your personal point exchange influence, creating an undercurrent of innovation and restlessness.',
  neptune: 'A secondary Neptunian activation through dignitary exchange. The dissolver and your personal point are in conversation, creating heightened sensitivity and imaginal access.',
  pluto: 'A secondary Plutonian activation through mutual reception. The transformer and your personal point exchange power, creating a deep undercurrent of regenerative force.',
};

const ADEPT_ELEMENT_DESCRIPTIONS: Record<string, string> = {
  fire: 'No natal planets in Fire. You instinctively understand initiation, vision, and creative impulse — yet struggle to claim it for yourself. You help others ignite what you cannot easily light in yourself.',
  water: 'No natal planets in Water. You instinctively understand emotion, depth, and felt sense — yet struggle to access it directly. You help others navigate what you feel at a distance.',
  earth: 'No natal planets in Earth. You instinctively understand structure, embodiment, and practical form — yet struggle to ground yourself. You help others build what you cannot easily land.',
  air: 'No natal planets in Air. You instinctively understand pattern, communication, and perspective — yet struggle to articulate it. You help others see what you know without words.',
};

const ADEPT_MODE_DESCRIPTIONS: Record<string, string> = {
  cardinal: 'No natal planets in Cardinal signs. You understand initiation instinctively but struggle to begin things yourself. You help others start what you cannot easily launch.',
  fixed: 'No natal planets in Fixed signs. You understand stability and persistence instinctively but struggle to hold steady yourself. You help others sustain what you cannot easily maintain.',
  mutable: 'No natal planets in Mutable signs. You understand adaptability and change instinctively but struggle with flexibility yourself. You help others transform what you cannot easily shift.',
};

// ═══════════════════════════════════════════════════════════════════════
// LIVE PROMPTS — encounter questions per force
// ═══════════════════════════════════════════════════════════════════════

const POWER_PROMPTS: Record<OuterPlanet, string> = {
  saturn: 'What structure are you holding that the world didn\'t ask for?',
  uranus: 'What are you disrupting — and do you know you\'re doing it?',
  neptune: 'What are you dissolving in others by your presence alone?',
  pluto: 'What has already died that you haven\'t acknowledged?',
};

const VESSEL_PROMPTS: Record<OuterPlanet, string> = {
  saturn: 'Who is projecting authority onto you right now?',
  uranus: 'What are you feeling right now that may not be yours?',
  neptune: 'What are you feeling right now that may not be yours?',
  pluto: 'Whose shadow are you carrying that doesn\'t belong to you?',
};

const INSTRUMENT_PROMPTS: Record<OuterPlanet, string> = {
  saturn: 'Where is your body holding a limit that isn\'t personal?',
  uranus: 'What wants to shift that you\'re still holding in place?',
  neptune: 'Where are your boundaries thinner than you realize?',
  pluto: 'What feels true but hasn\'t been spoken?',
};

const MUTUAL_RECEPTION_PROMPTS: Record<OuterPlanet, string> = {
  saturn: 'What discipline is calling you that you keep postponing?',
  uranus: 'What insight keeps arriving that you haven\'t acted on?',
  neptune: 'What imaginal presence is trying to reach you?',
  pluto: 'What power exchange are you in that you haven\'t named?',
};

const ADEPT_ELEMENT_PROMPTS: Record<string, string> = {
  fire: 'What initiative are you helping others take that you won\'t take yourself?',
  water: 'What feeling are you holding at a distance?',
  earth: 'What needs to be built that you keep deferring?',
  air: 'What do you know that you can\'t yet say?',
};

const ADEPT_MODE_PROMPTS: Record<string, string> = {
  cardinal: 'What beginning are you avoiding?',
  fixed: 'What are you refusing to sustain?',
  mutable: 'What change are you resisting?',
};

// ═══════════════════════════════════════════════════════════════════════
// DETECTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Convert sign + degree to absolute ecliptic longitude (0-360)
 */
function signDegreeToLongitude(sign: string, degree: number): number {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
}

/**
 * Calculate angular separation between two longitudes (0-180)
 */
function angularSeparation(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Detect all alien patterns in a birth chart.
 *
 * Based on Steinbrecher's Inner Guide Meditation framework.
 */
export function detectAlienPatterns(chart: BirthChart): AlienPattern[] {
  const patterns: AlienPattern[] = [];

  // Reconstruct longitudes from sign + degree
  const sunLon = signDegreeToLongitude(chart.sun.sign, chart.sun.degree);
  const moonLon = signDegreeToLongitude(chart.moon.sign, chart.moon.degree);
  const ascLon = signDegreeToLongitude(chart.ascendant.sign, chart.ascendant.degree);

  const outerLons: Record<OuterPlanet, number> = {
    saturn: signDegreeToLongitude(chart.saturn.sign, chart.saturn.degree),
    uranus: signDegreeToLongitude(chart.uranus.sign, chart.uranus.degree),
    neptune: signDegreeToLongitude(chart.neptune.sign, chart.neptune.degree),
    pluto: signDegreeToLongitude(chart.pluto.sign, chart.pluto.degree),
  };

  // ─── 1. POWER (Sun conjunct outer planet, 15° orb) ───
  for (const planet of OUTER_PLANETS) {
    const orb = angularSeparation(sunLon, outerLons[planet]);
    if (orb <= POWER_ORB) {
      patterns.push({
        type: 'power',
        planet,
        point: 'sun',
        orb: Math.round(orb * 10) / 10,
        label: `${PLANET_NAMES[planet]} Power`,
        description: POWER_DESCRIPTIONS[planet],
        livePrompt: POWER_PROMPTS[planet],
      });
    }
  }

  // ─── 2. VESSEL (Moon conjunct outer planet, 12° orb) ───
  for (const planet of OUTER_PLANETS) {
    const orb = angularSeparation(moonLon, outerLons[planet]);
    if (orb <= VESSEL_ORB) {
      patterns.push({
        type: 'vessel',
        planet,
        point: 'moon',
        orb: Math.round(orb * 10) / 10,
        label: `${PLANET_NAMES[planet]} Vessel`,
        description: VESSEL_DESCRIPTIONS[planet],
        livePrompt: VESSEL_PROMPTS[planet],
      });
    }
  }

  // ─── 3. INSTRUMENT (outer planet in 1st house OR conjunct ASC from 12th) ───
  const outerChartPositions: Record<OuterPlanet, { house: number; sign: string; degree: number }> = {
    saturn: chart.saturn,
    uranus: chart.uranus,
    neptune: chart.neptune,
    pluto: chart.pluto,
  };

  for (const planet of OUTER_PLANETS) {
    const pos = outerChartPositions[planet];
    const lon = outerLons[planet];

    if (pos.house === 1) {
      // Planet in 1st house
      const orb = angularSeparation(ascLon, lon);
      patterns.push({
        type: 'instrument',
        planet,
        point: 'ascendant',
        orb: Math.round(orb * 10) / 10,
        label: `${PLANET_NAMES[planet]} Instrument`,
        description: INSTRUMENT_DESCRIPTIONS[planet],
        livePrompt: INSTRUMENT_PROMPTS[planet],
      });
    } else if (pos.house === 12) {
      // Check if conjunct ASC from 12th side (within 10°)
      const orb = angularSeparation(ascLon, lon);
      if (orb <= INSTRUMENT_ORB) {
        patterns.push({
          type: 'instrument',
          planet,
          point: 'ascendant',
          orb: Math.round(orb * 10) / 10,
          label: `${PLANET_NAMES[planet]} Instrument`,
          description: INSTRUMENT_DESCRIPTIONS[planet],
          livePrompt: INSTRUMENT_PROMPTS[planet],
        });
      }
    }
  }

  // ─── 4. MUTUAL RECEPTION ───
  // Check if personal point's sign ruler and outer planet's sign ruler exchange
  const personalPoints: { point: PersonalPoint; sign: string }[] = [
    { point: 'sun', sign: chart.sun.sign },
    { point: 'moon', sign: chart.moon.sign },
    { point: 'ascendant', sign: chart.ascendant.sign },
  ];

  for (const { point, sign: personalSign } of personalPoints) {
    const personalRuler = MODERN_RULERS[personalSign];

    for (const planet of OUTER_PLANETS) {
      const outerSign = outerChartPositions[planet].sign;
      const outerRuler = MODERN_RULERS[outerSign];

      // Mutual reception: personal point's ruler IS the outer planet,
      // AND the outer planet's sign ruler IS the personal point's luminary
      // e.g., Sun in Scorpio (ruler=Pluto) + Pluto in Leo (ruler=Sun)
      const personalLuminary = point === 'ascendant' ? 'ascendant' : point;

      if (personalRuler === planet && outerRuler === personalLuminary) {
        // Check not already detected as Power/Vessel/Instrument (avoid doubling)
        const alreadyDetected = patterns.some(
          p => p.planet === planet && (p.type === 'power' || p.type === 'vessel' || p.type === 'instrument')
            && p.point === point
        );
        if (!alreadyDetected) {
          patterns.push({
            type: 'mutual_reception',
            planet,
            point,
            label: `${PLANET_NAMES[planet]} Mutual Reception (${point})`,
            description: MUTUAL_RECEPTION_DESCRIPTIONS[planet],
            livePrompt: MUTUAL_RECEPTION_PROMPTS[planet],
          });
        }
      }
    }
  }

  // ─── 5. ADEPT (missing element or mode) ───
  // Count all planets + ASC across elements and modes
  const allSigns: string[] = [
    chart.sun.sign, chart.moon.sign, chart.mercury.sign, chart.venus.sign,
    chart.mars.sign, chart.jupiter.sign, chart.saturn.sign, chart.uranus.sign,
    chart.neptune.sign, chart.pluto.sign, chart.ascendant.sign,
  ];

  const elementCount: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0 };
  const modeCount: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };

  for (const sign of allSigns) {
    const el = SIGN_ELEMENTS[sign];
    const mode = SIGN_MODES[sign];
    if (el) elementCount[el]++;
    if (mode) modeCount[mode]++;
  }

  // Missing elements
  for (const [element, count] of Object.entries(elementCount)) {
    if (count === 0) {
      patterns.push({
        type: 'adept',
        element,
        label: `${element.charAt(0).toUpperCase() + element.slice(1)} Adept`,
        description: ADEPT_ELEMENT_DESCRIPTIONS[element],
        livePrompt: ADEPT_ELEMENT_PROMPTS[element],
      });
    }
  }

  // Missing modes
  for (const [mode, count] of Object.entries(modeCount)) {
    if (count === 0) {
      patterns.push({
        type: 'adept',
        mode,
        label: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Adept`,
        description: ADEPT_MODE_DESCRIPTIONS[mode],
        livePrompt: ADEPT_MODE_PROMPTS[mode],
      });
    }
  }

  return patterns;
}

/**
 * Format alien patterns as a readable summary for MAIA context
 */
export function formatAlienPatternsForPrompt(patterns: AlienPattern[]): string {
  if (patterns.length === 0) return '';

  const lines = [
    '## Alien Patterns (Steinbrecher)',
    '',
    'The following transpersonal forces are fused with personal points in this chart:',
    '',
  ];

  for (const p of patterns) {
    lines.push(`**${p.label}**${p.orb !== undefined ? ` (orb: ${p.orb}°)` : ''}`);
    lines.push(p.description);
    lines.push('');
  }

  return lines.join('\n');
}
