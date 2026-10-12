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

describe('Proton SMTP convergence at the actual send boundary', () => {
  it('delivers a former practitioner From only as qualified noreply with correct Reply-To', async () => {
    const r = await sendEmail({
      from: 'Kelly <kelly@soullab.life>',
      to: 'one@example.com',
      purpose: 'practitioner:email',
      subject: 'Invitation', text: 'Text',
    });
    expect(r.success).toBe(true);
    expect(mockReserve).toHaveBeenCalledWith('P2', 'one@example.com');
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Soullab <noreply@soullab.life>',
        replyTo: 'kelly@soullab.life',
        to: 'one@example.com',
      })
    );
  });

  it('refuses a legacy unknown sender before metering or contacting SMTP', async () => {
    const r = await sendEmail({
      from: 'Stranger <stranger@external.example>',
      to: 'someone@example.com',
      purpose: 'invite:beta', subject: 'Hi',
    });
    expect(r).toMatchObject({ success: false, failureKind: 'sender_not_authorized' });
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('refuses a spent budget without opening a provider connection', async () => {
    mockReserve.mockResolvedValue({ allowed: false, reason: 'budget_exhausted', degraded: false });
    const r = await sendEmail({
      to: 'someone@example.com', purpose: 'broadcast:update', subject: 'News',
    });
    expect(r).toMatchObject({ success: false, failureKind: 'capacity_refused', retryable: false });
    expect(mockReserve).toHaveBeenCalledWith('P3', 'someone@example.com');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('refuses a missing capacity DB for P2 rather than accidentally sending', async () => {
    mockReserve.mockResolvedValue({ allowed: false, reason: 'capacity_unavailable', degraded: true });
    const r = await sendEmail({
      to: 'client@example.com', purpose: 'practitioner:email', subject: 'Portrait',
    });
    expect(r).toMatchObject({ success: false, failureKind: 'not_configured' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('proves successful P0 goes only through SMTP after reserve', async () => {
    const r = await sendEmail({
      to: 'member@example.com', purpose: 'auth:email-code', subject: 'Code',
    });
    expect(r).toMatchObject({ success: true, id: 'smtp-accepted-proof', priority: 'P0' });
    expect(mockReserve).toHaveBeenCalledWith('P0', 'member@example.com');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
