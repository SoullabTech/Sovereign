export const dynamic = 'force-dynamic';

/**
 * SCHEDULED SENDS — safe self-send test.
 * Sends a test email to the AUTHOR'S OWN address ONLY, immediately, through the
 * same EmailRouter path the worker uses. The only allowed recipient is the
 * authenticated author's own email — so it can verify the loop end-to-end
 * without any risk of reaching another person.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { EmailRouter } from '@/lib/comms/emailRouter';

const FROM_EMAIL = 'updates@soullab.life';

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // The author's own email is the ONLY permitted recipient for the test.
    const who = await db.query(`SELECT email FROM members WHERE id = $1`, [identity.memberId]);
    const selfEmail: string | null = who.rows[0]?.email ?? null;
    if (!selfEmail) return NextResponse.json({ error: 'No email on file for your account' }, { status: 400 });

    // Light rate-limit: one self-test per 30s per practitioner (the test persists a real audited row).
    const recent = await db.query(
      `SELECT 1 FROM scheduled_sends
        WHERE practitioner_id = $1 AND recipient_email = $2 AND created_at > now() - interval '30 seconds'
        LIMIT 1`,
      [identity.practitionerId, selfEmail],
    );
    if (recent.rows.length) return NextResponse.json({ error: 'Please wait a moment before testing again' }, { status: 429 });

    const subject = 'MAIA scheduled-send test';
    const body =
      'This is a test of MAIA’s scheduled email send — sent to you, by you.\n\n' +
      'If you received this, the Level 2 email path works: a human-authored message, to a human-authored recipient, with explicit permission, delivered and audited.';

    // Record it (consent implicit: recipient is self) and send immediately.
    const inserted = await db.query(
      `INSERT INTO scheduled_sends
         (practitioner_id, author_member_id, recipient_email, recipient_name, subject, body, scheduled_for, consent_confirmed)
       VALUES ($1, $2, $3, $4, $5, $6, now(), true)
       RETURNING id`,
      [identity.practitionerId, identity.memberId, selfEmail, identity.practitionerName, subject, body],
    );
    const id = inserted.rows[0].id;

    const router = new EmailRouter(identity.practitionerId);
    const result = await router.send(
      { to: selfEmail, subject, bodyText: body },
      { fromEmail: FROM_EMAIL, fromName: `${identity.practitionerName} via SoulLab` },
    );

    await db.query(
      `UPDATE scheduled_sends
          SET status = $2,
              sent_at = CASE WHEN $2 = 'sent' THEN now() ELSE NULL END,
              attempts = 1, provider = $3, provider_message_id = $4, last_error = $5, updated_at = now()
        WHERE id = $1`,
      [id, result.success ? 'sent' : 'failed', result.provider, result.id ?? null, result.success ? null : (result.error ?? 'send failed')],
    );

    console.log(`[MAIA/scheduled-send] self-test { id: ${id}, success: ${result.success}, provider: ${result.provider} }`);
    return NextResponse.json({
      ok: result.success,
      to: selfEmail,
      provider: result.provider,
      messageId: result.id ?? null,
      error: result.success ? undefined : result.error,
    });
  } catch (error) {
    console.error('[scheduled-sends/test] error:', error);
    return NextResponse.json({ error: 'Self-test failed' }, { status: 500 });
  }
}
