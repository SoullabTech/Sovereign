/**
 * RF01 R1-B — real PostgreSQL 16 exact-turn deletion + restoration refusal.
 * Entirely fictional member IDs and content, on a specifically pinned local
 * disposable Docker container. No external provider calls or production data.
 */
import { describe,it,expect,beforeAll,beforeEach,afterAll } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import { writeFileSync,unlinkSync } from 'node:fs';
import { query,closePool } from '@/lib/db/postgres';
import { eraseExactFictionalMemberTurns } from '../exactTurnErasure';
import { assertMemberInfluenceAllowed,MemberInfluenceHeld } from '../memberInfluenceHold';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { evaluateSummaryEligibility } from '../sessionSummaryEligibility';

const db=new URL(process.env.DATABASE_URL||'postgresql://invalid:invalid@localhost/');
if(process.env.RF01_R1B_PG16!=='1' ||
   db.protocol!=='postgresql:'||db.hostname!=='127.0.0.1'||
   db.port!=='55482'||db.username!=='rf01'||
   db.pathname!=='/rf01_r1b_fixture'){
 throw new Error('REFUSING_NON_FICTIONAL_R1B_DATABASE');
}

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const S='r1b-a-session';
const OTHER='r1b-a-other-session';
const FOREIGN='r1b-b-session';
const T1='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
const T2='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
const T3='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003';
const T4='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
const CANARY='R1B_FICTIONAL_MEMBER_WORDS';
const SENTINEL='/private/tmp/rf01-r1b-sentinel-dump-20261017.sql';

const args=(turnIds:unknown=[T1],member=A,session=S)=>({
  verifiedMemberId:member,sessionId:session,
  turnIds,explicitMemberConfirmation:true,
});

const count=async(table:string)=>(await query<{n:string}>(
  'SELECT COUNT(*)::text AS n FROM '+table)).rows[0].n;

beforeAll(async()=>{
 const info=await query<{db:string;v:number}>(
  "SELECT current_database() AS db,current_setting('server_version_num')::int AS v");
 expect(info.rows[0].db).toBe('rf01_r1b_fixture');
 expect(info.rows[0].v).toBeGreaterThanOrEqual(160000);
 writeFileSync(SENTINEL,'SELECT 1;\n');
});
beforeEach(async()=>{
 delete process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED;
 await query('DELETE FROM rf01_member_erasure_holds');
 await query('DELETE FROM provenance_tombstones');
 await query('DELETE FROM deletion_manifest_scopes');
 await query('DELETE FROM deletion_manifests');
 await query('DELETE FROM conversation_turns');
 await query('DELETE FROM member_sessions');
 await query('DELETE FROM episodic_memories');
 await query('DELETE FROM member_memory_atoms');
 await query('DELETE FROM maia_sessions');
 await query(
  "INSERT INTO maia_sessions(id,member_id,status,summary) VALUES "+
  "($1,$2,'active',NULL),($3,$2,'active',NULL),($4,$5,'active',NULL)",
  [S,A,OTHER,FOREIGN,B],
 );
 await query(
  "INSERT INTO conversation_turns(id,user_id,session_id,role,content,posture_at_creation) VALUES "+
  "($1,$2,$3,'user',$4,'normal'),($5,$2,$3,'assistant','FICTIONAL_A_REPLY','normal'),"+
  "($6,$2,$7,'user','FICTIONAL_OTHER_SESSION','normal'),"+
  "($8,$9,$10,'user','FICTIONAL_OTHER_MEMBER','normal')",
  [T1,A,S,CANARY,T2,T3,OTHER,T4,B,FOREIGN],
 );
 await query(
  'INSERT INTO episodic_memories(user_id,source_session_id,content) VALUES ($1,$2,$3)',
  [A,S,'FICTIONAL_DERIVED_MEMORY_FROM_DELETED_SOURCE'],
 );
 await query(
  'INSERT INTO member_sessions(member_id,session_id,summary) VALUES ($1,$2,$3)',
  [A,S,'FICTIONAL_OLD_SUMMARY_DERIVATIVE'],
 );
});
afterAll(async()=>{
 delete process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED;
 try{unlinkSync(SENTINEL);}catch{}
 await closePool();
});

