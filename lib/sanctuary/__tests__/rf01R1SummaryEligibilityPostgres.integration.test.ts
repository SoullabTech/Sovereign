/**
 * RF01 R1-A — physical PostgreSQL 16, fictional content and in-process
 * Anthropic double only. Never touches real members, network or paid models.
 * The exact local DB and port are mandatory; anything else throws at import.
 */
import {describe,it,expect,beforeAll,beforeEach,afterAll,jest} from '@jest/globals';
import {query,closePool} from '@/lib/db/postgres';
import {
 evaluateSummaryEligibility,
 summaryProviderFixtureEnabled,
 summaryReadFixtureEnabled,
 SUMMARY_RECOVERY_POLICY,
} from '../sessionSummaryEligibility';

const db = new URL(process.env.DATABASE_URL||'postgresql://invalid:invalid@localhost/');
if (process.env.RF01_R1A_PG16 !== '1' ||
  db.protocol !== 'postgresql:' ||
  db.hostname !== '127.0.0.1' ||
  db.port !== '55480' || db.pathname !== '/rf01_r1a_fixture' ||
  db.username !== 'rf01') {
  throw new Error('REFUSING_NON_FICTIONAL_R1A_DATABASE');
}

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const S='r1a-member-a-session';
const X='44444444-4444-4444-8444-444444444444';
const SENSITIVE='RF01_R1A_MEMBER_TURN_CANARY';
const ANSWER='RF01_R1A_ASSISTANT_REPLY_CANARY';
const mockCreate=jest.fn<(...args:any[])=>Promise<any>>();

jest.mock('@anthropic-ai/sdk',()=>({
 __esModule:true,
 default:class MockAnthropic {
  messages={create:(...args:any[])=>mockCreate(...args)};
 },
}));

import {
 generateSessionRemembrance,storeRemembrance,getRecentSummaries,
} from '@/lib/scribe/sovereignSummarizer';
import {SessionSummaryStore} from '@/lib/memory/stores/SessionSummaryStore';
import {finalizeSession} from '@/lib/sovereign/sessionFinalizer';

const eligibility=(over:Record<string,unknown>={})=>
 evaluateSummaryEligibility({sessionId:S,memberId:A,...over});

beforeAll(async()=>{
 const proof=await query<{db:string;v:number}>(
  "SELECT current_database() AS db,current_setting('server_version_num')::integer AS v",
 );
 expect(proof.rows[0].db).toBe('rf01_r1a_fixture');
 expect(proof.rows[0].v).toBeGreaterThanOrEqual(160000);
 expect(SUMMARY_RECOVERY_POLICY).toBe('rf01-r1a-all-turns-explicit-normal-v1');
});
beforeEach(async()=>{
 delete process.env.RF01_R1_SUMMARY_FIXTURE_ENABLED;
 delete process.env.RF01_R1_SUMMARY_READ_FIXTURE_ENABLED;
 mockCreate.mockReset();
 mockCreate.mockImplementation(async()=>({
  content:[{type:'text',text:JSON.stringify({
    essence:'FICTIONAL_SUMMARY_NO_CANARY',
    themes:['care','reflection','fictional'],
    openLoops:[],nextStep:null,
  })}],
 }));
 await query('DELETE FROM session_summary_queue');
 await query('DELETE FROM deletion_manifest_scopes');
 await query('DELETE FROM conversation_turns');
 await query('DELETE FROM runtime_consent_state');
 await query('DELETE FROM maia_sessions');
 await query(
  "INSERT INTO maia_sessions(id,member_id,mode,status) VALUES ($1,$2,'continuity','completed')",
  [S,A],
 );
 await query(
  "INSERT INTO runtime_consent_state(request_id,member_id,session_id,posture,resolved_from) "+
  "VALUES ($1,$2,$3,'normal','member-explicit-preflight-v1')",
  [X,A,S],
 );
 await query(
  'INSERT INTO conversation_turns(session_id,user_id,role,content,exchange_id,seq,posture_at_creation) '+
  "VALUES ($1,$2,'user',$3,$4,0,'normal'),($1,$2,'assistant',$5,$4,1,'normal')",
  [S,A,SENSITIVE,X,ANSWER],
 );
});
afterAll(async()=>{
 delete process.env.RF01_R1_SUMMARY_FIXTURE_ENABLED;
 delete process.env.RF01_R1_SUMMARY_READ_FIXTURE_ENABLED;
 await closePool();
});

