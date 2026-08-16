export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * POST /api/elemental-alchemy/practices/complete
 * Save a practice completion to the database
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId: suppliedUserId,
      practiceId,
      element,
      durationSeconds,
      stepsCompleted,
      totalSteps,
      impactRating,
      reflectionSaved = false,
      spiralogicFacet,
      journeyContext,
    } = body;

    // ACTOR from the verified session only. Before 2026-08-16 this handler took
    // its actor from body.userId — actor and subject were the same client-supplied
    // field, so a caller needed nothing but a member id to write a completion
    // attributed to anyone. Decided BEFORE any member-data access.
    const userId = await getMemberIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedUserId && suppliedUserId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    if (!practiceId) {
      return NextResponse.json(
        { success: false, error: 'practiceId is required' },
        { status: 400 }
      );
    }

    if (!pool) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const result = await pool.query(
      `INSERT INTO ea_practice_completions (
        user_id,
        practice_id,
        element,
        duration_seconds,
        steps_completed,
        total_steps,
        impact_rating,
        reflection_saved,
        spiralogic_facet,
        journey_context
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, completed_at`,
      [
        userId,
        practiceId,
        element || null,
        durationSeconds || 0,
        stepsCompleted || 0,
        totalSteps || 0,
        impactRating || null,
        reflectionSaved,
        spiralogicFacet || null,
        journeyContext || null,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        completedAt: result.rows[0].completed_at,
      },
    });
  } catch (error) {
    console.error('[practices/complete] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save practice completion' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/elemental-alchemy/practices/complete?userId=...
 * Get practice completion stats for a user
 */
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const suppliedUserId = searchParams.get('userId');

    // ACTOR from the verified session. `?userId=` is a redundant echo of the
    // caller and never establishes identity.
    const userId = await getMemberIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedUserId && suppliedUserId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    if (!pool) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Get completion stats
    const statsResult = await pool.query(
      `SELECT
        practice_id,
        element,
        completion_count,
        total_duration_seconds,
        avg_impact,
        last_completed
      FROM ea_practice_stats
      WHERE user_id = $1`,
      [userId]
    );

    // Get total stats
    const totalsResult = await pool.query(
      `SELECT
        COUNT(DISTINCT practice_id) as unique_practices,
        COUNT(*) as total_completions,
        SUM(duration_seconds) as total_duration_seconds,
        AVG(impact_rating)::NUMERIC(3,2) as avg_impact
      FROM ea_practice_completions
      WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        practices: statsResult.rows,
        totals: totalsResult.rows[0] || {
          unique_practices: 0,
          total_completions: 0,
          total_duration_seconds: 0,
          avg_impact: null,
        },
      },
    });
  } catch (error) {
    console.error('[practices/complete] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch practice stats' },
      { status: 500 }
    );
  }
}
