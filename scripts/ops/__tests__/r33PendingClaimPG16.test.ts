/**
 * R33 PHYSICAL fictional PG16: pending sealed on arrival, claimed only by
 * owner, post-commit signed claim → R32 Work key rewrap + retirement HOLD.
 * THIS TEST IS NOT A LIVE ROUTE OR REAL KMS QUALIFICATION.
 */
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {query,closePool} from '@/lib/db/postgres';
import {
 canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
 canonicalClaimedArrivalPayload,type ClaimedArrivalReceiptV1,
 type SignedClaimedArrivalV1,
} from '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import {
 persistHeldPendingR33,readHeldPendingR33,
 commitHeldPendingClaimR33,promoteHeldClaimToWorkR33,
 R33_REAL_MEMBER_PENDING_CLAIM_ENABLED,type R33PendingTrust,
} from '@/lib/writersStudio/recovery/heldPendingClaimR33';
import {
 readHeldOriginalR32,R32_REAL_WRITER_SOURCE_IMPORT_ENABLED,
 type R32Source,type R32Authority,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';

const enabled=process.env.R33_PHYSICAL_PG16==='fictional-only' &&
 process.env.R33_PENDING_CLAIM_FIXTURE==='fictional-only' &&
 process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only' &&
 process.env.DATABASE_URL?.includes('127.0.0.1');
const run=enabled?describe:describe.skip;
const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const FOREIGN_WORK='4c0782ca-9074-43ee-9f3c-5f8500026781';
const WORK_2='4c0782ca-9074-43ee-9f3c-5f8500026782';
const ARRIVAL=randomUUID(),PASTED=randomUUID();
const pendingKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const workKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const fakeSigner=generateKeyPairSync('ed25519');
const fakeClaimSigner=generateKeyPairSync('ed25519');
const who={memberId:MEMBER,assertedBy:'server_verified_member_session' as const};
const fakeOriginal:R32Source={kind:'artifact',
 originalBytes:Buffer.from('R33_FAKE_DOCX_BYTES_no actual person or file'),
 sourceText:'R33_FICTIONAL_ORIGINAL_STORY The invented dawn',
 originalFilename:'Fictional-Dawn.docx',
 mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 extractorId:'mammoth-fixture',
};
const fakePaste:R32Source={kind:'supplied_text',
 originalBytes:null,sourceText:'R33_FICTIONAL_PASTE_confirmed voluntary text',
 originalFilename:null,mimeType:null,extractorId:null};
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
function auth(key=workKey,revokedWork?:string):R32Authority {
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:20,revokedWorks:revokedWork?[revokedWork]:[],revokedKeyIds:[],
 };
 return {key,
  signedDeletion:{checkpoint:cp,
    signature:sign(null,canonicalDeletionPayload(cp),
      fakeSigner.privateKey).toString('base64')},
  trustedSigner:fakeSigner.publicKey,independent:{minimumGeneration:20},
 };
}
function pAuth(revokedArrival?:string):R33PendingTrust{
 return auth(pendingKey,revokedArrival);
}
const readPending=(arrivalId=ARRIVAL,generation=1,memberId=MEMBER,authority=pAuth())=>
 readHeldPendingR33({subject:{...who,memberId},arrivalId,generation,authority});
let receipt:SignedClaimedArrivalV1;
let ownedManifestId:string|null=null;
let heldPendingRef:string|null=null;
async function claimArrivalForWork(arrivalId=ARRIVAL,workId=WORK,
  pendingGeneration=1,workGeneration=1,claimEpoch=20){
 return commitHeldPendingClaimR33({
  subject:who,arrivalId,pendingGeneration,workId,workGeneration,claimEpoch,
  authority:pAuth(),
 });
}
function signedReceipt(arrivalId:string,workId:string,source:R32Source,
 pendingGeneration:number,workGeneration:number,claimEpoch:number,
 claimId:string):SignedClaimedArrivalV1 {
 const c:ClaimedArrivalReceiptV1={
  protocol:'soullab.ws.pending-claim-transfer.v1',
  status:'claim_committed',claimId,memberId:MEMBER,
  arrivalId,manuscriptId:workId,pendingGeneration,manuscriptGeneration:workGeneration,
  claimEpoch,sourceKind:source.kind==='artifact'?'artifact_extraction':'member_supplied_text',
  sourceTextDigest:sha(Buffer.from(source.sourceText,'utf8')),
  originalDigest:source.kind==='artifact'?sha(source.originalBytes):null,
 };
 return {claim:c,signature:sign(null,canonicalClaimedArrivalPayload(c),
   fakeClaimSigner.privateKey).toString('base64')};
}
const promote=(signed:SignedClaimedArrivalV1,workAuthority=auth(),
 pendingAuthority=pAuth(),arrivalId=ARRIVAL)=>
 promoteHeldClaimToWorkR33({
  subject:who,arrivalId,pendingGeneration:1,
  pendingAuthority,workAuthority,signedClaim:signed,
  trustedClaimSigner:fakeClaimSigner.publicKey,minimumClaimEpoch:20,
 });

