export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/capture/[id]/promote
 *
 * The member's explicit keep act: "MAIA may remember/reference this."
 *
 * Creates a registry entry in member_memory_atoms pointing at the capture.
 * Capture content is never decrypted or copied — see promoteCapture().
 *
 * There is no automatic promotion anywhere in this system. A capture existing
 * is not authority to remember it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { promoteCapture } from '@/lib/capture/sessionCapture';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    let title: string | undefined;
    try {
      const body = await request.json();
      if (typeof body?.title === 'string') title = body.title;
    } catch {
      // Title is optional; an L0-only label is used when absent.
    }

    const result = await promoteCapture(id, memberId, { title });

    return NextResponse.json({
      success: true,
      captureId: result.capture.id,
      atomId: result.atomId,
      alreadyPromoted: result.alreadyPromoted,
      // Stated explicitly so callers cannot assume a content copy was made.
      registryOnly: true,
    });
  } catch (error: any) {
    if (error?.message === 'CAPTURE_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Capture not found', code: 'CAPTURE_NOT_FOUND' },
        { status: 404 }
      );
    }
    console.error('[capture] promote failed:', error?.message);
    return NextResponse.json(
      { error: 'Failed to promote capture', code: 'PROMOTE_FAILED' },
      { status: 500 }
    );
  }
}
