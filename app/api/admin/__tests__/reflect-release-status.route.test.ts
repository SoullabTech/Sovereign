/**
 * Route-level negative acceptance — actual GET handler, no real admin password.
 */
import { NextRequest } from 'next/server';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { GET } from '../reflect-release-status/route';
import { checkAccess, matchRule } from '@/config/accessMatrix';

jest.mock('@/lib/admin/adminAuth', () => ({
  checkAdminAuth: jest.fn(),
}));

const mockedAuth = checkAdminAuth as jest.MockedFunction<typeof checkAdminAuth>;
const oneFictionalMember = '11111111-1111-4111-8111-111111111111';
const otherFictionalMember = '22222222-2222-4222-8222-222222222222';

const makeRequest = () =>
  new NextRequest('https://soullab.life/api/admin/reflect-release-status', {
    method: 'GET',
  });

describe('Reflect E010 strict production proxy route contract', () => {
  const previous = process.env.ACCESS_CONTROL_MODE;
  beforeAll(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
  afterAll(() => {
    if (previous === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = previous;
  });

  it('explicitly maps the exact status path, never as a public route', () => {
    const rule = matchRule('/api/admin/reflect-release-status');
    expect(rule).toMatchObject({
      exact: '/api/admin/reflect-release-status',
      minTier: 'free',
    });
    expect(rule?.public).not.toBe(true);
    expect(matchRule('/api/admin/reflect-release-status-forged')).toBeNull();
  });

  it('denies anonymous and admits an authenticated member only to the founder-gated handler', () => {
    const path = '/api/admin/reflect-release-status';
    expect(checkAccess(path, 'free', [], false)).toMatchObject({
      allowed: false,
      reason: 'unauthenticated',
    });
    // The outer proxy does not know the database admin_role; the GET handler
    // alone enforces founder-only, denies CTO and shared-password access.
    expect(checkAccess(path, 'free', ['member'], true).allowed).toBe(true);
    expect(checkAccess(path, 'free', ['admin'], true).allowed).toBe(true);
  });

  it('does not make sibling admin paths public or give access to unrelated routes', () => {
    const status = '/api/admin/reflect-release-status';
    expect(checkAccess(status, 'free', [], false).allowed).toBe(false);
    expect(checkAccess(status+'-sibling', 'free', [], false)).toMatchObject({
      allowed: false,
      reason: 'no-rule-match',
    });
  });
});

describe('Reflect E010 founder-only read-only admin status GET', () => {
  const previousEnabled = process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
  const previousIds = process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;

  beforeEach(() => {
    mockedAuth.mockReset();
    delete process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
    delete process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;
  });

  afterAll(() => {
    if (previousEnabled === undefined) delete process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
    else process.env.PRO_STUDIO_REFLECT_BETA_ENABLED = previousEnabled;
    if (previousIds === undefined) delete process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;
    else process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS = previousIds;
  });

  it('refuses an anonymous visitor and returns no runtime flags', async () => {
    mockedAuth.mockResolvedValue({ authed: false, via: null });
    process.env.PRO_STUDIO_REFLECT_BETA_ENABLED = 'true';
    process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS = oneFictionalMember;
    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
    const content = await response.text();
    expect(content).not.toContain(oneFictionalMember);
    expect(content).not.toContain('CONFIGURED_UNVERIFIED');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('does not accept the shared admin password as a founder member session', async () => {
    mockedAuth.mockResolvedValue({ authed: true, via: 'password', role: 'founder' });
    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Verified founder member session required',
    });
    expect(mockedAuth).toHaveBeenCalledWith(expect.anything(), ['founder']);
  });

  it('refuses nonfounder session, missing member ID, and other admin roles', async () => {
    const rejected = [
      { authed: true, via: 'member', role: 'operations', memberId: oneFictionalMember },
      { authed: true, via: 'member', role: 'cto', memberId: oneFictionalMember },
      { authed: true, via: 'member', role: 'founder' },
    ] as const;
    for (const result of rejected) {
      mockedAuth.mockResolvedValue(result as any);
      const response = await GET(makeRequest());
      expect(response.status).toBe(403);
    }
  });

  it('serves only redacted, no-store runtime observation to verified founder', async () => {
    mockedAuth.mockResolvedValue({
      authed: true, via: 'member', role: 'founder', memberId: oneFictionalMember,
    });
    process.env.PRO_STUDIO_REFLECT_BETA_ENABLED = 'true';
    process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS = oneFictionalMember;
    const response = await GET(makeRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('vary')).toContain('X-Session-Token');
    const text = await response.text();
    expect(text).not.toContain(oneFictionalMember);
    expect(text).not.toContain('PRO_STUDIO_REFLECT_BETA_MEMBER_IDS');
    expect(JSON.parse(text).observation).toMatchObject({
      mode: 'CONFIGURED_UNVERIFIED',
      operatorAuthority: 'NOT_QUALIFIED',
      emergencyContainment: 'NOT_LIVE_VERIFIED',
      admissionAndRevocation: 'NOT_WITNESSED',
    });
  });

  it('flags multiple IDs without disclosing either identifier', async () => {
    mockedAuth.mockResolvedValue({
      authed: true, via: 'member', role: 'founder', memberId: oneFictionalMember,
    });
    process.env.PRO_STUDIO_REFLECT_BETA_ENABLED = 'true';
    process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS =
      oneFictionalMember + ',' + otherFictionalMember;
    const response = await GET(makeRequest());
    const content = await response.text();
    expect(response.status).toBe(200);
    expect(JSON.parse(content).observation.mode).toBe('HOLD_CONFIG_DRIFT');
    expect(content).not.toContain(oneFictionalMember);
    expect(content).not.toContain(otherFictionalMember);
  });

  it('reports OFF only when effective reader keys are absent', async () => {
    mockedAuth.mockResolvedValue({
      authed: true, via: 'member', role: 'founder', memberId: oneFictionalMember,
    });
    const response = await GET(makeRequest());
    expect(response.status).toBe(200);
    expect((await response.json()).observation.mode).toBe('OFF');
  });

  it('cookie identity is authoritative when a different header token is also sent', async () => {
    mockedAuth.mockImplementation(async (req) => {
      expect(req.headers.get('x-session-token')).toBeNull();
      expect(req.cookies.get('maia_session')?.value).toBe('fictional-nonfounder-cookie');
      return { authed: false, via: null };
    });
    const res = await GET(new NextRequest(
      'https://soullab.life/api/admin/reflect-release-status',
      {
        method: 'GET',
        headers: {
          Cookie: 'maia_session=fictional-nonfounder-cookie',
          'x-session-token': 'fictional-older-founder-token',
        },
      },
    ));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Verified founder member session required' });
    expect(mockedAuth).toHaveBeenCalledTimes(1);
  });

  it('header-only Safari session still reaches verified helper unchanged', async () => {
    mockedAuth.mockImplementation(async (req) => {
      expect(req.headers.get('x-session-token')).toBe('fictional-founder-header');
      expect(req.cookies.get('maia_session')).toBeUndefined();
      return {
        authed: true, via: 'member', role: 'founder', memberId: oneFictionalMember,
      };
    });
    const res = await GET(new NextRequest(
      'https://soullab.life/api/admin/reflect-release-status',
      { method: 'GET', headers: { 'x-session-token': 'fictional-founder-header' } },
    ));
    expect(res.status).toBe(200);
    expect(mockedAuth).toHaveBeenCalledTimes(1);
  });

  it('fails closed when founder session validation fails unexpectedly', async () => {
    mockedAuth.mockRejectedValue(new Error('fictional-database-error-with-credentials'));
    const response = await GET(makeRequest());
    expect(response.status).toBe(503);
    const content = await response.text();
    expect(content).not.toContain('fictional-database-error');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
