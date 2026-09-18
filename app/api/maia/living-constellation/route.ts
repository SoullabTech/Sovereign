/**
 * GET /api/maia/living-constellation
 *
 * LC-02 read-only projection. Authenticated member only.
 * No request parameter may select another member, no semantic relationships
 * are written, and partial source failure is reported rather than concealed.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { buildLivingConstellationProjection } from '@/lib/maia/living-constellation/projection';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  try {
    const projection = await buildLivingConstellationProjection(memberId);
    return NextResponse.json(projection);
  } catch (err) {
    console.error('[living-constellation] read failed', err);
    return NextResponse.json(
      { error: 'Your constellation is unavailable right now.' },
      { status: 500 },
    );
  }
}
