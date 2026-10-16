import { generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import {
  inspectWriterSchema, assertDeclaredRecordCoverage, sealDeclaredWorkCandidate,
  restoreDeclaredWorkCandidate, R11_REAL_MEMBER_BACKUP_ADMISSION,
} from '../recoveryAdmissionV1';
import { R11_CLASSIFIED_FIELDS } from '../workEnvelopeV1';
import { canonicalDeletionPayload, type DeletionHighwaterV1 } from '../deletionBarrierV1';

const authority = {
  memberId: '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204',
  workId: '306902ed-21a9-4c01-aa15-984755598218',
  generation: 12,
};
const key = { keyId: '3ac9b90d-8d79-44cf-bf3f-81376d8b7efe', keyBytes: randomBytes(32) };
const records = [
  { field: 'working_draft_revisions.content', recordId: randomUUID(),
    value: Buffer.from('ENTIRELY FICTIONAL edited chapter', 'utf8') },
  { field: 'original_source.bytes', recordId: randomUUID(),
    value: Buffer.from([255, 0, 170, 255]) },
];
const counts = Object.fromEntries(R11_CLASSIFIED_FIELDS.map(x => [x, 0]));
counts['working_draft_revisions.content'] = 1;
counts['original_source.bytes'] = 1;
const census = { snapshotGeneration: 12, counts };
const pair = generateKeyPairSync('ed25519');
const signed = (changes: Partial<DeletionHighwaterV1> = {}) => {
  const checkpoint: DeletionHighwaterV1 = {
    protocol: 'soullab.ws.deletion-highwater.v1', stream: 'writers-studio-beta',
    generation: 14, revokedWorks: [], revokedKeyIds: [], ...changes,
  };
  return { checkpoint, signature: sign(null, canonicalDeletionPayload(checkpoint), pair.privateKey)
    .toString('base64') };
};
const refusal = (f: () => unknown, code: string) =>
  expect(f).toThrow(expect.objectContaining({ code }));

describe('R11 held recoverability admission — still not a real backup writer', () => {
  it('never auto-opens member backups even when schema inventory seems complete', () => {
    expect(R11_REAL_MEMBER_BACKUP_ADMISSION).toBe('CLOSED');
    const catalog = R11_CLASSIFIED_FIELDS.filter(x => x !== 'original_source.bytes')
      .map(x => ({ table: x.split('.')[0], column: x.split('.')[1], type: 'text' }));
    const inspected = inspectWriterSchema(catalog);
    expect(inspected.recognized).toHaveLength(10);
    expect(inspected.missing).toHaveLength(0);
    expect(inspected.unclassified).toHaveLength(0);
    expect(inspected.disposition).toBe('HOLD_UNCERTIFIED_BACKUP');
    expect(inspected.derivedAndHistoricalStoresNotCertified).toBe(true);
  });
  it('reports previously missed review, recovery and JSONB fields as unclassified', () => {
    const fields = [
      { table: 'manuscript_application_recovery', column: 'before_body', type: 'text' },
      { table: 'developmental_reviews', column: 'snapshot_content', type: 'text' },
      { table: 'manuscript_structure_proposals', column: 'interpretation', type: 'jsonb' },
    ];
    const result = inspectWriterSchema(fields);
    expect(result.unclassified).toEqual([
      'developmental_reviews.snapshot_content',
      'manuscript_application_recovery.before_body',
      'manuscript_structure_proposals.interpretation',
    ]);
    expect(result.missing).toHaveLength(10);
    expect(result.disposition).toBe('HOLD_UNCERTIFIED_BACKUP');
  });
  it('refuses incomplete schema inventories, duplicate columns, invalid columns', () => {
    refusal(() => inspectWriterSchema([]), 'schema_inventory_unavailable');
    const c = { table: 'manuscript_sections', column: 'body', type: 'text' };
    refusal(() => inspectWriterSchema([c, c]), 'duplicate_schema_field');
    refusal(() => inspectWriterSchema([{ ...c, column: '' }]), 'invalid_schema_field');
  });
  it('requires every reviewed content field to have an explicit count including zero', () => {
    expect(assertDeclaredRecordCoverage(records, census, authority)).toBeUndefined();
    const tooSmall = { ...counts, 'original_source.bytes': 0 };
    refusal(() => assertDeclaredRecordCoverage(records, { ...census, counts: tooSmall }, authority),
      'source_record_census_mismatch');
    const incomplete = { ...counts };
    delete incomplete['manuscript_sections.body'];
    refusal(() => assertDeclaredRecordCoverage(records, { ...census, counts: incomplete }, authority),
      'incomplete_sensitive_field_census');
    refusal(() => assertDeclaredRecordCoverage(records, { ...census, snapshotGeneration: 11 }, authority),
      'snapshot_census_generation_mismatch');
  });
  it('refuses foreign/source duplicate and unclassified candidate records', () => {
    refusal(() => assertDeclaredRecordCoverage([...records, records[0]], census, authority),
      'duplicate_source_record');
    refusal(() => assertDeclaredRecordCoverage([
      ...records, { ...records[0], field: 'unspecified_editorial_prose.body' },
    ], census, authority), 'unreviewed_content_field');
  });
  it('can round-trip only the declared fictional records with independent signed nonrollback floor', () => {
    const sealed = sealDeclaredWorkCandidate({ authority, records, census, key });
    expect(JSON.stringify(sealed)).not.toContain('ENTIRELY FICTIONAL');
    const result = restoreDeclaredWorkCandidate({ authority, sealed, census, key,
      signedHighwater: signed(), trustedPublicSigner: pair.publicKey,
      trustedMinimum: { minimumGeneration: 14 } });
    expect(result).toEqual(records);
  });
  it('never decrypts after deletion despite availability of old encrypted archive and old Work key', () => {
    const sealed = sealDeclaredWorkCandidate({ authority, records, census, key });
    refusal(() => restoreDeclaredWorkCandidate({ authority, sealed, census, key,
      signedHighwater: signed({ revokedWorks: [authority.workId] }), trustedPublicSigner: pair.publicKey,
      trustedMinimum: { minimumGeneration: 14 } }), 'deleted_work_refused');
    refusal(() => restoreDeclaredWorkCandidate({ authority, sealed, census, key,
      signedHighwater: signed({ revokedKeyIds: [key.keyId] }), trustedPublicSigner: pair.publicKey,
      trustedMinimum: { minimumGeneration: 14 } }), 'deleted_key_refused');
  });
  it('refuses missing independent trust and authentic but stale signed deletion decision', () => {
    const sealed = sealDeclaredWorkCandidate({ authority, records, census, key });
    refusal(() => restoreDeclaredWorkCandidate({ authority, sealed, census, key,
      signedHighwater: signed(), trustedPublicSigner: pair.publicKey,
      trustedMinimum: null }), 'untrusted_deletion_checkpoint');
    refusal(() => restoreDeclaredWorkCandidate({ authority, sealed, census, key,
      signedHighwater: signed({ generation: 13 }), trustedPublicSigner: pair.publicKey,
      trustedMinimum: { minimumGeneration: 14 } }), 'stale_deletion_checkpoint');
  });
});
