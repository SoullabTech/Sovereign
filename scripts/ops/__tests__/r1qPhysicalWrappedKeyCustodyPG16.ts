/** R1Q actual PostgreSQL + R1P authentic request + R1O encrypted private
 * candidate with a FICTIONAL local AES-GCM managed KMS substitute.
 * No AWS/GCP/network/production credential, real Work, clinical data or spend.
 */
import assert from 'node:assert/strict';
import {createCipheriv,createDecipheriv,createHmac,randomBytes,randomUUID} from 'node:crypto';
import {NextRequest} from 'next/server';
import {Pool} from 'pg';
import {getMemberIdFromSessionToken} from '@/lib/auth/getMemberFromRequest';
import {closePool} from '@/lib/db/postgres';
import {recordWriterBetaConsentDecisionR1K} from '@/lib/writersStudio/release/serializedWriterBetaConsentR1K';
import {stagePrivateMemberCandidateR1O} from '@/lib/writersStudio/release/privateMemberCandidateR1O';
import {handleVerifiedPrivateMemberCandidateR1P,R1P_BOUND_ROUTE} from '@/lib/writersStudio/release/verifiedMemberCandidateRequestR1P';
import {
 resolveWrappedMemberWorkKeyR1Q,R1Q_OPERATIONAL_KMS_AND_MEMBER_KEY_RELEASED,
 type ManagedWorkKeyUnwrapperR1Q,
} from '@/lib/writersStudio/release/managedWrappedWorkKeyR1Q';

const uri=process.env.DATABASE_URL||'';
if(process.env.R1Q_PHYSICAL_FICTIONAL!=='fictional-only'||
 !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_private_candidate$/.test(uri))
 throw Error('R1Q_REFUSE_NON_FICTIONAL_DATABASE');
const M='11111111-1111-4111-8111-111111111111';
const FOREIGN='99999999-9999-4999-8999-999999999999';
const W='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const DRAFT='44444444-4444-4444-8444-444444444444';
const SECTION='66666666-6666-4666-8666-666666666666';
const SESSION='R1Q_FICTIONAL_SESSION_AUTH_ONLY';
const O='https://beta.soullab.life';
const policy={policyVersion:'r1q-fictional-current',policySHA256:'a'.repeat(64)};
const body={kind:'stage_member_suggestion',manuscriptId:W,livingWorkId:WORK,
 draftId:DRAFT,sectionId:SECTION,baseVersion:7,
 selectedOriginal:'fictional candle',replacementText:'imaginary lantern'};
const inspector=new Pool({connectionString:uri,max:4,connectionTimeoutMillis:3500});
const checks:string[]=[];const pass=(s:string)=>checks.push(s);
const wrappingKey=randomBytes(32);
const hmacPepper=randomBytes(32);
const plaintextDEK=randomBytes(32);
const firstId=randomUUID();
const providerRef='fictional-conventional-kms-key-001';
let unwrapCalls=0;
const contextDigest=(member:string,work:string)=>
 createHmac('sha256',hmacPepper).update('soullab-ws-r1q|'+member+'|'+work).digest('hex');
const digest=contextDigest(M,W);
const aad=(digest:string)=>Buffer.from('soullab-writers-beta|'+digest,'utf8');
function wrap(dek:Buffer,digest:string):Buffer{
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',wrappingKey,iv);
 cipher.setAAD(aad(digest));
 const text=Buffer.concat([cipher.update(dek),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),text]);
}
function realFakeUnwrap(wrappedKey:Buffer,workDigest:string):Buffer{
 const decoder=createDecipheriv('aes-256-gcm',wrappingKey,wrappedKey.subarray(0,12));
 decoder.setAAD(aad(workDigest));decoder.setAuthTag(wrappedKey.subarray(12,28));
 return Buffer.concat([decoder.update(wrappedKey.subarray(28)),decoder.final()]);
}
const wrapped=wrap(plaintextDEK,digest);
const provider:ManagedWorkKeyUnwrapperR1Q={
 deriveOpaqueWorkDigest:async(member,work)=>contextDigest(member,work),
 unwrap:async({providerKeyRef,wrappedKey,context,signal})=>{
  unwrapCalls++;
  assert.equal(providerKeyRef,providerRef);
  assert.deepEqual(context,{service:'soullab-writers-beta',opaqueWorkDigest:digest});
  assert.equal(signal.aborted,false);
  assert.equal(JSON.stringify(context).includes(M),false);
  assert.equal(JSON.stringify(context).includes(W),false);
  return realFakeUnwrap(wrappedKey,context.opaqueWorkDigest);
 },
};
const q=async(sql:string,params:unknown[]=[])=> (await inspector.query(sql,params)).rows;
const resolver=(memberId:string,manuscriptId:string,managed=provider)=>
 resolveWrappedMemberWorkKeyR1Q({memberId,manuscriptId,policy,provider:managed});
