/**
 * Current Transits API
 *
 * Returns current planetary positions and optionally calculates
 * aspects to a natal chart for transit interpretation.
 *
 * GET: Returns current planetary positions with sign/degree
 * POST: Accepts birth chart data and returns positions + natal aspects
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateCurrentTransits,
  findTransitAspects,
  type TransitPositions,
  type AspectPattern,
  type PlanetName,
} from '@/lib/astrology/transitCalculator';
import type { BirthChart } from '@/lib/astrology/ephemerisCalculator';

// Signs in order for longitude conversion
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

type SignName = (typeof SIGNS)[number];

interface TransitPosition {
  planet: PlanetName;
  longitude: number;
  sign: SignName;
  degree: number;
  house?: number;
}

interface CurrentTransitsResponse {
  success: boolean;
  data?: {
    timestamp: string;
    positions: TransitPosition[];
    aspects?: AspectPattern[];
  };
  error?: string;
}

/**
 * Convert ecliptic longitude to sign and degree
 */
function longitudeToSignDegree(longitude: number): { sign: SignName; degree: number } {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degree = normalizedLon % 30;
  return {
    sign: SIGNS[signIndex],
    degree: Math.round(degree * 100) / 100,
  };
}

/**
 * Calculate which house a transit planet falls in based on natal house cusps
 * Simple whole-sign approach - more sophisticated methods could be added
 */
function calculateTransitHouse(transitLongitude: number, ascendantLongitude: number): number {
  const normalizedTransit = ((transitLongitude % 360) + 360) % 360;
  const normalizedAsc = ((ascendantLongitude % 360) + 360) % 360;

  // Distance from ascendant determines house (whole sign houses)
  let distance = normalizedTransit - normalizedAsc;
  if (distance < 0) distance += 360;

  const house = Math.floor(distance / 30) + 1;
  return house > 12 ? house - 12 : house;
}

/**
 * GET: Return current planetary positions
 */
export async function GET(): Promise<NextResponse<CurrentTransitsResponse>> {
  try {
    const now = new Date();
    const transits = await calculateCurrentTransits(now);

    const positions: TransitPosition[] = [
      { planet: 'Sun', longitude: transits.sun, ...longitudeToSignDegree(transits.sun) },
      { planet: 'Moon', longitude: transits.moon, ...longitudeToSignDegree(transits.moon) },
      { planet: 'Mercury', longitude: transits.mercury, ...longitudeToSignDegree(transits.mercury) },
      { planet: 'Venus', longitude: transits.venus, ...longitudeToSignDegree(transits.venus) },
      { planet: 'Mars', longitude: transits.mars, ...longitudeToSignDegree(transits.mars) },
      { planet: 'Jupiter', longitude: transits.jupiter, ...longitudeToSignDegree(transits.jupiter) },
      { planet: 'Saturn', longitude: transits.saturn, ...longitudeToSignDegree(transits.saturn) },
      { planet: 'Uranus', longitude: transits.uranus, ...longitudeToSignDegree(transits.uranus) },
      { planet: 'Neptune', longitude: transits.neptune, ...longitudeToSignDegree(transits.neptune) },
      { planet: 'Pluto', longitude: transits.pluto, ...longitudeToSignDegree(transits.pluto) },
    ];

    return NextResponse.json({
      success: true,
      data: {
        timestamp: now.toISOString(),
        positions,
      },
    });
  } catch (error) {
    console.error('[CurrentTransits API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate transits',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Return current transits with aspects to natal chart
 *
 * Body should include a birth chart object with planetary positions
 */
export async function POST(request: NextRequest): Promise<NextResponse<CurrentTransitsResponse>> {
  try {
    const body = await request.json();

    if (!body.birthChart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: birthChart',
        },
        { status: 400 }
      );
    }

    const birthChart: BirthChart = body.birthChart;
    const now = new Date();
    const transits = await calculateCurrentTransits(now);

    // Calculate ascendant longitude for house placement
    const ascSign = SIGNS.indexOf(birthChart.ascendant.sign as SignName);
    const ascLongitude = ascSign * 30 + birthChart.ascendant.degree;

    // Build positions with house placements
    const positions: TransitPosition[] = [
      { planet: 'Sun', longitude: transits.sun, ...longitudeToSignDegree(transits.sun), house: calculateTransitHouse(transits.sun, ascLongitude) },
      { planet: 'Moon', longitude: transits.moon, ...longitudeToSignDegree(transits.moon), house: calculateTransitHouse(transits.moon, ascLongitude) },
      { planet: 'Mercury', longitude: transits.mercury, ...longitudeToSignDegree(transits.mercury), house: calculateTransitHouse(transits.mercury, ascLongitude) },
      { planet: 'Venus', longitude: transits.venus, ...longitudeToSignDegree(transits.venus), house: calculateTransitHouse(transits.venus, ascLongitude) },
      { planet: 'Mars', longitude: transits.mars, ...longitudeToSignDegree(transits.mars), house: calculateTransitHouse(transits.mars, ascLongitude) },
      { planet: 'Jupiter', longitude: transits.jupiter, ...longitudeToSignDegree(transits.jupiter), house: calculateTransitHouse(transits.jupiter, ascLongitude) },
      { planet: 'Saturn', longitude: transits.saturn, ...longitudeToSignDegree(transits.saturn), house: calculateTransitHouse(transits.saturn, ascLongitude) },
      { planet: 'Uranus', longitude: transits.uranus, ...longitudeToSignDegree(transits.uranus), house: calculateTransitHouse(transits.uranus, ascLongitude) },
      { planet: 'Neptune', longitude: transits.neptune, ...longitudeToSignDegree(transits.neptune), house: calculateTransitHouse(transits.neptune, ascLongitude) },
      { planet: 'Pluto', longitude: transits.pluto, ...longitudeToSignDegree(transits.pluto), house: calculateTransitHouse(transits.pluto, ascLongitude) },
    ];

    // Find aspects between transits and natal chart
    const aspects = findTransitAspects(transits, birthChart);

    // Sort aspects by orb (tightest first)
    const sortedAspects = aspects.sort((a, b) => a.orb - b.orb);

    return NextResponse.json({
      success: true,
      data: {
        timestamp: now.toISOString(),
        positions,
        aspects: sortedAspects,
      },
    });
  } catch (error) {
    console.error('[CurrentTransits API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate transits',
      },
      { status: 500 }
    );
  }
}
