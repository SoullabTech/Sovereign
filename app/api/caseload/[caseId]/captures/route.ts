export const dynamic = 'force-static';

// Required for static export with dynamic routes
export function generateStaticParams() {
  return [{ caseId: 'default' }];
}

/**
 * CASE CAPTURE LINKS API
 *
 * GET  - Get linked capture sessions or unlinked sessions
 * POST - Link a capture session to case
 * DELETE - Unlink a capture session from case
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCaptureLinks,
  linkCaptureSession,
  unlinkCaptureSession,
  getUnlinkedCaptureSessions,
  getCase,
} from '@/lib/caseload/CaseStore';
import { getSession } from '@/lib/capture/captureStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const unlinked = searchParams.get('unlinked') === 'true';

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    // Verify case ownership
    const caseData = await getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (unlinked) {
      // Get unlinked sessions for this practitioner
      const sessions = await getUnlinkedCaptureSessions(memberId, 20);
      return NextResponse.json({ sessions });
    }

    // Get linked sessions with session details
    const links = await getCaptureLinks(caseId);

    // Enrich with session details
    const enrichedLinks = await Promise.all(
      links.map(async (link) => {
        const session = await getSession(link.capture_session_id);
        return { ...link, session };
      })
    );

    return NextResponse.json({ links: enrichedLinks });
  } catch (error) {
    console.error('[CASELOAD] Get captures error:', error);
    return NextResponse.json(
      { error: 'Failed to get capture sessions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await request.json();
    const { memberId, captureSessionId } = body;

    if (!memberId || !captureSessionId) {
      return NextResponse.json(
        { error: 'memberId and captureSessionId are required' },
        { status: 400 }
      );
    }

    // Verify case ownership
    const caseData = await getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Verify capture session exists and belongs to this user
    const captureSession = await getSession(captureSessionId);
    if (!captureSession || captureSession.user_id !== memberId) {
      return NextResponse.json(
        { error: 'Capture session not found or not authorized' },
        { status: 404 }
      );
    }

    // Link the session
    const link = await linkCaptureSession(caseId, captureSessionId, memberId);

    return NextResponse.json({ link });
  } catch (error) {
    console.error('[CASELOAD] Link capture error:', error);
    return NextResponse.json(
      { error: 'Failed to link capture session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await request.json();
    const { memberId, captureSessionId } = body;

    if (!memberId || !captureSessionId) {
      return NextResponse.json(
        { error: 'memberId and captureSessionId are required' },
        { status: 400 }
      );
    }

    // Verify case ownership
    const caseData = await getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Unlink the session
    const success = await unlinkCaptureSession(caseId, captureSessionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CASELOAD] Unlink capture error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink capture session' },
      { status: 500 }
    );
  }
}
