export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function POST(req: NextRequest) {
  const facilitatorId = await getMemberIdFromRequest(req);
  if (!facilitatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { field_slug, member_id, member_name, intention } = body;

  if (!field_slug) return NextResponse.json({ error: 'field_slug required' }, { status: 400 });

  const result = await query(
    `INSERT INTO with_me_sessions
       (field_slug, facilitator_id, member_id, member_name, intention)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [field_slug, facilitatorId, member_id ?? null, member_name ?? null, intention ?? null],
  );

  return NextResponse.json({ session: result.rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const facilitatorId = await getMemberIdFromRequest(req);
  if (!facilitatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const field_slug = searchParams.get('field_slug');

  const result = await query(
    `SELECT
       s.*,
       COUNT(e.id)::int AS event_count
     FROM with_me_sessions s
     LEFT JOIN session_events e ON e.session_id = s.id
     WHERE s.facilitator_id = $1
       ${field_slug ? 'AND s.field_slug = $2' : ''}
     GROUP BY s.id
     ORDER BY s.created_at DESC
     LIMIT 50`,
    field_slug ? [facilitatorId, field_slug] : [facilitatorId],
  );

  return NextResponse.json({ sessions: result.rows });
}
