/**
 * Birth Chart Calculation API
 *
 * Calculates a full birth chart from birth data.
 *
 * POST /api/astrology/chart
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChart, type BirthData, type BirthChart } from '@/lib/astrology/ephemerisCalculator';

export const dynamic = 'force-dynamic';

interface ChartRequest {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;
  houseSystem?: 'whole-sign' | 'equal' | 'porphyry' | 'placidus' | 'koch';
}

export async function POST(request: NextRequest) {
  try {
    const body: ChartRequest = await request.json();

    // Validate required fields
    if (!body.date || !body.time || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: date, time, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(body.time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM (24-hour)' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (body.latitude < -90 || body.latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (body.longitude < -180 || body.longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    // Build birth data
    const birthData: BirthData = {
      date: body.date,
      time: body.time,
      location: {
        lat: body.latitude,
        lng: body.longitude,
        timezone: body.timezone || 'UTC',
      },
      houseSystem: body.houseSystem || 'whole-sign',
    };

    // Calculate the birth chart
    const chart: BirthChart = await calculateBirthChart(birthData);

    return NextResponse.json({
      success: true,
      chart,
      birthData: {
        date: body.date,
        time: body.time,
        location: {
          latitude: body.latitude,
          longitude: body.longitude,
          timezone: body.timezone || 'UTC',
        },
      },
    });
  } catch (error) {
    console.error('[Astrology] Chart calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate birth chart' },
      { status: 500 }
    );
  }
}
