/**
 * R12 ISOLATED, SOURCE-ONLY pending → manuscript crypto handoff.
 *
 * This PREPARES a new per-Manuscript encrypted capsule only after a signed
 * claim receipt. It NEVER commits database rows, removes a pending original,
 * retires a key, or claims erasure. The real claim signer and trusted high-water
 * must be bound to a proven SAME-MEMBER transaction, outside this module.
 */
import { createHash, timingSafeEqual, verify, type KeyObject } from 'node:crypto';
import {
  sealWorkSnapshot, WorkRecoveryRefusal,
  type SealedWorkV1, type WorkEncryptionKey,
} from './workEnvelopeV1';
import {
  openPendingArrival,
  type PendingArrivalAuthorityV1, type PendingArrivalEnvelopeV1,
} from './pendingArrivalEnvelopeV1';

const PROTOCOL = 'soullab.ws.pending-claim-transfer.v1' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;

export type ClaimedArrivalReceiptV1 = {
  protocol: typeof PROTOCOL;
  status: 'claim_committed';
  claimId: string;
  memberId: string;
  arrivalId: string;
  manuscriptId: string;
  pendingGeneration: number;
  manuscriptGeneration: number;
  claimEpoch: number;
  sourceKind: 'artifact_extraction' | 'member_supplied_text';
  sourceTextDigest: string;
  originalDigest: string | null;
};
export type SignedClaimedArrivalV1 = {
  claim: ClaimedArrivalReceiptV1;
  signature: string;
};
export type HeldPreparedClaimV1 = {
  destinationManuscriptId: string;
  sealedWork: SealedWorkV1;
  pendingKeyRetirement: 'REQUIRED_NOT_WITNESSED';
  pendingFileErasure: 'REQUIRED_NOT_WITNESSED' | 'NOT_APPLICABLE_PASTE';
  metadataCoverage: 'ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED';
  transitionStatus: 'PREPARED_ONLY_NOT_PERSISTED';
};

function refuse(code: string): never { throw new WorkRecoveryRefusal(code); }
function validGeneration(x: unknown): number {
  if (typeof x !== 'number' || !Number.isSafeInteger(x) || x < 1)
    refuse('invalid_claim_generation');
  return x;
}
function uuid(x: unknown): string {
  if (typeof x !== 'string' || !UUID.test(x)) refuse('invalid_claim_uuid');
  return x.toLowerCase();
}
function digest(bytes: Buffer): string { return createHash('sha256').update(bytes).digest('hex'); }
function signedPayload(c: ClaimedArrivalReceiptV1): Buffer {
  if (!c || c.protocol !== PROTOCOL || c.status !== 'claim_committed')
    refuse('untrusted_claim_receipt');
  const memberId = uuid(c.memberId);
  const arrivalId = uuid(c.arrivalId);
  const manuscriptId = uuid(c.manuscriptId);
  const claimId = uuid(c.claimId);
  const pendingGeneration = validGeneration(c.pendingGeneration);
  const manuscriptGeneration = validGeneration(c.manuscriptGeneration);
  const claimEpoch = validGeneration(c.claimEpoch);
  if (claimEpoch < pendingGeneration || claimEpoch < manuscriptGeneration)
    refuse('invalid_claim_generation');
  if (c.sourceKind !== 'artifact_extraction' && c.sourceKind !== 'member_supplied_text')
    refuse('invalid_claim_source_kind');
  if (typeof c.sourceTextDigest !== 'string' || !SHA256.test(c.sourceTextDigest) ||
      (c.originalDigest !== null && (typeof c.originalDigest !== 'string' || !SHA256.test(c.originalDigest))))
    refuse('invalid_claim_source_digest');
  if (c.sourceKind === 'artifact_extraction' && !c.originalDigest)
    refuse('invalid_claim_source_digest');
  if (c.sourceKind === 'member_supplied_text' && c.originalDigest !== null)
    refuse('invalid_claim_source_digest');
  return Buffer.from(JSON.stringify([PROTOCOL,'claim_committed',claimId,memberId,arrivalId,
    manuscriptId,pendingGeneration,manuscriptGeneration,claimEpoch,c.sourceKind,
    c.sourceTextDigest,c.originalDigest]),'utf8');
}

