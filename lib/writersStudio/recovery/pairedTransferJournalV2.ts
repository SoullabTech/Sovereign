/**
 * R15 ISOLATED — a signed, two-ciphertext, crash-resumable transfer contract.
 *
 * NOT wired to the production database, member session, filesystem or a real
 * key custodian. An external independent epoch and signers MUST be supplied.
 * No code here may declare an old pending key destroyed, a manuscript erased,
 * or real-member admission permitted.
 */
import { createHash, verify, type KeyObject } from 'node:crypto';
import { WorkRecoveryRefusal, type WorkEncryptionKey } from './workEnvelopeV1';
import { openPairedOriginalV2, type PreparedPairedOriginalV2,
  type PairedOriginalPackageV2 } from './pairedOriginalCustodyV2';
import { canonicalClaimedArrivalPayload, type SignedClaimedArrivalV1
} from './pendingClaimTransferV1';
import { type SignedDeletionHighwaterV1, type IndependentGenerationWitness
} from './deletionBarrierV1';

const JOURNAL='soullab.ws.paired-transfer-journal.v2' as const;
const RECEIPT='soullab.ws.paired-transfer-proof.v2' as const;
const PAIR='soullab.ws.paired-original.v2';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const SIG=/^[A-Za-z0-9+/]{86}==$/;

const ACTIONS=[
 'paired_ciphertexts_durable_readback',
 'retirement_obligation_committed',
 'independent_pending_key_revocation_witnessed',
 'pending_vault_erasure_witnessed',
 'independent_recovery_checkpoint_witnessed',
] as const;
export type PairedTransferActionV2=(typeof ACTIONS)[number];
export type PairedTransferPhaseV2=
  'claim_committed'|'pair_verified'|'retirement_owed'|'key_retirement_witnessed'|
  'pending_erasure_witnessed'|'review_ready_not_released';
export const R15_REAL_MEMBER_TRANSFER_ENABLED=false as const;

export type PairedTransferJournalV2={
  protocol:typeof JOURNAL;
  claimId:string;memberId:string;arrivalId:string;manuscriptId:string;
  pendingKeyId:string;workKeyId:string;claimEpoch:number;workGeneration:number;
  workDigest:string;provenanceDigest:string;pairDigest:string;
  phase:PairedTransferPhaseV2;revision:number;lastReceiptSha256:string|null;
  custody:'HELD_FICTIONAL_CANDIDATE_ONLY';
};
export type PairedTransferProofV2={
  protocol:typeof RECEIPT;action:PairedTransferActionV2;
  claimId:string;memberId:string;arrivalId:string;manuscriptId:string;
  pendingKeyId:string;workKeyId:string;claimEpoch:number;
  workDigest:string;provenanceDigest:string;pairDigest:string;
  journalRevision:number;witnessEpoch:number;evidenceSha256:string;
};
export type SignedPairedTransferProofV2={
  proof:PairedTransferProofV2;signature:string;
};
export type PairedTransferWitnessesV2={
  storageSigner:KeyObject|null;
  independentKeySigner:KeyObject|null;
  independentRecoverySigner:KeyObject|null;
  externalMinimumEpoch:number|null;
};
export type PairedTransferClaimAuthoritiesV2={
  signedClaim:SignedClaimedArrivalV1|null;
  claimSigner:KeyObject|null;
  minimumClaimEpoch:number|null;
  provenanceSigner:KeyObject|null;
  minimumProvenanceEpoch:number|null;
  deletionHighwater:SignedDeletionHighwaterV1|null;
  deletionSigner:KeyObject|null;
  independentDeletionGeneration:IndependentGenerationWitness|null;
};

