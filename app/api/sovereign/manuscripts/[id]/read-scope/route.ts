/**
 * WS-WORK-CONTINUITY · B — the member's own gesture: grant or revoke MAIA's standing
 * permission to read this Work in conversation. GET returns the derived state.
 * ⛔ Nothing is inferred and there is no default: absent events mean "no grant".
 * ⛔ Not part of the Ask route's import graph (it writes scope events; the Ask route only reads them).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { appendScopeEvent } from '@/lib/disclosure/workReadScopeWrite';
import { loadScopeEvents } from '@/lib/disclosure/workReadScopeRead';
import { activeGrant } from '@/lib/manuscript/ask/workReadScope';

async function workOf(manuscriptId: string, memberId: string): Promise<string | null> {
  const r = await query<{ living_work_id: string }>(
    `SELECT e.living_work_id FROM living_work_expressions e
       JOIN member_manuscripts m ON m.id = e.expression_id
      WHERE e.expression_type = 'manuscript' AND e.expression_id = $1 AND m.member_id = $2 LIMIT 1`,
    [manuscriptId, memberId]);
  return r.rows[0]?.living_work_id ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const workId = await workOf(id, memberId);
  if (!workId) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const g = activeGrant(await loadScopeEvents(memberId, workId));
  return NextResponse.json({ scope: g ? { level: g.level } : null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const workId = await workOf(id, memberId);
  if (!workId) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ refusal: 'malformed' }, { status: 400 }); }
  const b = (body ?? {}) as Record<string, unknown>;
  if (b.action === 'revoke') {
    await appendScopeEvent({ memberId, livingWorkId: workId, event: 'revoke', level: null });
    return NextResponse.json({ scope: null });
  }
  if (b.action === 'grant' && (b.level === 'chapter' || b.level === 'work')) {
    await appendScopeEvent({ memberId, livingWorkId: workId, event: 'grant', level: b.level });
    return NextResponse.json({ scope: { level: b.level } });
  }
  return NextResponse.json({ refusal: 'malformed', detail: 'action must be grant(level chapter|work) or revoke' }, { status: 400 });
}
