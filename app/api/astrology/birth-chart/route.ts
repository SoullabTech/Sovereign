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
import { calculateBirthChart } from '@/lib/astrology/ephemerisCalculator';
import { BIRTH_CHART_BODY_LIMIT, takeCalculatorBudget, readCalculatorObject, validateBirthChartRequest, calculatorFailureResponse, CALCULATOR_PRIVATE_HEADERS } from '@/lib/astrology/calculatorRequests';
import { detectAlienPatterns } from '@/lib/astrology/alienPatterns';

export async function POST(request: NextRequest) {
  try {
    const budgetFailure = takeCalculatorBudget();
    if (budgetFailure) return calculatorFailureResponse(budgetFailure);
    const body = await readCalculatorObject(request, BIRTH_CHART_BODY_LIMIT);
    if (!body.ok) return calculatorFailureResponse(body);
    const admission = validateBirthChartRequest(body.value);
    if (!admission.ok) return calculatorFailureResponse(admission);
    const birthData = admission.value;

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
    }, { headers: CALCULATOR_PRIVATE_HEADERS });

  } catch (error) {
    console.error('[Birth Chart] BIRTH_CHART_CALCULATION_FAILED');

    return NextResponse.json(
      {
        error: 'Birth chart calculation failed',
        details: 'BIRTH_CHART_CALCULATION_FAILED',
      },
      { status: 500, headers: CALCULATOR_PRIVATE_HEADERS }
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
