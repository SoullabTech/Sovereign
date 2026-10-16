/**
 * R13 HELD — crash-resumable pending Source -> Work transfer journal.
 *
 * PostgreSQL, original-vault storage and an independent key authority cannot
 * commit atomically together. This is a signed, monotonic OUTBOX protocol.
 * The reducer neither does I/O nor releases a pending key; a caller must
 * independently prove each completed operation and durably CAS each revision.
 *
 * Explicitly NOT imported into live routes or member backup services.
 */
import { createHash, verify, type KeyObject } from 'node:crypto';
import {
  canonicalClaimedArrivalPayload, type SignedClaimedArrivalV1,
  type HeldPreparedClaimV1,
} from './pendingClaimTransferV1';
import { WorkRecoveryRefusal } from './workEnvelopeV1';

const PROTOCOL = 'soullab.ws.transfer-journal.v1' as const;
const ATTEST = 'soullab.ws.transfer-operation.v1' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA = /^[a-f0-9]{64}$/;
const SIGNATURE = /^[A-Za-z0-9+/]{86}==$/;
const OPERATIONS = [
  'work_capsule_durable_readback',
  'retirement_obligation_committed',
  'pending_key_revocation_attested',
  'pending_vault_erasure_attested',
  'independent_recovery_checkpoint_attested',
] as const;
export type TransferOperationV1 = (typeof OPERATIONS)[number];
export type TransferPhaseV1 =
  'claim_committed' | 'work_capsule_verified' | 'retirement_owed' |
  'key_retirement_witnessed' | 'pending_bytes_erasure_witnessed' |
  'review_ready_not_released';

export type TransferOperationReceiptV1 = {
  protocol: typeof ATTEST;
  operation: TransferOperationV1;
  claimId: string;
  memberId: string;
  arrivalId: string;
  manuscriptId: string;
  pendingKeyId: string;
  workKeyId: string;
  transferRevision: number;  // optimistic CAS, starting at zero
  witnessEpoch: number;
  evidenceSha256: string;    // ciphertext / outbox / key tombstone / vault / checkpoint evidence
};
export type SignedTransferReceiptV1 = {
  receipt: TransferOperationReceiptV1;
  signature: string;
};
export type IndependentTransferWitnesses = {
  /** Reviewed signer keys are NEVER loaded from the same archived SQL+Source. */
  storageSigner: KeyObject;
  independentKeySigner: KeyObject;
  independentRecoverySigner: KeyObject;
  /** Minimum epoch obtained from a nonrollbackable authority OUTSIDE backups. */
  minimumIndependentEpoch: number;
};
export type PendingToWorkTransferJournalV1 = {
  protocol: typeof PROTOCOL;
  claimId: string;
  memberId: string;
  arrivalId: string;
  manuscriptId: string;
  pendingKeyId: string;
  workKeyId: string;
  claimEpoch: number;
  manuscriptGeneration: number;
  encryptedWorkDigest: string;
  phase: TransferPhaseV1;
  revision: number;
  lastReceiptSha256: string | null;
  recoveryStatus: 'HELD_CANDIDATE_ONLY';
};
export const R13_REAL_MEMBER_TRANSFER_ENABLED = false as const;

function refuse(code: string): never { throw new WorkRecoveryRefusal(code); }
function checkedUUID(value: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) refuse('invalid_transfer_identifier');
  return value.toLowerCase();
}
function checkedEpoch(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) refuse('invalid_transfer_epoch');
  return value;
}
function sha256(x: Buffer | string): string {
  return createHash('sha256').update(x).digest('hex');
}
function decodeSig(sig: string): Buffer {
  if (typeof sig !== 'string' || !SIGNATURE.test(sig))
    refuse('invalid_transfer_signature');
  const data = Buffer.from(sig, 'base64');
  if (data.length !== 64 || data.toString('base64') !== sig)
    refuse('invalid_transfer_signature');
  return data;
}
function verifySignature(payload: Buffer, sig: string, key: KeyObject): void {
  if (!key || key.asymmetricKeyType !== 'ed25519')
    refuse('missing_independent_transfer_signer');
  let valid: boolean;
  try { valid = verify(null, payload, key, decodeSig(sig)); }
  catch (e) {
    if (e instanceof WorkRecoveryRefusal) throw e;
    refuse('transfer_signature_invalid');
  }
  if (!valid) refuse('transfer_signature_invalid');
}
export function canonicalTransferReceipt(input: TransferOperationReceiptV1): Buffer {
  if (!input || input.protocol !== ATTEST || !OPERATIONS.includes(input.operation))
    refuse('invalid_transfer_receipt');
  if (!Number.isSafeInteger(input.transferRevision) || input.transferRevision < 0)
    refuse('invalid_transfer_revision');
  const claimId = checkedUUID(input.claimId);
  const memberId = checkedUUID(input.memberId);
  const arrivalId = checkedUUID(input.arrivalId);
  const manuscriptId = checkedUUID(input.manuscriptId);
  const pendingKeyId = checkedUUID(input.pendingKeyId);
  const workKeyId = checkedUUID(input.workKeyId);
  const epoch = checkedEpoch(input.witnessEpoch);
  if (typeof input.evidenceSha256 !== 'string' || !SHA.test(input.evidenceSha256))
    refuse('invalid_transfer_evidence_digest');
  return Buffer.from(JSON.stringify([ATTEST,input.operation,claimId,memberId,arrivalId,
    manuscriptId,pendingKeyId,workKeyId,input.transferRevision,epoch,input.evidenceSha256]), 'utf8');
}

