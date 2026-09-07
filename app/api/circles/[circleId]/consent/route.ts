export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { setConsentSchema } from '@/lib/circles/types';
import { setConsent } from '@/lib/circles/consentService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const { circleId } = await params;
    const body = setConsentSchema.parse(await request.json());
    await setConsent(circleId, memberId, body.consentMode);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('[Circles] POST /api/circles/[circleId]/consent error:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}