export function canonicalClaimedArrivalPayload(c: ClaimedArrivalReceiptV1): Buffer {
  return signedPayload(c);
}

/**
 * The validated receipt must be minted AFTER the database transaction commits.
 * trustedClaimEpoch is a separate witness, not copied from the archive.
 */
export function prepareClaimedArrivalRewrap(input: {
  pendingAuthority: PendingArrivalAuthorityV1;
  pendingEnvelope: PendingArrivalEnvelopeV1;
  pendingKey: WorkEncryptionKey;
  workKey: WorkEncryptionKey;
  signedClaim: SignedClaimedArrivalV1 | null;
  trustedClaimSigner: KeyObject | null;
  trustedClaimEpoch: number | null;
}): HeldPreparedClaimV1 {
  const { signedClaim, trustedClaimSigner, trustedClaimEpoch } = input;
  if (!signedClaim || !trustedClaimSigner || trustedClaimEpoch === null)
    refuse('missing_independent_claim_authority');
  const independent = validGeneration(trustedClaimEpoch);
  const canonical = signedPayload(signedClaim.claim);
  if (signedClaim.claim.claimEpoch < independent)
    refuse('stale_claim_commit_epoch');
  if (trustedClaimSigner.asymmetricKeyType !== 'ed25519')
    refuse('invalid_claim_signer');
  const signature = signedClaim.signature;
  if (typeof signature !== 'string' || !/^[A-Za-z0-9+/]{86}==$/.test(signature))
    refuse('invalid_claim_signature');
  const decoded = Buffer.from(signature,'base64');
  if (decoded.length !== 64 || decoded.toString('base64') !== signature ||
      !verify(null,canonical,trustedClaimSigner,decoded))
    refuse('claim_signature_invalid');
  const claim = signedClaim.claim;
  if (claim.memberId.toLowerCase() !== input.pendingAuthority.memberId.toLowerCase() ||
      claim.arrivalId.toLowerCase() !== input.pendingAuthority.arrivalId.toLowerCase() ||
      claim.pendingGeneration !== input.pendingAuthority.generation)
    refuse('claim_pending_identity_mismatch');
  if (!UUID.test(input.pendingKey.keyId) || !UUID.test(input.workKey.keyId) ||
      input.pendingKey.keyId.toLowerCase() === input.workKey.keyId.toLowerCase() ||
      !Buffer.isBuffer(input.pendingKey.keyBytes) || input.pendingKey.keyBytes.length !== 32 ||
      !Buffer.isBuffer(input.workKey.keyBytes) || input.workKey.keyBytes.length !== 32 ||
      timingSafeEqual(input.pendingKey.keyBytes, input.workKey.keyBytes))
    refuse('pending_key_must_not_be_work_key');
  const original = openPendingArrival(input.pendingAuthority,input.pendingEnvelope,input.pendingKey);
  if (original.kind !== claim.sourceKind ||
      digest(original.sourceText) !== claim.sourceTextDigest ||
      (original.originalBytes ? digest(original.originalBytes) : null) !== claim.originalDigest)
    refuse('claim_source_bytes_differ');
  const records = [{
    field:'manuscript_source_arrivals.source_text',recordId:claim.arrivalId,
    value:original.sourceText,
  }];
  if (original.originalBytes) records.push({
    field:'original_source.bytes',recordId:claim.arrivalId,
    value:original.originalBytes,
  });
  // Canonical backup subject is the owned MANUSCRIPT ID, never inferred
  // from a possibly multiply-linked living_works declaration.
  const sealedWork=sealWorkSnapshot({
    memberId:claim.memberId,workId:claim.manuscriptId,
    generation:claim.manuscriptGeneration,
  },records,input.workKey);
  return {destinationManuscriptId:claim.manuscriptId,sealedWork,
    pendingKeyRetirement:'REQUIRED_NOT_WITNESSED',
    pendingFileErasure:original.originalBytes ? 'REQUIRED_NOT_WITNESSED' : 'NOT_APPLICABLE_PASTE',
    metadataCoverage:'ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED',
    transitionStatus:'PREPARED_ONLY_NOT_PERSISTED'};
}
