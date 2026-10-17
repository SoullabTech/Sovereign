/**
 * R38 physical fictional authentication + R26/R29 signed authorization +
 * R35 SQL Work history + AES-GCM immutable vault. No live routes, real
 * accounts or independently managed keys; all signers are test process only.
 */
import {NextRequest} from 'next/server';
import {writeFileSync,statSync} from 'node:fs';
import path from 'node:path';
import {handleSignedSectionRequestR39,R39_REAL_SIGNED_SECTION_REQUEST_ENABLED} from '../../../lib/writersStudio/recovery/heldSignedSectionRequestR39';
import {HeldAuthorChoiceWitnessR43,R43_REAL_AUTHOR_CHOICE_ENABLED} from '../../../lib/writersStudio/recovery/heldAuthorChoiceR43';
import {prepareHeldSignedApplyR46,submitHeldSignedApplyR46,R46_REAL_DURABLE_SIGNED_APPLY_ENABLED} from '../../../lib/writersStudio/recovery/heldDurableSignedApplyR46';
import {prepareHeldUndoR47,submitHeldUndoR47,R47_REAL_DURABLE_UNDO_ENABLED} from '../../../lib/writersStudio/recovery/heldDurableUndoR47';
import {inspectSpentApplyR48,R48_REAL_SPENT_APPLY_RECOVERY_ENABLED} from '../../../lib/writersStudio/recovery/heldSpentApplyEvidenceR48';
import {HeldCanonicalAuthorJourneyR53,R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED} from '../../../lib/writersStudio/recovery/heldCanonicalAuthorJourneyR53';
import {exactTextareaPassageR41} from '../../../lib/writersStudio/exactLiveSelectionR41';
import type {R37SectionSelection,R37FixtureGesture,R37UndoGesture} from '../../../lib/writersStudio/recovery/heldSectionApplyR37';
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

const active=process.env.R39_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
 process.env.R39_SIGNED_SECTION_REQUEST_FIXTURE==='fictional-only'&&
 process.env.R37_SECTION_PASSAGE_FIXTURE==='fictional-only'&&
 process.env.R36_PASSAGE_REVIEW_FIXTURE==='fictional-only'&&
 process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE==='fictional-only'&&
 (process.env.DATABASE_URL||'').startsWith('postgresql://fict@127.0.0.1:')&&
 (process.env.FILE_STORAGE_PATH||'').includes('ws-r35-physical-');
const group=active?describe:describe.skip;
const r43Only=active&&process.env.R43_AUTHOR_CHOICE_FIXTURE==='fictional-only';
const r46Only=active&&process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE==='fictional-only';
const durableTest=r46Only?it:it.skip;
const r48Only=r46Only&&process.env.R48_SPENT_APPLY_RECOVERY_FIXTURE==='fictional-only';
const r47Only=r46Only&&process.env.R47_DURABLE_UNDO_FIXTURE==='fictional-only';
const undoTest=r47Only?it:it.skip;
const evidenceTest=r48Only?it:it.skip;
const r53Only=r47Only&&process.env.R53_CANONICAL_AUTHOR_FIXTURE==='fictional-only';
const canonicalAuthorTest=r53Only?it:it.skip;
let savedR48CompletedToken:string|null=null;
let savedR48UnresolvedToken:string|null=null;
const choiceTest=r43Only?it:it.skip;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const FOUNDER='55555555-5555-4555-8555-555555555555';
const W1='33333333-3333-4333-8333-333333333331';
const W2='33333333-3333-4333-8333-333333333332';
const W3='33333333-3333-4333-8333-333333333333';
const W4='33333333-3333-4333-8333-333333333334';
const W5='33333333-3333-4333-8333-333333333335';
const W6='33333333-3333-4333-8333-333333333336';
const W7='33333333-3333-4333-8333-333333333337';
const W8='33333333-3333-4333-8333-333333333338';
const W9='33333333-3333-4333-8333-333333333339';
const W10='33333333-3333-4333-8333-333333333330';
const W11='33333333-3333-4333-8333-33333333333a';
const W12='33333333-3333-4333-8333-33333333333b';
const W13='33333333-3333-4333-8333-33333333333c';
const W14='33333333-3333-4333-8333-33333333333d';
const W15='33333333-3333-4333-8333-33333333333e';
const W16='33333333-3333-4333-8333-33333333333f';
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

