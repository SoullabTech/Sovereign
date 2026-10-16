/**
 * R23 isolated actual repository DB + durable vault encrypted writing history.
 * NO ROUTE, migration, or independently governed key source is installed.
 * Do not expose to real members. The structurally asserted subject is only
 * adequate for fictional fixture testing until R17 is genuinely bound to it.
 */
import { createHash, randomUUID, type KeyObject } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import { writeDurableVaultBytes, readVaultBytes } from '@/lib/storage/fileVault';
import {
  sealWorkSnapshot, openWorkSnapshot,
  WorkRecoveryRefusal, type WorkRecord, type WorkEncryptionKey,
  type SealedWorkV1,
} from './workEnvelopeV1';
import {
  requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1, type IndependentGenerationWitness,
} from './deletionBarrierV1';
import type { HeldStorageSubjectR16 } from './heldPairedStoreR16';

export const R23_REAL_WRITER_HISTORY_ENABLED = false as const;
const fixtureOnly = () => {
  if(process.env.R23_VAULT_HISTORY_FIXTURE !== 'fictional-only')
    refuse('r23_live_writer_storage_disabled');
};
export const R23_HISTORY_NAMESPACE = 'ws-beta-r23-held-history' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA = /^[0-9a-f]{64}$/;
const STATE = 'held_only' as const;
const digest = (v:Buffer)=>createHash('sha256').update(v).digest('hex');
const refuse = (reason:string):never => {throw new WorkRecoveryRefusal(reason);};
function acceptedId(v:string):string {
  if(typeof v!=='string'||!UUID.test(v)) refuse('r23_invalid_identity');
  return v.toLowerCase();
}
function subjectMember(subject:HeldStorageSubjectR16):string {
  if (!subject || subject.assertedBy!=='server_verified_member_session')
    refuse('r23_server_session_required');
  return acceptedId(subject.memberId);
}
function validGeneration(v:number):number {
  if (!Number.isSafeInteger(v) || v<1) refuse('r23_invalid_generation');
  return v;
}
/**
 * These are supplied by a future separately governed, nonrollbackable key
 * service, never from request headers, POST bodies or the local SQL/backup.
 * Fictional signer only in the isolated physical test.
 */
export type TrustedWriterCustodyR23 = {
  key: WorkEncryptionKey;
  signedDeletion: SignedDeletionHighwaterV1 | null;
  trustedSigner: KeyObject | null;
  independent: IndependentGenerationWitness | null;
};
type Stored = {
  id:string; member_id:string; manuscript_id:string;work_generation:number|string;
  key_id:string;cipher_ref:string;cipher_sha256:string;previous_sha256:string|null;state:string;
};
export type HeldHistoryR23 = {
  id:string;memberId:string;manuscriptId:string;generation:number;
  keyId:string;cipherRef:string;cipherSHA256:string;previousSHA256:string|null;state:typeof STATE;
};
function verifiedRow(row:Stored):HeldHistoryR23 {
  if(!row || row.state!==STATE || !SHA.test(row.cipher_sha256) ||
    (row.previous_sha256!==null && !SHA.test(row.previous_sha256)))
    refuse('r23_invalid_persisted_manifest');
  const id=acceptedId(row.id),memberId=acceptedId(row.member_id),
    manuscriptId=acceptedId(row.manuscript_id),keyId=acceptedId(row.key_id);
  if (!new RegExp('^'+R23_HISTORY_NAMESPACE+'/[0-9a-f-]{36}\\.enc$').test(row.cipher_ref))
    refuse('r23_invalid_cipher_ref');
  const generation=validGeneration(Number(row.work_generation));
  return {id,memberId,manuscriptId,generation,keyId,
    cipherRef:row.cipher_ref,cipherSHA256:row.cipher_sha256,previousSHA256:row.previous_sha256,state:STATE};
}
function authorityFor(context:{memberId:string;manuscriptId:string;generation:number},
  authority:TrustedWriterCustodyR23):void {
  if (!authority || !authority.key || !authority.signedDeletion ||
    !authority.trustedSigner || !authority.independent)
    refuse('r23_external_custody_required');
  requireCurrentRestoreAuthorization({
    request: {
      workId:context.manuscriptId,
      keyId:authority.key.keyId,
      snapshotGeneration:context.generation,
    },
    signed:authority.signedDeletion,
    trustedSigner:authority.trustedSigner,
    independent:authority.independent,
  });
}
/**
 * Encrypted snapshot of selected author-owned records (includes
 * old draft revisions). Content is AES-GCM sealed IN PROCESS before any
 * file-vault or database request. SQL receives only IDs, digest and path.
 *
 * Real app routes remain unchanged and still use legacy ordinary SQL:
 * calling this in a fixture does NOT migrate or protect those routes.
 */
