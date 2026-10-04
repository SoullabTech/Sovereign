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
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { query } from '@/lib/db/postgres';
import {
  representationRefusal,
  maySurfaceRepresentation,
  type PrivacyMode,
} from '@/lib/governance/clientRepresentationGuards';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Resolve the session's client-case consent posture (Client Representation Governance).
// practitioner_sessions.client_id → practitioner_cases.client_id.
async function resolveCasePosture(
  sessionId: string,
  practitionerId: string,
): Promise<Array<{ privacy_mode: PrivacyMode | null; consent_captured_at: Date | null }>> {
  try {
    const r = await query<{ privacy_mode: PrivacyMode | null; consent_captured_at: Date | null }>(
      `SELECT pc.privacy_mode, pc.consent_captured_at
         FROM practitioner_sessions ps
         JOIN practitioner_cases pc ON pc.client_id = ps.client_id
        WHERE ps.id = $1 AND pc.practitioner_id = $2`,
      [sessionId, practitionerId],
    );
    return r.rows;
  } catch {
    return [];
  }
}

// SURFACE GATE: strip maia_prep from a session when the client case does not permit a
// MAIA representation (private, or consent_based without captured consent). maia_prep has
// no per-item crossing flag — it surfaces iff the case permits (crossingAllowed=true), so
// `private` still withholds even an already-written prep (mode-transition edge).
async function gateMaiaPrepSurface(session: any, sessionId: string, practitionerId: string): Promise<any> {
  if (!session || session.maia_prep == null) return session;
  const posture = await resolveCasePosture(sessionId, practitionerId);
  const withheld = posture.some(
    (c) =>
      !maySurfaceRepresentation({
        authorship: 'maia_inferred',
        crossingAllowed: true,
        privacyMode: c.privacy_mode ?? 'private',
        consentCapturedAt: c.consent_captured_at ?? null,
      }),
  );
  return withheld ? { ...session, maia_prep: null } : session;
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
    const { id: sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    // AUTH: identity from the authenticated session ONLY (a query practitionerId is ignored).
    const practitionerId = await getMemberIdFromRequest(request);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    // Get base session first
    const session = await getSession(practitionerId, sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    // SURFACE GATE: withhold maia_prep when the client case does not permit representation.
    const gatedSession = await gateMaiaPrepSurface(session, sessionId, practitionerId);

    // Return full MAIA context if requested
    if (searchParams.get('context') === 'true') {
      const context = await getSessionContext(practitionerId, sessionId);
      return NextResponse.json(context);
    }

    // Return full client journey if requested
    if (searchParams.get('journey') === 'true' && session.client_id) {
      const journey = await getClientJourney(practitionerId, session.client_id);
      return NextResponse.json({
        session: gatedSession,
        journey,
      });
    }

    return NextResponse.json({ session: gatedSession });
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
    const { id: sessionId } = await params;
    // AUTH: identity from the authenticated session ONLY. A body-supplied practitionerId is
    // ignored — closes the side door where any caller could persist a client prep for
    // arbitrary IDs.
    const practitionerId = await getMemberIdFromRequest(request);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { maiaPrep, markFollowUpSent: sendFollowUp, ...updateData } = body;
    delete (updateData as Record<string, unknown>).practitionerId; // never trust a body identity

    // Store MAIA's session prep
    if (maiaPrep) {
      // PERSIST GATE (Client Representation Governance): refuse if the client case does not
      // permit a MAIA representation (private ⇒ none; consent_based ⇒ requires consent).
      const posture = await resolveCasePosture(sessionId, practitionerId);
      for (const c of posture) {
        const refusal = representationRefusal(c.privacy_mode ?? 'private', c.consent_captured_at ?? null);
        if (refusal) {
          return NextResponse.json({ error: refusal.message, code: refusal.code }, { status: 403 });
        }
      }
      await storeMaiaPrep(practitionerId, sessionId, maiaPrep);
      const session = await getSession(practitionerId, sessionId);
      return NextResponse.json({
        success: true,
        session: await gateMaiaPrepSurface(session, sessionId, practitionerId),
      });
    }

    // Mark follow-up as sent
    if (sendFollowUp) {
      await markFollowUpSent(practitionerId, sessionId);
      const session = await getSession(practitionerId, sessionId);
      return NextResponse.json({
        success: true,
        session: await gateMaiaPrepSurface(session, sessionId, practitionerId),
      });
    }

    // Regular update
    const session = await updateSession(practitionerId, sessionId, updateData);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: await gateMaiaPrepSurface(session, sessionId, practitionerId),
    });
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
    const { id: sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    // AUTH: identity from the authenticated session ONLY (a query practitionerId is ignored).
    const practitionerId = await getMemberIdFromRequest(request);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }
    const reason = searchParams.get('reason') || undefined;

    const success = await cancelSession(practitionerId, sessionId, reason);

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
