/**
 * R11 HELD recovery integration contract. Source adapters must enumerate ALL
 * reconstructive records from the same snapshot generation before the
 * encrypted per-Work capsule can be admitted. A declared census is NOT proof
 * of completeness; physical SQL/Source, derivative, WAL and replica audits
 * remain mandatory and are not satisfied by these functions.
 */
import {
  openWorkSnapshot, sealWorkSnapshot, WorkRecoveryRefusal,
  R11_CLASSIFIED_FIELDS,
  type SealedWorkV1, type WorkEncryptionKey,
  type WorkRecord, type WorkRecoveryAuthority,
} from './workEnvelopeV1';
import {
  requireCurrentRestoreAuthorization,
  type IndependentGenerationWitness,
  type SignedDeletionHighwaterV1,
} from './deletionBarrierV1';
import type { KeyObject } from 'node:crypto';

export type CatalogField = {
  table: string;
  column: string;
  type: string;
};
export type SchemaAdmissionFinding = {
  disposition: 'HOLD_UNCERTIFIED_BACKUP';
  recognized: string[];
  missing: string[];
  unclassified: string[];
  derivedAndHistoricalStoresNotCertified: true;
};

export const R11_REAL_MEMBER_BACKUP_ADMISSION = 'CLOSED' as const;
const DATABASE_FIELDS = new Set(R11_CLASSIFIED_FIELDS.filter(x => x !== 'original_source.bytes'));
const countFields = new Set(R11_CLASSIFIED_FIELDS);

/**
 * Broader schema reconnaissance is a minimum census, NOT proof that every
 * derived store, JSONB payload, file namespace or historical copy is covered.
 * Unknown fields are intentionally retained in the report for human review.
 */
export function inspectWriterSchema(catalog: readonly CatalogField[]): SchemaAdmissionFinding {
  if (!Array.isArray(catalog) || catalog.length === 0) throw new WorkRecoveryRefusal('schema_inventory_unavailable');
  const entries = new Set<string>();
  for (const field of catalog) {
    if (!field || typeof field.table !== 'string' || typeof field.column !== 'string' ||
        typeof field.type !== 'string' || !field.table || !field.column)
      throw new WorkRecoveryRefusal('invalid_schema_field');
    const id = field.table + '.' + field.column;
    if (entries.has(id)) throw new WorkRecoveryRefusal('duplicate_schema_field');
    entries.add(id);
  }
  const recognized = [...DATABASE_FIELDS].filter(x => entries.has(x)).sort();
  const missing = [...DATABASE_FIELDS].filter(x => !entries.has(x)).sort();
  const unclassified = [...entries].filter(x => !DATABASE_FIELDS.has(x)).sort();
  return { disposition: 'HOLD_UNCERTIFIED_BACKUP', recognized, missing, unclassified,
    derivedAndHistoricalStoresNotCertified: true };
}

export type DeclaredRecordCensus = {
  snapshotGeneration: number;
  counts: Readonly<Record<string, number>>;
};

/**
 * A field count of ZERO must be explicit, never inferred from an absent
 * table/row. This only checks an adapter's declaration against its emitted
 * records. A separate SQL snapshot witness must prove the declared counts.
 */
export function assertDeclaredRecordCoverage(
  records: readonly WorkRecord[], census: DeclaredRecordCensus, context: WorkRecoveryAuthority,
): void {
  if (!census || census.snapshotGeneration !== context.generation ||
      !Number.isSafeInteger(context.generation) || context.generation < 1)
    throw new WorkRecoveryRefusal('snapshot_census_generation_mismatch');
  const names = Object.keys(census.counts || {}).sort();
  if (names.length !== countFields.size || names.join('|') !== R11_CLASSIFIED_FIELDS.join('|'))
    throw new WorkRecoveryRefusal('incomplete_sensitive_field_census');
  const actual = new Map<string, number>();
  const observed = new Set<string>();
  for (const r of records) {
    if (!r || !countFields.has(r.field)) throw new WorkRecoveryRefusal('unreviewed_content_field');
    const id = r.field + '|' + r.recordId;
    if (observed.has(id)) throw new WorkRecoveryRefusal('duplicate_source_record');
    observed.add(id);
    actual.set(r.field, (actual.get(r.field) ?? 0) + 1);
  }
  for (const name of names) {
    const expected = census.counts[name];
    if (!Number.isSafeInteger(expected) || expected < 0 || (actual.get(name) ?? 0) !== expected)
      throw new WorkRecoveryRefusal('source_record_census_mismatch');
  }
}

export function sealDeclaredWorkCandidate(input: {
  authority: WorkRecoveryAuthority;
  records: readonly WorkRecord[];
  census: DeclaredRecordCensus;
  key: WorkEncryptionKey;
}): SealedWorkV1 {
  assertDeclaredRecordCoverage(input.records, input.census, input.authority);
  return sealWorkSnapshot(input.authority, input.records, input.key);
}

/**
 * Only this candidate-facing route verifies current independent deletion
 * authority BEFORE decrypting an older copy. The signer and trusted minimum
 * epoch must be obtained independently; archive-local copies are insufficient.
 */
export function restoreDeclaredWorkCandidate(input: {
  authority: WorkRecoveryAuthority;
  sealed: SealedWorkV1;
  census: DeclaredRecordCensus;
  key: WorkEncryptionKey;
  signedHighwater: SignedDeletionHighwaterV1 | null;
  trustedPublicSigner: KeyObject | null;
  trustedMinimum: IndependentGenerationWitness | null;
}): WorkRecord[] {
  requireCurrentRestoreAuthorization({
    request: { workId: input.authority.workId, keyId: input.key.keyId,
      snapshotGeneration: input.authority.generation },
    signed: input.signedHighwater,
    trustedSigner: input.trustedPublicSigner,
    independent: input.trustedMinimum,
  });
  const records = openWorkSnapshot(input.authority, input.sealed, input.key);
  assertDeclaredRecordCoverage(records, input.census, input.authority);
  return records;
}
