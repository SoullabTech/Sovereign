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

  // NB: this member-initiated own-review returns ALL of the member's anchors
  // regardless of surface_preference — reviewing your own record is not ambient
  // surfacing. surface_preference is included so the member can inspect (and,
  // via POST /api/anchor/[id]/surface-preference, change) each anchor's standing
  // consent to surface ambiently into MAIA's prompt.
  const result = await query<{
    id: string;
    anchor_date: string;
    prompt_shown: string;
    response: string;
    surface_preference: string;
  }>(
    `SELECT id, anchor_date::text AS anchor_date, prompt_shown, response, surface_preference
     FROM member_daily_anchors
     WHERE member_id = $1
     ORDER BY anchor_date DESC
     LIMIT $2`,
    [member.id, limit]
  );

  return NextResponse.json({ anchors: result.rows });
}
