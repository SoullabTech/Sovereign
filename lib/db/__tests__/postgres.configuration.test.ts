/**
 * DATABASE_URL is an explicit authority boundary.
 *
 * These tests prevent a sanitized, fictional, or misconfigured runtime from
 * silently reaching a populated local database. They do not make a network
 * connection; node-postgres is mocked at the constructor boundary.
 */

import fs from 'node:fs';
import path from 'node:path';

type Loaded = {
  db: typeof import('../postgres');
  Pool: jest.Mock;
  poolQuery: jest.Mock;
};

const originalDatabaseUrl = process.env.DATABASE_URL;

function restoreDatabaseUrl(): void {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
}

function loadDatabaseModule(databaseUrl?: string): Loaded {
  jest.resetModules();
  if (databaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = databaseUrl;

  const poolQuery = jest.fn().mockResolvedValue({
    rows: [{ ok: 1 }],
    rowCount: 1,
    command: 'SELECT',
    oid: 0,
    fields: [],
  });
  const Pool = jest.fn(() => ({
    query: poolQuery,
    on: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  }));
  jest.doMock('pg', () => ({ Pool }));

  let db!: typeof import('../postgres');
  jest.isolateModules(() => {
    db = require('../postgres') as typeof import('../postgres');
  });
  return { db, Pool, poolQuery };
}

afterEach(() => {
  restoreDatabaseUrl();
  jest.resetModules();
  jest.clearAllMocks();
});

afterAll(restoreDatabaseUrl);

describe('Postgres explicit configuration authority', () => {
  it('does not construct a pool and refuses queries when DATABASE_URL is absent', async () => {
    const { db, Pool } = loadDatabaseModule(undefined);

    expect(Pool).not.toHaveBeenCalled();
    expect(db.getDatabaseConfigurationStatus()).toEqual({
      configured: false,
      code: 'DATABASE_URL_REQUIRED',
    });
    expect(() => db.assertDatabaseConfigured()).toThrow(
      expect.objectContaining({
        name: 'DatabaseConfigurationError',
        code: 'DATABASE_URL_REQUIRED',
      }),
    );
    await expect(db.query('SELECT 1')).rejects.toMatchObject({
      name: 'DatabaseConfigurationError',
      code: 'DATABASE_URL_REQUIRED',
    });
  });

  it.each([
    ['not a URL', 'not-a-url'],
    ['a non-Postgres protocol', 'https://127.0.0.1/writer_fixture'],
    ['a URL without a database name', 'postgresql://127.0.0.1/'],
  ])('refuses %s before constructing a pool', async (_caseName, value) => {
    const { db, Pool } = loadDatabaseModule(value);

    expect(Pool).not.toHaveBeenCalled();
    expect(db.getDatabaseConfigurationStatus()).toEqual({
      configured: false,
      code: 'DATABASE_URL_INVALID',
    });
    await expect(db.query('SELECT 1')).rejects.toMatchObject({
      name: 'DatabaseConfigurationError',
      code: 'DATABASE_URL_INVALID',
    });
  });

  it('constructs exactly one pool only for the explicitly named PostgreSQL database', async () => {
    const databaseUrl = 'postgresql://writer_test@127.0.0.1:5432/writer_gate3_fixture';
    const { db, Pool, poolQuery } = loadDatabaseModule(databaseUrl);

    expect(Pool).toHaveBeenCalledTimes(1);
    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({ connectionString: databaseUrl }));
    expect(db.getDatabaseConfigurationStatus()).toEqual({ configured: true, code: null });

    await expect(db.query('SELECT 1')).resolves.toMatchObject({ rows: [{ ok: 1 }] });
    expect(poolQuery).toHaveBeenCalledWith('SELECT 1', []);
  });

  it('contains no executable fallback to the populated local maia_consciousness database', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'postgres.ts'), 'utf8');

    expect(source).not.toContain("process.env.DATABASE_URL ||");
    expect(source).not.toContain(
      "'postgresql://soullab@localhost:5432/maia_consciousness'",
    );
  });
});
