/**
 * R11 ISOLATED CANDIDATE ONLY: independently verifiable restore stop-rule.
 * A signature alone CANNOT prevent signed older-checkpoint replay. The caller
 * MUST obtain a trusted minimum generation from an authority OUTSIDE the
 * backup/restore media. There is deliberately no default/fallback.
 */
import { verify, type KeyObject } from 'node:crypto';
import { WorkRecoveryRefusal } from './workEnvelopeV1';

const PROTOCOL = 'soullab.ws.deletion-highwater.v1' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type StopCode = 'invalid_deletion_barrier' | 'untrusted_deletion_checkpoint' |
  'stale_deletion_checkpoint' | 'deleted_work_refused' |
  'deleted_key_refused' | 'snapshot_ahead_of_checkpoint' | 'deletion_barrier_signature_invalid';

export type DeletionHighwaterV1 = {
  protocol: typeof PROTOCOL;
  stream: 'writers-studio-beta';
  generation: number;
  revokedWorks: string[];
  revokedKeyIds: string[];
};
export type SignedDeletionHighwaterV1 = {
  checkpoint: DeletionHighwaterV1;
  signature: string;
};
export type RestoreRequest = {
  workId: string;
  keyId: string;
  snapshotGeneration: number;
};
/** Number from an independent verified antirollback register, never an archive field. */
export type IndependentGenerationWitness = {
  minimumGeneration: number;
};

function reject(code: StopCode): never { throw new WorkRecoveryRefusal(code); }
function checkedGeneration(x: unknown): number {
  if (typeof x !== 'number' || !Number.isSafeInteger(x) || x < 1)
    reject('invalid_deletion_barrier');
  return x;
}
function checkedUuids(x: unknown): string[] {
  if (!Array.isArray(x) || x.length > 100000 || x.some(v => typeof v !== 'string' || !UUID.test(v)))
    reject('invalid_deletion_barrier');
  const normalized = (x as string[]).map(v => v.toLowerCase());
  if (new Set(normalized).size !== normalized.length || normalized.join(',') !== [...normalized].sort().join(','))
    reject('invalid_deletion_barrier');
  return normalized;
}
export function canonicalDeletionPayload(checkpoint: DeletionHighwaterV1): Buffer {
  if (!checkpoint || checkpoint.protocol !== PROTOCOL || checkpoint.stream !== 'writers-studio-beta')
    reject('invalid_deletion_barrier');
  const generation = checkedGeneration(checkpoint.generation);
  const revokedWorks = checkedUuids(checkpoint.revokedWorks);
  const revokedKeyIds = checkedUuids(checkpoint.revokedKeyIds);
  return Buffer.from(JSON.stringify([PROTOCOL, checkpoint.stream, generation, revokedWorks, revokedKeyIds]), 'utf8');
}

/**
 * Must be called BEFORE any Work decryption or restore. The public key and
 * independently witnessed generation are injected from a reviewed authority.
 * Neither is trusted if recovered from the same old archive.
 */
export function requireCurrentRestoreAuthorization(input: {
  request: RestoreRequest;
  signed: SignedDeletionHighwaterV1 | null;
  trustedSigner: KeyObject | null;
  independent: IndependentGenerationWitness | null;
}): void {
  const { request, signed, trustedSigner, independent } = input;
  if (!signed || !trustedSigner || !independent) reject('untrusted_deletion_checkpoint');
  if (!UUID.test(request?.workId || '') || !UUID.test(request?.keyId || ''))
    reject('invalid_deletion_barrier');
  checkedGeneration(request.snapshotGeneration);
  const floor = checkedGeneration(independent.minimumGeneration);
  let data: Buffer;
  try { data = canonicalDeletionPayload(signed.checkpoint); }
  catch { reject('invalid_deletion_barrier'); }
  if (typeof signed.signature !== 'string' ||
      !/^[A-Za-z0-9+/]{86}==$/.test(signed.signature))
    reject('invalid_deletion_barrier');
  const signature = Buffer.from(signed.signature, 'base64');
  if (signature.length !== 64 || signature.toString('base64') !== signed.signature)
    reject('invalid_deletion_barrier');
  try {
    if (trustedSigner.asymmetricKeyType !== 'ed25519' ||
        !verify(null, data, trustedSigner, signature)) reject('deletion_barrier_signature_invalid');
  } catch (err) {
    if (err instanceof WorkRecoveryRefusal) throw err;
    reject('deletion_barrier_signature_invalid');
  }
  if (signed.checkpoint.generation < floor) reject('stale_deletion_checkpoint');
  if (request.snapshotGeneration > signed.checkpoint.generation)
    reject('snapshot_ahead_of_checkpoint');
  if (signed.checkpoint.revokedWorks.includes(request.workId.toLowerCase()))
    reject('deleted_work_refused');
  if (signed.checkpoint.revokedKeyIds.includes(request.keyId.toLowerCase()))
    reject('deleted_key_refused');
}
