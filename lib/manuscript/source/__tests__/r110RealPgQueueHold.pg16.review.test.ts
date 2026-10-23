/**
 * @jest-environment node
 *
 * R110 Class A EXPECTED-RED. Real unchanged PostgreSQL16 queue SQL and actual
 * destroyVaultBytes(), against strictly ephemeral fictional filesystem roots.
 *
 * CI-only fixed localhost DB guard runs BEFORE importing real application db.
 * No production SQL, shared vault, user Work, authorization or real provider.
 */
const EXPECTED =
  'postgresql://fictional_writer_qa:fictional_only@127.0.0.1:5432/fictional_r110_vault_qa';
if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  process.env.R110_REAL_PG16_QA !== 'TRUE_EPHEMERAL_ONLY' ||
  process.env.DATABASE_URL !== EXPECTED
) {
  throw new Error('R110_TEST_GUARD_REFUSED_BEFORE_DB_IMPORT');
}

import { mkdtemp, mkdir, writeFile, rm, stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Intentionally runtime-imported only after literal CI/DB guard above.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sweepVaultErasureQueue } = require('../eraseManuscript') as typeof import('../eraseManuscript');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { query, closePool } = require('@/lib/db/postgres') as typeof import('@/lib/db/postgres');

const A = 'fictional/member-a-original.bin';
const B = 'fictional/member-b-original.bin';
const FAKE_A = 'FICTIONAL_R110_MEMBER_A_BYTES';
const FAKE_B = 'FICTIONAL_R110_MEMBER_B_BYTES';
let temp = '', namedVault = '', workerLocal = '';
let logged: jest.SpyInstance;
const previous = process.env.FILE_STORAGE_PATH;

async function exists(p: string): Promise<boolean> {
  try { await stat(p); return true; }
  catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw e;
  }
}
async function enqueue(ref: string, ageMinutes=0): Promise<void> {
  await query(
    `INSERT INTO vault_erasure_queue (artifact_ref,queued_at)
       VALUES ($1,now()-($2::integer * interval '1 minute'))`,
    [ref,ageMinutes],
  );
}
async function count(): Promise<number> {
  const r=await query<{n:string}>('SELECT count(*)::int AS n FROM vault_erasure_queue');
  return Number(r.rows[0]?.n ?? -1);
}

beforeAll(async () => {
  const id=await query<{db:string;db_user:string}>(
    'SELECT current_database() db, current_user db_user');
  expect(id.rows[0]).toEqual({
    db:'fictional_r110_vault_qa',db_user:'fictional_writer_qa',
  });
  await query(`CREATE TABLE vault_erasure_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact_ref text NOT NULL CHECK (length(artifact_ref)>0),
    queued_at timestamptz NOT NULL DEFAULT now(),
    attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    last_attempt_at timestamptz,
    last_error text CHECK (last_error IS NULL OR length(last_error)<=32)
  )`);
});
beforeEach(async () => {
  await query('TRUNCATE vault_erasure_queue');
  temp=await mkdtemp(path.join(os.tmpdir(),'r110-pg16-fict-'));
  namedVault=path.join(temp,'named-vault');
  workerLocal=path.join(temp,'worker-image-local');
  await mkdir(path.join(namedVault,'fictional'),{recursive:true});
  await mkdir(workerLocal,{recursive:true});
  await writeFile(path.join(namedVault,A),FAKE_A,{mode:0o600});
  await writeFile(path.join(namedVault,B),FAKE_B,{mode:0o600});
  logged=jest.spyOn(console,'error').mockImplementation(()=>{});
});
afterEach(async () => {
  logged.mockRestore();
  if(previous === undefined) delete process.env.FILE_STORAGE_PATH;
  else process.env.FILE_STORAGE_PATH=previous;
  await rm(temp,{recursive:true,force:true});
});
afterAll(async () => {
  await query('DROP TABLE IF EXISTS vault_erasure_queue');
  await closePool();
});

