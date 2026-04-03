export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

/**
 * GET /api/ideas — List captured ideas for the authenticated member
 *
 * Returns ideas from creative_attempts where type='idea', newest first.
 * Supports optional ?status= filter (default: all statuses).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    let sql = `
      SELECT id, title, content_text as description, status, confidence,
             source, capture_mode, conversation_id, created_at, updated_at
      FROM creative_attempts
      WHERE member_id = $1 AND type = 'idea'
    `;
    const params: any[] = [session.memberId];

    if (status) {
      sql += ` AND status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      ideas: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('[idea-field] List failed:', error);
    return NextResponse.json(
      { error: 'Failed to load ideas' },
      { status: 500 }
    );
  }
}
