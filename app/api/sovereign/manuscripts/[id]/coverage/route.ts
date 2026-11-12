/**
 * WS-RELATIONAL-ARCHITECTURE step 1 — the coverage map, served: what MAIA has read of this draft and whether it is still current.
 *
 * The step-1 commit (5fabecf025) shipped the derivation (lib/manuscript/development/coverageMap.ts), the client and the UI, but not
 * this route, so every coverage request answered 404 and the coverage line never appeared (EA walk 2026-11-11).
 *
 * Read-only. The member's own draft and readings only (ownership is in every predicate of loadCoverage). ⛔ No prose in or out:
 * ids, states, lens names and times. 409 when the draft is not established, which the client reads as "nothing to show yet".
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { loadCoverage } from '@/lib/manuscript/development/coverageMap';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, x-member-id, x-session-token' };

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers: privateHeaders });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404, headers: privateHeaders });
  try {
    const out = await loadCoverage(id, memberId);
    if (!out.ok) return NextResponse.json({ refusal: out.refusal }, { status: 409, headers: privateHeaders });
    return NextResponse.json({ coverage: out.coverage }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: 'coverage_unavailable' }, { status: 503, headers: privateHeaders });
  }
}