const trusted=(managed=provider)=>({
 resolveSession:getMemberIdFromSessionToken,
 getWorkKey:(memberId:string,manuscriptId:string)=>resolver(memberId,manuscriptId,managed),
 stage:stagePrivateMemberCandidateR1O,allowedOrigins:[O],policy,
});
function request(cookie=true):NextRequest{
 const headers=new Headers({host:'beta.soullab.life',origin:O,
  'content-type':'application/json','sec-fetch-site':'same-origin'});
 if(cookie)headers.set('cookie','maia_session='+SESSION);
 else headers.set('x-session-token',SESSION);
 return new NextRequest(O+R1P_BOUND_ROUTE,{method:'POST',headers,body:JSON.stringify(body)});
}
const candidateCount=async()=>Number((await q('SELECT count(*)::int n FROM ws_private_member_candidates_r1o'))[0].n);
const sleep=(ms:number)=>new Promise<void>(done=>setTimeout(done,ms));
const storeKey=async(epoch:number,keyId:string,box:Buffer)=>{
 await inspector.query(`INSERT INTO ws_managed_work_key_wrappings_r1q
  (member_id,manuscript_id,key_epoch,key_id,provider,provider_key_ref,opaque_work_digest,wrapped_key)
  VALUES($1,$2,$3,$4,'external_managed_kms',$5,$6,$7)`,
  [M,W,epoch,keyId,providerRef,digest,box]);
};

