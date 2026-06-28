export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/start
 *
 * Create a new scribe session with the specified container type.
 * Returns the session with consent_status='pending'.
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertOne, queryOne } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

export async function POST(request: NextRequest) {
  try {
    // Auth: Get member ID from session
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      container = 'solo',
      participants = [],
      memoryPolicy = 'sealed',
      bookingId,
      clientId,
      keepLinkPrivate = false,
    } = body;

    // Validate container
    if (!['solo', 'witness', 'practitioner'].includes(container)) {
      return NextResponse.json(
        { error: 'Invalid container type', code: 'INVALID_CONTAINER' },
        { status: 400 }
      );
    }

    // Relationship Memory v1 — Phase 1: attach the session to an existing person.
    // Sealed sessions MAY carry the client link (operational provenance, spec §4);
    // only the stricter-sanctuary "keep even the client link private" opt-out blocks it.
    // Fail closed on ownership: the link is stored only when the client belongs to this
    // practitioner (practitioner_clients.practitioner_id references members(id)), so a
    // foreign or bogus clientId can never attach (cross-practitioner safeguard).
    let clientLink: string | null = null;
    if (clientId && !keepLinkPrivate) {
      const owned = await queryOne<{ id: string }>(
        'SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2',
        [clientId, memberId]
      );
      if (owned) {
        clientLink = owned.id;
      } else {
        console.warn(
          `[RelMem] attach rejected: client ${String(clientId).slice(0, 8)} not owned by member ${memberId.slice(0, 8)}`
        );
      }
    }

    // Create session
    const session = await insertOne('scribe_sessions', {
      member_id: memberId,
      container,
      participants: JSON.stringify(participants),
      memory_policy: memoryPolicy,
      consent_status: 'pending',
      is_active: true,
      transcript_enabled: false,
      ...(bookingId ? { booking_id: bookingId } : {}),
      ...(clientLink ? { client_id: clientLink } : {}),
    });

    console.log(`[Scribe] Started ${container} session: ${session.id} for member ${memberId}${bookingId ? ` (booking: ${bookingId})` : ''}`);
    // Phase 1 observability — see spec §6/§10. linkStored=false when solo, skipped,
    // stricter-sanctuary, or ownership-rejected.
    console.log(
      `[RelMem] attach { sessionId: ${String(session.id).slice(0, 8)}, clientIdPrefix: ${clientLink ? clientLink.slice(0, 8) : 'none'}, memoryPolicy: ${memoryPolicy}, keepLinkPrivate: ${Boolean(keepLinkPrivate)}, linkStored: ${Boolean(clientLink)} }`
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        container: session.container,
        startedAt: session.started_at,
        consentStatus: session.consent_status,
        clientId: clientLink,
        linkStored: Boolean(clientLink),
      },
      consentRequired: true,
    });
  } catch (error: any) {
    console.error('[Scribe] Start session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start session', code: 'START_FAILED' },
      { status: 500 }
    );
  }
}