describe('R110: real PG16 queue does not prove the erasing process sees the original named vault', () => {
  test('EXPECTED RED: image-local worker deletes queue row while authoritative original remains', async () => {
    await enqueue(A);
    process.env.FILE_STORAGE_PATH=workerLocal;
    const observed=await sweepVaultErasureQueue();
    const original=await readFile(path.join(namedVault,A),'utf8');
    expect(original).toBe(FAKE_A);
    // This is currently {destroyed:1,remaining:0}, queueCount 0.
    expect({observed,queueCount:await count()}).toEqual({
      observed:{destroyed:0,remaining:1},queueCount:1,
    });
  });

  test('EXPECTED RED: missing filesystem mount falsely discharges real PG obligation', async () => {
    await enqueue(A);
    process.env.FILE_STORAGE_PATH=path.join(temp,'not-mounted');
    const observed=await sweepVaultErasureQueue();
    expect(await exists(path.join(namedVault,A))).toBe(true);
    expect({observed,queueCount:await count()}).toEqual({
      observed:{destroyed:0,remaining:1},queueCount:1,
    });
  });

  test('GREEN: correct authoritative root erases ONLY targeted original and its PG queue row',async()=>{
    await enqueue(A);
    process.env.FILE_STORAGE_PATH=namedVault;
    expect(await sweepVaultErasureQueue()).toEqual({destroyed:1,remaining:0});
    expect(await count()).toBe(0);
    expect(await exists(path.join(namedVault,A))).toBe(false);
    expect(await readFile(path.join(namedVault,B),'utf8')).toBe(FAKE_B);
  });

  test('GREEN FACT: global remaining=1 can mean unrelated Work B still owed after A is fully erased',async()=>{
    await enqueue(A,15);
    await enqueue(B,0);
    process.env.FILE_STORAGE_PATH=namedVault;
    const result=await sweepVaultErasureQueue(1);
    expect(result).toEqual({destroyed:1,remaining:1});
    expect(await count()).toBe(1);
    expect(await exists(path.join(namedVault,A))).toBe(false);
    expect(await readFile(path.join(namedVault,B),'utf8')).toBe(FAKE_B);
    // A member-facing per-Work 'fully erased' verdict cannot rely on this
    // GLOBAL remaining count. No live product response executed in this test.
  });

  test('GREEN: invalid traversal keeps actual PG obligation, increments attempts and withholds bytes',async()=>{
    await enqueue('../never-delete.txt');
    process.env.FILE_STORAGE_PATH=namedVault;
    const observed=await sweepVaultErasureQueue();
    expect(observed).toEqual({destroyed:0,remaining:1});
    const r=await query<{attempts:number,last_error:string}>(
      'SELECT attempts,last_error FROM vault_erasure_queue');
    expect(r.rows).toEqual([{attempts:1,last_error:'UNKNOWN'}]);
    expect(await exists(path.join(namedVault,A))).toBe(true);
  });

  test('GREEN: absent artifact is idempotent only in the actual correctly selected vault',async()=>{
    await enqueue(A);
    process.env.FILE_STORAGE_PATH=namedVault;
    await rm(path.join(namedVault,A));
    expect(await sweepVaultErasureQueue()).toEqual({destroyed:1,remaining:0});
    expect(await count()).toBe(0);
    expect(await readFile(path.join(namedVault,B),'utf8')).toBe(FAKE_B);
  });

  test('GREEN: duplicate owed rows for one actually removed artifact converge by lawful ENOENT',async()=>{
    await enqueue(A,5);
    await enqueue(A,1);
    process.env.FILE_STORAGE_PATH=namedVault;
    expect(await sweepVaultErasureQueue()).toEqual({destroyed:2,remaining:0});
    expect(await count()).toBe(0);
    expect(await exists(path.join(namedVault,A))).toBe(false);
    expect(await exists(path.join(namedVault,B))).toBe(true);
  });
});
