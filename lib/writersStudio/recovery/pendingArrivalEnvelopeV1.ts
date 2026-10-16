/**
 * R12 ISOLATED CANDIDATE. Pending arrivals do NOT have a Work/Manuscript ID.
 *
 * Cryptographic namespace: member + immutable Source-arrival ID + generation.
 * A pending key must never silently become the Work key. Claim, independent key
 * transition, file custody and rollback are NOT wired into live imports here.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { WorkRecoveryRefusal, type WorkEncryptionKey } from './workEnvelopeV1';

const PROTOCOL = 'soullab.ws.pending-arrival.v1' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PAYLOAD = 16 * 1024 * 1024;
type SourceKind = 'artifact_extraction' | 'member_supplied_text';

export type PendingArrivalAuthorityV1 = {
  memberId: string;
  arrivalId: string;
  generation: number;
};
export type PendingSourceV1 = {
  kind: SourceKind;
  sourceText: Buffer; // Exact bytes of extracted/pasted UTF-8, never normalized.
  originalBytes: Buffer | null;
  originalFilename: string | null;
  mimeType: string | null;
};
export type PendingArrivalEnvelopeV1 = {
  protocol: typeof PROTOCOL;
  keyId: string;
  iv: string;
  tag: string;
  ciphertext: string;
};

function refuse(code: string): never { throw new WorkRecoveryRefusal(code); }
function uuid(text: unknown): string {
  if (typeof text !== 'string' || !UUID.test(text)) refuse('invalid_pending_identity');
  return text.toLowerCase();
}
function context(c: PendingArrivalAuthorityV1): PendingArrivalAuthorityV1 {
  if (!c) refuse('invalid_pending_identity');
  const memberId = uuid(c.memberId);
  const arrivalId = uuid(c.arrivalId);
  if (!Number.isSafeInteger(c.generation) || c.generation < 1) refuse('invalid_pending_generation');
  return { memberId, arrivalId, generation: c.generation };
}
function approvedKey(key: WorkEncryptionKey): string {
  if (!key || !Buffer.isBuffer(key.keyBytes) || key.keyBytes.length !== 32)
    refuse('invalid_pending_key');
  return uuid(key.keyId);
}
function decode(value: unknown, min: number, max: number): Buffer {
  if (value === '' && min === 0) return Buffer.alloc(0);
  if (typeof value !== 'string' || !value ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
    refuse('invalid_pending_encoding');
  const bytes = Buffer.from(value, 'base64');
  if (bytes.length < min || bytes.length > max || bytes.toString('base64') !== value)
    refuse('invalid_pending_encoding');
  return bytes;
}
function digest(b: Buffer): string { return createHash('sha256').update(b).digest('hex'); }
function aad(c: PendingArrivalAuthorityV1, keyId: string): Buffer {
  return Buffer.from(JSON.stringify([PROTOCOL, keyId, c.memberId, c.arrivalId, c.generation]));
}
function content(source: PendingSourceV1): Buffer {
  if (!source || (source.kind !== 'artifact_extraction' && source.kind !== 'member_supplied_text'))
    refuse('invalid_pending_source_kind');
  if (!Buffer.isBuffer(source.sourceText) || source.sourceText.length > MAX_PAYLOAD)
    refuse('invalid_pending_source_text');
  const isFile = source.kind === 'artifact_extraction';
  if (isFile) {
    if (!Buffer.isBuffer(source.originalBytes) || source.originalBytes.length === 0)
      refuse('missing_pending_original_bytes');
    if (typeof source.originalFilename !== 'string' || !source.originalFilename ||
        source.originalFilename.length > 1024 || source.originalFilename.includes('\0'))
      refuse('invalid_pending_original_filename');
    if (source.mimeType !== null && (typeof source.mimeType !== 'string' || source.mimeType.length > 200))
      refuse('invalid_pending_mime');
  } else if (source.originalBytes !== null || source.originalFilename !== null || source.mimeType !== null) {
    refuse('invented_pending_file_provenance');
  }
  const sealed = Buffer.from(JSON.stringify({
    sourceKind: source.kind,
    sourceTextBase64: source.sourceText.toString('base64'),
    sourceTextSha256: digest(source.sourceText),
    artifactBase64: source.originalBytes?.toString('base64') ?? null,
    artifactSha256: source.originalBytes ? digest(source.originalBytes) : null,
    filename: source.originalFilename,
    mimeType: source.mimeType,
  }), 'utf8');
  if (sealed.length > MAX_PAYLOAD) refuse('pending_snapshot_too_large');
  return sealed;
}

/** Only these four opaque envelope properties and protocol may leave memory. */
export function sealPendingArrival(c: PendingArrivalAuthorityV1, source: PendingSourceV1,
  key: WorkEncryptionKey): PendingArrivalEnvelopeV1 {
  const ctx = context(c), keyId = approvedKey(key);
  const input = content(source);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key.keyBytes, iv);
  cipher.setAAD(aad(ctx,keyId));
  const ciphertext = Buffer.concat([cipher.update(input),cipher.final()]);
  return { protocol: PROTOCOL, keyId, iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') };
}
export function openPendingArrival(c: PendingArrivalAuthorityV1, envelope: PendingArrivalEnvelopeV1,
  key: WorkEncryptionKey): PendingSourceV1 {
  const ctx = context(c), keyId = approvedKey(key);
  if (!envelope || envelope.protocol !== PROTOCOL) refuse('unsupported_pending_envelope');
  if (envelope.keyId !== keyId) refuse('wrong_pending_key_id');
  const iv = decode(envelope.iv,12,12);
  const tag = decode(envelope.tag,16,16);
  const encrypted = decode(envelope.ciphertext,1,MAX_PAYLOAD);
  let clear: Buffer;
  try {
    const decipher = createDecipheriv('aes-256-gcm',key.keyBytes,iv);
    decipher.setAAD(aad(ctx,keyId));
    decipher.setAuthTag(tag);
    clear=Buffer.concat([decipher.update(encrypted),decipher.final()]);
  } catch { refuse('pending_authentication_failed'); }
  let record: Record<string,unknown>;
  try { record=JSON.parse(clear.toString('utf8')); }
  catch { refuse('invalid_pending_payload'); }
  if (!record || Array.isArray(record) || typeof record !== 'object' ||
      Object.keys(record).sort().join('|') !==
      ['artifactBase64','artifactSha256','filename','mimeType','sourceKind','sourceTextBase64','sourceTextSha256'].join('|'))
    refuse('invalid_pending_payload');
  const sourceText = decode(record.sourceTextBase64,0,MAX_PAYLOAD);
  const originalBytes = record.artifactBase64 === null ? null : decode(record.artifactBase64,1,MAX_PAYLOAD);
  if (typeof record.sourceTextSha256 !== 'string' || digest(sourceText) !== record.sourceTextSha256 ||
      (originalBytes ? digest(originalBytes) !== record.artifactSha256 : record.artifactSha256 !== null))
    refuse('pending_source_digest_mismatch');
  const source = { kind: record.sourceKind as SourceKind, sourceText, originalBytes,
    originalFilename: record.filename as string | null, mimeType: record.mimeType as string | null };
  content(source); // Reassert file-versus-paste provenance and exact byte caps.
  return source;
}
