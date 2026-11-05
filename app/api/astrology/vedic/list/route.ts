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
} from '@/lib/astrology/ephemerisCalculator';
import { generateSpiralogicIntegration } from '@/lib/astrology/vedicAstrology';
import { convertToVedicChart } from '@/lib/astrology/vedicChartFromTropical';
import { calculateVimshottariDasha } from '@/lib/astrology/vimshottariDasha';
import {
  AYANAMSA_CONFIGS,
  CompleteVedicProfile,
} from '@/lib/astrology/types/vedic';

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
