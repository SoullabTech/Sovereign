/** Actual production DB trigger + R1K writer consent lock. Test-only disposable
 * PostgreSQL 16, no production members, plaintext, provider or browser. */
import assert from 'node:assert/strict';
import {Pool} from 'pg';
import {closePool} from '@/lib/db/postgres';
import {
 recordWriterBetaConsentDecisionR1K,
 withLockedCurrentWriterConsentR1K,
} from '@/lib/writersStudio/release/serializedWriterBetaConsentR1K';
const url=process.env.DATABASE_URL||'';
if(process.env.R1M_PHYSICAL_FIXTURE!=='fictional-only'||
   !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_beta_fence$/.test(url))
 throw Error('R1M_REFUSE_NON_FICTIONAL_DB');
const M='11111111-1111-4111-8111-111111111111';
const OTHER='22222222-2222-4222-8222-222222222222';
const POLICY={policyVersion:'r1m-fictional-current',policySHA256:'e'.repeat(64)};
const inspector=new Pool({connectionString:url,max:4,connectionTimeoutMillis:3000});
const checks:string[]=[];
const pass=(label:string)=>checks.push(label);
const nap=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
async function q<T=any>(sql:string,params:unknown[]=[]):Promise<T[]>{
 return (await inspector.query(sql,params)).rows as T[];
}
async function last(){
 const rows=await q<{decision:string}>(
  'SELECT decision FROM writers_studio_beta_consent_events WHERE member_id=$1 ORDER BY seq DESC LIMIT 1',[M]);
 return rows[0]?.decision??null;
}
async function insertDirectRevoke():Promise<void>{
 await inspector.query(
   `INSERT INTO writers_studio_beta_consent_events
    (member_id,actor_member_id,decision,policy_version,policy_sha256)
    VALUES($1,$1,'revoke',$2,$3)`,
   [M,POLICY.policyVersion,POLICY.policySHA256]);
}
async function main(){
 try{
  const members=await q<{n:number}>('SELECT count(*)::int AS n FROM members');
  assert.equal(members[0]?.n,1);
  const catalog=await q<{name:string}>(
   `SELECT tgname AS name FROM pg_trigger
     WHERE tgrelid='writers_studio_beta_consent_events'::regclass
       AND tgname='writer_beta_consent_member_fence_r1m' AND NOT tgisinternal`);
  assert.equal(catalog.length,1,'exactly one durable INSERT trigger');
  pass('real_migration_trigger_installed_once');
  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({
    verifiedMemberId:M,decision:'accept',approvedPolicy:POLICY,
  }),{kind:'recorded',decision:'accept'});
  assert.equal(await last(),'accept');
  pass('real_current_consent_accepted');

  // A: protected author holds the member-row lock; a separate old/direct
  // SQL INSERT of revoke MUST NOT appear until this author commits.
  let entered!:()=>void,finish!:()=>void;
  const inside=new Promise<void>(done=>entered=done);
  const held=new Promise<void>(done=>finish=done);
  const author=withLockedCurrentWriterConsentR1K(M,POLICY,async tx=>{
   await tx.query('INSERT INTO fictional_author_commits(marker) VALUES($1)',
    ['R1M_AUTHOR_BEFORE_REVOKE']);
   entered();await held;
   return 'committed_intended_author_marker';
  });
  await inside;
  let directDone=false;
  const pendingDirect=insertDirectRevoke().then(()=>{directDone=true;});
  await nap(160);
  assert.equal(directDone,false,'unmodified SQL consent writer waited on trigger row lock');
  assert.equal((await q<{n:number}>('SELECT count(*)::int n FROM fictional_author_commits'))[0]?.n,0);
  assert.equal(await last(),'accept');
  pass('direct_legacy_revoke_waits_behind_protected_author');
  finish();
  const committed=await author;
  assert.deepEqual(committed,{kind:'executed_inside_consent_lock',value:'committed_intended_author_marker',releaseApproved:false});
  await pendingDirect;
  assert.equal(await last(),'revoke');
  assert.equal((await q<{n:number}>('SELECT count(*)::int n FROM fictional_author_commits'))[0]?.n,1);
  pass('protected_commit_precedes_direct_revocation_commit');
  let invoked=0;
  assert.deepEqual(await withLockedCurrentWriterConsentR1K(M,POLICY,async()=>{invoked++;}),
   {kind:'refused',reason:'current_consent_not_verified',releaseApproved:false});
  assert.equal(invoked,0);
  pass('post_revoke_author_callback_not_invoked');

  // B: a direct/legacy revoke INSERT holds its transaction open. A later
  // protected author MUST wait for that same member lock and then see revoke.
  await recordWriterBetaConsentDecisionR1K({
    verifiedMemberId:M,decision:'accept',approvedPolicy:POLICY,
  });
  assert.equal(await last(),'accept');
  const withdrawer=await inspector.connect();
  try{
   await withdrawer.query('BEGIN');
   await withdrawer.query(
    `INSERT INTO writers_studio_beta_consent_events
     (member_id,actor_member_id,decision,policy_version,policy_sha256)
     VALUES($1,$1,'revoke',$2,$3)`,[M,POLICY.policyVersion,POLICY.policySHA256]);
   let checkFinished=false,called=false;
   const future=withLockedCurrentWriterConsentR1K(M,POLICY,async()=>{
    called=true;return 'THIS_CANNOT_EXECUTE_AFTER_REVOKE';
   }).then(result=>{checkFinished=true;return result;});
   await nap(160);
   assert.equal(checkFinished,false,'author also waited on direct revoke lock');
   assert.equal(await last(),'accept','uncommitted revocation not visible');
   await withdrawer.query('COMMIT');
   const after=await future;
   assert.deepEqual(after,{kind:'refused',reason:'current_consent_not_verified',releaseApproved:false});
   assert.equal(called,false);
  }catch(error){await withdrawer.query('ROLLBACK').catch(()=>{});throw error;}
  finally{withdrawer.release();}
  assert.equal(await last(),'revoke');
  pass('direct_revoke_first_blocks_later_author_until_it_refuses');

  // A rollback cannot invent a durable withdrawal event.
  await recordWriterBetaConsentDecisionR1K({verifiedMemberId:M,decision:'accept',approvedPolicy:POLICY});
  const rollback=await inspector.connect();
  try{
   await rollback.query('BEGIN');
   await rollback.query(
    `INSERT INTO writers_studio_beta_consent_events
     (member_id,actor_member_id,decision,policy_version,policy_sha256)
     VALUES($1,$1,'revoke',$2,$3)`,[M,POLICY.policyVersion,POLICY.policySHA256]);
   await rollback.query('ROLLBACK');
  }finally{rollback.release();}
  assert.equal(await last(),'accept');
  pass('rolled_back_direct_withdrawal_not_committed');

  // Database self-actor and missing-member constraints remain fail-closed.
  await assert.rejects(inspector.query(
   `INSERT INTO writers_studio_beta_consent_events
    (member_id,actor_member_id,decision,policy_version,policy_sha256)
    VALUES($1,$2,'revoke',$3,$4)`,
   [M,OTHER,POLICY.policyVersion,POLICY.policySHA256]),
   (error:any)=>error.code==='23514');
  assert.equal(await last(),'accept');
  pass('cross_member_forged_consent_event_refused');
  await assert.rejects(inspector.query(
   `INSERT INTO writers_studio_beta_consent_events
    (member_id,actor_member_id,decision,policy_version,policy_sha256)
    VALUES($1,$1,'revoke',$2,$3)`,
   [OTHER,POLICY.policyVersion,POLICY.policySHA256]),
   (error:any)=>error.code==='23503');
  pass('absent_member_cannot_create_consent');

  // C: a direct INSERT can allocate its identity sequence number BEFORE its
  // BEFORE INSERT trigger reaches the member lock. A slow R1K transaction
  // might still insert another accept WHILE holding that lock. The direct
  // withdrawal commits LATER and MUST have a LARGER seq, otherwise the
  // current-consent query could falsely keep the earlier accept active.
  let locked!:()=>void,allowCommit!:()=>void;
  const authorLocked=new Promise<void>(resolve=>locked=resolve);
  const mayCommit=new Promise<void>(resolve=>allowCommit=resolve);
  const authorAccept=withLockedCurrentWriterConsentR1K(M,POLICY,async tx=>{
    locked();await mayCommit;
    await tx.query(`INSERT INTO writers_studio_beta_consent_events
      (member_id,actor_member_id,decision,policy_version,policy_sha256)
      VALUES($1,$1,'accept',$2,$3)`,[M,POLICY.policyVersion,POLICY.policySHA256]);
    return 'member_accepted_again_before_waiting_revoke';
  });
  await authorLocked;
  const identityWriter=await inspector.connect();
  try{
    const pid=(await identityWriter.query('SELECT pg_backend_pid() pid')).rows[0].pid as number;
    const directRevoke=identityWriter.query(`INSERT INTO writers_studio_beta_consent_events
      (member_id,actor_member_id,decision,policy_version,policy_sha256)
      VALUES($1,$1,'revoke',$2,$3)`,[M,POLICY.policyVersion,POLICY.policySHA256]);
    let waited=false;
    for(let i=0;i<30;i++){
      const activity=await q<{wait_event_type:string|null}>(
        'SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1',[pid]);
      if(activity[0]?.wait_event_type==='Lock'){waited=true;break;}
      await nap(20);
    }
    assert.ok(waited,'direct revoke INSERT did not reach a blocked member lock');
    allowCommit();
    const completed=await authorAccept;
    assert.equal(completed.kind,'executed_inside_consent_lock');
    await directRevoke;
    const chronology=await q<{seq:string;decision:string}>(
      'SELECT seq,decision FROM writers_studio_beta_consent_events WHERE member_id=$1 ORDER BY seq DESC LIMIT 2',[M]);
    assert.equal(chronology.length,2);
    assert.equal(chronology[0].decision,'revoke',
      'CRITICAL: later committed withdrawal must own the highest consent sequence');
    assert.equal(chronology[1].decision,'accept');
  }finally{allowCommit();identityWriter.release();}
  assert.equal(await last(),'revoke');
  pass('identity_sequence_order_matches_lock_commit_order');

  // No hard DELETE trigger; genuine member erasure can still cascade events
  // through the existing FK instead of creating undeletable shadow identity.
  await inspector.query('DELETE FROM members WHERE id=$1',[M]);
  const left=await q<{n:number}>(
   'SELECT count(*)::int n FROM writers_studio_beta_consent_events WHERE member_id=$1',[M]);
  assert.equal(left[0]?.n,0);
  pass('member_erasure_cascades_consent_events');

  console.log('R1M_REAL_PG16_CONSENT_INSERT_FENCE_PASS='+checks.length);
  for(const label of checks)console.log('PASS '+label);
 }finally{await Promise.allSettled([inspector.end(),closePool()]);}
}
main().catch(error=>{
 console.error('R1M_FIXTIONAL_PG16_HOLD',error.name,String(error.message).slice(0,170));
 process.exitCode=2;
});
