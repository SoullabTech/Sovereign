import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {sealPendingArrival,type PendingSourceV1} from '../pendingArrivalEnvelopeV1';
import {canonicalClaimedArrivalPayload,type ClaimedArrivalReceiptV1}
  from '../pendingClaimTransferV1';
import {canonicalOriginalProvenanceV2,type OriginalProvenanceV2}
  from '../originalProvenanceV2';
import {preparePairedOriginalV2} from '../pairedOriginalCustodyV2';
import {canonicalDeletionPayload,type DeletionHighwaterV1} from '../deletionBarrierV1';
import {
 R15_REAL_MEMBER_TRANSFER_ENABLED,beginHeldPairedTransferV2,
 advanceHeldPairedTransferV2,canonicalPairedTransferProofV2,
 nextPairedOperationV2,heldPairedTransferStatementV2,
 type PairedTransferJournalV2,type PairedTransferActionV2,
 type PairedTransferWitnessesV2,type PairedTransferProofV2,
} from '../pairedTransferJournalV2';
import {advanceHeldTransfer,type PendingToWorkTransferJournalV1} from '../transferJournalV1';

const member='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const foreign='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const arrival='306902ed-21a9-4c01-aa15-984755598218';
const manuscript='4c0782ca-9074-43ee-9f3c-5f8500026780';
const otherWork='4c0782ca-9074-43ee-9f3c-5f8500026781';
const bytes=Buffer.from([0x50,0x4b,0x03,0x04,0,0xaa,0xfe,7,0x01]);
const exactText=Buffer.from('Fictional orchard with trailing space \r\n','utf8');
const filename='Fictional Draft ✦.docx';
const sha=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
const makeKey=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const claimSigner=generateKeyPairSync('ed25519');
const originalSigner=generateKeyPairSync('ed25519');
const erasureSigner=generateKeyPairSync('ed25519');
const storageSigner=generateKeyPairSync('ed25519');
const independentKeySigner=generateKeyPairSync('ed25519');
const checkpointSigner=generateKeyPairSync('ed25519');
const intruder=generateKeyPairSync('ed25519');
const witnesses:PairedTransferWitnessesV2={
 storageSigner:storageSigner.publicKey,
 independentKeySigner:independentKeySigner.publicKey,
 independentRecoverySigner:checkpointSigner.publicKey,
 externalMinimumEpoch:12,
};
const actions:PairedTransferActionV2[]=[
 'paired_ciphertexts_durable_readback',
 'retirement_obligation_committed',
 'independent_pending_key_revocation_witnessed',
 'pending_vault_erasure_witnessed',
 'independent_recovery_checkpoint_witnessed',
];
const deny=(fn:()=>unknown,code:string)=>
 expect(fn).toThrow(expect.objectContaining({code}));
function fixture(){
 const pendingKey=makeKey(),workKey=makeKey();
 const origin:PendingSourceV1={kind:'artifact_extraction',sourceText:exactText,
  originalBytes:bytes,originalFilename:filename,mimeType:'application/test-docx'};
 const pendingAuthority={memberId:member,arrivalId:arrival,generation:4};
 const pendingEnvelope=sealPendingArrival(pendingAuthority,origin,pendingKey);
 const claim:ClaimedArrivalReceiptV1={
   protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
   claimId:randomUUID(),memberId:member,arrivalId:arrival,manuscriptId:manuscript,
   pendingGeneration:4,manuscriptGeneration:5,claimEpoch:12,
   sourceKind:'artifact_extraction',sourceTextDigest:sha(exactText),
   originalDigest:sha(bytes),
 };
 const signedClaim={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
  claimSigner.privateKey).toString('base64')};
 const provenance:OriginalProvenanceV2={
  protocol:'soullab.ws.original-provenance.v2',
  claimId:claim.claimId,memberId:member,arrivalId:arrival,manuscriptId:manuscript,
  receiptEpoch:13,sourceKind:'artifact_extraction',
  sourceTextSha256:sha(exactText),sourceTextBytes:exactText.length,
  originalSha256:sha(bytes),originalByteLength:bytes.length,
  originalFilename:filename,mimeType:origin.mimeType,
  extractionMethod:'fictional-mammoth-extract',extractorVersion:'test-1.0',
 };
 const signedProvenance={provenance,signature:sign(null,canonicalOriginalProvenanceV2(provenance),
   originalSigner.privateKey).toString('base64')};
 const checkpoint:DeletionHighwaterV1={
   protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
   generation:20,revokedWorks:[],revokedKeyIds:[],
 };
 const signedDeletion=(p=checkpoint)=>({
   checkpoint:p,signature:sign(null,canonicalDeletionPayload(p),
     erasureSigner.privateKey).toString('base64'),
 });
 const prepared=preparePairedOriginalV2({
  pendingAuthority,pendingEnvelope,pendingKey,workKey,signedClaim,
  trustedClaimSigner:claimSigner.publicKey,
  independentClaimMinimumEpoch:12,
  signedProvenance,trustedProvenanceSigner:originalSigner.publicKey,
  independentProvenanceMinimumEpoch:13,
 });
 const authorities={
   signedClaim,claimSigner:claimSigner.publicKey,
   minimumClaimEpoch:12,provenanceSigner:originalSigner.publicKey,
   minimumProvenanceEpoch:13,deletionHighwater:signedDeletion(),
   deletionSigner:erasureSigner.publicKey,
   independentDeletionGeneration:{minimumGeneration:20},
 };
 const begin=(changes:Record<string,unknown>={})=>beginHeldPairedTransferV2({
  prepared,pendingKeyId:pendingKey.keyId,workKey,authorities,
  ...changes,
 });
 return {prepared,pendingKey,workKey,claim,provenance,authorities,
  signedDeletion,begin};
}
function proof(j:PairedTransferJournalV2,
  action:PairedTransferActionV2=nextPairedOperationV2(j)!,
  overrides:Partial<PairedTransferProofV2>={},
  signerOverride?:typeof storageSigner.privateKey){
 const p:PairedTransferProofV2={
  protocol:'soullab.ws.paired-transfer-proof.v2',action,
  claimId:j.claimId,memberId:j.memberId,arrivalId:j.arrivalId,
  manuscriptId:j.manuscriptId,pendingKeyId:j.pendingKeyId,
  workKeyId:j.workKeyId,claimEpoch:j.claimEpoch,
  workDigest:j.workDigest,provenanceDigest:j.provenanceDigest,pairDigest:j.pairDigest,
  journalRevision:j.revision,witnessEpoch:12,
  evidenceSha256:action==='paired_ciphertexts_durable_readback'
    ?j.pairDigest:sha('fictional_synthetic_receipt_'+action),
  ...overrides,
 };
 const signer=signerOverride||(action==='independent_pending_key_revocation_witnessed'
   ?independentKeySigner.privateKey
   :action==='independent_recovery_checkpoint_witnessed'
     ?checkpointSigner.privateKey:storageSigner.privateKey);
 return {proof:p,signature:sign(null,canonicalPairedTransferProofV2(p),signer)
  .toString('base64')};
}

