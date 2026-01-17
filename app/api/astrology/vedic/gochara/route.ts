/**
 * Gochara (Vedic Transit) API
 *
 * Calculates transit effects from Moon sign using classical Vedic rules.
 * Returns Gochara positions, effects, and Vedha analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateGochara,
  getGocharaGuidance,
  type GocharaProfile,
} from '@/lib/astrology/gocharaTransits';
import { calculateAyanamsa, tropicalToSidereal } from '@/lib/astrology/ayanamsaCalculator';
import { getRashiFromLongitude } from '@/lib/astrology/vedicAstrology';
import { AyanamsaType, GrahaName, RASHIS } from '@/lib/astrology/types/vedic';

// Current transit positions fetcher (simplified - in production, use ephemeris)
async function getCurrentTransits(ayanamsa: number): Promise<Array<{ graha: GrahaName; rashi: string }>> {
  // For now, return approximate current positions
  // In production, this would call the ephemeris calculator
  const now = new Date();

  // Simplified current positions (these should come from ephemeris in production)
  // Using approximate positions for demonstration
  const tropicalPositions = [
    { graha: 'Surya' as GrahaName, longitude: (now.getMonth() * 30 + now.getDate()) % 360 },
    { graha: 'Chandra' as GrahaName, longitude: ((now.getDate() * 12 + now.getHours()) % 360) },
    { graha: 'Mangala' as GrahaName, longitude: 300 }, // Approximate
    { graha: 'Budha' as GrahaName, longitude: ((now.getMonth() * 30 + now.getDate() + 10) % 360) },
    { graha: 'Guru' as GrahaName, longitude: 50 }, // Approximate - Taurus area
    { graha: 'Shukra' as GrahaName, longitude: ((now.getMonth() * 30 + now.getDate() - 20 + 360) % 360) },
    { graha: 'Shani' as GrahaName, longitude: 330 }, // Approximate - Pisces area
    { graha: 'Rahu' as GrahaName, longitude: 10 }, // Approximate
    { graha: 'Ketu' as GrahaName, longitude: 190 }, // Opposite Rahu
  ];

  return tropicalPositions.map(pos => {
    const siderealLong = tropicalToSidereal(pos.longitude, ayanamsa);
    const { rashi } = getRashiFromLongitude(siderealLong);
    return { graha: pos.graha, rashi: rashi.name };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.natalMoonRashi && !body.natalMoonLongitude) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: natalMoonRashi or natalMoonLongitude',
      }, { status: 400 });
    }

    const ayanamsaType: AyanamsaType = body.ayanamsa || 'lahiri';

    // Calculate ayanamsa for current date
    const now = new Date();
    const ayanamsaValue = calculateAyanamsa(now, ayanamsaType);

    // Determine natal Moon rashi
    let natalMoonRashi: string;
    if (body.natalMoonRashi) {
      natalMoonRashi = body.natalMoonRashi;
    } else {
      // Convert longitude to rashi
      const siderealLong = tropicalToSidereal(body.natalMoonLongitude, ayanamsaValue);
      const { rashi } = getRashiFromLongitude(siderealLong);
      natalMoonRashi = rashi.name;
    }

    // Get current transits (or use provided ones)
    const currentTransits = body.currentTransits || await getCurrentTransits(ayanamsaValue);

    // Calculate Gochara
    const gocharaProfile = calculateGochara(natalMoonRashi, currentTransits);

    // Generate guidance for each transit
    const transitGuidance = gocharaProfile.transits.map(transit => ({
      ...transit,
      guidance: getGocharaGuidance(transit.graha, transit.houseFromMoon, transit.effect),
    }));

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...gocharaProfile,
          transits: transitGuidance,
        },
        meta: {
          ayanamsa: ayanamsaType,
          ayanamsaValue: ayanamsaValue.toFixed(4),
          natalMoonRashi,
        },
      },
    });

  } catch (error) {
    console.error('[Gochara API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate Gochara',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const moonRashi = searchParams.get('moonRashi');
  if (!moonRashi) {
    // Return info about the Gochara system
    return NextResponse.json({
      success: true,
      data: {
        info: {
          name: 'Gochara (Vedic Transit) System',
          description: 'Analyzes planetary transits from the Moon sign position',
          methodology: 'Based on Brihat Parashara Hora Shastra',
          features: [
            'Transit effects from Moon sign (not Sun sign)',
            'Vedha (obstruction) point analysis',
            'Classical benefic/malefic house positions',
            'Remedial guidance for challenging transits',
          ],
          usage: 'POST with natalMoonRashi to get current transit analysis',
        },
      },
    });
  }

  // Quick lookup
  try {
    const ayanamsaType: AyanamsaType = (searchParams.get('ayanamsa') as AyanamsaType) || 'lahiri';
    const now = new Date();
    const ayanamsaValue = calculateAyanamsa(now, ayanamsaType);
    const currentTransits = await getCurrentTransits(ayanamsaValue);
    const gocharaProfile = calculateGochara(moonRashi, currentTransits);

    return NextResponse.json({
      success: true,
      data: {
        natalMoonRashi: moonRashi,
        overallTone: gocharaProfile.overallTone,
        summary: gocharaProfile.summary,
        transits: gocharaProfile.transits.map(t => ({
          graha: t.graha,
          house: t.houseFromMoon,
          effect: t.effect,
          vedhaBlocked: t.vedhaBlocked,
        })),
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate Gochara',
    }, { status: 500 });
  }
}
