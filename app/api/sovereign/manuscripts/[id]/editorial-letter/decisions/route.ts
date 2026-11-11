/**
 * WS-RELATIONAL-ARCHITECTURE step 2 — POST the writer's own decision on one place in MAIA's letter: intended | later | cleared.
 * ⛔ Only the member's request writes here. ⛔ Fails closed in Sanctuary (keep gate). ⛔ The place must exist in a letter that is theirs.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { keepGate } from '@/lib/sanctuary/keepGate';
import { recordDecision } from '@/lib/writersStudio/letter/letterStore';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DECISIONS = new Set(['intended', 'later', 'cleared']);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  const gate = await keepGate(memberId, body);
  if (gate) return gate;
  const { letterId, placeId, decision } = body;
  if (typeof letterId !== 'string' || !UUID.test(letterId) || typeof placeId !== 'string' || placeId.length === 0 || placeId.length > 200
    || typeof decision !== 'string' || !DECISIONS.has(decision)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const out = await recordDecision(memberId, id, letterId, placeId, decision as 'intended' | 'later' | 'cleared');
  if (!out.ok) return NextResponse.json({ refusal: out.refusal }, { status: 404 });
  return NextResponse.json({ ok: true, persisted: true });
}