const STEPS:readonly {
 from:PairedTransferPhaseV2;action:PairedTransferActionV2;
 to:PairedTransferPhaseV2;
 signer:'storageSigner'|'independentKeySigner'|'independentRecoverySigner'
}[]=[
 {from:'claim_committed',action:'paired_ciphertexts_durable_readback',
  to:'pair_verified',signer:'storageSigner'},
 {from:'pair_verified',action:'retirement_obligation_committed',
  to:'retirement_owed',signer:'storageSigner'},
 {from:'retirement_owed',action:'independent_pending_key_revocation_witnessed',
  to:'key_retirement_witnessed',signer:'independentKeySigner'},
 {from:'key_retirement_witnessed',action:'pending_vault_erasure_witnessed',
  to:'pending_erasure_witnessed',signer:'storageSigner'},
 {from:'pending_erasure_witnessed',action:'independent_recovery_checkpoint_witnessed',
  to:'review_ready_not_released',signer:'independentRecoverySigner'},
];
function refuse(code:string):never {throw new WorkRecoveryRefusal(code);}
function uuid(s:unknown):string{
 if(typeof s!=='string'||!UUID.test(s))refuse('invalid_paired_transfer_identity');
 return s.toLowerCase();
}
function epoch(n:unknown,min=1):number{
 if(typeof n!=='number'||!Number.isSafeInteger(n)||n<min)refuse('invalid_paired_transfer_epoch');
 return n;
}
function digest(s:Buffer|string):string{
 return createHash('sha256').update(s).digest('hex');
}
function sha(s:unknown):string{
 if(typeof s!=='string'||!SHA.test(s))refuse('invalid_paired_transfer_digest');
 return s;
}
function sigBytes(s:unknown):Buffer{
 if(typeof s!=='string'||!SIG.test(s))refuse('invalid_paired_transfer_signature');
 const b=Buffer.from(s,'base64');
 if(b.length!==64||b.toString('base64')!==s)refuse('invalid_paired_transfer_signature');
 return b;
}
function signature(payload:Buffer, signed:unknown, signer:KeyObject|null):void {
 if(!signer||signer.asymmetricKeyType!=='ed25519')
  refuse('independent_paired_signer_unavailable');
 let ok=false;
 try{ok=verify(null,payload,signer,sigBytes(signed));}
 catch(e){if(e instanceof WorkRecoveryRefusal)throw e;refuse('paired_transfer_signature_invalid');}
 if(!ok)refuse('paired_transfer_signature_invalid');
}
function validatePair(p:PairedOriginalPackageV2):void{
 if(!p||p.protocol!==PAIR||
   Object.keys(p).sort().join('|')!=='pairDigest|protocol|provenance|provenanceDigest|work|workDigest')
  refuse('invalid_paired_package');
 if(!p.work||!p.provenance||
  Object.keys(p.work).sort().join('|')!=='ciphertext|iv|keyId|protocol|tag'||
  Object.keys(p.provenance).sort().join('|')!=='ciphertext|keyId|nonce|protocol|tag')
  refuse('unreviewed_paired_package_field');
 sha(p.workDigest);sha(p.provenanceDigest);sha(p.pairDigest);
 if(p.workDigest!==digest(JSON.stringify(p.work))||
    p.provenanceDigest!==digest(JSON.stringify(p.provenance))||
    p.pairDigest!==digest(JSON.stringify([PAIR,p.workDigest,p.provenanceDigest])))
  refuse('paired_transfer_manifest_mismatch');
}
function acceptedKey(key:WorkEncryptionKey):void{
 if(!key||!UUID.test(key.keyId)||!Buffer.isBuffer(key.keyBytes)||key.keyBytes.length!==32)
  refuse('invalid_work_key_for_pair');
}

/**
 * Start only after all original bytes, private filename, committed Source claim
 * and current independent deletion checkpoint have been reverified. This has
 * no disk side effects and does not imply an independently held production key.
 */
