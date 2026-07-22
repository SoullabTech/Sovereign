/**
 * Daily Anchor ambient loader — standing-consent gate, pinned as-is.
 *
 * These tests characterize the CURRENT behavior of lib/anchor/loadRecentAnchors.ts
 * only: the consent-gate predicate as it is actually emitted to Postgres, the
 * parameter contract, the verbatim row mapping, and the graceful-degradation
 * path. They prescribe nothing about consent semantics.
 *
 * Mock discipline (load-bearing): the db mock only RECORDS calls and returns
 * canned rows unfiltered — it never simulates the consent gate. Every gate
 * claim below is asserted against the captured SQL text the loader actually
 * emits, so the tests expose the real query rather than fabricating a gated
 * result. DB-side enforcement of that query is grep-audited at the source
 * level by the refusal registry (R08); here we pin the wiring level — that
 * the gate predicate is what actually reaches the wire on every call.
 *
 * Constitutional anchor: docs/canon/SPIRAL_CONTINUITY_ENGINE.md §7
 * (reflection is invitable, never ambient).
 *
 * Deliberately NOT tested: live-Postgres execution (integration territory),
 * the member-initiated own-review route /api/anchor/recent (intentionally
 * ungated, out of scope per the module doc comment), and the surfacePreference
 * vocabulary (covered by the sibling test).
 */

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import { loadRecentAnchors } from '../loadRecentAnchors';
import { query } from '@/lib/db/postgres';

const mockQuery = query as jest.MockedFunction<typeof query>;

// Mirrors the refusal-registry R08 patterns (refusal-08-anchor-consent-gated-
// surfacing.ts), applied to the emitted query text instead of the source file.
const CONSENT_GATE =
  /surface_preference\s+IN\s*\(\s*'contextual_doorway'\s*,\s*'ritual_review_opt_in'\s*\)/;
const MEMBER_PULLED_ADMITTED = /IN\s*\([^)]*'member_pulled'[^)]*\)/;

const MEMBER_ID = 'member-☿-42'; // distinctive: must never appear inside the SQL text

function emittedSql(): string {
  expect(mockQuery).toHaveBeenCalledTimes(1);
  return mockQuery.mock.calls[0][0] as string;
}

function emittedParams(): any[] {
  expect(mockQuery).toHaveBeenCalledTimes(1);
  return mockQuery.mock.calls[0][1] as any[];
}

let warnSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [] } as any);
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('loadRecentAnchors — standing-consent gate (R08 wiring surface)', () => {
  it('emits exactly one query per call', async () => {
    await loadRecentAnchors(MEMBER_ID);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("emitted SQL admits only 'contextual_doorway' and 'ritual_review_opt_in'", async () => {
    await loadRecentAnchors(MEMBER_ID);
    expect(emittedSql()).toMatch(CONSENT_GATE);
  });

  it("emitted SQL never admits 'member_pulled' into any IN(...) set", async () => {
    await loadRecentAnchors(MEMBER_ID);
    expect(emittedSql()).not.toMatch(MEMBER_PULLED_ADMITTED);
  });

  it('scopes to the member via bound parameter $1 — member id never interpolated', async () => {
    await loadRecentAnchors(MEMBER_ID);
    const sql = emittedSql();
    expect(sql).toMatch(/WHERE\s+member_id\s*=\s*\$1/);
    expect(sql).not.toContain(MEMBER_ID);
    expect(emittedParams()[0]).toBe(MEMBER_ID);
  });

  it('binds the limit as $2 — limit value never interpolated', async () => {
    await loadRecentAnchors(MEMBER_ID, 7);
    const sql = emittedSql();
    expect(sql).toMatch(/LIMIT\s+\$2/);
    expect(sql).not.toContain('7');
    expect(emittedParams()).toEqual([MEMBER_ID, 7]);
  });

  it('targets member_daily_anchors, most-recent-first (ORDER BY anchor_date DESC)', async () => {
    await loadRecentAnchors(MEMBER_ID);
    const sql = emittedSql();
    expect(sql).toMatch(/FROM\s+member_daily_anchors/);
    expect(sql).toMatch(/ORDER\s+BY\s+anchor_date\s+DESC/);
  });
});

describe('loadRecentAnchors — parameter contract', () => {
  it('defaults limit to 3', async () => {
    await loadRecentAnchors(MEMBER_ID);
    expect(emittedParams()).toEqual([MEMBER_ID, 3]);
  });

  it('passes an explicit limit through unchanged', async () => {
    await loadRecentAnchors(MEMBER_ID, 1);
    expect(emittedParams()).toEqual([MEMBER_ID, 1]);
  });

  it('returns [] for a falsy memberId without touching the db', async () => {
    const result = await loadRecentAnchors('');
    expect(result).toEqual([]);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('loadRecentAnchors — row mapping (member words verbatim)', () => {
  it('maps snake_case columns to camelCase with values passed through untransformed', async () => {
    const verbatim = 'I am  learning\nto stay.  — with whitespace & Ω';
    mockQuery.mockResolvedValue({
      rows: [
        {
          date: '2026-07-20',
          prompt_shown: 'What is present for you today?',
          response: verbatim,
          created_at: '2026-07-20T08:00:00.000Z',
        },
      ],
    } as any);

    const result = await loadRecentAnchors(MEMBER_ID);

    expect(result).toEqual([
      {
        date: '2026-07-20',
        promptShown: 'What is present for you today?',
        response: verbatim, // no paraphrase, no trim, no interpretation
        createdAt: '2026-07-20T08:00:00.000Z',
      },
    ]);
  });

  it('preserves db row order (no re-sorting or re-filtering in the loader)', async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { date: '2026-07-20', prompt_shown: 'p2', response: 'r2', created_at: 'c2' },
        { date: '2026-07-19', prompt_shown: 'p1', response: 'r1', created_at: 'c1' },
      ],
    } as any);

    const result = await loadRecentAnchors(MEMBER_ID);

    expect(result.map((r) => r.date)).toEqual(['2026-07-20', '2026-07-19']);
  });

  it('returns [] when the query yields no rows', async () => {
    const result = await loadRecentAnchors(MEMBER_ID);
    expect(result).toEqual([]);
  });
});

describe('loadRecentAnchors — graceful degradation', () => {
  it('returns [] and warns (does not throw) when the query rejects', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    const result = await loadRecentAnchors(MEMBER_ID);

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain(
      '[anchor] loadRecentAnchors failed (graceful degradation):',
    );
  });
});
