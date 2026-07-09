/**
 * Birth Chart API
 *
 * POST /api/astrology/birth-chart
 *
 * Calculates a natal birth chart using precise ephemeris calculations.
 * Returns planetary positions, houses, and aspects.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChart, type BirthData } from '@/lib/astrology/ephemerisCalculator';
import { detectAlienPatterns } from '@/lib/astrology/alienPatterns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, location, houseSystem } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { error: 'Birth date is required' },
        { status: 400 }
      );
    }

    if (!time) {
      return NextResponse.json(
        { error: 'Birth time is required' },
        { status: 400 }
      );
    }

    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { error: 'Location with lat/lng coordinates is required' },
        { status: 400 }
      );
    }

    // Prepare birth data
    const birthData: BirthData = {
      date,
      time,
      location: {
        lat: location.lat,
        lng: location.lng,
        // Pass through as-is: defaulting to 'UTC' would misread the local wall
        // time as UTC. Absent/invalid values trigger the calculator's
        // longitude-approximation fallback instead.
        timezone: location.timezone || undefined,
      },
      houseSystem: houseSystem || 'placidus',
    };

    console.log('[Birth Chart] Calculating for:', {
      date: birthData.date,
      time: birthData.time,
      lat: birthData.location.lat,
      lng: birthData.location.lng,
      timezone: birthData.location.timezone,
      houseSystem: birthData.houseSystem,
    });

    // Calculate the birth chart
    const chart = await calculateBirthChart(birthData);

    // Detect Steinbrecher alien patterns
    const alienPatterns = detectAlienPatterns(chart);

    return NextResponse.json({
      success: true,
      data: chart,  // 'data' key for consistency with journey page expectations
      chart,        // Also include 'chart' for backward compatibility
      alienPatterns,
      calculatedAt: new Date().toISOString(),
      input: {
        date: birthData.date,
        time: birthData.time,
        location: birthData.location,
        houseSystem: birthData.houseSystem,
      },
    });

  } catch (error) {
    console.error('[Birth Chart] Calculation error:', error);

    return NextResponse.json(
      {
        error: 'Birth chart calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/astrology/birth-chart',
    method: 'POST',
    description: 'Calculate natal birth chart',
    requiredFields: {
      date: 'YYYY-MM-DD format',
      time: 'HH:MM format (24-hour)',
      location: {
        lat: 'number (latitude)',
        lng: 'number (longitude)',
        timezone: 'string (optional, e.g., "America/New_York")',
      },
      houseSystem: 'optional: "whole-sign" | "placidus" | "koch" | "equal" | "porphyry"',
    },
    example: {
      date: '1985-03-15',
      time: '14:30',
      location: {
        lat: 40.7128,
        lng: -74.006,
        timezone: 'America/New_York',
      },
      houseSystem: 'placidus',
    },
  });
}