const PICK='88888888-8888-4888-8888-888888888881';
const OTHER='88888888-8888-4888-8888-888888888882';
const shaText=(s:string)=>digest(Buffer.from(s,'utf8'));
async function anchored(workId:string,generation=1):Promise<{
 selection:R37SectionSelection;gesture:R37FixtureGesture;
}>{
 const view=await reopenHeldDraftR35({
  subject:subject(),workId,custody:custody(workId),generation,
 });
 const section=view.sections[0];
 const original='first fictional';
 const start=Array.from(section.text.split(original)[0]).length;
 const selection:R37SectionSelection={
  expectedWorkSHA256:shaText(view.content),
  section:{
   sectionId:section.id,currentText:section.text,expectedGeneration:generation,
   expectedDraftSHA256:shaText(section.text),
   anchor:{sectionId:section.id,start,end:start+Array.from(original).length,
    selectedText:original,sectionSHA256:shaText(section.text)},
   alternatives:[
    {id:PICK,origin:'maia',wording:'first enchanted'},
    {id:OTHER,origin:'member',wording:'first sparkling'},
   ],
   chosenAlternativeId:PICK,
  },
 };
 const gesture:R37FixtureGesture={
  kind:'synthetic_author_clicked_apply_section',workId,
  sectionId:section.id,alternativeId:PICK,expectedGeneration:generation,
  sectionSHA256:shaText(section.text),
  selectedPassageSHA256:shaText(original),
  idempotencyKey:'fictional-r39-apply-repeat-001',
 };
 return {selection,gesture};
}
type SectionSubmission={
 operation:'apply-section';selection:R37SectionSelection;gesture:R37FixtureGesture;
}|{operation:'undo-section';gesture:R37UndoGesture};
async function signedSection(
 workId:string,submitted:SectionSubmission,options?:{
 hook?:()=>Promise<void>;mutateSigned?:boolean;
 token?:string;claim?:string;origin?:string;
 }){
 const epoch=await latestConsent();
 const generation=submitted.operation==='apply-section'?
   submitted.selection.section.expectedGeneration+1:
   submitted.gesture.expectedGeneration+1;
 const issuer=preparedScope(admission(A,epoch),workId,generation,
  options?.hook,options?.mutateSigned);
 const fence:R29FictionalWorkFence={
  authority:'fictional_work_revocation_lock_only',
  runHeld:async(scope,callback)=>transaction(async tx=>{
   const row=await tx.query<{member_id:string;active:boolean}>(
    'SELECT member_id,active FROM r38_fixture_work_fence WHERE work_id=$1 FOR UPDATE',
    [scope.workId]);
   if(!row.rows[0]||row.rows[0].member_id!==scope.memberId||
      row.rows[0].active!==true)
    throw new WorkRecoveryRefusal('r29_session_or_consent_changed');
   return callback();
  }),
 };
 const request=new NextRequest(
  'https://soullab.life/api/sovereign/writers-studio/held-pair',{
   method:'POST',
   headers:{host:'soullab.life',origin:options?.origin??'https://soullab.life',
    'x-session-token':options?.token??TOKENS.A,
    ...(options?.claim?{'x-member-id':options.claim}:{})},
   body:JSON.stringify(submitted),
  });
 return handleSignedSectionRequestR39({
  request,workId,issuer,sessionBindingSecret:internalSecret,
  workFence:fence,nowMs:()=>NOW,
 });
}
/** R43: browser sends only the one-use approval; choice and Work stay in Node. */
function authorChoiceRequest(body?:unknown,options?:{token?:string;origin?:string}){
 const headers:Record<string,string>={
  host:'soullab.life',
  origin:options?.origin??'https://soullab.life',
  'x-session-token':options?.token??TOKENS.A,
 };
 if(body!==undefined)headers['content-type']='application/json';
 return new NextRequest(
  'https://soullab.life/api/sovereign/writers-studio/held-pair',{
   method:body===undefined?'GET':'POST',headers,
   ...(body===undefined?{}:{body:JSON.stringify(body)}),
  });
}
function heldChoiceContext(workId:string,request:NextRequest,
 hook?:()=>Promise<void>){
 const issuer:R38FictionalIssuer={
  authority:'fabricated_r38_signers_no_external_kms',
  async issue({admission:checked,workId:owned,generation}){
   return preparedScope(checked,owned,generation,hook).issue({
    admission:checked,workId:owned,generation,
   });
  },
 };
 const workFence:R29FictionalWorkFence={
  authority:'fictional_work_revocation_lock_only',
  runHeld:async(scope,action)=>transaction(async tx=>{
   const row=await tx.query<{member_id:string;active:boolean}>(
    'SELECT member_id,active FROM r38_fixture_work_fence WHERE work_id=$1 FOR UPDATE',
    [scope.workId]);
   if(row.rows.length!==1||
      row.rows[0].member_id!==scope.memberId||
      row.rows[0].active!==true)
    throw new WorkRecoveryRefusal('r43_changed_work_fence');
   return action();
  }),
 };
 return {request,workId,issuer,sessionBindingSecret:internalSecret,
   workFence,nowMs:()=>NOW};
}

