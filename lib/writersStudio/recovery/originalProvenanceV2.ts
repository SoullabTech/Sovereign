/**
 * R14 HELD: exact original-file provenance in an encrypted companion capsule.
 *
 * Nothing in this module signs a real member claim, grants backup admission,
 * retires a key, or touches database/storage. The signer/epoch MUST be provided
 * from a verified post-commit owner-authorized source, not a recovered archive.
 */
import { createHash, verify, type KeyObject } from 'node:crypto';
import type { ClaimedArrivalReceiptV1 } from './pendingClaimTransferV1';
import type { PendingSourceV1 } from './pendingArrivalEnvelopeV1';
import { WorkRecoveryRefusal } from './workEnvelopeV1';

export const R14_ORIGINAL_PROVENANCE_PROTOCOL = 'soullab.ws.original-provenance.v2' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA = /^[a-f0-9]{64}$/;
const SIG = /^[A-Za-z0-9+/]{86}==$/;
const MAX_FILENAME = 1024;
const MAX_METHOD = 160;

export type OriginalProvenanceV2 = {
  protocol: typeof R14_ORIGINAL_PROVENANCE_PROTOCOL;
  claimId: string;
  memberId: string;
  arrivalId: string;
  manuscriptId: string;
  receiptEpoch: number;
  sourceKind: 'artifact_extraction' | 'member_supplied_text';
  sourceTextSha256: string;
  sourceTextBytes: number;
  originalSha256: string | null;
  originalByteLength: number | null;
  originalFilename: string | null;
  mimeType: string | null;
  extractionMethod: string;
  extractorVersion: string;
};
export type SignedOriginalProvenanceV2 = {
  provenance: OriginalProvenanceV2;
  signature: string;
};

const REQUIRED = [
  'arrivalId','claimId','extractionMethod','extractorVersion','manuscriptId',
  'memberId','mimeType','originalByteLength','originalFilename','originalSha256',
  'protocol','receiptEpoch','sourceKind','sourceTextBytes','sourceTextSha256',
].sort().join('|');

