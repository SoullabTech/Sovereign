/**
 * CLASS A R109 — EXPECTED-RED source/physical-filesystem custody proof.
 *
 * Genuine unchanged destroyVaultBytes() and sweepVaultErasureQueue(), real
 * disposable files, entirely synthetic in-memory erasure-queue SQL.
 * No production vault, original Source, member bytes or real PostgreSQL.
 *
 * Two physical directories model the same vault path in separately mounted
 * container namespaces. Missing artifact in a worker's IMAGE-LOCAL path is
 * NOT evidence that the named-volume original is gone.
 */
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  transaction: jest.fn(),
}));
import { sweepVaultErasureQueue } from '../eraseManuscript';

const PRIVATE_FAKE = 'FICTIONAL_R109_TEST_ONLY_ERASURE_MARKER';
const REL = 'fictional/r109-false-completion.bin';

let root = '';
let namedVault = '';
let imageVault = '';
let owed = true;
let lastError: string | null = null;
let diagnostic: jest.SpyInstance;
const oldRoot = process.env.FILE_STORAGE_PATH;

async function exists(file: string): Promise<boolean> {
  try { await stat(file); return true; }
  catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return false; throw e; }
}

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'r109-fictional-'));
  namedVault = path.join(root, 'named-volume');
  imageVault = path.join(root, 'worker-image-local');
  await mkdir(path.join(namedVault, 'fictional'), { recursive: true });
  await mkdir(imageVault, { recursive: true });
  await writeFile(path.join(namedVault, REL), PRIVATE_FAKE, { mode: 0o600 });
  owed = true;
  lastError = null;
  diagnostic = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params?: unknown[]) => {
    if (sql.includes('SELECT id, artifact_ref FROM vault_erasure_queue')) {
      return { rows: owed ? [{ id: 'fictional-queued-id', artifact_ref: REL }] : [] };
    }
    if (sql.includes('DELETE FROM vault_erasure_queue')) {
      if (params?.[0] !== 'fictional-queued-id') throw Error('QA_NOT_OUR_QUEUE_ROW');
      owed = false; return { rows: [] };
    }
    if (sql.includes('UPDATE vault_erasure_queue')) {
      lastError = String(params?.[1] ?? '');
      return { rows: [] };
    }
    if (sql.includes('SELECT count(*)::int AS n FROM vault_erasure_queue')) {
      return { rows: [{ n: owed ? '1' : '0' }] };
    }
    throw Error('QA_UNEXPECTED_QUERY_CLASS');
  });
});
afterEach(async () => {
  diagnostic.mockRestore();
  if (oldRoot === undefined) delete process.env.FILE_STORAGE_PATH;
  else process.env.FILE_STORAGE_PATH = oldRoot;
  await rm(root, { recursive: true, force: true });
});

describe('R109: erasure requires proof from the authoritative mounted vault, not any ENOENT', () => {
  test('EXPECTED RED: worker sees empty IMAGE-LOCAL vault; owed row must not be erased', async () => {
    process.env.FILE_STORAGE_PATH = imageVault;
    const output = await sweepVaultErasureQueue();
    expect(await readFile(path.join(namedVault, REL), 'utf8')).toBe(PRIVATE_FAKE);
    // CURRENT UNCHANGED SOURCE returns { destroyed:1, remaining:0 } and
    // deletes the synthetic queue record despite the real file surviving.
    expect(output).toEqual({ destroyed: 0, remaining: 1 });
    expect(owed).toBe(true);
  });

  test('EXPECTED RED: missing worker vault directory must not discharge a named-volume file', async () => {
    process.env.FILE_STORAGE_PATH = path.join(root, 'never-mounted-at-all');
    const output = await sweepVaultErasureQueue();
    expect(await exists(path.join(namedVault, REL))).toBe(true);
    expect(output).toEqual({ destroyed: 0, remaining: 1 });
    expect(owed).toBe(true);
  });

  test('GREEN: when root is the actual named vault, original bytes are erased before queue clearance', async () => {
    process.env.FILE_STORAGE_PATH = namedVault;
    expect(await sweepVaultErasureQueue()).toEqual({ destroyed: 1, remaining: 0 });
    expect(await exists(path.join(namedVault, REL))).toBe(false);
    expect(owed).toBe(false);
    expect(diagnostic).not.toHaveBeenCalled();
  });

  test('GREEN: path escaping root is refused, queue remains and error type is recorded', async () => {
    process.env.FILE_STORAGE_PATH = namedVault;
    mockQuery.mockImplementationOnce(async () => ({
      rows: [{ id: 'fictional-queued-id', artifact_ref: '../outside.bin' }],
    }));
    const output = await sweepVaultErasureQueue();
    expect(output).toEqual({ destroyed: 0, remaining: 1 });
    expect(owed).toBe(true);
    expect(await exists(path.join(namedVault, REL))).toBe(true);
    expect(lastError).toBe('UNKNOWN');
  });

  test('GREEN: an already absent artifact at the ACTUAL vault root remains idempotent', async () => {
    process.env.FILE_STORAGE_PATH = namedVault;
    await rm(path.join(namedVault, REL));
    const output = await sweepVaultErasureQueue();
    expect(output).toEqual({ destroyed: 1, remaining: 0 });
    expect(owed).toBe(false);
    expect(diagnostic).not.toHaveBeenCalled();
  });
});
