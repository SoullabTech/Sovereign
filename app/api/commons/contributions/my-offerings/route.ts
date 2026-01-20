export const dynamic = 'force-static';

/**
 * My Offerings API
 *
 * GET - Get member's own contributions and stats
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Missing memberId parameter' },
        { status: 400 }
      );
    }

    // Get member's contributions
    const contributionsResult = await safeQuery(
      `SELECT
        id, type, status, title, content, tags,
        attribution, when_helpful, when_not,
        created_at, submitted_at, published_at,
        review_notes, usage_count, save_count
      FROM commons_contributions
      WHERE created_by = $1
      ORDER BY
        CASE WHEN status = 'needs_revision' THEN 0
             WHEN status = 'submitted' THEN 1
             WHEN status = 'draft' THEN 2
             WHEN status = 'published' THEN 3
             ELSE 4 END,
        updated_at DESC`,
      [memberId]
    );

    if (contributionsResult.error) {
      return NextResponse.json({
        contributions: [],
        stats: {
          level: 0,
          acceptedCount: 0,
          orientationCompleted: false,
        },
        message: 'Contributions system not yet initialized',
      });
    }

    // Get member's contribution level and stats
    const levelResult = await safeQuery(
      `SELECT level, orientation_completed, accepted_count, endorsed_by
       FROM contribution_levels
       WHERE member_id = $1`,
      [memberId]
    );

    // Get endorser name if applicable
    let endorsedBy: string | undefined;
    if (levelResult.rows.length > 0 && levelResult.rows[0].endorsed_by) {
      const endorserResult = await safeQuery(
        `SELECT preferred_name, name FROM members WHERE id = $1`,
        [levelResult.rows[0].endorsed_by]
      );
      if (endorserResult.rows.length > 0) {
        endorsedBy = (endorserResult.rows[0].preferred_name || endorserResult.rows[0].name) as string;
      }
    }

    const stats = levelResult.rows.length > 0
      ? {
          level: levelResult.rows[0].level as number,
          acceptedCount: levelResult.rows[0].accepted_count as number,
          orientationCompleted: levelResult.rows[0].orientation_completed as boolean,
          endorsedBy,
        }
      : {
          level: 0,
          acceptedCount: 0,
          orientationCompleted: false,
        };

    return NextResponse.json({
      contributions: contributionsResult.rows.map(row => ({
        id: row.id,
        type: row.type,
        status: row.status,
        title: row.title,
        content: row.content,
        tags: row.tags,
        attribution: row.attribution,
        whenHelpful: row.when_helpful,
        whenNot: row.when_not,
        createdAt: row.created_at,
        submittedAt: row.submitted_at,
        publishedAt: row.published_at,
        reviewNotes: row.review_notes,
        usageCount: row.usage_count,
        saveCount: row.save_count,
      })),
      stats,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] My offerings error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