group('R39 actual signed section choice → R37 Apply/Undo → R35 encrypted PG16',()=>{
 beforeAll(async()=>{
  // Exact fixture flags, PG setup and policy are prepared by the separate,
  // R38-named ephemeral PG16 driver. Never alter shared production tables.
  expect(R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED).toBe(false);
  expect(R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED).toBe(false);
  const works=r53Only?[W1,W2,W3,W4,W5,W6,W7,W8,W9,W10,W11,W12,W13,W14,W15,W16]:
    r47Only?[W1,W2,W3,W4,W5,W6,W7,W8,W9,W10,W11,W12,W13,W14,W15]:
    r46Only?[W1,W2,W3,W4,W5,W6,W7,W8,W9,W10,W11,W12,W13]:
    r43Only?[W1,W2,W3,W4,W5,W6,W7,W8,W9,W10,W11]:
    [W1,W2,W3,W4,W5,W6,W7,W8,W9];
  for(const work of works)
    await seed(work,[W4,W7,W8,W9,W10,W11,W12,W13,W14,W15,W16].includes(work));
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

 it('keeps signed multi-section Apply/Undo real-member gate disabled',()=>{
  expect(R39_REAL_SIGNED_SECTION_REQUEST_ENABLED).toBe(false);
 });
 it('signs chosen section Apply, preserves untouched section and ciphertext history',async()=>{
  const initial=await reopenHeldDraftR35({subject:subject(),workId:W7,
   custody:custody(W7),generation:1});
  const body=await anchored(W7);
  const result=await signedSection(W7,{operation:'apply-section',...body});
  expect(result).toMatchObject({kind:'fictional_section_receipt_only',
   status:200,action:'apply',generation:2,replayed:false,releaseApproved:false});
  const after=await reopenHeldDraftR35({subject:subject(),workId:W7,
   custody:custody(W7),generation:2});
  expect(after.sections.map(x=>x.id)).toEqual(initial.sections.map(x=>x.id));
  expect(after.sections[0].text).toContain('first enchanted');
  expect(after.sections[1]).toEqual(initial.sections[1]);
  expect(after.note).toContain('soullab.ws.r37.section-passage.v1');
  expect(JSON.stringify(result)).not.toContain('first fictional');
  expect(JSON.stringify(result)).not.toContain('first enchanted');
  expect(await generations(W7)).toBe(2);
 });
 it('exact Apply retry is a structural replay without a second encrypted version',async()=>{
  const body=await anchored(W7);
  const result=await signedSection(W7,{operation:'apply-section',...body});
  expect(result).toMatchObject({kind:'fictional_section_receipt_only',
   action:'apply',replayed:true,generation:2});
  expect(await generations(W7)).toBe(2);
 });
 it('signed Undo restores frozen original multi-section Work and replays exactly once',async()=>{
  const request:SectionSubmission={operation:'undo-section',gesture:{
   kind:'synthetic_author_clicked_undo_section',
   workId:W7,expectedGeneration:2,appliedVersion:2,
   idempotencyKey:'r39-undo-original-001',
  }};
  const result=await signedSection(W7,request);
  expect(result).toMatchObject({kind:'fictional_section_receipt_only',
   action:'undo',replayed:false,generation:3,checkpointCount:1});
  const original=await reopenHeldDraftR35({subject:subject(),
   workId:W7,custody:custody(W7),generation:1});
  const undone=await reopenHeldDraftR35({subject:subject(),
   workId:W7,custody:custody(W7),generation:3});
  expect(undone.sections).toEqual(original.sections);
  expect(undone.content).toBe(original.content);
  const replay=await signedSection(W7,request);
  expect(replay).toMatchObject({replayed:true,generation:3,checkpointCount:1});
  expect(await generations(W7)).toBe(3);
 });
 it('another same passage Apply with a fresh key cannot overwrite new head',async()=>{
  const body=await anchored(W7);
  const fresh={...body,gesture:{...body.gesture,idempotencyKey:'r39-fresh-conflict-002'}};
  const out=await signedSection(W7,{operation:'apply-section',...fresh});
  expect(out.kind).toBe('refused');
  expect(await generations(W7)).toBe(3);
 });
 it('withdrawal while fictional KMS responds denies signed Apply and creates no draft',async()=>{
  const body=await anchored(W8);
  const out=await signedSection(W8,{operation:'apply-section',...body},
   {hook:()=>consent('revoke')});
  expect(out.kind).toBe('refused');
  expect(await generations(W8)).toBe(1);
  await consent('accept');
 });
 it('a forged signed R29 lease cannot Apply and leaves ciphertext version unchanged',async()=>{
  const body=await anchored(W9);
  const out=await signedSection(W9,{operation:'apply-section',...body},
   {mutateSigned:true});
  expect(out.kind).toBe('refused');
  expect(await generations(W9)).toBe(1);
 });
 it('wrong selected section choice is refused without modifying original Work',async()=>{
  const body=await anchored(W8);
  const forged={...body,gesture:{...body.gesture,
   selectedPassageSHA256:shaText('wrong chosen passage')}};
  const out=await signedSection(W8,{operation:'apply-section',...forged});
  expect(out.kind).toBe('refused');
  expect(await generations(W8)).toBe(1);
 });
 it('forged member header and unrelated origin cannot Apply encrypted passage',async()=>{
  const body=await anchored(W9);
  expect((await signedSection(W9,{operation:'apply-section',...body},
    {claim:B})).kind).toBe('refused');
  expect((await signedSection(W9,{operation:'apply-section',...body},
    {origin:'https://foreign.invalid'})).kind).toBe('refused');
  expect(await generations(W9)).toBe(1);
 });
 it('new Undo after unrelated Undo is not permitted to restore an older Apply',async()=>{
  const gesture:R37UndoGesture={
   kind:'synthetic_author_clicked_undo_section',
   workId:W7,expectedGeneration:3,appliedVersion:3,
   idempotencyKey:'r39-undo-twice-refused',
  };
  const out=await signedSection(W7,{operation:'undo-section',gesture});
  expect(out.kind).toBe('refused');
  expect(await generations(W7)).toBe(3);
 });
 choiceTest('R43 reviewed one-use author token physically crosses signed R39 → R35 Apply/Undo',async()=>{
  expect(R43_REAL_AUTHOR_CHOICE_ENABLED).toBe(false);
  const gate=new HeldAuthorChoiceWitnessR43();
  const original=await reopenHeldDraftR35({
   subject:subject(),workId:W10,custody:custody(W10),generation:1,
  });
  const trusted=(await anchored(W10)).selection;
  const preview=await gate.prepare({
   context:heldChoiceContext(W10,authorChoiceRequest()),
   custody:custody(W10),selection:trusted,
  });
  expect(preview.kind).toBe('fictional_reviewed_choice_only');
  if(preview.kind!=='fictional_reviewed_choice_only')
   throw Error('r43_physical_preview_failed');
  expect(preview.originalPassage).toBe('first fictional');
  expect(await generations(W10)).toBe(1);
  const chosen={kind:'apply_reviewed_choice',approvalToken:preview.approvalToken};
  const applied=await gate.submit(heldChoiceContext(W10,authorChoiceRequest(chosen)));
  expect(applied).toMatchObject({
   kind:'fictional_one_use_choice_receipt_only',
   action:'apply',generation:2,replayed:false,releaseApproved:false,
  });
  expect(await generations(W10)).toBe(2);
  const replay=await gate.submit(heldChoiceContext(W10,authorChoiceRequest(chosen)));
  expect(replay).toMatchObject({kind:'refused',status:409});
  expect(await generations(W10)).toBe(2);
  const after=await reopenHeldDraftR35({
   subject:subject(),workId:W10,custody:custody(W10),generation:2,
  });
  expect(after.sections.map(s=>s.id)).toEqual(original.sections.map(s=>s.id));
  expect(after.sections[0].text).toContain('first enchanted');
  expect(after.sections[1]).toEqual(original.sections[1]);
  expect(JSON.stringify(applied)).not.toContain('first enchanted');
  if(applied.kind!=='fictional_one_use_choice_receipt_only'||!applied.undoToken)
   throw Error('r43_undo_ticket_not_issued');
  const undoRequest={kind:'undo_reviewed_choice',approvalToken:applied.undoToken};
  const undone=await gate.submit(heldChoiceContext(W10,authorChoiceRequest(undoRequest)));
  expect(undone).toMatchObject({
   kind:'fictional_one_use_choice_receipt_only',
   action:'undo',generation:3,checkpointCount:1,releaseApproved:false,
  });
  const restored=await reopenHeldDraftR35({
   subject:subject(),workId:W10,custody:custody(W10),generation:3,
  });
  expect(restored.sections).toEqual(original.sections);
  expect(restored.content).toBe(original.content);
  expect(await gate.submit(heldChoiceContext(W10,authorChoiceRequest(undoRequest))))
    .toMatchObject({kind:'refused',status:409});
  expect(await generations(W10)).toBe(3);
 });
 choiceTest('R43 consent withdrawal DURING signed key grant refuses physical Apply',async()=>{
  const gate=new HeldAuthorChoiceWitnessR43();
  const preview=await gate.prepare({
   context:heldChoiceContext(W11,authorChoiceRequest()),
   custody:custody(W11),selection:(await anchored(W11)).selection,
  });
  expect(preview.kind).toBe('fictional_reviewed_choice_only');
  if(preview.kind!=='fictional_reviewed_choice_only')
   throw Error('r43_consent_fixture_could_not_prepare');
  const chosen={kind:'apply_reviewed_choice',approvalToken:preview.approvalToken};
  const refused=await gate.submit(heldChoiceContext(
   W11,authorChoiceRequest(chosen),()=>consent('revoke')));
  expect(refused.kind).toBe('refused');
  expect(await generations(W11)).toBe(1);
  // The latest consent is now revoked: R43 refuses BEFORE ticket lookup.
  expect(await gate.submit(heldChoiceContext(W11,authorChoiceRequest(chosen))))
   .toMatchObject({kind:'refused',status:403});
  await consent('accept');
 });

 durableTest('R46 SQL durable claim gates exactly one signed encrypted Apply',async()=>{
  expect(R46_REAL_DURABLE_SIGNED_APPLY_ENABLED).toBe(false);
  const original=await reopenHeldDraftR35({
   subject:subject(),workId:W12,custody:custody(W12),generation:1,
  });
  const selection=(await anchored(W12)).selection;
  const secret=Buffer.alloc(32,0x46);
  const input=()=>({
   context:heldChoiceContext(W12,authorChoiceRequest()),
   custody:custody(W12),selection,approvalIssuerSecret:secret,
  });
  const reviewed=await prepareHeldSignedApplyR46(input());
  expect(reviewed).toMatchObject({kind:'fictional_durable_approval_prepared'});
  if(reviewed.kind!=='fictional_durable_approval_prepared')
   throw Error('r46_prepare_failed');
  expect(reviewed.originalPassage).toBe('first fictional');
  if(r48Only)savedR48CompletedToken=reviewed.opaqueToken;
  expect(await generations(W12)).toBe(1);
  const body={kind:'apply_reviewed_change',opaqueToken:reviewed.opaqueToken};
  // Competing approvals use the SAME prepared token; at most one PG CAS wins.
  const [a,b]=await Promise.all([
   submitHeldSignedApplyR46({...input(),context:heldChoiceContext(W12,authorChoiceRequest(body))}),
   submitHeldSignedApplyR46({...input(),context:heldChoiceContext(W12,authorChoiceRequest(body))}),
  ]);
  expect([a,b].filter(x=>x.kind==='fictional_durably_claimed_encrypted_apply'))
   .toHaveLength(1);
  expect([a,b].filter(x=>x.kind==='refused')).toHaveLength(1);
  const receipt=[a,b].find(x=>x.kind==='fictional_durably_claimed_encrypted_apply');
  expect(receipt).toMatchObject({generation:2,action:'apply',
   durableClaimSpent:true,releaseApproved:false});
  expect(await generations(W12)).toBe(2);
  const edited=await reopenHeldDraftR35({
   subject:subject(),workId:W12,custody:custody(W12),generation:2,
  });
  expect(edited.sections[0].text).toContain('first enchanted');
  expect(edited.sections[1]).toEqual(original.sections[1]);
  expect(JSON.stringify(receipt)).not.toContain('first enchanted');
  expect((await pool().query(
   "SELECT count(*)::int n FROM writers_studio_r44_held_approval WHERE work_id=$1 AND state='spent'",
   [W12])).rows[0].n).toBe(1);
  const privateApproval=await pool().query<{row:string}>(
   'SELECT row_to_json(x)::text AS row FROM writers_studio_r44_held_approval x WHERE work_id=$1',
   [W12]);
  expect(privateApproval.rows).toHaveLength(1);
  for(const privateMarker of [
    reviewed.opaqueToken,'first fictional','first enchanted',
    'R38 first fictional section',
  ])expect(privateApproval.rows[0].row).not.toContain(privateMarker);
  expect(await submitHeldSignedApplyR46({...input(),
   context:heldChoiceContext(W12,authorChoiceRequest(body))}))
   .toMatchObject({kind:'refused',status:409});
  expect(await generations(W12)).toBe(2);
 });
 durableTest('R46 revoked consent during key issue leaves durable claim spent and Draft unchanged',async()=>{
  const secret=Buffer.alloc(32,0x46);
  const selection=(await anchored(W13)).selection;
  const trusted=()=>({
   context:heldChoiceContext(W13,authorChoiceRequest()),
   custody:custody(W13),selection,approvalIssuerSecret:secret,
  });
  const reviewed=await prepareHeldSignedApplyR46(trusted());
  expect(reviewed).toMatchObject({kind:'fictional_durable_approval_prepared'});
  if(reviewed.kind!=='fictional_durable_approval_prepared')
   throw Error('r46_withdraw_review_missing');
  if(r48Only)savedR48UnresolvedToken=reviewed.opaqueToken;
  const valid={kind:'apply_reviewed_change',opaqueToken:reviewed.opaqueToken};
  expect(await submitHeldSignedApplyR46({...trusted(),
   context:heldChoiceContext(W13,authorChoiceRequest({
    ...valid,sectionId:S2,
   }))})).toMatchObject({kind:'refused',status:400});
  expect((await pool().query(
   "SELECT state FROM writers_studio_r44_held_approval WHERE work_id=$1",
   [W13])).rows[0].state).toBe('prepared');
  const denied=await submitHeldSignedApplyR46({...trusted(),
   context:heldChoiceContext(W13,authorChoiceRequest(valid),
     ()=>consent('revoke')),
  });
  expect(denied.kind).toBe('refused');
  expect(await generations(W13)).toBe(1);
  expect((await pool().query(
   "SELECT state FROM writers_studio_r44_held_approval WHERE work_id=$1",
   [W13])).rows[0].state).toBe('spent');
  await consent('accept');
  expect((await submitHeldSignedApplyR46({...trusted(),
   context:heldChoiceContext(W13,authorChoiceRequest(valid))})).kind)
   .toBe('refused');
  expect(await generations(W13)).toBe(1);
 });


 evidenceTest('R48 re-observes token-specific immutable encrypted Apply and holds an uncommitted spent token',async()=>{
  expect(R48_REAL_SPENT_APPLY_RECOVERY_ENABLED).toBe(false);
  if(!savedR48CompletedToken||!savedR48UnresolvedToken)
   throw Error('R48_REQUIRED_SPENT_TOKEN_FIXTURE_MISSING');
  const authority='fictional_independent_recovery_custodian_only' as const;
  const root=Buffer.alloc(32,0x46);
  const input=(workId:string,token:string)=>({
   authority,memberId:A,workId,approvalToken:token,
   approvalIssuerSecret:root,custody:custody(workId),
  });
  const applied=await inspectSpentApplyR48(input(W12,savedR48CompletedToken));
  expect(applied).toMatchObject({
   kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',
   generation:2,priorDraftVersionVerified:true,
   unchangedSectionIds:[S2],retryAuthorized:false,releaseApproved:false,
  });
  const noSave=await inspectSpentApplyR48(input(W13,savedR48UnresolvedToken));
  expect(noSave).toMatchObject({
   kind:'held_only',reason:'HELD_SPENT_WITHOUT_MATCHING_RECEIPT',
   retryAuthorized:false,releaseApproved:false,
  });
  expect(await generations(W12)).toBe(2);
  expect(await generations(W13)).toBe(1);
  const wrong=await inspectSpentApplyR48({
   ...input(W12,savedR48CompletedToken),approvalIssuerSecret:Buffer.alloc(32,9),
  });
  expect(wrong).toMatchObject({kind:'held_only',retryAuthorized:false});
  expect(JSON.stringify(applied)).not.toContain('first fictional');
  expect(JSON.stringify(applied)).not.toContain(savedR48CompletedToken);
  // Temporary 0600 fixture only; deliberately no private prose or signer keys.
  const file=process.env.R48_COLD_FIXTURE_PATH||'';
  const vaultDir=process.env.FILE_STORAGE_PATH||'';
  if(path.basename(file)!=='r48-spent-apply-cold.json'||
     path.dirname(file)!==path.dirname(vaultDir)||
     !path.basename(path.dirname(file)).startsWith('ws-r35-physical-r48-'))
   throw Error('R48_ESCROW_PATH_MUST_MATCH_DISPOSABLE_FIXTURE');
  const publicDER=highwaterSigner.publicKey.export({
   format:'der',type:'spki',
  }).toString('base64');
  const encode=(workId:string,token:string,expected:string)=>{
   const c=custody(workId);
   if(!c.signedDeletion)throw Error('R48_SYNTHETIC_DELETE_PROOF_MISSING');
   return {memberId:A,workId,approvalToken:token,
    issuerSecret:root.toString('base64'),
    keyId:c.key.keyId,keyBytes:c.key.keyBytes.toString('base64'),
    signedDeletion:c.signedDeletion,publicSignerDER:publicDER,
    independentMinGeneration:100,expected};
  };
  writeFileSync(file,JSON.stringify({
   protocol:'soullab.ws.r48.fictional-cold-reconciliation-fixture',
   entries:[
    encode(W12,savedR48CompletedToken,'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED'),
    encode(W13,savedR48UnresolvedToken,'HELD_SPENT_WITHOUT_MATCHING_RECEIPT'),
   ],
  }),{mode:0o600,flag:'wx'});
  expect(statSync(file).mode&0o077).toBe(0);
 });

 undoTest('R47 separately approved durable Undo restores EXACT prior ciphertext partition',async()=>{
  expect(R47_REAL_DURABLE_UNDO_ENABLED).toBe(false);
  // R46 above already saved W12 as encrypted version 2 from R37 Apply.
  const original=await reopenHeldDraftR35({
   subject:subject(),workId:W12,custody:custody(W12),generation:1,
  });
  expect(await generations(W12)).toBe(2);
  const issuer=Buffer.alloc(32,0x47);
  const initial=()=>({
   context:heldChoiceContext(W12,authorChoiceRequest()),
   custody:custody(W12),approvalIssuerSecret:issuer,
  });
  const prepared=await prepareHeldUndoR47(initial());
  expect(prepared).toMatchObject({
   kind:'fictional_durable_undo_prepared',
   appliedGeneration:2,restoresGeneration:1,sectionId:S1,
   releaseApproved:false,
  });
  if(prepared.kind!=='fictional_durable_undo_prepared')
   throw Error('r47_undo_initial_preview_refused');
  const token={kind:'undo_reviewed_change',opaqueToken:prepared.approvalToken};
  // Closed browser intent cannot smuggle any Work/section/prose override.
  expect(await submitHeldUndoR47({
   ...initial(),context:heldChoiceContext(
    W12,authorChoiceRequest({...token,sectionId:S1})),
  })).toMatchObject({kind:'refused',status:400});
  expect((await query<{state:string}>(
   'SELECT state FROM writers_studio_r47_held_undo WHERE work_id=$1',
   [W12])).rows[0].state).toBe('prepared');
  const [a,b]=await Promise.all([
   submitHeldUndoR47({...initial(),context:heldChoiceContext(W12,authorChoiceRequest(token))}),
   submitHeldUndoR47({...initial(),context:heldChoiceContext(W12,authorChoiceRequest(token))}),
  ]);
  expect([a,b].filter(x=>x.kind==='fictional_durable_undo_confirmed'))
   .toHaveLength(1);
  expect([a,b].filter(x=>x.kind==='refused')).toHaveLength(1);
  expect(await generations(W12)).toBe(3);
  const verified=await reopenHeldDraftR35({
   subject:subject(),workId:W12,custody:custody(W12),generation:3,
  });
  expect(verified.action).toBe('restore');
  expect(verified.restoredFrom).toBe(1);
  expect(verified.sections).toEqual(original.sections);
  expect(verified.content).toBe(original.content);
  expect(verified.checkpointCount).toBe(1);
  expect(await submitHeldUndoR47({
   ...initial(),context:heldChoiceContext(W12,authorChoiceRequest(token)),
  })).toMatchObject({kind:'refused',status:409});
  expect(await generations(W12)).toBe(3);
  const rows=await query('SELECT * FROM writers_studio_r47_held_undo WHERE work_id=$1',
   [W12]);
  expect(rows.rows).toHaveLength(1);
  expect(rows.rows[0].state).toBe('spent');
  const metadata=JSON.stringify(rows.rows);
  for(const forbidden of [
   prepared.approvalToken,'first fictional','first enchanted',
  ])expect(metadata).not.toContain(forbidden);
 });
 undoTest('R47 refuses Undo before an applied encrypted section exists',async()=>{
  expect(await prepareHeldUndoR47({
   context:heldChoiceContext(W13,authorChoiceRequest()),
   custody:custody(W13),approvalIssuerSecret:Buffer.alloc(32,0x47),
  })).toMatchObject({kind:'refused',status:409});
  expect(await generations(W13)).toBe(1);
 });
 undoTest('R47 revoked consent during signer latency leaves Undo spent but no restore',async()=>{
  const apply=await signedSection(W14,{
   operation:'apply-section',...(await anchored(W14)),
  });
  expect(apply).toMatchObject({
   kind:'fictional_section_receipt_only',generation:2,
  });
  const issuer=Buffer.alloc(32,0x47);
  const input=()=>({
   context:heldChoiceContext(W14,authorChoiceRequest()),
   custody:custody(W14),approvalIssuerSecret:issuer,
  });
  const ready=await prepareHeldUndoR47(input());
  if(ready.kind!=='fictional_durable_undo_prepared')
   throw Error('r47_revocation_undo_not_prepared');
  const payload={kind:'undo_reviewed_change',opaqueToken:ready.approvalToken};
  const held=await submitHeldUndoR47({
   ...input(),context:heldChoiceContext(
    W14,authorChoiceRequest(payload),()=>consent('revoke')),
  });
  expect(held).toMatchObject({kind:'refused',status:503});
  expect(await generations(W14)).toBe(2);
  const state=await query<{state:string}>(
   'SELECT state FROM writers_studio_r47_held_undo WHERE work_id=$1',[W14]);
  expect(state.rows).toEqual([{state:'spent'}]);
  await consent('accept');
  expect(await submitHeldUndoR47({
   ...input(),context:heldChoiceContext(W14,authorChoiceRequest(payload)),
  })).toMatchObject({kind:'refused',status:409});
  expect(await generations(W14)).toBe(2);
 });
 undoTest('R47 interrupted after durable claim never restores or replays Undo',async()=>{
  const apply=await signedSection(W15,{
   operation:'apply-section',...(await anchored(W15)),
  });
  expect(apply).toMatchObject({
   kind:'fictional_section_receipt_only',generation:2,
  });
  const issuer=Buffer.alloc(32,0x47);
  const input=()=>({
   context:heldChoiceContext(W15,authorChoiceRequest()),
   custody:custody(W15),approvalIssuerSecret:issuer,
  });
  const ready=await prepareHeldUndoR47(input());
  if(ready.kind!=='fictional_durable_undo_prepared')
   throw Error('r47_interrupted_undo_not_prepared');
  const payload={kind:'undo_reviewed_change',opaqueToken:ready.approvalToken};
  const lost=await submitHeldUndoR47({
   ...input(),context:heldChoiceContext(W15,authorChoiceRequest(payload)),
   afterDurableClaim:()=>{throw Error('r47_fictional_lost_connection');},
  });
  expect(lost).toMatchObject({kind:'refused',status:503,
   reason:'spent_undo_commit_unknown_hold'});
  expect(await generations(W15)).toBe(2);
  expect((await query<{state:string}>(
   'SELECT state FROM writers_studio_r47_held_undo WHERE work_id=$1',
   [W15])).rows[0].state).toBe('spent');
  expect(await submitHeldUndoR47({
   ...input(),context:heldChoiceContext(W15,authorChoiceRequest(payload)),
  })).toMatchObject({kind:'refused',status:409});
  expect(await generations(W15)).toBe(2);
 });


 canonicalAuthorTest('R53 canonical R41 exact passage -> R44 consumed signed Apply -> separately approved R47 Undo',async()=>{
  expect(R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED).toBe(false);
  const initial=await reopenHeldDraftR35({
   subject:subject(),workId:W16,custody:custody(W16),generation:1,
  });
  const first=initial.sections[0].text;
  const word='first fictional';
  const at=first.indexOf(word);
  const picked=exactTextareaPassageR41(first,first,at,at+word.length);
  expect(picked).not.toBeNull();
  const alternatives=[
   {id:PICK,origin:'maia' as const,wording:'first enchanted'},
   {id:OTHER,origin:'member' as const,wording:'first sparkling'},
  ];
  const session=new HeldCanonicalAuthorJourneyR53();
  const authority=(request:NextRequest)=>({
   context:heldChoiceContext(W16,request),
   approvalIssuerSecret:Buffer.alloc(32,0x53),
   custody:custody(W16),alternatives,
  });
  const request=(data:unknown,origin='https://soullab.life')=>
   new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
    method:'POST',
    headers:{host:'soullab.life',origin,
     'content-type':'application/json','x-session-token':TOKENS.A},
    body:JSON.stringify(data),
   });
  const reviewBody={
   kind:'review_exact_passage',expectedGeneration:1,
   sectionId:S1,selected:picked,chosenAlternativeId:PICK,
  };
  // An editor must not accept client-authored replacement text or
  // another member's Work/section as a review.
  expect((await session.review(authority(request({
   ...reviewBody,replacement:'arbitrary browser prose',
  })))).kind).toBe('refused');
  expect(await generations(W16)).toBe(1);
  const reviewed=await session.review(authority(request(reviewBody)));
  expect(reviewed).toMatchObject({
   kind:'fictional_author_review',generation:1,sectionId:S1,
   alternativeId:PICK,originalPassage:word,
   proposedPassage:'first enchanted',canAutoApply:false,
   releaseApproved:false,
  });
  if(reviewed.kind!=='fictional_author_review')
   throw Error('r53_fictional_author_preview_failed');
  expect(await generations(W16)).toBe(1);
  const applyBody={kind:'apply_reviewed_change',opaqueToken:reviewed.reviewToken};
  const applied=await session.apply(authority(request(applyBody)));
  expect(applied).toMatchObject({
   kind:'fictional_author_apply_saved',generation:2,
   durableClaimSpent:true,canAutoRetry:false,releaseApproved:false,
  });
  expect((await session.apply(authority(request(applyBody)))).kind)
   .toBe('refused');
  expect(await generations(W16)).toBe(2);
  const changed=await reopenHeldDraftR35({
   subject:subject(),workId:W16,custody:custody(W16),generation:2,
  });
  expect(changed.sections[0].text).toContain('first enchanted');
  expect(changed.sections[1]).toEqual(initial.sections[1]);
  // The spent Apply token cannot be repurposed to Undo this revision.
  expect((await session.undo(authority(request({
   kind:'undo_reviewed_change',opaqueToken:reviewed.reviewToken,
  })))).kind).toBe('refused');
  expect(await generations(W16)).toBe(2);
  // The second action must be initiated separately after the first Save.
  const undoReview=await session.reviewUndo(authority(request({
   kind:'review_last_apply_for_undo',
  })));
  expect(undoReview).toMatchObject({
   kind:'fictional_author_undo_review',
   appliedGeneration:2,restoresGeneration:1,
   canAutoUndo:false,releaseApproved:false,
  });
  if(undoReview.kind!=='fictional_author_undo_review')
   throw Error('r53_fictional_undo_review_failed');
  const undone=await session.undo(authority(request({
   kind:'undo_reviewed_change',opaqueToken:undoReview.undoToken,
  })));
  expect(undone).toMatchObject({
   kind:'fictional_author_undo_saved',generation:3,
   durableClaimSpent:true,canAutoRetry:false,releaseApproved:false,
  });
  expect((await session.undo(authority(request({
   kind:'undo_reviewed_change',opaqueToken:undoReview.undoToken,
  })))).kind).toBe('refused');
  const restored=await reopenHeldDraftR35({
   subject:subject(),workId:W16,custody:custody(W16),generation:3,
  });
  expect(restored.sections).toEqual(initial.sections);
  expect(restored.action).toBe('restore');
  expect(await generations(W16)).toBe(3);
  expect((await query<{n:number}>(
   "SELECT count(*)::int AS n FROM writers_studio_r44_held_approval WHERE work_id=$1 AND state='spent'",
   [W16])).rows[0].n).toBe(1);
  expect((await query<{n:number}>(
   "SELECT count(*)::int AS n FROM writers_studio_r47_held_undo WHERE work_id=$1 AND state='spent'",
   [W16])).rows[0].n).toBe(1);
  for(const value of [reviewed.reviewToken,undoReview.undoToken,
   'first fictional','first enchanted'])
   expect(JSON.stringify(applied)+JSON.stringify(undone)).not.toContain(value);
 });

});
