/**
 * RF01 R1-C: live PostgreSQL16 advisory erasure/write fencing and recheck.
 * Fictional actors/turns only; no network, providers, production data or
 * actual restored backups. All SQL is scoped to disposable loopback Docker.
 */
import { describe,it,expect,beforeAll,beforeEach,afterAll } from '@jest/globals';
import { Client } from 'pg';
import { query,closePool } from '@/lib/db/postgres';
import { eraseExactFictionalMemberTurns } from '../exactTurnErasure';
import {
  assertMemberInfluenceAllowed,MemberInfluenceHeld,
} from '../memberInfluenceHold';

const url=new URL(process.env.DATABASE_URL||'postgresql://invalid:invalid@localhost/');
if(process.env.RF01_R1C_PG16!=='1' ||
   url.protocol!=='postgresql:' || url.hostname!=='127.0.0.1' ||
   url.port!=='55484' || url.pathname!=='/rf01_r1c_fixture' ||
   url.username!=='rf01'){
 throw new Error('REFUSING_NON_FICTIONAL_R1C_DATABASE');
}
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const SA='r1c-fict-a';
const SB='r1c-fict-b';
const T1='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
const T2='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002';
const T3='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001';
const LATE='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0009';
const EXTRA='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0010';
const MEMBER_CANARY='R1C_MEMBER_OWN_PRIVATE_WORDS';
const MODEL_CANARY='R1C_MODEL_POTENTIALLY_STALE_RESPONSE';

const getRows=async <T extends Record<string,unknown>=any>(sql:string,params:any[]=[]) =>
 (await query<T>(sql,params)).rows;

const erase=()=>eraseExactFictionalMemberTurns({
 verifiedMemberId:A,sessionId:SA,turnIds:[T1],explicitMemberConfirmation:true,
});

const reset=async()=>{
 await query('DELETE FROM rf01_member_erasure_holds');
 await query('DELETE FROM provenance_tombstones');
 await query('DELETE FROM deletion_manifest_scopes');
 await query('DELETE FROM deletion_manifests');
 await query('DELETE FROM conversation_turns');
 await query('DELETE FROM episodic_memories');
 await query('DELETE FROM member_memory_atoms');
 await query('DELETE FROM member_sessions');
 await query('DELETE FROM maia_sessions');
 await query(
  "INSERT INTO maia_sessions (id,member_id,status,mode,summary,conversation_history) VALUES "+
  "($1,$2,'active','continuity',NULL,'[]'::jsonb),"+
  "($3,$4,'active','continuity',NULL,'[]'::jsonb)",
  [SA,A,SB,B],
 );
 await query(
  "INSERT INTO conversation_turns "+
  "(id,user_id,session_id,role,content,posture_at_creation) VALUES "+
  "($1,$2,$3,'user',$4,'normal'),"+
  "($5,$2,$3,'assistant','R1C_UNRELATED_SIBLING','normal'),"+
  "($6,$7,$8,'user','R1C_OTHER_MEMBER','normal')",
  [T1,A,SA,MEMBER_CANARY,T2,T3,B,SB],
 );
};

beforeAll(async()=>{
 const r=await getRows<{db:string;v:number}>(
  "SELECT current_database() AS db, current_setting('server_version_num')::int AS v",
 );
 expect(r[0].db).toBe('rf01_r1c_fixture');
 expect(r[0].v).toBeGreaterThanOrEqual(160000);
});
beforeEach(async()=>{
 process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
 await reset();
});
afterAll(async()=>{
 delete process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED;
 await closePool();
});

