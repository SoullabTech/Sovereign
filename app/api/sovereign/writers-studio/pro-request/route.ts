import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * "Ask about Pro" — step C4 of the Free Studio plan (founder ruling 2026-11-13, design §5.3).
 *
 *   GET   → { asked: boolean }      whether this member has an open request
 *   POST  → { asked: true }         record a request (optional `note`, ≤ 500 chars, the member's own words)
 *
 * The founder answers each request personally. Nothing here grants Pro, shows a price, sends a message, or starts any
 * follow-up. Asking twice keeps one open request. 404 unless WS_PRO_ASK_ENABLED === 'true'. Behind the Writer's Studio
 * corridor, so only admitted members reach it.
 */
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store' };
const enabled = () => process.env.WS_PRO_ASK_ENABLED === 'true';

export async function GET(req: NextRequest) {
  if (!enabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers });
  try {
    const r = await query('SELECT 1 FROM writers_studio_pro_requests WHERE member_id = $1 AND answered_at IS NULL LIMIT 1', [memberId]);
    return NextResponse.json({ asked: r.rows.length === 1 }, { headers });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers });
  }
}

export async function POST(req: NextRequest) {
  if (!enabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers });
  const body = (await req.json().catch(() => ({}))) as { note?: unknown };
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null;
  if (note && note.length > 500) return NextResponse.json({ error: 'Please keep the note under 500 characters.' }, { status: 400, headers });
  try {
    await query(
      `INSERT INTO writers_studio_pro_requests (member_id, note) VALUES ($1, $2)
       ON CONFLICT (member_id) WHERE answered_at IS NULL DO NOTHING`,
      [memberId, note],
    );
    return NextResponse.json({ asked: true }, { headers });
  } catch {
    return NextResponse.json({ error: 'Your request could not be recorded just now. Please try again.' }, { status: 503, headers });
  }
}