export function beginHeldPairedTransferV2(input:{
 prepared:PreparedPairedOriginalV2;pendingKeyId:string;workKey:WorkEncryptionKey;
 authorities:PairedTransferClaimAuthoritiesV2;
}):PairedTransferJournalV2 {
 const {prepared,authorities}=input;
 if(!prepared||prepared.transitionStatus!=='PREPARED_ONLY_NOT_PERSISTED'||
    prepared.encryptedMetadataCoverage!=='FILENAME_MIME_EXTRACTOR_AND_HASHES_ENCRYPTED'||
    prepared.pendingKeyRetirement!=='NOT_WITNESSED'||
    prepared.pendingFileErasure!=='NOT_WITNESSED'||
    prepared.sourceAndWorkBackupCensus!=='NOT_CERTIFIED')
  refuse('unverified_pair_preparation');
 const pendingKeyId=uuid(input.pendingKeyId);
 acceptedKey(input.workKey);
 const workKeyId=uuid(input.workKey.keyId);
 if(pendingKeyId===workKeyId)refuse('pending_key_must_remain_distinct');
 validatePair(prepared.package);
 if(prepared.package.work.keyId!==workKeyId||
    prepared.package.provenance.keyId!==workKeyId)
  refuse('paired_package_wrong_work_key');
 const claim=authorities?.signedClaim?.claim;
 if(!claim||!authorities.claimSigner||authorities.minimumClaimEpoch===null)
  refuse('missing_committed_claim_authority');
 epoch(authorities.minimumClaimEpoch);
 signature(canonicalClaimedArrivalPayload(claim),
   authorities.signedClaim?.signature,authorities.claimSigner);
 if(claim.claimEpoch<authorities.minimumClaimEpoch)refuse('stale_claim_checkpoint');
 // This will check signed metadata and CURRENT deletion state before
 // releasing any original Source bytes or private filenames.
 openPairedOriginalV2({
   package:prepared.package,workKey:input.workKey,
   signedClaim:authorities.signedClaim,
   trustedClaimSigner:authorities.claimSigner,
   independentClaimMinimumEpoch:authorities.minimumClaimEpoch,
   trustedProvenanceSigner:authorities.provenanceSigner,
   independentProvenanceMinimumEpoch:authorities.minimumProvenanceEpoch,
   signedDeletionHighwater:authorities.deletionHighwater,
   trustedDeletionSigner:authorities.deletionSigner,
   independentDeletionGeneration:authorities.independentDeletionGeneration,
 });
 return {
   protocol:JOURNAL,claimId:uuid(claim.claimId),memberId:uuid(claim.memberId),
   arrivalId:uuid(claim.arrivalId),manuscriptId:uuid(claim.manuscriptId),
   pendingKeyId,workKeyId,claimEpoch:epoch(claim.claimEpoch),
   workGeneration:epoch(claim.manuscriptGeneration),
   workDigest:prepared.package.workDigest,
   provenanceDigest:prepared.package.provenanceDigest,
   pairDigest:prepared.package.pairDigest,
   phase:'claim_committed',revision:0,lastReceiptSha256:null,
   custody:'HELD_FICTIONAL_CANDIDATE_ONLY'
 };
}
const PROOF_KEYS=[
 'action','arrivalId','claimEpoch','claimId','evidenceSha256','journalRevision',
 'manuscriptId','memberId','pairDigest','pendingKeyId','protocol','provenanceDigest',
 'witnessEpoch','workDigest','workKeyId'
].join('|');
export function canonicalPairedTransferProofV2(p:PairedTransferProofV2):Buffer{
 if(!p||p.protocol!==RECEIPT||
    Object.keys(p).sort().join('|')!==PROOF_KEYS||
    !ACTIONS.includes(p.action))
  refuse('invalid_paired_transfer_proof');
 const claimId=uuid(p.claimId),memberId=uuid(p.memberId),arrivalId=uuid(p.arrivalId),
 manuscriptId=uuid(p.manuscriptId),pendingKeyId=uuid(p.pendingKeyId),
 workKeyId=uuid(p.workKeyId);
 if(pendingKeyId===workKeyId)refuse('pending_key_must_remain_distinct');
 const claimEpoch=epoch(p.claimEpoch),witnessEpoch=epoch(p.witnessEpoch);
 const journalRevision=epoch(p.journalRevision,0);
 return Buffer.from(JSON.stringify([
  RECEIPT,p.action,claimId,memberId,arrivalId,manuscriptId,pendingKeyId,
  workKeyId,claimEpoch,sha(p.workDigest),sha(p.provenanceDigest),
  sha(p.pairDigest),journalRevision,witnessEpoch,sha(p.evidenceSha256),
 ]),'utf8');
}
const JOURNAL_KEYS=[
 'arrivalId','claimEpoch','claimId','custody','lastReceiptSha256','manuscriptId',
 'memberId','pairDigest','pendingKeyId','phase','protocol','provenanceDigest',
 'revision','workDigest','workGeneration','workKeyId'
].join('|');
function validateJournal(j:PairedTransferJournalV2):void{
 if(!j||j.protocol!==JOURNAL||
   Object.keys(j).sort().join('|')!==JOURNAL_KEYS||
   j.custody!=='HELD_FICTIONAL_CANDIDATE_ONLY')
  refuse('invalid_paired_journal');
 uuid(j.claimId);uuid(j.memberId);uuid(j.arrivalId);uuid(j.manuscriptId);
 const pendingKeyId=uuid(j.pendingKeyId),workKeyId=uuid(j.workKeyId);
 if(pendingKeyId===workKeyId)refuse('invalid_paired_journal');
 epoch(j.claimEpoch);epoch(j.workGeneration);
 sha(j.workDigest);sha(j.provenanceDigest);sha(j.pairDigest);
 if(!Number.isSafeInteger(j.revision)||j.revision<0||j.revision>STEPS.length)
  refuse('invalid_paired_journal');
 if(j.lastReceiptSha256!==null)sha(j.lastReceiptSha256);
 const phase=j.revision===0?'claim_committed':STEPS[j.revision-1].to;
 if(j.phase!==phase||(j.revision===0)!==(j.lastReceiptSha256===null))
  refuse('invalid_paired_journal');
}
export function nextPairedOperationV2(j:PairedTransferJournalV2):PairedTransferActionV2|null{
 validateJournal(j);
 return STEPS.find(s=>s.from===j.phase)?.action??null;
}

