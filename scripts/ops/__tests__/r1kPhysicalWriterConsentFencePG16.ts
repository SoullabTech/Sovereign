/** Physical production-code consent serialization with ONLY synthetic identities and prose-free markers. */
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import {
  recordWriterBetaConsentDecisionR1K,
  withLockedCurrentWriterConsentR1K,
} from '../../../lib/writersStudio/release/serializedWriterBetaConsentR1K';
import { closePool } from '../../../lib/db/postgres';

const url=process.env.DATABASE_URL||'';
if(process.env.R1K_PHYSICAL_FICTIONAL!=='fictional-only'||
   !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_fence$/.test(url))
  throw new Error('R1K_REFUSE_NONFICTIONAL_DATABASE');
const MEMBER='11111111-1111-4111-8111-111111111111';
const OUTSIDER='22222222-2222-4222-8222-222222222222';
const POLICY={policyVersion:'r1k-test-notice',policySHA256:'d'.repeat(64)};
const monitor=new Pool({connectionString:url,max:2,connectionTimeoutMillis:3000});
const checks:string[]=[];
const pass=(name:string)=>{checks.push(name);};
const count=async()=>Number((await monitor.query('SELECT count(*)::int AS n FROM fictional_author_commits')).rows[0].n);
const consent=async()=>{
 const r=await monitor.query("SELECT decision FROM writers_studio_beta_consent_events WHERE member_id=$1 ORDER BY seq DESC LIMIT 1",[MEMBER]);
 return r.rows[0]?.decision??null;
};
const sleep=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
async function main(){
 try {
  const row=await monitor.query('SELECT count(*)::int AS n FROM members');
  assert.equal(row.rows[0].n,1,'single invented member, never real data');
  assert.equal(await count(),0);
  pass('one_synthetic_member_only');
  const first=await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'accept',approvedPolicy:POLICY});
  assert.deepEqual(first,{kind:'recorded',decision:'accept'});
  assert.equal(await consent(),'accept');
  pass('real_postgres_original_accept');

  let enter!:()=>void,release!:()=>void;
  const entered=new Promise<void>(resolve=>{enter=resolve;});
  const hold=new Promise<void>(resolve=>{release=resolve;});
  let callbackCount=0;
  const writer=withLockedCurrentWriterConsentR1K(MEMBER,POLICY,async tx=>{
   callbackCount++;
   await tx.query('INSERT INTO fictional_author_commits(marker) VALUES($1)', ['R1K_SYNTHETIC_ACCEPTED_COMMIT']);
   enter();
   await hold;
   return {kind:'fictional_commit_only'};
  });
  await entered; // The real transaction has acquired the member FOR UPDATE lock.
  let revocationFinished=false;
  const revoke=recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'revoke'})
    .then(value=>{revocationFinished=true;return value;});
  await sleep(180);
  assert.equal(revocationFinished,false,'withdrawal cannot commit while prior protected txn holds lock');
  assert.equal(await count(),0,'uncommitted author marker never visible outside transaction');
  assert.equal(await consent(),'accept','pending withdrawal cannot appear as prematurely committed');
  pass('revocation_waits_for_in_flight_author_lock');
  release();
  const admitted=await writer;
  assert.deepEqual(admitted,{kind:'executed_inside_consent_lock',value:{kind:'fictional_commit_only'},releaseApproved:false});
  assert.deepEqual(await revoke,{kind:'recorded',decision:'revoke'});
  assert.equal(callbackCount,1);
  assert.equal(await count(),1,'author transaction committed once');
  assert.equal(await consent(),'revoke');
  pass('commit_then_revoke_serialized_with_durable_order');

  const refusedCount={n:0};
  const after=await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,async()=>{refusedCount.n++;return null;});
  assert.deepEqual(after,{kind:'refused',reason:'current_consent_not_verified',releaseApproved:false});
  assert.equal(refusedCount.n,0);
  assert.equal(await count(),1);
  pass('future_author_transaction_refused_after_revocation');
  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'revoke'}),{kind:'already_revoked'});
  pass('duplicate_withdrawal_no_duplicate_event');

  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'accept',approvedPolicy:POLICY}),{kind:'recorded',decision:'accept'});
  await assert.rejects(
   withLockedCurrentWriterConsentR1K(MEMBER,POLICY,async tx=>{
    await tx.query('INSERT INTO fictional_author_commits(marker) VALUES($1)', ['R1K_SYNTHETIC_ROLLBACK']);
    throw new Error('R1K_SYNTHETIC_AUTHOR_FAILURE');
   }),/R1K_SYNTHETIC_AUTHOR_FAILURE/);
  assert.equal(await count(),1,'failed write rolled back on same transaction client');
  assert.equal(await consent(),'accept');
  pass('same_client_author_failure_rollback');

  const absent=await withLockedCurrentWriterConsentR1K(OUTSIDER,POLICY,async()=>{throw new Error('OUTSIDER_WRITER_CALLED');});
  assert.deepEqual(absent,{kind:'refused',reason:'member_unavailable',releaseApproved:false});
  pass('missing_member_cannot_authorize_edit');
  const rotated=await withLockedCurrentWriterConsentR1K(MEMBER,{policyVersion:'different',policySHA256:POLICY.policySHA256},async()=>{throw new Error('ROTATED_WRITER_CALLED');});
  assert.deepEqual(rotated,{kind:'refused',reason:'current_consent_not_verified',releaseApproved:false});
  pass('wrong_notice_version_no_write');
  console.log('R1K_PHYSICAL_CONSENT_SERIALIZATION_PASS_CHECKS='+checks.length);
  for(const name of checks)console.log('PASS '+name);
 }finally{
   await Promise.allSettled([monitor.end(),closePool()]);
 }
}
main().catch(error=>{console.error('R1K_PHYSICAL_TEST_FAILED',error.name,error.message?.slice(0,135));process.exitCode=2;});
