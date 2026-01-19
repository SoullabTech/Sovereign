export const dynamic = 'force-static';

/**
 * Birth Chart Calculation API
 *
 * Calculates a complete natal chart using professional-grade ephemeris
 * Returns planetary positions, house placements, and aspects
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChart, type BirthData } from '@/lib/astrology/ephemerisCalculator';

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

    // Prepare birth data
    const birthData: BirthData = {
      date: body.date,
      time: body.time,
      location: {
        lat: body.location.lat,
        lng: body.location.lng,
        timezone: body.location.timezone || 'UTC',
      },
      houseSystem: body.houseSystem || 'porphyry',
    };

    console.log('[BirthChart API] Calculating chart for:', {
      date: birthData.date,
      time: birthData.time,
      lat: birthData.location.lat,
      lng: birthData.location.lng,
      timezone: birthData.location.timezone,
      houseSystem: birthData.houseSystem,
    });

    // Calculate the birth chart
    const chart = await calculateBirthChart(birthData);

    console.log('[BirthChart API] Chart calculated successfully:', {
      sun: `${chart.sun.sign} ${chart.sun.degree.toFixed(1)}°`,
      moon: `${chart.moon.sign} ${chart.moon.degree.toFixed(1)}°`,
      ascendant: `${chart.ascendant.sign} ${chart.ascendant.degree.toFixed(1)}°`,
      aspects: chart.aspects.length,
    });

    return NextResponse.json({
      success: true,
      data: chart,
    });

  } catch (error) {
    console.error('[BirthChart API] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate birth chart',
    }, { status: 500 });
  }
}
