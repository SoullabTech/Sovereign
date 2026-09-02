export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

/**
 * GET /api/ideas — List the authenticated member's ideas.
 *
 * Ordered by last_entered_at DESC so returned ideas (the ones the member is
 * currently developing) float to the top. Results include block_count and
 * last_block_at for lightweight list previews.
 *
 * Query params:
 *   ?status=active|parked|integrated   (default: exclude integrated + parked)
 *   ?limit=<1..100>                    (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);

    const params: unknown[] = [session.memberId];
    let sql = `
      SELECT
        i.id,
        i.title,
        i.framing,
        i.status,
        i.tags,
        i.created_at,
        i.updated_at,
        i.last_entered_at,
        i.last_decision_at,
        i.seed,
        i.title_source,
        (SELECT COUNT(*)::int FROM member_idea_blocks b WHERE b.idea_id = i.id) AS block_count,
        (SELECT MAX(b.created_at) FROM member_idea_blocks b WHERE b.idea_id = i.id) AS last_block_at
      FROM member_ideas i
      WHERE i.member_id = $1
    `;

    if (statusFilter && ['active', 'parked', 'integrated'].includes(statusFilter)) {
      sql += ` AND i.status = $${params.length + 1}`;
      params.push(statusFilter);
    } else {
      sql += ` AND i.status = 'active'`;
    }

    sql += ` ORDER BY i.last_entered_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      ideas: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('[member-ideas] List failed:', error);
    return NextResponse.json(
      { error: 'Failed to load ideas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ideas — Create a new idea.
 *
 * Body: { title: string, framing?: string }
 * Title is required. Framing is the short anchor description shown below the title.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { title?: unknown; framing?: unknown };
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const framing = typeof body.framing === 'string' ? body.framing.trim() : null;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: 'Title too long (max 200 chars)' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO member_ideas (member_id, title, framing, title_source)
       VALUES ($1, $2, $3, 'member')
       RETURNING id, title, framing, status, tags, created_at, updated_at,
                 last_entered_at, last_decision_at, seed, title_source, proposed_titles`,
      [session.memberId, title, framing || null]
    );

    return NextResponse.json({ success: true, idea: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[member-ideas] Create failed:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}
