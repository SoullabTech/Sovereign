/**
 * Da Yun (大運) - 10-Year Luck Cycles API
 *
 * Calculates complete Da Yun profile including Four Pillars and
 * all 10-year luck periods with TCM health guidance.
 */

export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { calculateDaYun, formatDaYunPeriod, getCurrentPhasesSummary } from '@/lib/astrology/daYunCalculator';
import type { Gender } from '@/lib/astrology/types/daYun';

interface DaYunRequest {
  birthDate: string;      // ISO date string
  birthTime?: string;     // HH:MM (optional)
  gender: 'male' | 'female';
  timezoneOffset?: number; // Minutes offset from UTC
}

export async function POST(request: NextRequest) {
  try {
    const body: DaYunRequest = await request.json();

    // Validate required fields
    if (!body.birthDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: birthDate',
      }, { status: 400 });
    }

    if (!body.gender || !['male', 'female'].includes(body.gender)) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid field: gender (must be "male" or "female")',
      }, { status: 400 });
    }

    // Parse birth date
    const birthDate = new Date(body.birthDate);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid birthDate format. Use ISO format (YYYY-MM-DD)',
      }, { status: 400 });
    }

    // Apply birth time if provided
    if (body.birthTime) {
      const [hours, minutes] = body.birthTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        birthDate.setHours(hours, minutes, 0, 0);
      }
    }

    console.log('[Da Yun API] Calculating for:', {
      birthDate: birthDate.toISOString(),
      birthTime: body.birthTime || 'not specified',
      gender: body.gender,
      timezoneOffset: body.timezoneOffset || 0,
    });

    // Calculate Da Yun profile
    const profile = calculateDaYun(
      birthDate,
      body.gender as Gender,
      body.birthTime,
      body.timezoneOffset || 0
    );

    // Get formatted summary
    const phasesSummary = getCurrentPhasesSummary(profile);

    console.log('[Da Yun API] Calculated successfully:', {
      cycleDirection: profile.cycleDirection,
      startAge: profile.daYunStartAge,
      currentAge: profile.currentAge,
      currentPeriod: formatDaYunPeriod(profile.currentPeriod),
      periodsCount: profile.periods.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        // Convert Date to ISO string for JSON
        birthDate: profile.birthDate.toISOString(),
        // Add formatted summary
        summary: {
          phases: phasesSummary,
          currentPeriodFormatted: formatDaYunPeriod(profile.currentPeriod),
        },
      },
    });

  } catch (error) {
    console.error('[Da Yun API] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate Da Yun',
    }, { status: 500 });
  }
}

/**
 * GET endpoint for quick current transits info
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const birthDate = searchParams.get('birthDate');
    const gender = searchParams.get('gender') as Gender | null;
    const birthTime = searchParams.get('birthTime');

    if (!birthDate || !gender) {
      return NextResponse.json({
        success: false,
        error: 'Missing required query params: birthDate, gender',
      }, { status: 400 });
    }

    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid gender. Must be "male" or "female"',
      }, { status: 400 });
    }

    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid birthDate format',
      }, { status: 400 });
    }

    const profile = calculateDaYun(date, gender, birthTime || undefined);
    const phasesSummary = getCurrentPhasesSummary(profile);

    // Return condensed view for GET requests
    return NextResponse.json({
      success: true,
      data: {
        currentAge: profile.currentAge,
        cycleDirection: profile.cycleDirection,
        currentPeriod: {
          ageRange: profile.currentPeriod.ageRange,
          element: profile.currentPeriod.element,
          zodiacAnimal: profile.currentPeriod.zodiacAnimal,
          lifeTheme: profile.currentPeriod.lifeTheme,
          formatted: formatDaYunPeriod(profile.currentPeriod),
        },
        phases: phasesSummary,
        yearsRemaining: 10 - profile.yearsInCurrentPeriod,
        periodProgress: profile.periodProgress,
      },
    });

  } catch (error) {
    console.error('[Da Yun API GET] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate Da Yun',
    }, { status: 500 });
  }
}
