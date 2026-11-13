/**
 * Astrology Pro — outer-layer access-matrix census (#1983, founder ruling
 * D-05 option B, 2026-11-12).
 *
 * Every route under app/api/astrology/pro/ must resolve to its own row in
 * config/accessMatrix.ts, never fall through as "Unmapped route allowed
 * (Mode A)", and never be admitted to a caller without a verified session.
 *
 * Two layers, two jobs. The matrix (this test) requires a verified session and
 * nothing more: it does not know about Pro grants. The audited tester grant is
 * checked in every handler through resolveProOwner → proMemberAllowed, so a
 * signed-in member without a grant passes the matrix and is refused (403
 * preview_access_required) by the handler. This test pins both halves: the
 * matrix rows, and that each handler calls resolveProOwner (or, for my-chart,
 * proMemberAllowed directly) before its work.
 *
 * The census walks the filesystem, so a new Pro route added without a row
 * fails here rather than shipping as an unmapped door.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { ACCESS_RULES, checkAccess, matchRule } from '../config/accessMatrix';

const ROOT = path.join(__dirname, '..');
const PRO_API_DIR = path.join(ROOT, 'app/api/astrology/pro');
const SAMPLE_ID = '0b0e7c3a-5d2f-4c1e-9a8b-1f2e3d4c5b6a';

function routeFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...routeFiles(full));
    else if (name === 'route.ts') out.push(full);
  }
  return out.sort();
}

/** app/api/astrology/pro/charts/[id]/route.ts → /api/astrology/pro/charts/<uuid> */
function urlFor(file: string): string {
  const rel = path.relative(path.join(ROOT, 'app'), path.dirname(file)).split(path.sep).join('/');
  return '/' + rel.replace(/\[id\]/g, SAMPLE_ID);
}

const FILES = routeFiles(PRO_API_DIR);
const ROUTES = FILES.map((f) => ({ file: path.relative(ROOT, f), url: urlFor(f) }));

// The full census as of 2026-11-12. If a route is added or removed, update
// this list and its row together — the census below fails until both agree.
const EXPECTED_ROUTES = [
  '/api/astrology/pro/ask',
  `/api/astrology/pro/charts`,
  `/api/astrology/pro/charts/${SAMPLE_ID}`,
  `/api/astrology/pro/charts/${SAMPLE_ID}/share`,
  '/api/astrology/pro/derived',
  '/api/astrology/pro/ephemeris',
  '/api/astrology/pro/my-chart',
  '/api/astrology/pro/place',
  '/api/astrology/pro/sky',
  '/api/astrology/pro/systems',
].sort();

// Rows that may exist before their route does. /help is being built in the
// ASTRO-PRO-MAIA-GUIDE-01 R2 lane; its row was placed by this security lane so
// that the build lane does not approve its own access-matrix entry.
const RESERVED_ROWS = ['/api/astrology/pro/help'];

const ANON = { tier: 'free' as const, roles: [] as never[], authed: false };
const MEMBER = { tier: 'free' as const, roles: [] as never[], authed: true };

describe('Astrology Pro access matrix', () => {
  it('the filesystem census matches the expected Pro routes', () => {
    expect(ROUTES.map((r) => r.url).sort()).toEqual(EXPECTED_ROUTES);
  });

  describe.each(ROUTES)('$url', ({ file, url }) => {
    it('has its own exact or narrow regex row (never a prefix, never public)', () => {
      const rule = matchRule(url);
      expect(rule).not.toBeNull();
      expect(rule?.prefix).toBeUndefined();
      expect(rule?.public).toBeFalsy();
      expect(rule?.minTier).toBe('free');
      expect(rule?.exact === url || (rule?.regex instanceof RegExp && rule.regex.test(url))).toBe(true);
    });

    it('is refused with "unauthenticated" to a caller without a verified session', () => {
      const r = checkAccess(url, ANON.tier, ANON.roles, ANON.authed);
      expect(r.allowed).toBe(false);
      expect(r.reason).toBe('unauthenticated');
      expect(r.unmapped).toBeFalsy();
    });

    it('admits a signed-in member to the handler, which owns the Pro grant check', () => {
      const r = checkAccess(url, MEMBER.tier, MEMBER.roles, MEMBER.authed);
      expect(r.allowed).toBe(true);
      expect(r.unmapped).toBeFalsy();
    });

    it('the handler rechecks session and Pro access itself', () => {
      const src = readFileSync(path.join(ROOT, file), 'utf8');
      if (file.endsWith('my-chart/route.ts')) {
        expect(src).toContain("from '@/lib/astrology/proAccess'");
        expect(src).toMatch(/proMemberAllowed\(/);
        expect(src).toMatch(/getMemberIdFromRequest\(/);
      } else {
        expect(src).toContain("from '@/lib/astrology/proRouteAccess'");
        const handlers = src.match(/export async function (GET|POST|PUT|PATCH|DELETE)\b/g) ?? [];
        expect(handlers.length).toBeGreaterThan(0);
        // Every exported method resolves its owner through resolveProOwner.
        expect((src.match(/resolveProOwner\(request/g) ?? []).length).toBeGreaterThanOrEqual(handlers.length);
      }
    });
  });

  describe('strict Mode B (unmapped routes denied)', () => {
    const prev = process.env.ACCESS_CONTROL_MODE;
    beforeAll(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
    afterAll(() => {
      if (prev === undefined) delete process.env.ACCESS_CONTROL_MODE;
      else process.env.ACCESS_CONTROL_MODE = prev;
    });

    it.each(ROUTES.map((r) => r.url))('%s is still mapped, so a member is not refused as no-rule-match', (url) => {
      const r = checkAccess(url, MEMBER.tier, MEMBER.roles, MEMBER.authed);
      expect(r.allowed).toBe(true);
      expect(r.reason).not.toBe('no-rule-match');
    });
  });

  it('no /api/astrology/pro prefix or wildcard row exists', () => {
    for (const rule of ACCESS_RULES) {
      if (rule.prefix) expect('/api/astrology/pro/x'.startsWith(rule.prefix)).toBe(false);
    }
    // An unknown Pro path stays unmapped: rows are a census, not a namespace grant.
    expect(matchRule('/api/astrology/pro/not-a-route')).toBeNull();
    expect(matchRule(`/api/astrology/pro/charts/${SAMPLE_ID}/other`)).toBeNull();
  });

  it('every Pro API row names a route that exists, or a reserved row', () => {
    const urls = new Set(ROUTES.map((r) => r.url));
    for (const rule of ACCESS_RULES) {
      if (rule.exact?.startsWith('/api/astrology/pro/')) {
        expect(urls.has(rule.exact) || RESERVED_ROWS.includes(rule.exact)).toBe(true);
      }
    }
  });

  it('the reserved /help row requires a session and is not public', () => {
    const rule = matchRule('/api/astrology/pro/help');
    expect(rule?.exact).toBe('/api/astrology/pro/help');
    expect(rule?.public).toBeFalsy();
    const r = checkAccess('/api/astrology/pro/help', ANON.tier, ANON.roles, ANON.authed);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('unauthenticated');
  });

  it('the Pro notes no longer describe a founder-only preview', () => {
    const src = readFileSync(path.join(ROOT, 'config/accessMatrix.ts'), 'utf8');
    expect(src).not.toMatch(/Founder-only Pro/);
  });
});
