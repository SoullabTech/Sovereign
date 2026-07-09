export const dynamic = 'force-dynamic';

/**
 * Vedic Astrology API
 *
 * Calculates a complete Vedic (Jyotish) chart using sidereal positions,
 * nakshatras, and Vimshottari Dasha periods.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateBirthChart,
  type BirthData,
  type BirthChart,
} from '@/lib/astrology/ephemerisCalculator';
import { calculateAyanamsa, tropicalToSidereal } from '@/lib/astrology/ayanamsaCalculator';
import {
  calculateSiderealPosition,
  calculateGrahaPosition,
  calculateDignity,
  generateSpiralogicIntegration,
  getRashiFromLongitude,
  getNakshatraFromLongitude,
} from '@/lib/astrology/vedicAstrology';
import { calculateVimshottariDasha } from '@/lib/astrology/vimshottariDasha';
import {
  AyanamsaType,
  AYANAMSA_CONFIGS,
  GrahaName,
  GrahaPosition,
  VedicChart,
  CompleteVedicProfile,
} from '@/lib/astrology/types/vedic';

// Map Western planet names to Vedic Graha names
const PLANET_TO_GRAHA: Record<string, GrahaName> = {
  sun: 'Surya',
  moon: 'Chandra',
  mars: 'Mangala',
  mercury: 'Budha',
  jupiter: 'Guru',
  venus: 'Shukra',
  saturn: 'Shani',
  northNode: 'Rahu',
  southNode: 'Ketu',
};

// Signs in order (tropical)
const SIGNS_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Convert tropical sign+degree to absolute longitude
 */
function signDegreeToLongitude(sign: string, degree: number): number {
  const signIndex = SIGNS_ORDER.findIndex(s => s.toLowerCase() === sign.toLowerCase());
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
}

/**
 * Convert tropical chart to Vedic chart
 */
