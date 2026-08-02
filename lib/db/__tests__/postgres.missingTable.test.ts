/**
 * A missing database table must never masquerade as an empty member history.
 *
 * These tests pin the ruling of 2026-08-01 (docs/ops/DB_MISSING_TABLE_
 * DEGRADATION_AUDIT_2026-08-01.md): Postgres 42P01 propagates by default. The
 * database layer reports reality; the caller decides whether and how to degrade.
 *
 * The ruling also permits an explicit, table-named opt-in for genuinely staged
 * schema — deliberately NOT built here, because no caller needs one. It gets
 * built against a real caller and its real semantics, not in advance.
 *
 * Regression pressure this holds back: `query()` shipped for eight months
 * translating 42P01 into `{rows: [], rowCount: 0}` for every one of ~750
 * callers, which is how the Studio came to render "you have no works" for a
 * table it could not read. The first test below is the one that would have
 * caught it.
 *
 * `pg` is mocked at the module boundary — these are unit tests about error
 * translation, not about Postgres. Live-schema behaviour is integration
 * territory and deliberately out of scope.
 */

const mockPoolQuery = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockPoolQuery,
    on: jest.fn(),
    connect: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  })),
}));

import { query } from '../postgres';

/** Shaped like a real node-postgres error: code plus the relation-naming message. */
function undefinedTable(table: string) {
  return Object.assign(new Error(`relation "${table}" does not exist`), { code: '42P01' });
}

function okResult(rows: any[]) {
  return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
}

let errorSpy: jest.SpyInstance;

beforeEach(() => {
  mockPoolQuery.mockReset();
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('query() — a missing table is infrastructure failure', () => {
  it('throws on an ordinary missing table instead of returning an empty result', async () => {
    mockPoolQuery.mockRejectedValue(undefinedTable('living_works'));

    await expect(
      query('SELECT id FROM living_works WHERE member_id = $1', ['m-1'])
    ).rejects.toMatchObject({ code: '42P01' });
  });

  it('does not translate 42P01 into a successful empty read (the #867 defect)', async () => {
    mockPoolQuery.mockRejectedValue(undefinedTable('living_works'));

    const result = await query('SELECT id FROM living_works', []).catch((e) => e);

    // The precise regression: this must be an Error, never `{rows: []}`.
    expect(result).toBeInstanceOf(Error);
    expect(result).not.toMatchObject({ rows: [] });
  });

  it('still returns [] for a query that genuinely found no rows', async () => {
    mockPoolQuery.mockResolvedValue(okResult([]));

    const result = await query('SELECT id FROM living_works WHERE member_id = $1', ['m-1']);

    expect(result.rows).toEqual([]);
    expect(result.rowCount).toBe(0);
  });

  it('keeps propagating other schema errors, e.g. 42703 undefined_column', async () => {
    mockPoolQuery.mockRejectedValue(
      Object.assign(new Error('column "titel" does not exist'), { code: '42703' })
    );

    await expect(query('SELECT titel FROM living_works', [])).rejects.toMatchObject({
      code: '42703',
    });
  });
});

describe('a required member-data surface never mistakes missing schema for emptiness', () => {
  /* Stands in for app/api/sovereign/living-works/route.ts GET, whose catch
     returns 500 and whose client has a dedicated `error` phase. Before the
     ruling this route returned 200 {"works":[]} against a missing table and
     the Studio rendered the empty state. */
  async function listWorks(memberId: string) {
    try {
      const rows = await query('SELECT id, title FROM living_works WHERE member_id = $1', [
        memberId,
      ]);
      return { status: 200, body: { works: rows.rows } };
    } catch {
      return { status: 500, body: { error: 'Could not read your works' } };
    }
  }

  it('reports a read failure as 500, not as "you have no works"', async () => {
    mockPoolQuery.mockRejectedValue(undefinedTable('living_works'));

    const res = await listWorks('m-1');

    expect(res.status).toBe(500);
    expect(res.body).not.toEqual({ works: [] });
  });

  it('still reports a genuine empty history as 200 with no works', async () => {
    mockPoolQuery.mockResolvedValue(okResult([]));

    const res = await listWorks('m-1');

    expect(res).toEqual({ status: 200, body: { works: [] } });
  });
});
