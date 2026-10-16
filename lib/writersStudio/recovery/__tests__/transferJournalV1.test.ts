import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { sealPendingArrival } from '../pendingArrivalEnvelopeV1';
import { prepareClaimedArrivalRewrap, canonicalClaimedArrivalPayload,
  type ClaimedArrivalReceiptV1 } from '../pendingClaimTransferV1';
import {
  R13_REAL_MEMBER_TRANSFER_ENABLED, beginHeldTransfer, advanceHeldTransfer,
  nextHeldTransferOperation, heldTransferCompletionStatement, canonicalTransferReceipt,
  type IndependentTransferWitnesses, type PendingToWorkTransferJournalV1,
  type TransferOperationV1, type SignedTransferReceiptV1,
} from '../transferJournalV1';

const memberId='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const arrivalId='306902ed-21a9-4c01-aa15-984755598218';
const manuscriptId='4c0782ca-9074-43ee-9f3c-5f8500026780';
const different='4c0782ca-9074-43ee-9f3c-5f8500026781';
const claimPair=generateKeyPairSync('ed25519');
const storage=generateKeyPairSync('ed25519');
const independentKey=generateKeyPairSync('ed25519');
const recovery=generateKeyPairSync('ed25519');
const stranger=generateKeyPairSync('ed25519');
const witness: IndependentTransferWitnesses={
  storageSigner:storage.publicKey,
  independentKeySigner:independentKey.publicKey,
  independentRecoverySigner:recovery.publicKey,
  minimumIndependentEpoch:12,
};
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const key=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const pendingAuthority={memberId,arrivalId,generation:4};
const sourceText=Buffer.from('A purely invented manuscript paragraph\n');
const originalBytes=Buffer.from([0x50,0x4b,0x03,0x04,0,255]);
function initiate() {
  const pendingKey=key(),workKey=key();
  const original=sealPendingArrival(pendingAuthority,{
    kind:'artifact_extraction',sourceText,originalBytes,
    originalFilename:'fictional-source.docx',
    mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },pendingKey);
  const claim: ClaimedArrivalReceiptV1 ={
    protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
    claimId:randomUUID(),memberId,arrivalId,manuscriptId,pendingGeneration:4,
    manuscriptGeneration:5,claimEpoch:12,sourceKind:'artifact_extraction',
    sourceTextDigest:createHash('sha256').update(sourceText).digest('hex'),
    originalDigest:createHash('sha256').update(originalBytes).digest('hex'),
  };
  const signedClaim={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
    claimPair.privateKey).toString('base64')};
  const prepared=prepareClaimedArrivalRewrap({
    pendingAuthority,pendingEnvelope:original,pendingKey,workKey,
    signedClaim,trustedClaimSigner:claimPair.publicKey,trustedClaimEpoch:12,
  });
  const begin=()=>beginHeldTransfer({
    signedClaim,prepared,pendingKeyId:pendingKey.keyId,
    trustedClaimSigner:claimPair.publicKey,trustedClaimEpoch:12,
  });
  return {begin,pendingKey,workKey,signedClaim,prepared};
}
const operations:TransferOperationV1[]=[
  'work_capsule_durable_readback',
  'retirement_obligation_committed',
  'pending_key_revocation_attested',
  'pending_vault_erasure_attested',
  'independent_recovery_checkpoint_attested',
];
function signStep(j:PendingToWorkTransferJournalV1,
  operation:TransferOperationV1=nextHeldTransferOperation(j)!,override:{
    actor?:typeof storage.privateKey;subject?:string;revision?:number;
    witnessEpoch?:number;evidence?:string;
  }={}):SignedTransferReceiptV1{
  const signer=override.actor||(operation==='pending_key_revocation_attested'
    ?independentKey.privateKey
    :operation==='independent_recovery_checkpoint_attested'
      ?recovery.privateKey:storage.privateKey);
  const receipt={
    protocol:'soullab.ws.transfer-operation.v1' as const,operation,
    claimId:j.claimId,memberId:override.subject||j.memberId,
    arrivalId:j.arrivalId,manuscriptId:j.manuscriptId,pendingKeyId:j.pendingKeyId,
    workKeyId:j.workKeyId,
    transferRevision:override.revision??j.revision,
    witnessEpoch:override.witnessEpoch??12,
    evidenceSha256:override.evidence||(operation==='work_capsule_durable_readback'
      ?j.encryptedWorkDigest:sha('FICTITIOUS_EVIDENCE_'+operation)),
  };
  return {receipt,signature:sign(null,canonicalTransferReceipt(receipt),signer).toString('base64')};
}
const refuses=(fn:()=>unknown,code:string)=>expect(fn).toThrow(expect.objectContaining({code}));

