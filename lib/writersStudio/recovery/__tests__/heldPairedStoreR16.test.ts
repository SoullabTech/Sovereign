/**
 * R16 is held source. These are exclusively invented people and invented
 * manuscript bytes; DB and vault are mocks, not a production integration.
 */
import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import { readVaultBytes, writeDurableVaultBytes } from '@/lib/storage/fileVault';
import { sealPendingArrival } from '../pendingArrivalEnvelopeV1';
import { canonicalClaimedArrivalPayload, type ClaimedArrivalReceiptV1 }
  from '../pendingClaimTransferV1';
import { canonicalOriginalProvenanceV2, type OriginalProvenanceV2 }
  from '../originalProvenanceV2';
import { preparePairedOriginalV2 } from '../pairedOriginalCustodyV2';
import { canonicalDeletionPayload, type DeletionHighwaterV1 }
  from '../deletionBarrierV1';
import {
  R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED,
  persistHeldPairedCandidateR16, readHeldPairedCiphertextsR16,
  type HeldStorageSubjectR16,
} from '../heldPairedStoreR16';

jest.mock('@/lib/db/postgres',()=>({
  query:jest.fn(),transaction:jest.fn(),
}));
jest.mock('@/lib/storage/fileVault',()=>({
  readVaultBytes:jest.fn(),writeDurableVaultBytes:jest.fn(),
}));

const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const ARRIVAL='306902ed-21a9-4c01-aa15-984755598218';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const TEXT=Buffer.from('FICTIONAL R16 encrypted words.\r\n');
const ORIGINAL=Buffer.from([0x50,0x4b,0x03,0x04,0,0xfe,4,9]);
const NAME='fictional-private.docx';
const CLAIM_PAIR=generateKeyPairSync('ed25519');
const PROV_PAIR=generateKeyPairSync('ed25519');
const DELETE_PAIR=generateKeyPairSync('ed25519');
const digest=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
const key=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const subject:HeldStorageSubjectR16={
 memberId:MEMBER,assertedBy:'server_verified_member_session',
};
function preparedFixture(){
 const pendingKey=key(),workKey=key();
 const pendingAuthority={memberId:MEMBER,arrivalId:ARRIVAL,generation:4};
 const pendingEnvelope=sealPendingArrival(pendingAuthority,{
   kind:'artifact_extraction',sourceText:TEXT,originalBytes:ORIGINAL,
   originalFilename:NAME,mimeType:'application/x-fictional-docx',
 },pendingKey);
 const claim:ClaimedArrivalReceiptV1={
   protocol:'soullab.ws.pending-claim-transfer.v1',
   status:'claim_committed',claimId:randomUUID(),memberId:MEMBER,
   arrivalId:ARRIVAL,manuscriptId:WORK,pendingGeneration:4,
   manuscriptGeneration:5,claimEpoch:12,sourceKind:'artifact_extraction',
   sourceTextDigest:digest(TEXT),originalDigest:digest(ORIGINAL),
 };
 const signedClaim={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
   CLAIM_PAIR.privateKey).toString('base64')};
 const prov:OriginalProvenanceV2={
   protocol:'soullab.ws.original-provenance.v2',
   claimId:claim.claimId,memberId:MEMBER,arrivalId:ARRIVAL,
   manuscriptId:WORK,receiptEpoch:13,sourceKind:'artifact_extraction',
   sourceTextSha256:digest(TEXT),sourceTextBytes:TEXT.length,
   originalSha256:digest(ORIGINAL),originalByteLength:ORIGINAL.length,
   originalFilename:NAME,mimeType:'application/x-fictional-docx',
   extractionMethod:'fictional-parser',extractorVersion:'test-v1',
 };
 const signedProvenance={provenance:prov,
   signature:sign(null,canonicalOriginalProvenanceV2(prov),
     PROV_PAIR.privateKey).toString('base64')};
 const checkpoint:DeletionHighwaterV1={
   protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
   generation:20,revokedWorks:[],revokedKeyIds:[],
 };
 const signedDelete={checkpoint,
   signature:sign(null,canonicalDeletionPayload(checkpoint),DELETE_PAIR.privateKey)
     .toString('base64')};
 const prepared=preparePairedOriginalV2({
   pendingAuthority,pendingEnvelope,pendingKey,workKey,signedClaim,
   trustedClaimSigner:CLAIM_PAIR.publicKey,independentClaimMinimumEpoch:12,
   signedProvenance,trustedProvenanceSigner:PROV_PAIR.publicKey,
   independentProvenanceMinimumEpoch:13,
 });
 return {subject,prepared,pendingKeyId:pendingKey.keyId,workKey,
   authorities:{
     signedClaim,claimSigner:CLAIM_PAIR.publicKey,minimumClaimEpoch:12,
     provenanceSigner:PROV_PAIR.publicKey,minimumProvenanceEpoch:13,
     deletionHighwater:signedDelete,deletionSigner:DELETE_PAIR.publicKey,
     independentDeletionGeneration:{minimumGeneration:20},
   }};
}
type Fixture=ReturnType<typeof preparedFixture>;
const dbMock=query as jest.Mock;
const txMock=transaction as jest.Mock;
const writeMock=writeDurableVaultBytes as jest.Mock;
const readMock=readVaultBytes as jest.Mock;
let files:Map<string,Buffer>;
let inserted:Record<string,any>|undefined;
let writes:unknown[][];
let joins:number;
let ownerApproved:boolean;
let lockedOwnerApproved:boolean;
let breakFileNumber:number;
let corruptRead:boolean;
let denyInsert:boolean;

