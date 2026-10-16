/**
 * R19: fail-closed, schema-metadata-only inventory for real-writer release.
 * Does not inspect member rows, manuscript contents, secrets, backups or keys.
 * It CANNOT approve release; success means the existing risk was detected.
 */
export type SchemaColumnR19 = {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
};
export type SchemaSnapshotR19 = {
  status: string;
  verified_pg_major: string;
  contains_row_data: boolean;
  contains_credentials: boolean;
  table_count: number;
  column_count: number;
  candidate_text_json_binary_count: number;
  priority_field_count: number;
  schema_fingerprint_sha256: string;
  priority_fields: SchemaColumnR19[];
  candidate_fields: SchemaColumnR19[];
};

export const R19_REAL_MEMBER_WRITES_ENABLED = false as const;

export const R19_REQUIRED_WRITER_FIELDS = [
  'manuscript_source_arrivals.source_text',
  'manuscript_source_arrivals.original_filename',
  'manuscript_sections.body',
  'manuscript_working_drafts.content',
  'manuscript_draft_sections.text',
  'manuscript_revision_offers.proposed_text',
  'manuscript_revision_authorizations.expected_text',
] as const;

const DATA_TYPES_TO_REVIEW = new Set([
  'text', 'character varying', 'character', 'json', 'jsonb', 'bytea', 'ARRAY',
]);
const VALID_SHA = /^[a-f0-9]{64}$/;
const key = (f: SchemaColumnR19) => f.table_name + '.' + f.column_name;
export type R19SchemaAssessment =
  | { status: 'REFUSED_UNTRUSTED_SNAPSHOT'; canAdmitRealWriters: false; reasons: string[] }
  | {
    status: 'HOLD_PLAINTEXT_CUSTODY';
    canAdmitRealWriters: false;
    pgMajor: '16';
    schemaFingerprint: string;
    candidateFields: number;
    priorityFields: number;
    directReconstructionFields: string[];
    reasons: string[];
  };

export function assessR19SchemaCustody(s: unknown): R19SchemaAssessment {
  const refused = (...reasons: string[]): R19SchemaAssessment =>
    ({ status: 'REFUSED_UNTRUSTED_SNAPSHOT', canAdmitRealWriters: false, reasons });
  if (!s || typeof s !== 'object' || Array.isArray(s))
    return refused('No independently captured schema snapshot');
  const v = s as Partial<SchemaSnapshotR19>;
  if (v.status !== 'DARK_BETA_SCHEMA_METADATA_ONLY' ||
      v.verified_pg_major !== '16' ||
      v.contains_row_data !== false ||
      v.contains_credentials !== false)
    return refused('Wrong environment/version or snapshot includes row/credential material');
  if (!VALID_SHA.test(String(v.schema_fingerprint_sha256 || '')) ||
      !Number.isSafeInteger(v.table_count) || !(v.table_count! > 0) ||
      !Number.isSafeInteger(v.column_count) || !(v.column_count! > 0) ||
      !Array.isArray(v.candidate_fields) ||
      !Array.isArray(v.priority_fields) ||
      v.candidate_text_json_binary_count !== v.candidate_fields.length ||
      v.priority_field_count !== v.priority_fields.length ||
      v.candidate_fields.length > v.column_count!)
    return refused('Incomplete or inconsistent schema metadata inventory');

  const fields = new Map<string, SchemaColumnR19>();
  for (const f of v.candidate_fields) {
    if (!f || typeof f.table_name !== 'string' ||
        typeof f.column_name !== 'string' ||
        !DATA_TYPES_TO_REVIEW.has(f.data_type || '') ||
        fields.has(key(f)))
      return refused('Malformed or duplicated high-risk field metadata');
    fields.set(key(f), f);
  }
  const missing = R19_REQUIRED_WRITER_FIELDS.filter(f => !fields.has(f));
  if (missing.length)
    return refused('Cannot locate expected writer custody fields in this schema', ...missing);

  // A name-based census is not evidence of encryption. Every selected writer
  // reconstructive field remains held until source migration, WAL/backups,
  // independent key authority and old-reader rollback are verified.
  const directReconstructionFields = R19_REQUIRED_WRITER_FIELDS.filter(f =>
    DATA_TYPES_TO_REVIEW.has(fields.get(f)!.data_type));
  return {
    status: 'HOLD_PLAINTEXT_CUSTODY',
    canAdmitRealWriters: false,
    pgMajor: '16',
    schemaFingerprint: v.schema_fingerprint_sha256!,
    candidateFields: v.candidate_fields.length,
    priorityFields: v.priority_fields.length,
    directReconstructionFields,
    reasons: [
      'Writer Source/draft/revision text remains in ordinary SQL-compatible columns',
      'Schema inventory cannot establish that application writes are encrypted',
      'WAL, historic backups, JSONB, exports, replicas, key erasure and restore are unverified',
      'Real member onboarding, consent, Safari workflow and exact-source/image GO remain separate gates',
    ],
  };
}
