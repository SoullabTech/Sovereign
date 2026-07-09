export const dynamic = 'force-dynamic';

/**
 * Ashtakavarga API
 *
 * Calculates the 8-point strength system for planetary transits.
 * Returns bindu matrices, transit strengths, and remedial recommendations.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateSarvaAshtakavarga,
  calculateAshtakavargaProfile,
  getTransitStrength,
  getRemedialMeasures,
  type AshtakavargaPlanet,
  type AshtakavargaProfile,
} from '@/lib/astrology/ashtakavarga';
import { calculateBirthChart, type BirthData } from '@/lib/astrology/ephemerisCalculator';
import { calculateAyanamsa, tropicalToSidereal } from '@/lib/astrology/ayanamsaCalculator';
import { getRashiFromLongitude } from '@/lib/astrology/vedicAstrology';
import { AyanamsaType, RASHIS } from '@/lib/astrology/types/vedic';

// Signs in order for conversion
const SIGNS_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function signDegreeToLongitude(sign: string, degree: number): number {
  const signIndex = SIGNS_ORDER.findIndex(s => s.toLowerCase() === sign.toLowerCase());
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
}

function longitudeToHouse(longitude: number, ascendantLongitude: number): number {
  let house = Math.floor((longitude - ascendantLongitude + 360) / 30) + 1;
  if (house > 12) house -= 12;
  if (house <= 0) house += 12;
  return house;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.location) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: date, location',
      }, { status: 400 });
    }

    if (typeof body.location.lat !== 'number' || typeof body.location.lng !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Location must include numeric lat and lng',
      }, { status: 400 });
    }

    const ayanamsaType: AyanamsaType = body.ayanamsa || 'lahiri';
    const birthTime = body.time || '12:00';
    const includeCurrentTransits = body.includeCurrentTransits !== false;

    // Prepare birth data
    const birthData: BirthData = {
      date: body.date,
      time: birthTime,
      location: {
        lat: body.location.lat,
        lng: body.location.lng,
        timezone: body.location.timezone || undefined,
      },
      houseSystem: 'whole-sign',
    };

    console.log('[Ashtakavarga API] Calculating for:', {
      date: birthData.date,
      time: birthData.time,
      ayanamsa: ayanamsaType,
    });

    // Calculate tropical chart
    const tropicalChart = await calculateBirthChart(birthData);

    // Calculate ayanamsa
    const birthDate = new Date(`${body.date}T${birthTime}`);
    const ayanamsaValue = calculateAyanamsa(birthDate, ayanamsaType);

    // Convert all planets to sidereal house positions
    const planetKeys: { key: string; graha: AshtakavargaPlanet }[] = [
      { key: 'sun', graha: 'Surya' },
      { key: 'moon', graha: 'Chandra' },
      { key: 'mars', graha: 'Mangala' },
      { key: 'mercury', graha: 'Budha' },
      { key: 'jupiter', graha: 'Guru' },
      { key: 'venus', graha: 'Shukra' },
      { key: 'saturn', graha: 'Shani' },
    ];

    // Get ascendant sidereal longitude
    const ascTropicalLong = signDegreeToLongitude(
      tropicalChart.ascendant.sign,
      tropicalChart.ascendant.degree
    );
    const ascSiderealLong = tropicalToSidereal(ascTropicalLong, ayanamsaValue);
    const lagnaHouse = 1; // Lagna is always house 1

    // Calculate natal positions (as house numbers)
    const natalPositions: Record<AshtakavargaPlanet, number> = {} as Record<AshtakavargaPlanet, number>;

    for (const { key, graha } of planetKeys) {
      const planet = tropicalChart[key as keyof typeof tropicalChart] as { sign: string; degree: number } | undefined;
      if (planet?.sign) {
        const tropicalLong = signDegreeToLongitude(planet.sign, planet.degree);
        const siderealLong = tropicalToSidereal(tropicalLong, ayanamsaValue);
        natalPositions[graha] = longitudeToHouse(siderealLong, ascSiderealLong);
      } else {
        natalPositions[graha] = 1; // Default
      }
    }

    // Calculate current transit positions if requested
    let currentTransits: Partial<Record<AshtakavargaPlanet, number>> = {};

    if (includeCurrentTransits) {
      const now = new Date();
      const currentAyanamsa = calculateAyanamsa(now, ayanamsaType);

      // Approximate current positions (in production, use ephemeris)
      // These are simplified calculations
      const currentYear = now.getFullYear();
      const dayOfYear = Math.floor((now.getTime() - new Date(currentYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24));

      // Sun moves ~1° per day
      const sunTropical = dayOfYear % 360;
      const sunSidereal = tropicalToSidereal(sunTropical, currentAyanamsa);
      currentTransits.Surya = longitudeToHouse(sunSidereal, ascSiderealLong);

      // Moon moves ~13° per day
      const moonTropical = (dayOfYear * 13 + now.getHours() * 0.5) % 360;
      const moonSidereal = tropicalToSidereal(moonTropical, currentAyanamsa);
      currentTransits.Chandra = longitudeToHouse(moonSidereal, ascSiderealLong);

      // Outer planets (approximate fixed positions for demo)
      currentTransits.Mangala = longitudeToHouse(tropicalToSidereal(300, currentAyanamsa), ascSiderealLong);
      currentTransits.Budha = longitudeToHouse(tropicalToSidereal((sunTropical + 10) % 360, currentAyanamsa), ascSiderealLong);
      currentTransits.Guru = longitudeToHouse(tropicalToSidereal(50, currentAyanamsa), ascSiderealLong);
      currentTransits.Shukra = longitudeToHouse(tropicalToSidereal((sunTropical - 20 + 360) % 360, currentAyanamsa), ascSiderealLong);
      currentTransits.Shani = longitudeToHouse(tropicalToSidereal(330, currentAyanamsa), ascSiderealLong);
    }

    // Calculate Ashtakavarga profile
    const ashtakavargaProfile = calculateAshtakavargaProfile(
      natalPositions,
      lagnaHouse,
      currentTransits
    );

    // Add remedial measures for weak transits
    const transitsWithRemedies = ashtakavargaProfile.transitStrengths.map(transit => ({
      ...transit,
      remedies: transit.strength === 'weak' || transit.strength === 'poor'
        ? getRemedialMeasures(transit.planet, transit.bindus)
        : [],
    }));

    console.log('[Ashtakavarga API] Calculated successfully');

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...ashtakavargaProfile,
          transitStrengths: transitsWithRemedies,
        },
        natalPositions,
        meta: {
          ayanamsa: ayanamsaType,
          ayanamsaValue: ayanamsaValue.toFixed(4),
          includesCurrentTransits: includeCurrentTransits,
          calculatedAt: new Date().toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('[Ashtakavarga API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate Ashtakavarga',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Return info about the Ashtakavarga system
  return NextResponse.json({
    success: true,
    data: {
      info: {
        name: 'Ashtakavarga System',
        description: 'Eight-point strength assessment for planetary transits',
        methodology: 'Based on Brihat Parashara Hora Shastra chapters 66-72',
        features: [
          'Individual planetary Ashtakavarga (PAV)',
          'Sarva Ashtakavarga (SAV) - combined strength',
          'Transit strength prediction based on bindu count',
          'Strong and weak house identification',
          'Remedial measures for challenging transits',
        ],
        binduScale: {
          '6-8': 'Excellent - highly favorable transit',
          '5': 'Good - generally positive',
          '4': 'Average - neutral effects',
          '3': 'Weak - some challenges',
          '0-2': 'Poor - difficult transit, remedies recommended',
        },
        usage: 'POST with date, time, and location to calculate full profile',
      },
    },
  });
}
