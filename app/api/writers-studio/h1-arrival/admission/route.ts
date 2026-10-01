import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { h1AdmissionResponse } from '@/lib/access/h1ArrivalAccess';

/**
 * H1-COHORT-GATE-01 · the Studio's only source of H1 admission truth.
 *
 * Answers `{ admitted: boolean }` for the VERIFIED session member, and nothing
 * else. A signed-out or unverifiable request gets 401 `{ admitted: false }`.
 * Never cached: admission is per member and may change with configuration.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  const { status, body } = h1AdmissionResponse(memberId);
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
