export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { canEnterLivingFieldR2 } from '@/lib/access/livingFieldR2Access';

/** Server-authoritative presentation admission. Returns no cohort metadata. */
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json(
      { admitted: false },
      { status: 401, headers: { 'cache-control': 'no-store' } },
    );
  }
  return NextResponse.json(
    { admitted: canEnterLivingFieldR2(memberId) },
    { headers: { 'cache-control': 'no-store' } },
  );
}
