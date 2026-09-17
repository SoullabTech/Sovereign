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
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';

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

    const practitionerRecordId = await getPractitionerIdForMember(memberId);
    if (container === 'practitioner' && !practitionerRecordId) {
      return NextResponse.json(
        { error: 'Practitioner identity is required', code: 'PRACTITIONER_REQUIRED' },
        { status: 403 }
      );
    }

    if (bookingId && keepLinkPrivate) {
      return NextResponse.json(
        { error: 'A booking cannot be attached while the client link is private', code: 'BOOKING_REQUIRES_CLIENT' },
        { status: 409 }
      );
    }

    // A request-supplied client or booking only narrows the authenticated practice.
    // Invalid/foreign IDs are refused rather than silently discarded.
    let clientLink: string | null = null;
    if (clientId && !keepLinkPrivate) {
      if (!practitionerRecordId) {
        return NextResponse.json({ error: 'Client not found', code: 'CLIENT_NOT_FOUND' }, { status: 404 });
      }
      const owned = await queryOne<{ id: string }>(
        'SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2',
        [clientId, practitionerRecordId]
      );
      if (!owned) {
        return NextResponse.json({ error: 'Client not found', code: 'CLIENT_NOT_FOUND' }, { status: 404 });
      }
      clientLink = owned.id;
    }

    let bookingLink: string | null = null;
    if (bookingId) {
      if (!practitionerRecordId) {
        return NextResponse.json({ error: 'Booking not found', code: 'BOOKING_NOT_FOUND' }, { status: 404 });
      }
      const booking = await queryOne<{ id: string; client_id: string | null }>(
        `SELECT id, client_id
           FROM sessions
          WHERE id = $1 AND practitioner_id = $2`,
        [bookingId, practitionerRecordId]
      );
      if (!booking || !booking.client_id || (clientLink && booking.client_id !== clientLink)) {
        return NextResponse.json({ error: 'Booking not found', code: 'BOOKING_NOT_FOUND' }, { status: 404 });
      }
      bookingLink = booking.id;
      clientLink = booking.client_id;
    }

    // Only attach a practice identity when the session is actually bound to the
    // practitioner container or one of that practice's relationship records.
    // A member who also happens to own a practice may still start an ordinary
    // solo session without silently moving it into the practice boundary.
    const boundPractitionerRecordId =
      container === 'practitioner' || clientLink || bookingLink
        ? practitionerRecordId
        : null;

    // Create session
    const session = await insertOne('scribe_sessions', {
      member_id: memberId,
      container,
      participants: JSON.stringify(participants),
      memory_policy: memoryPolicy,
      consent_status: 'pending',
      is_active: true,
      transcript_enabled: false,
      ...(boundPractitionerRecordId ? { practitioner_record_id: boundPractitionerRecordId } : {}),
      ...(bookingLink ? { booking_id: bookingLink } : {}),
      ...(clientLink ? { client_id: clientLink } : {}),
    });

    console.log('[Scribe] Session started', {
      container,
      bookingLinked: Boolean(bookingLink),
    });
    // Phase 1 observability — see spec §6/§10. linkStored=false when solo, skipped,
    // stricter-sanctuary, or ownership-rejected.
    console.log('[RelMem] attach', {
      memoryPolicy,
      keepLinkPrivate: Boolean(keepLinkPrivate),
      linkStored: Boolean(clientLink),
    });

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
