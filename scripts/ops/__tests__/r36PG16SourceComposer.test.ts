/**
 * R36 PHYSICAL FICTIONAL TEST:
 * a single held composer orders intent -> R32 encrypted Source -> R34 readback
 * -> R35 observation, with deterministic fault injection and parallel calls.
 * No real member, KMS, production route or actual document.
 */
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {query,closePool} from '@/lib/db/postgres';
import {writeDurableVaultBytes} from '@/lib/storage/fileVault';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {canonicalClaimedArrivalPayload,type ClaimedArrivalReceiptV1,
 type SignedClaimedArrivalV1} from '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import {persistHeldPendingR33,commitHeldPendingClaimR33,
 type R33Manifest} from '@/lib/writersStudio/recovery/heldPendingClaimR33';
import {persistHeldOriginalR32,readHeldOriginalR32,
 type R32Source,type R32Authority} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {beginHeldOriginalWriteIntentR35}
 from '@/lib/writersStudio/recovery/heldOrphanIntentR35';
import {composeHeldOriginalR36,R36_REAL_SOURCE_COMPOSER_ENABLED}
 from '@/lib/writersStudio/recovery/heldSourceComposerR36';

const enabled=process.env.R36_PHYSICAL_PG16==='fictional-only' &&
 process.env.R36_SOURCE_COMPOSER_FIXTURE==='fictional-only' &&
 process.env.R35_INTENT_FIXTURE==='fictional-only' &&
 process.env.R34_CLAIM_RECONCILE_FIXTURE==='fictional-only' &&
 process.env.R33_PENDING_CLAIM_FIXTURE==='fictional-only' &&
 process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only' &&
 process.env.DATABASE_URL?.includes('127.0.0.1');
