// Customer-facing membership confirmation / receipt email.
//
// Fires from the Stripe webhook AFTER a confirmed membership activation. Idempotency is
// the tier-TRANSITION gate (isPaidActivation): a Stripe retry of the same event sees the
// tier already set (prior === new) → no transition → no second email. No table/migration.
//
// Privacy (deliberate): includes ONLY plan, amount, date, and the account email —
// no card details, no Stripe customer/subscription IDs.

import { sendEmail, type SendEmailResult } from '@/lib/email/sendEmail';

const PAID_TIERS = ['personal', 'pro'] as const;

/**
 * True when this represents a REAL activation into a paid tier — a tier transition, not a
 * webhook retry of an already-applied event. This is the confirmation email's idempotency
 * gate AND its "fires only after confirmed activation" gate.
 */
export function isPaidActivation(
  priorTier: string | null | undefined,
  newTier: string | null | undefined
): boolean {
  if (!newTier || !(PAID_TIERS as readonly string[]).includes(newTier)) return false;
  return priorTier !== newTier;
}

const TIER_LABEL: Record<string, string> = { personal: 'Personal', pro: 'Pro' };

function formatAmount(amountCents: number | null | undefined, currency: string): string {
  if (amountCents == null) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}

export interface MembershipConfirmationParams {
  to: string;
  name?: string;
  tier: string; // 'personal' | 'pro'
  interval: 'month' | 'year';
  amountCents: number | null;
  currency?: string;
  activatedAt?: Date;
}

/**
 * Send the membership confirmation. Returns the typed sendEmail result; never throws.
 * Caller should gate on isPaidActivation() so this only fires on a real activation.
 */
export async function sendMembershipConfirmation(p: MembershipConfirmationParams): Promise<SendEmailResult> {
  const label = TIER_LABEL[p.tier] ?? p.tier;
  const cadence = p.interval === 'year' ? 'annual' : 'monthly';
  const plan = `${label} (${cadence})`;
  const amount = formatAmount(p.amountCents, p.currency ?? 'usd');
  const amountDisplay = amount ? `${amount} / ${p.interval === 'year' ? 'year' : 'month'}` : '';
  const date = (p.activatedAt ?? new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const greeting = p.name ? `Hi ${p.name},` : 'Hi,';

  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#999;font-size:14px;">${k}</td><td style="padding:6px 0;color:#333;font-size:14px;">${v}</td></tr>`;

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#333;">
  <h1 style="font-size:20px;color:#251F33;margin:0 0 8px;">Your membership is active</h1>
  <p style="font-size:15px;line-height:1.6;">${greeting}</p>
  <p style="font-size:15px;line-height:1.6;">Thank you for supporting Soullab. Your <strong>${plan}</strong> membership is now active.</p>
  <table style="border-collapse:collapse;margin:20px 0;">
    ${row('Plan', plan)}
    ${amountDisplay ? row('Amount', amountDisplay) : ''}
    ${row('Date', date)}
    ${row('Account', p.to)}
  </table>
  <p style="font-size:14px;line-height:1.6;"><a href="https://soullab.life/maia/membership" style="color:#B8860B;">Manage your membership</a></p>
  <p style="font-size:13px;color:#999;margin-top:28px;">With presence,<br/>The Soullab Team</p>
</div>`.trim();

  const text = [
    greeting,
    '',
    `Thank you for supporting Soullab. Your ${plan} membership is now active.`,
    '',
    `Plan: ${plan}`,
    amountDisplay ? `Amount: ${amountDisplay}` : '',
    `Date: ${date}`,
    `Account: ${p.to}`,
    '',
    'Manage your membership: https://soullab.life/maia/membership',
    '',
    'With presence,',
    'The Soullab Team',
  ]
    .filter(line => line !== '')
    .join('\n');

  return sendEmail({
    to: p.to,
    from: 'Soullab <noreply@soullab.life>',
    subject: `Your Soullab ${label} membership is active`,
    html,
    text,
    context: 'membership-confirmation',
  });
}
