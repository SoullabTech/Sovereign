/**
 * R5G.91 Class A review-only PostgreSQL expected-refusal acceptance edges.
 * The actual shared postgres client runs against a fictional jest pg.Pool.
 * No real database, member material, provider, credential or network.
 */
const mockPoolQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockPoolQuery, on: jest.fn(), connect: jest.fn(),
    totalCount: 0, idleCount: 0, waitingCount: 0,
  })),
}));
import { queryWithExpectedRefusal } from '../postgres';

const REFUSAL = 'FICTIONAL_EXPECTED_SQL_REFUSAL_872';
const SECRET = 'R5G91_FICTIONAL_PRIVATE_WRITING_NEVER_LOG_872';
let spy: jest.SpyInstance;
const options = { fragment: REFUSAL, why: 'test-only declared refusal' };
const statement = "SELECT '" + SECRET + "' AS synthetic_literal";

beforeEach(() => {
  mockPoolQuery.mockReset();
  spy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('R5G.91 — only an own string data value can match a declared refusal', () => {
  test('own Error message matches; expected refusal is silent', async () => {
    mockPoolQuery.mockRejectedValueOnce(new Error(REFUSAL));
    await expect(queryWithExpectedRefusal(statement, [SECRET], options))
      .resolves.toEqual({ refused: true });
    expect(spy).not.toHaveBeenCalled();
  });

  test('own accessor returning matching refusal cannot authorize it', async () => {
    const getter = jest.fn(() => REFUSAL);
    const original = Object.defineProperty(new Error('synthetic DB failure'), 'message', {
      get: getter, configurable: true,
    });
    mockPoolQuery.mockRejectedValueOnce(original);
    await expect(queryWithExpectedRefusal(statement, [SECRET], options))
      .rejects.toBe(original);
    expect(getter).not.toHaveBeenCalled();
    expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
  });

  test('inherited string property without an own message is not refusal evidence', async () => {
    const proto = Object.create(null);
    Object.defineProperty(proto, 'message', { value: REFUSAL });
    const original = Object.create(proto);
    original.code = 'P0001';
    mockPoolQuery.mockRejectedValueOnce(original);
    await expect(queryWithExpectedRefusal(statement, [SECRET], options))
      .rejects.toBe(original);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
  });

  test('own malformed message must not match an expected refusal', async () => {
    const original = { name: 'Error', code: 'P0001', message: { text: REFUSAL } };
    mockPoolQuery.mockRejectedValueOnce(original);
    await expect(queryWithExpectedRefusal(statement, [SECRET], options))
      .rejects.toBe(original);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
  });

  test('descriptor-throwing proxy cannot replace the original DB rejection', async () => {
    const trap = jest.fn(() => { throw new Error(SECRET); });
    const original = new Proxy({ name: 'Error', code: 'P0001' }, {
      getOwnPropertyDescriptor(_target, key) {
        if (key === 'message') return trap();
        return undefined;
      },
    });
    mockPoolQuery.mockRejectedValueOnce(original);
    await expect(queryWithExpectedRefusal(statement, [SECRET], options))
      .rejects.toBe(original);
    expect(trap).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
  });

  test('P0001 SQLSTATE alone cannot authorize expected refusal', async () => {
    const original = Object.assign(new Error('some other fictional rejection'), {
      code: 'P0001', name: 'error', detail: SECRET,
    });
    mockPoolQuery.mockRejectedValueOnce(original);
    await expect(queryWithExpectedRefusal(statement, [SECRET], options))
      .rejects.toBe(original);
    expect(spy.mock.calls).toEqual(expect.arrayContaining([
      ['   SQL operation:', 'SELECT'],
      ['   Params:', '[string]'],
    ]));
    expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
  });

  test('unexpected primitive rejection is preserved and diagnostics remain content-free', async () => {
    mockPoolQuery.mockRejectedValueOnce(SECRET);
    await expect(queryWithExpectedRefusal(statement, [SECRET], options))
      .rejects.toBe(SECRET);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
  });
});