const run=enabled?describe:describe.skip;
const A='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const FOREIGN_WORK='4c0782ca-9074-43ee-9f3c-5f8500026781';
const W=[
 '4c0782ca-9074-43ee-9f3c-5f8500026780',
 '4c0782ca-9074-43ee-9f3c-5f8500026782',
 '4c0782ca-9074-43ee-9f3c-5f8500026783',
 '4c0782ca-9074-43ee-9f3c-5f8500026784',
 '4c0782ca-9074-43ee-9f3c-5f8500026785',
 '4c0782ca-9074-43ee-9f3c-5f8500026786',
];
const ARR=Array.from({length:6},()=>randomUUID());
const pendingKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const workKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const signer=generateKeyPairSync('ed25519');
const claimSigner=generateKeyPairSync('ed25519');
const member={memberId:A,assertedBy:'server_verified_member_session' as const};
const SOURCE='R36_SYNTHETIC_ORIGINAL_DOCUMENT_SOURCE';
const ORIGINAL=Buffer.from('R36_SYNTHETIC_DOCX_ORIGINAL_BYTES_NOT_REAL');
const source:R32Source={
 kind:'artifact',originalBytes:ORIGINAL,sourceText:SOURCE,
 originalFilename:'Imagined-Beehive.docx',
 mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 extractorId:'fictional-r36-parser',
};
const paste:R32Source={
 kind:'supplied_text',originalBytes:null,
 sourceText:'R36_SYNTHETIC_AUTHOR_PASTED_TEXT',
 originalFilename:null,mimeType:null,extractorId:null,
};
const sha=(s:Buffer)=>createHash('sha256').update(s).digest('hex');
function auth(key=workKey,revoked?:string):R32Authority{
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:48,revokedWorks:revoked?[revoked]:[],revokedKeyIds:[],
 };
 return {key,signedDeletion:{checkpoint:cp,signature:sign(null,
    canonicalDeletionPayload(cp),signer.privateKey).toString('base64')},
  trustedSigner:signer.publicKey,independent:{minimumGeneration:48}};
}
function signed(claim:R33Manifest,s:R32Source):SignedClaimedArrivalV1{
 const c:ClaimedArrivalReceiptV1={
  protocol:'soullab.ws.pending-claim-transfer.v1',
  status:'claim_committed',
  claimId:claim.claimId!,memberId:A,arrivalId:claim.arrivalId,
  manuscriptId:claim.claimedWorkId!,
  pendingGeneration:claim.pendingGeneration,
  manuscriptGeneration:claim.workGeneration!,claimEpoch:claim.claimEpoch!,
  sourceKind:s.kind==='artifact'?'artifact_extraction':'member_supplied_text',
  sourceTextDigest:sha(Buffer.from(s.sourceText,'utf8')),
  originalDigest:s.kind==='artifact'?sha(s.originalBytes):null,
 };
 return {claim:c,signature:sign(null,canonicalClaimedArrivalPayload(c),
    claimSigner.privateKey).toString('base64')};
}
function scope(claim:R33Manifest,s:R32Source){
 return {
  subject:member,arrivalId:claim.arrivalId,pendingGeneration:1,
  pendingAuthority:auth(pendingKey),workAuthority:auth(workKey),
  signedClaim:signed(claim,s),trustedClaimSigner:claimSigner.publicKey,
  minimumClaimEpoch:48,
 };
}
async function createClaim(i:number,s:R32Source=source){
 await persistHeldPendingR33({subject:member,arrivalId:ARR[i],
    generation:1,source:s,authority:auth(pendingKey)});
 await query('INSERT INTO member_manuscripts(id,member_id) VALUES($1,$2)',[W[i],A]);
 const claimed=await commitHeldPendingClaimR33({
   subject:member,arrivalId:ARR[i],pendingGeneration:1,
   workId:W[i],workGeneration:1,claimEpoch:48,authority:auth(pendingKey),
 });
 return scope(claimed,s);
}
type FixtureScope=Awaited<ReturnType<typeof createClaim>>;
let first:FixtureScope,second:FixtureScope,third:FixtureScope;
let fourth:FixtureScope,fifth:FixtureScope,sixth:FixtureScope;
function expectedIds(i:number){return [W[i],ARR[i]];}
async function count(table:'writers_studio_r35_held_intents'|
 'writers_studio_r35_held_observations'|'writers_studio_r32_held_originals'){
 const result=await query<{n:number}>(`SELECT count(*)::int AS n FROM ${table}`);
 return result.rows[0].n;
}
async function countWork(i:number){
 const r=await query<{n:number}>(`SELECT count(*)::int AS n
    FROM writers_studio_r32_held_originals
    WHERE manuscript_id=$1`,[W[i]]);
 return r.rows[0].n;
}
async function pendingState(i:number){
 const r=await query<{state:string;work_manifest_id:string|null}>(`SELECT state,
    work_manifest_id FROM writers_studio_r33_held_pending WHERE arrival_id=$1`,
    [ARR[i]]);
 return r.rows[0];
}
async function vaultFiles():Promise<number>{
 const r=await query<{work_ref:string;metadata_ref:string}>(
   'SELECT work_ref,metadata_ref FROM writers_studio_r32_held_originals');
 return r.rows.length*2;
}
run('R36 single held source intention → encrypted write → verified custody',()=>{
 afterAll(async()=>{
  const escrow=process.env.R36_FICTIONAL_ESCROW_PATH;
  if(enabled&&escrow&&sixth){
   writeFileSync(escrow,JSON.stringify({
     keyPendingId:pendingKey.keyId,
     keyPendingHex:pendingKey.keyBytes.toString('hex'),
     keyWorkId:workKey.keyId,keyWorkHex:workKey.keyBytes.toString('hex'),
     deletionVerifier:signer.publicKey.export({type:'spki',format:'pem'}),
     signedPending:sixth.pendingAuthority.signedDeletion,
     signedWork:sixth.workAuthority.signedDeletion,
     claimVerifier:claimSigner.publicKey.export({type:'spki',format:'pem'}),
     signedClaim:sixth.signedClaim,arrivalId:ARR[5],workId:W[5],memberId:A,
   }),{flag:'wx',mode:0o600});
  }
  await closePool();
 });
 it('all actual writer, route and key-retirement flags remain OFF',()=>{
   expect(R36_REAL_SOURCE_COMPOSER_ENABLED).toBe(false);
 });
 it('before first Work exists, an encrypted pending Source is signed/claimed',async()=>{
   first=await createClaim(0);
   expect(await countWork(0)).toBe(0);
   expect((await pendingState(0)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('an injected interruption after intent persists only metadata, no Work files',async()=>{
   await expect(composeHeldOriginalR36(first,{afterIntent:async()=>{
     expect(await count('writers_studio_r35_held_intents')).toBe(1);
     expect(await countWork(0)).toBe(0);
     throw Error('fictional_interruption_after_intent');
   }})).rejects.toThrow('fictional_interruption_after_intent');
   expect(await countWork(0)).toBe(0);
   expect(await count('writers_studio_r35_held_observations')).toBe(0);
 });
 it('resumes the same intent and publishes exactly ONE owned encrypted Work',async()=>{
   const result=await composeHeldOriginalR36(first);
   expect(result.kind).toBe('HELD_SOURCE_WRITTEN_AND_OBSERVED');
   expect(result.ciphertextCreatedByThisCall).toBe(true);
   expect(result.pendingRetirement).toBe('NOT_PERFORMED');
   expect(result.releaseApproved).toBe(false);
   expect(await countWork(0)).toBe(1);
   expect(await count('writers_studio_r35_held_observations')).toBe(1);
   const opened=await readHeldOriginalR32({subject:member,
     workId:W[0],arrivalId:ARR[0],generation:1,authority:auth()});
   expect(opened.source).toEqual(source);
 });
 it('retry after completion recognizes existing Work and does not publish again',async()=>{
   const before=await vaultFiles();
   const got=await composeHeldOriginalR36(first);
   expect(got.kind).toBe('HELD_EXISTING_SOURCE_RECONCILED');
   expect(got.ciphertextCreatedByThisCall).toBe(false);
   expect(await vaultFiles()).toBe(before);
   expect(await countWork(0)).toBe(1);
 });
 it('a synthetic crash AFTER R32 saved but BEFORE observation can recover',async()=>{
   second=await createClaim(1,paste);
   await expect(composeHeldOriginalR36(second,{
     afterWorkPersisted:async()=>{
       expect(await countWork(1)).toBe(1);
       throw Error('fictional_interruption_after_cipher_manifest');
     },
   })).rejects.toThrow('fictional_interruption_after_cipher_manifest');
   expect((await pendingState(1)).state).toBe('claim_committed_awaiting_rewrap');
   expect(await count('writers_studio_r35_held_observations')).toBe(1);
   const before=await vaultFiles();
   const resumed=await composeHeldOriginalR36(second);
   expect(resumed.kind).toBe('HELD_EXISTING_SOURCE_RECONCILED');
   expect(resumed.ciphertextCreatedByThisCall).toBe(false);
   expect(await vaultFiles()).toBe(before);
   expect(await countWork(1)).toBe(1);
   expect(await count('writers_studio_r35_held_observations')).toBe(2);
 });
 it('two concurrent calls for SAME pending claim serialize around intent row lock',async()=>{
   third=await createClaim(2);
   const results=await Promise.all([
     composeHeldOriginalR36(third),
     composeHeldOriginalR36(third),
   ]);
   expect(results.map(r=>r.ciphertextCreatedByThisCall).sort()).toEqual([false,true]);
   expect(await countWork(2)).toBe(1);
   expect(await count('writers_studio_r35_held_observations')).toBe(3);
   const rr=await query('SELECT * FROM writers_studio_r32_held_originals WHERE manuscript_id=$1',
       [W[2]]);
   expect(rr.rows).toHaveLength(1);
 });
 it('never infers owner from an unreferenced opaque vault object',async()=>{
   fourth=await createClaim(3);
   const orphan=await writeDurableVaultBytes('ws-beta-r32-held-source',
     randomUUID(),'enc',randomBytes(55));
   expect(orphan).toMatch(/\.enc$/);
   const result=await composeHeldOriginalR36(fourth);
   expect(result.kind).toBe('HELD_SOURCE_WRITTEN_AND_OBSERVED');
   expect(await countWork(3)).toBe(1);
   // The unrelated orphan is neither adopted nor deleted.
   const orphans=await query<{work_ref:string;metadata_ref:string}>(
    'SELECT work_ref,metadata_ref FROM writers_studio_r32_held_originals');
   expect(JSON.stringify(orphans.rows)).not.toContain(orphan);
 });
 it('cannot invent retroactive intent after an unrelated R32 Work was published',async()=>{
   fifth=await createClaim(4);
   await persistHeldOriginalR32({subject:member,
      workId:W[4],arrivalId:ARR[4],generation:1,
      source,authority:auth()});
   const old=await count('writers_studio_r35_held_intents');
   await expect(composeHeldOriginalR36(fifth))
      .rejects.toHaveProperty('code','r36_published_work_without_prior_intent');
   expect(await count('writers_studio_r35_held_intents')).toBe(old);
   expect((await pendingState(4)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('forged signing receipt and foreign author cannot create an intent/Work',async()=>{
   const bad={...first,signedClaim:{...first.signedClaim,
      claim:{...first.signedClaim.claim,claimId:randomUUID()}}};
   await expect(composeHeldOriginalR36(bad))
      .rejects.toHaveProperty('code','r36_published_work_without_prior_intent');
   const wrong={...first,subject:{...member,memberId:B}};
   await expect(composeHeldOriginalR36(wrong))
      .rejects.toHaveProperty('code','r33_pending_not_owned');
 });
 it('signed revoked Work key never completes an observation on existing ciphertext',async()=>{
   await expect(composeHeldOriginalR36({
     ...first,workAuthority:auth(workKey,W[0]),
   })).rejects.toHaveProperty('code','deleted_work_refused');
   expect(await countWork(0)).toBe(1);
 });
 it('leaves a FINAL encrypted Work unobserved and journals intact for fresh process',async()=>{
   sixth=await createClaim(5);
   await expect(composeHeldOriginalR36(sixth,{
     afterWorkStage:async()=>{throw Error('fictional_crash_after_work_stage');},
   })).rejects.toThrow('fictional_crash_after_work_stage');
   expect((await pendingState(5)).state).toBe('claim_committed_awaiting_rewrap');
   expect(await countWork(5)).toBe(1);
   expect(await count('writers_studio_r35_held_intents')).toBe(5);
   expect(await count('writers_studio_r35_held_observations')).toBe(4);
 });
 it('no fictional manuscript prose/provenance is stored in the SQL manifests',async()=>{
   const a=await query('SELECT * FROM writers_studio_r35_held_intents');
   const b=await query('SELECT * FROM writers_studio_r35_held_observations');
   const c=await query('SELECT * FROM writers_studio_r32_held_originals');
   const body=JSON.stringify([a.rows,b.rows,c.rows]);
   for(const secret of ['R36_SYNTHETIC_ORIGINAL_DOCUMENT_SOURCE',
     'R36_SYNTHETIC_DOCX_ORIGINAL_BYTES_NOT_REAL',
     'R36_SYNTHETIC_AUTHOR_PASTED_TEXT',
     'Imagined-Beehive.docx','fictional-r36-parser'])
       expect(body).not.toContain(secret);
 });
});
