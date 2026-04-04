/**
 * Dream Journal API
 *
 * GET  - List member's dream entries (paginated)
 * POST - Record a new dream
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/dreams — list dreams
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const emotion = searchParams.get('emotion');
    const symbol = searchParams.get('symbol');

    let sql = `
      SELECT id, title, content, recorded_at, symbols, archetypes,
             emotion, lucidity, sleep_quality, lunar_phase, metadata,
             created_at, updated_at
      FROM dream_entries
      WHERE member_id = $1
    `;
    const params: unknown[] = [memberId];
    let paramIdx = 2;

    if (emotion) {
      sql += ` AND emotion = $${paramIdx}`;
      params.push(emotion);
      paramIdx++;
    }

    if (symbol) {
      sql += ` AND $${paramIdx} = ANY(symbols)`;
      params.push(symbol);
      paramIdx++;
    }

    sql += ` ORDER BY recorded_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM dream_entries WHERE member_id = $1',
      [memberId]
    );
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    return NextResponse.json({
      success: true,
      dreams: result.rows,
      pagination: { total, limit, offset, hasMore: offset + result.rows.length < total },
    });
  } catch (error) {
    console.error('[Dreams API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load dreams' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dreams — record a new dream
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      symbols = [],
      archetypes = [],
      emotion,
      lucidity = 'unconscious',
      sleep_quality,
      lunar_phase,
      recorded_at,
    } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Dream content is required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO dream_entries
        (member_id, title, content, symbols, archetypes, emotion, lucidity, sleep_quality, lunar_phase, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title, content, recorded_at, symbols, archetypes, emotion, lucidity, sleep_quality, lunar_phase`,
      [
        memberId,
        title?.trim() || null,
        content.trim(),
        symbols,
        archetypes,
        emotion || null,
        lucidity,
        sleep_quality ?? null,
        lunar_phase || null,
        recorded_at ? new Date(recorded_at) : new Date(),
      ]
    );

    return NextResponse.json({
      success: true,
      dream: result.rows[0],
    });
  } catch (error) {
    console.error('[Dreams API] POST error:', error);
    return NextResponse.json({ error: 'Failed to record dream' }, { status: 500 });
  }
}
