/** Real PostgreSQL 16: encrypted proposed+original words, current consent,
 * exact member-owned Work, zero MAIA provider attribution or author Apply. */
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {Pool} from 'pg';
import {closePool} from '@/lib/db/postgres';
import {recordWriterBetaConsentDecisionR1K} from '@/lib/writersStudio/release/serializedWriterBetaConsentR1K';
import {
 stagePrivateMemberCandidateR1O,reopenPrivateMemberCandidateR1O,
 R1O_REAL_MEMBER_EDITORIAL_ROUTE_RELEASED,
} from '@/lib/writersStudio/release/privateMemberCandidateR1O';
const url=process.env.DATABASE_URL||'';
if(process.env.R1O_PHYSICAL_FICTIONAL!=='fictional-only'||
 !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_private_candidate$/.test(url))
 throw Error('R1O_REFUSE_NON_FICTIONAL_DATABASE');
const M='11111111-1111-4111-8111-111111111111';
const OTHER='99999999-9999-4999-8999-999999999999';
const W='22222222-2222-4222-8222-222222222222';
const LIVE_WORK='33333333-3333-4333-8333-333333333333';
const D='44444444-4444-4444-8444-444444444444';
const SRC='55555555-5555-4555-8555-555555555555';
const SECTION='66666666-6666-4666-8666-666666666666';
const original='A fictional candle illuminates the crystal garden.';
const selected='fictional candle';
const replacement='imaginary lantern';
const scope={memberId:M,manuscriptId:W,livingWorkId:LIVE_WORK,draftId:D,sectionId:SECTION,baseVersion:7};
const policy={policyVersion:'r1o-fictional-current',policySHA256:'b'.repeat(64)};
const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
const monitor=new Pool({connectionString:url,max:3,connectionTimeoutMillis:3500});
const checks:string[]=[];const ok=(v:string)=>checks.push(v);
const q=async(sql:string,params:unknown[]=[])=> (await monitor.query(sql,params)).rows;
async function main(){
 try{
  assert.equal(R1O_REAL_MEMBER_EDITORIAL_ROUTE_RELEASED,false);
  assert.equal((await q('SELECT count(*)::int n FROM members'))[0].n,1);
  const srcBefore=(await q('SELECT body FROM manuscript_sections WHERE id=$1',[SRC]))[0].body;
  const draftBefore=(await q('SELECT content FROM manuscript_working_drafts WHERE id=$1',[D]))[0].content;
  ok('fictional_source_and_work_owned');
  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({
   verifiedMemberId:M,decision:'accept',approvedPolicy:policy,
  }),{kind:'recorded',decision:'accept'});
  ok('real_consent_with_db_member_lock');
  const staged=await stagePrivateMemberCandidateR1O({
   scope,policy,author:'member',selectedOriginal:selected,replacementText:replacement,workKey:key,
  });
  assert.equal(staged.kind,'encrypted_member_candidate_pending');
  if(staged.kind!=='encrypted_member_candidate_pending')throw Error('not_staged');
  assert.equal(staged.canApply,false);assert.equal(staged.canUndo,false);
  assert.equal(staged.releaseApproved,false);
  const created=await q(`SELECT key_id,author_assertion,cipher_envelope::text AS box
    FROM ws_private_member_candidates_r1o WHERE id=$1`,[staged.candidateId]);
  assert.equal(created.length,1);assert.equal(created[0].author_assertion,'member');
  assert.equal(created[0].key_id,key.keyId);
  const box=created[0].box as string;
  for(const secret of [selected,replacement,original])
   assert.equal(box.includes(secret),false,'SQL must never store original/proposed plaintext');
  const listed=await q(`SELECT column_name FROM information_schema.columns
    WHERE table_name='ws_private_member_candidates_r1o'`);
  assert.equal(listed.some((x:any)=>/proposed_text|original_text|replacement_text/i.test(x.column_name)),false);
  ok('ciphertext_only_sql_no_review_prose_or_plaintext_columns');

  const preview=await reopenPrivateMemberCandidateR1O({scope,policy,candidateId:staged.candidateId,workKey:key});
  assert.deepEqual(preview,{kind:'server_only_member_candidate_preview',
   candidateId:staged.candidateId,author:'member',selectedOriginal:selected,
   replacementText:replacement,canApply:false,canUndo:false,releaseApproved:false});
  ok('server_only_open_after_current_consent_and_work_read');
  assert.equal((await q('SELECT body FROM manuscript_sections WHERE id=$1',[SRC]))[0].body,srcBefore);
  assert.equal((await q('SELECT content FROM manuscript_working_drafts WHERE id=$1',[D]))[0].content,draftBefore);
  assert.equal((await q('SELECT count(*)::int n FROM ws_private_member_candidates_r1o'))[0].n,1);
  ok('unchanged_original_source_and_draft_no_apply');

  await assert.rejects(monitor.query(
   'UPDATE ws_private_member_candidates_r1o SET key_id=$2 WHERE id=$1',
   [staged.candidateId,randomUUID()]),(e:any)=>e.code==='23514');
  ok('immutable_ciphertext_and_candidate_scope');

  const wrongKey=await reopenPrivateMemberCandidateR1O({scope,policy,candidateId:staged.candidateId,
   workKey:{keyId:key.keyId,keyBytes:randomBytes(32)}});
  assert.deepEqual(wrongKey,{kind:'refused',reason:'private_candidate_unavailable',
   releaseApproved:false,canApply:false,canUndo:false});
  ok('bad_crypto_key_fails_closed_without_plaintext');

  const foreign=await reopenPrivateMemberCandidateR1O({
   scope:{...scope,memberId:OTHER},policy,candidateId:staged.candidateId,workKey:key,
  });
  assert.deepEqual(foreign,{kind:'refused',reason:'not_qualified',
   releaseApproved:false,canApply:false,canUndo:false});
  const wrongWork=await stagePrivateMemberCandidateR1O({
   scope:{...scope,livingWorkId:randomUUID()},policy,author:'member',
   selectedOriginal:selected,replacementText:replacement,workKey:key,
  });
  assert.equal(wrongWork.kind,'refused');
  ok('foreign_member_and_unowned_declared_work_refused');

  const forged=await stagePrivateMemberCandidateR1O({
   scope,policy,author:'maia',selectedOriginal:selected,replacementText:replacement,workKey:key,
  });
  assert.equal(forged.kind,'refused');
  assert.equal((await q('SELECT count(*)::int n FROM ws_private_member_candidates_r1o'))[0].n,1);
  ok('unwitnessed_maia_origin_cannot_be_published');

  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:M,decision:'revoke'}),
   {kind:'recorded',decision:'revoke'});
  const afterRevoke=await reopenPrivateMemberCandidateR1O({scope,policy,candidateId:staged.candidateId,workKey:key});
  assert.equal(afterRevoke.kind,'refused');
  ok('consent_withdrawal_closes_private_preview');

  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:M,decision:'accept',approvedPolicy:policy}),
   {kind:'recorded',decision:'accept'});
  const priorEpoch=await reopenPrivateMemberCandidateR1O({scope,policy,candidateId:staged.candidateId,workKey:key});
  assert.equal(priorEpoch.kind,'refused');
  ok('later_reaccept_does_not_revive_prior_private_candidate');

  // Advance only the draft version in the fictional fixture, leaving Source unchanged.
  await monitor.query('UPDATE manuscript_working_drafts SET version=version+1 WHERE id=$1',[D]);
  const stale=await stagePrivateMemberCandidateR1O({scope,policy,author:'member',selectedOriginal:selected,
    replacementText:replacement,workKey:key});
  assert.equal(stale.kind,'refused');
  ok('changed_draft_version_blocks_old_selection');

  await monitor.query('DELETE FROM ws_private_member_candidates_r1o WHERE id=$1',[staged.candidateId]);
  assert.equal((await q('SELECT count(*)::int n FROM ws_private_member_candidates_r1o'))[0].n,0);
  ok('explicit_candidate_delete_allowed_for_privacy_erasure');
  console.log('R1O_PHYSICAL_PRIVATE_MEMBER_CANDIDATE_PASS='+checks.length);
  for(const label of checks)console.log('PASS '+label);
 }finally{await Promise.allSettled([monitor.end(),closePool()]);}
}
main().catch(e=>{console.error('R1O_FICTIONAL_PG16_HOLD',e.name,String(e.message).slice(0,180));process.exitCode=2});