async function main(){
 try{
  assert.equal(R1Q_OPERATIONAL_KMS_AND_MEMBER_KEY_RELEASED,false);
  assert.equal((await q('SELECT count(*)::int n FROM members'))[0].n,1);
  const before=await resolver(M,W);
  assert.equal(before,null);
  assert.equal(unwrapCalls,0);
  pass('no_wrapped_key_refuses_without_contacting_provider');
  await storeKey(1,firstId,wrapped);
  const record=await q('SELECT wrapped_key,key_id FROM ws_managed_work_key_wrappings_r1q');
  assert.equal(record.length,1);
  assert.equal(record[0].key_id,firstId);
  assert.equal(Buffer.from(record[0].wrapped_key).equals(plaintextDEK),false);
  assert.equal(Buffer.from(record[0].wrapped_key).length,60);
  pass('actual_db_stores_wrapped_bytes_not_plaintext_DEK');
  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({
   verifiedMemberId:M,decision:'accept',approvedPolicy:policy,
  }),{kind:'recorded',decision:'accept'});
  const grant=await resolver(M,W);
  assert.equal(grant?.kind,'managed_exact_member_work_key');
  assert.equal(grant?.workKey.keyId,firstId);
  assert.ok(grant?.workKey.keyBytes.equals(plaintextDEK));
  assert.notEqual(grant?.workKey.keyBytes,plaintextDEK);
  pass('real_consented_owner_work_unwraps_exact_current_key');

  const accepted=await handleVerifiedPrivateMemberCandidateR1P(request(),trusted());
  assert.equal(accepted.status,201);
  const response=await accepted.json();
  assert.equal(response.kind,'encrypted_member_candidate_pending');
  assert.equal(response.canApply,false);
  assert.equal(response.canUndo,false);
  assert.equal(response.releaseApproved,false);
  assert.equal(await candidateCount(),1);
  const cipher=(await q('SELECT cipher_envelope::text text FROM ws_private_member_candidates_r1o'))[0].text as string;
  assert.equal(cipher.includes(body.replacementText),false);
  assert.equal(cipher.includes(body.selectedOriginal),false);
  pass('actual_auth_sessions_to_wrapped_key_to_r1o_ciphertext_pipeline');

  const safari=await handleVerifiedPrivateMemberCandidateR1P(request(false),trusted());
  assert.equal(safari.status,201);assert.equal(await candidateCount(),2);
  pass('verified_safari_header_path_fresh_unwrap_and_encrypted_stage');

  const foreign=await resolver(FOREIGN,W);
  assert.equal(foreign,null);
  const unknown=await resolver(M,'88888888-8888-4888-8888-888888888888');
  assert.equal(unknown,null);
  pass('cross_member_and_foreign_work_refuse_before_any_key_release');

  await assert.rejects(inspector.query(
   `UPDATE ws_managed_work_key_wrappings_r1q SET provider_key_ref='tampered' WHERE key_id=$1`,
   [firstId]),(e:any)=>e.code==='23514');
  pass('wrapped_key_registry_immutable_under_real_postgres');

  // A future KMS call can overlap an actual consent revoke. The resolver
  // MUST reject even when the KMS successfully returns the old 32-byte DEK.
  let entered!:()=>void,release!:()=>void;
  const started=new Promise<void>(resolve=>entered=resolve);
  const held=new Promise<void>(resolve=>release=resolve);
  const delayed:ManagedWorkKeyUnwrapperR1Q={
   ...provider,
   unwrap:async(args)=>{entered();await held;return provider.unwrap(args);},
  };
  const pending=resolver(M,W,delayed);
  await started;
  await recordWriterBetaConsentDecisionR1K({verifiedMemberId:M,decision:'revoke'});
  release();
  assert.equal(await pending,null);
  assert.equal((await handleVerifiedPrivateMemberCandidateR1P(request(),trusted())).status,503);
  assert.equal(await candidateCount(),2);
  pass('consent_withdrawal_during_unwrap_prevents_key_and_private_stage');

  await recordWriterBetaConsentDecisionR1K({verifiedMemberId:M,decision:'accept',approvedPolicy:policy});
  // Key rotation occurs while external KMS is busy. The second snapshot must
  // reject the old key even if the returned unwrap bytes are cryptographically valid.
  let enteredRotate!:()=>void,releaseRotate!:()=>void;
  const startedRotate=new Promise<void>(resolve=>enteredRotate=resolve);
  const heldRotate=new Promise<void>(resolve=>releaseRotate=resolve);
  const delayedRotate:ManagedWorkKeyUnwrapperR1Q={
   ...provider,unwrap:async(args)=>{enteredRotate();await heldRotate;return provider.unwrap(args);},
  };
  const rotating=resolver(M,W,delayedRotate);
  await startedRotate;
  const secondId=randomUUID();
  await storeKey(2,secondId,wrapped);
  releaseRotate();
  assert.equal(await rotating,null);
  pass('new_key_epoch_during_external_decrypt_invalidates_old_grant');

  const now=await resolver(M,W);
  assert.equal(now?.workKey.keyId,secondId);
  assert.ok(now?.workKey.keyBytes.equals(plaintextDEK));
  pass('latest_work_epoch_retrieved_only_after_second_consent_check');

  // An opaque wrapper damaged at rest can never downgrade to an env/PHI key.
  const malformed=Buffer.from(wrapped);malformed[malformed.length-1]^=1;
  await storeKey(3,randomUUID(),malformed);
  assert.equal(await resolver(M,W),null);
  assert.equal((await handleVerifiedPrivateMemberCandidateR1P(request(),trusted())).status,503);
  assert.equal(await candidateCount(),2);
  pass('tampered_latest_wrapped_blob_fails_without_fallback');

  // A wrapped key row belongs to the exact member and manuscript in the DB,
  // even if an application accidentally tries to assert someone else's owner.
  await assert.rejects(inspector.query(`INSERT INTO ws_managed_work_key_wrappings_r1q
   (member_id,manuscript_id,key_epoch,key_id,provider,provider_key_ref,opaque_work_digest,wrapped_key)
   VALUES($1,$2,99,$3,'external_managed_kms',$4,$5,$6)`,
   [FOREIGN,W,randomUUID(),providerRef,digest,wrapped]),(e:any)=>e.code==='23503');
  pass('composite_member_manuscript_foreign_key_refuses_false_owner');

  console.log('R1Q_PHYSICAL_MANAGED_WRAPPED_KEY_PASS='+checks.length);
  for(const s of checks)console.log('PASS '+s);
 }finally{await Promise.allSettled([inspector.end(),closePool()]);}
}
main().catch(e=>{
 console.error('R1Q_FICTIONAL_CUSTODY_HOLD',e.name,String(e.message).slice(0,185));
 process.exitCode=2;
});
