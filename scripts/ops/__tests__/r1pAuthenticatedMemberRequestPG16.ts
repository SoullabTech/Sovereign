/** Disposable real auth_sessions + consent + encrypted member candidate under
 * a verified NextRequest. The publicly mounted R1P route stays 404; the test
 * calls the internal server handler with a fabricated Work-key grant only. */
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {NextRequest} from 'next/server';
import {Pool} from 'pg';
import {closePool} from '@/lib/db/postgres';
import {getMemberIdFromSessionToken} from '@/lib/auth/getMemberFromRequest';
import {recordWriterBetaConsentDecisionR1K} from '@/lib/writersStudio/release/serializedWriterBetaConsentR1K';
import {stagePrivateMemberCandidateR1O,reopenPrivateMemberCandidateR1O}
 from '@/lib/writersStudio/release/privateMemberCandidateR1O';
import {handleVerifiedPrivateMemberCandidateR1P,R1P_BOUND_ROUTE}
 from '@/lib/writersStudio/release/verifiedMemberCandidateRequestR1P';
import {POST as PUBLIC_POST,GET as PUBLIC_GET}
 from '@/app/api/sovereign/writers-studio/private-member-candidates/route';

const uri=process.env.DATABASE_URL||'';
if(process.env.R1P_PHYSICAL_FICTIONAL!=='fictional-only'||
 !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_private_candidate$/.test(uri))
 throw Error('R1P_REFUSE_NON_FICTIONAL_DATABASE');
const M='11111111-1111-4111-8111-111111111111';
const FOREIGN='99999999-9999-4999-8999-999999999999';
const W='22222222-2222-4222-8222-222222222222';
const LIVE_WORK='33333333-3333-4333-8333-333333333333';
const DRAFT='44444444-4444-4444-8444-444444444444';
const SRC='55555555-5555-4555-8555-555555555555';
const SECTION='66666666-6666-4666-8666-666666666666';
const SESSION='R1P_FICTIONAL_VERIFIED_SESSION_ONLY';
const O='https://beta.soullab.life';
const scope={memberId:M,manuscriptId:W,livingWorkId:LIVE_WORK,draftId:DRAFT,
 sectionId:SECTION,baseVersion:7};
const body={kind:'stage_member_suggestion',manuscriptId:W,livingWorkId:LIVE_WORK,
 draftId:DRAFT,sectionId:SECTION,baseVersion:7,
 selectedOriginal:'fictional candle',replacementText:'imaginary lantern'};
const policy={policyVersion:'r1p-fictional-current',policySHA256:'a'.repeat(64)};
const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
const monitor=new Pool({connectionString:uri,max:3,connectionTimeoutMillis:3500});
const checks:string[]=[];const mark=(s:string)=>checks.push(s);
function req(input:{cookie?:boolean;token?:string;origin?:string;
 body?:Record<string,unknown>;headers?:Record<string,string>}={}):NextRequest{
 const headers=new Headers({host:'beta.soullab.life',origin:input.origin??O,
  'content-type':'application/json','sec-fetch-site':'same-origin',
  ...(input.headers||{})});
 if(input.cookie!==false)headers.set('cookie','maia_session='+(input.token??SESSION));
 else if(input.token)headers.set('x-session-token',input.token);
 return new NextRequest(O+R1P_BOUND_ROUTE,{method:'POST',headers,
  body:JSON.stringify(input.body??body)});
}
const trusted=()=>({
 resolveSession:getMemberIdFromSessionToken,
 getWorkKey:async(memberId:string,manuscriptId:string)=>{
  if(memberId!==M||manuscriptId!==W)return null;
  return {kind:'managed_exact_member_work_key' as const,memberId,manuscriptId,workKey:key};
 },
 stage:stagePrivateMemberCandidateR1O,allowedOrigins:[O],policy,
});
const count=async()=>Number((await monitor.query(
 'SELECT count(*)::int AS n FROM ws_private_member_candidates_r1o')).rows[0].n);
