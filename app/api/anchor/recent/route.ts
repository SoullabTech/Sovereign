export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';

export async function GET(request: NextRequest) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get('limit') || '30', 10);
  const limit = Math.min(Math.max(Number.isNaN(limitParam) ? 30 : limitParam, 1), 90);

  const result = await query<{
    anchor_date: string;
    prompt_shown: string;
    response: string;
  }>(
    `SELECT anchor_date::text AS anchor_date, prompt_shown, response
     FROM member_daily_anchors
     WHERE member_id = $1
     ORDER BY anchor_date DESC
     LIMIT $2`,
    [member.id, limit]
  );

  return NextResponse.json({ anchors: result.rows });
}
