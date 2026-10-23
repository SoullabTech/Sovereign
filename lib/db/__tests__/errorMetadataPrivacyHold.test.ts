/**
 * Class A negative privacy proof for the SHARED Postgres diagnostics.
 * All errors/values are fictional. Actual postgres.ts is loaded, but the pg
 * Pool is fully mocked: no real connection, query, member or Source data.
 * The three red expectations are intentional on published unchanged source.
 */
const mockPoolQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockPoolQuery, on: jest.fn(), connect: jest.fn(),
    totalCount: 0, idleCount: 0, waitingCount: 0,
  })),
}));
import { describeDbError, describeParams, query } from '../postgres';

const MARKER = 'FICTIONAL_PRIVATE_WRITER_METADATA_NEVER_LOG_713';
let logSpy: jest.SpyInstance;

beforeEach(() => {
  mockPoolQuery.mockReset();
  logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  logSpy.mockRestore();
});

describe('Class A HOLD: untrusted DB metadata must not copy raw strings to diagnostics', () => {
  test('EXPECTED RED: arbitrary metadata fields cannot become log payload', () => {
    const err = Object.assign(new Error('fictional generic failure'), {
      name: 'Error_' + MARKER, code: MARKER,
      constraint: 'constraint_' + MARKER,
      severity: 'ERROR_' + MARKER, schema: 'schema_' + MARKER,
    });
    expect(JSON.stringify(describeDbError(err))).not.toContain(MARKER);
  });

  test('EXPECTED RED: throwing metadata getter cannot escape diagnostic filtering', () => {
    const trap = jest.fn(() => { throw new Error(MARKER); });
    const err = Object.defineProperty(Object.create(null), 'code', { get: trap });
    expect(() => describeDbError(err)).not.toThrow();
  });

  test('EXPECTED RED: actual query catch must not log raw untrusted exception metadata', async () => {
    const err = Object.assign(new Error('generic'), {
      name: 'error', code: '23505',
      constraint: 'constraint_' + MARKER,
    });
    mockPoolQuery.mockRejectedValueOnce(err);
    await expect(query('SELECT id FROM fictional WHERE id = $1', [MARKER]))
      .rejects.toBe(err);
    // The parameter is already coarsely redacted; the error metadata is not.
    expect(JSON.stringify(logSpy.mock.calls)).not.toContain(MARKER);
  });
});

describe('GREEN controls: preserve established source-custody and fail-closed SQL truths', () => {
  test('parameter values are never printed and only coarse type survives', () => {
    expect(describeParams([MARKER])).toBe('[string]');
  });

  test('free-form PG message/detail/hint are excluded even on valid SQLSTATE', () => {
    const result = describeDbError({
      name: 'error', code: '23505', severity: 'ERROR',
      message: MARKER, detail: MARKER, hint: MARKER,
    });
    expect(result).toEqual({ name: 'error', code: '23505', severity: 'ERROR' });
    expect(JSON.stringify(result)).not.toContain(MARKER);
  });

  test('missing table is still an error, not a successful empty read', async () => {
    const err = Object.assign(new Error('fictional table unavailable'), {code:'42P01'});
    mockPoolQuery.mockRejectedValueOnce(err);
    await expect(query('SELECT id FROM fictional_absent_table', [])).rejects.toBe(err);
  });
});

describe('Class A HOLD: SQL text is not approved for value-bearing diagnostics', () => {
  test('EXPECTED RED: generic query failure must not print fictional inline SQL text', async () => {
    const err = Object.assign(new Error('fictional query failed'), {code:'42P01'});
    mockPoolQuery.mockRejectedValueOnce(err);
    await expect(query("SELECT '" + MARKER + "' AS fictional_value", []))
      .rejects.toBe(err);
    // Parameter redaction is not enough when a query string carries values.
    expect(JSON.stringify(logSpy.mock.calls)).not.toContain(MARKER);
  });

  test('EXPECTED RED: unexpected governed-refusal query failure must not print inline SQL text', async () => {
    const err = Object.assign(new Error('fictional unexpected failure'), {code:'XX999'});
    mockPoolQuery.mockRejectedValueOnce(err);
    const { queryWithExpectedRefusal } = require('../postgres') as typeof import('../postgres');
    await expect(queryWithExpectedRefusal(
      "SELECT '" + MARKER + "' AS fictional_value", [],
      {fragment: 'KNOWN_REFUSAL_NOT_PRESENT', why: 'fictional-only fixture'},
    )).rejects.toBe(err);
    expect(JSON.stringify(logSpy.mock.calls)).not.toContain(MARKER);
  });

  test('GREEN control: a declared expected SQL refusal remains silent and explicit', async () => {
    const err = new Error('FICTIONAL_EXPECTED_DENIAL');
    mockPoolQuery.mockRejectedValueOnce(err);
    const { queryWithExpectedRefusal } = require('../postgres') as typeof import('../postgres');
    const result = await queryWithExpectedRefusal(
      'SELECT 1', [], {fragment: 'FICTIONAL_EXPECTED_DENIAL', why: 'synthetic refusal'},
    );
    expect(result).toEqual({ refused: true });
    expect(logSpy).not.toHaveBeenCalled();
  });
});