async function main(){
 try{
  assert.equal((await monitor.query('SELECT count(*)::int AS n FROM members')).rows[0].n,1);
  const publicResponse=await PUBLIC_POST(req());
  assert.equal(publicResponse.status,404);
  assert.equal((await PUBLIC_GET()).status,404);
  assert.equal(await count(),0);
  mark('public_next_route_remains_unavailable_and_nonmutating');

  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({
   verifiedMemberId:M,decision:'accept',approvedPolicy:policy,
  }),{kind:'recorded',decision:'accept'});
  mark('current_real_consent_event_exists');

  const result=await handleVerifiedPrivateMemberCandidateR1P(req(),trusted());
  assert.equal(result.status,201);
  const data=await result.json();
  assert.equal(data.kind,'encrypted_member_candidate_pending');
  assert.equal(data.author,'member');
  assert.equal(data.releaseApproved,false);
  assert.equal(data.canApply,false);
  assert.equal(data.canUndo,false);
  assert.equal(await count(),1);
  assert.equal(JSON.stringify(data).includes(body.replacementText),false);
  assert.equal(JSON.stringify(data).includes(body.selectedOriginal),false);
  assert.equal(result.headers.get('cache-control')?.includes('no-store'),true);
  mark('real_auth_sessions_cookie_staged_encrypted_candidate');

  const saved=await monitor.query(`SELECT cipher_envelope::text as cipher
     FROM ws_private_member_candidates_r1o WHERE id=$1`,[data.candidateId]);
  assert.equal(saved.rows.length,1);
  assert.equal(saved.rows[0].cipher.includes(body.replacementText),false);
  assert.equal(saved.rows[0].cipher.includes(body.selectedOriginal),false);
  assert.equal((await monitor.query('SELECT body FROM manuscript_sections WHERE id=$1',[SRC])).rows[0].body,
   'A fictional candle illuminates the crystal garden.');
  mark('real_database_keeps_review_text_private_and_source_intact');

  const safari=await handleVerifiedPrivateMemberCandidateR1P(
   req({cookie:false,token:SESSION}),trusted());
  assert.equal(safari.status,201);
  mark('actual_verified_auth_sessions_safari_bearer_header');

  const missing=await handleVerifiedPrivateMemberCandidateR1P(req({cookie:false}),trusted());
  assert.equal(missing.status,401);
  assert.equal(await count(),2);
  mark('bare_request_cannot_write_without_session');

  const spoof=await handleVerifiedPrivateMemberCandidateR1P(req({headers:{'x-member-id':FOREIGN}}),trusted());
  assert.equal(spoof.status,403);
  const foreignOrigin=await handleVerifiedPrivateMemberCandidateR1P(req({origin:'https://foreign.invalid'}),trusted());
  assert.equal(foreignOrigin.status,403);
  assert.equal(await count(),2);
  mark('foreign_member_claim_and_origin_do_not_write');

  await monitor.query('UPDATE auth_sessions SET revoked=TRUE WHERE session_token=$1',[SESSION]);
  assert.equal((await handleVerifiedPrivateMemberCandidateR1P(req(),trusted())).status,401);
  await monitor.query('UPDATE auth_sessions SET revoked=FALSE,expires_at=now()-interval \'1 minute\' WHERE session_token=$1',[SESSION]);
  assert.equal((await handleVerifiedPrivateMemberCandidateR1P(req(),trusted())).status,401);
  await monitor.query('UPDATE auth_sessions SET expires_at=now()+interval \'1 hour\' WHERE session_token=$1',[SESSION]);
  mark('revoked_and_expired_session_denied_by_real_postgres_session_query');

  assert.equal((await handleVerifiedPrivateMemberCandidateR1P(req({body:{...body,author:'maia'}}),trusted())).status,400);
  assert.equal((await handleVerifiedPrivateMemberCandidateR1P(req({body:{...body,workKey:'forged'}}),trusted())).status,400);
  assert.equal(await count(),2);
  mark('maia_claim_and_browser_key_fields_disallowed');

  const opened=await reopenPrivateMemberCandidateR1O({scope,policy,
   candidateId:data.candidateId,workKey:key});
  assert.equal(opened.kind,'server_only_member_candidate_preview');
  if(opened.kind!=='server_only_member_candidate_preview')throw Error('verified preview absent');
  assert.equal(opened.replacementText,body.replacementText);
  assert.equal(opened.selectedOriginal,body.selectedOriginal);
  assert.equal(opened.canApply,false);
  mark('server_only_private_preview_bound_to_same_current_consent');

  await recordWriterBetaConsentDecisionR1K({verifiedMemberId:M,decision:'revoke'});
  const after=await handleVerifiedPrivateMemberCandidateR1P(req(),trusted());
  assert.equal(after.status,409);
  assert.equal(await count(),2);
  assert.equal((await reopenPrivateMemberCandidateR1O({scope,policy,
   candidateId:data.candidateId,workKey:key})).kind,'refused');
  mark('revoked_writer_consent_blocks_future_staging_and_private_read');

  await recordWriterBetaConsentDecisionR1K({verifiedMemberId:M,decision:'accept',approvedPolicy:policy});
  const stale=await reopenPrivateMemberCandidateR1O({scope,policy,
   candidateId:data.candidateId,workKey:key});
  assert.equal(stale.kind,'refused');
  mark('reaccept_does_not_restore_old_ciphertext_consent_epoch');

  console.log('R1P_REAL_PG16_VERIFIED_HTTP_HANDLER_PASS='+checks.length);
  checks.forEach(x=>console.log('PASS '+x));
 }finally{await Promise.allSettled([monitor.end(),closePool()]);}
}
main().catch(e=>{console.error('R1P_FICTIONAL_HTTP_PG16_HOLD',e.name,String(e.message).slice(0,180));process.exitCode=2;});
