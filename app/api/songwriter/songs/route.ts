export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

// ─── POST /api/songwriter/songs — create draft ────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;
  if (!memberId) return NextResponse.json({ error: 'Session required' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      title = 'Untitled Song',
      seedPrompt,
      seedPayload,
      lyrics,
      chords,
      structure,
      canvas,
      meta,
    } = body;

    const result = await query(
      `INSERT INTO songs
         (user_id, title, seed_prompt, seed_payload, lyrics, chords, structure, canvas, meta, last_opened_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [
        memberId,
        title,
        seedPrompt ?? null,
        seedPayload ? JSON.stringify(seedPayload) : null,
        lyrics ? JSON.stringify(lyrics) : null,
        chords ? JSON.stringify(chords) : null,
        structure ? JSON.stringify(structure) : null,
        canvas ? JSON.stringify(canvas) : null,
        meta ? JSON.stringify(meta) : null,
      ]
    );

    return NextResponse.json({ song: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/songwriter/songs]', err);
    return NextResponse.json({ error: 'Failed to create song draft' }, { status: 500 });
  }
}

// ─── GET /api/songwriter/songs — list drafts ──────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;
  if (!memberId) return NextResponse.json({ error: 'Session required' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const status = searchParams.get('status') ?? 'draft';

  try {
    const result = await query(
      `SELECT id, title, status, seed_prompt, updated_at, last_opened_at, created_at
       FROM songs
       WHERE user_id = $1 AND status = $2
       ORDER BY last_opened_at DESC NULLS LAST, updated_at DESC
       LIMIT $3`,
      [memberId, status, limit]
    );

    return NextResponse.json({ songs: result.rows });
  } catch (err) {
    console.error('[GET /api/songwriter/songs]', err);
    return NextResponse.json({ error: 'Failed to load songs' }, { status: 500 });
  }
}
