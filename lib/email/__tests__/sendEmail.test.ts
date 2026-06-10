/**
 * Central sendEmail() — contract: ALWAYS checks result.error, NEVER throws.
 *
 * The bug this closes: Resend reports API failures (unverified domain, auth) as a returned
 * `result.error`, not a thrown exception — so a caller that ignores result.error treats them
 * as success. These tests pin that the wrapper surfaces it.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockSend = jest.fn<(args: unknown) => Promise<unknown>>();
jest.mock('resend', () => ({
  // new Resend(key) -> instance whose emails.send is our mock
  Resend: class {
    emails = { send: mockSend };
    constructor(_key: string) {}
  },
}));

import { sendEmail } from '@/lib/email/sendEmail';

describe('sendEmail — always checks result.error, never throws', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockReset();
    process.env = { ...OLD_ENV, RESEND_API_KEY: 'test_key' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('success → { ok: true, id }', async () => {
    mockSend.mockResolvedValue({ data: { id: 'abc123' }, error: null });
    const r = await sendEmail({ to: 'a@b.com', subject: 's', html: 'h', context: 't' });
    expect(r).toEqual({ ok: true, id: 'abc123' });
  });

  it('Resend API error → { ok: false, reason: api_error } (THE silent-failure bug)', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'The soullab.life domain is not verified.' } });
    const r = await sendEmail({ to: 'a@b.com', subject: 's', html: 'h' });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('api_error');
    expect(r.error).toMatch(/not verified/i);
  });

  it('send throws → { ok: false, reason: exception } — never throws to caller', async () => {
    mockSend.mockRejectedValue(new Error('network down'));
    await expect(
      sendEmail({ to: 'a@b.com', subject: 's', html: 'h' })
    ).resolves.toMatchObject({ ok: false, reason: 'exception' });
  });

  it('missing RESEND_API_KEY → { ok: false, reason: not_configured }, no send attempted', async () => {
    delete process.env.RESEND_API_KEY;
    const r = await sendEmail({ to: 'a@b.com', subject: 's', html: 'h' });
    expect(r).toMatchObject({ ok: false, reason: 'not_configured' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('passes from / headers / tags through to Resend', async () => {
    mockSend.mockResolvedValue({ data: { id: 'x' }, error: null });
    await sendEmail({
      to: 'a@b.com',
      from: 'Soullab Team <team@soullab.life>',
      subject: 's',
      html: 'h',
      headers: { 'List-Unsubscribe': '<https://soullab.life/team/notifications>' },
      tags: [{ name: 'type', value: 'dm' }],
      context: 'team-notify',
    });
    const arg = mockSend.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.from).toBe('Soullab Team <team@soullab.life>');
    expect(arg.headers).toBeDefined();
    expect(arg.tags).toBeDefined();
  });
});
