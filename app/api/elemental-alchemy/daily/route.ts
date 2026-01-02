/**
 * DAILY ALCHEMY API ROUTE
 *
 * GET /api/elemental-alchemy/daily?userId=xxx&date=YYYY-MM-DD
 * Get morning/midday/evening teachings for a user
 *
 * Response: { morning, midday, evening }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTodaysAlchemy,
  getDailyAlchemy,
  getWeeklyAlchemyPlan,
  DailyAlchemyType,
} from '@/lib/features/DailyAlchemyService';
import { query } from '@/lib/db/postgres';
import { Element } from '@/lib/consciousness/spiralogic-core';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * GET - Fetch daily teachings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date'); // Optional: YYYY-MM-DD
    const type = searchParams.get('type'); // Optional: morning, midday, evening
    const plan = searchParams.get('plan'); // Optional: 'week' for weekly plan

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Return weekly plan if requested
    if (plan === 'week') {
      const weeklyPlan = await getWeeklyAlchemyPlan(userId, {
        useCurrentFacet: true,
      });

      return NextResponse.json({
        success: true,
        data: {
          plan: weeklyPlan,
        },
      });
    }

    // Get specific type or all three for today
    if (type && ['morning', 'midday', 'evening'].includes(type)) {
      const teaching = await getDailyAlchemy(userId, type as DailyAlchemyType, {
        useCurrentFacet: true,
      });

      // Track view in database
      await trackAlchemyView(userId, teaching);

      return NextResponse.json({
        success: true,
        data: {
          [type]: formatTeaching(teaching),
        },
      });
    }

    // Get all three for today
    const todaysTeachings = await getTodaysAlchemy(userId, {
      useCurrentFacet: true,
    });

    // Track views in database
    await trackAlchemyView(userId, todaysTeachings.morning);
    await trackAlchemyView(userId, todaysTeachings.midday);
    await trackAlchemyView(userId, todaysTeachings.evening);

    return NextResponse.json({
      success: true,
      data: {
        morning: formatTeaching(todaysTeachings.morning),
        midday: formatTeaching(todaysTeachings.midday),
        evening: formatTeaching(todaysTeachings.evening),
        date: new Date().toISOString().split('T')[0],
      },
    });

  } catch (error) {
    console.error('❌ [DAILY ALCHEMY API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch daily teachings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Track time spent with a teaching
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, element, timeSpent } = body;

    if (!userId || !type || !element) {
      return NextResponse.json(
        { error: 'userId, type, and element are required' },
        { status: 400 }
      );
    }

    // Update time spent in most recent view
    await query(
      `
      UPDATE ea_daily_alchemy_views
      SET time_spent_seconds = $1
      WHERE user_id = $2
        AND alchemy_type = $3
        AND element = $4
        AND DATE(viewed_at) = CURRENT_DATE
      ORDER BY viewed_at DESC
      LIMIT 1
      `,
      [timeSpent, userId, type, element]
    );

    return NextResponse.json({
      success: true,
      message: 'Time tracked',
    });

  } catch (error) {
    console.error('❌ [DAILY ALCHEMY API POST] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to track time',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Format teaching for client
 */
function formatTeaching(teaching: any) {
  return {
    type: teaching.type,
    element: teaching.element,
    facetId: teaching.facetId,
    title: teaching.title,
    content: teaching.content,
    practice: teaching.practice,
    reflection: teaching.reflection,
    timestamp: teaching.timestamp,
    dayOfYear: teaching.dayOfYear,
  };
}

/**
 * Helper: Track alchemy view in database
 */
async function trackAlchemyView(userId: string, teaching: any) {
  try {
    await query(
      `
      INSERT INTO ea_daily_alchemy_views (
        user_id,
        alchemy_type,
        element,
        facet,
        day_of_year,
        title,
        content_preview,
        viewed_at,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `,
      [
        userId,
        teaching.type,
        teaching.element,
        teaching.facetId || null,
        teaching.dayOfYear,
        teaching.title,
        teaching.content.substring(0, 200), // Preview
      ]
    );
  } catch (error) {
    // Log but don't fail
    console.error('❌ [DAILY ALCHEMY] Failed to track view:', error);
  }
}
