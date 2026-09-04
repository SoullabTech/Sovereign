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
import {
  beginDispatch,
  claimDue,
  markDelivered,
  recordTerminalFailure,
  releaseDispatch,
  type ClaimedReminder,
} from '../lib/reminders/dispatch';
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
    `Cancel future reminders: ${cancelUrl}`,
    `Your reminders: ${listUrl}`,
  ].join('\n');

  const esc = (s: string) =>
    s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);

  const html = `<div style="font:16px/1.65 system-ui,sans-serif;max-width:34rem;color:#2b2b2b">
  <p style="color:#7a7a7a;font-size:14px;margin:0 0 1.5rem">You asked us to send you this.</p>
  <div style="white-space:pre-wrap;border-left:2px solid #b9a06a;padding-left:1rem">${esc(text)}</div>
  <p style="color:#7a7a7a;font-size:13px;margin:1.5rem 0 0">— you wrote this on ${authored}</p>
  <p style="color:#7a7a7a;font-size:13px;margin:1.5rem 0 0">
    <a href="${cancelUrl}" style="color:#7a7a7a">Manage your reminders</a> ·
    <a href="${listUrl}" style="color:#7a7a7a">All reminders</a>
  </p>
</div>`;

  return { plain, html };
}

async function deliver(reminder: ClaimedReminder): Promise<void> {
  // Recomputed from the reminder id and the key that signed it — never stored.
  // A retired key fails CLOSED: a message the member cannot cancel is not one
  // we may deliver.
  let cancelToken: string;
  try {
    cancelToken = deriveCancelToken(reminder.id, reminder.cancel_token_version);
  } catch (err) {
    if (err instanceof CancelSecretUnavailableError) {
      await recordTerminalFailure(reminder.id, 'cancel_secret_unavailable');
      console.error(`[reminders] terminal failure { id: ${reminder.id}, code: cancel_secret_unavailable }`);
      return;
    }
    throw err;
  }

  // THE ONE PERMITTED SECOND LOOKUP: one column, one table, WHERE id = $1.
  // Identity and delivery address only — nothing about presence, recency, or
  // engagement is selected, and R32-B asserts this exact shape.
  const who = await query<{ email: string | null }>(
    `SELECT email FROM members WHERE id = $1`,
    [reminder.member_id],
  );
  const email = who.rows[0]?.email;
  if (!email) {
    await recordTerminalFailure(reminder.id, 'no_recipient');
    console.error(`[reminders] terminal failure { id: ${reminder.id}, code: no_recipient }`);
    return;
  }

  // ── THE LINEARIZATION POINT ─────────────────────────────────────────────
  // Everything above is reversible. Past this atomic transition the send has
  // begun and cancellation is genuinely too late. Cancellation racing us
  // resolves HERE, one way or the other, never both.
  const dispatch = await beginDispatch(reminder.id, reminder.claim_token);
  if (!dispatch.ok) {
    if (dispatch.reason === 'expired') {
      await recordTerminalFailure(reminder.id, 'expired');
      console.error(`[reminders] terminal failure { id: ${reminder.id}, code: expired }`);
    } else if (dispatch.reason === 'retry_horizon') {
      // Past the provider's idempotency window the outcome is genuinely
      // unknown. Stop rather than gamble on duplicating the member's words.
      await recordTerminalFailure(reminder.id, 'delivery_uncertain');
      console.error(`[reminders] terminal failure { id: ${reminder.id}, code: delivery_uncertain }`);
    } else {
      // cancelled / lost_claim / already_dispatched — all correct outcomes.
      console.log(`[reminders] dispatch declined { id: ${reminder.id}, reason: ${dispatch.reason} }`);
    }
    return;
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
    await markDelivered(reminder.id);
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

  if (reminder.delivery_attempts + 1 >= MAX_ATTEMPTS) {
    await recordTerminalFailure(reminder.id, code);
    console.error(`[reminders] terminal failure { id: ${reminder.id}, code: ${code} }`);
  } else {
    // Walk back to claimable. first_attempt_at is NOT cleared, so the retry
    // horizon still runs from the first attempt.
    await releaseDispatch(reminder.id);
    console.warn(`[reminders] retryable failure { id: ${reminder.id}, code: ${code} }`);
  }
}

async function tick(): Promise<void> {
  const due = await claimDue(BATCH_SIZE);
  for (const reminder of due) {
    try {
      await deliver(reminder);
    } catch (err) {
      console.error(`[reminders] unexpected error { id: ${reminder.id} }`, err);
      if (reminder.delivery_attempts + 1 >= MAX_ATTEMPTS) {
        await recordTerminalFailure(reminder.id, 'unknown');
      } else {
        await releaseDispatch(reminder.id);
      }
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
