/**
 * Journal API — session-derived identity coverage.
 *
 * Principle (founder ruling 2026-07-28, ordering gate): a member-owned
 * capability may not be built on a surface that accepts caller-supplied
 * identity. Journal is the source Commitments will link to, so it is remediated
 * first.
 *
 * Vulnerability (fixed here): every journal route except `quick/audio` took the
 * owning user from a request body field, a `userId` query param, or a bare
 * `x-member-id` header. All three are caller-supplied claims, so any caller
 * could read or write any member's journal by naming their id. `audio-file`
 * had traversal protection but no identity check at all.
 *
 * WHAT THIS PROVES: each handler resolves identity from the verified session,
 * no handler reads identity from the caller, and a caller naming another
 * member's id gets that member's data neither by body, query, header, nor path.
 * WHAT IT DOES NOT PROVE: middleware behaviour, or session issuance itself
 * (covered by getMemberFromRequest.test.ts).
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

const ROUTES = execSync("git ls-files 'app/api/journal/**/route.ts'", {
  cwd: REPO,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean);

/**
 * Strip comments and string literals before any structural assertion.
 *
 * Lesson from #787 (repeated three times in one lane): a structural assertion
 * matched the explanatory comment describing the bug rather than the code. The
 * BEFORE/AFTER notes in these routes quote the exact forbidden expressions, so
 * an un-stripped scan would fail on its own documentation.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/**
 * Comments AND string literals removed — for scans that look for forbidden
 * identity sources. Import assertions must NOT use this: blanking string
 * literals also blanks the module path being asserted on.
 */
