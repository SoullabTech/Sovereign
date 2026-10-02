// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * EARLY-FIELD-01 — the server's answer to "may this member meet the early
 * Living Field instrument?" (see lib/access/earlyFieldAccess.ts).
 *
 * The member is whoever the SESSION says it is. getMemberIdFromRequest reads
 * the session cookie (or session-token header) and REJECTS a claimed
 * x-member-id / maia_member_id that disagrees with it — so one member cannot
 * borrow another's admission by presenting their id. Nothing from the query,
 * the body or client state enters the decision.
 *
 * The answer is a boolean and nothing else: no cohort size, no ids, no reason.
 * Refusal is not an occasion to disclose.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { canEnterEarlyField } from '@/lib/access/earlyFieldAccess';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ admitted: false }, { status: 401, headers: { 'cache-control': 'no-store' } });
  }
  return NextResponse.json(
    { admitted: canEnterEarlyField(memberId) },
    { headers: { 'cache-control': 'no-store' } },
  );
}