/**
 * Initial state requires the R12 committed, signed claim, independently
 * witnessed current claim epoch and sealed Work produced with a DIFFERENT key.
 * Starting a journal is NOT evidence that the Work capsule was durably stored.
 */
export function beginHeldTransfer(input: {
  signedClaim: SignedClaimedArrivalV1;
  prepared: HeldPreparedClaimV1;
  pendingKeyId: string;
  trustedClaimSigner: KeyObject;
  trustedClaimEpoch: number;
}): PendingToWorkTransferJournalV1 {
  const { claim, signature } = input.signedClaim || {};
  if (!claim || !input.prepared || input.prepared.transitionStatus !== 'PREPARED_ONLY_NOT_PERSISTED')
    refuse('unverified_claim_preparation');
  checkedEpoch(input.trustedClaimEpoch);
  if (claim.claimEpoch < input.trustedClaimEpoch)
    refuse('stale_claim_commit_epoch');
  verifySignature(canonicalClaimedArrivalPayload(claim), signature, input.trustedClaimSigner);
  const pendingKeyId = checkedUUID(input.pendingKeyId);
  const workKeyId = checkedUUID(input.prepared.sealedWork?.keyId);
  if (pendingKeyId === workKeyId) refuse('pending_key_must_not_be_work_key');
  if (input.prepared.destinationManuscriptId.toLowerCase() !== claim.manuscriptId.toLowerCase())
    refuse('claim_manuscript_mismatch');
  if (input.prepared.pendingKeyRetirement !== 'REQUIRED_NOT_WITNESSED' ||
      input.prepared.metadataCoverage !== 'ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED')
    refuse('unsupported_prepared_claim_contract');
  return { protocol: PROTOCOL, claimId: checkedUUID(claim.claimId),
    memberId: checkedUUID(claim.memberId),
    arrivalId: checkedUUID(claim.arrivalId),
    manuscriptId: checkedUUID(claim.manuscriptId),
    pendingKeyId, workKeyId, claimEpoch: claim.claimEpoch,
    manuscriptGeneration: checkedEpoch(claim.manuscriptGeneration),
    encryptedWorkDigest: sha256(Buffer.from(JSON.stringify(input.prepared.sealedWork),'utf8')),
    phase: 'claim_committed', revision: 0, lastReceiptSha256: null,
    recoveryStatus:'HELD_CANDIDATE_ONLY' };
}

const STEPS: ReadonlyArray<{
  from: TransferPhaseV1;
  action: TransferOperationV1;
  to: TransferPhaseV1;
  signer: 'storageSigner' | 'independentKeySigner' | 'independentRecoverySigner';
}> = [
  { from:'claim_committed',action:'work_capsule_durable_readback',to:'work_capsule_verified',signer:'storageSigner' },
  { from:'work_capsule_verified',action:'retirement_obligation_committed',to:'retirement_owed',signer:'storageSigner' },
  { from:'retirement_owed',action:'pending_key_revocation_attested',to:'key_retirement_witnessed',signer:'independentKeySigner' },
  { from:'key_retirement_witnessed',action:'pending_vault_erasure_attested',to:'pending_bytes_erasure_witnessed',signer:'storageSigner' },
  { from:'pending_bytes_erasure_witnessed',action:'independent_recovery_checkpoint_attested',
    to:'review_ready_not_released',signer:'independentRecoverySigner' },
];

export function nextHeldTransferOperation(
  journal: PendingToWorkTransferJournalV1,
): TransferOperationV1 | null {
  const next = STEPS.find(step => step.from === journal?.phase);
  return next?.action ?? null;
}

