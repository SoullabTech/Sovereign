/**
 * Runtime route tests — episodic mark Sanctuary guard + provenance
 * requirement (R17).
 *
 * Companion to tests/constitutional/refusal-registry/refusal-17-*.ts (source-
 * level) and scripts/verify-episodic-sanctuary-guard.ts (real-DB SQL
 * semantics). This file proves the ROUTE's runtime behavior with the db and
 * auth boundaries mocked.
 *
 * GOVERNING RULE (ruled 2026-07-17): no durable episodic mark may be written
 * without a resolvable source. For the present API the only valid source is
 * an authenticated member-owned, non-Sanctuary session. Missing provenance is
 * a Sanctuary-boundary refusal (403, R17), not ordinary validation.
 *
 * The query mock does not blindly return canned rows: before evaluating, it
 * asserts the resolution SQL still carries the exact predicates whose
 * semantics it simulates (both session tables, both sanctuary columns,
 * member-ownership scoping, the owned allowlist). If the route's SQL changes
 * shape, these tests fail loudly instead of green-lighting stale semantics.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextRequest } from 'next/server';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));

import { POST } from '../route';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const queryMock = query as jest.Mock;
const authMock = getMemberIdFromRequest as jest.Mock;

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER_MEMBER = '22222222-2222-4222-8222-222222222222';

interface MaiaSessionRow {
  id: string;
  member_id: string | null;
  mode: 'continuity' | 'sanctuary';
  privacy_mode: 'standard' | 'sanctuary' | 'full';
}
interface MemberSessionRow {
  session_id: string;
  member_id: string;
  mode: 'continuity' | 'sanctuary';
}

let maiaSessions: MaiaSessionRow[] = [];
let memberSessions: MemberSessionRow[] = [];
let insertCalls: unknown[][] = [];

/**
 * Simulate the resolution query's documented semantics — but only after
 * asserting the SQL still contains the predicates being simulated.
 */
function evalResolution(sql: string, params: unknown[]) {
  expect(sql).toMatch(/AS owned/);
  expect(sql).toMatch(/AS is_sanctuary/);
  expect(sql).toMatch(/maia_sessions/);
  expect(sql).toMatch(/member_id\s*=\s*\$2\s*OR\s*member_id\s+IS\s+NULL/);
  expect(sql).toMatch(/mode\s*=\s*'sanctuary'\s*OR\s*privacy_mode\s*=\s*'sanctuary'/);
  expect(sql).toMatch(/member_sessions/);
  expect(sql).toMatch(/member_id\s*=\s*\$2(::uuid)?/);
  const [sid, mid] = params as [string, string];
  const liveOwned = maiaSessions.filter(
    (r) => r.id === sid && (r.member_id === mid || r.member_id === null),
  );
  const finalizedOwned = memberSessions.filter(
    (r) => r.session_id === sid && r.member_id === mid,
  );
  const owned = liveOwned.length > 0 || finalizedOwned.length > 0;
  const is_sanctuary =
    liveOwned.some((r) => r.mode === 'sanctuary' || r.privacy_mode === 'sanctuary') ||
    finalizedOwned.some((r) => r.mode === 'sanctuary');
  return { rows: [{ owned, is_sanctuary }] };
}

function installQueryMock() {
  queryMock.mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('INSERT INTO episodic_memories')) {
      insertCalls.push(params);
      return {
        rows: [
          {
            id: 1,
            episode_id: params[1],
            verbatim_text: params[2],
            marked_by_member: true,
            source_turn_id: params[3],
            source_session_id: params[4],
            created_at: new Date('2026-07-17T00:00:00Z'),
          },
        ],
      };
    }
    if (sql.includes('is_sanctuary')) {
      return evalResolution(sql, params);
    }
    throw new Error(`unexpected query in test: ${sql.slice(0, 80)}`);
  });
}

