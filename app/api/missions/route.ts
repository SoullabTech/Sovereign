import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getSessionUserId } from '@/lib/auth/session-utils';
import { Mission, Milestone } from '@/lib/story/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/missions - List all missions for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT * FROM missions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const missions: Mission[] = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      status: row.status,
      house: row.house,
      relatedPlanets: row.related_planets || [],
      relatedSign: row.related_sign,
      identifiedDate: row.identified_date,
      startedDate: row.started_date,
      completedDate: row.completed_date,
      targetDate: row.target_date,
      progress: row.progress || 0,
      milestones: row.milestones || [],
      relatedChapterId: row.related_chapter_id,
      relatedThreadIds: row.related_thread_ids || [],
      relatedSessionIds: row.related_session_ids || [],
      transitContext: row.transit_context,
      createdAt: row.created_at,
      lastUpdated: row.updated_at,
    }));

    return NextResponse.json({ missions });
  } catch (error) {
    console.error('[Missions] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/missions - Create a new mission
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      house,
      status = 'emerging',
      relatedPlanets = [],
      relatedSign,
      targetDate,
      transitContext,
      milestones = [],
    } = body;

    // Validate required fields
    if (!title || !description || !house) {
      return NextResponse.json(
        { error: 'Title, description, and house are required' },
        { status: 400 }
      );
    }

    // Transform milestones to include IDs
    const milestonesWithIds: Milestone[] = milestones
      .filter((m: { title: string }) => m.title?.trim())
      .map((m: { title: string; notes?: string }) => ({
        id: crypto.randomUUID(),
        title: m.title,
        completed: false,
        notes: m.notes || undefined,
      }));

    const result = await query(
      `INSERT INTO missions (
        user_id, title, description, status, house,
        related_planets, related_sign, target_date,
        transit_context, milestones, progress
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        title,
        description,
        status,
        house,
        relatedPlanets.length > 0 ? relatedPlanets : null,
        relatedSign || null,
        targetDate ? new Date(targetDate) : null,
        transitContext ? JSON.stringify(transitContext) : null,
        JSON.stringify(milestonesWithIds),
        0, // Initial progress
      ]
    );

    const row = result.rows[0];
    const mission: Mission = {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      status: row.status,
      house: row.house,
      relatedPlanets: row.related_planets || [],
      relatedSign: row.related_sign,
      identifiedDate: row.identified_date,
      startedDate: row.started_date,
      completedDate: row.completed_date,
      targetDate: row.target_date,
      progress: row.progress || 0,
      milestones: row.milestones || [],
      relatedChapterId: row.related_chapter_id,
      relatedThreadIds: row.related_thread_ids || [],
      relatedSessionIds: row.related_session_ids || [],
      transitContext: row.transit_context,
      createdAt: row.created_at,
      lastUpdated: row.updated_at,
    };

    return NextResponse.json({ mission }, { status: 201 });
  } catch (error) {
    console.error('[Missions] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create mission' },
      { status: 500 }
    );
  }
}
