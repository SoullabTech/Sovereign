export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import { promptForDate } from '@/lib/maia/dailyAnchor';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || '';
  if (!ISO_DATE.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 });
  }

  const prompt = promptForDate(date);

  const result = await query<{ response: string }>(
    `SELECT response FROM member_daily_anchors
     WHERE member_id = $1 AND anchor_date = $2
     LIMIT 1`,
    [member.id, date]
  );

  return NextResponse.json({
    date,
    prompt,
    response: result.rows[0]?.response ?? null,
  });
}

export async function POST(request: NextRequest) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { date, response } = body as { date?: string; response?: string };
  if (!date || !ISO_DATE.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 });
  }
  if (typeof response !== 'string' || response.trim().length === 0) {
    return NextResponse.json({ error: 'response required' }, { status: 400 });
  }

  const trimmed = response.trim().slice(0, 4000);
  const prompt = promptForDate(date);

  await query(
    `INSERT INTO member_daily_anchors (member_id, anchor_date, prompt_shown, response)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (member_id, anchor_date)
     DO UPDATE SET response = EXCLUDED.response, updated_at = NOW()`,
    [member.id, date, prompt, trimmed]
  );

  return NextResponse.json({ ok: true });
}
