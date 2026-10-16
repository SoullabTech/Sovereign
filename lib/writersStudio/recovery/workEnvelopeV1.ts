/**
 * R11 ISOLATED CANDIDATE ONLY. No public persistence or backup reader is wired here.
 * Per-Work data protection requires independent key custody and a nonrollbackable
 * deletion barrier; this module cannot certify either of those by itself.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const PROTOCOL = 'soullab.ws.work-recovery.v1' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BYTES = 16 * 1024 * 1024;

const DATA_FIELDS = new Set([
  'manuscript_draft_sections.text',
  'manuscript_keeps.verbatim_text',
  'manuscript_revision_authorizations.expected_text',
  'manuscript_revision_offers.proposed_text',
  'manuscript_sections.body',
  'manuscript_source_arrivals.source_text',
  'manuscript_working_drafts.content',
  'proposal_chains.expected_text',
  'working_draft_revisions.content',
  'working_draft_revisions.note',
  'original_source.bytes',
]);
export const R11_CLASSIFIED_FIELDS = Object.freeze([...DATA_FIELDS].sort());

export type WorkRecoveryAuthority = {
  memberId: string;
  workId: string;
  generation: number;
};
export type WorkRecord = { field: string; recordId: string; value: Buffer };
export type WorkEncryptionKey = {
  keyId: string; // Random opaque UUID; key material is NOT stored with the backup.
  keyBytes: Buffer; // Injected by the separately governed Work-key custodian.
};
export type SealedWorkV1 = {
  protocol: typeof PROTOCOL;
  keyId: string;
  iv: string;
  tag: string;
  ciphertext: string;
};

export class WorkRecoveryRefusal extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'WorkRecoveryRefusal';
  }
}
function refuse(code: string): never { throw new WorkRecoveryRefusal(code); }
function uuid(value: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) refuse('invalid_uuid');
  return value.toLowerCase();
}
function acceptedContext(context: WorkRecoveryAuthority): WorkRecoveryAuthority {
  if (!context) refuse('missing_work_authority');
  const memberId = uuid(context.memberId);
  const workId = uuid(context.workId);
  if (!Number.isSafeInteger(context.generation) || context.generation < 1) refuse('invalid_generation');
  return { memberId, workId, generation: context.generation };
}
function acceptedKey(key: WorkEncryptionKey): void {
  if (!key || !UUID.test(key.keyId)) refuse('invalid_key_id');
  if (!Buffer.isBuffer(key.keyBytes) || key.keyBytes.length !== 32) refuse('invalid_work_key');
}
function decodeB64(s: unknown, min: number, max: number): Buffer {
  if (typeof s !== 'string') refuse('invalid_ciphertext_encoding');
  if (s === '' && min === 0) return Buffer.alloc(0);
  if (!s || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))
    refuse('invalid_ciphertext_encoding');
  const b = Buffer.from(s, 'base64');
  if (b.length < min || b.length > max || b.toString('base64') !== s) refuse('invalid_ciphertext_encoding');
  return b;
}
function aad(context: WorkRecoveryAuthority, keyId: string): Buffer {
  return Buffer.from(JSON.stringify([PROTOCOL, keyId.toLowerCase(),
    context.memberId, context.workId, context.generation]), 'utf8');
}
function pack(records: readonly WorkRecord[]): Buffer {
  if (!Array.isArray(records) || records.length === 0 || records.length > 20000) refuse('invalid_work_records');
  const ids = new Set<string>();
  const entries = records.map(record => {
    if (!record || !DATA_FIELDS.has(record.field)) refuse('unreviewed_content_field');
    if (!UUID.test(record.recordId)) refuse('invalid_record_id');
    if (!Buffer.isBuffer(record.value)) refuse('invalid_record_bytes');
    const id = record.field + ':' + record.recordId.toLowerCase();
    if (ids.has(id)) refuse('duplicate_source_record');
    ids.add(id);
    return { field: record.field, recordId: record.recordId.toLowerCase(), data: record.value.toString('base64') };
  });
  const packed = Buffer.from(JSON.stringify(entries), 'utf8');
  if (packed.length > MAX_BYTES) refuse('work_snapshot_too_large');
  return packed;
}

/** No prose, author identifiers, filenames or revision notes outside ciphertext. */
export function sealWorkSnapshot(contextInput: WorkRecoveryAuthority,
  records: readonly WorkRecord[], key: WorkEncryptionKey): SealedWorkV1 {
  const context = acceptedContext(contextInput);
  acceptedKey(key);
  const plaintext = pack(records);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key.keyBytes, iv);
  cipher.setAAD(aad(context, key.keyId));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { protocol: PROTOCOL, keyId: key.keyId.toLowerCase(), iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') };
}

/** Caller must verify owner/work identity and deletion authority outside the backup. */
export function openWorkSnapshot(contextInput: WorkRecoveryAuthority,
  sealed: SealedWorkV1, key: WorkEncryptionKey): WorkRecord[] {
  const context = acceptedContext(contextInput);
  acceptedKey(key);
  if (!sealed || sealed.protocol !== PROTOCOL) refuse('unsupported_work_envelope');
  if (sealed.keyId !== key.keyId.toLowerCase()) refuse('wrong_work_key_id');
  const iv = decodeB64(sealed.iv, 12, 12);
  const tag = decodeB64(sealed.tag, 16, 16);
  const encrypted = decodeB64(sealed.ciphertext, 1, MAX_BYTES);
  let plain: Buffer;
  try {
    const decoder = createDecipheriv('aes-256-gcm', key.keyBytes, iv);
    decoder.setAAD(aad(context, key.keyId));
    decoder.setAuthTag(tag);
    plain = Buffer.concat([decoder.update(encrypted), decoder.final()]);
  } catch {
    refuse('work_envelope_authentication_failed');
  }
  let rows: Array<{ field: string; recordId: string; data: string }>;
  try { rows = JSON.parse(plain.toString('utf8')); }
  catch { refuse('invalid_work_envelope_payload'); }
  if (!Array.isArray(rows)) refuse('invalid_work_envelope_payload');
  const result = rows.map(row => ({
    field: row.field, recordId: row.recordId, value: decodeB64(row.data, 0, MAX_BYTES),
  }));
  pack(result); // Revalidate duplicate/unclassified rows after authenticated decryption.
  return result;
}
