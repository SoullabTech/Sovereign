/**
 * COSMIC WEATHER API
 *
 * Returns current planetary positions for the Stellium Pro dashboard
 * Uses the existing transit calculator infrastructure
 *
 * Response includes:
 * - Current planetary positions with sign/degree
 * - Moon phase
 * - Active retrogrades
 * - Key aspects between transiting planets
 */

import { NextResponse } from 'next/server';
import { calculateCurrentTransits, type TransitPositions } from '@/lib/astrology/transitCalculator';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';

// Mock data for development when transit calculator fails
const DEV_MOCK_RESPONSE = {
  timestamp: new Date().toISOString(),
  planets: [
    { planet: 'Sun', glyph: '☉', longitude: 303.5, sign: 'Aquarius', signGlyph: '♒', degree: 3.5 },
    { planet: 'Moon', glyph: '☽', longitude: 197.2, sign: 'Libra', signGlyph: '♎', degree: 17.2 },
    { planet: 'Mercury', glyph: '☿', longitude: 298.1, sign: 'Capricorn', signGlyph: '♑', degree: 28.1 },
    { planet: 'Venus', glyph: '♀', longitude: 335.8, sign: 'Pisces', signGlyph: '♓', degree: 5.8 },
    { planet: 'Mars', glyph: '♂', longitude: 102.4, sign: 'Cancer', signGlyph: '♋', degree: 12.4 },
    { planet: 'Jupiter', glyph: '♃', longitude: 75.3, sign: 'Gemini', signGlyph: '♊', degree: 15.3 },
    { planet: 'Saturn', glyph: '♄', longitude: 347.8, sign: 'Pisces', signGlyph: '♓', degree: 17.8 },
    { planet: 'Uranus', glyph: '♅', longitude: 57.2, sign: 'Taurus', signGlyph: '♉', degree: 27.2 },
    { planet: 'Neptune', glyph: '♆', longitude: 359.4, sign: 'Pisces', signGlyph: '♓', degree: 29.4 },
    { planet: 'Pluto', glyph: '♇', longitude: 303.8, sign: 'Aquarius', signGlyph: '♒', degree: 3.8 },
  ],
  moonPhase: { phase: 'Waning Crescent', illumination: 23, emoji: '🌘' },
  retrogrades: ['Mars'],
  keyAspects: [
    { planet1: 'Sun', glyph1: '☉', aspect: 'conjunction', aspectGlyph: '☌', planet2: 'Pluto', glyph2: '♇', orb: 0.3 },
    { planet1: 'Saturn', glyph1: '♄', aspect: 'conjunction', aspectGlyph: '☌', planet2: 'Neptune', glyph2: '♆', orb: 1.6 },
  ],
};

// Zodiac signs in order
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Sign glyphs
const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

// Planet glyphs
const PLANET_GLYPHS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀',
  mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅',
  neptune: '♆', pluto: '♇'
};

interface PlanetPosition {
  planet: string;
  glyph: string;
  longitude: number;
  sign: string;
  signGlyph: string;
  degree: number;
  isRetrograde?: boolean;
}

interface MoonPhase {
  phase: string;
  illumination: number;
  emoji: string;
}

interface CosmicWeatherResponse {
  timestamp: string;
  planets: PlanetPosition[];
  moonPhase: MoonPhase;
  retrogrades: string[];
  keyAspects: Array<{
    planet1: string;
    glyph1: string;
    aspect: string;
    aspectGlyph: string;
    planet2: string;
    glyph2: string;
    orb: number;
  }>;
}

/**
 * Convert longitude to sign and degree
 */