function refuse(code: string): never { throw new WorkRecoveryRefusal(code); }
function uuid(value: unknown): string {
  if (typeof value !== 'string' || !UUID.test(value)) refuse('invalid_provenance_identity');
  return value.toLowerCase();
}
function integer(value: unknown, minimum: number): number {
  if (!Number.isSafeInteger(value) || typeof value !== 'number' || value < minimum)
    refuse('invalid_provenance_length_or_epoch');
  return value;
}
function hex(value: unknown): string {
  if (typeof value !== 'string' || !SHA.test(value)) refuse('invalid_provenance_digest');
  return value;
}
function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value || value.length > max || value.includes('\0'))
    refuse('invalid_provenance_text');
  return value;
}
export function sha256Exact(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Strict canonical array prevents extra, unreviewed provenance fields from
 * being ignored while a signer appears to have approved the entire document.
 */
export function canonicalOriginalProvenanceV2(source: OriginalProvenanceV2): Buffer {
  if (!source || typeof source !== 'object' || Array.isArray(source) ||
      Object.keys(source).sort().join('|') !== REQUIRED ||
      source.protocol !== R14_ORIGINAL_PROVENANCE_PROTOCOL)
    refuse('unsupported_original_provenance');
  const claimId = uuid(source.claimId);
  const memberId = uuid(source.memberId);
  const arrivalId = uuid(source.arrivalId);
  const manuscriptId = uuid(source.manuscriptId);
  const epoch = integer(source.receiptEpoch, 1);
  if (source.sourceKind !== 'artifact_extraction' && source.sourceKind !== 'member_supplied_text')
    refuse('invalid_provenance_source_kind');
  const sourceDigest = hex(source.sourceTextSha256);
  const sourceBytes = integer(source.sourceTextBytes, 0);
  const method = text(source.extractionMethod, MAX_METHOD);
  const version = text(source.extractorVersion, MAX_METHOD);
  // The actual source-custody contract has an exact member-supplied
  // provenance pair. Never rebrand a paste as an extraction or vice versa.
  if (source.sourceKind === 'member_supplied_text' &&
      (method !== 'member-supplied' || version !== 'n/a'))
    refuse('invented_paste_extractor');
  if (source.sourceKind === 'artifact_extraction' && method === 'member-supplied')
    refuse('file_cannot_claim_member_paste');
  const file = source.sourceKind === 'artifact_extraction';
  let fileDigest: string | null = null;
  let fileSize: number | null = null;
  let filename: string | null = null;
  let mime: string | null = null;
  if (file) {
    fileDigest = hex(source.originalSha256);
    fileSize = integer(source.originalByteLength, 1);
    filename = text(source.originalFilename, MAX_FILENAME);
    if (source.mimeType !== null)
      mime = text(source.mimeType, MAX_METHOD);
  } else if (source.originalSha256 !== null || source.originalByteLength !== null ||
             source.originalFilename !== null || source.mimeType !== null) {
    refuse('pasted_source_invented_original');
  }
  return Buffer.from(JSON.stringify([
    R14_ORIGINAL_PROVENANCE_PROTOCOL,claimId,memberId,arrivalId,manuscriptId,epoch,
    source.sourceKind,sourceDigest,sourceBytes,fileDigest,fileSize,filename,mime,method,version,
  ]), 'utf8');
}

export function verifySignedOriginalProvenanceV2(input: {
  signed: SignedOriginalProvenanceV2 | null;
  trustedSigner: KeyObject | null;
  independentMinimumEpoch: number | null;
  committedClaim: ClaimedArrivalReceiptV1;
  decryptedPending: PendingSourceV1;
}): OriginalProvenanceV2 {
  const { signed, trustedSigner, independentMinimumEpoch, committedClaim, decryptedPending } = input;
  if (!signed || !trustedSigner || independentMinimumEpoch === null ||
      trustedSigner.asymmetricKeyType !== 'ed25519')
    refuse('missing_independent_provenance_authority');
  const floor = integer(independentMinimumEpoch, 1);
  const provenance = signed.provenance;
  const canonical = canonicalOriginalProvenanceV2(provenance);
  if (typeof signed.signature !== 'string' || !SIG.test(signed.signature))
    refuse('invalid_provenance_signature');
  const rawSignature = Buffer.from(signed.signature, 'base64');
  if (rawSignature.length !== 64 || rawSignature.toString('base64') !== signed.signature)
    refuse('invalid_provenance_signature');
  let passed: boolean;
  try { passed = verify(null, canonical, trustedSigner, rawSignature); }
  catch { refuse('provenance_signature_invalid'); }
  if (!passed) refuse('provenance_signature_invalid');
  if (provenance.receiptEpoch < floor ||
      provenance.receiptEpoch < committedClaim.claimEpoch)
    refuse('stale_provenance_receipt');
  if (provenance.claimId.toLowerCase() !== committedClaim.claimId.toLowerCase() ||
      provenance.memberId.toLowerCase() !== committedClaim.memberId.toLowerCase() ||
      provenance.arrivalId.toLowerCase() !== committedClaim.arrivalId.toLowerCase() ||
      provenance.manuscriptId.toLowerCase() !== committedClaim.manuscriptId.toLowerCase())
    refuse('provenance_claim_identity_mismatch');
  if (!decryptedPending || !Buffer.isBuffer(decryptedPending.sourceText))
    refuse('pending_source_unavailable');
  const original = decryptedPending.originalBytes;
  if (provenance.sourceKind !== committedClaim.sourceKind ||
      provenance.sourceKind !== decryptedPending.kind ||
      provenance.sourceTextSha256 !== committedClaim.sourceTextDigest ||
      provenance.sourceTextSha256 !== sha256Exact(decryptedPending.sourceText) ||
      provenance.sourceTextBytes !== decryptedPending.sourceText.length ||
      provenance.originalSha256 !== committedClaim.originalDigest ||
      provenance.originalSha256 !== (original ? sha256Exact(original) : null) ||
      provenance.originalByteLength !== (original ? original.length : null) ||
      provenance.originalFilename !== decryptedPending.originalFilename ||
      provenance.mimeType !== decryptedPending.mimeType)
    refuse('provenance_does_not_match_original');
  // Extraction method/version are claimed by the signer; the eventual signer
  // MUST derive these from server-side provenance columns in the committed DB.
  // A signature alone cannot prove that the issuing service did so.
  return provenance;
}
