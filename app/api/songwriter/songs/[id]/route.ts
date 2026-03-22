export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/songwriter/songs/[id] — load draft ─────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;
  if (!memberId) return NextResponse.json({ error: 'Session required' }, { status: 401 });

  const { id } = await params;

  try {
    const result = await query(
      `UPDATE songs
       SET last_opened_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, memberId]
    );

    if (result.rows.length === 0) {
      // Distinguish 404 vs 403
      const exists = await query('SELECT id FROM songs WHERE id = $1', [id]);
      return NextResponse.json(
        { error: exists.rows.length ? 'Forbidden' : 'Song not found' },
        { status: exists.rows.length ? 403 : 404 }
      );
    }

    return NextResponse.json({ song: result.rows[0] });
  } catch (err) {
    console.error('[GET /api/songwriter/songs/:id]', err);
    return NextResponse.json({ error: 'Failed to load song' }, { status: 500 });
  }
}

// ─── PATCH /api/songwriter/songs/[id] — autosave ─────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;
  if (!memberId) return NextResponse.json({ error: 'Session required' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    // Build partial update — only supplied fields
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    function addField(col: string, val: unknown, asJson = false) {
      if (val !== undefined) {
        setClauses.push(`${col} = $${idx++}`);
        values.push(asJson ? JSON.stringify(val) : val);
      }
    }

    addField('title', body.title);
    addField('lyrics', body.lyrics, true);
    addField('chords', body.chords, true);
    addField('structure', body.structure, true);
    addField('canvas', body.canvas, true);
    addField('meta', body.meta, true);
    addField('seed_payload', body.seedPayload, true);

    if (setClauses.length === 1) {
      // Nothing to update
      return NextResponse.json({ ok: true });
    }

    values.push(id, memberId);
    const ownerIdx = idx++;
    const memberIdx = idx;

    const result = await query(
      `UPDATE songs
       SET ${setClauses.join(', ')}
       WHERE id = $${ownerIdx} AND user_id = $${memberIdx}
       RETURNING id, title, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Song not found or forbidden' }, { status: 404 });
    }

    return NextResponse.json({ song: result.rows[0] });
  } catch (err) {
    console.error('[PATCH /api/songwriter/songs/:id]', err);
    return NextResponse.json({ error: 'Autosave failed' }, { status: 500 });
  }
}
