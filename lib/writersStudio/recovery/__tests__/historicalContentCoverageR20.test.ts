import {
  assessR20HistoricalWriterCustody,
  R20_DIRECT_CONTENT_FIELDS,
  R20_DERIVED_EDITORIAL_FIELDS,
  R20_REAL_MEMBER_WRITES_ENABLED,
} from '../historicalContentCoverageR20';
import type { SchemaSnapshotR19 } from '../schemaCustodyR19';

const allRequired = [...R20_DIRECT_CONTENT_FIELDS,...R20_DERIVED_EDITORIAL_FIELDS];
const row = (value:string) => {
  const [table_name,column_name] = value.split('.');
  return {table_name,column_name,data_type:'text',
    udt_name:'text',is_nullable:'YES'};
};
function fixture():SchemaSnapshotR19 {
  const fields = allRequired.map(row);
  const extras = ['manuscript_structure_units.origin',
    'manuscript_renders.source_authority'].map(row);
  return {
    status:'DARK_BETA_SCHEMA_METADATA_ONLY',
    verified_pg_major:'16',
    contains_row_data:false,contains_credentials:false,
    table_count:30,column_count:500,
    candidate_text_json_binary_count:fields.length+extras.length,
    priority_field_count:fields.length+extras.length,
    schema_fingerprint_sha256:'a'.repeat(64),
    candidate_fields:[...fields,...extras],
    priority_fields:[...fields,...extras],
  };
}
describe('R20 actual manuscript/history/derived-content custody perimeter',()=>{
  it('has no real writer activation or grant response',()=>{
    expect(R20_REAL_MEMBER_WRITES_ENABLED).toBe(false);
    const result=assessR20HistoricalWriterCustody(fixture());
    expect(result.canAdmitRealWriters).toBe(false);
    expect(result.canTreatEncryptedPairAsSoleCustody).toBe(false);
    expect(result).not.toHaveProperty('allowed');
  });
  it('keeps all seven original R19 fields AND historical prose copies',()=>{
    const fields=new Set(R20_DIRECT_CONTENT_FIELDS);
    for(const x of ['manuscript_source_arrivals.source_text',
      'manuscript_working_drafts.content',
      'working_draft_revisions.content',
      'manuscript_keeps.verbatim_text',
      'manuscript_application_recovery.before_body',
      'manuscript_application_recovery.after_body'])
      expect(fields.has(x as typeof R20_DIRECT_CONTENT_FIELDS[number])).toBe(true);
    expect(fields.size).toBe(11);
  });
  it('includes editorial JSON and interpretation/structure text as distinct risk',()=>{
    const fields=new Set(R20_DERIVED_EDITORIAL_FIELDS);
    expect(fields).toContain('manuscript_revision_offers.based_on');
    expect(fields).toContain('manuscript_revision_offers.read_state');
    expect(fields).toContain('manuscript_structure_proposals.evidence');
    expect(fields.size).toBe(8);
  });
  it('recognizes 19 observed direct/derived SQL fields but always HOLDS',()=>{
    const result=assessR20HistoricalWriterCustody(fixture());
    expect(result.status).toBe('HOLD_HISTORICAL_PLAINTEXT_AND_DERIVED_COPIES');
    expect(result.snapshotFingerprint).toBe('a'.repeat(64));
    expect(result.directFields).toHaveLength(11);
    expect(result.derivedEditorialFields).toHaveLength(8);
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('Schema metadata cannot establish plaintext erasure'),
    ]));
  });
  it('does not falsely dismiss other unreviewed manuscript priority fields',()=>{
    const result=assessR20HistoricalWriterCustody(fixture());
    expect(result.unclassifiedPriorityFields).toEqual([
      'manuscript_structure_units.origin','manuscript_renders.source_authority',
    ]);
  });
  it('refuses an incomplete revision-history or editorial JSON census',()=>{
    for(const missing of [
      'working_draft_revisions.content',
      'manuscript_keeps.verbatim_text',
      'manuscript_application_recovery.before_body',
      'manuscript_revision_offers.based_on',
    ]) {
      const data=fixture();
      data.candidate_fields=data.candidate_fields.filter(x=>x.table_name+'.'+x.column_name!==missing);
      data.candidate_text_json_binary_count=data.candidate_fields.length;
      const result=assessR20HistoricalWriterCustody(data);
      expect(result.status).toBe('REFUSED_METADATA');
      expect(result.canAdmitRealWriters).toBe(false);
      expect(result.reasons.some(x=>x.includes(missing))).toBe(true);
    }
  });
  it('refuses inconsistent counts, rows, credentials, wrong version',()=>{
    for (const d of [
      {table_count:0},{column_count:0},{schema_fingerprint_sha256:'x'},
      {contains_row_data:true},{contains_credentials:true},
      {verified_pg_major:'14'},
    ]) {
      const result=assessR20HistoricalWriterCustody({...fixture(),...d});
      expect(result.status).toBe('REFUSED_METADATA');
    }
  });
  it('refuses synthetic duplicate metadata rather than counting a duplicate as covered',()=>{
    const data=fixture();
    data.candidate_fields.push({...data.candidate_fields[0]});
    data.candidate_text_json_binary_count++;
    expect(assessR20HistoricalWriterCustody(data).status).toBe('REFUSED_METADATA');
  });
});
