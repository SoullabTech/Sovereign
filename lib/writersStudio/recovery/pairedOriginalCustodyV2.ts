/**
 * R14 HELD: cryptographically pair the R12 encrypted Work capsule with
 * independently signed original Source provenance (private filename, MIME,
 * extractor/version, byte hashes and lengths). No live writers or I/O here.
 *
 * This compatibility bridge cannot advance the R13 retirement journal:
 * that version requires metadataCoverage=NOT_CERTIFIED. A future reviewed
 * R14 journal/SQL service must explicitly bind BOTH ciphertext readback hashes.
 */
import {
  createCipheriv, createDecipheriv, createHash, randomBytes, verify, type KeyObject,
} from 'node:crypto';
import {
  openWorkSnapshot, WorkRecoveryRefusal, type WorkEncryptionKey,
  type SealedWorkV1, type WorkRecord,
} from './workEnvelopeV1';
import {
  prepareClaimedArrivalRewrap, canonicalClaimedArrivalPayload,
  type SignedClaimedArrivalV1, type ClaimedArrivalReceiptV1,
} from './pendingClaimTransferV1';
import {
  openPendingArrival, type PendingArrivalAuthorityV1,
  type PendingArrivalEnvelopeV1, type PendingSourceV1,
} from './pendingArrivalEnvelopeV1';
import {
  canonicalOriginalProvenanceV2, verifySignedOriginalProvenanceV2,
  type SignedOriginalProvenanceV2, type OriginalProvenanceV2,
} from './originalProvenanceV2';
import {
  requireCurrentRestoreAuthorization,
  type IndependentGenerationWitness, type SignedDeletionHighwaterV1,
} from './deletionBarrierV1';

const PAIR = 'soullab.ws.paired-original.v2' as const;
const META = 'soullab.ws.original-metadata-seal.v2' as const;
const SHA = /^[a-f0-9]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SIG = /^[A-Za-z0-9+/]{86}==$/;
const MAX_METADATA = 16000;

export const R14_REAL_MEMBER_ORIGINAL_CUSTODY_ENABLED = false as const;

export type SealedOriginMetadataV2 = {
  protocol: typeof META;
  keyId: string;
  nonce: string;
  tag: string;
  ciphertext: string;
};
export type PairedOriginalPackageV2 = {
  protocol: typeof PAIR;
  work: SealedWorkV1;
  provenance: SealedOriginMetadataV2;
  workDigest: string;
  provenanceDigest: string;
  pairDigest: string;
};
export type PreparedPairedOriginalV2 = {
  package: PairedOriginalPackageV2;
  transitionStatus: 'PREPARED_ONLY_NOT_PERSISTED';
  encryptedMetadataCoverage: 'FILENAME_MIME_EXTRACTOR_AND_HASHES_ENCRYPTED';
  pendingKeyRetirement: 'NOT_WITNESSED';
  pendingFileErasure: 'NOT_WITNESSED';
  sourceAndWorkBackupCensus: 'NOT_CERTIFIED';
};
export type RecoveredPairedOriginalV2 = {
  provenance: OriginalProvenanceV2;
  sourceText: Buffer;
  originalBytes: Buffer | null;
  workRecords: WorkRecord[];
};

