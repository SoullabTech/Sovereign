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
import { calculateBirthChart, isValidTimeZone, type BirthData } from '@/lib/astrology/ephemerisCalculator';
import { admitProCalculation } from '@/lib/astrology/proCalculationPolicy';
import { detectAlienPatterns } from '@/lib/astrology/alienPatterns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, location, houseSystem } = body;
    if (body.calculationProfile != null && body.calculationProfile !== 'strict-core') {
      return NextResponse.json({ error: 'unsupported_calculation_profile' }, { status: 400 });
    }
    // Strict-core is opt-in and intended for a separately gated Astrology Pro
    // beta. Legacy consumers retain their prior math until a compatibility review.
    const strict = body.calculationProfile === 'strict-core' ? admitProCalculation(body) : null;
    if (strict && !strict.ok) {
      return NextResponse.json({ error: strict.error }, { status: 422 });
    }

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

    // Prepare chart inputs. No personally identifying birth details are logged.
    // The legacy route's Placidus default actually computed Porphyry houses;
    // use the truthful house-system default without changing legacy positions.
    const birthData: BirthData = strict?.ok
      ? strict.birthData
      : {
          date,
          time,
          location: {
            lat: location.lat,
            lng: location.lng,
            // Legacy longitude-time fallback is retained temporarily but
            // explicitly identified below. Strict-core never permits it.
            timezone: location.timezone || undefined,
          },
          houseSystem: houseSystem || 'porphyry',
        };

    // Calculate the birth chart
    const chart = await calculateBirthChart(birthData);

    // Detect Steinbrecher alien patterns
    const alienPatterns = detectAlienPatterns(chart);
    const requestedHouseSystem = birthData.houseSystem || 'porphyry';
    const actualHouseSystem =
      requestedHouseSystem === 'placidus' || requestedHouseSystem === 'koch'
        ? 'porphyry' // Legacy compatibility only: never call this a true Placidus/Koch chart.
        : ['whole-sign', 'equal', 'porphyry'].includes(requestedHouseSystem)
          ? requestedHouseSystem
          : 'whole-sign';
    const warnings: string[] = [];
    if (requestedHouseSystem !== actualHouseSystem) warnings.push('requested_house_system_approximated');
    if (!isValidTimeZone(birthData.location.timezone)) warnings.push('longitude_timezone_approximation');
    warnings.push('some_minor_bodies_are_approximate');

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
      calculationQuality: {
        profile: strict?.ok ? 'strict-core' : 'legacy',
        requestedHouseSystem,
        actualHouseSystem,
        utcResolution: isValidTimeZone(birthData.location.timezone) ? 'iana' : 'longitude-approximation',
        independentlyCertified: false,
        approximateBodies: ['chiron', 'northNode', 'southNode', 'lilith', 'ceres', 'pallas', 'juno', 'vesta'],
        warnings,
      },
    }, { headers: { 'Cache-Control': 'private, no-store' } });

  } catch {
    // Never log, return or echo third-party errors: they may contain the
    // caller's birth date, local time, coordinates or profile information.
    console.error('[Birth Chart] calculation failed; sensitive details withheld');
    return NextResponse.json(
      { error: 'Birth chart calculation failed' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } }
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