function code(src: string): string {
  return stripComments(src)
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

const HANDLER = /^export async function (GET|POST|PATCH|PUT|DELETE)\b/gm;

function handlerBodies(src: string): Array<{ method: string; body: string }> {
  const starts: Array<{ method: string; index: number }> = [];
  for (const m of src.matchAll(HANDLER)) starts.push({ method: m[1], index: m.index ?? 0 });
  return starts.map((s, i) => ({
    method: s.method,
    body: src.slice(s.index, starts[i + 1]?.index ?? src.length),
  }));
}

describe('/api/journal/* — every handler derives identity from the session', () => {
  it('found the journal API surface', () => {
    expect(ROUTES.length).toBeGreaterThanOrEqual(5);
  });

  it.each(ROUTES)('%s imports the canonical resolver', (rel) => {
    expect(stripComments(read(rel))).toMatch(
      /import\s*\{[^}]*getMemberIdFromRequest[^}]*\}\s*from\s*['"]@\/lib\/auth\/getMemberFromRequest['"]/,
    );
  });

  it.each(ROUTES)('%s — every exported handler calls it', (rel) => {
    const bodies = handlerBodies(code(read(rel)));
    expect(bodies.length).toBeGreaterThan(0);
    for (const h of bodies) {
      expect({ route: rel, method: h.method, resolves: /getMemberIdFromRequest\(/.test(h.body) })
        .toEqual({ route: rel, method: h.method, resolves: true });
    }
  });

  it.each(ROUTES)('%s never reads identity from the caller', (rel) => {
    // stripComments, NOT code(): these assertions match on the *argument*
    // (`'userId'`, `'x-member-id'`), and blanking string literals would blank
    // the very thing being matched — making the assertion vacuously pass on the
    // vulnerable code. Verified against a pre-fix control before landing.
    const src = stripComments(read(rel));
    expect(src).not.toMatch(/searchParams\.get\(\s*['"]userId/);
    expect(src).not.toMatch(/headers\.get\(\s*['"]x-member-id/i);
    // `const { userId, ... } = body` — the pre-fix POST shape.
    expect(src).not.toMatch(/const\s*\{[^}]*\buserId\b[^}]*\}\s*=\s*(body|await\s+req)/);
  });

  it.each(ROUTES)('%s does not assign a caller-supplied value to the owner', (rel) => {
    const src = code(read(rel));
    // The owner variable may be the resolver call or an alias of a
    // session-derived one (quick/audio does `const userId = memberId`). What it
    // may never be is anything reachable from the request payload.
    const CALLER_SOURCE = /body|searchParams|nextUrl|headers|params\b|req\.|request\./;
    for (const m of src.matchAll(/const\s+(?:userId|memberId)\s*=\s*([^;]+);/g)) {
      const rhs = m[1].trim();
      if (/getMemberIdFromRequest\(/.test(rhs)) continue; // the resolver itself
      expect({ route: rel, assignment: rhs, callerDerived: CALLER_SOURCE.test(rhs) }).toEqual({
        route: rel,
        assignment: rhs,
        callerDerived: false,
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Behavioural: cross-member denial
// ---------------------------------------------------------------------------

const SESSION_MEMBER = '11111111-1111-4111-8111-111111111111';
const VICTIM_MEMBER = '22222222-2222-4222-8222-222222222222';

const mockResolve = jest.fn<(req: unknown) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (req: unknown) => mockResolve(req),
}));

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (s: string, p?: unknown[]) => mockQuery(s, p) },
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
}));

// Side-effect bridges the route fires and forgets; irrelevant to authorization.
jest.mock('@/lib/capsules/capsuleService', () => ({ createCapsule: jest.fn() }));
jest.mock('@/lib/vector-embeddings', () => ({
  VectorEmbeddingService: class {
    async embed() {
      return null;
    }
  },
}));

const mockReadFile = jest.fn<(p: string) => Promise<Buffer>>();
jest.mock('fs/promises', () => ({
  __esModule: true,
  default: { readFile: (p: string) => mockReadFile(p), mkdir: jest.fn(), writeFile: jest.fn() },
  readFile: (p: string) => mockReadFile(p),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

function req(url: string, body?: unknown): any {
  return {
    url,
    nextUrl: new URL(url),
    headers: new Headers(),
    json: async () => body ?? {},
  };
}

describe('journal reads and writes are bound to the session member', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [] });
  });

  it('GET quick/list refuses an unauthenticated caller', async () => {
    mockResolve.mockResolvedValue(null);
    const { GET } = await import('@/app/api/journal/quick/list/route');
    const res = await GET(req('https://x/api/journal/quick/list'));
    expect(res.status).toBe(401);
  });

  it('GET quick/list ignores a ?userId naming another member', async () => {
    mockResolve.mockResolvedValue(SESSION_MEMBER);
    const { GET } = await import('@/app/api/journal/quick/list/route');
    await GET(req(`https://x/api/journal/quick/list?userId=${VICTIM_MEMBER}`));

    // The victim's id must never reach the database as an owner predicate.
    const allParams = mockQuery.mock.calls.flatMap((c) => (c[1] ?? []) as unknown[]);
    expect(allParams).not.toContain(VICTIM_MEMBER);
    expect(allParams).toContain(SESSION_MEMBER);
  });

  it('POST quick/list writes under the session member, not the body userId', async () => {
    mockResolve.mockResolvedValue(SESSION_MEMBER);
    mockQuery.mockResolvedValue({ rows: [{ id: 'e1', entry_type: 'day', created_at: 'now' }] });
    const { POST } = await import('@/app/api/journal/quick/list/route');
    await POST(
      req('https://x/api/journal/quick/list', {
        userId: VICTIM_MEMBER,
        entryType: 'day',
        content: 'a reflection long enough to bridge',
      }),
    );

    const insert = mockQuery.mock.calls.find((c) => /INSERT INTO quick_journal_entries/i.test(c[0]));
    expect(insert).toBeDefined();
    expect((insert![1] as unknown[])[0]).toBe(SESSION_MEMBER);
  });

  it('POST quick/list refuses an unauthenticated caller before touching the db', async () => {
    mockResolve.mockResolvedValue(null);
    const { POST } = await import('@/app/api/journal/quick/list/route');
    const res = await POST(
      req('https://x/api/journal/quick/list', { userId: VICTIM_MEMBER, entryType: 'day', content: 'x' }),
    );
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('audio-file refuses a path owned by another member', async () => {
    mockResolve.mockResolvedValue(SESSION_MEMBER);
    mockQuery.mockResolvedValue({ rows: [] }); // no legacy username aliases
    const { GET } = await import('@/app/api/journal/quick/audio-file/route');
    const res = await GET(
      req(`https://x/api/journal/quick/audio-file?path=storage/audio/journals/${VICTIM_MEMBER}/a.webm`),
    );
    expect(res.status).toBe(404);
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  it('audio-file serves the session member their own audio', async () => {
    mockResolve.mockResolvedValue(SESSION_MEMBER);
    mockQuery.mockResolvedValue({ rows: [] });
    mockReadFile.mockResolvedValue(Buffer.from('audio'));
    const { GET } = await import('@/app/api/journal/quick/audio-file/route');
    const res = await GET(
      req(`https://x/api/journal/quick/audio-file?path=storage/audio/journals/${SESSION_MEMBER}/a.webm`),
    );
    expect(res.status).toBe(200);
    expect(mockReadFile).toHaveBeenCalled();
  });

  it('audio-file still serves legacy username-scoped audio to its owner', async () => {
    mockResolve.mockResolvedValue(SESSION_MEMBER);
    mockQuery.mockResolvedValue({ rows: [{ username: 'kelly' }] });
    mockReadFile.mockResolvedValue(Buffer.from('audio'));
    const { GET } = await import('@/app/api/journal/quick/audio-file/route');
    const res = await GET(
      req('https://x/api/journal/quick/audio-file?path=storage/audio/journals/kelly-nezat/a.webm'),
    );
    expect(res.status).toBe(200);
  });

  it('audio-file refuses an unauthenticated caller', async () => {
    mockResolve.mockResolvedValue(null);
    const { GET } = await import('@/app/api/journal/quick/audio-file/route');
    const res = await GET(
      req(`https://x/api/journal/quick/audio-file?path=storage/audio/journals/${SESSION_MEMBER}/a.webm`),
    );
    expect(res.status).toBe(401);
    expect(mockReadFile).not.toHaveBeenCalled();
  });
});
