// Production requires force-dynamic for database access
export const dynamic = 'force-static';

/**
 * Creativity Stats API
 * GET /api/creativity/stats - Get member's creativity stats
 *
 * Query params:
 * - memberId: string (required)
 *
 * Returns attempt counts, outlier count, and quality ratings.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAttemptStats,
  getStreakInfo,
  getOrCreateJourney,
  getMemberAchievements,
} from '@/lib/creativity/service';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ success: true, stats: {}, streak: null, journey: {}, achievements: [] });
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

    const [stats, streak, journey, achievements] = await Promise.all([
      getAttemptStats(memberId),
      getStreakInfo(memberId),
      getOrCreateJourney(memberId),
      getMemberAchievements(memberId),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      streak,
      journey: {
        currentStage: journey.currentStage,
        completedStages: journey.completedStages,
        unlockedFeatures: journey.unlockedFeatures,
      },
      achievements: achievements.map(a => ({
        type: a.achievementType,
        key: a.achievementKey,
        earnedAt: a.earnedAt,
      })),
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CREATIVITY] Stats error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to load stats. Please try again.' },
      { status: 500 }
    );
  }
}
