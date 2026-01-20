export const dynamic = 'force-dynamic';

/**
 * Commons Contributions API
 *
 * GET - List published contributions (with filters)
 * POST - Create new contribution (draft or submitted)
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// Safety keywords that auto-flag for review
const SAFETY_KEYWORDS = [
  'cure', 'heal', 'guarantee', 'promise',
  'diagnosis', 'disorder', 'treatment',
  'medication', 'supplement', 'dosage',
  'suicide', 'self-harm', 'crisis',
];

function containsSafetyKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => lower.includes(keyword));
}

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

// GET - List published contributions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // prompt, practice, agreement, resource, story
    const element = searchParams.get('element');
    const domain = searchParams.get('domain');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause = "status = 'published'";
    const params: unknown[] = [];
    let paramIndex = 1;

    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    if (element) {
      whereClause += ` AND tags @> $${paramIndex++}::jsonb`;
      params.push(JSON.stringify([{ element }]));
    }

    if (domain) {
      whereClause += ` AND tags @> $${paramIndex++}::jsonb`;
      params.push(JSON.stringify([{ domain }]));
    }

    const result = await safeQuery(
      `SELECT
        cc.id, cc.type, cc.title, cc.content, cc.tags,
        cc.attribution, cc.safety_notes, cc.when_helpful, cc.when_not,
        cc.published_at, cc.usage_count, cc.save_count,
        m.id as author_id, m.name as author_name, m.preferred_name as author_preferred_name
      FROM commons_contributions cc
      JOIN members m ON cc.created_by = m.id
      WHERE ${whereClause}
      ORDER BY cc.published_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    if (result.error) {
      return NextResponse.json(
        { error: 'Contributions system not yet initialized' },
        { status: 503 }
      );
    }

    // Get total count
    const countResult = await safeQuery(
      `SELECT COUNT(*) as total FROM commons_contributions WHERE ${whereClause}`,
      params
    );

    return NextResponse.json({
      contributions: result.rows.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        content: row.content,
        tags: row.tags,
        attribution: row.attribution,
        safetyNotes: row.safety_notes,
        whenHelpful: row.when_helpful,
        whenNot: row.when_not,
        publishedAt: row.published_at,
        usageCount: row.usage_count,
        saveCount: row.save_count,
        author: {
          id: row.author_id,
          name: row.author_preferred_name || row.author_name,
        },
      })),
      total: countResult.rows[0]?.total || 0,
      limit,
      offset,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] GET error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

// POST - Create new contribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      memberId,
      type,
      status, // 'draft' or 'submitted'
      title,
      content,
      tags,
      attribution,
      whenHelpful,
      whenNot,
    } = body;

    if (!memberId || !type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: memberId, type, title, content' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['prompt', 'practice', 'agreement', 'resource', 'story'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate status
    const targetStatus = status === 'submitted' ? 'submitted' : 'draft';

    // Check for safety keywords if submitting
    let finalStatus = targetStatus;
    if (targetStatus === 'submitted' && containsSafetyKeywords(title + ' ' + content)) {
      console.log(`[CONTRIBUTIONS] Auto-flagged for safety keywords: ${title}`);
      finalStatus = 'flagged';
    }

    // Require attribution for practices
    if (type === 'practice' && !attribution && targetStatus === 'submitted') {
      return NextResponse.json(
        { error: 'Attribution is required for practices' },
        { status: 400 }
      );
    }

    // Require "when not" for practices and resources
    if ((type === 'practice' || type === 'resource') && !whenNot && targetStatus === 'submitted') {
      return NextResponse.json(
        { error: `"When not helpful" section is required for ${type}s` },
        { status: 400 }
      );
    }

    const result = await safeQuery(
      `INSERT INTO commons_contributions (
        created_by, type, status, title, content, tags,
        attribution, when_helpful, when_not,
        submitted_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        ${targetStatus === 'submitted' ? 'NOW()' : 'NULL'}
      )
      RETURNING id, type, status, title, created_at, submitted_at`,
      [
        memberId,
        type,
        finalStatus,
        title,
        content,
        JSON.stringify(tags || []),
        attribution || null,
        whenHelpful || null,
        whenNot || null,
      ]
    );

    if (result.error) {
      return NextResponse.json(
        { error: 'Contributions system not yet initialized' },
        { status: 503 }
      );
    }

    const contribution = result.rows[0];
    console.log(`[CONTRIBUTIONS] Created: ${contribution.id} (${contribution.type}, ${contribution.status})`);

    return NextResponse.json({
      success: true,
      contribution: {
        id: contribution.id,
        type: contribution.type,
        status: contribution.status,
        title: contribution.title,
        createdAt: contribution.created_at,
        submittedAt: contribution.submitted_at,
        flagged: finalStatus === 'flagged',
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] POST error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
}
