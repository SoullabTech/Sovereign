export const dynamic = 'force-dynamic';

/**
 * Orientation API
 *
 * GET - Check if member has completed safety orientation
 * POST - Mark orientation as completed
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[CONTRIBUTIONS] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const suppliedMemberId = searchParams.get('memberId');

    // ACTOR from the verified session; `?memberId=` is a redundant echo only.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedMemberId && suppliedMemberId !== memberId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    const result = await safeQuery(
      `SELECT orientation_completed, level, accepted_count
       FROM contribution_levels
       WHERE member_id = $1`,
      [memberId]
    );

    if (result.error) {
      return NextResponse.json({
        orientationCompleted: false,
        level: 0,
        acceptedCount: 0,
        message: 'Contributions system not yet initialized',
      });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({
        orientationCompleted: false,
        level: 0,
        acceptedCount: 0,
      });
    }

    const row = result.rows[0];
    return NextResponse.json({
      orientationCompleted: row.orientation_completed as boolean,
      level: row.level as number,
      acceptedCount: row.accepted_count as number,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] Orientation check error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to check orientation status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId: suppliedMemberId } = body as { memberId?: string };

    // ACTOR from the verified session. This UPSERT marks a SAFETY orientation
    // complete; on a supplied id it could be set for a member who never saw it.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedMemberId && suppliedMemberId !== memberId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    // Upsert orientation completion
    const result = await safeQuery(
      `INSERT INTO contribution_levels (member_id, orientation_completed, orientation_completed_at)
       VALUES ($1, true, NOW())
       ON CONFLICT (member_id)
       DO UPDATE SET
         orientation_completed = true,
         orientation_completed_at = NOW()
       RETURNING member_id, orientation_completed, level`,
      [memberId]
    );

    if (result.error) {
      return NextResponse.json(
        { error: 'Contributions system not yet initialized' },
        { status: 500 }
      );
    }

    const row = result.rows[0];
    console.log(`[CONTRIBUTIONS] Orientation completed for member: ${memberId}`);

    return NextResponse.json({
      success: true,
      memberId: row.member_id,
      orientationCompleted: row.orientation_completed,
      level: row.level,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] Orientation completion error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to complete orientation' },
      { status: 500 }
    );
  }
}