describe('R1-C serialized deletion and content writes',()=>{
 it('one exact erasure leaves unrelated member and sibling turns intact',async()=>{
  expect(await erase()).toMatchObject({ok:true,deletedCount:1});
  const ids=(await getRows<{id:string}>(
   'SELECT id::text FROM conversation_turns ORDER BY id',
  )).map(x=>x.id);
  expect(ids).toEqual([T2,T3]);
  await expect(assertMemberInfluenceAllowed(A)).rejects.toBeInstanceOf(MemberInfluenceHeld);
  await expect(assertMemberInfluenceAllowed(B)).resolves.toBeUndefined();
 });
 it('late conversation writes for deleted actor fail at PostgreSQL even via raw SQL',async()=>{
  expect((await erase()).ok).toBe(true);
  await expect(query(
   "INSERT INTO conversation_turns(id,user_id,session_id,role,content) "+
   "VALUES ($1,$2,$3,'assistant',$4)",
   [LATE,A,SA,MODEL_CANARY],
  )).rejects.toThrow();
  const count=await getRows<{n:string}>(
    'SELECT COUNT(*)::text AS n FROM conversation_turns WHERE id=$1',[LATE],
  );
  expect(count[0].n).toBe('0');
 });
 it('late session conversation-history write fails; metadata-only updates remain legal',async()=>{
  expect((await erase()).ok).toBe(true);
  await expect(query(
   "UPDATE maia_sessions SET conversation_history=$1::jsonb WHERE id=$2",
   [JSON.stringify([{role:'assistant',content:MODEL_CANARY}]),SA],
  )).rejects.toThrow();
  const row=await getRows<{conversation_history:unknown}>(
   'SELECT conversation_history FROM maia_sessions WHERE id=$1',[SA],
  );
  expect(row[0].conversation_history).toEqual([]);
  await query("UPDATE maia_sessions SET updated_at=NOW() WHERE id=$1",[SA]);
 });
 it('late episodic and summary updates refuse after the member hold',async()=>{
  await query(
   'INSERT INTO episodic_memories (user_id,source_session_id,content) VALUES ($1,$2,$3)',
   [A,SA,'R1C_FICTIONAL_PRIOR_EPISODIC'],
  );
  await query(
   'INSERT INTO member_sessions(member_id,session_id,summary) VALUES ($1,$2,$3)',
   [A,SA,'R1C_FICTIONAL_OLDER_SUMMARY'],
  );
  expect((await erase()).ok).toBe(true);
  await expect(query(
   "UPDATE episodic_memories SET content=$1 WHERE user_id=$2",
   [MODEL_CANARY,A],
  )).rejects.toThrow();
  await expect(query(
   'UPDATE member_sessions SET summary=$1 WHERE member_id=$2',
   [MODEL_CANARY,A],
  )).rejects.toThrow();
 });
 it('a paused model result cannot be returned after a committed deletion',async()=>{
  let release!:()=>void;
  const modelDone=new Promise<void>(resolve=>{release=resolve});
  let signalStart!:()=>void;
  const started=new Promise<void>(resolve=>{signalStart=resolve});
  const generated=async()=>{
   await assertMemberInfluenceAllowed(A);
   signalStart();
   await modelDone;
   await assertMemberInfluenceAllowed(A);
   return MODEL_CANARY;
  };
  const pending=generated();
  await started;
  expect((await erase()).ok).toBe(true);
  release();
  await expect(pending).rejects.toBeInstanceOf(MemberInfluenceHeld);
 });
 it('a writer already holding the transaction barrier finishes before erasure',async()=>{
  const writer=new Client({connectionString:process.env.DATABASE_URL});
  await writer.connect();
  let begun=false;
  try {
   await writer.query('BEGIN');
   await writer.query(
    "INSERT INTO conversation_turns(id,user_id,session_id,role,content) "+
    "VALUES($1,$2,$3,'assistant','R1C_PRE_ERASURE_WRITE')",
    [EXTRA,A,SA],
   );
   begun=true;
   let settled=false;
   const pending=erase().then(out=>{settled=true;return out});
   await new Promise(resolve=>setTimeout(resolve,80));
   expect(settled).toBe(false);
   await writer.query('COMMIT');
   begun=false;
   expect((await pending).ok).toBe(true);
   expect((await getRows<{id:string}>(
    'SELECT id::text FROM conversation_turns WHERE id=$1',[EXTRA],
   )).length).toBe(1);
   await expect(query(
    "INSERT INTO conversation_turns(id,user_id,session_id,role,content) "+
    "VALUES($1,$2,$3,'assistant','R1C_LATE_WRITE')",
    [LATE,A,SA],
   )).rejects.toThrow();
  }finally{
   if(begun) await writer.query('ROLLBACK');
   await writer.end();
  }
 });
 it('a held deletion transaction blocks a waiting writer until commit and then refuses',async()=>{
  const erasing=new Client({connectionString:process.env.DATABASE_URL});
  await erasing.connect();
  let begun=false;
  try {
   await erasing.query('BEGIN');
   begun=true;
   await erasing.query(
    'SELECT pg_advisory_xact_lock(hashtextextended($1::text,81017))',[A],
   );
   const manifest='eeeeeeee-eeee-4eee-8eee-eeeeeeee0001';
   await erasing.query(
    "INSERT INTO deletion_manifests(id,reason_class,authorized_by) VALUES "+
    "($1,'governance','r1c-fixture')",[manifest],
   );
   await erasing.query(
    "INSERT INTO rf01_member_erasure_holds(member_id,manifest_id,hold_reason) "+
    "VALUES($1,$2,'exact_turn_erasure_derived_influence_unverified')",
    [A,manifest],
   );
   let settled=false;
   const waiting=query(
    "INSERT INTO conversation_turns(id,user_id,session_id,role,content) "+
    "VALUES($1,$2,$3,'assistant',$4)",
    [LATE,A,SA,MODEL_CANARY],
   ).then(()=>{settled=true;return 'inserted' as const})
    .catch(()=>{settled=true;return 'refused' as const});
   await new Promise(resolve=>setTimeout(resolve,80));
   expect(settled).toBe(false);
   await erasing.query('COMMIT');
   begun=false;
   expect(await waiting).toBe('refused');
   expect((await getRows<{id:string}>(
    'SELECT id::text FROM conversation_turns WHERE id=$1',[LATE],
   ))).toHaveLength(0);
  }finally{
   if(begun) await erasing.query('ROLLBACK');
   await erasing.end();
  }
 });
 it('S5 exact tombstone still refuses reinsertion of erased row',async()=>{
  expect((await erase()).ok).toBe(true);
  const restored=await query<{id:string}>(
   "INSERT INTO conversation_turns(id,user_id,session_id,role,content) "+
   "VALUES($1,$2,$3,'user',$4) RETURNING id::text",
   [T1,A,SA,MEMBER_CANARY],
  );
  expect(restored.rows).toHaveLength(0);
 });
 it('existing conversation ownership cannot be rewritten to evade an erasure hold',async()=>{
   expect((await erase()).ok).toBe(true);
   await expect(query(
     "UPDATE maia_sessions SET member_id=$1 WHERE id=$2",[B,SA],
   )).rejects.toThrow();
   const owner=await getRows<{member_id:string}>(
     'SELECT member_id FROM maia_sessions WHERE id=$1',[SA],
   );
   expect(owner[0].member_id).toBe(A);
 });
 it('another member stays able to write new ordinary turns',async()=>{
  expect((await erase()).ok).toBe(true);
  const out=await query<{id:string}>(
    "INSERT INTO conversation_turns(id,user_id,session_id,role,content) "+
    "VALUES($1,$2,$3,'user','R1C_UNRELATED_MEMBER_NEW') RETURNING id::text",
    [LATE,B,SB],
  );
  expect(out.rows[0].id).toBe(LATE);
 });
});
