/**
 * R5G.90 Class A DRAFT — deliberately RED shared Postgres refusal negatives.
 *
 * Uses the actual reviewed lib/db/postgres.ts from #1942, with pg.Pool mocked.
 * An untrusted Error.message accessor is not verified SQL refusal authority.
 * Read-only, no actual DB/SQL execution, network, member Work, or credentials.
 */
const mockPoolQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockPoolQuery,
    on: jest.fn(), connect: jest.fn(),
    totalCount: 0, idleCount: 0, waitingCount: 0,
  })),
}));
import { queryWithExpectedRefusal } from '../postgres';

const PRIVATE = 'R5G90_FICTIONAL_WRITER_WORDS_NEVER_LOG_OR_SWALLOW_519';
const REFUSAL = 'FICTIONAL_EXPLICIT_REFUSAL_ONLY';
let errorLog: jest.SpyInstance;

beforeEach(() => {
  mockPoolQuery.mockReset();
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

async function caughtQuery(sql: string = "SELECT '" + PRIVATE + "' AS fictitious"): Promise<unknown> {
  try {
    await queryWithExpectedRefusal(sql, [PRIVATE], {
      fragment: REFUSAL, why: 'fictional unit-test denial only',
    });
    return null;
  } catch (err) {
    return err;
  }
}

describe('R5G.90 — untrusted Postgres refusal error shape cannot confer authority', () => {
  test('EXPECTED RED: own throwing message getter must not replace original DB exception', async () => {
    const getter = jest.fn(() => { throw new Error(PRIVATE); });
    const original = Object.defineProperty(new Error('invented database rejection'), 'message', {
      get: getter, configurable: true,
    });
    mockPoolQuery.mockRejectedValueOnce(original);
    const caught = await caughtQuery();
    expect(caught).toBe(original);
    expect(getter).not.toHaveBeenCalled();
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(PRIVATE);
  });

  test('EXPECTED RED: inherited message getter must not spoof a declared SQL refusal', async () => {
    const getMessage = jest.fn(() => REFUSAL);
    const prototype = Object.create(Error.prototype);
    Object.defineProperty(prototype, 'message', { get: getMessage });
    const original = Object.create(prototype);
    Object.assign(original, { name: 'Error', code: 'P0001' });
    mockPoolQuery.mockRejectedValueOnce(original);
    const caught = await caughtQuery();
    expect(caught).toBe(original); // Never silently {refused:true}.
    expect(getMessage).not.toHaveBeenCalled();
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(PRIVATE);
  });

  test('EXPECTED RED: proxy message/descriptor trap must not escape or forge a refusal', async () => {
    const getter = jest.fn(() => { throw new Error(PRIVATE); });
    const descriptorTrap = jest.fn(() => { throw new Error(PRIVATE); });
    const original = new Proxy({ name: 'Error', code: 'P0001' }, {
      get(target, key, receiver) {
        if (key === 'message') return getter();
        return Reflect.get(target, key, receiver);
      },
      getOwnPropertyDescriptor(target, key) {
        if (key === 'message') return descriptorTrap();
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
    });
    mockPoolQuery.mockRejectedValueOnce(original);
    const caught = await caughtQuery();
    expect(caught).toBe(original);
    expect(getter).not.toHaveBeenCalled();
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(PRIVATE);
  });

  test('GREEN: own ordinary Error message matching exact expected refusal stays silent', async () => {
    const original = new Error(REFUSAL);
    mockPoolQuery.mockRejectedValueOnce(original);
    const result = await queryWithExpectedRefusal('DO $$ BEGIN RAISE EXCEPTION; END $$', [], {
      fragment: REFUSAL, why: 'fictional expected refusal',
    });
    expect(result).toEqual({ refused: true });
    expect(errorLog).not.toHaveBeenCalled();
  });

  test('GREEN: genuine unexpected error identity remains and diagnostics redact SQL and params', async () => {
    const original = Object.assign(new Error('FICTIONAL_OTHER_FAILURE_' + PRIVATE), {
      name: 'error', code: '42P01', detail: PRIVATE,
    });
    mockPoolQuery.mockRejectedValueOnce(original);
    const caught = await caughtQuery();
    expect(caught).toBe(original);
    expect(errorLog.mock.calls).toEqual(expect.arrayContaining([
      ['   SQL operation:', 'SELECT'],
      ['   Params:', '[string]'],
    ]));
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(PRIVATE);
  });
});
