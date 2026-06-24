export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

type Params = { params: Promise<{ sessionId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { sessionId } = await params;
  const result = await query(
    `SELECT s.*, COUNT(e.id)::int AS event_count
     FROM with_me_sessions s
     LEFT JOIN session_events e ON e.session_id = s.id
     WHERE s.id = $1
     GROUP BY s.id`,
    [sessionId],
  );
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ session: result.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const facilitatorId = await getMemberIdFromRequest(req);
  if (!facilitatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.json();

  const allowed = [
    'intention', 'elemental_phase', 'spiral_position',
    'facilitator_notes', 'transcript', 'closing_reflection',
    'status', 'synthesis',
  ];

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (key in body) {
      updates.push(`${key} = $${idx++}`);
      values.push(key === 'synthesis' ? JSON.stringify(body[key]) : body[key]);
    }
  }

  if (body.status === 'closed') {
    updates.push(`closed_at = NOW()`);
  }
  if (body.status === 'synthesized') {
    updates.push(`synthesized_at = NOW()`);
  }
  if (body.status === 'complete') {
    updates.push(`completed_at = NOW()`);
  }

  if (updates.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  values.push(sessionId, facilitatorId);
  const result = await query(
    `UPDATE with_me_sessions
     SET ${updates.join(', ')}
     WHERE id = $${idx++} AND facilitator_id = $${idx}
     RETURNING *`,
    values,
  );

  if (!result.rows[0]) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
  return NextResponse.json({ session: result.rows[0] });
}
