/**
 * STELLIUM SESSION API - Single Session
 *
 * Operations on a single session including MAIA integration
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  updateSession,
  cancelSession,
  storeMaiaPrep,
  getSessionContext,
  markFollowUpSent,
  getClientJourney,
} from '@/lib/stellium/sessions';
import { requirePractitioner } from '@/lib/auth/getCurrentPractitioner';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/stellium/sessions/[id]
 * Get a single session with optional context
 *
 * Query params:
 * - practitionerId: required
 * - context: if 'true', include MAIA context (client history, themes)
 * - journey: if 'true', include full client journey
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const auth = await requirePractitioner(request);
    if ('error' in auth) return auth.error;
    const scope = {
      memberId: auth.identity.memberId,
      practitionerRecordId: auth.identity.practitionerId,
    };
    const { id: sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Get base session first
    const session = await getSession(scope, sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Return full MAIA context if requested
    if (searchParams.get('context') === 'true') {
      const context = await getSessionContext(scope, sessionId);
      return NextResponse.json(context);
    }

    // Return full client journey if requested
    if (searchParams.get('journey') === 'true' && session.client_id) {
      const journey = await getClientJourney(scope, session.client_id);
      return NextResponse.json({
        session,
        journey,
      });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('[Stellium Session API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/stellium/sessions/[id]
 * Update a session
 *
 * Body can include:
 * - practitionerId: required
 * - maiaPrep: store MAIA's session preparation
 * - markFollowUpSent: mark follow-up as sent
 * - ...other session fields
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requirePractitioner(request);
    if ('error' in auth) return auth.error;
    const scope = {
      memberId: auth.identity.memberId,
      practitionerRecordId: auth.identity.practitionerId,
    };
    const { id: sessionId } = await params;
    const body = await request.json();
    const {
      practitionerId: _ignoredPractitionerId,
      maiaPrep,
      markFollowUpSent: sendFollowUp,
      ...updateData
    } = body;

    // Store MAIA's session prep
    if (maiaPrep) {
      await storeMaiaPrep(scope, sessionId, maiaPrep);
      const session = await getSession(scope, sessionId);
      return NextResponse.json({ success: true, session });
    }

    // Mark follow-up as sent
    if (sendFollowUp) {
      await markFollowUpSent(scope, sessionId);
      const session = await getSession(scope, sessionId);
      return NextResponse.json({ success: true, session });
    }

    // Regular update
    const session = await updateSession(scope, sessionId, updateData);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('[Stellium Session API] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stellium/sessions/[id]
 * Cancel a session
 *
 * Query params:
 * - practitionerId: required
 * - reason: optional cancellation reason
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requirePractitioner(request);
    if ('error' in auth) return auth.error;
    const scope = {
      memberId: auth.identity.memberId,
      practitionerRecordId: auth.identity.practitionerId,
    };
    const { id: sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get('reason') || undefined;

    const success = await cancelSession(scope, sessionId, reason);

    if (!success) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      action: 'cancelled',
    });
  } catch (error) {
    console.error('[Stellium Session API] Cancel error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel session' },
      { status: 500 }
    );
  }
}
