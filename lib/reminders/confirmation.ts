/**
 * Scheduling confirmation — the PRE-DELIVERY cancellation surface.
 *
 * Tier 1 is a ONE-SHOT act: one delivery_at, one delivered_at. So a cancel link
 * that appears only inside the reminder email arrives at the same moment as the
 * thing it would cancel — too late to be evidence that the member could stop the
 * act before it happened (founder review, 2026-09-04, point 3).
 *
 * The member therefore has two pre-delivery routes, and this file is one:
 *
 *   1. the authenticated list — GET /api/reminders, DELETE /api/reminders/[id]
 *   2. this confirmation email, carrying the tokenised link, sent at CREATION
 *
 * It confirms what they scheduled and when, and nothing else. It does not
 * encourage, reassure, congratulate, or comment on the choice — the member
 * scheduled something; we are telling them we heard it correctly.
 */

import { sendEmail, SENDERS } from '@/lib/email/sendEmail';

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);
}

export async function sendSchedulingConfirmation(opts: {
  to: string;
  memberId: string;
  reminderId: string;
  deliveryAt: Date;
  deliveryText: string;
  cancelUrl: string;
  listUrl: string;
}): Promise<boolean> {
  const when = opts.deliveryAt.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const text = [
    `We'll send you this on ${when}:`,
    '',
    opts.deliveryText,
    '',
    `Cancel it: ${opts.cancelUrl}`,
    `All your reminders: ${opts.listUrl}`,
  ].join('\n');

  const html = `<div style="font:16px/1.65 system-ui,sans-serif;max-width:34rem;color:#2b2b2b">
  <p style="color:#7a7a7a;font-size:14px;margin:0 0 1.5rem">We'll send you this on ${escapeHtml(when)}:</p>
  <div style="white-space:pre-wrap;border-left:2px solid #b9a06a;padding-left:1rem">${escapeHtml(opts.deliveryText)}</div>
  <p style="color:#7a7a7a;font-size:13px;margin:1.5rem 0 0">
    <a href="${opts.cancelUrl}" style="color:#7a7a7a">Cancel it</a> ·
    <a href="${opts.listUrl}" style="color:#7a7a7a">All your reminders</a>
  </p>
</div>`;

  const result = await sendEmail({
    to: opts.to,
    from: SENDERS.default,
    subject: 'Your reminder is set',
    text,
    html,
    purpose: 'reminder:self-addressed-confirmation',
    // Distinct from the delivery key: confirming and delivering are two sends,
    // and one must never suppress the other at the vendor.
    idempotencyKey: `self-addressed-return-confirmation/${opts.reminderId}`,
    triggerType: 'route',
    triggerRef: 'api/reminders POST',
    memberId: opts.memberId,
  });

  return result.success;
}