describe('R15 two-file original custody journal: not a live deletion authority',()=>{
 it('starts only from a verified signed pair and binds BOTH ciphertext hashes',()=>{
   const x=fixture(),j=x.begin();
   expect(R15_REAL_MEMBER_TRANSFER_ENABLED).toBe(false);
   expect(j.protocol).toBe('soullab.ws.paired-transfer-journal.v2');
   expect(j.phase).toBe('claim_committed');
   expect(j.revision).toBe(0);
   expect(j.workDigest).toBe(x.prepared.package.workDigest);
   expect(j.provenanceDigest).toBe(x.prepared.package.provenanceDigest);
   expect(j.pairDigest).toBe(x.prepared.package.pairDigest);
   expect(JSON.stringify(j)).not.toContain(filename);
   expect(JSON.stringify(j)).not.toContain(exactText.toString('utf8'));
   expect(heldPairedTransferStatementV2(j)).toBe('WAITING_FOR_EVIDENCE');
 });
 it('accepts ordered signed transitions only; final stage still cannot release real writers',()=>{
   let j=fixture().begin();
   for(let i=0;i<actions.length;i++){
     expect(nextPairedOperationV2(j)).toBe(actions[i]);
     const current=j,signed=proof(j);
     j=advanceHeldPairedTransferV2(j,signed,witnesses);
     expect(j.revision).toBe(i+1);
     expect(current.revision).toBe(i);
     expect(advanceHeldPairedTransferV2(j,signed,witnesses)).toEqual(j);
   }
   expect(j.phase).toBe('review_ready_not_released');
   expect(heldPairedTransferStatementV2(j)).toBe('REVIEW_READY_NOT_AUTHORIZED');
   expect(nextPairedOperationV2(j)).toBeNull();
   expect(R15_REAL_MEMBER_TRANSFER_ENABLED).toBe(false);
 });
 it('requires both hashes: a work-only readback or wrong provenance digest is refused',()=>{
   const j=fixture().begin();
   deny(()=>advanceHeldPairedTransferV2(j,proof(j,undefined,
     {evidenceSha256:j.workDigest}),witnesses),
     'paired_readback_digest_mismatch');
   deny(()=>advanceHeldPairedTransferV2(j,proof(j,undefined,
     {provenanceDigest:sha('swapped-original-ciphertext')}),witnesses),
     'paired_transfer_subject_or_ciphertext_mismatch');
   deny(()=>advanceHeldPairedTransferV2(j,proof(j,undefined,
     {pairDigest:sha('swapped-pair')}),witnesses),
     'paired_transfer_subject_or_ciphertext_mismatch');
 });
 it('refuses missing companion or client-supplied plaintext fields before starting',()=>{
   const x=fixture();
   const fabricated={
     ...x.prepared,
     package:{...x.prepared.package,provenance:null},
   };
   deny(()=>x.begin({prepared:fabricated}),'unreviewed_paired_package_field');
   const tagged={
     ...x.prepared,
     package:{...x.prepared.package,unreviewedFilename:'should-not-be-here'},
   };
   deny(()=>x.begin({prepared:tagged}),'invalid_paired_package');
 });
 it('refuses a prepared pair without current external deletion permission',()=>{
   const x=fixture();
   deny(()=>x.begin({authorities:{...x.authorities,
     independentDeletionGeneration:null}}),'untrusted_deletion_checkpoint');
   deny(()=>x.begin({authorities:{...x.authorities,
     deletionHighwater:x.signedDeletion({...x.authorities.deletionHighwater!.checkpoint,
       revokedWorks:[manuscript]})}}),'deleted_work_refused');
 });
 it('does not allow a stale signed deletion checkpoint supplied with intact ciphertext',()=>{
   const x=fixture();
   deny(()=>x.begin({authorities:{...x.authorities,
     deletionHighwater:x.signedDeletion({...x.authorities.deletionHighwater!.checkpoint,
       generation:19})}}),'stale_deletion_checkpoint');
 });
 it('refuses a foreign manuscript or foreign claimant before the initial journal',()=>{
   const x=fixture();
   deny(()=>x.begin({authorities:{...x.authorities,
     signedClaim:{...x.authorities.signedClaim!,
       claim:{...x.claim,manuscriptId:otherWork}}}}),
      'paired_transfer_signature_invalid');
   deny(()=>x.begin({authorities:{...x.authorities,
     signedClaim:{...x.authorities.signedClaim!,
       claim:{...x.claim,memberId:foreign}}}}),
      'paired_transfer_signature_invalid');
 });
 it('refuses pending-key reuse and unsigned/fake provenance coverage',()=>{
   const x=fixture();
   deny(()=>x.begin({pendingKeyId:x.workKey.keyId}),'pending_key_must_remain_distinct');
   deny(()=>x.begin({prepared:{...x.prepared,
     encryptedMetadataCoverage:'NOT_CERTIFIED'}}),'unverified_pair_preparation');
 });
 it('refuses misplaced operations and stale optimistic-concurrency revisions',()=>{
   const j=fixture().begin();
   deny(()=>advanceHeldPairedTransferV2(j,
     proof(j,'independent_pending_key_revocation_witnessed'),witnesses),
     'paired_transfer_out_of_order');
   deny(()=>advanceHeldPairedTransferV2(j,
     proof(j,undefined,{journalRevision:3}),witnesses),
     'stale_paired_transfer_revision');
 });
 it('requires independent key attestation, not ordinary storage signers',()=>{
   let j=fixture().begin();
   for(const action of actions.slice(0,2))
     j=advanceHeldPairedTransferV2(j,proof(j,action),witnesses);
   expect(j.phase).toBe('retirement_owed');
   deny(()=>advanceHeldPairedTransferV2(j,proof(j,undefined,{},
      storageSigner.privateKey),witnesses),'paired_transfer_signature_invalid');
   deny(()=>advanceHeldPairedTransferV2(j,proof(j),
     {...witnesses,independentKeySigner:null}),'independent_paired_signer_unavailable');
   expect(j.phase).toBe('retirement_owed');
 });
 it('rechecks signature on exact replay; cannot blindly trust matching hashes',()=>{
   const j=fixture().begin(),signed=proof(j);
   const next=advanceHeldPairedTransferV2(j,signed,witnesses);
   const wrong={...signed,signature:sign(null,
     canonicalPairedTransferProofV2(signed.proof),intruder.privateKey).toString('base64')};
   deny(()=>advanceHeldPairedTransferV2(next,wrong,witnesses),
     'paired_transfer_signature_invalid');
   expect(advanceHeldPairedTransferV2(next,signed,witnesses)).toEqual(next);
 });
 it('refuses direct phase mutation, future revision and fake completed state',()=>{
   const j=fixture().begin();
   deny(()=>heldPairedTransferStatementV2({...j,
     phase:'review_ready_not_released'}),'invalid_paired_journal');
   deny(()=>advanceHeldPairedTransferV2({...j,revision:2},
     proof(j),witnesses),'invalid_paired_journal');
 });
 it('older R13 single Work journal cannot accept new pair journal',()=>{
   const j=fixture().begin();
   deny(()=>advanceHeldTransfer(j as unknown as PendingToWorkTransferJournalV1,
     null as never,null as never),'invalid_transfer_journal');
 });
 it('no fallback when independent epoch is missing or newer',()=>{
   const j=fixture().begin();
   deny(()=>advanceHeldPairedTransferV2(j,proof(j),
     {...witnesses,externalMinimumEpoch:null}),'invalid_paired_transfer_epoch');
   deny(()=>advanceHeldPairedTransferV2(j,proof(j),
     {...witnesses,externalMinimumEpoch:13}),'stale_paired_transfer_witness');
 });
 it('rejects forged extra fields in signed evidence before trusting the signature',()=>{
   const j=fixture().begin(),signed=proof(j);
   Object.assign(signed.proof,{privateFilename:'should-remain-encrypted'});
   deny(()=>advanceHeldPairedTransferV2(j,signed,witnesses),
     'invalid_paired_transfer_proof');
 });
});
