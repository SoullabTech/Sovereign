/**
 * THE OUTAGE CONTROL.
 *
 * If a ledger write could fail a send, adding observability would have created a
 * P0 authentication outage: nobody signs in because we cannot record that they are
 * signing in. This suite runs the real send path with EVERY ledger write throwing,
 * and asserts mail still leaves and the caller still gets the truth.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockSend = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

// The database is down for the whole of this suite.
const mockQuery = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

import { sendEmail } from '../../sendEmail';
import { ledgerWriteFailuresTotal, resetLedgerWriteFailures } from '../metrics';

const ENV = { ...process.env };
beforeEach(() => {
  mockSend.mockReset();
  mockQuery.mockReset();
  mockQuery.mockRejectedValue(new Error('ECONNREFUSED: the ledger is down'));
  process.env = { ...ENV, RESEND_API_KEY: 'test-key', EMAIL_LEDGER_FINGERPRINT_KEY: 'a'.repeat(64) };
  resetLedgerWriteFailures();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  jest.restoreAllMocks();
});

const authSend = () =>
  sendEmail({ purpose: 'auth:email-code', to: 'member@example.com', subject: 's', text: 't' });

describe('a ledger outage cannot fail a send', () => {
  it('A P0 AUTH SEND STILL SUCCEEDS with every ledger write throwing', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_1' }, error: null });

    const result = await authSend();

    expect(result.success).toBe(true);
    expect(result.id).toBe('msg_1');
    expect(result.priority).toBe('P0');
    // The mail actually went to the provider — not short-circuited by the outage.
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('a provider refusal is still reported truthfully during a ledger outage', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'monthly_quota_exceeded', message: 'limit reached' },
    });

    const result = await authSend();

    expect(result.success).toBe(false);
    expect(result.failureKind).toBe('quota_exceeded');
    expect(result.providerCode).toBe('monthly_quota_exceeded');
    expect(result.retryable).toBe(false);
    expect(result.ourFault).toBe(true);
  });

  it('the dropped writes are COUNTED, so the loss is never silent', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
    await authSend();
    // Only the open write is attempted: with no row id, settle has nothing to
    // update and does not pretend otherwise.
    expect(ledgerWriteFailuresTotal()).toBeGreaterThan(0);
  });

  it('a settle-only failure still leaves the send truthful', async () => {
    // Insert succeeds, update fails — the row stays 'attempting', which is the
    // detectable uncertainty a boolean column could not have expressed.
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'row-1' }] })
      .mockRejectedValue(new Error('ECONNREFUSED'));
    mockSend.mockResolvedValue({ data: { id: 'msg_2' }, error: null });

    const result = await authSend();

    expect(result.success).toBe(true);
    expect(ledgerWriteFailuresTotal()).toBe(1);
  });

  it('CONTROL: with a healthy ledger, nothing is counted as lost', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 'row-1' }] });
    mockSend.mockResolvedValue({ data: { id: 'msg_3' }, error: null });

    const result = await authSend();

    expect(result.success).toBe(true);
    expect(ledgerWriteFailuresTotal()).toBe(0);
  });

  it('the ledger is opened BEFORE the provider is called', async () => {
    const order: string[] = [];
    mockQuery.mockImplementation(async () => { order.push('ledger'); return { rows: [{ id: 'r' }] }; });
    mockSend.mockImplementation(async () => { order.push('provider'); return { data: { id: 'm' }, error: null }; });

    await authSend();

    // A crash mid-send must leave evidence rather than nothing.
    expect(order[0]).toBe('ledger');
    expect(order[1]).toBe('provider');
  });
});
