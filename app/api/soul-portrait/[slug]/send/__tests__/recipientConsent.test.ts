import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockAccess = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockGet = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockPublish = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockLive = jest.fn<(...args: unknown[]) => Promise<boolean>>();
const mockRecord = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockRouter = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...a: unknown[]) => mockAccess(...a),
}));
jest.mock('@/lib/soulPortrait/portraitStore', () => ({
  getOwnedPortraitBySlug: (...a: unknown[]) => mockGet(...a),
  publishOwnedPortrait: (...a: unknown[]) => mockPublish(...a),
}));
jest.mock('@/lib/soulPortrait/consentRecord', () => ({
  recordPortraitConsent: (...a: unknown[]) => mockRecord(...a),
}));
jest.mock('@/lib/soulPortrait/consentAccess', () => ({
  isPortraitConsentLive: (...a: unknown[]) => mockLive(...a),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => mockQuery(...a),
}));
jest.mock('@/lib/email/ledger/fingerprint', () => ({
  fingerprintRecipient: jest.fn(() => ({ fingerprint: 'f'.repeat(64), keyVersion: 1 })),
}));
jest.mock('@/lib/comms/emailRouter', () => ({
  EmailRouter: jest.fn().mockImplementation(() => ({
    send: (...a: unknown[]) => mockRouter(...a),
  })),
}));
import { POST } from '../route';
const params = { params: Promise.resolve({ slug: 'portrait-safe-test' }) };
const req = (body: Record<string, unknown>) => new NextRequest(
  'https://soullab.life/api/soul-portrait/portrait-safe-test/send', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  jest.clearAllMocks();
  mockAccess.mockResolvedValue('9ba11e1c-b849-4474-ad10-a788341e4815');
  mockGet.mockResolvedValue({
    id: '620d37e9-afbf-4e52-80c5-5ce9c7aceade',
    subjectIsMinor: false, subjectMemberId: null,
    immutableText: { person: { name: 'Adult subject', isMinor: false } },
  });
  mockPublish.mockResolvedValue({
    slug: 'portrait-safe-test', publishedAt: '2026-10-12T00:00:00Z',
    immutableText: { person: { name: 'Adult subject' } },
  });
  mockLive.mockResolvedValue(true);
  mockRecord.mockResolvedValue({ live: true });
  mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });
  mockRouter.mockResolvedValue({ success: true, id: 'synthetic-smtp-id', provider: 'managed' });
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('F4: email a Soul Portrait only to a specifically attested recipient', () => {
  it('refuses already-live portrait emails without fresh target attestation', async () => {
    const r = await POST(req({ recipientEmail: 'other@example.com' }), params);
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe('recipient_consent_attestation_required');
    expect(mockPublish).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockRouter).not.toHaveBeenCalled();
  });
  it('accepts an explicit attestation to that exact recipient and records only an HMAC', async () => {
    const r = await POST(req({ recipientEmail: 'approved@example.com',
      recipientConsentAttested: true, subjectShareAttested: true }), params);
    expect(r.status).toBe(200);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, args] = mockQuery.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('soul_portrait_delivery_attestations');
    expect(args[2]).toBe('f'.repeat(64));
    expect(JSON.stringify(args)).not.toContain('approved@example.com');
    expect(mockRouter).toHaveBeenCalledTimes(1);
  });
  it('refuses recipient consent alone without subject permission to share', async () => {
    const r = await POST(req({
      recipientEmail: 'third-party@example.com', recipientConsentAttested: true,
    }), params);
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe('subject_sharing_attestation_required');
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockRouter).not.toHaveBeenCalled();
  });

  it('does not resurrect a published portrait after governing consent revocation', async () => {
    mockLive.mockResolvedValue(false);
    mockGet.mockResolvedValue({
      id: 'portrait', publishedAt: '2026-10-10T12:00:00Z',
      subjectIsMinor: false, subjectMemberId: null,
      immutableText: { person: { name: 'Subject' } },
    });
    const r = await POST(req({
      recipientEmail: 'approved@example.com',
      recipientConsentAttested: true, subjectShareAttested: true,
      consentAttested: true,
    }), params);
    expect(r.status).toBe(409);
    expect((await r.json()).error).toBe('subject_consent_not_live');
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockRouter).not.toHaveBeenCalled();
  });

  it('still allows link creation with live subject consent and no email', async () => {
    const r = await POST(req({}), params);
    expect(r.status).toBe(200);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockRouter).not.toHaveBeenCalled();
  });
  it('requires subject consent separately when it has not been recorded', async () => {
    mockLive.mockResolvedValue(false);
    const r = await POST(req({ recipientEmail: 'approved@example.com', recipientConsentAttested: true, subjectShareAttested: true }), params);
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe('consent_attestation_required');
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('blocks minors despite recipient attestation', async () => {
    mockGet.mockResolvedValue({
      id: 'portrait', subjectIsMinor: true, immutableText: { person: { isMinor: true } },
    });
    const r = await POST(req({ recipientEmail: 'approved@example.com', recipientConsentAttested: true, subjectShareAttested: true }), params);
    expect(r.status).toBe(403);
    expect(mockRouter).not.toHaveBeenCalled();
  });
  it('refuses invalid recipient before publication or durable consent writes', async () => {
    const r = await POST(req({ recipientEmail: 'bad@', recipientConsentAttested: true, subjectShareAttested: true }), params);
    expect(r.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockPublish).not.toHaveBeenCalled();
  });
});
