/**
 * Post-withdrawal, read-only index of a member's own manuscripts.
 * No participant's Work becomes available to someone else by being listed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { authenticatedPostWithdrawalMember } from '@/lib/writersStudio/betaPostWithdrawalCustody';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const CACHE = { 'Cache-Control': 'no-store' };
export async function GET(request: NextRequest) {
  try {
    const admission = await authenticatedPostWithdrawalMember(request);
    if (admission.kind === 'refused') {
      return NextResponse.json({ error:'custody_unavailable' }, {status:admission.status,headers:CACHE});
    }
    const rows = await query<{ id: string; title: string | null; created_at: string }>(
      `SELECT id, title, created_at
         FROM member_manuscripts
        WHERE member_id = $1 ORDER BY created_at DESC, id DESC LIMIT 250`,
      [admission.memberId],
    );
    return NextResponse.json({
      manuscripts: rows.rows.map(row=>({
        id:row.id,title:row.title,createdAt:row.created_at,
      })),
      hasMore:rows.rows.length===250,
    }, {headers:CACHE});
  } catch {
    return NextResponse.json({ error:'custody_temporarily_unavailable' }, {status:503,headers:CACHE});
  }
}
