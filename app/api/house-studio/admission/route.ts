export const dynamic = 'force-dynamic';

/**
 * H1 — server answer to "may this member use explicit Work-context Studio arrival?"
 * Identity comes only from the verified session. Query/body/client claims do not
 * enter the decision. The response discloses only the boolean answer.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { canUseHouseStudioH1 } from '@/lib/access/houseStudioH1Access';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json(
      { admitted: false },
      { status: 401, headers: { 'cache-control': 'no-store' } },
    );
  }
  return NextResponse.json(
    { admitted: canUseHouseStudioH1(memberId) },
    { headers: { 'cache-control': 'no-store' } },
  );
}
