/**
 * R20: expand the *observed* PG16 manuscript custody perimeter to include
 * historical drafts, preserved passages, reversible edits and editorial JSON.
 *
 * Metadata-only. This is NOT an encryption verifier or a rollout grant.
 * It cannot read real writing or authorize real member admission.
 */
import {
  assessR19SchemaCustody,
  type SchemaSnapshotR19,
} from './schemaCustodyR19';

export const R20_REAL_MEMBER_WRITES_ENABLED = false as const;

export const R20_DIRECT_CONTENT_FIELDS = [
  'manuscript_source_arrivals.source_text',
  'manuscript_source_arrivals.original_filename',
  'manuscript_sections.body',
  'manuscript_working_drafts.content',
  'manuscript_draft_sections.text',
  'manuscript_revision_offers.proposed_text',
  'manuscript_revision_authorizations.expected_text',
  'working_draft_revisions.content',
  'manuscript_keeps.verbatim_text',
  'manuscript_application_recovery.before_body',
  'manuscript_application_recovery.after_body',
] as const;

export const R20_DERIVED_EDITORIAL_FIELDS = [
  'manuscript_revision_offers.reason',
  'manuscript_revision_offers.based_on',
  'manuscript_revision_offers.read_state',
  'manuscript_structure_proposals.interpretation',
  'manuscript_structure_proposals.evidence',
  'manuscript_structure_proposals.reader_provenance',
  'manuscript_sections.heading',
  'manuscript_structure_units.title',
] as const;

type Assessment = {
  canAdmitRealWriters: false;
  canTreatEncryptedPairAsSoleCustody: false;
  snapshotFingerprint: string | null;
  status: 'REFUSED_METADATA' | 'HOLD_HISTORICAL_PLAINTEXT_AND_DERIVED_COPIES';
  directFields: readonly string[];
  derivedEditorialFields: readonly string[];
  unclassifiedPriorityFields: string[];
  reasons: string[];
};
const fieldName = (x: {table_name:string;column_name:string}) =>
  `${x.table_name}.${x.column_name}`;

/**
 * A schema-name census can establish that text-compatible columns EXIST; it
 * cannot prove whether application data is encrypted or historical copies were
 * erased. Even after an eventual encrypted writer is added, this gate remains
 * HOLD until independently witnessed DB/WAL/vault/backup/rollback evidence
 * replaces it. There is intentionally NO success or grant return type.
 */
export function assessR20HistoricalWriterCustody(input: unknown): Assessment {
  const prior = assessR19SchemaCustody(input);
  const refused = (...reasons: string[]): Assessment => ({
    status:'REFUSED_METADATA',
    canAdmitRealWriters:false,
    canTreatEncryptedPairAsSoleCustody:false,
    snapshotFingerprint:null,
    directFields:[],
    derivedEditorialFields:[],
    unclassifiedPriorityFields:[],
    reasons,
  });
  if (prior.status !== 'HOLD_PLAINTEXT_CUSTODY')
    return refused('R19 schema integrity verification failed',...prior.reasons);

  const s = input as SchemaSnapshotR19;
  const names = new Set(s.candidate_fields.map(fieldName));
  const direct = [...R20_DIRECT_CONTENT_FIELDS];
  const derived = [...R20_DERIVED_EDITORIAL_FIELDS];
  const missing = [...direct,...derived].filter(x=>!names.has(x));
  if (missing.length)
    return refused('A known manuscript/history/derivation field is absent or unclassified',
      ...missing.map(x=>`missing:${x}`));

  const known: Set<string> = new Set([...direct,...derived]);
  const unclassified = s.priority_fields.map(fieldName).filter(x=>!known.has(x));
  // A deliberately extensive but nonexhaustive review queue. Every field
  // classed as priority by R19 remains an explicit debt, never implicitly safe.
  return {
    status:'HOLD_HISTORICAL_PLAINTEXT_AND_DERIVED_COPIES',
    canAdmitRealWriters:false,
    canTreatEncryptedPairAsSoleCustody:false,
    snapshotFingerprint:prior.schemaFingerprint,
    directFields:direct,
    derivedEditorialFields:derived,
    unclassifiedPriorityFields:unclassified,
    reasons:[
      'Existing manuscript Source/draft/history/recovery and editorial fields remain text/JSON compatible',
      'No complete independently witnessed encrypted writer / old reader migration is installed',
      'Schema metadata cannot establish plaintext erasure from SQL/WAL/offsite exports or backups',
      'Derived editorial JSON and other still-unclassified priority fields require content/retention review',
      'Member invitation, verified consent, independently held deletion keys and full restore remain held',
    ],
  };
}