describe('R13 held crash-resumable transfer journal',()=>{
  it('starts only after verified R12 cryptographic claim, no I/O or release authority',()=>{
    const a=initiate(),j=a.begin();
    expect(R13_REAL_MEMBER_TRANSFER_ENABLED).toBe(false);
    expect(j.phase).toBe('claim_committed');
    expect(j.revision).toBe(0);
    expect(j.recoveryStatus).toBe('HELD_CANDIDATE_ONLY');
    expect(j.workKeyId).not.toBe(j.pendingKeyId);
    expect(j.encryptedWorkDigest).toBe(sha(JSON.stringify(a.prepared.sealedWork)));
    expect(heldTransferCompletionStatement(j)).toBe('WAITING_FOR_EVIDENCE');
    expect(JSON.stringify(j)).not.toContain('A purely invented manuscript');
  });
  it('moves through five independently attested steps; never declares production completion',()=>{
    let j=initiate().begin();
    for(let index=0;index<operations.length;index++){
      expect(nextHeldTransferOperation(j)).toBe(operations[index]);
      const previous=j;
      const proof=signStep(j);
      j=advanceHeldTransfer(j,proof,witness);
      expect(j.revision).toBe(index+1);
      expect(previous.revision).toBe(index); // reducer cannot mutate stored journal.
      expect(advanceHeldTransfer(j,proof,witness)).toEqual(j); // exact retry idempotent
    }
    expect(j.phase).toBe('review_ready_not_released');
    expect(nextHeldTransferOperation(j)).toBeNull();
    expect(heldTransferCompletionStatement(j)).toBe('REVIEW_READY_RELEASE_NOT_AUTHORIZED');
  });
  it('never skips ahead or accepts stale revision despite valid signature',()=>{
    const j=initiate().begin();
    refuses(()=>advanceHeldTransfer(j,signStep(j,'pending_key_revocation_attested'),witness),
      'transfer_out_of_order');
    refuses(()=>advanceHeldTransfer(j,signStep(j,undefined,{revision:2}),witness),
      'stale_transfer_revision');
  });
  it('rejects a valid storage signature for an incorrectly recorded Work readback',()=>{
    const j=initiate().begin();
    refuses(()=>advanceHeldTransfer(j,signStep(j,undefined,{evidence:sha('not_work')}),
      witness),'work_capsule_readback_digest_mismatch');
  });
  it('refuses replay with a different witness and a different signed proof',()=>{
    const j=initiate().begin(),proof=signStep(j);
    const advanced=advanceHeldTransfer(j,proof,witness);
    refuses(()=>advanceHeldTransfer(advanced,signStep(j,undefined,{witnessEpoch:13}),witness),
      'stale_transfer_revision');
  });
  it('refuses a proof signed by an unauthorized actor',()=>{
    const j=initiate().begin();
    refuses(()=>advanceHeldTransfer(j,signStep(j,undefined,{actor:stranger.privateKey}),
      witness),'transfer_signature_invalid');
  });
  it('refuses missing or stale independently witnessed minimum epoch',()=>{
    const j=initiate().begin();
    refuses(()=>advanceHeldTransfer(j,signStep(j),{...witness,minimumIndependentEpoch:13}),
      'stale_independent_transfer_witness');
    refuses(()=>advanceHeldTransfer(j,signStep(j,undefined,{witnessEpoch:11}),witness),
      'transfer_witness_predates_claim');
  });
  it('prevents substitution of any member even when attacker controls receipt signature',()=>{
    const j=initiate().begin();
    refuses(()=>advanceHeldTransfer(j,signStep(j,undefined,{subject:different}),witness),
      'transfer_subject_mismatch');
  });
  it('refuses journal phase/version splicing from stale SQL backups',()=>{
    const j=initiate().begin();
    refuses(()=>advanceHeldTransfer({...j,revision:2},signStep(j),witness),
      'invalid_transfer_journal');
    refuses(()=>advanceHeldTransfer({...j,phase:'retirement_owed'},signStep(j),witness),
      'invalid_transfer_journal');
  });
  it('does not treat a fake final-review state as an authenticated result',()=>{
    const j=initiate().begin();
    refuses(()=>heldTransferCompletionStatement({...j,phase:'review_ready_not_released'}),
      'invalid_transfer_journal');
  });

  it('does not accept ordinary storage approval in place of independent key retirement',()=>{
    let j=initiate().begin();
    for(const operation of operations.slice(0,2)){
      j=advanceHeldTransfer(j,signStep(j,operation),witness);
    }
    expect(j.phase).toBe('retirement_owed');
    refuses(()=>advanceHeldTransfer(j,
      signStep(j,'pending_key_revocation_attested',{actor:storage.privateKey}),
      witness),'transfer_signature_invalid');
    refuses(()=>advanceHeldTransfer(j,
      signStep(j,'pending_key_revocation_attested'),
      {...witness,independentKeySigner:null as never}),
      'missing_independent_transfer_signer');
    expect(heldTransferCompletionStatement(j)).toBe('WAITING_FOR_EVIDENCE');
  });

  it('has no code path from review-ready to real-member release or a second completion',()=>{
    let j=initiate().begin();
    for(const operation of operations){
      j=advanceHeldTransfer(j,signStep(j,operation),witness);
    }
    expect(j.phase).toBe('review_ready_not_released');
    refuses(()=>advanceHeldTransfer(j,
      signStep(j,'work_capsule_durable_readback'),witness),
      'transfer_already_at_review_boundary');
    expect(heldTransferCompletionStatement(j)).toBe('REVIEW_READY_RELEASE_NOT_AUTHORIZED');
    expect(R13_REAL_MEMBER_TRANSFER_ENABLED).toBe(false);
  });

  it('refuses tampered claimant signed receipt and a mismatched prepared destination',()=>{
    const a=initiate();
    const tampered={...a.signedClaim,claim:{...a.signedClaim.claim,manuscriptId:different}};
    refuses(()=>beginHeldTransfer({signedClaim:tampered,prepared:a.prepared,
      pendingKeyId:a.pendingKey.keyId,trustedClaimSigner:claimPair.publicKey,trustedClaimEpoch:12}),
      'transfer_signature_invalid');
    refuses(()=>beginHeldTransfer({signedClaim:a.signedClaim,
      prepared:{...a.prepared,destinationManuscriptId:different},
      pendingKeyId:a.pendingKey.keyId,trustedClaimSigner:claimPair.publicKey,trustedClaimEpoch:12}),
      'claim_manuscript_mismatch');
  });
});
