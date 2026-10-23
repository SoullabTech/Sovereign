import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkAccess, matchRule } from '@/config/accessMatrix';

/**
 * ASTROLOGY-BETA-ACCESS-20261023
 * Strict-mode regression: keep calculators identity-free and isolate
 * member-owned profile, reflections, geocoding and saved synastry.
 */
describe('Astrology beta — exact access-matrix repair', () => {
  const previous = process.env.ACCESS_CONTROL_MODE;
  beforeAll(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
  afterAll(() => {
    if (previous === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = previous;
  });

  const calculators = [
    '/api/astrology/birth-chart',
    '/api/astrology/current-transits',
  ];
  const memberApis = [
    '/api/members/profile',
    '/api/astrology/geocode',
    '/api/astrology/reflection',
    '/api/astrology/synastry/saved',
  ];

  it.each(calculators)('%s remains identity-free, including on mobile', (url) => {
    expect(matchRule(url)).toMatchObject({ exact: url, public: true });
    expect(checkAccess(url, 'free', [], false).allowed).toBe(true);
  });

  it.each(memberApis)('%s admits verified Free, Personal and Pro members', (url) => {
    expect(matchRule(url)).toMatchObject({ exact: url, minTier: 'free' });
    for (const tier of ['free', 'personal', 'pro'] as const) {
      expect(checkAccess(url, tier, ['member'], true).allowed).toBe(true);
    }
  });

  it.each(memberApis)('%s refuses unauthenticated member-data access', (url) => {
    const decision = checkAccess(url, 'pro', ['admin'], false);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('unauthenticated');
  });

  it('does not admit arbitrary astrology endpoints in strict mode', () => {
    for (const url of [
      '/api/astrology/foreign-private-chart',
      '/api/astrology/private-exports',
      '/api/members/delete',
    ]) {
      const decision = checkAccess(url, 'pro', ['admin'], true);
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('no-rule-match');
    }
  });

  it('preserves Pro/practitioner role restrictions outside Astrology', () => {
    const decision = checkAccess('/api/practitioner/sessions', 'free', ['member'], true);
    expect(decision.allowed).toBe(false);
  });

  it('saved synastry derives owner from session and refuses foreign claims', () => {
    const route = readFileSync(join(process.cwd(), 'app/api/astrology/synastry/saved/route.ts'), 'utf8');
    expect(route).toContain('getMemberIdFromRequest(request)');
    expect(route).toContain('claimedMemberId !== memberId');
    expect(route).toContain('listSavedSynastryAnalyses(memberId');
    expect(route).not.toContain("const memberId = searchParams.get('memberId')");
    expect(route).not.toContain("error: error instanceof Error ? error.message");
  });

  it('Astrology never authorizes a saved chart using an explorer/browser ID', () => {
    const page = readFileSync(join(process.cwd(), 'app/astrology/page.tsx'), 'utf8');
    expect(page).toContain("apiFetch('/api/members/profile')");
    expect(page).toContain("'/api/astrology/synastry/saved?limit=3'");
    expect(page).not.toContain('getOrCreateExplorerId()');
    expect(page).not.toContain('synastry/saved?memberId=');
  });
});
