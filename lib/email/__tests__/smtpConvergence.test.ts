/** The real sendEmail crossing, with network and capacity substituted by witnesses. */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockReserve = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('../capacity', () => ({
  ...jest.requireActual<typeof import('../capacity')>('../capacity'),
  reserveEmailCapacity: (...args: unknown[]) => mockReserve(...args),
}));
jest.mock('../ledger', () => ({
  openAttempt: jest.fn(async () => 'synthetic-attempt'),
  settleAttempt: jest.fn(async () => undefined),
  stateForFailure: jest.fn(() => 'refused'),
}));

import { sendEmail } from '../sendEmail';
import { __setEmailProviderForTests } from '../providers';
import { openAttempt } from '../ledger';

const mockSend = jest.fn<(...args: unknown[]) => Promise<any>>();
const fakeSMTP = {
  name: 'smtp',
  isConfigured: () => true,
  send: (...args: unknown[]) => mockSend(...args),
};

beforeEach(() => {
  mockReserve.mockReset();
  mockSend.mockReset();
  mockReserve.mockResolvedValue({ allowed: true, degraded: false });
  mockSend.mockResolvedValue({ accepted: true, providerMessageId: 'smtp-accepted-proof' });
  __setEmailProviderForTests(fakeSMTP);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('MAIL-04 central SMTP recipient authorization', () => {
  it('refuses unregistered auth purposes rather than granting protected P0', async () => {
    const r = await sendEmail({
      admission: { authority: { kind: 'system', trigger: 'unreviewed-job' }, destination: 'configured' },
      to: 'member@example.com', purpose: 'auth:unreviewed-special', subject: 'test',
    });
    expect(r).toMatchObject({ success: false, providerCode: 'mail_purpose_unregistered' });
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('refuses requests missing caller authority before provider and capacity', async () => {
    const r = await sendEmail({
      to: 'arbitrary@example.com', purpose: 'invite:beta', subject: 'test',
    });
    expect(r).toMatchObject({
      success: false, providerCode: 'mail_admission_missing',
    });
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('refuses an anonymous caller targeting a request-supplied recipient', async () => {
    const r = await sendEmail({
      admission: { authority: { kind: 'anonymous' }, destination: 'request-supplied' },
      to: 'arbitrary@example.com', purpose: 'invite:beta', subject: 'test',
    });
    expect(r).toMatchObject({
      success: false, providerCode: 'mail_admission_anonymous_caller_chose_destination',
    });
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('does not let an anonymous sender pose as identity claim for bulk mail', async () => {
    const r = await sendEmail({
      admission: { authority: { kind: 'anonymous' }, destination: 'identity-claim' },
      to: 'arbitrary@example.com', purpose: 'broadcast:update', subject: 'test',
    });
    expect(r).toMatchObject({
      success: false, providerCode: 'mail_admission_identity_claim_not_permitted_for_purpose',
    });
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe('Proton SMTP convergence at the actual send boundary', () => {
  it('never places a clear gift passkey or email in SMTP tags or durable attempts', async () => {
    const original = process.env.EMAIL_LEDGER_FINGERPRINT_KEY;
    process.env.EMAIL_LEDGER_FINGERPRINT_KEY = 'q'.repeat(64);
    try {
      const unsafe = 'invite:bead:private-gift-passkey-user@example.com';
      const logs = jest.spyOn(console, 'log').mockImplementation(() => {});
      const r = await sendEmail({
      admission: { authority: { kind: 'admin', actorId: 'synthetic-test' }, destination: 'actor-supplied' },
        from: 'Soullab <noreply@soullab.life>',
        to: 'member@example.com',
        purpose: 'invite:bead',
        idempotencyKey: unsafe,
        subject: 'Gift',
        text: 'A private gift',
      });
      expect(r.success).toBe(true);
      const payload = mockSend.mock.calls[0][0] as {
        tags: Array<{ name: string; value: string }>,
      };
      expect(JSON.stringify(payload.tags)).not.toContain('private-gift-passkey');
      expect(JSON.stringify(payload.tags)).not.toContain('user@example.com');
      const attempt = (openAttempt as jest.Mock).mock.calls.at(-1)?.[0] as { idempotencyKey?: string };
      expect(attempt.idempotencyKey).toMatch(/^hmac-v1:[a-f0-9]{64}$/);
      expect(JSON.stringify(attempt)).not.toContain('private-gift-passkey');
      expect(JSON.stringify(logs.mock.calls)).not.toContain('private-gift-passkey');
    } finally {
      if (original === undefined) delete process.env.EMAIL_LEDGER_FINGERPRINT_KEY;
      else process.env.EMAIL_LEDGER_FINGERPRINT_KEY = original;
    }
  });

  it('delivers a former practitioner From only as qualified noreply with correct Reply-To', async () => {
    const r = await sendEmail({
      admission: { authority: { kind: 'admin', actorId: 'synthetic-test' }, destination: 'actor-supplied' },
      from: 'Kelly <kelly@soullab.life>',
      to: 'one@example.com',
      purpose: 'practitioner:email',
      subject: 'Invitation', text: 'Text',
    });
    expect(r.success).toBe(true);
    expect(mockReserve).toHaveBeenCalledWith('P2', 'one@example.com');
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Soullab Studio <noreply@soullab.life>',
        replyTo: 'kelly@soullab.life',
        to: 'one@example.com',
      })
    );
  });

  it('refuses a legacy unknown sender before metering or contacting SMTP', async () => {
    const r = await sendEmail({
      admission: { authority: { kind: 'admin', actorId: 'synthetic-test' }, destination: 'actor-supplied' },
      from: 'Stranger <stranger@external.example>',
      to: 'someone@example.com',
      purpose: 'invite:beta', subject: 'Hi',
    });
    expect(r).toMatchObject({ success: false, failureKind: 'sender_not_authorized' });
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('cannot promote broadcast traffic into protected P0 reserve', async () => {
    const r = await sendEmail({
      admission: { authority: { kind: 'admin', actorId: 'synthetic-test' }, destination: 'actor-supplied' },
      purpose: 'broadcast:update', priority: 'P0',
      to: 'member@example.com', subject: 'bulk',
    });
    expect(r.success).toBe(false);
    expect(r.providerCode).toBe('mail_priority_refused');
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('refuses a spent budget without opening a provider connection', async () => {
    mockReserve.mockResolvedValue({ allowed: false, reason: 'budget_exhausted', degraded: false });
    const r = await sendEmail({
      admission: { authority: { kind: 'admin', actorId: 'synthetic-test' }, destination: 'actor-supplied' },
      to: 'someone@example.com', purpose: 'broadcast:update', subject: 'News',
    });
    expect(r).toMatchObject({ success: false, failureKind: 'capacity_refused', retryable: false });
    expect(mockReserve).toHaveBeenCalledWith('P3', 'someone@example.com');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('refuses a missing capacity DB for P2 rather than accidentally sending', async () => {
    mockReserve.mockResolvedValue({ allowed: false, reason: 'capacity_unavailable', degraded: true });
    const r = await sendEmail({
      admission: { authority: { kind: 'admin', actorId: 'synthetic-test' }, destination: 'actor-supplied' },
      to: 'client@example.com', purpose: 'practitioner:email', subject: 'Portrait',
    });
    expect(r).toMatchObject({ success: false, failureKind: 'not_configured' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('proves successful P0 goes only through SMTP after reserve', async () => {
    const r = await sendEmail({
      admission: { authority: { kind: 'anonymous' }, destination: 'identity-claim' },
      to: 'member@example.com', purpose: 'auth:email-code', subject: 'Code',
    });
    expect(r).toMatchObject({ success: true, id: 'smtp-accepted-proof', priority: 'P0' });
    expect(mockReserve).toHaveBeenCalledWith('P0', 'member@example.com');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