function markRequest(body: Record<string, unknown>): NextRequest {
  return new Request('http://localhost/api/sovereign/episodes/mark', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const VERBATIM = 'the exact words the member chose to keep';

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  delete process.env.CAPACITOR_BUILD;
  maiaSessions = [];
  memberSessions = [];
  insertCalls = [];
  queryMock.mockReset();
  installQueryMock();
  authMock.mockReset();
  authMock.mockResolvedValue(MEMBER);
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

async function post(body: Record<string, unknown>) {
  const res = await POST(markRequest(body));
  return { res, json: await res.json() };
}

describe('provenance requirement — no durable mark without a resolvable source (constitutional, not validation)', () => {
  // This block is the INVERSION of the former "KNOWN BYPASS" test: a
  // provenance-less mark is now refused and can never reach
  // episodic_memories. Permanent constitutional assertion — if it fails, the
  // provenance contract has been silently reopened.
  test('missing sourceSessionId → 403 R17, no queries at all, no insert', async () => {
    const { res, json } = await post({ verbatimText: VERBATIM });
    expect(res.status).toBe(403);
    expect(json.refusal).toBe('R17');
    expect(json.error).toMatch(/provenance/i);
    expect(queryMock).not.toHaveBeenCalled();
    expect(insertCalls).toHaveLength(0);
  });

  test('empty-string sourceSessionId → 403 R17, no insert', async () => {
    const { res, json } = await post({ verbatimText: VERBATIM, sourceSessionId: '' });
    expect(res.status).toBe(403);
    expect(json.refusal).toBe('R17');
    expect(insertCalls).toHaveLength(0);
  });

  test('malformed (non-string) sourceSessionId → 403 R17, no insert', async () => {
    const { res, json } = await post({ verbatimText: VERBATIM, sourceSessionId: 12345 });
    expect(res.status).toBe(403);
    expect(json.refusal).toBe('R17');
    expect(insertCalls).toHaveLength(0);
  });
});

describe('Sanctuary refusal — own session, all three sanctuary signals', () => {
  test("maia_sessions.mode = 'sanctuary' → 403, no insert", async () => {
    maiaSessions = [{ id: 's1', member_id: MEMBER, mode: 'sanctuary', privacy_mode: 'standard' }];
    const { res, json } = await post({ verbatimText: VERBATIM, sourceSessionId: 's1' });
    expect(res.status).toBe(403);
    expect(json.refusal).toBe('R17');
    expect(insertCalls).toHaveLength(0);
  });

  test("maia_sessions.privacy_mode = 'sanctuary' → 403, no insert", async () => {
    maiaSessions = [{ id: 's2', member_id: MEMBER, mode: 'continuity', privacy_mode: 'sanctuary' }];
    const { res, json } = await post({ verbatimText: VERBATIM, sourceSessionId: 's2' });
    expect(res.status).toBe(403);
    expect(json.refusal).toBe('R17');
    expect(insertCalls).toHaveLength(0);
  });

  test("member_sessions.mode = 'sanctuary' (finalized) → 403, no insert", async () => {
    memberSessions = [{ session_id: 's3', member_id: MEMBER, mode: 'sanctuary' }];
    const { res, json } = await post({ verbatimText: VERBATIM, sourceSessionId: 's3' });
    expect(res.status).toBe(403);
    expect(json.refusal).toBe('R17');
    expect(insertCalls).toHaveLength(0);
  });

  test('anonymous (NULL-owner) sanctuary session still refuses — guard errs toward refusal', async () => {
    maiaSessions = [{ id: 's4', member_id: null, mode: 'sanctuary', privacy_mode: 'sanctuary' }];
    const { res } = await post({ verbatimText: VERBATIM, sourceSessionId: 's4' });
    expect(res.status).toBe(403);
    expect(insertCalls).toHaveLength(0);
  });
});

describe('permitted path — only an owned, non-Sanctuary source writes', () => {
  test('ordinary owned session → 201, verbatim insert proceeds', async () => {
    maiaSessions = [{ id: 's5', member_id: MEMBER, mode: 'continuity', privacy_mode: 'standard' }];
    const { res, json } = await post({ verbatimText: VERBATIM, sourceSessionId: 's5' });
    expect(res.status).toBe(201);
    expect(json.episode.verbatimText).toBe(VERBATIM);
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0][0]).toBe(MEMBER);
  });

  test('NULL-owner ordinary session → 201 (anonymous-start sessions stay markable)', async () => {
    maiaSessions = [{ id: 's5b', member_id: null, mode: 'continuity', privacy_mode: 'standard' }];
    const { res } = await post({ verbatimText: VERBATIM, sourceSessionId: 's5b' });
    expect(res.status).toBe(201);
    expect(insertCalls).toHaveLength(1);
  });
});

