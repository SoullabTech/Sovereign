export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { shareArtifactSchema } from '@/lib/circles/types';
import { shareArtifact } from '@/lib/circles/sharingService';

export async function POST(request: NextRequest) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const body = shareArtifactSchema.parse(await request.json());

    const shared = await shareArtifact({
      circleId: body.circleId,
      memberId,
      artifactType: body.artifactType,
      artifactRef: body.artifactRef,
      contentMode: body.contentMode,
      sharedTitle: body.sharedTitle ?? null,
      sharedSummary: body.sharedSummary ?? null,
      sharedText: body.sharedText ?? null,
    });

    return NextResponse.json({ shared }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error?.message === 'CONSENT_REQUIRED') {
      return NextResponse.json({ error: 'Sharing consent required' }, { status: 403 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('[Circles] POST /api/circles/shared error:', error);
    return NextResponse.json({ error: 'Failed to share artifact' }, { status: 500 });
  }
}
