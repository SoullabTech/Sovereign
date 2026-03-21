export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

interface SaveRequest {
  id?: string;          // Present on update, absent on first save
  memberId: string;
  type: 'song' | 'poem';
  title: string;
  inputEcho: string;
  seed: object;         // Full SongSeed or PoemSeed
  draft: string;        // Current editable text (lyrics or poem body)
}

interface SaveResponse {
  id: string;
  updatedAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SaveRequest;

    if (!body.memberId || !body.type || !body.seed) {
      return NextResponse.json({ error: 'memberId, type, and seed are required' }, { status: 400 });
    }

    if (!['song', 'poem'].includes(body.type)) {
      return NextResponse.json({ error: 'type must be song or poem' }, { status: 400 });
    }

    if (body.id) {
      // Update existing creation — verify ownership first
      const result = await query<{ id: string; updated_at: Date }>(
        `UPDATE member_creations
         SET title = $1, draft = $2, seed = $3, updated_at = NOW()
         WHERE id = $4 AND member_id = $5
         RETURNING id, updated_at`,
        [
          body.title || 'Untitled',
          body.draft || '',
          JSON.stringify(body.seed),
          body.id,
          body.memberId,
        ]
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Creation not found or not owned by member' }, { status: 404 });
      }

      const row = result.rows[0];
      return NextResponse.json({ id: row.id, updatedAt: row.updated_at.toISOString() } as SaveResponse);
    } else {
      // Create new
      const result = await query<{ id: string; updated_at: Date }>(
        `INSERT INTO member_creations (member_id, type, title, input_echo, seed, draft)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, updated_at`,
        [
          body.memberId,
          body.type,
          body.title || 'Untitled',
          body.inputEcho || '',
          JSON.stringify(body.seed),
          body.draft || '',
        ]
      );

      const row = result.rows[0];
      return NextResponse.json({ id: row.id, updatedAt: row.updated_at.toISOString() } as SaveResponse);
    }
  } catch (err) {
    console.error('[POST /api/songwriter/save]', err);
    return NextResponse.json({ error: 'Save failed.' }, { status: 500 });
  }
}
