/**
 * Outbound delivery authority.
 *
 * The defect: these routes read the sender identity from the request body,
 * loaded that party's provider credentials, and delivered caller-supplied
 * content to a caller-supplied recipient — with no session resolution.
 *
 * WHAT THIS PROVES: the resolver refuses without a verified session, refuses a
 * body-supplied sender that disagrees with the session, and never returns a
 * caller-supplied identifier as the credential owner; and structurally, that
 * every outbound route calls it before doing any work.
 * WHAT IT DOES NOT PROVE: provider behaviour, recipient scoping, or rate
 * limiting — see the open questions in the PR.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { resolveSendAuthority } from '../sendAuthority';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

const SEND_ROUTES = [
  'app/api/notifications/email/route.ts',
  'app/api/notifications/sms/route.ts',
  'app/api/notifications/telegram/route.ts',
  'app/api/notifications/whatsapp/route.ts',
];

jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  getCurrentPractitioner: jest.fn(),
}));
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
const mockResolve = getCurrentPractitioner as jest.MockedFunction<typeof getCurrentPractitioner>;

const req = {} as never;
const IDENTITY = {
  memberId: 'member-real',
  practitionerId: 'practitioner-real',
  practitionerSlug: 's',
  practitionerName: 'n',
  portalType: 'p',
  enabledModules: null,
  studioMode: 'practice' as const,
};

beforeEach(() => mockResolve.mockReset());

describe('refuses without a verified session', () => {
  it('no session → 401, regardless of what the body claims', async () => {
    mockResolve.mockResolvedValue(null);
    const r = await resolveSendAuthority(req, 'practitioner-victim');
    expect(r).toEqual({ ok: false, status: 401, error: 'Authentication required' });
  });

  it('a body-supplied sender cannot substitute for a session', async () => {
    mockResolve.mockResolvedValue(null);
    for (const claim of ['practitioner-real', 'anything', '']) {
      expect((await resolveSendAuthority(req, claim)).ok).toBe(false);
    }
  });
});

describe('refuses a sender that disagrees with the session', () => {
  it('mismatched practitionerId → 403, not silent substitution', async () => {
    mockResolve.mockResolvedValue(IDENTITY);
    const r = await resolveSendAuthority(req, 'practitioner-victim');
    expect(r.ok).toBe(false);
    expect((r as { status: number }).status).toBe(403);
  });

  it('the credential owner is always session-derived, never caller-supplied', async () => {
    mockResolve.mockResolvedValue(IDENTITY);
    const r = await resolveSendAuthority(req, 'practitioner-real');
    expect(r).toEqual({ ok: true, memberId: 'member-real', practitionerId: 'practitioner-real' });
  });

  it('omitting the claim is fine — it was never an input', async () => {
    mockResolve.mockResolvedValue(IDENTITY);
    for (const claim of [undefined, '', null, 123, {}]) {
      const r = await resolveSendAuthority(req, claim);
      expect(r).toEqual({ ok: true, memberId: 'member-real', practitionerId: 'practitioner-real' });
    }
  });
});

describe('structural — every outbound route defers to the resolver', () => {
  it.each(SEND_ROUTES)('%s calls resolveSendAuthority', (rel) => {
    expect(read(rel)).toMatch(/resolveSendAuthority\(request/);
  });

  it.each(SEND_ROUTES)('%s no longer trusts a body-supplied sender', (rel) => {
    const src = read(rel);
    // The body value may be read only under the "claimed" name, to be refused.
    expect(src).not.toMatch(/const \{[^}]*\bpractitionerId\b\s*[,}]/);
    expect(src).toMatch(/practitionerId: claimedPractitionerId/);
  });

  it.each(SEND_ROUTES)('%s resolves authority before touching credentials', (rel) => {
    const src = read(rel);
    const authAt = src.indexOf('resolveSendAuthority(request');
    const credAt = src.search(/practitioner_(config|credentials)|WHERE practitioner_id/);
    if (credAt !== -1) expect(authAt).toBeGreaterThan(-1) && expect(authAt).toBeLessThan(credAt);
  });
});

describe('the Twilio status webhook is deliberately excluded', () => {
  it('is signature-authenticated, not session-authenticated', () => {
    const src = read('app/api/notifications/sms/status/route.ts');
    expect(src).toMatch(/validateTwilioSignature/);
    expect(src).not.toMatch(/resolveSendAuthority/);
  });
});
