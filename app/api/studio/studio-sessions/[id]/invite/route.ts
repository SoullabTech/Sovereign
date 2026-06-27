export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO SESSION INVITE — invite a Person to participate in a studio_session.
 *
 * Definition (Kelly, 2026-06-27): an invitation prepares/sends an invite for a Person to
 * participate in a Studio Session. It:
 *   • creates a PENDING participant relationship (an encounter_participant for this session,
 *     consent_status='requested'),
 *   • MAY send a notification later if consent + provider config allow (dispatch is a
 *     separate integration; this route records intent, it does not send yet),
 *   • NEVER admits anyone to the meeting,
 *   • NEVER grants application access (no member account is created or linked here),
 *   • NEVER bypasses consent.
 *
 *   POST { personId? | (displayName?, email?, phone?), roleInEvent?, sendNotification? }
 *
 * Idempotent: inviting the same person/email to the same session returns the existing edge.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id: sessionId } = await params;

    // Verify the session belongs to this practitioner.
    const owns = await db.query(
      `SELECT 1 FROM studio_sessions WHERE id = $1 AND practitioner_id = $2`,
      [sessionId, practitionerId]
    );
    if (owns.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await request.json();

    // Resolve identity from a saved Person, or accept a one-off name/email.
    let displayName = typeof body.displayName === 'string' && body.displayName.trim() ? body.displayName.trim() : null;
    let email = typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null;
    let phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null;
    let personId: string | null = null;
    // Notification consent lives on practitioner_clients.reminder_consent (the recipient),
    // which is NOT in this branch yet — it lands with PR #531. Until then we FAIL CLOSED:
    // this stays false, so no notification is dispatched without verifiable consent.
    const reminderConsent = false;

    if (body.personId) {
      const person = await db.query(
        `SELECT id, name, email, phone
         FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2`,
        [String(body.personId), practitionerId]
      );
      if (person.rows.length === 0) {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }
      const p = person.rows[0];
      personId = p.id;
      displayName = displayName ?? p.name;
      email = email ?? (p.email ? String(p.email).toLowerCase() : null);
      phone = phone ?? p.phone;
    }

    if (!displayName && !email) {
      return NextResponse.json({ error: 'Invite a saved person (personId) or provide a name/email' }, { status: 400 });
    }

    // Idempotency: reuse an existing edge for this session + person/email.
    const existing = await db.query(
      `SELECT id FROM encounter_participants
       WHERE practitioner_id = $1 AND encounter_kind = 'session' AND encounter_id = $2
         AND ( ($3::uuid IS NOT NULL AND person_id = $3) OR ($4::text IS NOT NULL AND email = $4) )
       LIMIT 1`,
      [practitionerId, sessionId, personId, email]
    );
    let participantId: string;
    if (existing.rows.length > 0) {
      participantId = existing.rows[0].id;
    } else {
      participantId = randomUUID();
      await db.query(
        `INSERT INTO encounter_participants
           (id, practitioner_id, encounter_kind, encounter_id, display_name, email, phone,
            participant_role, role_detail, consent_status, person_id)
         VALUES ($1, $2, 'session', $3, $4, $5, $6, 'guest', $7, 'requested', $8)`,
        [
          participantId, practitionerId, sessionId, displayName, email, phone,
          typeof body.roleInEvent === 'string' && body.roleInEvent.trim() ? body.roleInEvent.trim() : null,
          personId, // member_id intentionally left NULL — an invite never grants account access
        ]
      );
    }

    // Notification is OPTIONAL and consent-gated. Dispatch (email/SMS/WhatsApp/calendar) is a
    // separate integration — not wired here, and the consent source isn't in this branch yet,
    // so we never send. Report honest intent rather than a false success.
    const wantsNotification = body.sendNotification === true;

    return NextResponse.json({
      invited: true,
      participantId,
      pending: true, // a pending participant relationship — not admitted, no access granted
      notification: {
        requested: wantsNotification,
        consentAllows: reminderConsent, // false until PR #531 lands reminder_consent
        sent: false,
        reason: wantsNotification
          ? 'fail-closed: notification consent (reminder_consent) unavailable until PR #531'
          : 'not requested',
      },
    });
  } catch (error) {
    console.error('[Studio Session Invite] POST error:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
