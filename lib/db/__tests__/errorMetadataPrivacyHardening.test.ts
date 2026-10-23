/**
 * Class A — supplemental fixed-vocabulary PostgreSQL diagnostic regression.
 * Actual postgres.ts executes with a mocked pg.Pool, no network/database.
 * Original negative assertions from test-only draft #1936 are NOT changed.
 */
const mockPoolQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockPoolQuery, on: jest.fn(), connect: jest.fn(),
    totalCount: 0, idleCount: 0, waitingCount: 0,
  })),
}));
import { describeDbError, query } from '../postgres';

const MARKER = 'FICTIONAL_AUTHOR_PRIVATE_SQL_AND_METADATA_714';
let errors: jest.SpyInstance;
let warnings: jest.SpyInstance;

beforeEach(() => {
  mockPoolQuery.mockReset();
  errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('Class A candidate: no untrusted DB exception property becomes a log value', () => {
  test('preserves known, fixed source-custody structural observability', () => {
    const result = describeDbError({
      name: 'error', code: '23505', severity: 'ERROR',
      table: 'members', constraint: 'members_email_key',
      detail: MARKER, message: MARKER, hint: MARKER,
    });
    expect(result).toEqual({
      name: 'error', code: '23505', severity: 'ERROR',
      table: 'members', constraint: 'members_email_key',
    });
  });

  test('rejects invented error codes and plausible-looking arbitrary identifiers', () => {
    const value = describeDbError({
      name: 'error', code: 'ZZ999',
      schema: 'schema_' + MARKER, table: 'members_' + MARKER,
      column: 'id_' + MARKER, dataType: MARKER,
      constraint: 'members_email_key_' + MARKER, routine: MARKER,
    });
    expect(value).toEqual({ name: 'error' });
    expect(JSON.stringify(value)).not.toContain(MARKER);
  });

  test('a forged own metadata getter never runs', () => {
    const trap = jest.fn(() => { throw new Error(MARKER); });
    const err = Object.defineProperty(Object.create(null), 'code', {
      get: trap, enumerable: true,
    });
    expect(describeDbError(err)).toEqual({name: 'unknown'});
    expect(trap).not.toHaveBeenCalled();
  });

  test('a hostile proxy descriptor trap fails closed, never escapes formatting', () => {
    const trap = jest.fn(() => { throw new Error(MARKER); });
    const proxy = new Proxy({}, { getOwnPropertyDescriptor: trap });
    expect(describeDbError(proxy)).toEqual({name: 'unknown'});
    expect(trap).toHaveBeenCalled();
  });
});

describe('Class A candidate: SQL diagnostics include only a fixed operation label', () => {
  test('query error retains rejection but never emits a selected fictional SQL literal', async () => {
    const err = Object.assign(new Error('synthetic failure'), {
      code: '42P01', constraint: 'constraint_' + MARKER,
    });
    mockPoolQuery.mockRejectedValueOnce(err);
    await expect(query("SELECT '" + MARKER + "' AS selection", [MARKER]))
      .rejects.toBe(err);
    expect(JSON.stringify(errors.mock.calls)).not.toContain(MARKER);
    expect(errors.mock.calls).toEqual(expect.arrayContaining([
      ['   SQL operation:', 'SELECT'],
      ['   Params:', '[string]'],
    ]));
  });

  test('unrecognized initial SQL text maps to other, not arbitrary identifiers', async () => {
    const err = new Error('synthetic failure');
    mockPoolQuery.mockRejectedValueOnce(err);
    await expect(query(MARKER + ' SELECT 1', [])).rejects.toBe(err);
    expect(errors.mock.calls).toEqual(expect.arrayContaining([
      ['   SQL operation:', 'other'],
    ]));
    expect(JSON.stringify(errors.mock.calls)).not.toContain(MARKER);
  });

  test('successful slow query warning does not print SQL excerpt', async () => {
    const clock = jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1205);
    mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const result = await query("SELECT '" + MARKER + "' AS literal", []);
    expect(result.rows).toEqual([]);
    expect(warnings).toHaveBeenCalledWith(
      expect.stringContaining('Slow query (205ms)'), 'SELECT',
    );
    expect(JSON.stringify(warnings.mock.calls)).not.toContain(MARKER);
    clock.mockRestore();
  });

  test('ordinary SELECT success is still a real, empty result, not a refusal', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const result = await query('SELECT id FROM fictional_empty', []);
    expect(result.rows).toEqual([]);
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    expect(errors).not.toHaveBeenCalled();
  });
});
