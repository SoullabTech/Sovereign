/**
 * R35 physical: metadata-only durable intent PRECEDES existing encrypted
 * R32 Work, then exact signed claim + R34 readback → immutable observation.
 * No real writer/provider; source and keys are fictional.
 */
import { createHash,generateKeyPairSync,randomBytes,randomUUID,sign } from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import {writeDurableVaultBytes} from '@/lib/storage/fileVault';
import {
  canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
 canonicalClaimedArrivalPayload,
 type ClaimedArrivalReceiptV1,type SignedClaimedArrivalV1,
} from '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import {
 persistHeldPendingR33,commitHeldPendingClaimR33,readHeldPendingR33,
 type R33Manifest,
} from '@/lib/writersStudio/recovery/heldPendingClaimR33';
import {
 persistHeldOriginalR32,readHeldOriginalR32,type R32Source,type R32Authority,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {
 R35_REAL_ORPHAN_REGISTRY_ENABLED,R35_REAL_PENDING_KEY_RETIREMENT_ENABLED,
 beginHeldOriginalWriteIntentR35,observeHeldExistingOriginalR35,
 assessPendingKeyRetirementR35,type R35Intent,
} from '@/lib/writersStudio/recovery/heldOrphanIntentR35';
const enabled=process.env.R35_PHYSICAL_PG16==='fictional-only' &&
 process.env.R35_INTENT_FIXTURE==='fictional-only' &&
 process.env.R34_CLAIM_RECONCILE_FIXTURE==='fictional-only' &&
 process.env.R33_PENDING_CLAIM_FIXTURE==='fictional-only' &&
 process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only' &&
 process.env.DATABASE_URL?.includes('127.0.0.1');
const run=enabled?describe:describe.skip;
const A='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const WA='4c0782ca-9074-43ee-9f3c-5f8500026780';
const WB='4c0782ca-9074-43ee-9f3c-5f8500026782';
const WC='4c0782ca-9074-43ee-9f3c-5f8500026783';
const FOREIGN='4c0782ca-9074-43ee-9f3c-5f8500026781';
const IA=randomUUID(),IB=randomUUID(),IC=randomUUID();
const kp={keyId:randomUUID(),keyBytes:randomBytes(32)};
const kw={keyId:randomUUID(),keyBytes:randomBytes(32)};
const del=generateKeyPairSync('ed25519');
const signer=generateKeyPairSync('ed25519');
const owner={memberId:A,assertedBy:'server_verified_member_session' as const};
const source:R32Source={kind:'artifact',originalBytes:Buffer.from('R35_FAKE_ORIGINAL_BYTE_BUFFER'),
 sourceText:'R35_FICTIONAL_EXTRACTED_SOURCE_W1 not real writing',
 originalFilename:'Fictional-Acorn.docx',
 mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 extractorId:'mammoth-fictional-r35'};
const mismatch:R32Source={...source,
 sourceText:'R35_FICTIONAL_WRONG_SOURCE not the claimed Source'};
const coldSource:R32Source={...source,
 sourceText:'R35_COLD_FICTIONAL_EXTRACTED_SOURCE_3',
 originalFilename:'Fictional-Restart.docx'};
const digest=(v:Buffer)=>createHash('sha256').update(v).digest('hex');
function auth(key=kw,revoked?:string):R32Authority{
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:40,revokedWorks:revoked?[revoked]:[],revokedKeyIds:[],
 };
 return {key,signedDeletion:{checkpoint:cp,signature:sign(null,
   canonicalDeletionPayload(cp),del.privateKey).toString('base64')},
  trustedSigner:del.publicKey,independent:{minimumGeneration:40}};
}
function signature(m:R33Manifest,s:R32Source):SignedClaimedArrivalV1{
 if(!m.claimId||!m.claimedWorkId||!m.claimEpoch||!m.workGeneration)
  throw Error('r35_fixture_missing_claim');
 const c:ClaimedArrivalReceiptV1={
  protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
  claimId:m.claimId,memberId:m.memberId,arrivalId:m.arrivalId,
  manuscriptId:m.claimedWorkId,pendingGeneration:m.pendingGeneration,
  manuscriptGeneration:m.workGeneration,claimEpoch:m.claimEpoch,
  sourceKind:s.kind==='artifact'?'artifact_extraction':'member_supplied_text',
  sourceTextDigest:digest(Buffer.from(s.sourceText,'utf8')),
  originalDigest:s.kind==='artifact'?digest(s.originalBytes):null,
 };
 return {claim:c,signature:sign(null,canonicalClaimedArrivalPayload(c),
    signer.privateKey).toString('base64')};
}
type ClaimEvidence=ReturnType<typeof evidence>;
function evidence(m:R33Manifest,s:R32Source){
 return {subject:owner,arrivalId:m.arrivalId,pendingGeneration:1,
  pendingAuthority:auth(kp),workAuthority:auth(kw),
  signedClaim:signature(m,s),trustedClaimSigner:signer.publicKey,
  minimumClaimEpoch:40};
}
async function createClaim(arrival:string,work:string,s:R32Source){
 await persistHeldPendingR33({
   subject:owner,arrivalId:arrival,generation:1,
   source:s,authority:auth(kp),
 });
 await query('INSERT INTO member_manuscripts (id,member_id) VALUES($1,$2)',[work,A]);
 return commitHeldPendingClaimR33({
   subject:owner,arrivalId:arrival,pendingGeneration:1,
   workId:work,workGeneration:1,claimEpoch:40,authority:auth(kp),
 });
}
async function count(table:string){
 if(!/^writers_studio_r3[235]_held_(?:intents|observations|pending|originals)$/.test(table))
  throw Error('r35_fixture_forbidden_table');
 const q=await query<{n:number}>(`SELECT count(*)::int AS n FROM ${table}`);
 return q.rows[0].n;
}
async function anchored(arrival:string):Promise<{state:string;work_manifest_id:string|null}>{
 const r=await query<{state:string;work_manifest_id:string|null}>(`SELECT state,work_manifest_id
  FROM writers_studio_r33_held_pending WHERE arrival_id=$1`,[arrival]);
 return r.rows[0];
}
let first:R33Manifest,firstInput:ClaimEvidence,firstIntent:R35Intent;
let third:R33Manifest,thirdInput:ClaimEvidence,thirdIntent:R35Intent;
run('R35 actual PG16 prewrite intention/verified encrypted Work observation',()=>{
 afterAll(async()=>{
  const dst=process.env.R35_FICTIONAL_ESCROW_PATH;
  if(enabled && dst && thirdInput){
   // This test file contains ONLY entirely synthetic AES keys, pinned public
   // signing roots and already signed attestations. Same Mac, not real KMS.
   writeFileSync(dst,JSON.stringify({
    ownerA:A,arrivalId:IC,workId:WC,intentId:thirdIntent.intentId,
    pendingKeyId:kp.keyId,pendingKeyHex:kp.keyBytes.toString('hex'),
    workKeyId:kw.keyId,workKeyHex:kw.keyBytes.toString('hex'),
    signedPending:thirdInput.pendingAuthority.signedDeletion,
    signedWork:thirdInput.workAuthority.signedDeletion,
    deletionVerifierSpki:del.publicKey.export({type:'spki',format:'pem'}),
    claimVerifierSpki:signer.publicKey.export({type:'spki',format:'pem'}),
    signedClaim:thirdInput.signedClaim,
   }),{flag:'wx',mode:0o600});
  }
  await closePool();
 });
 it('all real writer/orphan/key retirement switches stay disabled',()=>{
  expect(R35_REAL_ORPHAN_REGISTRY_ENABLED).toBe(false);
  expect(R35_REAL_PENDING_KEY_RETIREMENT_ENABLED).toBe(false);
 });
 it('creates an encrypted pending Source and commits the exact claim',async()=>{
  first=await createClaim(IA,WA,source);
  firstInput=evidence(first,source);
  expect(first.state).toBe('claim_committed_awaiting_rewrap');
  expect(await count('writers_studio_r32_held_originals')).toBe(0);
 });
 it('registers a scoped keyed-HMAC intention BEFORE any R32 Work file exists',async()=>{
  const before=await count('writers_studio_r32_held_originals');
  const created=await beginHeldOriginalWriteIntentR35(firstInput);
  expect(created.kind).toBe('HELD_INTENT_RECORDED');
  firstIntent=created.intent;
  expect(created.releaseApproved).toBe(false);
  expect(created.sourceContentNotStoredInSql).toBe(true);
  expect(firstIntent.sourceBindingHmac).toMatch(/^[a-f0-9]{64}$/);
  expect(await count('writers_studio_r32_held_originals')).toBe(before);
  expect(await count('writers_studio_r35_held_intents')).toBe(1);
 });
 it('the same writer/claim cannot mint another intention or change the signed source',async()=>{
  const again=await beginHeldOriginalWriteIntentR35(firstInput);
  expect(again.kind).toBe('HELD_INTENT_REUSED');
  expect(again.intent.intentId).toBe(firstIntent.intentId);
  const fakeClaim={...firstInput.signedClaim,
     claim:{...firstInput.signedClaim.claim,claimId:randomUUID()}};
  await expect(beginHeldOriginalWriteIntentR35({
     ...firstInput,signedClaim:fakeClaim,
  })).rejects.toHaveProperty('code','r33_claim_not_identical_to_committed_source');
  const foreign={...firstInput,subject:{...owner,memberId:B}};
  await expect(beginHeldOriginalWriteIntentR35(foreign))
    .rejects.toHaveProperty('code','r33_pending_not_owned');
  expect(await count('writers_studio_r35_held_intents')).toBe(1);
 });
 it('no signed intent means no state mutation, even if a caller supplies a UUID',async()=>{
  await expect(observeHeldExistingOriginalR35({
     ...firstInput,intentId:randomUUID(),
  })).rejects.toHaveProperty('code','r35_unregistered_or_foreign_intent');
  expect((await anchored(IA)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('no manifest, or only unregistered encrypted orphan bytes: HOLD, never delete',async()=>{
  const before=await observeHeldExistingOriginalR35({
    ...firstInput,intentId:firstIntent.intentId,
  });
  expect(before.kind).toBe('HELD_WORK_MANIFEST_ABSENT');
  expect(await count('writers_studio_r35_held_observations')).toBe(0);
  const orphan=await writeDurableVaultBytes('ws-beta-r32-held-source',
    randomUUID(),'enc',randomBytes(64));
  const still=await observeHeldExistingOriginalR35({
    ...firstInput,intentId:firstIntent.intentId,
  });
  expect(still.kind).toBe('HELD_WORK_MANIFEST_ABSENT');
  expect(await count('writers_studio_r32_held_originals')).toBe(0);
  expect((await anchored(IA)).state).toBe('claim_committed_awaiting_rewrap');
  expect(orphan).toMatch(/\.enc$/);
 });
 it('R32 publishes the byte-exact Work after the already committed intent',async()=>{
  const pair=await persistHeldOriginalR32({
    subject:owner,workId:WA,arrivalId:IA,
    generation:1,source,authority:auth(),
  });
  expect(pair.pairSHA256).toMatch(/^[a-f0-9]{64}$/);
  expect((await anchored(IA)).work_manifest_id).toBeNull();
  expect(await count('writers_studio_r35_held_observations')).toBe(0);
 });
 it('two simultaneous observers converge on one exact Work receipt',async()=>{
  const values=await Promise.all([
   observeHeldExistingOriginalR35({...firstInput,intentId:firstIntent.intentId}),
   observeHeldExistingOriginalR35({...firstInput,intentId:firstIntent.intentId}),
  ]);
  expect(values.map(x=>x.kind).sort()).toEqual([
   'HELD_OBSERVATION_RECORDED','HELD_OBSERVATION_REUSED',
  ].sort());
  expect(await count('writers_studio_r35_held_observations')).toBe(1);
  expect((await anchored(IA)).state).toBe('rewrap_verified_awaiting_retirement');
  for(const v of values){
    expect(v.retirement).toBe('NOT_PERFORMED');
    expect(v.releaseApproved).toBe(false);
  }
 });
 it('observation read-after-retry is idempotent and can never retire a key',async()=>{
  const same=await observeHeldExistingOriginalR35({
    ...firstInput,intentId:firstIntent.intentId,
  });
  expect(same.kind).toBe('HELD_OBSERVATION_REUSED');
  const verdict=assessPendingKeyRetirementR35(firstIntent);
  expect(verdict).toEqual({
    status:'RETIREMENT_HOLD_EXTERNAL_WITNESS_REQUIRED',
    workId:WA,claimId:first.claimId,keyRetired:false,
    ciphertextErased:false,releaseApproved:false,
  });
 });
 it('SQL refuses modifying or deleting intent and observation evidence',async()=>{
  for(const table of [
    'writers_studio_r35_held_intents',
    'writers_studio_r35_held_observations',
  ]){
    await expect(query(`DELETE FROM ${table}`)).rejects.toBeTruthy();
  }
  await expect(query(`UPDATE writers_studio_r35_held_intents
    SET member_id=$1 WHERE intent_id=$2`,[B,firstIntent.intentId]))
    .rejects.toBeTruthy();
  await expect(query(`UPDATE writers_studio_r35_held_observations
    SET work_sha256=$1`,['f'.repeat(64)])).rejects.toBeTruthy();
 });
 it('even structurally plausible rogue observation cannot bypass PG owner/manifest guard',async()=>{
  await expect(query(`INSERT INTO writers_studio_r35_held_observations
   (observation_id,intent_id,member_id,manuscript_id,arrival_id,
    claim_id,work_manifest_id,work_sha256,metadata_sha256,pair_sha256)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[
    randomUUID(),firstIntent.intentId,A,WA,IA,first.claimId,
    randomUUID(),'a'.repeat(64),'b'.repeat(64),'c'.repeat(64),
  ])).rejects.toBeTruthy();
 });
 it('recording a second signed claim can never legitimize a different encrypted Source',async()=>{
  const second=await createClaim(IB,WB,source);
  const secondInput=evidence(second,source);
  const registered=await beginHeldOriginalWriteIntentR35(secondInput);
  expect(registered.kind).toBe('HELD_INTENT_RECORDED');
  await persistHeldOriginalR32({
    subject:owner,workId:WB,arrivalId:IB,generation:1,
    source:mismatch,authority:auth(),
  });
  await expect(observeHeldExistingOriginalR35({
    ...secondInput,intentId:registered.intent.intentId,
  })).rejects.toHaveProperty('code','r34_saved_work_source_differs_from_signed_pending');
  expect((await anchored(IB)).state).toBe('claim_committed_awaiting_rewrap');
  expect(await count('writers_studio_r35_held_observations')).toBe(1);
 });
 it('a missing/changed pending or Work key refuses with no new receipt',async()=>{
  const bad={...firstInput,pendingAuthority:auth({
    keyId:kp.keyId,keyBytes:randomBytes(32),
  })};
  await expect(observeHeldExistingOriginalR35({
    ...bad,intentId:firstIntent.intentId,
  })).rejects.toBeTruthy();
  const revoked={...firstInput,workAuthority:auth(kw,WA)};
  await expect(observeHeldExistingOriginalR35({
    ...revoked,intentId:firstIntent.intentId,
  })).rejects.toHaveProperty('code','deleted_work_refused');
  expect(await count('writers_studio_r35_held_observations')).toBe(1);
 });
 it('the isolated SQL metadata has no original text/filename/extractor values',async()=>{
  const a=await query('SELECT * FROM writers_studio_r35_held_intents');
  const b=await query('SELECT * FROM writers_studio_r35_held_observations');
  expect(a.rows).toHaveLength(2);
  expect(b.rows).toHaveLength(1);
  const combined=JSON.stringify([a.rows,b.rows]);
  for(const word of ['R35_FAKE_ORIGINAL_BYTE_BUFFER',
      'R35_FICTIONAL_EXTRACTED_SOURCE_W1','Fictional-Acorn.docx',
      'mammoth-fictional-r35','R35_FICTIONAL_WRONG_SOURCE'])
    expect(combined).not.toContain(word);
 });
 it('leaves a THIRD valid Work with an unobserved intent for fresh-process recovery',async()=>{
  third=await createClaim(IC,WC,coldSource);
  thirdInput=evidence(third,coldSource);
  const registered=await beginHeldOriginalWriteIntentR35(thirdInput);
  thirdIntent=registered.intent;
  const saved=await persistHeldOriginalR32({
    subject:owner,workId:WC,arrivalId:IC,generation:1,
    source:coldSource,authority:auth(),
  });
  expect(saved.workId).toBe(WC);
  expect((await anchored(IC)).state).toBe('claim_committed_awaiting_rewrap');
  expect(await count('writers_studio_r35_held_observations')).toBe(1);
 });
});
