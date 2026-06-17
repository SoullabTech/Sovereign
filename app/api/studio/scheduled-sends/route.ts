export const dynamic = 'force-dynamic';

/**
 * SCHEDULED SENDS — Level 2 (email-only).
 * The human authors recipient / subject / body / time and explicitly confirms
 * permission. MAIA sends exactly that email when due (see the cron worker).
 *
 * GET  — list the practitioner's own scheduled + sent rows.
 * POST — author a scheduled send. consent_confirmed is REQUIRED (the warrant);
 *        the route refuses to store a send the human hasn't explicitly permitted.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const MAX_SUBJECT = 300;
const MAX_BODY = 20000;
const MAX_NAME = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const result = await db.query(
      `SELECT id, recipient_email, recipient_name, subject, scheduled_for, consent_confirmed,
              status, sent_at, attempts, last_error, created_at
         FROM scheduled_sends
        WHERE practitioner_id = $1
        ORDER BY (status = 'pending') DESC, scheduled_for DESC
        LIMIT 100`,
      [identity.practitionerId],
    );
    return NextResponse.json({ sends: result.rows });
  } catch (error) {
    console.warn('[scheduled-sends] GET error (table pending?):', error instanceof Error ? error.message : error);
    return NextResponse.json({ sends: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await request.json().catch(() => null);
    const recipientEmail = typeof payload?.recipientEmail === 'string' ? payload.recipientEmail.trim() : '';
    const recipientName = typeof payload?.recipientName === 'string' ? payload.recipientName.trim() : '';
    const subject = typeof payload?.subject === 'string' ? payload.subject.trim() : '';
    const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
    const scheduledForRaw = typeof payload?.scheduledFor === 'string' ? payload.scheduledFor : '';
    const consentConfirmed = payload?.consentConfirmed === true;

    if (!EMAIL_RE.test(recipientEmail)) return NextResponse.json({ error: 'A valid recipient email is required' }, { status: 400 });
    if (recipientName.length > MAX_NAME) return NextResponse.json({ error: 'Recipient name is too long' }, { status: 400 });
    if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    if (subject.length > MAX_SUBJECT) return NextResponse.json({ error: 'Subject is too long' }, { status: 400 });
    if (/[\r\n]/.test(subject) || /[\r\n]/.test(recipientName)) return NextResponse.json({ error: 'Invalid characters in subject or name' }, { status: 400 });
    if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    if (body.length > MAX_BODY) return NextResponse.json({ error: 'Body is too long' }, { status: 400 });

    const scheduledFor = new Date(scheduledForRaw);
    if (isNaN(scheduledFor.getTime())) return NextResponse.json({ error: 'A valid scheduled time is required' }, { status: 400 });
    if (scheduledFor.getTime() < Date.now() - 60_000) return NextResponse.json({ error: 'Scheduled time is in the past' }, { status: 400 });

    // The warrant: MAIA may only send what the human has explicitly authorized.
    if (!consentConfirmed) {
      return NextResponse.json({ error: 'Explicit permission to send is required' }, { status: 400 });
    }

    // Bound the queue: a single author can't flood pending sends.
    const pending = await db.query(
      `SELECT count(*)::int AS n FROM scheduled_sends WHERE practitioner_id = $1 AND status = 'pending'`,
      [identity.practitionerId],
    );
    if ((pending.rows[0]?.n ?? 0) >= 200) {
      return NextResponse.json({ error: 'You have too many pending scheduled sends' }, { status: 429 });
    }

    const result = await db.query(
      `INSERT INTO scheduled_sends
         (practitioner_id, author_member_id, recipient_email, recipient_name, subject, body, scheduled_for, consent_confirmed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, recipient_email, recipient_name, subject, scheduled_for, status, consent_confirmed, created_at`,
      [identity.practitionerId, identity.memberId, recipientEmail, recipientName || null, subject, body, scheduledFor.toISOString()],
    );
    console.log(`[MAIA/scheduled-send] authored { id: ${result.rows[0].id}, practitionerPrefix: ${identity.practitionerId.slice(0, 8)}, scheduledFor: ${scheduledFor.toISOString()} }`);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[scheduled-sends] POST error:', error);
    return NextResponse.json({ error: 'Failed to schedule the send' }, { status: 500 });
  }
}