run('R33 actual PG16 encrypted pending → owner claim → signed rewrap (fictional)',()=>{
 afterAll(async()=>{await closePool();});
 it('leaves real writing/import flags off and starts with no Work',async()=>{
  expect(R33_REAL_MEMBER_PENDING_CLAIM_ENABLED).toBe(false);
  expect(R32_REAL_WRITER_SOURCE_IMPORT_ENABLED).toBe(false);
  const rows=await query('SELECT * FROM member_manuscripts');
  expect(rows.rows).toHaveLength(1); // foreign Work only; target does not exist yet
  expect(rows.rows[0].id).toBe(FOREIGN_WORK);
 });
 it('persists original as encrypted pending WITHOUT any existing manuscript',async()=>{
  const r=await persistHeldPendingR33({
   subject:who,arrivalId:ARRIVAL,generation:1,
   source:fakeOriginal,authority:pAuth(),
  });
  expect(r.state).toBe('pending');
  expect(r.claimedWorkId).toBeNull();
  expect(r.workManifestId).toBeNull();
  expect(JSON.stringify(r)).not.toContain('Fictional-Dawn.docx');
  heldPendingRef=r.envelopeRef;
  expect((await readPending()).source).toEqual(fakeOriginal);
 });
 it('another writer cannot read or claim original before Work exists',async()=>{
  await expect(readPending(ARRIVAL,1,FOREIGN))
    .rejects.toHaveProperty('code','r33_pending_not_owned');
  await expect(commitHeldPendingClaimR33({
    subject:{...who,memberId:FOREIGN},arrivalId:ARRIVAL,pendingGeneration:1,
    workId:FOREIGN_WORK,workGeneration:1,claimEpoch:20,authority:pAuth(),
  })).rejects.toHaveProperty('code','r33_pending_not_owned');
 });
 it('refuses claiming a foreign manuscript, leaves pending arrival unclaimed',async()=>{
  await expect(claimArrivalForWork(ARRIVAL,FOREIGN_WORK))
    .rejects.toHaveProperty('code','r33_claim_work_not_owned');
  expect((await readPending()).manifest.state).toBe('pending');
 });
 it('detects ciphertext tampering before claim and restores only test fixture bytes',async()=>{
  const full=join(process.env.FILE_STORAGE_PATH!,heldPendingRef!);
  const original=readFileSync(full),corrupted=Buffer.from(original);
  corrupted[15]^=0x7;
  writeFileSync(full,corrupted);
  try{
   await expect(readPending()).rejects.toHaveProperty(
      'code','r33_pending_cipher_tampered');
  }finally{writeFileSync(full,original);}
 });
 it('an actual same-member Work can be created only after pending Source exists',async()=>{
  await query('INSERT INTO member_manuscripts (id,member_id) VALUES($1,$2)',
    [WORK,MEMBER]);
  const r=await claimArrivalForWork();
  expect(r.state).toBe('claim_committed_awaiting_rewrap');
  expect(r.claimedWorkId).toBe(WORK);
  expect(r.workGeneration).toBe(1);
  expect(r.workManifestId).toBeNull();
  expect(r.claimId).toMatch(/^[a-f0-9-]{36}$/);
  expect((await readPending()).source).toEqual(fakeOriginal);
  receipt=signedReceipt(ARRIVAL,WORK,fakeOriginal,1,1,20,r.claimId!);
 });
 it('repeat claim refuses and SQL cannot silently mark pending Source retired',async()=>{
  await expect(claimArrivalForWork()).rejects
    .toHaveProperty('code','r33_pending_already_claimed');
  await expect(query(`UPDATE writers_studio_r33_held_pending SET
     state='rewrap_verified_awaiting_retirement',
     work_manifest_id=$2 WHERE arrival_id=$1`,
     [ARRIVAL,randomUUID()])).rejects.toBeTruthy();
  await expect(query('DELETE FROM writers_studio_r33_held_pending WHERE arrival_id=$1',
    [ARRIVAL])).rejects.toBeTruthy();
  await expect(query('UPDATE writers_studio_r33_held_pending SET claim_id=$2 WHERE arrival_id=$1',
    [ARRIVAL,randomUUID()])).rejects.toBeTruthy();
 });
 it('wrong signed claim or wrong pending/Work key refuses without completing rewrap',async()=>{
  const forged={...receipt,claim:{...receipt.claim,originalDigest:'0'.repeat(64)}};
  await expect(promote({...receipt,claim:{...receipt.claim,claimId:randomUUID()}}))
    .rejects.toHaveProperty('code','r33_claim_not_identical_to_committed_source');
  await expect(promote(forged)).rejects
    .toHaveProperty('code','r33_claim_not_identical_to_committed_source');
  await expect(promote(receipt,auth(pendingKey))).rejects
    .toHaveProperty('code','r33_pending_and_work_keys_not_distinct');
  expect((await readPending()).manifest.state).toBe('claim_committed_awaiting_rewrap');
 });
 it('R12 signed post-commit claim enables R32 encrypted Work rewrap',async()=>{
  const promoted=await promote(receipt);
  ownedManifestId=promoted.work.id;
  expect(promoted.pending.state).toBe('rewrap_verified_awaiting_retirement');
  expect(promoted.pending.workManifestId).toBe(ownedManifestId);
  expect(promoted.work.memberId).toBe(MEMBER);
  const opened=await readHeldOriginalR32({
   subject:who,workId:WORK,arrivalId:ARRIVAL,generation:1,authority:auth(),
  });
  expect(opened.source).toEqual(fakeOriginal);
  expect(promoted.pending.envelopeRef).toBe(heldPendingRef);
  // Pending key + ciphertext MUST remain until independently witnessed
  // retirement/erasure. This stage never pretends they were deleted.
  expect((await readPending()).source).toEqual(fakeOriginal);
 });
 it('promoted Work cannot be opened with former pending key or by foreign member',async()=>{
  await expect(readHeldOriginalR32({
    subject:who,workId:WORK,arrivalId:ARRIVAL,generation:1,
    authority:auth(pendingKey),
  })).rejects.toHaveProperty('code','r32_wrong_work_key');
  await expect(readHeldOriginalR32({
    subject:{...who,memberId:FOREIGN},workId:WORK,arrivalId:ARRIVAL,
    generation:1,authority:auth(),
  })).rejects.toHaveProperty('code','r32_arrival_not_visible_to_writer');
  await expect(promote(receipt)).rejects.toBeTruthy(); // immutable duplicate
 });
 it('paste-only pending Source → separately owned manuscript without invented file',async()=>{
  await persistHeldPendingR33({subject:who,arrivalId:PASTED,generation:1,
   source:fakePaste,authority:pAuth()});
  await query('INSERT INTO member_manuscripts (id,member_id) VALUES($1,$2)',
    [WORK_2,MEMBER]);
  const claimed=await claimArrivalForWork(PASTED,WORK_2);
  expect(claimed.state).toBe('claim_committed_awaiting_rewrap');
  const signed=signedReceipt(PASTED,WORK_2,fakePaste,1,1,20,claimed.claimId!);
  const promoted=await promote(signed,auth(),pAuth(),PASTED);
  expect(promoted.pending.state).toBe('rewrap_verified_awaiting_retirement');
  const got=await readHeldOriginalR32({subject:who,workId:WORK_2,
    arrivalId:PASTED,generation:1,authority:auth()});
  expect(got.source).toEqual(fakePaste);
 });
 it('SQL pending and Work manifests remain ciphertext pointer/owner only',async()=>{
  const sqlPending=await query('SELECT * FROM writers_studio_r33_held_pending');
  const sqlWork=await query('SELECT * FROM writers_studio_r32_held_originals');
  expect(sqlPending.rows).toHaveLength(2);
  expect(sqlWork.rows).toHaveLength(2);
  const all=JSON.stringify([sqlPending.rows,sqlWork.rows]);
  for(const secret of ['R33_FICTIONAL_ORIGINAL_STORY','R33_FAKE_DOCX_BYTES',
    'R33_FICTIONAL_PASTE','Fictional-Dawn.docx','mammoth-fixture'])
    expect(all).not.toContain(secret);
 });
});