describe('R1-A metadata eligibility, no content selected',()=>{
 it('recognizes only an owned entirely explicit Continuity session',async()=>{
  expect(await eligibility()).toEqual({ok:true,turnCount:2});
 });
 it('a later Sanctuary choice blocks the entire mixed session, even without storing a protected turn',async()=>{
  await query(
   "INSERT INTO runtime_consent_state(request_id,member_id,session_id,posture,resolved_from) "+
   "VALUES ($1,$2,$3,'sanctuary','member-explicit-preflight-v1')",
   ['55555555-5555-4555-8555-555555555555',A,S],
  );
  expect(await eligibility()).toMatchObject({
   ok:false,code:'SUMMARY_NON_NORMAL_TURN_OR_CONSENT',
  });
 });
 it('unknown-historical turns cannot be summarized',async()=>{
  await query("UPDATE conversation_turns SET posture_at_creation='unknown-historical' WHERE seq=1");
  expect((await eligibility()).ok).toBe(false);
 });
 it('a persisted protected turn is not admitted even if session mode says Continuity',async()=>{
  await query("UPDATE conversation_turns SET posture_at_creation='sanctuary' WHERE seq=1");
  expect((await eligibility()).ok).toBe(false);
 });
 it('foreign-member material under the session ID is always refused',async()=>{
  await query("UPDATE conversation_turns SET user_id=$1 WHERE seq=1",[B]);
  expect((await eligibility()).ok).toBe(false);
 });
 it('a missing exchange receipt does not count as explicit Continuity',async()=>{
  await query("DELETE FROM runtime_consent_state WHERE request_id=$1",[X]);
  expect((await eligibility()).ok).toBe(false);
 });
 it('legacy request-meta receipt cannot authorize historical derivation',async()=>{
  await query("UPDATE runtime_consent_state SET resolved_from='request-meta'");
  expect((await eligibility()).ok).toBe(false);
 });
 it('legacy NULL exchange identifiers cannot be treated as permission',async()=>{
  await query('UPDATE conversation_turns SET exchange_id=NULL WHERE seq=1');
  expect((await eligibility()).ok).toBe(false);
 });
 it('session mode Sanctuary vetoes otherwise normal historical turns',async()=>{
  await query("UPDATE maia_sessions SET mode='sanctuary' WHERE id=$1",[S]);
  expect((await eligibility()).ok).toBe(false);
 });
 it('ownerless and foreign-owned session claims are refused',async()=>{
  expect((await evaluateSummaryEligibility({sessionId:S,memberId:B})).ok).toBe(false);
  await query('UPDATE maia_sessions SET member_id=NULL WHERE id=$1',[S]);
  expect((await eligibility()).ok).toBe(false);
 });
 it('a deletion manifest scope vetoes later recall or derivatives',async()=>{
  await query(
   "INSERT INTO deletion_manifest_scopes(table_name,session_id) VALUES('conversation_turns',$1)",
   [S],
  );
  expect(await eligibility()).toMatchObject({
   ok:false,code:'SUMMARY_DELETION_CUSTODY_HOLD',
  });
 });
 it('member-wide deletion scope also blocks the derived summary',async()=>{
  await query(
   "INSERT INTO deletion_manifest_scopes(table_name,member_id) VALUES('episodic_memories',$1)",
   [A],
  );
  expect((await eligibility()).ok).toBe(false);
 });
 it('an active session cannot be sent to close-time provider as if finished',async()=>{
  await query("UPDATE maia_sessions SET status='active' WHERE id=$1",[S]);
  expect((await eligibility({requireClosed:true})).ok).toBe(false);
 });
 it('fewer than two verified turns is not an eligible session',async()=>{
  await query("DELETE FROM conversation_turns WHERE seq=1");
  expect((await eligibility()).ok).toBe(false);
 });
});
describe('R1-A summary provider / storage / recall authority',()=>{
 it('production-like default refuses before any external summary provider',async()=>{
  expect(summaryProviderFixtureEnabled()).toBe(false);
  expect(await generateSessionRemembrance(S)).toBeNull();
  expect(mockCreate).not.toHaveBeenCalled();
  await expect(storeRemembrance(S,{
    essence:SENSITIVE,themes:['fictional'],openLoops:[],nextStep:null,
    generatedAt:new Date().toISOString(),
  })).rejects.toThrow('SUMMARY_STORAGE_HELD');
  expect(mockCreate).not.toHaveBeenCalled();
 });
 it('existing historical summaries cannot be reused before R1-B authorization',async()=>{
  expect(summaryReadFixtureEnabled()).toBe(false);
  expect(await getRecentSummaries(A)).toEqual([]);
  expect(await SessionSummaryStore.getRecentSummaries(A)).toEqual([]);
 });
 it('allowed fictional Continuity can generate a test summary without live provider',async()=>{
  process.env.RF01_R1_SUMMARY_FIXTURE_ENABLED='1';
  const summary=await generateSessionRemembrance(S);
  expect(summary?.essence).toBe('FICTIONAL_SUMMARY_NO_CANARY');
  expect(mockCreate).toHaveBeenCalledTimes(1);
  const arg=mockCreate.mock.calls[0][0];
  const prompt=arg.messages[0].content;
  expect(prompt).toContain(SENSITIVE);
  expect(prompt).toContain(ANSWER);
 });
 it('a later Sanctuary receipt prevents a previously eligible summary from being stored',async()=>{
  process.env.RF01_R1_SUMMARY_FIXTURE_ENABLED='1';
  const summary=await generateSessionRemembrance(S);
  expect(summary).not.toBeNull();
  await query(
   "INSERT INTO runtime_consent_state(request_id,member_id,session_id,posture,resolved_from) "+
   "VALUES ($1,$2,$3,'sanctuary','member-explicit-preflight-v1')",
   ['55555555-5555-4555-8555-555555555555',A,S],
  );
  await expect(storeRemembrance(S,summary!)).rejects.toThrow('SUMMARY_STORAGE_INELIGIBLE');
  const stored=await query<{summary:unknown}>(
   'SELECT summary FROM maia_sessions WHERE id=$1',[S]);
  expect(stored.rows[0].summary).toBeNull();
 });
 it('non-destructive ordinary finalization does not write or enqueue any summary',async()=>{
  const result=await finalizeSession({
    memberId:A,sessionId:S,isSanctuary:false,
  });
  expect(result).toMatchObject({ok:true,queued:false,summaryHeld:true});
  const persisted=await query<{summary:unknown;status:string}>(
   'SELECT summary,status FROM maia_sessions WHERE id=$1',[S]);
  expect(persisted.rows[0].summary).toBeNull();
  expect(persisted.rows[0].status).toBe('completed');
  const queued=await query<{n:string}>(
   'SELECT COUNT(*)::text AS n FROM session_summary_queue');
  expect(queued.rows[0].n).toBe('0');
  const raw=await query<{n:string}>(
   'SELECT COUNT(*)::text AS n FROM conversation_turns');
  expect(raw.rows[0].n).toBe('2');
 });
});
