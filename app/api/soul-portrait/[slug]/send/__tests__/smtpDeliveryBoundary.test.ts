import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const identity = jest.fn<(...args: any[]) => Promise<any>>();
const getPortrait = jest.fn<(...args: any[]) => Promise<any>>();
const publish = jest.fn<(...args: any[]) => Promise<any>>();
const live = jest.fn<(...args: any[]) => Promise<any>>();
const record = jest.fn<(...args: any[]) => Promise<any>>();
const email = jest.fn<(...args: any[]) => Promise<any>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: (...a: any[]) => identity(...a) }));
jest.mock('@/lib/soulPortrait/portraitStore', () => ({
  getOwnedPortraitBySlug: (...a: any[]) => getPortrait(...a),
  publishOwnedPortrait: (...a: any[]) => publish(...a),
}));
jest.mock('@/lib/soulPortrait/consentRecord', () => ({ recordPortraitConsent: (...a: any[]) => record(...a) }));
jest.mock('@/lib/soulPortrait/consentAccess', () => ({ isPortraitConsentLive: (...a: any[]) => live(...a) }));
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...a: any[]) => email(...a),
  SENDERS: { noreply: 'Soullab <noreply@soullab.life>' },
}));
import { POST } from '../route';

const OWNER = '9ba11e1c-b849-4474-ad10-a788341e4815';
const PORTRAIT = '620d37e9-afbf-4e52-80c5-5ce9c7aceade';
const params = { params: Promise.resolve({ slug: 'fictional-portrait' }) };
const request = (body: Record<string, unknown>) => new NextRequest(
  'https://soullab.life/api/soul-portrait/fictional-portrait/send',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) },
);
const approved = { recipientEmail: 'fictional@example.com', recipientConsentAttested: true, subjectShareAttested: true };

beforeEach(() => {
  jest.clearAllMocks();
  identity.mockResolvedValue(OWNER);
  getPortrait.mockResolvedValue({
    id: PORTRAIT, subjectIsMinor: false, publishedAt: '2026-11-12T10:00:00Z',
    subjectMemberId: null, immutableText: { person: { name: 'Fictional adult', isMinor: false } },
  });
  publish.mockResolvedValue({
    slug: 'fictional-portrait', publishedAt: '2026-11-12T10:00:00Z',
    immutableText: { person: { name: 'Fictional adult' } },
  });
  live.mockResolvedValue(true);
  record.mockResolvedValue({ live: true });
  email.mockResolvedValue({ success: true, id: 'fixture-accepted-id', provider: 'smtp' });
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Soul Portrait SMTP route / fictional refusal tests', () => {
  it('requires fresh recipient attestation before publication', async () => {
    const response = await POST(request({ recipientEmail: approved.recipientEmail }), params);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('recipient_consent_attestation_required');
    expect(publish).not.toHaveBeenCalled();
    expect(email).not.toHaveBeenCalled();
  });
  it('requires subject sharing approval independently', async () => {
    const response = await POST(request({ recipientEmail: approved.recipientEmail, recipientConsentAttested: true }), params);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('subject_sharing_attestation_required');
    expect(email).not.toHaveBeenCalled();
  });
  it('cannot resurrect a revoked published portrait', async () => {
    live.mockResolvedValue(false);
    const response = await POST(request(approved), params);
    expect(response.status).toBe(409);
    expect((await response.json()).error).toBe('subject_consent_not_live');
    expect(email).not.toHaveBeenCalled();
  });
  it('requires initial subject consent separately', async () => {
    live.mockResolvedValue(false);
    getPortrait.mockResolvedValue({ id: PORTRAIT, subjectIsMinor: false, publishedAt: null,
      immutableText: { person: { name: 'Fictional adult' } } });
    const response = await POST(request(approved), params);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('consent_attestation_required');
    expect(email).not.toHaveBeenCalled();
  });
  it('blocks minors and invalid email before publication', async () => {
    getPortrait.mockResolvedValue({ id: PORTRAIT, subjectIsMinor: true,
      immutableText: { person: { isMinor: true } } });
    expect((await POST(request(approved), params)).status).toBe(403);
    expect(email).not.toHaveBeenCalled();
    getPortrait.mockResolvedValue({ id: PORTRAIT, subjectIsMinor: false,
      immutableText: { person: { name: 'Fictional adult' } } });
    expect((await POST(request({ ...approved, recipientEmail: 'invalid@' }), params)).status).toBe(400);
    expect(email).not.toHaveBeenCalled();
  });
  it('uses only central managed sender with owner-bound proof', async () => {
    const response = await POST(request(approved), params);
    expect(response.status).toBe(200);
    expect((await response.json()).emailed).toBe(true);
    expect(email).toHaveBeenCalledTimes(1);
    expect(email.mock.calls[0][0]).toEqual(expect.objectContaining({
      purpose: 'soul-portrait:delivery', to: 'fictional@example.com',
      portraitDelivery: expect.objectContaining({ portraitId: PORTRAIT, ownerMemberId: OWNER,
        recipientConsentAttested: true, subjectShareAttested: true }),
    }));
  });
  it('creates a private link with zero email calls', async () => {
    const response = await POST(request({}), params);
    expect(response.status).toBe(200);
    expect((await response.json()).emailed).toBe(false);
    expect(email).not.toHaveBeenCalled();
  });
  it('never labels SMTP refusal as a send or returns raw provider error', async () => {
    email.mockResolvedValue({ success: false, error: 'sensitive-provider-detail',
      failureKind: 'provider_auth', provider: 'smtp' });
    const response = await POST(request(approved), params);
    const body = await response.json();
    expect(body.emailed).toBe(false);
    expect(body.emailError).not.toContain('sensitive-provider-detail');
    expect(body.url).toContain('/soul-portrait/view/');
  });
});
