export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { revokeArtifact } from '@/lib/circles/sharingService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sharedId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const { sharedId } = await params;
    await revokeArtifact(sharedId, memberId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }
    console.error('[Circles] POST /api/circles/shared/[sharedId]/revoke error:', error);
    return NextResponse.json({ error: 'Failed to revoke' }, { status: 500 });
  }
}
