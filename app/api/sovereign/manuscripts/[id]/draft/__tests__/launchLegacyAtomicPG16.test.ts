/**
 * Launch P0 legacy draft/history atomicity.
 * Actual Next PUT/POST routes + actual ephemeral PostgreSQL 16 transaction.
 * Same request and idempotency key must retry safely after INSERT failure.
 * NO real member/Work/Source/backup, production PostgreSQL or cloud.
 */
import { Pool } from 'pg';
import { NextRequest } from 'next/server';
const mockMember=jest.fn();
const mockQuery=jest.fn();
const mockTransaction=jest.fn();
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromRequest:(...args:unknown[])=>mockMember(...args),
}));
jest.mock('@/lib/db/postgres',()=>({
 query:(...args:unknown[])=>mockQuery(...args),
 transaction:(...args:unknown[])=>mockTransaction(...args),
}));
jest.mock('@/lib/manuscript/render/renderMemberBook',()=>({
 computeSourceHash:jest.fn(()=> 'fictional-hash'),
}));
import {PUT as save} from '@/app/api/sovereign/manuscripts/[id]/draft/route';
import {POST as restore} from '@/app/api/sovereign/manuscripts/[id]/draft/revisions/route';

const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='66666666-6666-4666-8666-666666666666';
const MANUSCRIPT='22222222-2222-4222-8222-222222222222';
const DRAFT='33333333-3333-4333-8333-333333333333';
const INITIAL='A fictional first draft.\r\nOnly invented writing.';
const UPDATED='A revised fictional draft. 🜂\r\nNo personal material.';
const initialGuard={baseRevisionId:7,idempotencyKey:'fiction-save-0001'};
const restoreGuard={baseRevisionId:8,idempotencyKey:'fiction-restore-0001'};
const exact=process.env.WS_LAUNCH_LEGACY_ATOMIC_FIXTURE==='fictional-only'&&
 process.env.WS_LAUNCH_LEGACY_ATOMIC_PHASE==='physical'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d{2,5}\/ws_writer$/.test(
   process.env.DATABASE_URL||'')&&
 /^ws-launch-atomic-pg16-[a-f0-9]{12}$/.test(
   process.env.WS_LAUNCH_ATOMIC_PG_CONTAINER||'')&&
 /^[a-f0-9]{24}$/.test(process.env.WS_LAUNCH_ATOMIC_NONCE||'');
const suite=exact?describe:describe.skip;
let pool:Pool|null=null;
const ctx={params:Promise.resolve({id:MANUSCRIPT})};
function req(path:'draft'|'draft/revisions',content:Record<string,unknown>) {
 return new NextRequest('https://soullab.life/api/sovereign/manuscripts/'+
   MANUSCRIPT+'/'+path,{
    method:path==='draft'?'PUT':'POST',
    headers:{'content-type':'application/json',origin:'https://soullab.life',
      'sec-fetch-site':'same-origin'},
    body:JSON.stringify(content),
   });
}
const saveReq=()=>req('draft',{content:UPDATED,checkpoint:true,
  note:'Fictional checkpoint',...initialGuard});
const restoreReq=()=>req('draft/revisions',{revisionNumber:1,...restoreGuard});
const select=async()=>{
 const r=await pool!.query<{
  content:string;version:string;revision_count:number;
  last_idempotency_key:string|null;last_idempotency_op:string|null;
 }>('SELECT content,version,revision_count,last_idempotency_key,'+
     'last_idempotency_op FROM manuscript_working_drafts WHERE id=$1',[DRAFT]);
 expect(r.rows).toHaveLength(1);
 return r.rows[0];
};
const revisionCount=async()=>{
 const r=await pool!.query<{n:number}>(
  'SELECT count(*)::int as n FROM working_draft_revisions WHERE draft_id=$1',[DRAFT]);
 return r.rows[0].n;
};
const inject=async(fail:boolean)=>{
 await pool!.query('UPDATE ws_fixture_revision_trigger SET fail_on_insert=$1',[fail]);
};

