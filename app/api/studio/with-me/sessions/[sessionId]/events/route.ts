export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

type Params = { params: Promise<{ sessionId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const facilitatorId = await getMemberIdFromRequest(req);
  if (!facilitatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.json();
  const { event_type, elemental_phase, spiral_position, source = 'facilitator', payload = {}, confidence, member_id } = body;

  if (!event_type) return NextResponse.json({ error: 'event_type required' }, { status: 400 });

  const result = await query(
    `INSERT INTO session_events
       (session_id, facilitator_id, member_id, event_type, elemental_phase, spiral_position, source, payload, confidence)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      sessionId,
      facilitatorId,
      member_id ?? null,
      event_type,
      elemental_phase ?? null,
      spiral_position ?? null,
      source,
      JSON.stringify(payload),
      confidence ?? null,
    ],
  );

  return NextResponse.json({ event: result.rows[0] }, { status: 201 });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { sessionId } = await params;
  const result = await query(
    `SELECT * FROM session_events
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId],
  );
  return NextResponse.json({ events: result.rows });
}
