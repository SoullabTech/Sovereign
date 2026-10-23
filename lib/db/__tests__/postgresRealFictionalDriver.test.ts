/**
 * Class A REVIEW ONLY: genuine node-postgres + disposable PostgreSQL 16.
 *
 * This test refuses to load the database client unless CI explicitly selects
 * the exact fictional loopback database. No production, member, manuscript,
 * shared staging or service credentials are accepted.
 *
 * Unlike the mocked PG suites, these exceptions are emitted by PostgreSQL 16.
 */
const EXPECTED_DATABASE_URL =
  'postgresql://fictional_writer_qa:fictional_only@127.0.0.1:5432/fictional_writer_privacy_qa';
const QA_GUARD = 'EXACT_DISPOSABLE_PG16_FICTIONAL_ONLY';
const MARKER = 'FICTIONAL_PRIVATE_WRITER_MARKER_715';

let db: typeof import('../postgres');
let errors: jest.SpyInstance;
let warnings: jest.SpyInstance;

beforeAll(() => {
  if (process.env.QA_PG16_EXACT !== QA_GUARD ||
      process.env.DATABASE_URL !== EXPECTED_DATABASE_URL) {
    throw new Error('PG16 fictional-driver test REFUSES: guarded disposable loopback database required');
  }
  // Intentionally imported only after the exact connection guard. The module
  // creates a Pool at import time; this prevents accidental service selection.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  db = require('../postgres') as typeof import('../postgres');
});

beforeEach(() => {
  errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

afterAll(async () => {
  if (db) await db.closePool();
});

describe('Class A real PostgreSQL16 driver log boundary — fictional only', () => {
  test('driver-generated missing-relation 42P01 preserves refusal, never raw SQL or identifier', async () => {
    const table = 'qa_' + MARKER;
    const sql = `SELECT '${MARKER}'::text AS private_literal FROM "${table}"`;
    let original: unknown;
    try {
      await db.query(sql, []);
    } catch (caught) {
      original = caught;
    }
    expect(original).toMatchObject({ code: '42P01' });
    // Real PostgreSQL error includes the named imaginary relation in message.
    expect((original as Error).message).toContain(table);
    expect(JSON.stringify(errors.mock.calls)).not.toContain(MARKER);
    expect(errors.mock.calls).toEqual(expect.arrayContaining([
      ['   SQL operation:', 'SELECT'],
    ]));
  });

  test('real unique-constraint error can quote a fictional value but logs never do', async () => {
    const table = 'fictional_writer_qa_unique_715';
    await db.query(`CREATE TABLE "${table}" (value TEXT PRIMARY KEY)`, []);
    try {
      await db.query(`INSERT INTO "${table}" (value) VALUES ($1)`, [MARKER]);
      errors.mockClear();
      let original: unknown;
      try {
        await db.query(`INSERT INTO "${table}" (value) VALUES ($1)`, [MARKER]);
      } catch (caught) { original = caught; }
      expect(original).toMatchObject({ code: '23505' });
      expect((original as { detail?: string }).detail).toContain(MARKER);
      expect(JSON.stringify(errors.mock.calls)).not.toContain(MARKER);
      expect(errors.mock.calls).toEqual(expect.arrayContaining([
        ['   SQL operation:', 'INSERT'],
        ['   Params:', '[string]'],
      ]));
    } finally {
      await db.query(`DROP TABLE IF EXISTS "${table}"`, []);
    }
  });

  test('real explicit SQL trigger-like refusal stays an unlogged refusal', async () => {
    const sentinel = 'FICTIONAL_EXPECTED_REFUSAL_715';
    const sql = `DO $$ BEGIN RAISE EXCEPTION USING MESSAGE = '${sentinel}'; END $$;`;
    const result = await db.queryWithExpectedRefusal(sql, [], {
      fragment: sentinel,
      why: 'fictional PostgreSQL16 refusal-only control',
    });
    expect(result).toEqual({ refused: true });
    expect(errors).not.toHaveBeenCalled();
  });

  test('unexpected real SQL exception still rejects with no SQL or exception text logged', async () => {
    const sql = `DO $$ BEGIN RAISE EXCEPTION '${MARKER}'; END $$;`;
    let original: unknown;
    try {
      await db.queryWithExpectedRefusal(sql, [], {
        fragment: 'FICTIONAL_DIFFERENT_EXPECTED_REFUSAL',
        why: 'fictional unexpected-error control',
      });
    } catch (caught) { original = caught; }
    expect(original).toMatchObject({ code: 'P0001' });
    expect((original as Error).message).toContain(MARKER);
    expect(JSON.stringify(errors.mock.calls)).not.toContain(MARKER);
    expect(errors.mock.calls).toEqual(expect.arrayContaining([
      ['   SQL operation:', 'DO'],
    ]));
  });

  test('a real slow query emits operation only, not the supplied SQL literal', async () => {
    const rows = await db.query(`SELECT '${MARKER}'::text AS private_value, pg_sleep(0.13)`, []);
    expect(rows.rows[0].private_value).toBe(MARKER);
    expect(warnings).toHaveBeenCalledWith(
      expect.stringContaining('Slow query'), 'SELECT',
    );
    expect(JSON.stringify(warnings.mock.calls)).not.toContain(MARKER);
  });
});
