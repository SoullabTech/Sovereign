export const dynamic = 'force-static';

/**
 * Review Queue API
 *
 * GET - Get contributions awaiting review (Curator level required)
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

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

async function getCuratorLevel(memberId: string): Promise<number> {
  const result = await safeQuery(
    `SELECT level FROM contribution_levels WHERE member_id = $1`,
    [memberId]
  );

  if (result.error || result.rows.length === 0) {
    return 0;
  }

  return result.rows[0].level as number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curatorId = searchParams.get('curatorId');
    const status = searchParams.get('status'); // 'submitted' | 'flagged' | 'all'
    const type = searchParams.get('type');

    if (!curatorId) {
      return NextResponse.json(
        { error: 'Missing curatorId parameter' },
        { status: 400 }
      );
    }

    // Verify curator level
    const curatorLevel = await getCuratorLevel(curatorId);
    if (curatorLevel < 2) {
      return NextResponse.json(
        { error: 'Curator level required to access review queue' },
        { status: 403 }
      );
    }

    // Build query
    let whereClause = "status IN ('submitted', 'flagged')";
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClause = `status = $${paramIndex++}`;
      params.push(status);
    }

    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    const result = await safeQuery(
      `SELECT
        cc.id, cc.type, cc.status, cc.title, cc.content, cc.tags,
        cc.attribution, cc.when_helpful, cc.when_not,
        cc.submitted_at,
        m.id as author_id, m.name as author_name, m.preferred_name as author_preferred_name,
        COALESCE(cl.level, 0) as author_level,
        COALESCE(cl.accepted_count, 0) as author_accepted_count
      FROM commons_contributions cc
      JOIN members m ON cc.created_by = m.id
      LEFT JOIN contribution_levels cl ON cl.member_id = m.id
      WHERE ${whereClause}
      ORDER BY
        CASE WHEN cc.status = 'flagged' THEN 0 ELSE 1 END,
        cc.submitted_at ASC`,
      params
    );

    if (result.error) {
      return NextResponse.json({
        contributions: [],
        message: 'Contributions system not yet initialized',
      });
    }

    return NextResponse.json({
      contributions: result.rows.map(row => ({
        id: row.id,
        type: row.type,
        status: row.status,
        title: row.title,
        content: row.content,
        tags: row.tags,
        attribution: row.attribution,
        whenHelpful: row.when_helpful,
        whenNot: row.when_not,
        submittedAt: row.submitted_at,
        createdBy: {
          id: row.author_id,
          name: row.author_preferred_name || row.author_name,
          contributorLevel: row.author_level,
          acceptedCount: row.author_accepted_count,
        },
      })),
      counts: {
        submitted: result.rows.filter(r => r.status === 'submitted').length,
        flagged: result.rows.filter(r => r.status === 'flagged').length,
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] Review queue error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to fetch review queue' },
      { status: 500 }
    );
  }
}
