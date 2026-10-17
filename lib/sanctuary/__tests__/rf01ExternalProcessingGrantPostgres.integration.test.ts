/**
 * RF01 S1-B physical PostgreSQL 16, fictional data only.
 * Refuses any connection except this one disposable local Docker fixture.
 */
import {describe,it,expect,beforeAll,beforeEach,afterAll} from '@jest/globals';
import {query,closePool} from '@/lib/db/postgres';
import {
 issueAnthropicTurnGrant,verifyAnthropicTurnGrant,S1B_DISCLOSURE,
 S1B_GRANT_AGE_MS,
} from '../externalProcessingGrant';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const SESSION_A='s1b-member-a';
const X='44444444-4444-4444-8444-444444444444';
const NORMAL='55555555-5555-4555-8555-555555555555';
const B_EXCHANGE='66666666-6666-4666-8666-666666666666';
const STALE='77777777-7777-4777-8777-777777777777';
const COMPLETED='88888888-8888-4888-8888-888888888888';
const AUDIT='99999999-9999-4999-8999-999999999999';
const OWNERLESS='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const RACE='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EXPIRED='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const db=new URL(process.env.DATABASE_URL||'postgresql://invalid:invalid@localhost/');
if(process.env.RF01_S1B_PG16!=='1'||db.protocol!=='postgresql:'||
   db.hostname!=='127.0.0.1'||db.port!=='55476'||
   db.username!=='rf01'||db.pathname!=='/rf01_s1b_fixture'){
 throw new Error('REFUSING_UNVERIFIED_OR_REAL_DATABASE');
}
const grant=(exchangeId:string,memberId=A,sessionId=SESSION_A)=>({
 memberId,sessionId,exchangeId,
 disclosureVersion:S1B_DISCLOSURE,explicitProcessorAuthorization:true,
});
beforeAll(async()=>{
 const out=await query<{db:string;v:number}>(
  "SELECT current_database() AS db,current_setting('server_version_num')::integer AS v",
 );
 expect(out.rows[0].db).toBe('rf01_s1b_fixture');
 expect(out.rows[0].v).toBeGreaterThanOrEqual(160000);
});
beforeEach(async()=>{await query('DELETE FROM runtime_processing_grants');});
afterAll(async()=>{await closePool();});
describe('RF01 S1-B physical PostgreSQL custody',()=>{
 it('issues one immutable content-free external processing grant',async()=>{
  const out=await issueAnthropicTurnGrant(grant(X));
  expect(out).toMatchObject({ok:true,processor:'anthropic'});
  expect(await verifyAnthropicTurnGrant(grant(X))).toMatchObject({ok:true});
  const result=await query<{processor:string;purpose:string;disclosure_version:string}>(
   'SELECT processor,purpose,disclosure_version FROM runtime_processing_grants WHERE request_id=$1',
   [X],
  );
  expect(result.rows[0]).toMatchObject({
   processor:'anthropic',purpose:'turn_text_generation',
   disclosure_version:S1B_DISCLOSURE,
  });
 });
 it('exactly repeated member gesture cannot make more than one grant',async()=>{
  expect((await issueAnthropicTurnGrant(grant(X))).ok).toBe(true);
  expect((await issueAnthropicTurnGrant(grant(X))).ok).toBe(true);
  const r=await query<{n:string}>(
   'SELECT COUNT(*)::text AS n FROM runtime_processing_grants WHERE request_id=$1',[X]);
  expect(r.rows[0].n).toBe('1');
 });
 it('foreign member cannot claim A consent or A session',async()=>{
  expect((await issueAnthropicTurnGrant(grant(X,B,SESSION_A))).ok).toBe(false);
  const c=await query<{n:string}>('SELECT COUNT(*)::text AS n FROM runtime_processing_grants');
  expect(c.rows[0].n).toBe('0');
 });
 it('B can authorize only its own expressly chosen Sanctuary turn',async()=>{
  expect((await issueAnthropicTurnGrant(grant(B_EXCHANGE,B,'s1b-member-b'))).ok).toBe(true);
  expect((await verifyAnthropicTurnGrant(grant(B_EXCHANGE,A,SESSION_A))).ok).toBe(false);
 });
 it('Continuity receipt does not authorize this Sanctuary provider grant',async()=>{
  expect((await issueAnthropicTurnGrant(grant(NORMAL))).ok).toBe(false);
 });
 it('a stale 2-hour privacy receipt cannot mint a fresh provider grant',async()=>{
  expect((await issueAnthropicTurnGrant(grant(STALE))).ok).toBe(false);
 });
 it('a completed or ownerless session has no authority to authorize',async()=>{
  expect((await issueAnthropicTurnGrant(grant(COMPLETED,A,'s1b-completed'))).ok).toBe(false);
  expect((await issueAnthropicTurnGrant(grant(OWNERLESS,A,'s1b-ownerless'))).ok).toBe(false);
 });
 it('request-meta audit receipt is not an explicit Sanctuary member choice',async()=>{
  expect((await issueAnthropicTurnGrant(grant(AUDIT))).ok).toBe(false);
 });
 it('concurrent exact grants serialize into one and remain exact',async()=>{
  const outcomes=await Promise.all(Array.from({length:4},()=>
    issueAnthropicTurnGrant(grant(RACE))));
  expect(outcomes.every(o=>o.ok)).toBe(true);
  const c=await query<{n:string}>(
   'SELECT COUNT(*)::text AS n FROM runtime_processing_grants WHERE request_id=$1',[RACE]);
  expect(c.rows[0].n).toBe('1');
 });
 it('first-writer grant cannot be updated into a different provider',async()=>{
  await issueAnthropicTurnGrant(grant(X));
  await expect(query(
   "UPDATE runtime_processing_grants SET processor='moonshot' WHERE request_id=$1",
   [X],
  )).rejects.toThrow();
  expect((await verifyAnthropicTurnGrant(grant(X))).ok).toBe(true);
 });
 it('an expired grant is never revived by exact retry',async()=>{
  await query(
   'INSERT INTO runtime_processing_grants '+
   '(request_id,member_id,session_id,processor,purpose,disclosure_version,granted_at,expires_at) '+
   "VALUES ($1,$2,$3,'anthropic','turn_text_generation',$4,"+
   "NOW()-INTERVAL '10 minutes',NOW()-INTERVAL '5 minutes')",
   [EXPIRED,A,SESSION_A,S1B_DISCLOSURE],
  );
  expect((await verifyAnthropicTurnGrant(grant(EXPIRED))).ok).toBe(false);
  expect((await issueAnthropicTurnGrant(grant(EXPIRED))).ok).toBe(false);
  const t=await query<{seconds:number}>(
   'SELECT EXTRACT(EPOCH FROM (expires_at - granted_at))::float8 AS seconds '+
   'FROM runtime_processing_grants WHERE request_id=$1',[EXPIRED]);
  expect(t.rows[0].seconds).toBe(S1B_GRANT_AGE_MS/1000);
 });
 it('processing grants contain only scoped metadata, no content columns',async()=>{
  const out=await query<{column_name:string}>(
   "SELECT column_name FROM information_schema.columns "+
   "WHERE table_name='runtime_processing_grants' ORDER BY column_name",
  );
  expect(out.rows.map(x=>x.column_name).sort()).toEqual([
   'request_id','member_id','session_id','processor','purpose',
   'disclosure_version','granted_at','expires_at',
  ].sort());
 });
});