function convertToVedicChart(
  tropicalChart: BirthChart,
  birthDate: Date,
  ayanamsaType: AyanamsaType
): VedicChart {
  const ayanamsaValue = calculateAyanamsa(birthDate, ayanamsaType);
  const ayanamsaConfig = AYANAMSA_CONFIGS[ayanamsaType];

  // Convert ascendant
  const ascLongitude = signDegreeToLongitude(
    tropicalChart.ascendant.sign,
    tropicalChart.ascendant.degree
  );
  const ascendant = calculateSiderealPosition(ascLongitude, ayanamsaValue);

  // Convert Sun first (needed for combustion checks)
  const sunTropicalLong = signDegreeToLongitude(
    tropicalChart.sun.sign,
    tropicalChart.sun.degree
  );
  const sunSiderealLong = tropicalToSidereal(sunTropicalLong, ayanamsaValue);

  // Calculate house for each planet based on whole sign houses from Lagna
  const lagnaSignIndex = Math.floor(ascendant.longitude / 30);

  function getHouse(siderealLongitude: number): number {
    const planetSignIndex = Math.floor(siderealLongitude / 30);
    let house = (planetSignIndex - lagnaSignIndex + 12) % 12 + 1;
    return house;
  }

  // Convert all grahas
  const grahas: Record<GrahaName, GrahaPosition> = {} as Record<GrahaName, GrahaPosition>;

  const planetMappings: Array<{ key: keyof BirthChart; graha: GrahaName }> = [
    { key: 'sun', graha: 'Surya' },
    { key: 'moon', graha: 'Chandra' },
    { key: 'mars', graha: 'Mangala' },
    { key: 'mercury', graha: 'Budha' },
    { key: 'jupiter', graha: 'Guru' },
    { key: 'venus', graha: 'Shukra' },
    { key: 'saturn', graha: 'Shani' },
    { key: 'northNode', graha: 'Rahu' },
    { key: 'southNode', graha: 'Ketu' },
  ];

  for (const { key, graha } of planetMappings) {
    const planet = tropicalChart[key] as { sign: string; degree: number; retrograde?: boolean };
    const tropicalLong = signDegreeToLongitude(planet.sign, planet.degree);

    const position = calculateGrahaPosition(
      graha,
      tropicalLong,
      ayanamsaValue,
      planet.retrograde || (graha === 'Rahu' || graha === 'Ketu'), // Nodes always retrograde
      sunSiderealLong,
      getHouse(tropicalToSidereal(tropicalLong, ayanamsaValue))
    );

    grahas[graha] = position;
  }

  // Convert house cusps to sidereal (using whole sign houses)
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    const signIndex = (lagnaSignIndex + i) % 12;
    houses.push(signIndex * 30);
  }

  return {
    ascendant,
    grahas,
    houses,
    ayanamsa: ayanamsaConfig,
    ayanamsaValue,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.time || !body.location) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: date, time, location',
      }, { status: 400 });
    }

    // Validate location has lat/lng
    if (typeof body.location.lat !== 'number' || typeof body.location.lng !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Location must include numeric lat and lng',
      }, { status: 400 });
    }

    const ayanamsaType: AyanamsaType = body.ayanamsa || 'lahiri';
    const includeDasha = body.includeDasha !== false;

    // Prepare birth data
    const birthData: BirthData = {
      date: body.date,
      time: body.time,
      location: {
        lat: body.location.lat,
        lng: body.location.lng,
        timezone: body.location.timezone || undefined,
      },
      houseSystem: 'whole-sign', // Vedic typically uses whole sign houses
    };

    console.log('[Vedic API] Calculating chart for:', {
      date: birthData.date,
      time: birthData.time,
      ayanamsa: ayanamsaType,
    });

    // Calculate tropical birth chart first
    const tropicalChart = await calculateBirthChart(birthData);

    // Convert to Vedic (sidereal) chart
    const birthDate = new Date(`${body.date}T${body.time}`);
    const vedicChart = convertToVedicChart(tropicalChart, birthDate, ayanamsaType);

    // Calculate Vimshottari Dasha if requested
    let dasha: ReturnType<typeof calculateVimshottariDasha> | null = null;
    if (includeDasha) {
      const moonSiderealLong = vedicChart.grahas.Chandra.longitude;
      dasha = calculateVimshottariDasha(birthDate, moonSiderealLong);
    }

    // Get key signs for profile
    const moonSign = vedicChart.grahas.Chandra.rashi;
    const sunSign = vedicChart.grahas.Surya.rashi;
    const ascendantSign = vedicChart.ascendant.rashi;
    const birthNakshatra = vedicChart.grahas.Chandra.nakshatra;

    // Generate Spiralogic integration
    const spiralogicIntegration = generateSpiralogicIntegration(moonSign, birthNakshatra);

    const profile: CompleteVedicProfile = {
      chart: vedicChart,
      dasha: dasha!,
      birthNakshatra,
      moonSign,
      sunSign,
      ascendantSign,
      spiralogicIntegration,
    };

    console.log('[Vedic API] Chart calculated:', {
      moonSign: moonSign.name,
      sunSign: sunSign.name,
      ascendant: ascendantSign.name,
      nakshatra: birthNakshatra.name,
      ayanamsaValue: vedicChart.ayanamsaValue.toFixed(2),
    });

    return NextResponse.json({
      success: true,
      data: profile,
      meta: {
        ayanamsa: ayanamsaType,
        ayanamsaValue: vedicChart.ayanamsaValue,
        calculatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Vedic API] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate Vedic chart',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Return available ayanamsa options
  const ayanamsaOptions = Object.values(AYANAMSA_CONFIGS).map(config => ({
    type: config.type,
    label: config.label,
    description: config.description,
  }));

  return NextResponse.json({
    success: true,
    data: {
      ayanamsaOptions,
      info: {
        name: 'Vedic Astrology (Jyotish) API',
        features: [
          'Sidereal zodiac with selectable ayanamsa',
          '27 Nakshatra calculation',
          'Vimshottari Dasha periods',
          'Planetary dignities (exaltation, debilitation, etc.)',
          'Spiralogic integration',
        ],
      },
    },
  });
}