function refuse(code: string): never { throw new WorkRecoveryRefusal(code); }
function hash(x: Buffer | string): string { return createHash('sha256').update(x).digest('hex'); }
function requireKey(key: WorkEncryptionKey): void {
  if (!key || !UUID.test(key.keyId) || !Buffer.isBuffer(key.keyBytes) || key.keyBytes.length !== 32)
    refuse('invalid_paired_work_key');
}
function decode(value: unknown, expected: number | null, max: number): Buffer {
  if (typeof value !== 'string' || !value ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
    refuse('invalid_paired_cipher_encoding');
  const bytes = Buffer.from(value,'base64');
  if ((expected !== null && bytes.length !== expected) || bytes.length > max ||
      bytes.toString('base64') !== value)
    refuse('invalid_paired_cipher_encoding');
  return bytes;
}
function manifestDigest(work: SealedWorkV1, metadata: SealedOriginMetadataV2): {
  workDigest: string; provenanceDigest: string; pairDigest: string;
} {
  const workDigest = hash(JSON.stringify(work));
  const provenanceDigest = hash(JSON.stringify(metadata));
  const pairDigest = hash(JSON.stringify([PAIR,workDigest,provenanceDigest]));
  return { workDigest,provenanceDigest,pairDigest };
}
function associatedData(
  claim: ClaimedArrivalReceiptV1, keyId: string, workDigest: string,
): Buffer {
  return Buffer.from(JSON.stringify([META,claim.claimId.toLowerCase(),
    claim.memberId.toLowerCase(),claim.arrivalId.toLowerCase(),
    claim.manuscriptId.toLowerCase(),claim.manuscriptGeneration,
    keyId.toLowerCase(),workDigest]),'utf8');
}
function verifySignedClaim(signed: SignedClaimedArrivalV1 | null,
  signer: KeyObject | null, minimumEpoch: number | null): ClaimedArrivalReceiptV1 {
  if (!signed || !signer || signer.asymmetricKeyType !== 'ed25519' ||
      minimumEpoch === null || !Number.isSafeInteger(minimumEpoch) || minimumEpoch < 1)
    refuse('missing_independent_claim_witness');
  const canonical=canonicalClaimedArrivalPayload(signed.claim);
  if (!SIG.test(signed.signature)) refuse('invalid_signed_claim');
  const signature=Buffer.from(signed.signature,'base64');
  if (signature.length !== 64 || signature.toString('base64') !== signed.signature ||
      !verify(null,canonical,signer,signature))
    refuse('invalid_signed_claim');
  if (signed.claim.claimEpoch < minimumEpoch)
    refuse('stale_claim_witness');
  return signed.claim;
}
function sealMetadata(
  signed: SignedOriginalProvenanceV2, claim: ClaimedArrivalReceiptV1,
  work: SealedWorkV1, key: WorkEncryptionKey,
): SealedOriginMetadataV2 {
  const plaintext=Buffer.from(JSON.stringify({
    protocol:META,
    signed,
  }), 'utf8');
  if (plaintext.length > MAX_METADATA) refuse('provenance_payload_too_large');
  const iv=randomBytes(12);
  const cipher=createCipheriv('aes-256-gcm',key.keyBytes,iv);
  cipher.setAAD(associatedData(claim,key.keyId,hash(JSON.stringify(work))));
  const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);
  return {protocol:META,keyId:key.keyId.toLowerCase(),
    nonce:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),
    ciphertext:ciphertext.toString('base64')};
}
function openMetadata(
  encrypted: SealedOriginMetadataV2, claim: ClaimedArrivalReceiptV1,
  work: SealedWorkV1, key: WorkEncryptionKey,
): SignedOriginalProvenanceV2 {
  if (!encrypted || encrypted.protocol !== META ||
      encrypted.keyId !== key.keyId.toLowerCase())
    refuse('unsupported_paired_provenance');
  const iv=decode(encrypted.nonce,12,12);
  const tag=decode(encrypted.tag,16,16);
  const cipherBytes=decode(encrypted.ciphertext,null,MAX_METADATA);
  let plaintext:Buffer;
  try {
    const decipher=createDecipheriv('aes-256-gcm',key.keyBytes,iv);
    decipher.setAAD(associatedData(claim,key.keyId,hash(JSON.stringify(work))));
    decipher.setAuthTag(tag);
    plaintext=Buffer.concat([decipher.update(cipherBytes),decipher.final()]);
  } catch { refuse('paired_provenance_authentication_failed'); }
  let parsed: Record<string,unknown>;
  try {parsed=JSON.parse(plaintext.toString('utf8'));}
  catch { refuse('invalid_paired_provenance_payload'); }
  if (!parsed || Array.isArray(parsed) ||
      Object.keys(parsed).sort().join('|') !== 'protocol|signed' ||
      parsed.protocol !== META)
    refuse('invalid_paired_provenance_payload');
  return parsed.signed as SignedOriginalProvenanceV2;
}

/** Pending and Work material stay held; this is a prepared paired capsule only. */
export function preparePairedOriginalV2(input: {
  pendingAuthority: PendingArrivalAuthorityV1;
  pendingEnvelope: PendingArrivalEnvelopeV1;
  pendingKey: WorkEncryptionKey;
  workKey: WorkEncryptionKey;
  signedClaim: SignedClaimedArrivalV1 | null;
  trustedClaimSigner: KeyObject | null;
  independentClaimMinimumEpoch: number | null;
  signedProvenance: SignedOriginalProvenanceV2 | null;
  trustedProvenanceSigner: KeyObject | null;
  independentProvenanceMinimumEpoch: number | null;
}): PreparedPairedOriginalV2 {
  const claim=verifySignedClaim(input.signedClaim,input.trustedClaimSigner,
    input.independentClaimMinimumEpoch);
  requireKey(input.workKey);
  const prepared=prepareClaimedArrivalRewrap({
    pendingAuthority:input.pendingAuthority,pendingEnvelope:input.pendingEnvelope,
    pendingKey:input.pendingKey,workKey:input.workKey,
    signedClaim:input.signedClaim,trustedClaimSigner:input.trustedClaimSigner,
    trustedClaimEpoch:input.independentClaimMinimumEpoch,
  });
  const decrypted=openPendingArrival(input.pendingAuthority,input.pendingEnvelope,input.pendingKey);
  verifySignedOriginalProvenanceV2({
    signed:input.signedProvenance,
    trustedSigner:input.trustedProvenanceSigner,
    independentMinimumEpoch:input.independentProvenanceMinimumEpoch,
    committedClaim:claim,decryptedPending:decrypted,
  });
  const encryptedMetadata=sealMetadata(input.signedProvenance!,claim,prepared.sealedWork,
    input.workKey);
  const hashes=manifestDigest(prepared.sealedWork,encryptedMetadata);
  return {
    package:{protocol:PAIR,work:prepared.sealedWork,provenance:encryptedMetadata,...hashes},
    transitionStatus:'PREPARED_ONLY_NOT_PERSISTED',
    encryptedMetadataCoverage:'FILENAME_MIME_EXTRACTOR_AND_HASHES_ENCRYPTED',
    pendingKeyRetirement:'NOT_WITNESSED',
    pendingFileErasure:'NOT_WITNESSED',
    sourceAndWorkBackupCensus:'NOT_CERTIFIED',
  };
}

