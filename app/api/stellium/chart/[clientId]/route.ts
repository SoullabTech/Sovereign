/**
 * STELLIUM CHART API
 *
 * Calculate and return chart data for a practitioner's client
 * Includes natal chart with optional transit overlay
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/stellium/clients';
import { calculateBirthChart, BirthData } from '@/lib/astrology/ephemerisCalculator';
import { calculateCurrentTransits, findTransitAspects } from '@/lib/astrology/transitCalculator';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

// Zodiac signs
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Convert longitude to sign and degree
 */
function longitudeToZodiac(longitude: number): { sign: string; degree: number } {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degree = normalizedLon % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Math.round(degree * 100) / 100,
  };
}

/**
 * GET /api/stellium/chart/[clientId]
 * Calculate chart for a client
 *
 * Query params:
 * - practitionerId: required
 * - includeTransits: if 'true', include current transits and aspects
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const { clientId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId');
    const includeTransits = searchParams.get('includeTransits') === 'true';

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    // Get client
    const client = await getClient(practitionerId, clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client has birth data
    if (!client.birth_date) {
      return NextResponse.json({
        client,
        chart: null,
        message: 'No birth data available for this client',
      });
    }

    // Build birth data for calculation
    const birthData: BirthData = {
      date: client.birth_date,
      time: client.birth_time || '12:00', // Default to noon if no time
      location: {
        lat: client.birth_latitude || 0,
        lng: client.birth_longitude || 0,
        timezone: client.birth_timezone || undefined,
      },
    };

    // Calculate birth chart
    const chart = await calculateBirthChart(birthData);

    // Prepare response
    const response: any = {
      client,
      chart,
      birthTimeKnown: !!client.birth_time,
    };

    // Include transits if requested
    if (includeTransits) {
      const now = new Date();
      const transits = await calculateCurrentTransits(now);

      // Convert transit positions to chart-compatible format
      const transitPositions = Object.entries(transits)
        .filter(([key]) => key !== 'date')
        .map(([planet, longitude]) => {
          const { sign, degree } = longitudeToZodiac(longitude as number);
          return {
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            sign,
            degree,
            longitude: longitude as number,
          };
        });

      // Calculate transit-to-natal aspects
      const transitAspects = findTransitAspects(transits, chart);

      response.transits = {
        date: now.toISOString(),
        positions: transitPositions,
        aspects: transitAspects.map(aspect => ({
          transitPlanet: aspect.transitPlanet,
          natalPlanet: aspect.natalPlanet,
          aspectType: aspect.aspectType,
          orb: aspect.orb,
          applying: aspect.applying,
        })),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Stellium Chart API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate chart' },
      { status: 500 }
    );
  }
}
