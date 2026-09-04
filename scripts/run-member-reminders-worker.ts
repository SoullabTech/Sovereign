#!/usr/bin/env tsx
/**
 * SELF-ADDRESSED-RETURN-01 · Tier 1 — delivery worker
 *
 * ALMOST STUPID BY DESIGN. It finds reminders the member scheduled, sends the
 * words the member approved, and marks them delivered. That is the whole job.
 *
 * What it must NOT do, and what refusal R32 proves it cannot:
 *
 *   - ask whether the member has returned recently
 *   - suppress a send because they were here yesterday
 *   - reason about, adapt, or rewrite the member's text
 *   - call a model
 *
 * Suppression-on-return is absence-reading wearing a kind face (ruling F3). If
 * the member said Tuesday at 9, Tuesday at 9 is sufficient authority.
 *
 * THE ONE PERMITTED SECOND LOOKUP (spec §6.4): due-selection reads
 * member_reminders alone — three predicates, one table, no JOIN. Delivery then
 * performs exactly one further lookup, `SELECT email FROM members WHERE id = $1`
 * — the delivery ADDRESS for a member already determined to be due. That seam is
 * identity and delivery address only. Session recency, activity, last-seen,
 * return state and engagement are refused, whatever table they live in.
 *
 * Usage: npx tsx scripts/run-member-reminders-worker.ts
 */

import { query, closePool } from '../lib/db/postgres';
import { sendEmail, SENDERS } from '../lib/email/sendEmail';
import { reminderIdempotencyKey, type ReminderFailureCode } from '../lib/reminders/types';
import {
  CancelSecretUnavailableError,
  deriveCancelToken,
  isCancelSecretConfigured,
} from '../lib/reminders/cancelToken';

const POLL_INTERVAL_MS = 60_000;
const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 3;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soullab.life';

interface DueReminder {
  id: string;
  member_id: string;
  delivery_text: string;
  delivery_deadline: Date;
  created_at: Date;
  delivery_attempts: number;
  cancel_token_version: number;
}

/**
 * THE ONLY QUERY THE WORKER MAY RUN AGAINST member_reminders FOR SELECTION.
 * Three predicates, one table, no JOIN, no subquery. This is R32's primary
 * evidence — widening it is the diff a hostile fork would need.
 */
async function findDue(): Promise<DueReminder[]> {
  const res = await query<DueReminder>(
    `SELECT id, member_id, delivery_text, delivery_deadline, created_at,
            delivery_attempts, cancel_token_version
       FROM member_reminders
      WHERE delivery_at <= now()
        AND cancelled_at IS NULL
        AND delivered_at IS NULL
      ORDER BY delivery_at
      LIMIT $1`,
    [BATCH_SIZE],
  );
  return res.rows;
}

async function recordFailure(id: string, code: ReminderFailureCode, terminal: boolean) {
  if (terminal) {
    await query(
      `UPDATE member_reminders
          SET delivered_at = NULL,
              delivery_attempts = delivery_attempts + 1,
              failed_at = now(),
              failure_code = $2
        WHERE id = $1`,
      [id, code],
    );
    // A failure is reported AS a failure — never absorbed into "the system is
    // being sacred" (canon: sacred refusal vs system failure).
    console.error(`[reminders] terminal failure { id: ${id}, code: ${code} }`);
    return;
  }
  await query(
    `UPDATE member_reminders
        SET delivered_at = NULL,
            delivery_attempts = delivery_attempts + 1
      WHERE id = $1`,
    [id],
  );
  console.warn(`[reminders] retryable failure { id: ${id}, code: ${code} }`);
}

function buildBody(text: string, authoredAt: Date, cancelUrl: string, listUrl: string) {
  const authored = authoredAt.toISOString().slice(0, 10);
  // The member's words, plus provenance and controls. Nothing else: no
  // greeting generated about them, no framing, no warmth manufactured around
  // what they wrote. No elapsed time, no notice of absence, no concern.
  const plain = [
    'You asked us to send you this.',
    '',
    text,
    '',
    `— you wrote this on ${authored}`,
    '',
    `Cancel this reminder: ${cancelUrl}`,
    `Your reminders: ${listUrl}`,
  ].join('\n');

  const esc = (s: string) =>
    s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);

  const html = `<div style="font:16px/1.65 system-ui,sans-serif;max-width:34rem;color:#2b2b2b">
  <p style="color:#7a7a7a;font-size:14px;margin:0 0 1.5rem">You asked us to send you this.</p>
  <div style="white-space:pre-wrap;border-left:2px solid #b9a06a;padding-left:1rem">${esc(text)}</div>
  <p style="color:#7a7a7a;font-size:13px;margin:1.5rem 0 0">— you wrote this on ${authored}</p>
  <p style="color:#7a7a7a;font-size:13px;margin:1.5rem 0 0">
    <a href="${cancelUrl}" style="color:#7a7a7a">Cancel this reminder</a> ·
    <a href="${listUrl}" style="color:#7a7a7a">Your reminders</a>
  </p>
</div>`;

  return { plain, html };
}

