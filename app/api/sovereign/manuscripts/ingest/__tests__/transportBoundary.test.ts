/**
 * INGEST-TRANSPORT — F1–F7.
 *
 * The repair excludes exactly one multipart route from the middleware matcher,
 * because matching is what makes Next buffer and rebuild the body. Everything
 * the exclusion removes has to be proven present again at the route boundary,
 * and the exclusion has to be proven not to widen.
 *
 * Two kinds of check live here, and they are not interchangeable. The ORDER of
 * the boundary — authority reads the caller's claims, then sanitisation removes
 * them, then the body is read — is a property of this source file and is
 * asserted against the source. The MECHANISM it depends on — that deleting
 * headers in place on a NextRequest neither seals nor consumes the body — is a
 * property of the runtime and is exercised against a real NextRequest.
 */
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import {
  CLIENT_ASSERTABLE_IDENTITY_HEADERS,
  CLIENT_SENT_IDENTITY_CLAIM_HEADERS,
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

/** A real multipart NextRequest, built the way an upload arrives. */
const multipartRequest = (headers: Record<string, string> = {}): NextRequest =>
  new NextRequest(`http://localhost${PATH}`, {
    method: 'POST',
    headers: {
      'content-type': 'multipart/form-data; boundary=b',
      ...headers,
    },
    body:
      '--b\r\nContent-Disposition: form-data; name="file"; filename="a.md"\r\n' +
      'Content-Type: text/markdown\r\n\r\nhello\r\n--b--\r\n',
  });

describe('F1 · an unauthenticated upload is refused', () => {
  it('the route derives authority itself, not via middleware', () => {
    const src = route();
    expect(src).toMatch(/await deriveVerifiedAccess\(request\)/);
    expect(src).toMatch(/checkAccess\(\s*INGEST_PATHNAME/);
    expect(src).toMatch(/INGEST_PATHNAME = '\/api\/sovereign\/manuscripts\/ingest'/);
  });

  it('and reproduces the API denial semantics middleware would have applied', () => {
    const src = route();
    expect(src).toMatch(/case 'unauthenticated':[\s\S]{0,200}status: 401/);
    expect(src).toMatch(/case 'missing-role':[\s\S]{0,300}status: 403/);
    expect(src).toMatch(/case 'no-rule-match':[\s\S]{0,300}status: 404/);
    // The tier waiver must not swallow an independent role requirement.
    expect(src).toMatch(
      /case 'insufficient-tier':[\s\S]{0,600}rule\?\.rolesAnyOf && !hasRequiredRole/,
    );
  });

  it('asks the MATRIX rather than restating what the matrix says today', () => {
    // The rule is `minTier: 'free'` with no roles, so the only live effect is
    // "authenticated". Hardcoding that would freeze today's semantics into the
    // exception: a rule that later gains a role would be enforced everywhere
    // except here.
    const src = route();
    expect(src).toMatch(/from '@\/config\/accessMatrix'/);
    expect(src).toMatch(/verified\.tier,\s*\n\s*verified\.roles,\s*\n\s*verified\.authenticated/);
  });
});

describe("F2 · a valid member cannot cause custody to be attributed to another member", () => {
  it('the member custody is written under comes from the ordinary gate', () => {
    const src = route();
    expect(src).toMatch(/const memberId = await getMemberIdFromRequest\(request\)/);
    // NOT verified.memberId: deriveVerifiedAccess also accepts a `?_t=` query
    // token, and adopting it here would widen what counts as a credential on
    // an upload path.
    expect(src).not.toMatch(/const memberId = verified\.memberId/);
    expect(src).toMatch(/verified\.memberId !== memberId/);
    // and nothing in the route reads an identity header to decide who this is
    const decision = src.slice(src.indexOf('export async function POST'));
    expect(decision).not.toMatch(/headers\.get\('x-(member-id|maia-member-id|access-)/);
  });

  it('a claim that disagrees with the session denies before anything is read', () => {
    // deriveVerifiedAccess compares x-member-id / x-maia-member-id against the
    // session and returns `claim_mismatch`, which is unauthenticated, which is
    // a 401 above — reached before formData().
    const auth = read('lib/auth/verifiedAccess.ts');
    expect(auth).toMatch(/claim_mismatch/);
    expect(auth).toMatch(/impersonation/i);
    expect(auth).toMatch(/x-maia-member-id/);
  });

  it('forged x-access-* context cannot supply roles or tier', () => {
    // Those names are derived from the members row inside deriveVerifiedAccess,
    // and are stripped from the request before anything downstream runs.
    const auth = read('lib/auth/verifiedAccess.ts');
    expect(auth).not.toMatch(/headers\.get\('x-access-/);
    for (const h of ['x-access-tier', 'x-access-roles', 'x-access-member-id']) {
      expect(CLIENT_ASSERTABLE_IDENTITY_HEADERS).toContain(h);
    }
  });
});

describe('F3 · a valid member upload succeeds — nothing new gates it', () => {
  it('the admission block adds no gate beyond authority and sanitisation', () => {
    const src = route();
    const admission = src.slice(
      src.indexOf('const forged = forgedIdentityHeaders'),
      src.indexOf('await request.formData()'),
    );
    expect(admission.length).toBeGreaterThan(0);
    // Four refusals only: forged names, no member, resolvers disagreeing, and
    // a survivor of sanitisation. (The matrix denials live in a helper.)
    expect(admission.match(/status: 401/g) ?? []).toHaveLength(4);
    expect(admission).not.toMatch(/process\.env\./);
  });
});

describe('F4 · the multipart body reaches the route intact', () => {
  it('the path is excluded from the matcher, which is what caused the rebuild', () => {
    expect(matcherExcludes(PATH)).toBe(true);
  });

  it('the exclusion is anchored, so it is a path and not a prefix', () => {
    expect(middleware()).toMatch(/api\/sovereign\/manuscripts\/ingest\$/);
  });

  it('no second Request is constructed — a copy would consume the body', () => {
    const src = route();
    expect(src).not.toMatch(/new NextRequest\(/);
    expect(src).not.toMatch(/new Request\(/);
  });
});

describe('F5 · every format crosses the same boundary', () => {
  it('the refusal is on the transport, not on any format', () => {
    const src = route();
    /* Scoped to the ADMISSION block. The file's own error copy names formats
       further down, which is correct there and would make a whole-file search
       meaningless. */
    const admission = src.slice(
      src.indexOf('const forged = forgedIdentityHeaders'),
      src.indexOf('await request.formData()'),
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

  it('and what that rule enforces today is only "authenticated"', () => {
    // free is the lowest rank, so the tier half is vacuous for every member.
    // This is a statement about TODAY, which is exactly why the route calls
    // checkAccess instead of encoding this answer.
    expect(TIER_RANK.free).toBe(0);
    expect(tierSatisfies('free', 'free')).toBe(true);
    const rule = ACCESS_RULES.find((r) => r.prefix === '/api/sovereign');
    expect(rule!.rolesAnyOf).toBeUndefined();
  });
});

describe('F7 · client assertions cannot survive the excluded boundary', () => {
  it('the five steps stand in the only order that makes this a boundary', () => {
    const src = route();
    const refuse = src.indexOf('const forged = forgedIdentityHeaders');
    const authority = src.indexOf('const verified = await deriveVerifiedAccess');
    const identity = src.indexOf('await getMemberIdFromRequest(request)');
    const strip = src.indexOf('request.headers.delete(header)');
    const body = src.indexOf('await request.formData()');
    for (const i of [refuse, authority, identity, strip, body]) {
      expect(i).toBeGreaterThan(-1);
    }
    // Authority and identity must still SEE the caller's claims; nothing
    // downstream of sanitisation may.
    expect(refuse).toBeLessThan(authority);
    expect(authority).toBeLessThan(identity);
    expect(identity).toBeLessThan(strip);
    expect(strip).toBeLessThan(body);
  });

  it('x-maia-member-id is REFUSED — no client sends it, and no gate checks it', () => {
    // getMemberIdFromRequest verifies x-member-id against the session; it does
    // not inspect the alias at all. Exempting it would leave an unverified
    // identity assertion ambient in the handler.
    expect(NEVER_CLIENT_SENT_IDENTITY_HEADERS).toContain('x-maia-member-id');
    expect(forgedIdentityHeaders(new Headers({ 'x-maia-member-id': 'other' })))
      .toEqual(['x-maia-member-id']);
    expect(read('lib/auth/getMemberFromRequest.ts')).not.toMatch(/x-maia-member-id/);
  });

  it('x-member-id is the ONLY exemption, and it has a real sender', () => {
    expect(CLIENT_SENT_IDENTITY_CLAIM_HEADERS).toEqual(['x-member-id']);
    expect(read('lib/http/apiBase.ts')).toMatch(/headers\.set\('x-member-id'/);
    expect(forgedIdentityHeaders(new Headers({ 'x-member-id': 'm' }))).toEqual([]);
  });

  it('the refused set is derived from the stripped set, so it cannot drift', () => {
    expect(new Set([...NEVER_CLIENT_SENT_IDENTITY_HEADERS, ...CLIENT_SENT_IDENTITY_CLAIM_HEADERS]))
      .toEqual(new Set(CLIENT_ASSERTABLE_IDENTITY_HEADERS));
  });

  it('every client-assertable name is deleted, in place, from the same request', () => {
    const src = route();
    expect(src).toMatch(
      /for \(const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS\) \{[\s\S]{0,200}request\.headers\.delete\(header\)/,
    );
  });

  it('a survivor is refused rather than tolerated', () => {
    const src = route();
    expect(src).toMatch(/const surviving = CLIENT_ASSERTABLE_IDENTITY_HEADERS\.filter/);
    expect(src).toMatch(/if \(surviving\.length > 0\)[\s\S]{0,400}status: 401/);
  });

  it('the deletion actually removes them from a real NextRequest', () => {
    const req = multipartRequest({
      'x-member-id': 'someone-else',
      'x-maia-member-id': 'someone-else',
      'x-access-tier': 'pro',
      'x-access-roles': 'admin',
      'x-access-member-id': 'someone-else',
      'x-access-authed': 'true',
      'x-session-token': 'tok',
    });
    for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
      req.headers.delete(header);
    }
    for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
      expect(req.headers.has(header)).toBe(false);
    }
  });

  it('the session credential survives sanitisation — it is not an assertion', () => {
    const req = multipartRequest({ 'x-session-token': 'tok', 'x-access-roles': 'admin' });
    for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
      req.headers.delete(header);
    }
    expect(CLIENT_ASSERTABLE_IDENTITY_HEADERS).not.toContain('x-session-token');
    expect(req.headers.get('x-session-token')).toBe('tok');
  });

  it('and the body is still readable after it — the whole point of in place', () => {
    const req = multipartRequest({ 'x-member-id': 'm', 'x-access-roles': 'admin' });
    for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
      req.headers.delete(header);
    }
    expect(req.bodyUsed).toBe(false);
    return req.formData().then(async (form) => {
      const file = form.get('file') as File;
      expect(file.name).toBe('a.md');
      expect(await file.text()).toBe('hello');
    });
  });
});

/**
 * F7 — behavioural.
 *
 * The assertions above establish the ORDER from the source, which is where that
 * property lives. This block establishes the CONSEQUENCE by running the handler:
 * `formData()` is intercepted and, at the moment it is invoked, reads back the
 * request's own headers. Whatever is present there is what the rest of the route
 * — parsing, custody, and anything added later — would be able to see.
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/manuscript/ingest/parseUpload', () => ({
  parseUpload: jest.fn(),
  UnsupportedUploadError: class UnsupportedUploadError extends Error {},
}));
jest.mock('@/lib/manuscript/source/arrivals', () => ({ recordArtifactArrival: jest.fn() }));

describe('F7 · behavioural — what the handler can still see when it reads the body', () => {
  const MEMBER = '11111111-1111-1111-1111-111111111111';
  const OTHER = '22222222-2222-2222-2222-222222222222';

  /* eslint-disable @typescript-eslint/no-var-requires */
  const { query } = require('@/lib/db/postgres');
  const { cookies } = require('next/headers');
  const { parseUpload } = require('@/lib/manuscript/ingest/parseUpload');
  const { recordArtifactArrival } = require('@/lib/manuscript/source/arrivals');
  const { POST } = require('../route');
  /* eslint-enable @typescript-eslint/no-var-requires */

  beforeEach(() => {
    jest.clearAllMocks();
    // A valid, unrevoked session naming MEMBER — both resolvers run the same
    // predicate against auth_sessions, so both are answered here.
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('m.tier')) {
        return { rows: [{ member_id: MEMBER, tier: 'free', roles: ['member'] }] };
      }
      if (sql.includes('auth_sessions')) return { rows: [{ member_id: MEMBER }] };
      return { rows: [] };
    });
    cookies.mockResolvedValue({ get: () => undefined });
    parseUpload.mockResolvedValue({ text: 'hello', warnings: [], format: 'md' });
    recordArtifactArrival.mockResolvedValue({ id: 'arrival-1' });
  });

  /** Run the handler, capturing the request's headers at the body boundary. */
  const runCapturingHeaders = async (headers: Record<string, string>) => {
    const req = multipartRequest(headers);
    const realFormData = req.formData.bind(req);
    let atBody: string[] | null = null;
    jest.spyOn(req, 'formData').mockImplementation(async () => {
      atBody = [...req.headers.keys()];
      return realFormData();
    });
    const res = await POST(req);
    return { res, atBody };
  };

  it('a matching x-member-id is accepted through auth — the upload succeeds', async () => {
    const { res } = await runCapturingHeaders({
      'x-session-token': 'tok',
      'x-member-id': MEMBER,
    });
    expect(res.status).toBe(200);
    expect(recordArtifactArrival).toHaveBeenCalledWith(
      expect.objectContaining({ memberId: MEMBER }),
    );
  });

  it('and NO client-assertable header remains when the body is read', async () => {
    const { res, atBody } = await runCapturingHeaders({
      'x-session-token': 'tok',
      'x-member-id': MEMBER,
    });
    expect(res.status).toBe(200);
    expect(atBody).not.toBeNull();
    for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
      expect(atBody).not.toContain(header);
    }
  });

  it('while x-session-token IS still there — a credential, not an assertion', async () => {
    const { atBody } = await runCapturingHeaders({
      'x-session-token': 'tok',
      'x-member-id': MEMBER,
    });
    expect(atBody).toContain('x-session-token');
  });

  it('a mismatched x-member-id is refused — the body is never reached', async () => {
    const { res, atBody } = await runCapturingHeaders({
      'x-session-token': 'tok',
      'x-member-id': OTHER,
    });
    expect(res.status).toBe(401);
    expect(atBody).toBeNull();
    expect(recordArtifactArrival).not.toHaveBeenCalled();
  });

  it('x-maia-member-id is refused even when it names the session member', async () => {
    // No client sends it and no gate inspects it, so there is no reading under
    // which its presence is honest.
    const { res, atBody } = await runCapturingHeaders({
      'x-session-token': 'tok',
      'x-maia-member-id': MEMBER,
    });
    expect(res.status).toBe(401);
    expect(atBody).toBeNull();
  });

  it('forged x-access-* context is refused, not merely ignored', async () => {
    const { res, atBody } = await runCapturingHeaders({
      'x-session-token': 'tok',
      'x-access-tier': 'pro',
      'x-access-roles': 'admin',
      'x-access-member-id': OTHER,
    });
    expect(res.status).toBe(401);
    expect(atBody).toBeNull();
  });

  it('no credential at all is refused by the matrix, before the body', async () => {
    const { res, atBody } = await runCapturingHeaders({});
    expect(res.status).toBe(401);
    expect(atBody).toBeNull();
    expect(await res.json()).toMatchObject({ error: 'Unauthorized' });
  });
});