beforeEach(()=>{
 jest.clearAllMocks();files=new Map();inserted=undefined;writes=[];joins=0;
 ownerApproved=true;lockedOwnerApproved=true;breakFileNumber=0;corruptRead=false;denyInsert=false;
 writeMock.mockImplementation(async(ns:string,id:string,ext:string,data:Buffer)=>{
  writes.push([ns,id,ext,Buffer.from(data)]);
  if(writes.length===breakFileNumber)throw Error('fictional second-storage-failure');
  const ref=ns+'/'+id+'.'+ext;
  files.set(ref,Buffer.from(data));return ref;
 });
 readMock.mockImplementation(async(ref:string)=>{
  const content=files.get(ref);
  if(!content)throw Error('fictional file missing');
  if(corruptRead)return Buffer.from('corrupt');
  return Buffer.from(content);
 });
 txMock.mockImplementation(async callback=>{
  return callback({query:async(sql:string,params:unknown[])=>{
   if(sql.includes('SELECT a.id AS arrival_id')){
    joins+=1;
    return {rows:lockedOwnerApproved?[{arrival_id:ARRIVAL}]:[]};
   }
   if(sql.includes('INSERT INTO writers_studio_r16_held_pairs')){
    if(denyInsert)throw Error('fictional db rollback');
    if(inserted)throw Error('fictional duplicate claim');
    inserted={
     claim_id:params[0],member_id:params[1],arrival_id:params[2],
     manuscript_id:params[3],pending_key_id:params[4],work_key_id:params[5],
     claim_epoch:params[6],work_generation:params[7],work_ref:params[8],
     provenance_ref:params[9],work_digest:params[10],
     provenance_digest:params[11],pair_digest:params[12],state:params[13]
    };
    return {rows:[inserted]};
   }
   throw Error('unexpected SQL query in test');
  }});
 });
 dbMock.mockImplementation(async(_sql:string,params:unknown[])=>{
  if(_sql.includes('SELECT a.id AS arrival_id')){
    return {rows:ownerApproved&&!inserted?[{arrival_id:ARRIVAL}]:[]};
  }
  if(inserted&&params[0]===inserted.claim_id&&params[1]===inserted.member_id)
    return {rows:[inserted]};
  return {rows:[]};
 });
});
const refusal=(run:()=>unknown,code:string)=>
 expect(run).rejects.toMatchObject({code});