async function deliver(reminder: DueReminder): Promise<void> {
  // Past the window the member's instruction no longer describes this moment.
  // Silence is the correct outcome: delivering late would substitute the
  // system's judgement ("better late than never") for the member's ("Tuesday
  // at 9"). Spec §6.3.
  if (new Date(reminder.delivery_deadline).getTime() < Date.now()) {
    await recordFailure(reminder.id, 'expired', true);
    return;
  }

  // CLAIM BEFORE SEND — wins the race between concurrent workers. The provider
  // idempotency key below covers the case this cannot: vendor accepted, our
  // write lost.
  const claim = await query<{ id: string }>(
    `UPDATE member_reminders
        SET delivered_at = now()
      WHERE id = $1 AND delivered_at IS NULL AND cancelled_at IS NULL
      RETURNING id`,
    [reminder.id],
  );
  if (claim.rows.length === 0) return; // someone else claimed or member cancelled

  // THE ONE PERMITTED SECOND LOOKUP: one column, one table, WHERE id = $1.
  // Identity and delivery address only — nothing about presence, recency, or
  // engagement is selected, and R32 asserts this exact shape.
  const who = await query<{ email: string | null }>(
    `SELECT email FROM members WHERE id = $1`,
    [reminder.member_id],
  );
  const email = who.rows[0]?.email;
  if (!email) {
    await recordFailure(reminder.id, 'no_recipient', true);
    return;
  }

  // Recomputed from the reminder id and the secret that signed it — never
  // stored. A rotation that retired that key fails CLOSED: a message the member
  // cannot cancel is not one we may deliver.
  let cancelToken: string;
  try {
    cancelToken = deriveCancelToken(reminder.id, reminder.cancel_token_version);
  } catch (err) {
    if (err instanceof CancelSecretUnavailableError) {
      await recordFailure(reminder.id, 'cancel_secret_unavailable', true);
      return;
    }
    throw err;
  }
  const cancelUrl = `${APP_URL}/api/reminders/cancel?t=${encodeURIComponent(cancelToken)}`;
  const listUrl = `${APP_URL}/maia/reminders`;
  const { plain, html } = buildBody(
    reminder.delivery_text,
    new Date(reminder.created_at),
    cancelUrl,
    listUrl,
  );

  const result = await sendEmail({
    to: email,
    from: SENDERS.default,
    subject: 'The note you asked us to send you',
    text: plain,
    html,
    purpose: 'reminder:self-addressed',
    idempotencyKey: reminderIdempotencyKey(reminder.id),
    triggerType: 'worker',
    triggerRef: 'run-member-reminders-worker',
    memberId: reminder.member_id,
  });

  if (result.success) {
    console.log(`[reminders] delivered { id: ${reminder.id} }`);
    return;
  }

  // Typed code only — never the provider's prose, which can echo the payload.
  const code: ReminderFailureCode =
    result.providerErrorName === 'monthly_quota_exceeded'
      ? 'quota_exceeded'
      : result.provider === undefined
        ? 'provider_unconfigured'
        : 'provider_rejected';

  await recordFailure(reminder.id, code, reminder.delivery_attempts + 1 >= MAX_ATTEMPTS);
}

async function tick(): Promise<void> {
  const due = await findDue();
  for (const reminder of due) {
    try {
      await deliver(reminder);
    } catch (err) {
      console.error(`[reminders] unexpected error { id: ${reminder.id} }`, err);
      await recordFailure(reminder.id, 'unknown', reminder.delivery_attempts + 1 >= MAX_ATTEMPTS);
    }
  }
}

async function main() {
  if (!isCancelSecretConfigured()) {
    console.error(
      '[reminders] SELF_ADDRESSED_RETURN_CANCEL_SECRET not configured — refusing to send',
    );
    console.error('[reminders] a message the member cannot cancel is not one we may deliver');
    process.exit(1);
  }
  console.log('[reminders] worker started — absence-blind by construction (R32)');
  let running = true;
  const stop = () => {
    running = false;
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  while (running) {
    try {
      await tick();
    } catch (err) {
      console.error('[reminders] tick failed', err);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  await closePool();
  console.log('[reminders] worker stopped');
}

void main();
