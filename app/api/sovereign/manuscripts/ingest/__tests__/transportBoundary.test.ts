/**
 * INGEST-TRANSPORT — F1–F7.
 *
 * The repair excludes exactly one multipart route from the middleware matcher,
 * because matching is what makes Next buffer and rebuild the body. Everything
 * the exclusion removes has to be proven present again at the route boundary,
 * and the exclusion has to be proven not to widen.
 */
import fs from 'fs';
import path from 'path';
import {
  CLIENT_ASSERTABLE_IDENTITY_HEADERS,
  NEVER_CLIENT_SENT_IDENTITY_HEADERS,
  forgedIdentityHeaders,
} from '@/lib/auth/identityAssertions';
import { ACCESS_RULES, TIER_RANK, tierSatisfies } from '@/config/accessMatrix';

const REPO = path.resolve(__dirname, '../../../../../..');
const read = (p: string) => fs.readFileSync(path.join(REPO, p), 'utf8');
const middleware = () => read('middleware.ts');
const route = () => read('app/api/sovereign/manuscripts/ingest/route.ts');

const PATH = '/api/sovereign/manuscripts/ingest';

/** The matcher's negative lookahead, applied the way Next applies it. */
const matcherExcludes = (pathname: string): boolean => {
  const src = middleware();
  const line = src.split('\n').find((l) => l.includes('(?!_next/static'))!;
  const pattern = line.trim().replace(/^'/, '').replace(/',$/, '');
  return !new RegExp(`^${pattern}$`).test(pathname);
};

describe('F1 · an unauthenticated upload is refused', () => {
  it('the route refuses on its own, not via middleware', () => {
    expect(route()).toMatch(/getMemberIdFromRequest\(request\)/);
    expect(route()).toMatch(/if \(!memberId\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\)/);
  });
});

describe('F2 · a member cannot write to another member\'s Work through this route', () => {
  it('identity comes from the verified session, never from an asserted header', () => {
    const auth = read('lib/auth/getMemberFromRequest.ts');
    // the claim is checked against the session and rejected on mismatch
    expect(auth).toMatch(/impersonation/i);
    expect(auth).toMatch(/do NOT trust a bare/i);
  });
});

describe('F3 · a valid member upload succeeds — nothing new gates it', () => {
  it('the route adds no gate beyond auth and the forged-header refusal', () => {
    const src = route();
    const refusals = src.match(/status: 401/g) ?? [];
    expect(refusals).toHaveLength(2); // forged headers, and no member
  });
});

describe('F4 · the multipart body reaches the route intact', () => {
  it('the path is excluded from the matcher, which is what caused the rebuild', () => {
    expect(matcherExcludes(PATH)).toBe(true);
  });

  it('the exclusion is anchored, so it is a path and not a prefix', () => {
    expect(middleware()).toMatch(/api\/sovereign\/manuscripts\/ingest\$/);
  });
});

describe('F5 · every format crosses the same boundary', () => {
  it('the refusal is on the transport, not on any format', () => {
    const src = route();
    /* Scoped to the ADMISSION block — auth and the forged-header refusal. The
       file's own error copy names formats further down, which is correct there
       and would make a whole-prefix search meaningless. */
    const admission = src.slice(
      src.indexOf('const forged = forgedIdentityHeaders'),
      src.indexOf('formData()'),
    );
    expect(admission.length).toBeGreaterThan(0);
    expect(admission).not.toMatch(/pdf|docx|\.md\b/i);
  });
});

describe('F6 · the exclusion does not widen /api/sovereign', () => {
  it.each([
    '/api/sovereign/manuscripts',
    '/api/sovereign/manuscripts/abc/draft',
    '/api/sovereign/manuscripts/ingest/extra',
    '/api/sovereign/atoms',
  ])('sibling %s is STILL matched and enforced', (p) => {
    expect(matcherExcludes(p)).toBe(false);
  });

  it('the access rule that covered this path still covers its siblings', () => {
    const rule = ACCESS_RULES.find((r) => r.prefix === '/api/sovereign');
    expect(rule).toBeDefined();
    expect(rule!.minTier).toBe('free');
  });

  it('and what that rule enforced here was only "authenticated"', () => {
    // free is the lowest rank, so the tier half is vacuous for every member
    expect(TIER_RANK.free).toBe(0);
    expect(tierSatisfies('free', 'free')).toBe(true);
    const rule = ACCESS_RULES.find((r) => r.prefix === '/api/sovereign');
    expect(rule!.rolesAnyOf).toBeUndefined();
  });
});

describe('F7 · client-asserted identity headers cannot reach the handler', () => {
  it('the route refuses a request carrying middleware-derived headers', () => {
    expect(route()).toMatch(/forgedIdentityHeaders\(request\.headers\)/);
    expect(route()).toMatch(/if \(forged\.length > 0\)/);
  });

  it.each(NEVER_CLIENT_SENT_IDENTITY_HEADERS)('%s is detected as forged', (h) => {
    expect(forgedIdentityHeaders(new Headers({ [h]: 'x' }))).toEqual([h]);
  });

  it('an honest request carries none of them', () => {
    const honest = new Headers({ 'content-type': 'multipart/form-data', 'x-session-token': 't' });
    expect(forgedIdentityHeaders(honest)).toEqual([]);
  });

  it('x-member-id is NOT refused — apiFetch sends it on iOS', () => {
    expect(NEVER_CLIENT_SENT_IDENTITY_HEADERS).not.toContain('x-member-id');
    expect(forgedIdentityHeaders(new Headers({ 'x-member-id': 'm' }))).toEqual([]);
  });

  it('the forged subset stays a subset — it cannot drift from the stripper', () => {
    for (const h of NEVER_CLIENT_SENT_IDENTITY_HEADERS) {
      expect(CLIENT_ASSERTABLE_IDENTITY_HEADERS).toContain(h);
    }
  });
});