/**
 * Restores only after independently verified claim and deletion authority.
 * Never infer trust from the archived companion, its signer, or its epoch.
 */
export function openPairedOriginalV2(input: {
  package: PairedOriginalPackageV2;
  workKey: WorkEncryptionKey;
  signedClaim: SignedClaimedArrivalV1 | null;
  trustedClaimSigner: KeyObject | null;
  independentClaimMinimumEpoch: number | null;
  trustedProvenanceSigner: KeyObject | null;
  independentProvenanceMinimumEpoch: number | null;
  signedDeletionHighwater: SignedDeletionHighwaterV1 | null;
  trustedDeletionSigner: KeyObject | null;
  independentDeletionGeneration: IndependentGenerationWitness | null;
}): RecoveredPairedOriginalV2 {
  requireKey(input.workKey);
  const claim=verifySignedClaim(input.signedClaim,input.trustedClaimSigner,
    input.independentClaimMinimumEpoch);
  // The independent, current erasure barrier is consulted BEFORE decrypting
  // either the original Source bytes or the member's private filename.
  requireCurrentRestoreAuthorization({
    request:{workId:claim.manuscriptId,keyId:input.workKey.keyId,
      snapshotGeneration:claim.manuscriptGeneration},
    signed:input.signedDeletionHighwater,
    trustedSigner:input.trustedDeletionSigner,
    independent:input.independentDeletionGeneration,
  });
  const pack=input.package;
  if (!pack || pack.protocol !== PAIR ||
      Object.keys(pack).sort().join('|') !==
        'pairDigest|protocol|provenance|provenanceDigest|work|workDigest')
    refuse('unsupported_paired_source_package');
  if (!pack.work || typeof pack.work !== 'object' ||
      Object.keys(pack.work).sort().join('|') !== 'ciphertext|iv|keyId|protocol|tag' ||
      !pack.provenance || typeof pack.provenance !== 'object' ||
      Object.keys(pack.provenance).sort().join('|') !== 'ciphertext|keyId|nonce|protocol|tag')
    refuse('unreviewed_plaintext_envelope_field');
  if (!SHA.test(pack.workDigest) || !SHA.test(pack.provenanceDigest) ||
      !SHA.test(pack.pairDigest))
    refuse('invalid_paired_package_digest');
  const observed=manifestDigest(pack.work,pack.provenance);
  if (observed.workDigest !== pack.workDigest ||
      observed.provenanceDigest !== pack.provenanceDigest ||
      observed.pairDigest !== pack.pairDigest)
    refuse('paired_package_integrity_mismatch');
  const workRecords=openWorkSnapshot({
    memberId:claim.memberId,
    workId:claim.manuscriptId,
    generation:claim.manuscriptGeneration,
  },pack.work,input.workKey);
  const metadata=openMetadata(pack.provenance,claim,pack.work,input.workKey);
  // Select by exact arrival ID. Never conflate derived sections with an original.
  const originRows=workRecords.filter(r=>r.field==='manuscript_source_arrivals.source_text' &&
    r.recordId.toLowerCase()===claim.arrivalId.toLowerCase());
  const originals=workRecords.filter(r=>r.field==='original_source.bytes' &&
    r.recordId.toLowerCase()===claim.arrivalId.toLowerCase());
  if (originRows.length !== 1 || originals.length > 1 ||
      workRecords.some(r=>r.recordId.toLowerCase()!==claim.arrivalId.toLowerCase() ||
        !['manuscript_source_arrivals.source_text','original_source.bytes'].includes(r.field)))
    refuse('missing_or_unclassified_original_records');
  const sourceText=originRows[0].value;
  const originalBytes=originals.length?originals[0].value:null;
  // Filename/MIME are decrypted only after AEAD and signed provenance checks.
  // This witness is still not authority to destroy original backup data.
  const proposed=metadata?.provenance;
  if (!proposed) refuse('missing_signed_original_provenance');
  const verified=verifySignedOriginalProvenanceV2({
    signed:metadata,
    trustedSigner:input.trustedProvenanceSigner,
    independentMinimumEpoch:input.independentProvenanceMinimumEpoch,
    committedClaim:claim,
    decryptedPending:{
      kind:claim.sourceKind,sourceText,originalBytes,
      originalFilename:proposed.originalFilename,
      mimeType:proposed.mimeType,
    },
  });
  const fileShouldExist=claim.sourceKind==='artifact_extraction';
  if (fileShouldExist !== Boolean(originalBytes))
    refuse('original_artifact_count_mismatch');
  // An independent producer must still prove all other SQL, JSONB and replica
  // copies have been covered before treating this pair as a certified backup.
  return {provenance:verified,sourceText,originalBytes,workRecords};
}
