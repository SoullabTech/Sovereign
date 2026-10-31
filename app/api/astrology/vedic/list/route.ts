export const dynamic = 'force-dynamic';

/**
 * Vedic Astrology API
 *
 * Calculates a complete Vedic (Jyotish) chart using sidereal positions,
 * nakshatras, and Vimshottari Dasha periods.
 */

import { NextRequest, NextResponse } from 'next/server';
import { VEDIC_BODY_LIMIT, takeCalculatorBudget, readCalculatorObject, validateVedicChartRequest, admitVedicBirthInstant, calculatorFailureResponse, CALCULATOR_PRIVATE_HEADERS } from '@/lib/astrology/calculatorRequests';
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
    const budgetFailure = takeCalculatorBudget();
    if (budgetFailure) return calculatorFailureResponse(budgetFailure);
    const body = await readCalculatorObject(request, VEDIC_BODY_LIMIT);
    if (!body.ok) return calculatorFailureResponse(body);
    const admission = validateVedicChartRequest(body.value);
    if (!admission.ok) return calculatorFailureResponse(admission);
    const input = admission.value;
    const birthInstant = admitVedicBirthInstant(input.date, input.time, input.location);
    if (!birthInstant.ok) return calculatorFailureResponse(birthInstant);

    const exactBirthInstant = birthInstant.value.instant;
    const exactBirthIso = exactBirthInstant.toISOString();
    const birthData: BirthData = {
      // The natal engine receives the already-admitted UTC civil fields, so it
      // cannot independently reinterpret the member's original wall clock.
      date: exactBirthIso.slice(0, 10),
      time: exactBirthIso.slice(11, 16),
      location: { ...input.location, timezone: 'UTC' },
      houseSystem: 'whole-sign',
    };
    const tropicalChart = await calculateBirthChart(birthData);
    const vedicChart = convertToVedicChart(
      tropicalChart, exactBirthInstant, input.ayanamsa,
    );
    const dasha = input.includeDasha
      ? calculateVimshottariDasha(
          exactBirthInstant,
          vedicChart.grahas.Chandra.longitude,
        )
      : null;
    const moonSign = vedicChart.grahas.Chandra.rashi;
    const sunSign = vedicChart.grahas.Surya.rashi;
    const ascendantSign = vedicChart.ascendant.rashi;
    const birthNakshatra = vedicChart.grahas.Chandra.nakshatra;
    const profile: CompleteVedicProfile = {
      chart: vedicChart,
      dasha: dasha!,
      birthNakshatra,
      moonSign,
      sunSign,
      ascendantSign,
      spiralogicIntegration: generateSpiralogicIntegration(moonSign, birthNakshatra),
    };
    return NextResponse.json({
      success: true,
      data: profile,
      meta: {
        ayanamsa: input.ayanamsa,
        ayanamsaValue: vedicChart.ayanamsaValue,
        houseSystem: 'whole-sign',
        method: 'soullab-provisional-linear-j2000-v1',
        birthInstantUtc: birthInstant.value.iso,
        birthTimeZone: birthInstant.value.timeZone,
        appliedOffset: birthInstant.value.offsetLabel,
        ayanamsaReferenceQualified: false,
        dashaTimingQualified: false,
        professionalEphemerisQualified: false,
        calculatedAt: new Date().toISOString(),
      },
    }, { headers: CALCULATOR_PRIVATE_HEADERS });
  } catch {
    console.error('[Vedic API] VEDIC_CHART_CALCULATION_FAILED');
    return NextResponse.json(
      { success: false, error: 'Vedic chart calculation failed', code: 'VEDIC_CHART_CALCULATION_FAILED' },
      { status: 500, headers: CALCULATOR_PRIVATE_HEADERS },
    );
  }
}

export async function GET() {
  const ayanamsaOptions = Object.values(AYANAMSA_CONFIGS).map(config => ({
    type: config.type,
    label: config.label,
    description: `Soullab provisional approximation to the ${config.label} convention`,
    referenceQualified: false,
  }));

  return NextResponse.json({
    success: true,
    data: {
      ayanamsaOptions,
      info: {
        name: 'Vedic Astrology (Jyotish) API',
        method: 'soullab-provisional-linear-j2000-v1',
        ayanamsaReferenceQualified: false,
        dashaTimingQualified: false,
        features: [
          'Provisional sidereal zodiac with selectable convention',
          '27 Nakshatra calculation',
          'Provisional symbolic Vimshottari Dasha timeline',
          'Planetary dignities as symbolic study material',
          'Spiralogic integration',
        ],
      },
    },
  }, { headers: CALCULATOR_PRIVATE_HEADERS });
}
