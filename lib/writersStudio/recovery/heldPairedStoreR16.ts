/**
 * R16 HELD — actual repository-level DB + durable-vault storage adapter.
 *
 * This module uses the existing PostgreSQL transaction and immutable
 * writeDurableVaultBytes/readVaultBytes implementations; it has NO public route
 * and is not imported by active Writer's Studio workflow or deployed beta.
 *
 * IMPORTANT: The caller's verified member/session and independent signers MUST
 * be established by a separately reviewed server authorization boundary.
 * This candidate is ONLY invoked in tests with fictional members/signers.
 */
import { randomUUID, createHash } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import { writeDurableVaultBytes, readVaultBytes } from '@/lib/storage/fileVault';
import {
  beginHeldPairedTransferV2,
  type PairedTransferClaimAuthoritiesV2, type PairedTransferJournalV2,
} from './pairedTransferJournalV2';
import {
  type PreparedPairedOriginalV2, type PairedOriginalPackageV2,
} from './pairedOriginalCustodyV2';
import { WorkRecoveryRefusal, type WorkEncryptionKey } from './workEnvelopeV1';

export const R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED = false as const;
export const R16_PAIRED_STORAGE_NAMESPACE = 'ws-beta-r16-held-ciphertext' as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA = /^[0-9a-f]{64}$/;
const PAIR_PROTOCOL = 'soullab.ws.paired-original.v2';
const STATE = 'held_encrypted_pair_only' as const;

/** A value obtained from the server's session verifier, NEVER a client claim. */
export type HeldStorageSubjectR16 = {
  memberId: string;
  assertedBy: 'server_verified_member_session';
};
export type HeldPairedManifestR16 = {
  claimId: string;
  memberId: string;
  arrivalId: string;
  manuscriptId: string;
  pendingKeyId: string;
  workKeyId: string;
  claimEpoch: number;
  generation: number;
  workRef: string;
  provenanceRef: string;
  workDigest: string;
  provenanceDigest: string;
  pairDigest: string;
  state: typeof STATE;
};
type StoredRow = {
  claim_id:string;member_id:string;arrival_id:string;manuscript_id:string;
  pending_key_id:string;work_key_id:string;claim_epoch:number|string;
  work_generation:number|string;work_ref:string;provenance_ref:string;
  work_digest:string;provenance_digest:string;pair_digest:string;state:string;
};
function refuse(code: string): never {
  throw new WorkRecoveryRefusal(code);
}
function acceptedId(input: unknown): string {
  if (typeof input !== 'string' || !UUID.test(input)) refuse('r16_invalid_identity');
  return input.toLowerCase();
}
function hash(x: Buffer|string):string {
  return createHash('sha256').update(x).digest('hex');
}
function acceptedSubject(subject: HeldStorageSubjectR16): string {
  if (!subject || subject.assertedBy !== 'server_verified_member_session')
    refuse('r16_missing_server_session');
  return acceptedId(subject.memberId);
}
function verifiedManifest(row: StoredRow): HeldPairedManifestR16 {
  if (!row || row.state !== STATE) refuse('r16_invalid_persisted_state');
  const ids = {
    claimId:acceptedId(row.claim_id),
    memberId:acceptedId(row.member_id),
    arrivalId:acceptedId(row.arrival_id),
    manuscriptId:acceptedId(row.manuscript_id),
    pendingKeyId:acceptedId(row.pending_key_id),
    workKeyId:acceptedId(row.work_key_id),
  };
  const workDigest=row.work_digest;
  const provenanceDigest=row.provenance_digest;
  const pairDigest=row.pair_digest;
  if (!SHA.test(workDigest)||!SHA.test(provenanceDigest)||!SHA.test(pairDigest) ||
      pairDigest!==hash(JSON.stringify([PAIR_PROTOCOL,workDigest,provenanceDigest])))
    refuse('r16_invalid_persisted_digest');
  const claimEpoch=Number(row.claim_epoch),generation=Number(row.work_generation);
  if (!Number.isSafeInteger(claimEpoch) || claimEpoch<1 ||
      !Number.isSafeInteger(generation) || generation<1)
    refuse('r16_invalid_persisted_epoch');
  const pattern = /^ws-beta-r16-held-ciphertext\/[0-9a-f-]{36}\.enc$/;
  if (!pattern.test(row.work_ref)||!pattern.test(row.provenance_ref)||
      row.work_ref===row.provenance_ref)
    refuse('r16_invalid_ciphertext_reference');
  return {...ids,claimEpoch,generation,workRef:row.work_ref,
    provenanceRef:row.provenance_ref,workDigest,provenanceDigest,
    pairDigest,state:STATE};
}

