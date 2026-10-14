import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { POST } from '../route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getOwnedPortraitBySlug, publishOwnedPortrait } from '@/lib/soulPortrait/portraitStore';
import { isPortraitConsentLive } from '@/lib/soulPortrait/consentAccess';
import { recordPortraitConsent } from '@/lib/soulPortrait/consentRecord';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/soulPortrait/portraitStore', () => ({
  getOwnedPortraitBySlug: jest.fn(),
  publishOwnedPortrait: jest.fn(),
}));
jest.mock('@/lib/soulPortrait/consentAccess', () => ({
  isPortraitConsentLive: jest.fn(),
}));
jest.mock('@/lib/soulPortrait/consentRecord', () => ({
  recordPortraitConsent: jest.fn(),
}));

const getMember = getMemberIdFromRequest as jest.Mock;
const getOwned = getOwnedPortraitBySlug as jest.Mock;
const publish = publishOwnedPortrait as jest.Mock;
const live = isPortraitConsentLive as jest.Mock;
const record = recordPortraitConsent as jest.Mock;

const fictional = {
  id: 'synthetic-portrait-11',
  slug: 'synthetic-private-portrait',
  subjectMemberId: 'synthetic-consenting-adult',
  subjectIsMinor: false,
  immutableText: { person: { name: 'Fictional Adult', isMinor: false } },
};
function makeRequest(body: unknown): any {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}
async function send(body: unknown) {
  const res = await POST(makeRequest(body), {
    params: Promise.resolve({ slug: 'synthetic-private-portrait' }),
  });
  return { res, body: await res.json() };
}
beforeEach(() => {
  jest.resetAllMocks();
  getMember.mockResolvedValue('synthetic-owner');
  getOwned.mockResolvedValue(fictional);
  live.mockResolvedValue(false);
  record.mockResolvedValue({ live: true });
  publish.mockResolvedValue({
    ...fictional, publishedAt: '2026-10-13T15:00:00.000Z',
  });
});

describe('Soul Portrait beta — private-link delivery only', () => {
  it('does not import any legacy outbound mail router or recipient email UI', () => {
    const route = readFileSync(join(process.cwd(), 'app/api/soul-portrait/[slug]/send/route.ts'), 'utf8');
    const panel = readFileSync(join(process.cwd(), 'components/soulPortrait/SendPortraitPanel.tsx'), 'utf8');
    expect(route).not.toContain('EmailRouter');
    expect(route).not.toContain('router.send(');
    expect(panel).not.toContain('type="email"');
    expect(panel).not.toContain('recipientEmail:');
    expect(panel).toContain('Create private link');
  });

  it('rejects any recipient email before consent or publication or provider action', async () => {
    const result = await send({ consentAttested: true, recipientEmail: 'synthetic@example.invalid' });
    expect(result.res.status).toBe(409);
    expect(result.body.error).toBe('email_delivery_held');
    expect(getOwned).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it('does not silently accept undeliverable notes or recipient contact details', async () => {
    for (const invalid of [
      { recipientName: 'Fictional Recipient' },
      { message: 'Private synthetic note' },
      { recipientEmail: { to: 'synthetic@example.invalid' } },
    ]) {
      const result = await send({ consentAttested: true, ...invalid });
      expect(result.res.status).toBe(409);
    }
    expect(getOwned).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it('requires verified owner and explicit adult subject consent before publication', async () => {
    const missingAttestation = await send({});
    expect(missingAttestation.res.status).toBe(400);
    expect(missingAttestation.body.error).toBe('consent_attestation_required');
    expect(record).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();

    getOwned.mockResolvedValue({ ...fictional, subjectIsMinor: true });
    const minor = await send({ consentAttested: true });
    expect(minor.res.status).toBe(403);
    expect(publish).not.toHaveBeenCalled();
  });

  it('publishes a consent-attested adult gift to a private, no-store link without sending mail', async () => {
    const result = await send({ consentAttested: true });
    expect(result.res.status).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.emailed).toBe(false);
    expect(result.body.delivery).toBe('private_link_only');
    expect(result.body.path).toBe('/soul-portrait/view/synthetic-private-portrait');
    expect(result.res.headers.get('cache-control')).toBe('private, no-store');
    expect(getOwned).toHaveBeenCalledWith('synthetic-private-portrait', 'synthetic-owner');
    expect(record).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(fictional.id, 'synthetic-owner');
  });

  it('permits revisiting an already live portrait without another consent record', async () => {
    live.mockResolvedValue(true);
    const result = await send({});
    expect(result.res.status).toBe(200);
    expect(record).not.toHaveBeenCalled();
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it('refuses missing member session without looking up or publishing a portrait', async () => {
    getMember.mockResolvedValue(null);
    const result = await send({ consentAttested: true });
    expect(result.res.status).toBe(401);
    expect(getOwned).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });
});
