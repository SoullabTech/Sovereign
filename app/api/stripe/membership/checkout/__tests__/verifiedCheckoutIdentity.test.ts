/**
 * No actual Stripe account or payment. Verifies customer metadata/URLs solely
 * through a mocked Checkout Session adapter. Legacy pricing unchanged.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockSessionMember = jest.fn<(...args: unknown[]) => Promise<string | null>>();
const mockStripeCreate = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockSessionMember(...args),
}));
jest.mock('@/lib/stripe/config', () => ({
  isStripeConfigured: jest.fn(() => true),
  getStripe: () => ({
    checkout: { sessions: { create: (...args: unknown[]) => mockStripeCreate(...args) } },
  }),
}));
import { POST } from '../route';
const actor = '11111111-1111-4111-8111-111111111111';
const victim = '22222222-2222-4222-8222-222222222222';
const req = (input: Record<string, unknown>) => new NextRequest(
  'https://soullab.life/api/stripe/membership/checkout', {
    method: 'POST', headers: { 'content-type': 'application/json',
      origin: 'https://attacker.example.invalid' }, body: JSON.stringify(input),
  }
);
beforeEach(() => {
  mockSessionMember.mockReset();
  mockStripeCreate.mockReset();
  mockSessionMember.mockResolvedValue(actor);
  mockStripeCreate.mockResolvedValue({
    id: 'cs_synthetic_fixture', url: 'https://checkout.stripe.com/c/pay/fixture',
  });
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('GANESHA–PRO G1: paid subscription cannot be assigned by client-supplied memberId', () => {
  it('refuses absent session before any Stripe API operation', async () => {
    mockSessionMember.mockResolvedValue(null);
    const response = await POST(req({ tier: 'pro', memberId: actor }));
    expect(response.status).toBe(401);
    expect(mockStripeCreate).not.toHaveBeenCalled();
  });
  it('refuses forged memberId before any Stripe API operation', async () => {
    const response = await POST(req({ tier: 'pro', memberId: victim }));
    expect(response.status).toBe(403);
    expect(mockStripeCreate).not.toHaveBeenCalled();
  });
  it('refuses attacker-selected Stripe return URLs and customer email', async () => {
    for (const extra of [
      { successUrl: 'https://evil.invalid/checkout' },
      { cancelUrl: 'https://evil.invalid/cancel' },
      { memberEmail: 'victim@example.invalid' },
    ]) {
      const response = await POST(req({ tier: 'personal', memberId: actor, ...extra }));
      expect(response.status).toBe(400);
    }
    expect(mockStripeCreate).not.toHaveBeenCalled();
  });
  it('binds checkout metadata to verified actor and retains legacy price', async () => {
    const response = await POST(req({ tier: 'personal', interval: 'month', memberId: actor }));
    expect(response.status).toBe(200);
    expect(mockStripeCreate).toHaveBeenCalledTimes(1);
    const options = mockStripeCreate.mock.calls[0][0] as Record<string,any>;
    expect(options.metadata.memberId).toBe(actor);
    expect(options.subscription_data.metadata.memberId).toBe(actor);
    expect(options.line_items[0].price_data.unit_amount).toBe(1200);
    expect(options).not.toHaveProperty('customer_email');
    expect(options.success_url).toContain('/maia/membership?success=true&tier=personal');
    expect(options.success_url).not.toContain('evil.invalid');
  });
  it('derives actor even if legacy caller omits redundant memberId field', async () => {
    const response = await POST(req({ tier: 'pro', interval: 'year' }));
    expect(response.status).toBe(200);
    const options = mockStripeCreate.mock.calls[0][0] as Record<string,any>;
    expect(options.metadata.memberId).toBe(actor);
    expect(options.line_items[0].price_data.unit_amount).toBe(35000);
  });
  it('refuses unrecognized billing intervals before Stripe call', async () => {
    const response = await POST(req({ tier: 'personal', memberId: actor, interval: 'hour' }));
    expect(response.status).toBe(400);
    expect(mockStripeCreate).not.toHaveBeenCalled();
  });
});