/**
 * Controlled fixture path to qualify the ACTUAL repo PostgreSQL and file-vault
 * APIs together. This does not accept raw author writing: only already sealed,
 * signer-verified Work+provenance packages are ever sent to disk.
 *
 * Per-R16 contract, the pending original remains untouched. If DB insertion
 * fails after the encrypted files are durably published, both become HELD,
 * unidentified encrypted orphans for reconciliation, never auto-discarded.
 */
export async function persistHeldPairedCandidateR16(input: {
  subject: HeldStorageSubjectR16;
  prepared: PreparedPairedOriginalV2;
  pendingKeyId: string;
  workKey: WorkEncryptionKey;
  authorities: PairedTransferClaimAuthoritiesV2;
}): Promise<HeldPairedManifestR16> {
  const memberId=acceptedSubject(input.subject);
  // Cryptographic context, current independent deletion authority, private
  // original provenance and the exact Work+metadata pair are checked up front.
  const journal: PairedTransferJournalV2=beginHeldPairedTransferV2({
    prepared:input.prepared,pendingKeyId:input.pendingKeyId,
    workKey:input.workKey,authorities:input.authorities,
  });
  if (memberId!==journal.memberId || journal.phase!=='claim_committed' ||
      journal.revision!==0 || journal.custody!=='HELD_FICTIONAL_CANDIDATE_ONLY')
    refuse('r16_owner_or_source_journal_refused');
  const pack=input.prepared.package;
  const workBytes=Buffer.from(JSON.stringify(pack.work),'utf8');
  const provenanceBytes=Buffer.from(JSON.stringify(pack.provenance),'utf8');
  if (hash(workBytes)!==journal.workDigest ||
      hash(provenanceBytes)!==journal.provenanceDigest)
    refuse('r16_ciphertext_digest_mismatch');

  // Reject known foreign/unclaimed/duplicate pairs BEFORE touching the vault.
  // This reduces encrypted orphans but cannot eliminate a concurrent race;
  // the final SELECT FOR UPDATE inside the transaction remains authoritative.
  const preflight=await query<{arrival_id:string}>(
    `SELECT a.id AS arrival_id
       FROM manuscript_source_arrivals a
       JOIN member_manuscripts m
         ON m.id=a.manuscript_id AND m.member_id=a.member_id
      WHERE a.id=$1 AND a.member_id=$2 AND m.id=$3
        AND NOT EXISTS (
          SELECT 1 FROM writers_studio_r16_held_pairs existing
           WHERE existing.claim_id=$4 OR existing.arrival_id=a.id
        )`,
    [journal.arrivalId,memberId,journal.manuscriptId,journal.claimId],
  );
  if(preflight.rows.length!==1)
    refuse('r16_preflight_owner_or_duplicate_refused');

  // Immutable vault writes are intentionally outside SQL transactions.
  // Durable readback must PASS for BOTH, before recording custody in PostgreSQL.
  const workRef=await writeDurableVaultBytes(R16_PAIRED_STORAGE_NAMESPACE,
    randomUUID(),'enc',workBytes);
  const provenanceRef=await writeDurableVaultBytes(R16_PAIRED_STORAGE_NAMESPACE,
    randomUUID(),'enc',provenanceBytes);
  const savedWork=await readVaultBytes(workRef);
  const savedProvenance=await readVaultBytes(provenanceRef);
  if (!savedWork.equals(workBytes) || !savedProvenance.equals(provenanceBytes) ||
      hash(savedWork)!==journal.workDigest ||
      hash(savedProvenance)!==journal.provenanceDigest)
    refuse('r16_vault_readback_refused');

  // A scoped SQL owner join prevents a signed external token from attaching to
  // another member's manuscript. Both Source and manuscript are row-locked
  // before the manifest is inserted, with NO member text in SQL parameters.
  const inserted=await transaction(async tx=>{
    const owned=await tx.query<{ arrival_id:string }>(
      `SELECT a.id AS arrival_id
         FROM manuscript_source_arrivals a
         JOIN member_manuscripts m
           ON m.id=a.manuscript_id AND m.member_id=a.member_id
        WHERE a.id=$1 AND a.member_id=$2 AND m.id=$3
        FOR UPDATE OF a,m`,
      [journal.arrivalId,memberId,journal.manuscriptId],
    );
    if (owned.rows.length!==1) refuse('r16_database_owner_join_refused');
    const saved=await tx.query<StoredRow>(
      `INSERT INTO writers_studio_r16_held_pairs (
          claim_id,member_id,arrival_id,manuscript_id,pending_key_id,work_key_id,
          claim_epoch,work_generation,work_ref,provenance_ref,
          work_digest,provenance_digest,pair_digest,state)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *`,
      [journal.claimId,memberId,journal.arrivalId,journal.manuscriptId,
        journal.pendingKeyId,journal.workKeyId,journal.claimEpoch,
        journal.workGeneration,workRef,provenanceRef,journal.workDigest,
        journal.provenanceDigest,journal.pairDigest,STATE],
    );
    if (saved.rows.length!==1) refuse('r16_manifest_insert_refused');
    return saved.rows[0];
  });
  return verifiedManifest(inserted);
}