/** Every proof is reauthenticated, INCLUDING an idempotent replay. */
export function advanceHeldPairedTransferV2(
 journal:PairedTransferJournalV2,signed:SignedPairedTransferProofV2,
 witness:PairedTransferWitnessesV2
):PairedTransferJournalV2 {
 validateJournal(journal);
 if(!signed?.proof||!witness)refuse('missing_paired_transfer_proof');
 const p=signed.proof;
 const canonical=canonicalPairedTransferProofV2(p);
 const step=STEPS.find(s=>s.action===p.action);
 if(!step)refuse('invalid_paired_transfer_proof');
 const minimumEpoch=epoch(witness.externalMinimumEpoch);
 if(p.witnessEpoch<minimumEpoch||p.witnessEpoch<journal.claimEpoch)
  refuse('stale_paired_transfer_witness');
 if(uuid(p.claimId)!==journal.claimId||
    uuid(p.memberId)!==journal.memberId||
    uuid(p.arrivalId)!==journal.arrivalId||
    uuid(p.manuscriptId)!==journal.manuscriptId||
    uuid(p.pendingKeyId)!==journal.pendingKeyId||
    uuid(p.workKeyId)!==journal.workKeyId||
    p.claimEpoch!==journal.claimEpoch||
    p.workDigest!==journal.workDigest||
    p.provenanceDigest!==journal.provenanceDigest||
    p.pairDigest!==journal.pairDigest)
  refuse('paired_transfer_subject_or_ciphertext_mismatch');
 const signer=witness[step.signer];
 signature(canonical,signed.signature,signer);
 const proofDigest=digest(Buffer.concat([canonical,sigBytes(signed.signature)]));
 if(p.journalRevision===journal.revision-1&&
    journal.lastReceiptSha256===proofDigest&&
    STEPS[journal.revision-1]?.action===p.action)
  return journal;
 if(p.journalRevision!==journal.revision)refuse('stale_paired_transfer_revision');
 const next=STEPS.find(s=>s.from===journal.phase);
 if(!next)refuse('paired_transfer_review_boundary');
 if(p.action!==next.action)refuse('paired_transfer_out_of_order');
 // First transition proves the exact two independently read-back ciphertexts.
 if(p.action==='paired_ciphertexts_durable_readback'&&
    p.evidenceSha256!==journal.pairDigest)
  refuse('paired_readback_digest_mismatch');
 return {...journal,phase:next.to,revision:journal.revision+1,
   lastReceiptSha256:proofDigest};
}
export function heldPairedTransferStatementV2(j:PairedTransferJournalV2):
 'WAITING_FOR_EVIDENCE'|'REVIEW_READY_NOT_AUTHORIZED'{
 validateJournal(j);
 return j.phase==='review_ready_not_released'
   ?'REVIEW_READY_NOT_AUTHORIZED':'WAITING_FOR_EVIDENCE';
}
