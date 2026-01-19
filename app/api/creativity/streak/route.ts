// Production requires force-dynamic for database access
export const dynamic = 'force-static';

/**
 * Practice Streak API
 * GET /api/creativity/streak - Get current streak info
 *
 * Query params:
 * - memberId: string (required)
 *
 * Returns current streak, longest streak, and at-risk status.
 * Used for streak protection notifications.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStreakInfo } from '@/lib/creativity/service';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId query parameter is required' },
        { status: 400 }
      );
    }

    const streak = await getStreakInfo(memberId);

    // Generate streak message
    let message: string;
    if (streak.currentStreak === 0) {
      message = "Start your streak today! One creative attempt is all it takes.";
    } else if (streak.atRisk) {
      message = `Your ${streak.currentStreak}-day streak is at risk! Create something before midnight.`;
    } else if (streak.currentStreak >= 30) {
      message = `${streak.currentStreak} days! You're in deep practice territory.`;
    } else if (streak.currentStreak >= 7) {
      message = `${streak.currentStreak} days strong! Momentum is building.`;
    } else {
      message = `${streak.currentStreak} days and counting. Keep it going!`;
    }

    return NextResponse.json({
      success: true,
      streak: {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        lastPracticeDate: streak.lastPracticeDate,
        atRisk: streak.atRisk,
      },
      message,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CREATIVITY] Streak error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to load streak. Please try again.' },
      { status: 500 }
    );
  }
}