suite('actual legacy draft CHECKPOINT + RESTORE must be atomic in PostgreSQL16',()=>{
 beforeAll(async()=>{
  pool=new Pool({connectionString:process.env.DATABASE_URL,
   max:2,connectionTimeoutMillis:2000});
  const nonce=await pool.query<{nonce:string}>(
   'SELECT nonce FROM ws_fixture_identity');
  expect(nonce.rows).toHaveLength(1);
  expect(nonce.rows[0].nonce).toBe(process.env.WS_LAUNCH_ATOMIC_NONCE);
  const ver=await pool.query<{server_version:string}>('SHOW server_version');
  expect(ver.rows[0].server_version).toMatch(/^16\./);
  mockQuery.mockImplementation((sql:string,params?:unknown[])=>pool!.query(sql,params));
  mockTransaction.mockImplementation(async(callback:(tx:{
     query:(sql:string,params?:unknown[])=>Promise<unknown>
   })=>Promise<unknown>)=>{
   const client=await pool!.connect();
   try{
    await client.query('BEGIN');
    const value=await callback({query:(sql,params)=>client.query(sql,params)});
    await client.query('COMMIT');
    return value;
   }catch(err){
    await client.query('ROLLBACK');
    throw err;
   }finally{client.release();}
  });
 });
 afterAll(async()=>{if(pool)await pool.end();});
 beforeEach(()=>{
  mockMember.mockReset();
  mockMember.mockResolvedValue(MEMBER);
  mockQuery.mockClear();
  mockTransaction.mockClear();
 });
 it('precondition: current sectionless draft version seven, one immutable revision',async()=>{
  expect(await select()).toMatchObject({
   content:INITIAL,version:'7',revision_count:1,last_idempotency_key:null,
  });
  expect(await revisionCount()).toBe(1);
 });
 it('checkpoint INSERT failure rolls back UPDATE/version/idempotency',async()=>{
  await inject(true);
  const response=await save(saveReq(),ctx);
  expect(response.status).toBe(500);
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(await select()).toMatchObject({
   content:INITIAL,version:'7',revision_count:1,last_idempotency_key:null,
  });
  expect(await revisionCount()).toBe(1);
 });
 it('retry identical checkpoint gesture saves one revision and exact response',async()=>{
  await inject(false);
  const response=await save(saveReq(),ctx);
  expect(response.status).toBe(200);
  const body=await response.json();
  expect(body.checkpointed).toBe(true);
  expect(body.revisionCount).toBe(2);
  expect(body.revisionId).toBe(8);
  expect((await select())).toMatchObject({
   content:UPDATED,version:'8',revision_count:2,
   last_idempotency_key:initialGuard.idempotencyKey,
   last_idempotency_op:'save',
  });
  expect(await revisionCount()).toBe(2);
 });
 it('same checkpoint idempotency receipt cannot produce a duplicate',async()=>{
  const response=await save(saveReq(),ctx);
  expect(response.status).toBe(200);
  expect((await response.json()).revisionCount).toBe(2);
  expect(await revisionCount()).toBe(2);
  expect((await select()).version).toBe('8');
  // Current Source performs replay verification under a row lock. Entering one
  // transaction is expected; the invariant is no duplicate state or history.
  expect(mockTransaction).toHaveBeenCalledTimes(1);
 });
 it('restore history INSERT failure rolls back current state/version',async()=>{
  await inject(true);
  const response=await restore(restoreReq(),ctx);
  expect(response.status).toBe(500);
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(await select()).toMatchObject({
   content:UPDATED,version:'8',revision_count:2,
   last_idempotency_key:initialGuard.idempotencyKey,
  });
  expect(await revisionCount()).toBe(2);
 });
 it('retry exact restore persists content AND new append-only history together',async()=>{
  await inject(false);
  const response=await restore(restoreReq(),ctx);
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
   revisionCount:3,revisionId:9,restoredFrom:1,
  });
  expect(await select()).toMatchObject({
   content:INITIAL,version:'9',revision_count:3,
   last_idempotency_key:restoreGuard.idempotencyKey,
   last_idempotency_op:'restore',
  });
  expect(await revisionCount()).toBe(3);
 });
 it('a duplicate restore is idempotent and preserves current history',async()=>{
  const response=await restore(restoreReq(),ctx);
  expect(response.status).toBe(200);
  expect((await response.json()).restoredFrom).toBe(1);
  expect(await revisionCount()).toBe(3);
  expect((await select()).version).toBe('9');
  // Restore replay is verified against immutable history inside one transaction.
  expect(mockTransaction).toHaveBeenCalledTimes(1);
 });
 it('cross-member save and restore refuse without changing any row',async()=>{
  mockMember.mockResolvedValue(FOREIGN);
  expect((await save(saveReq(),ctx)).status).toBe(404);
  expect((await restore(restoreReq(),ctx)).status).toBe(404);
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(await revisionCount()).toBe(3);
  expect((await select()).version).toBe('9');
 });
 it('same member stale base never advances or inserts history',async()=>{
  const stale=await save(req('draft',{content:'stale fictional',checkpoint:true,
   baseRevisionId:7,idempotencyKey:'fiction-stale-333'}),ctx);
  expect(stale.status).toBe(409);
  // The stale base is checked after the member-owned row is locked; refusal
  // still leaves both current text and append-only history unchanged.
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(await revisionCount()).toBe(3);
  expect((await select()).version).toBe('9');
 });
});