describe('RF01 R1-B physical exact-turn custody',()=>{
 it('erasure is held unless a fictional test gate was deliberately enabled',async()=>{
  const result=await eraseExactFictionalMemberTurns(args());
  expect(result).toMatchObject({ok:false,code:'R1B_ERASURE_RELEASE_HELD'});
  expect(await count('conversation_turns')).toBe('4');
  expect(await count('deletion_manifests')).toBe('0');
 });
 it('one confirmed turn deletes exactly one row and persists a tombstone and hold',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  const outcome=await eraseExactFictionalMemberTurns(args());
  expect(outcome).toMatchObject({ok:true,deletedCount:1,influenceHeld:true});
  expect(await count('conversation_turns')).toBe('3');
  expect(await count('deletion_manifests')).toBe('1');
  expect(await count('provenance_tombstones')).toBe('1');
  expect(await count('rf01_member_erasure_holds')).toBe('1');
  const sibling=await query<{id:string}>(
    'SELECT id::text FROM conversation_turns WHERE id=$1',[T2]);
  expect(sibling.rows[0].id).toBe(T2);
  const unaffected=await query<{id:string}>(
    'SELECT id::text FROM conversation_turns WHERE id IN ($1,$2) ORDER BY id',
    [T3,T4],
  );
  expect(unaffected.rows.map(x=>x.id)).toEqual([T3,T4]);
  await expect(assertMemberInfluenceAllowed(A)).rejects.toBeInstanceOf(MemberInfluenceHeld);
  await expect(assertMemberInfluenceAllowed(B)).resolves.toBeUndefined();
  await expect(TurnsStore.getRecentTurns(A)).rejects.toBeInstanceOf(MemberInfluenceHeld);
  const eligible=await evaluateSummaryEligibility({sessionId:S,memberId:A});
  expect(eligible).toMatchObject({
    ok:false,code:'SUMMARY_DELETION_CUSTODY_HOLD',
  });
 });
 it('unrelated member turns cannot be deleted by a claimed ID',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  expect((await eraseExactFictionalMemberTurns(args([T4]))).ok).toBe(false);
  expect(await count('conversation_turns')).toBe('4');
  expect(await count('deletion_manifests')).toBe('0');
 });
 it('cross-session turn IDs refuse the whole operation',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  expect((await eraseExactFictionalMemberTurns(args([T1,T3]))).ok).toBe(false);
  expect(await count('conversation_turns')).toBe('4');
  expect(await count('provenance_tombstones')).toBe('0');
 });
 it('an unknown-historical or Sanctuary-tagged turn is never targetable by this routine',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  await query("UPDATE conversation_turns SET posture_at_creation='unknown-historical' WHERE id=$1",[T1]);
  expect((await eraseExactFictionalMemberTurns(args())).ok).toBe(false);
  await query("UPDATE conversation_turns SET posture_at_creation='sanctuary' WHERE id=$1",[T1]);
  expect((await eraseExactFictionalMemberTurns(args())).ok).toBe(false);
  expect(await count('conversation_turns')).toBe('4');
 });
 it('invalid, missing and duplicate turn lists cannot become blanket deletion',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  for(const ids of [[],['*'],[T1,T1],Array(21).fill(T1),[T1,'not-an-id']]){
    expect((await eraseExactFictionalMemberTurns(args(ids))).ok).toBe(false);
  }
  expect(await count('conversation_turns')).toBe('4');
  expect(await count('deletion_manifests')).toBe('0');
 });
 it('no independently confirmed member action means no deletion',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  const result=await eraseExactFictionalMemberTurns({
    ...args(),explicitMemberConfirmation:false,
  });
  expect(result).toMatchObject({ok:false,code:'R1B_AUTHORIZATION_NOT_ESTABLISHED'});
  expect(await count('conversation_turns')).toBe('4');
 });
 it('repeated and racing requests cannot delete twice or manufacture a second hold',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  const out=await Promise.all([
    eraseExactFictionalMemberTurns(args()),
    eraseExactFictionalMemberTurns(args()),
  ]);
  expect(out.filter(r=>r.ok)).toHaveLength(1);
  expect(out.filter(r=>!r.ok)).toHaveLength(1);
  expect(await count('conversation_turns')).toBe('3');
  expect(await count('provenance_tombstones')).toBe('1');
  expect(await count('deletion_manifests')).toBe('1');
 });
 it('a forced failure after manifest and tombstones rolls back all changes',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  await query(
    "CREATE OR REPLACE FUNCTION rf01_test_fail_delete() RETURNS trigger "+
    "LANGUAGE plpgsql AS $$ BEGIN IF OLD.id::text='"+
    T1+"' THEN RAISE EXCEPTION 'R1B_FIXTURE_DELETE_FAILED'; END IF; RETURN OLD; END $$",
  );
  await query(
    'CREATE TRIGGER rf01_fail_delete_trg BEFORE DELETE ON conversation_turns '+
    'FOR EACH ROW EXECUTE FUNCTION rf01_test_fail_delete()',
  );
  try{
    const result=await eraseExactFictionalMemberTurns(args());
    expect(result.ok).toBe(false);
    expect(await count('conversation_turns')).toBe('4');
    expect(await count('deletion_manifests')).toBe('0');
    expect(await count('provenance_tombstones')).toBe('0');
    expect(await count('rf01_member_erasure_holds')).toBe('0');
  }finally{
    await query('DROP TRIGGER IF EXISTS rf01_fail_delete_trg ON conversation_turns');
    await query('DROP FUNCTION IF EXISTS rf01_test_fail_delete()');
  }
 });
 it('S5 restore trigger refuses resurrecting tombstoned row, retains normal sibling',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  expect((await eraseExactFictionalMemberTurns(args())).ok).toBe(true);
  const copy=await query<{id:string}>(
    "INSERT INTO conversation_turns(id,user_id,session_id,role,content,posture_at_creation) "+
    "VALUES($1,$2,$3,'user',$4,'normal') RETURNING id::text",
    [T1,A,S,CANARY],
  );
  expect(copy.rows).toHaveLength(0);
  expect(await count('conversation_turns')).toBe('3');
  const kept=await query<{id:string}>(
    'SELECT id::text FROM conversation_turns WHERE id=$1',[T2]);
  expect(kept.rows[0].id).toBe(T2);
 });
 it('derived writes cannot silently repopulate while influence hold remains',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  expect((await eraseExactFictionalMemberTurns(args())).ok).toBe(true);
  await expect(query(
    'INSERT INTO episodic_memories(user_id,content) VALUES ($1,$2)',
    [A,'FICTIONAL_RESURRECTED_DERIVATIVE'],
  )).rejects.toThrow();
  await expect(query(
    'INSERT INTO member_memory_atoms(member_id,body) VALUES ($1,$2)',
    [A,'FICTIONAL_RESTORED_MEMBER_MEMORY'],
  )).rejects.toThrow();
  await expect(query(
    'INSERT INTO member_sessions(member_id,session_id,summary) VALUES ($1,$2,$3)',
    [A,OTHER,'FICTIONAL_RESTORED_SUMMARY'],
  )).rejects.toThrow();
  await expect(query(
    'UPDATE episodic_memories SET content=$1 WHERE user_id=$2',
    ['FICTIONAL_RESURRECTED_DERIVATIVE',A],
  )).rejects.toThrow();
  await expect(query(
    'UPDATE member_sessions SET summary=$1 WHERE member_id=$2',
    ['FICTIONAL_RESTORED_SUMMARY',A],
  )).rejects.toThrow();
  // Empty session metadata is allowed; it is not a generated memory.
  const safe=await query<{id:string}>(
    'INSERT INTO member_sessions(member_id,session_id,summary) '+
    'VALUES($1,$2,NULL) RETURNING id::text',[A,OTHER],
  );
  expect(safe.rows).toHaveLength(1);
 });
});
