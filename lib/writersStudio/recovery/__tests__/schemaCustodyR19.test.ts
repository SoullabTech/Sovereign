import {
  assessR19SchemaCustody, R19_REAL_MEMBER_WRITES_ENABLED,
  R19_REQUIRED_WRITER_FIELDS, type SchemaSnapshotR19,
} from '../schemaCustodyR19';

function fictionalSnapshot(): SchemaSnapshotR19 {
  const rows = R19_REQUIRED_WRITER_FIELDS.map(f => {
    const [table_name, column_name] = f.split('.');
    return { table_name, column_name, data_type: 'text', udt_name: 'text', is_nullable: 'YES' };
  });
  return {
    status: 'DARK_BETA_SCHEMA_METADATA_ONLY',
    verified_pg_major: '16',
    contains_row_data: false, contains_credentials: false,
    table_count: 10, column_count: 300,
    candidate_text_json_binary_count: rows.length,
    priority_field_count: rows.length,
    schema_fingerprint_sha256: 'a'.repeat(64),
    priority_fields: rows, candidate_fields: rows,
  };
}

describe('R19 real beta schema metadata gate', () => {
  it('keeps real member writing statically disabled', () =>
    expect(R19_REAL_MEMBER_WRITES_ENABLED).toBe(false));
  it('refuses missing metadata or wrong database major', () => {
    expect(assessR19SchemaCustody(undefined).status).toBe('REFUSED_UNTRUSTED_SNAPSHOT');
    expect(assessR19SchemaCustody({}).status).toBe('REFUSED_UNTRUSTED_SNAPSHOT');
    expect(assessR19SchemaCustody({...fictionalSnapshot(),verified_pg_major:'14'}).status)
      .toBe('REFUSED_UNTRUSTED_SNAPSHOT');
  });
  it('refuses any row/credential-bearing snapshot', () => {
    for (const field of ['contains_row_data','contains_credentials'] as const) {
      expect(assessR19SchemaCustody({...fictionalSnapshot(),[field]:true}).status)
        .toBe('REFUSED_UNTRUSTED_SNAPSHOT');
    }
  });
  it('rejects inconsistent counts and untracked schema', () => {
    for (const change of [
      {candidate_text_json_binary_count: 0}, {priority_field_count: 0},
      {column_count: 1}, {schema_fingerprint_sha256: 'bad'},
    ]) {
      expect(assessR19SchemaCustody({...fictionalSnapshot(),...change}).status)
        .toBe('REFUSED_UNTRUSTED_SNAPSHOT');
    }
  });
  it('refuses missing reconstructive fields rather than passing on a blank schema', () => {
    const s=fictionalSnapshot();
    s.candidate_fields.pop();
    s.candidate_text_json_binary_count--;
    expect(assessR19SchemaCustody(s).status).toBe('REFUSED_UNTRUSTED_SNAPSHOT');
  });
  it('refuses duplicate and unknown candidate field types', () => {
    const s=fictionalSnapshot();
    s.candidate_fields.push({...s.candidate_fields[0]});
    s.candidate_text_json_binary_count++;
    expect(assessR19SchemaCustody(s).status).toBe('REFUSED_UNTRUSTED_SNAPSHOT');
    const t=fictionalSnapshot();
    t.candidate_fields[0]={...t.candidate_fields[0],data_type:'integer'};
    expect(assessR19SchemaCustody(t).status).toBe('REFUSED_UNTRUSTED_SNAPSHOT');
  });
  it('recognizes all required SQL writer fields but never grants release', () => {
    const r=assessR19SchemaCustody(fictionalSnapshot());
    expect(r.status).toBe('HOLD_PLAINTEXT_CUSTODY');
    expect(r.canAdmitRealWriters).toBe(false);
    if (r.status==='HOLD_PLAINTEXT_CUSTODY') {
      expect(r.directReconstructionFields).toEqual([...R19_REQUIRED_WRITER_FIELDS]);
      expect(r.reasons.length).toBeGreaterThan(2);
    }
  });
});
