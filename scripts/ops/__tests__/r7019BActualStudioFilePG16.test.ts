/**
 * R70.19B — actual Studio POST route, disposable PostgreSQL 16 and vault.
 * Auth is a FICTIONAL Jest stub; this does NOT certify real authentication,
 * Co-Lab admission, encryption, offsite recovery or a production upload.
 */
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({get: () => undefined})),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () =>
    process.env.R7019B_FICT_MEMBER || null),
}));
jest.mock('@/lib/studio/getPractitionerIdForMember', () => ({
  getPractitionerIdForMember: jest.fn(async () =>
    process.env.R7019B_FICT_PRACTITIONER || null),
}));
jest.mock('@/lib/team/colabTeams', () => ({
  COLAB_TEAM_COOKIE: 'fictional_team',
  resolveCurrentTeamId: jest.fn(async () => null),
}));

import { NextRequest } from 'next/server';
import { readdir, readFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { POST } from '@/app/api/studio/files/route';
import { query, closePool } from '@/lib/db/postgres';
import { withHeldR7019BCapture, R7019BRefusal } from
  '@/lib/writersStudio/recovery/heldR7019BWriterFence';

const M = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const P = '4b96fbc6-b36d-4fc1-9eb4-ebf286881b09';
const F = '5a1cf779-8c05-4c55-a13f-83ea3c25e03b';
const FICTION = Buffer.from('FICTIONAL STUDIO ORIGINAL. No real member file.');
const enabled = process.env.R7019B_WRITER_FIXTURE==='fictional-only' &&
  process.env.R7019B_FICT_MEMBER===M &&
  process.env.R7019B_FICT_PRACTITIONER===P &&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
    process.env.DATABASE_URL||'') &&
  /^\/private\/tmp\/ws-r7019b-fixture-[a-f0-9]{12}\/vault$/.test(
    process.env.FILE_STORAGE_PATH||'');
const suite = enabled ? describe : describe.skip;
const sleep=(ms:number)=>new Promise(done=>setTimeout(done,ms));
function request(name:string):NextRequest {
  const fd=new FormData();
  fd.append('file',new File([FICTION],name,{type:'text/plain'}));
  fd.set('fileScope','personal');
  return new NextRequest('http://127.0.0.1/api/studio/files',{
    method:'POST',body:fd,
  });
}
async function count(){
  const r=await query<{n:number}>(
    'SELECT count(*)::int as n FROM practitioner_files WHERE practitioner_id=$1',
    [P]);
  return r.rows[0].n;
}

suite('R70.19B real Studio route: held file-byte + SQL consistency',()=>{
  afterAll(async()=>{await closePool();});

  it('a concurrent original upload cannot cross an active snapshot lease',async()=>{
    expect(await count()).toBe(0);
    let upload:Promise<Response>|null=null;
    let settled=false;
    const snap=await withHeldR7019BCapture(M,async(client,root)=>{
      expect(root).toBe(process.env.FILE_STORAGE_PATH);
      upload=POST(request('fictional.txt')) as Promise<Response>;
      upload.then(()=>{settled=true;},()=>{settled=true;});
      await sleep(220);
      expect(settled).toBe(false);
      const rows=await client.query<{n:number}>(
        'SELECT count(*)::int AS n FROM practitioner_files');
      expect(rows.rows[0].n).toBe(0);
      const dir=path.join(root,P);
      const actual=await readdir(dir).catch(()=>[]);
      expect(actual).toEqual([]);
      return {preUploadRows:rows.rows[0].n};
    });
    expect(snap.snapshot.preUploadRows).toBe(0);
    expect(snap.fileCoverage.files).toBe(0);
    expect(snap.releaseApproved).toBe(false);
    expect(upload).not.toBeNull();
    const response=await upload!;
    expect(response.status).toBe(200);
    const data=await response.json();
    expect(data.success).toBe(true);
    expect(data.file.encrypted).toBe(false); // cannot pretend encryption
    expect(await count()).toBe(1);
    const file=await query<{storage_path:string}>(
      'SELECT storage_path FROM practitioner_files WHERE practitioner_id=$1',
      [P]);
    expect(file.rows).toHaveLength(1);
    expect(await readFile(path.join(process.env.FILE_STORAGE_PATH||'',
      file.rows[0].storage_path))).toEqual(FICTION);
    const after=await withHeldR7019BCapture(M,async(c)=>{
      const r=await c.query<{n:number}>(
        'SELECT count(*)::int AS n FROM practitioner_files');
      return {rows:r.rows[0].n};
    });
    expect(after.snapshot.rows).toBe(1);
    expect(after.fileCoverage.files).toBe(1);
    expect(after.fileCoverage.digests).toHaveLength(1);
    expect(after.wholeWriterBackupComplete).toBe(false);
  });

  it('invalid fixture member identity refuses before writing any bytes',async()=>{
    process.env.R7019B_FICT_MEMBER=F;
    try {
      const before=await count();
      const response=await POST(request('foreign.txt'));
      expect(response.status).toBe(500);
      expect(await count()).toBe(before);
      const all=await readdir(path.join(process.env.FILE_STORAGE_PATH||'',P));
      expect(all.some(x=>x.includes('foreign'))).toBe(false);
    } finally { process.env.R7019B_FICT_MEMBER=M; }
  });

  it('a file created without its SQL row makes a later snapshot fail closed',async()=>{
    await query("ALTER TABLE practitioner_files ADD CONSTRAINT r7019b_fixture_orphan_refusal CHECK (name <> 'orphan.txt')");
    const response=await POST(request('orphan.txt'));
    expect(response.status).toBe(500);
    expect(await count()).toBe(1);
    const dir=path.join(process.env.FILE_STORAGE_PATH||'',P);
    const disk=await readdir(dir);
    expect(disk).toHaveLength(2); // real orphan still present after SQL refusal
    await expect(withHeldR7019BCapture(M,async()=>({unexpected:true})))
      .rejects.toMatchObject({code:'unlinked_or_missing_original_bytes'});
    const rows=await query<{storage_path:string}>(
      'SELECT storage_path FROM practitioner_files WHERE practitioner_id=$1',
      [P]);
    const linked=new Set(rows.rows.map(x=>path.basename(x.storage_path)));
    const orphan=disk.find(x=>!linked.has(x));
    expect(orphan).toBeTruthy();
    if(orphan && existsSync(path.join(dir,orphan))) {
      await unlink(path.join(dir,orphan));
    }
    const verified=await withHeldR7019BCapture(M,async()=>({allLinked:true}));
    expect(verified.snapshot.allLinked).toBe(true);
    expect(verified.fileCoverage.files).toBe(1);
    expect(verified.releaseApproved).toBe(false);
  });
});