describe('fail-closed on resolution error', () => {
  test('resolution query failure → 500, no insert (never fail-open)', async () => {
    queryMock.mockImplementation(async (sql: string) => {
      if (sql.includes('is_sanctuary')) throw new Error('db unreachable');
      throw new Error('INSERT must not be reached when resolution fails');
    });
    const { res } = await post({ verbatimText: VERBATIM, sourceSessionId: 's6' });
    expect(res.status).toBe(500);
    expect(insertCalls).toHaveLength(0);
  });
});

describe('unresolvable sources — one indistinguishable governed denial', () => {
  test("nonexistent, cross-member sanctuary, and cross-member ordinary all yield byte-identical denials", async () => {
    maiaSessions = [
      { id: 'cross-sanct', member_id: OTHER_MEMBER, mode: 'sanctuary', privacy_mode: 'sanctuary' },
      { id: 'cross-ord', member_id: OTHER_MEMBER, mode: 'continuity', privacy_mode: 'standard' },
    ];
    memberSessions = [{ session_id: 'cross-sanct', member_id: OTHER_MEMBER, mode: 'sanctuary' }];

    const nonexistent = await post({ verbatimText: VERBATIM, sourceSessionId: 'ghost' });
    const crossSanctuary = await post({ verbatimText: VERBATIM, sourceSessionId: 'cross-sanct' });
    const crossOrdinary = await post({ verbatimText: VERBATIM, sourceSessionId: 'cross-ord' });

    for (const { res, json } of [nonexistent, crossSanctuary, crossOrdinary]) {
      expect(res.status).toBe(403);
      expect(json.refusal).toBe('R17');
      expect(insertCalls).toHaveLength(0);
    }
    // Identical bodies → no existence oracle: a caller cannot distinguish
    // "not there" from "not yours" from "someone else's Sanctuary".
    expect(crossSanctuary.json).toEqual(nonexistent.json);
    expect(crossOrdinary.json).toEqual(nonexistent.json);
  });
});

describe('refusal hygiene', () => {
  test('every refusal log carries metadata only, never the member content', async () => {
    maiaSessions = [{ id: 's9', member_id: MEMBER, mode: 'sanctuary', privacy_mode: 'sanctuary' }];
    await post({ verbatimText: VERBATIM, sourceSessionId: 's9' }); // sanctuary
    await post({ verbatimText: VERBATIM });                        // no provenance
    await post({ verbatimText: VERBATIM, sourceSessionId: 'nope' }); // unresolvable
    const refusalLines = logSpy.mock.calls
      .map((c) => c.join(' '))
      .filter((l) => l.includes('episodic mark refused'));
    expect(refusalLines).toHaveLength(3);
    for (const line of refusalLines) {
      expect(line).toContain(MEMBER.slice(0, 8));
      expect(line).not.toContain(VERBATIM);
    }
  });

  test('every refusal class leaves episodic_memories untouched (zero INSERT calls across all)', async () => {
    maiaSessions = [
      { id: 'sanct', member_id: MEMBER, mode: 'sanctuary', privacy_mode: 'sanctuary' },
      { id: 'cross', member_id: OTHER_MEMBER, mode: 'continuity', privacy_mode: 'standard' },
    ];
    await post({ verbatimText: VERBATIM });                              // missing
    await post({ verbatimText: VERBATIM, sourceSessionId: '' });         // empty
    await post({ verbatimText: VERBATIM, sourceSessionId: { evil: 1 } }); // malformed
    await post({ verbatimText: VERBATIM, sourceSessionId: 'sanct' });    // sanctuary
    await post({ verbatimText: VERBATIM, sourceSessionId: 'cross' });    // cross-member
    await post({ verbatimText: VERBATIM, sourceSessionId: 'ghost' });    // nonexistent
    expect(insertCalls).toHaveLength(0);
    for (const call of queryMock.mock.calls) {
      expect(String(call[0])).not.toContain('INSERT');
    }
  });
});

describe('live caller contract', () => {
  test('the one live caller (OracleConversation) sends sourceSessionId with every mark', () => {
    // Source-level assertion binding the client to the required contract: the
    // mark fetch body must carry sourceSessionId. If the call site is
    // refactored away from this shape, this fails and the contract must be
    // re-verified at the new call site.
    const src = readFileSync(
      join(process.cwd(), 'components/OracleConversation.tsx'),
      'utf8',
    );
    const callSite = src.match(
      /apiFetch\('\/api\/sovereign\/episodes\/mark',[\s\S]{0,400}?\}\);/,
    );
    expect(callSite).not.toBeNull();
    expect(callSite![0]).toMatch(/sourceSessionId:\s*sessionId/);
  });
});
