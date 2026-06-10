/**
 * Membership confirmation email — gating + content/privacy contract.
 * Maps to the required cases: sends on success, not on failed/incomplete, not on retry.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockSendEmail = jest.fn<(args: unknown) => Promise<{ ok: boolean; id?: string }>>();
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (args: unknown) => mockSendEmail(args),
}));

import { isPaidActivation, sendMembershipConfirmation } from '@/lib/email/membershipConfirmation';

describe('isPaidActivation — the idempotency / real-activation gate', () => {
  it('SENDS: free → pro (a real paid activation)', () => {
    expect(isPaidActivation('free', 'pro')).toBe(true);
  });
  it('SENDS: null/none → personal (first activation)', () => {
    expect(isPaidActivation(null, 'personal')).toBe(true);
    expect(isPaidActivation(undefined, 'pro')).toBe(true);
  });
  it('does NOT double-send: pro → pro (Stripe webhook retry, tier already set)', () => {
    expect(isPaidActivation('pro', 'pro')).toBe(false);
  });
  it('does NOT send on a non-paid / incomplete outcome: free → free', () => {
    expect(isPaidActivation('free', 'free')).toBe(false);
    expect(isPaidActivation('free', undefined)).toBe(false);
    expect(isPaidActivation('free', null)).toBe(false);
  });
});

describe('sendMembershipConfirmation — content + privacy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendEmail.mockReset();
    mockSendEmail.mockResolvedValue({ ok: true, id: 'em_1' });
  });

  it('sends through the central sendEmail with the membership-confirmation context', async () => {
    const r = await sendMembershipConfirmation({
      to: 'member@example.com',
      name: 'Sam',
      tier: 'pro',
      interval: 'year',
      amountCents: 24000,
      currency: 'usd',
      activatedAt: new Date('2026-06-10T00:00:00Z'),
    });
    expect(r.ok).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const arg = mockSendEmail.mock.calls[0][0] as Record<string, string>;
    expect(arg.context).toBe('membership-confirmation');
    expect(arg.to).toBe('member@example.com');
    expect(arg.from).toMatch(/soullab\.life/);
    // includes plan, amount, date, account email
    expect(arg.html).toMatch(/Pro \(annual\)/);
    expect(arg.html).toMatch(/\$240/);
    expect(arg.html).toMatch(/member@example\.com/);
    expect(arg.text).toMatch(/Pro \(annual\)/);
  });

  it('NEVER includes sensitive billing details (no card / Stripe ids)', async () => {
    await sendMembershipConfirmation({
      to: 'member@example.com',
      tier: 'personal',
      interval: 'month',
      amountCents: 1200,
      currency: 'usd',
    });
    const arg = mockSendEmail.mock.calls[0][0] as Record<string, string>;
    const blob = `${arg.subject} ${arg.html} ${arg.text}`.toLowerCase();
    expect(blob).not.toMatch(/card|cvc|last4|cus_|sub_|pi_|seti_|stripe/);
  });

  it('omits the amount line gracefully when amount is unavailable', async () => {
    await sendMembershipConfirmation({
      to: 'm@example.com',
      tier: 'pro',
      interval: 'month',
      amountCents: null,
    });
    const arg = mockSendEmail.mock.calls[0][0] as Record<string, string>;
    expect(arg.text).not.toMatch(/Amount:/);
  });
});
