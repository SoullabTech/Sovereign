/**
 * R38 physical fictional authentication + R26/R29 signed authorization +
 * R35 SQL Work history + AES-GCM immutable vault. No live routes, real
 * accounts or independently managed keys; all signers are test process only.
 */
import {NextRequest} from 'next/server';
import {Pool} from 'pg';
import {createHash,createHmac,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
jest.mock('next/headers',()=>({
 cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));
import {query,transaction,closePool} from '@/lib/db/postgres';
import {canonicalDeletionPayload,type DeletionHighwaterV1} from
 '../../../lib/writersStudio/recovery/deletionBarrierV1';
import {canonicalKeyLeaseR26,canonicalFreshnessR26,
 type R26VerifiedInput,type R26Lease,type R26Freshness} from
 '../../../lib/writersStudio/recovery/externalCustodyContractR26';
import {canonicalR29BoundLease,R29_PROTOCOL,
 type R29BoundAttestation,type R29CurrentAdmission,
 type R29SignedBound,type R29FictionalWorkFence} from
 '../../../lib/writersStudio/recovery/sessionBoundCustodyR29';
import {
 beginHeldDraftR35,reopenHeldDraftR35,
 R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED,type R35Custody,
} from '../../../lib/writersStudio/recovery/heldProtectedDraftR35';
import {
 handleHeldDraftRequestR38,R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED,
 type R38FictionalIssuer,
} from '../../../lib/writersStudio/recovery/heldDraftRequestR38';
import {WorkRecoveryRefusal,type WorkEncryptionKey} from
 '../../../lib/writersStudio/recovery/workEnvelopeV1';

const active=process.env.R38_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
 process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE==='fictional-only'&&
 (process.env.DATABASE_URL||'').startsWith('postgresql://fict@127.0.0.1:')&&
 (process.env.FILE_STORAGE_PATH||'').includes('ws-r35-physical-');
const group=active?describe:describe.skip;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const FOUNDER='55555555-5555-4555-8555-555555555555';
const W1='33333333-3333-4333-8333-333333333331';
const W2='33333333-3333-4333-8333-333333333332';
const W3='33333333-3333-4333-8333-333333333333';
const W4='33333333-3333-4333-8333-333333333334';
const W5='33333333-3333-4333-8333-333333333335';
const W6='33333333-3333-4333-8333-333333333336';
const BWORK='44444444-4444-4444-8444-444444444444';
const S1='66666666-6666-4666-8666-666666666661';
const S2='66666666-6666-4666-8666-666666666662';
const POLICY='r38-fictional-notice';
const HASH='b'.repeat(64);
const NOW=1792164000000;
const SECRET='R38 Fictional Writer Encrypted Request Secret Words';
const TOKENS={A:'r38-fictitious-session-A',B:'r38-fictitious-session-B',
 founder:'r38-fictitious-session-founder',expired:'r38-fictitious-expired'};
const internalSecret=Buffer.alloc(32,0x45);
const digest=(v:Buffer)=>createHash('sha256').update(v).digest('hex');
const signer=generateKeyPairSync('ed25519');
const highwaterSigner=generateKeyPairSync('ed25519');
const freshnessSigner=generateKeyPairSync('ed25519');
const keys=new Map<string,WorkEncryptionKey>();
const pg=active?new Pool({connectionString:process.env.DATABASE_URL,
 max:6,connectionTimeoutMillis:1500}):null;
function pool():Pool{if(!pg)throw Error('R38_PG16_FIXTURE_NOT_ACTIVE');return pg;}
const subject=(memberId=A)=>({
 memberId,assertedBy:'server_verified_member_session' as const,
});
function fixtureKey(workId:string):WorkEncryptionKey {
 let k=keys.get(workId);
 if(!k){k={keyId:randomUUID(),keyBytes:randomBytes(32)};keys.set(workId,k);}
 return k;
}
function checkpoint(workId:string,epoch=100,revoked=false){
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:epoch,
  revokedWorks:revoked?[workId]:[],revokedKeyIds:[],
 };
 return {checkpoint:cp,signature:sign(null,canonicalDeletionPayload(cp),
  highwaterSigner.privateKey).toString('base64')};
}
function custody(workId:string):R35Custody {
 return {key:fixtureKey(workId),signedDeletion:checkpoint(workId),
  trustedSigner:highwaterSigner.publicKey,independent:{minimumGeneration:100}};
}
function mockRequest(workId:string,operation:'save'|'checkpoint'|'restore',
 body?:Record<string,unknown>,options?:{token?:string;claim?:string;origin?:string}){
 return new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
  method:'POST',headers:{
   host:'soullab.life',origin:options?.origin??'https://soullab.life',
   'x-session-token':options?.token??TOKENS.A,
   ...(options?.claim?{'x-member-id':options.claim}:{}),
   'x-held-draft-operation':operation,
   ...(operation==='checkpoint'?{'x-draft-base-revision':String(body?.baseRevisionId??1),
      'idempotency-key':String(body?.idempotencyKey??'check-fixture')}:{}),
  },
  ...(operation==='checkpoint'?{}:{body:JSON.stringify(body??{
   content:SECRET+' save revision',baseRevisionId:1,idempotencyKey:'r38-default-save',
  })}),
 });
}
function preparedScope(admission:R29CurrentAdmission,workId:string,generation:number,
 hook?:()=>Promise<void>,mutateSigned=false):R38FictionalIssuer{
 return {
  authority:'fabricated_r38_signers_no_external_kms',
  async issue(){
   const key=fixtureKey(workId);
   const challenge=randomBytes(32).toString('hex');
   const signedDeletion=checkpoint(workId);
   const cpHash=digest(canonicalDeletionPayload(signedDeletion.checkpoint));
   const lease:R26Lease={
    protocol:'soullab.ws.external-work-key-lease.r26',
    memberId:admission.memberId,workId,keyId:key.keyId,purpose:'append',
    generation,challenge,issuedAtMs:NOW-1000,expiresAtMs:NOW+20000,
    keySha256:digest(key.keyBytes),checkpointSha256:cpHash,
   };
   const witness:R26Freshness={
    protocol:'soullab.ws.independent-highwater-witness.r26',
    memberId:admission.memberId,workId,keyId:key.keyId,challenge,
    minimumGeneration:100,checkpointSha256:cpHash,
    issuedAtMs:NOW-1000,expiresAtMs:NOW+20000,
   };
   const r26:R26VerifiedInput={
    scope:{memberId:admission.memberId,workId,keyId:key.keyId,
      generation,purpose:'append'},
    serverChallenge:challenge,key,
    lease:{statement:lease,signature:sign(null,canonicalKeyLeaseR26(lease),
      signer.privateKey).toString('base64')},
    freshness:{statement:witness,signature:sign(null,canonicalFreshnessR26(witness),
      freshnessSigner.privateKey).toString('base64')},
    deletion:signedDeletion,
    roots:{keyCustodian:signer.publicKey,deletionAuthority:highwaterSigner.publicKey,
      independentFreshness:freshnessSigner.publicKey},
    nowMs:NOW,
   };
   const binding:R29BoundAttestation={
    protocol:R29_PROTOCOL,leaseDigestSHA256:digest(canonicalKeyLeaseR26(lease)),
    memberId:admission.memberId,workId,keyId:key.keyId,generation,
    purpose:'append',challenge,
    sessionBindingSHA256:admission.sessionBindingSHA256,
    consentNoticeSHA256:admission.consentNoticeSHA256,
    consentEventSequence:admission.consentEventSequence,
    issuedAtMs:NOW-1000,expiresAtMs:NOW+10000,
   };
   const signed:R29SignedBound={
    attestation:binding,
    signature:sign(null,canonicalR29BoundLease(binding),signer.privateKey)
      .toString('base64'),
   };
   if(mutateSigned){
    return {r26,signed:{...signed,signature:'A'.repeat(86)+'=='}};
   }
   if(hook)await hook();
   return {r26,signed};
  },
 };
}
async function latestConsent(memberId=A){
 const r=await query<{seq:string|number}>(
  'SELECT seq FROM writers_studio_beta_consent_events WHERE member_id=$1 ORDER BY seq DESC LIMIT 1',
  [memberId]);
 return Number(r.rows[0].seq);
}
const admission=(memberId=A,sequence=1):R29CurrentAdmission=>({
 memberId,sessionBindingSHA256:createHmac('sha256',internalSecret)
   .update('r38-fictional-session-binding:')
   .update(memberId===B?TOKENS.B:TOKENS.A).digest('hex'),
 consentNoticeSHA256:HASH,consentEventSequence:sequence,activeWriter:true,
});
async function run(
 workId:string,operation:'save'|'checkpoint'|'restore',
 body?:Record<string,unknown>,options?:{
  hook?:()=>Promise<void>;
  mutateSigned?:boolean;
  token?:string;claim?:string;origin?:string;
  memberId?:string;
 },
){
 const memberId=options?.memberId??A;
 const initialSeq=await latestConsent(memberId);
 const fakeOperator=preparedScope(admission(memberId,initialSeq),
  workId,Number(body?.baseRevisionId??1)+1,
  options?.hook,options?.mutateSigned);
 const fence:R29FictionalWorkFence={
  authority:'fictional_work_revocation_lock_only',
  runHeld:async(scope,action)=>transaction(async tx=>{
   const r=await tx.query<{member_id:string;active:boolean}>(
    'SELECT member_id,active FROM r38_fixture_work_fence WHERE work_id=$1 FOR UPDATE',
    [scope.workId]);
   if(r.rows[0]?.member_id!==scope.memberId||r.rows[0]?.active!==true)
    throw new WorkRecoveryRefusal('r29_session_or_consent_changed');
   return action();
  }),
 };
 return handleHeldDraftRequestR38({
  request:mockRequest(workId,operation,body,{token:options?.token,claim:options?.claim,
   origin:options?.origin}),
  workId,sessionBindingSecret:internalSecret,issuer:fakeOperator,
  workFence:fence,nowMs:()=>NOW,
 });
}
async function consent(decision:'accept'|'revoke',memberId=A){
 await pool().query(
  'INSERT INTO writers_studio_beta_consent_events(member_id,decision,policy_version,policy_sha256) VALUES($1,$2,$3,$4)',
  [memberId,decision,POLICY,HASH]);
}
async function seed(workId:string,asSections=false){
 const content=asSections?
  {sections:[{id:S1,text:'R38 first fictional section\n\n'},
    {id:S2,text:'R38 second fictional section'}]}:
  {content:SECRET+' original'};
 return beginHeldDraftR35({subject:subject(),workId,custody:custody(workId),...content});
}
async function generations(workId:string){
 const x=await pool().query<{n:number}>(
  'SELECT count(*)::int AS n FROM writers_studio_r35_draft_versions WHERE work_id=$1',
  [workId]);return x.rows[0].n;
}
group('R38 actual fictional session → R29 signed lease → R35 PG16 and vault',()=>{
 beforeAll(async()=>{
  // Exact fixture flags, PG setup and policy are prepared by the separate,
  // R38-named ephemeral PG16 driver. Never alter shared production tables.
  expect(R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED).toBe(false);
  expect(R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED).toBe(false);
  for(const work of [W1,W2,W3,W4,W5,W6])await seed(work,work===W4);
 });
 afterAll(async()=>{
  await closePool();
  await pool().end();
  for(const key of keys.values())key.keyBytes.fill(0);
 });
 it('saves a fictional session-authorized request as ciphertext; no prose in SQL',async()=>{
  const response=await run(W1,'save',{content:SECRET+' SAVE',
   baseRevisionId:1,idempotencyKey:'r38-save-first'});
  expect(response).toMatchObject({kind:'held_fixture_only',generation:2,
   checkpointCount:0,replayed:false,releaseApproved:false});
  const reopened=await reopenHeldDraftR35({subject:subject(),workId:W1,
   custody:custody(W1),generation:2});
  expect(reopened.content).toBe(SECRET+' SAVE');
  expect(JSON.stringify(response)).not.toContain(SECRET);
  expect(await generations(W1)).toBe(2);
 });
 it('repeats exact older Save without adding another revision',async()=>{
  const body={content:SECRET+' SAVE',baseRevisionId:1,
   idempotencyKey:'r38-save-first'};
  const response=await run(W1,'save',body);
  expect(response).toMatchObject({kind:'held_fixture_only',replayed:true,generation:2});
  expect(await generations(W1)).toBe(2);
 });
 it('withdraws consent DURING key issue and refuses every new ciphertext save',async()=>{
  const response=await run(W2,'save',{content:SECRET+' should not save',
    baseRevisionId:1,idempotencyKey:'r38-withdrawn'},
   {hook:()=>consent('revoke')});
  expect(response.kind).toBe('refused');
  expect(await generations(W2)).toBe(1);
  // Restore fixture writer consent only between tests, not inside real route.
  await consent('accept');
 });
 it('refuses a changed/latest consent sequence even when writer re-accepts',async()=>{
  const response=await run(W3,'save',{content:SECRET+' invalid sequence',
   baseRevisionId:1,idempotencyKey:'r38-epoch-changed'},
   {hook:()=>consent('accept')});
  expect(response.kind).toBe('refused');
  expect(await generations(W3)).toBe(1);
 });
 it('rejects a browser member ID conflicting with the verified session',async()=>{
  const response=await run(W3,'save',{content:SECRET+' forged-owner',
    baseRevisionId:1,idempotencyKey:'r38-owner'},
   {claim:B});
  expect(response).toMatchObject({kind:'refused',status:403});
  expect(await generations(W3)).toBe(1);
  // A new request with no forged member claim retains the original identity.
  const legitimate=await run(W3,'save',{content:SECRET+' server-owned',
    baseRevisionId:1,idempotencyKey:'r38-owner-legitimate'});
  expect(legitimate).toMatchObject({kind:'held_fixture_only',generation:2});
 });
 it('refuses a forged R29 signed key lease before draft storage',async()=>{
  const response=await run(W5,'save',{content:SECRET+' forged',
    baseRevisionId:1,idempotencyKey:'r38-forged'},{mutateSigned:true});
  expect(response.kind).toBe('refused');
  expect(await generations(W5)).toBe(1);
 });
 it('refuses missing session, founder-witness and foreign Work',async()=>{
  const request={content:SECRET+' denied',
   baseRevisionId:1,idempotencyKey:'r38-denied'};
  expect((await run(W5,'save',request,{token:'unknown'})).kind).toBe('refused');
  expect((await run(W5,'save',request,{token:TOKENS.founder})).kind).toBe('refused');
  expect((await run(BWORK,'save',request,{token:TOKENS.A})).kind).toBe('refused');
  expect(await generations(W5)).toBe(1);
 });
 it('keeps section checkpoint header-only, encrypted and recoverable',async()=>{
  const response=await run(W4,'checkpoint',{
   baseRevisionId:1,idempotencyKey:'r38-cp-sections'});
  expect(response).toMatchObject({kind:'held_fixture_only',
   generation:2,checkpointCount:1});
  const roundtrip=await reopenHeldDraftR35({
   subject:subject(),workId:W4,custody:custody(W4),generation:2});
  expect(roundtrip.sections.map(x=>x.id)).toEqual([S1,S2]);
  expect(roundtrip.content).toBe('R38 first fictional section\n\nR38 second fictional section');
 });
 it('restores prior encrypted section generation without guessing topology',async()=>{
  const response=await run(W4,'restore',{
   revisionNumber:1,baseRevisionId:2,idempotencyKey:'r38-restore-sections'});
  expect(response).toMatchObject({kind:'held_fixture_only',
   generation:3,checkpointCount:2});
  const prior=await reopenHeldDraftR35({subject:subject(),workId:W4,
   custody:custody(W4),generation:1});
  const current=await reopenHeldDraftR35({subject:subject(),workId:W4,
   custody:custody(W4),generation:3});
  expect(current.sections).toEqual(prior.sections);
 });
 it('refuses unreachable signer service and does not advance version',async()=>{
  const current=await generations(W6);
  const result=await run(W6,'save',{content:SECRET+' denied by outage',
   baseRevisionId:1,idempotencyKey:'r38-no-kms'},{
   hook:async()=>{throw new Error('R38_FICTIONAL_KEY_OPERATOR_OFFLINE');}});
  expect(result.kind).toBe('refused');
  expect(await generations(W6)).toBe(current);
 });
 it('refuses wrong-origin and incomplete submission before granting a Work key',async()=>{
  const result=await run(W5,'save',{content:SECRET,
   baseRevisionId:1,idempotencyKey:'r38-cors'},
   {origin:'https://foreign.invalid'});
  expect(result.kind).toBe('refused');
  expect(await generations(W5)).toBe(1);
 });
});
