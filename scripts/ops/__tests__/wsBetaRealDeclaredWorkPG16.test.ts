/** R53 — Actual Next route + actual auth_sessions/consent/Work SQL on
 * one disposable localhost PostgreSQL 16 database. ALL member data invented.
 * Not operational KMS, real login, protected writing or live Next serving.
 */
import {NextRequest} from 'next/server';
import {query,closePool} from '@/lib/db/postgres';
import {GET}
 from '@/app/api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness/route';
import {verifyWriterReadinessScope}
 from '@/lib/writersStudio/release/verifyWriterReadinessScope';

const ready=process.env.R53_REAL_DECLARED_WORK_PG16==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_readiness$/.test(
  process.env.DATABASE_URL||'');
const active=ready?describe:describe.skip;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const M='33333333-3333-4333-8333-333333333333';
const FOREIGN='44444444-4444-4444-8444-444444444444';
const L1='55555555-5555-4555-8555-555555555555';
const L2='66666666-6666-4666-8666-666666666666';
const OTHER='88888888-8888-4888-8888-888888888888';
const EMPTY='99999999-9999-4999-8999-999999999999';
const MISSING='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const route=(id:string,token?:string,method='GET')=>{
 const url='https://soullab.life/api/sovereign/writers-studio/manuscripts/'+
  id+'/protected-readiness';
 const req=new NextRequest(url,{
  method,headers:token?{'x-session-token':token}:{},
 });
 return GET(req,{params:Promise.resolve({manuscriptId:id})});
};
const internal=(id:string,token:string)=>{
 const url='https://soullab.life/api/sovereign/writers-studio/manuscripts/'+
  id+'/protected-readiness';
 return verifyWriterReadinessScope(new NextRequest(url,{
  method:'GET',headers:{'x-session-token':token},
 }),id);
};
active('R53 real handler uses real SQL with only fictional accounts',()=>{
 afterAll(async()=>{if(ready)await closePool();});
 it('fake author + exact notice and two declared Living Works still return 423 HOLD',async()=>{
  const i=await internal(M,'fictional-session-A');
  expect(i).toEqual({
   kind:'verified_member_owns_legacy_manuscript',
   memberId:A,manuscriptId:M,
   declaredLivingWorkIds:[L1,L2],
   mayWrite:false,releaseApproved:false,
  });
  const res=await route(M,'fictional-session-A');
  expect(res.status).toBe(423);
  expect(res.headers.get('cache-control')).toContain('no-store');
  const j=await res.json();
  expect(j).toMatchObject({
   kind:'protected_writer_not_yet_qualified',
   canApply:false,canSave:false,canUndo:false,canImport:false,
   encryptedWorkVerified:false,releaseApproved:false,
  });
  for(const id of [A,M,L1,L2])expect(JSON.stringify(j)).not.toContain(id);
 });
 it('actual session-token query can accept a same-session cookie as web transport',async()=>{
  const req=new NextRequest(
   'https://soullab.life/api/sovereign/writers-studio/manuscripts/'+
    M+'/protected-readiness',
   {method:'GET',headers:{cookie:'maia_session=fictional-session-A'}});
  expect((await GET(req,{params:Promise.resolve({
   manuscriptId:M})})).status).toBe(423);
 });
 it('member B cannot see A manuscript and A cannot see B manuscript',async()=>{
  const b=await route(M,'fictional-session-B');
  const a=await route(FOREIGN,'fictional-session-A');
  const missing=await route(MISSING,'fictional-session-A');
  expect(b.status).toBe(404);
  expect(a.status).toBe(404);
  expect(missing.status).toBe(404);
  expect(await a.json()).toEqual(await missing.json());
 });
 it('unattached A manuscript remains unlinked rather than auto-created',async()=>{
  const i=await internal(EMPTY,'fictional-session-A');
  expect(i).toMatchObject({
   kind:'verified_member_owns_legacy_manuscript',
   declaredLivingWorkIds:[],mayWrite:false,
  });
  expect((await route(EMPTY,'fictional-session-A')).status).toBe(423);
  const d=await query<{n:string}>(`
   SELECT count(*)::text AS n FROM living_work_expressions
    WHERE expression_id=$1`,[EMPTY]);
  expect(d.rows[0].n).toBe('0');
 });
 it('an invented foreign-owner Work declaration cannot be inferred',async()=>{
  // Even if the foreign Work declares its own manuscript, the server-only
  // mapping for A's manuscript is ONLY A's two explicit declarations.
  const result=await internal(M,'fictional-session-A');
  if(result.kind==='refused')throw Error('expected owner-scope');
  expect(result.declaredLivingWorkIds).not.toContain(OTHER);
  expect(result.declaredLivingWorkIds).toEqual([L1,L2]);
 });
 it('revoked/expired/not-present tokens and conflicting claims refuse',async()=>{
  expect((await route(M,'fictional-session-revoked')).status).toBe(401);
  expect((await route(M,'fictional-session-expired')).status).toBe(401);
  expect((await route(M)).status).toBe(401);
  const url='https://soullab.life/api/sovereign/writers-studio/manuscripts/'+
   M+'/protected-readiness';
  const r=new NextRequest(url,{method:'GET',headers:{
   cookie:'maia_session=fictional-session-A',
   'x-session-token':'fictional-session-B'}});
  expect((await GET(r,{params:Promise.resolve({
   manuscriptId:M})})).status).toBe(403);
  const spoof=new NextRequest(url,{method:'GET',headers:{
   'x-session-token':'fictional-session-A','x-member-id':B,
  }});
  expect((await GET(spoof,{params:Promise.resolve({
   manuscriptId:M})})).status).toBe(403);
 });
 it('a later real SQL consent revocation for A denies GET even with active session',async()=>{
  await query(`
   INSERT INTO writers_studio_beta_consent_events
    (member_id,actor_member_id,decision,policy_version,policy_sha256)
   VALUES($1,$1,'revoke','synthetic-v1',$2)`,[A,'b'.repeat(64)]);
  const r=await route(M,'fictional-session-A');
  expect(r.status).toBe(404);
  expect((await r.json()).releaseApproved).toBe(false);
 });
});