/**
 * Owner-scoped, sealed-only readback. The caller MUST supply current signed
 * deletion authority to openPairedOriginalV2 separately. An archived SQL row
 * never grants decryption by itself.
 */
export async function readHeldPairedCiphertextsR16(
  subject: HeldStorageSubjectR16,
  claimIdInput: string,
): Promise<{manifest: HeldPairedManifestR16; package: PairedOriginalPackageV2}> {
  const memberId=acceptedSubject(subject),claimId=acceptedId(claimIdInput);
  const found=await query<StoredRow>(
    `SELECT p.*
       FROM writers_studio_r16_held_pairs p
       JOIN manuscript_source_arrivals a
         ON a.id=p.arrival_id AND a.member_id=p.member_id
       JOIN member_manuscripts m
         ON m.id=p.manuscript_id AND m.member_id=p.member_id
      WHERE p.claim_id=$1 AND p.member_id=$2
        AND a.manuscript_id=m.id AND p.state=$3`,
    [claimId,memberId,STATE],
  );
  if(found.rows.length!==1) refuse('r16_scoped_pair_not_found');
  const manifest=verifiedManifest(found.rows[0]);
  const work=await readVaultBytes(manifest.workRef);
  const provenance=await readVaultBytes(manifest.provenanceRef);
  if(hash(work)!==manifest.workDigest || hash(provenance)!==manifest.provenanceDigest)
    refuse('r16_persisted_pair_readback_refused');
  let decodedWork: PairedOriginalPackageV2['work'];
  let decodedProvenance: PairedOriginalPackageV2['provenance'];
  try {
    decodedWork=JSON.parse(work.toString('utf8'));
    decodedProvenance=JSON.parse(provenance.toString('utf8'));
  } catch {
    refuse('r16_invalid_stored_ciphertext');
  }
  if(!decodedWork || typeof decodedWork!=='object' ||
     Object.keys(decodedWork).sort().join('|')!=='ciphertext|iv|keyId|protocol|tag' ||
     !decodedProvenance || typeof decodedProvenance!=='object' ||
     Object.keys(decodedProvenance).sort().join('|')!=='ciphertext|keyId|nonce|protocol|tag')
    refuse('r16_unreviewed_ciphertext_fields');
  return {
    manifest,
    package:{
      protocol:'soullab.ws.paired-original.v2',
      work:decodedWork,
      provenance:decodedProvenance,
      workDigest:manifest.workDigest,
      provenanceDigest:manifest.provenanceDigest,
      pairDigest:manifest.pairDigest,
    }
  };
}