function validateJournal(j: PendingToWorkTransferJournalV1): void {
  if (!j || j.protocol !== PROTOCOL || j.recoveryStatus !== 'HELD_CANDIDATE_ONLY' ||
      ![...STEPS.map(step=>step.from),'review_ready_not_released'].includes(j.phase))
    refuse('invalid_transfer_journal');
  checkedUUID(j.claimId); checkedUUID(j.memberId); checkedUUID(j.arrivalId);
  checkedUUID(j.manuscriptId); checkedUUID(j.pendingKeyId); checkedUUID(j.workKeyId);
  checkedEpoch(j.claimEpoch); checkedEpoch(j.manuscriptGeneration);
  if (j.pendingKeyId === j.workKeyId || !SHA.test(j.encryptedWorkDigest))
    refuse('invalid_transfer_journal');
  if (!Number.isSafeInteger(j.revision) || j.revision < 0 || j.revision > STEPS.length)
    refuse('invalid_transfer_journal');
  if (j.lastReceiptSha256 !== null && !SHA.test(j.lastReceiptSha256))
    refuse('invalid_transfer_journal');
  const expectedPhase = j.revision === 0 ? 'claim_committed' : STEPS[j.revision - 1].to;
  if (j.phase !== expectedPhase || (j.revision === 0) !== (j.lastReceiptSha256 === null))
    refuse('invalid_transfer_journal');
}

/**
 * One sealed, signer-verified proof advances exactly one journal revision.
 *
 * Safe replays of the SAME proof return the existing state without another
 * side effect. Concurrent or inconsistent proofs refuse. Persistence must use
 * UPDATE ... WHERE revision=expected AND phase=expected (CAS); the physical
 * PG fixture exercises this separate database invariant.
 */
export function advanceHeldTransfer(
  journal: PendingToWorkTransferJournalV1,
  signed: SignedTransferReceiptV1,
  witnesses: IndependentTransferWitnesses,
): PendingToWorkTransferJournalV1 {
  validateJournal(journal);
  if (!signed?.receipt || !witnesses) refuse('missing_transfer_receipt');
  const receipt = signed.receipt;
  const proof = canonicalTransferReceipt(receipt);
  const proofDigest = sha256(Buffer.concat([proof, decodeSig(signed.signature)]));
  if (receipt.transferRevision === journal.revision - 1 &&
      journal.lastReceiptSha256 === proofDigest &&
      STEPS[journal.revision - 1]?.action === receipt.operation)
    return journal;  // Exact retry without advancing or inventing another event.

  if (receipt.transferRevision !== journal.revision)
    refuse('stale_transfer_revision');
  const step = STEPS.find(x => x.from === journal.phase);
  if (!step) refuse('transfer_already_at_review_boundary');
  if (step.action !== receipt.operation)
    refuse('transfer_out_of_order');
  if (receipt.claimId.toLowerCase() !== journal.claimId ||
      receipt.memberId.toLowerCase() !== journal.memberId ||
      receipt.arrivalId.toLowerCase() !== journal.arrivalId ||
      receipt.manuscriptId.toLowerCase() !== journal.manuscriptId ||
      receipt.pendingKeyId.toLowerCase() !== journal.pendingKeyId ||
      receipt.workKeyId.toLowerCase() !== journal.workKeyId)
    refuse('transfer_subject_mismatch');
  if (receipt.witnessEpoch < journal.claimEpoch)
    refuse('transfer_witness_predates_claim');
  if (receipt.operation === 'work_capsule_durable_readback' &&
      receipt.evidenceSha256 !== journal.encryptedWorkDigest)
    refuse('work_capsule_readback_digest_mismatch');
  const floor=checkedEpoch(witnesses.minimumIndependentEpoch);
  if (receipt.witnessEpoch < floor) refuse('stale_independent_transfer_witness');
  verifySignature(proof,signed.signature,witnesses[step.signer]);
  return { ...journal, revision:journal.revision+1,phase:step.to,
    lastReceiptSha256:proofDigest };
}

/**
 * This candidate cannot produce "migration complete" or admit a real member.
 * A final independent examiner must verify all SQL+vault historical copies,
 * the retired key and deletion checkpoints, backup/restore and old-reader
 * compatibility before separately approving a production transition.
 */
export function heldTransferCompletionStatement(
  j: PendingToWorkTransferJournalV1,
): 'WAITING_FOR_EVIDENCE' | 'REVIEW_READY_RELEASE_NOT_AUTHORIZED' {
  validateJournal(j);
  return j.phase === 'review_ready_not_released'
    ? 'REVIEW_READY_RELEASE_NOT_AUTHORIZED'
    : 'WAITING_FOR_EVIDENCE';
}