function longitudeToSignDegree(longitude: number): { sign: string; degree: number } {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degree = normalizedLon % 30;
  return {
    sign: SIGNS[signIndex],
    degree: Math.round(degree * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Calculate moon phase from sun-moon elongation
 */
function calculateMoonPhase(sunLon: number, moonLon: number): MoonPhase {
  let elongation = moonLon - sunLon;
  if (elongation < 0) elongation += 360;

  // Illumination approximation
  const illumination = Math.round((1 - Math.cos(elongation * Math.PI / 180)) / 2 * 100);

  // Phase determination
  let phase: string;
  let emoji: string;

  if (elongation < 22.5) {
    phase = 'New Moon';
    emoji = '🌑';
  } else if (elongation < 67.5) {
    phase = 'Waxing Crescent';
    emoji = '🌒';
  } else if (elongation < 112.5) {
    phase = 'First Quarter';
    emoji = '🌓';
  } else if (elongation < 157.5) {
    phase = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (elongation < 202.5) {
    phase = 'Full Moon';
    emoji = '🌕';
  } else if (elongation < 247.5) {
    phase = 'Waning Gibbous';
    emoji = '🌖';
  } else if (elongation < 292.5) {
    phase = 'Last Quarter';
    emoji = '🌗';
  } else if (elongation < 337.5) {
    phase = 'Waning Crescent';
    emoji = '🌘';
  } else {
    phase = 'New Moon';
    emoji = '🌑';
  }

  return { phase, illumination, emoji };
}

/**
 * Check for aspects between transiting planets
 */
function findTransitAspects(transits: TransitPositions) {
  const aspects: Array<{
    planet1: string;
    glyph1: string;
    aspect: string;
    aspectGlyph: string;
    planet2: string;
    glyph2: string;
    orb: number;
  }> = [];

  const aspectDefs = [
    { name: 'conjunction', glyph: '☌', angle: 0, orb: 8 },
    { name: 'opposition', glyph: '☍', angle: 180, orb: 8 },
    { name: 'square', glyph: '□', angle: 90, orb: 6 },
    { name: 'trine', glyph: '△', angle: 120, orb: 6 },
  ];

  // Outer planets to check (skip fast-moving planets for simplicity)
  const planets: [string, number][] = [
    ['mars', transits.mars],
    ['jupiter', transits.jupiter],
    ['saturn', transits.saturn],
    ['uranus', transits.uranus],
    ['neptune', transits.neptune],
    ['pluto', transits.pluto],
  ];

  // Check each pair
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const [name1, lon1] = planets[i];
      const [name2, lon2] = planets[j];

      let separation = Math.abs(lon1 - lon2);
      if (separation > 180) separation = 360 - separation;

      for (const aspectDef of aspectDefs) {
        const orbDiff = Math.abs(separation - aspectDef.angle);
        if (orbDiff <= aspectDef.orb) {
          aspects.push({
            planet1: name1.charAt(0).toUpperCase() + name1.slice(1),
            glyph1: PLANET_GLYPHS[name1],
            aspect: aspectDef.name,
            aspectGlyph: aspectDef.glyph,
            planet2: name2.charAt(0).toUpperCase() + name2.slice(1),
            glyph2: PLANET_GLYPHS[name2],
            orb: Math.round(orbDiff * 10) / 10,
          });
        }
      }
    }
  }

  return aspects;
}

/**
 * Simplified retrograde check
 * TODO: Use proper velocity calculations from astronomy-engine
 * For now, using static retrograde periods approximation
 */
function checkRetrogrades(_transits: TransitPositions, date: Date): string[] {
  const retrogrades: string[] = [];
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Mercury retrograde periods 2026 (approximate)
  // These would ideally come from astronomy calculations
  const mercuryRetrograde2026 = [
    { start: [1, 8], end: [1, 28] },   // Jan 8 - Jan 28
    { start: [5, 4], end: [5, 28] },   // May 4 - May 28
    { start: [9, 3], end: [9, 23] },   // Sep 3 - Sep 23
    { start: [12, 24], end: [12, 31] }, // Dec 24 - Jan 13 (continues into 2027)
  ];

  for (const period of mercuryRetrograde2026) {
    const [startMonth, startDay] = period.start;
    const [endMonth, endDay] = period.end;
    if (
      (month > startMonth || (month === startMonth && day >= startDay)) &&
      (month < endMonth || (month === endMonth && day <= endDay))
    ) {
      retrogrades.push('Mercury');
      break;
    }
  }

  // Saturn, Neptune, Pluto, Uranus are retrograde for significant portions of the year
  // Simplified approximations - would need proper ephemeris for accuracy
  if (month >= 6 && month <= 10) retrogrades.push('Saturn');
  if (month >= 6 && month <= 11) retrogrades.push('Neptune');
  if (month >= 5 && month <= 10) retrogrades.push('Pluto');
  if ((month >= 8 && month <= 12) || month === 1) retrogrades.push('Uranus');

  return retrogrades;
}

export async function GET() {
  try {
    const now = new Date();
    const transits = await calculateCurrentTransits(now);

    // Convert to formatted positions
    const planets: PlanetPosition[] = (Object.keys(PLANET_GLYPHS) as Array<keyof typeof PLANET_GLYPHS>).map(key => {
      const longitude = transits[key as keyof TransitPositions] as number;
      const { sign, degree } = longitudeToSignDegree(longitude);
      return {
        planet: key.charAt(0).toUpperCase() + key.slice(1),
        glyph: PLANET_GLYPHS[key],
        longitude,
        sign,
        signGlyph: SIGN_GLYPHS[sign],
        degree,
      };
    });

    // Moon phase
    const moonPhase = calculateMoonPhase(transits.sun, transits.moon);

    // Retrogrades
    const retrogrades = checkRetrogrades(transits, now);

    // Key aspects
    const keyAspects = findTransitAspects(transits);

    const response: CosmicWeatherResponse = {
      timestamp: now.toISOString(),
      planets,
      moonPhase,
      retrogrades,
      keyAspects,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Cosmic Weather] Error:', error);

    // Dev bypass: return mock data when transit calculator fails
    if (isDev) {
      console.log('[Cosmic Weather] Using mock data for development');
      return NextResponse.json(DEV_MOCK_RESPONSE);
    }

    return NextResponse.json(
      { error: 'Failed to calculate cosmic weather' },
      { status: 500 }
    );
  }
}
