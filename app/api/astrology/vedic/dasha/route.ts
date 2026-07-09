export const dynamic = 'force-dynamic';

/**
 * Vimshottari Dasha API
 *
 * Calculates the 120-year planetary period system based on Moon's nakshatra.
 * Returns current Mahadasha, Antardasha, and timeline data.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateBirthChart,
  type BirthData,
} from '@/lib/astrology/ephemerisCalculator';
import { calculateAyanamsa, tropicalToSidereal } from '@/lib/astrology/ayanamsaCalculator';
import { getNakshatraFromLongitude } from '@/lib/astrology/vedicAstrology';
import {
  calculateVimshottariDasha,
  getDashaSummary,
  getDashaGuidance,
  getDashaTimelineData,
  getRemainingTime,
  formatRemainingTime,
} from '@/lib/astrology/vimshottariDasha';
import { AyanamsaType, GRAHAS } from '@/lib/astrology/types/vedic';

// Signs in order
const SIGNS_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function signDegreeToLongitude(sign: string, degree: number): number {
  const signIndex = SIGNS_ORDER.findIndex(s => s.toLowerCase() === sign.toLowerCase());
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
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

    // Validate location has lat/lng
    if (typeof body.location.lat !== 'number' || typeof body.location.lng !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Location must include numeric lat and lng',
      }, { status: 400 });
    }

    const ayanamsaType: AyanamsaType = body.ayanamsa || 'lahiri';
    const birthTime = body.time || '12:00'; // Default to noon if not provided

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

    console.log('[Dasha API] Calculating for:', {
      date: birthData.date,
      time: birthData.time,
      ayanamsa: ayanamsaType,
    });

    // Calculate tropical chart to get Moon position
    const tropicalChart = await calculateBirthChart(birthData);

    // Convert Moon to sidereal
    const moonTropicalLong = signDegreeToLongitude(
      tropicalChart.moon.sign,
      tropicalChart.moon.degree
    );
    const birthDate = new Date(`${body.date}T${birthTime}`);
    const ayanamsaValue = calculateAyanamsa(birthDate, ayanamsaType);
    const moonSiderealLong = tropicalToSidereal(moonTropicalLong, ayanamsaValue);

    // Calculate Vimshottari Dasha
    const dashaProfile = calculateVimshottariDasha(birthDate, moonSiderealLong);

    // Get summary and guidance
    const summary = getDashaSummary(dashaProfile);
    const currentGuidance = getDashaGuidance(dashaProfile.currentMahadasha.ruler);
    const timelineData = getDashaTimelineData(dashaProfile, birthDate);

    // Get remaining time
    const remaining = getRemainingTime(dashaProfile.currentMahadasha);

    console.log('[Dasha API] Calculated:', {
      birthNakshatra: dashaProfile.birthNakshatra.name,
      currentMahadasha: dashaProfile.currentMahadasha.ruler,
      currentAntardasha: dashaProfile.currentAntardasha?.ruler,
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: dashaProfile,
        summary: {
          ...summary,
          birthNakshatra: dashaProfile.birthNakshatra.name,
          nakshatraRuler: dashaProfile.birthNakshatra.ruler,
          balanceAtBirth: `${dashaProfile.balanceAtBirth.toFixed(2)} years`,
        },
        guidance: currentGuidance,
        timeline: timelineData,
        remaining: {
          ...remaining,
          formatted: formatRemainingTime(remaining),
        },
      },
      meta: {
        ayanamsa: ayanamsaType,
        ayanamsaValue,
        moonSiderealLongitude: moonSiderealLong.toFixed(2),
        calculatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Dasha API] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate Dasha',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const { searchParams } = new URL(request.url);

  // If no birth date provided, return info about the Dasha system
  const birthDateStr = searchParams.get('birthDate');
  if (!birthDateStr) {
    return NextResponse.json({
      success: true,
      data: {
        info: {
          name: 'Vimshottari Dasha System',
          totalYears: 120,
          sequence: [
            { ruler: 'Ketu', years: 7, description: 'Spiritual awakening, detachment' },
            { ruler: 'Shukra', years: 20, description: 'Love, beauty, relationships' },
            { ruler: 'Surya', years: 6, description: 'Authority, self-expression' },
            { ruler: 'Chandra', years: 10, description: 'Mind, emotions, nurturing' },
            { ruler: 'Mangala', years: 7, description: 'Energy, action, courage' },
            { ruler: 'Rahu', years: 18, description: 'Worldly desires, obsession' },
            { ruler: 'Guru', years: 16, description: 'Wisdom, expansion, fortune' },
            { ruler: 'Shani', years: 19, description: 'Karma, discipline, structure' },
            { ruler: 'Budha', years: 17, description: 'Intelligence, communication' },
          ],
        },
      },
    });
  }

  // Quick lookup with just birth date (uses noon, UTC)
  try {
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const ayanamsaType: AyanamsaType = (searchParams.get('ayanamsa') as AyanamsaType) || 'lahiri';

    const birthData: BirthData = {
      date: birthDateStr,
      time: searchParams.get('birthTime') || '12:00',
      location: {
        lat,
        lng,
        timezone: searchParams.get('timezone') || undefined,
      },
      houseSystem: 'whole-sign',
    };

    const tropicalChart = await calculateBirthChart(birthData);
    const moonTropicalLong = signDegreeToLongitude(
      tropicalChart.moon.sign,
      tropicalChart.moon.degree
    );
    const birthDate = new Date(`${birthDateStr}T${birthData.time}`);
    const ayanamsaValue = calculateAyanamsa(birthDate, ayanamsaType);
    const moonSiderealLong = tropicalToSidereal(moonTropicalLong, ayanamsaValue);

    const dashaProfile = calculateVimshottariDasha(birthDate, moonSiderealLong);
    const summary = getDashaSummary(dashaProfile);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        currentAge: Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
        birthNakshatra: dashaProfile.birthNakshatra.name,
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate quick Dasha lookup',
    }, { status: 500 });
  }
}
