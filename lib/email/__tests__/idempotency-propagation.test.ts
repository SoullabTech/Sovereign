/**
 * IDEMPOTENCY PROPAGATION — the transport proof.
 *
 * Before 2026-09-04, `sendEmail` accepted an `idempotencyKey` and turned it into
 * a provider TAG and a log field only. It was never sent to the vendor, so a
 * caller could pass one, believe duplicate sends were suppressed, and be wrong.
 *
 * That is exactly the failure a worker-level test cannot see: the reminders
 * worker passes a key, the send succeeds, every assertion above the boundary
 * passes — and the member still gets their own words twice if the vendor is
 * retried. So the assertion belongs HERE, at the point where the request is
 * actually handed to Resend.
 *
 * Spec: docs/specs/SELF-ADDRESSED-RETURN-01_TIER1_SPEC_2026-09-04.md §6.2
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockSend = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

import { ResendProvider } from '../providers/ResendProvider';
import { __setEmailProviderForTests } from '../providers';
import { sendEmail } from '../sendEmail';
import { reminderIdempotencyKey } from '../../reminders/types';

const ENV = { ...process.env };
beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
  process.env = { ...ENV, RESEND_API_KEY: 'test-key' };
  __setEmailProviderForTests(null);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  __setEmailProviderForTests(null);
  jest.restoreAllMocks();
});

function payloadOf(call: unknown[]): Record<string, unknown> {
  return call[0] as Record<string, unknown>;
}

describe('idempotency reaches the vendor, not just the log', () => {
  it('ResendProvider sends Idempotency-Key when the boundary carries one', async () => {
    const provider = new ResendProvider();
    await provider.send({
      from: 'a@soullab.life',
      to: 'b@example.com',
      subject: 's',
      text: 't',
      idempotencyKey: 'self-addressed-return/abc',
    });

    const headers = payloadOf(mockSend.mock.calls[0]).headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('self-addressed-return/abc');
  });

  it('omits the header entirely when no key is supplied', async () => {
    const provider = new ResendProvider();
    await provider.send({ from: 'a@soullab.life', to: 'b@example.com', subject: 's', text: 't' });

    const headers = (payloadOf(mockSend.mock.calls[0]).headers ?? {}) as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeUndefined();
  });

  it('does not clobber caller headers', async () => {
    const provider = new ResendProvider();
    await provider.send({
      from: 'a@soullab.life',
      to: 'b@example.com',
      subject: 's',
      text: 't',
      headers: { 'X-Entity-Ref-ID': 'ref' },
      idempotencyKey: 'k',
    });

    const headers = payloadOf(mockSend.mock.calls[0]).headers as Record<string, string>;
    expect(headers['X-Entity-Ref-ID']).toBe('ref');
    expect(headers['Idempotency-Key']).toBe('k');
  });

  it('sendEmail propagates its idempotencyKey all the way to the vendor request', async () => {
    // The end-to-end assertion. This is the one that would have caught the
    // original defect, where the key stopped at the tag layer.
    await sendEmail({
      to: 'b@example.com',
      subject: 'The note you asked us to send you',
      text: 'my own words',
      purpose: 'reminder:self-addressed',
      idempotencyKey: reminderIdempotencyKey('11111111-2222-3333-4444-555555555555'),
    });

    const headers = payloadOf(mockSend.mock.calls[0]).headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe(
      'self-addressed-return/11111111-2222-3333-4444-555555555555',
    );
  });

  it('the reminder key is stable and derived, never random', () => {
    const a = reminderIdempotencyKey('abc');
    const b = reminderIdempotencyKey('abc');
    expect(a).toBe(b);
    expect(a).toBe('self-addressed-return/abc');
  });
});