export async function persistHeldHistoryR23(input:{
  subject:HeldStorageSubjectR16;
  manuscriptId:string;
  generation:number;
  records:readonly WorkRecord[];
  authority:TrustedWriterCustodyR23;
}):Promise<HeldHistoryR23>{
  fixtureOnly();
  const memberId=subjectMember(input.subject);
  const manuscriptId=acceptedId(input.manuscriptId);
  const generation=validGeneration(input.generation);
  const context={memberId,workId:manuscriptId,generation};
  authorityFor({memberId,manuscriptId,generation},input.authority);
  // Ownership checked BEFORE file publication and again in the DB transaction.
  const preflight=await query<{id:string}>(
    'SELECT id FROM member_manuscripts WHERE id=$1 AND member_id=$2',
    [manuscriptId,memberId]);
  if(preflight.rows.length!==1)refuse('r23_writer_owner_refused');
  const sealed=sealWorkSnapshot(context,input.records,input.authority.key);
  const serialized=Buffer.from(JSON.stringify(sealed),'utf8');
  const sha=digest(serialized);
  const ref=await writeDurableVaultBytes(R23_HISTORY_NAMESPACE,
    randomUUID(),'enc',serialized);
  const reread=await readVaultBytes(ref);
  if(digest(reread)!==sha || !reread.equals(serialized))
    refuse('r23_cipher_readback_refused');

  // Immutable, append-only held generations. A failure after vault publish
  // may leave an encrypted orphan. Never silently erase that file.
  const inserted=await transaction(async(tx)=>{
    const owner=await tx.query<{id:string}>(
      'SELECT id FROM member_manuscripts WHERE id=$1 AND member_id=$2 FOR UPDATE',
      [manuscriptId,memberId]);
    if(owner.rows.length!==1)refuse('r23_owner_changed_during_write');
    const prior=await tx.query<Stored>(`
      SELECT * FROM writers_studio_r23_held_history
      WHERE manuscript_id=$1 ORDER BY work_generation DESC LIMIT 1
    `,[manuscriptId]);
    const last=prior.rows[0];
    if(generation !== (last?Number(last.work_generation)+1:1))
      refuse('r23_stale_generation');
    if(last)verifiedRow(last);
    const saved=await tx.query<Stored>(
      `INSERT INTO writers_studio_r23_held_history
         (id,member_id,manuscript_id,work_generation,key_id,cipher_ref,cipher_sha256,previous_sha256,state)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [randomUUID(),memberId,manuscriptId,generation,input.authority.key.keyId,
       ref,sha,last?.cipher_sha256??null,STATE]);
    if(saved.rows.length!==1)refuse('r23_manifest_insert_refused');
    return saved.rows[0];
  });
  return verifiedRow(inserted);
}
export async function readHeldHistoryR23(input:{
  subject:HeldStorageSubjectR16; manuscriptId:string;generation:number;
  authority:TrustedWriterCustodyR23;
}):Promise<{manifest:HeldHistoryR23;records:WorkRecord[]}>{
  fixtureOnly();
  const memberId=subjectMember(input.subject);
  const manuscriptId=acceptedId(input.manuscriptId);
  const generation=validGeneration(input.generation);
  authorityFor({memberId,manuscriptId,generation},input.authority);
  const found=await query<Stored>(
    `SELECT h.* FROM writers_studio_r23_held_history h
      JOIN member_manuscripts m ON m.id=h.manuscript_id
        AND m.member_id=h.member_id
      WHERE h.manuscript_id=$1 AND h.member_id=$2 AND h.work_generation=$3
        AND h.state=$4`,
    [manuscriptId,memberId,generation,STATE]);
  if(found.rows.length!==1)refuse('r23_writer_history_not_found');
  const manifest=verifiedRow(found.rows[0]);
  if(generation===1 && manifest.previousSHA256!==null)
    refuse('r23_unexpected_history_predecessor');
  if(generation>1) {
    const previous=await query<Stored>(`
      SELECT h.* FROM writers_studio_r23_held_history h
      JOIN member_manuscripts m ON m.id=h.manuscript_id AND m.member_id=h.member_id
      WHERE h.manuscript_id=$1 AND h.member_id=$2 AND h.work_generation=$3
    `,[manuscriptId,memberId,generation-1]);
    if(previous.rows.length!==1 ||
       verifiedRow(previous.rows[0]).cipherSHA256!==manifest.previousSHA256)
      refuse('r23_broken_history_chain');
  }
  if(manifest.keyId!==input.authority.key.keyId.toLowerCase())
    refuse('r23_wrong_work_key');
  const bytes=await readVaultBytes(manifest.cipherRef);
  if(digest(bytes)!==manifest.cipherSHA256)
    refuse('r23_ciphertext_tampered');
  let sealed:SealedWorkV1 | undefined;
  try{sealed=JSON.parse(bytes.toString('utf8'));}
  catch{refuse('r23_ciphertext_invalid_json');}
  if (!sealed) throw new WorkRecoveryRefusal('r23_ciphertext_invalid_payload');
  const records=openWorkSnapshot(
    {memberId,workId:manuscriptId,generation},sealed,input.authority.key);
  return {manifest,records};
}