describe('R16 actually wired PostgreSQL/fileVault adapter — controlled fictional inputs',()=>{
 it('remains unconnected to real member storage and accepts only encrypted paired bytes',async()=>{
   expect(R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED).toBe(false);
   const fixture=preparedFixture();
   const saved=await persistHeldPairedCandidateR16(fixture);
   expect(saved.memberId).toBe(MEMBER);
   expect(saved.state).toBe('held_encrypted_pair_only');
   expect(joins).toBe(1);
   expect(writes).toHaveLength(2);
   expect(txMock).toHaveBeenCalledTimes(1);
   for(const [,id,ext,bytes] of writes){
     expect(ext).toBe('enc');
     expect(String(id)).toMatch(/^[0-9a-f-]{36}$/);
     expect((bytes as Buffer).includes(TEXT)).toBe(false);
     expect((bytes as Buffer).includes(Buffer.from(NAME))).toBe(false);
   }
   expect(JSON.stringify(inserted)).not.toContain(NAME);
   expect(JSON.stringify(inserted)).not.toContain(TEXT.toString());
   const readback=await readHeldPairedCiphertextsR16(subject,saved.claimId);
   expect(readback.manifest).toEqual(saved);
   expect(readback.package.workDigest).toBe(fixture.prepared.package.workDigest);
   expect(readback.package.provenanceDigest).toBe(fixture.prepared.package.provenanceDigest);
 });
 it('rejects foreign or unverified member before vault or SQL operations',async()=>{
   const f=preparedFixture();
   await refusal(()=>persistHeldPairedCandidateR16({...f,
     subject:{memberId:FOREIGN,assertedBy:'server_verified_member_session'}}),
    'r16_owner_or_source_journal_refused');
   await refusal(()=>persistHeldPairedCandidateR16({...f,
     subject:{memberId:MEMBER,assertedBy:'client_header' as never}}),
    'r16_missing_server_session');
   expect(writes).toHaveLength(0);
   expect(txMock).not.toHaveBeenCalled();
 });
 it('cannot write without independently accepted current deletion witness',async()=>{
   const f=preparedFixture();
   await refusal(()=>persistHeldPairedCandidateR16({...f,authorities:{
     ...f.authorities,independentDeletionGeneration:null,
   }}),'untrusted_deletion_checkpoint');
   expect(writes).toHaveLength(0);
 });
 it('if second file write fails, no database custody row is declared',async()=>{
   breakFileNumber=2;
   const f=preparedFixture();
   await expect(persistHeldPairedCandidateR16(f))
     .rejects.toThrow('fictional second-storage-failure');
   expect(files.size).toBe(1);
   expect(txMock).not.toHaveBeenCalled();
 });
 it('if either durable readback fails, no database custody row is declared',async()=>{
   corruptRead=true;
   await refusal(()=>persistHeldPairedCandidateR16(preparedFixture()),
     'r16_vault_readback_refused');
   expect(inserted).toBeUndefined();
   expect(writes).toHaveLength(2);
 });
 it('known unowned/unclaimed source is refused before any encrypted file is published',async()=>{
   ownerApproved=false;
   await refusal(()=>persistHeldPairedCandidateR16(preparedFixture()),
     'r16_preflight_owner_or_duplicate_refused');
   expect(files.size).toBe(0);
   expect(writes).toHaveLength(0);
   expect(txMock).not.toHaveBeenCalled();
 });
 it('owner join refusal preserves separately encrypted orphans for reconciliation',async()=>{
   lockedOwnerApproved=false;
   await refusal(()=>persistHeldPairedCandidateR16(preparedFixture()),
     'r16_database_owner_join_refused');
   expect(files.size).toBe(2);
   expect(inserted).toBeUndefined();
 });
 it('SQL failure does not claim persistence, and never deletes immutable encrypted files',async()=>{
   denyInsert=true;
   await expect(persistHeldPairedCandidateR16(preparedFixture()))
     .rejects.toThrow('fictional db rollback');
   expect(files.size).toBe(2);
   expect(inserted).toBeUndefined();
 });
 it('a second claim refuses overwrite of first stored Work/provenance',async()=>{
   const fixture=preparedFixture();
   const first=await persistHeldPairedCandidateR16(fixture);
   await refusal(()=>persistHeldPairedCandidateR16(fixture),
     'r16_preflight_owner_or_duplicate_refused');
   expect(inserted?.claim_id).toBe(first.claimId);
   expect(files.size).toBe(2);
 });
 it('readback refuses foreign member and absent/corrupted ciphertext',async()=>{
   const saved=await persistHeldPairedCandidateR16(preparedFixture());
   await refusal(()=>readHeldPairedCiphertextsR16({
     memberId:FOREIGN,assertedBy:'server_verified_member_session'
   },saved.claimId),'r16_scoped_pair_not_found');
   corruptRead=true;
   await refusal(()=>readHeldPairedCiphertextsR16(subject,saved.claimId),
     'r16_persisted_pair_readback_refused');
 });
});
