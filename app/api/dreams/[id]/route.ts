/**
 * Dream Entry API — single dream operations
 *
 * GET    /api/dreams/[id] — fetch one dream
 * PATCH  /api/dreams/[id] — update a dream
 * DELETE /api/dreams/[id] — delete a dream
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// GET /api/dreams/[id]
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    const dream = await queryOne(
      `SELECT id, title, content, recorded_at, symbols, archetypes,
              emotion, lucidity, sleep_quality, lunar_phase, metadata,
              created_at, updated_at
       FROM dream_entries
       WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, dream });
  } catch (error) {
    console.error('[Dreams API] GET [id] error:', error);
    return NextResponse.json({ error: 'Failed to load dream' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/dreams/[id]
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Build SET clause dynamically from provided fields
    const allowedFields: Record<string, string> = {
      title: 'title',
      content: 'content',
      symbols: 'symbols',
      archetypes: 'archetypes',
      emotion: 'emotion',
      lucidity: 'lucidity',
      sleep_quality: 'sleep_quality',
      lunar_phase: 'lunar_phase',
    };

    const sets: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, col] of Object.entries(allowedFields)) {
      if (body[key] !== undefined) {
        sets.push(`${col} = $${idx}`);
        values.push(body[key]);
        idx++;
      }
    }

    if (values.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id, memberId);

    const result = await query(
      `UPDATE dream_entries SET ${sets.join(', ')}
       WHERE id = $${idx} AND member_id = $${idx + 1}
       RETURNING id, title, content, recorded_at, symbols, archetypes, emotion, lucidity, sleep_quality, lunar_phase`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, dream: result.rows[0] });
  } catch (error) {
    console.error('[Dreams API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update dream' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/dreams/[id]
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    const result = await query(
      'DELETE FROM dream_entries WHERE id = $1 AND member_id = $2 RETURNING id',
      [id, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error('[Dreams API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete dream' }, { status: 500 });
  }
}
