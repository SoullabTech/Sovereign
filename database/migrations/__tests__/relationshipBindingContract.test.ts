import fs from 'node:fs';
import path from 'node:path';

const migrationDir = path.join(process.cwd(), 'database', 'migrations');
const preparation = fs.readFileSync(
  path.join(migrationDir, '20260917000001_practitioner_relationship_binding_preparation.sql'),
  'utf8',
);
const validation = fs.readFileSync(
  path.join(migrationDir, '20260917000002_practitioner_relationship_binding_validation.sql'),
  'utf8',
);

function addedNotValidConstraints(sql: string): string[] {
  return sql
    .split(';')
    .filter((statement) => statement.includes('ADD CONSTRAINT') && statement.includes('NOT VALID'))
    .map((statement) => statement.match(/ADD CONSTRAINT\s+(a3r2_[a-z0-9_]+)/i)?.[1])
    .filter((name): name is string => Boolean(name))
    .sort();
}

function validatedConstraints(sql: string): string[] {
  return [...sql.matchAll(/VALIDATE CONSTRAINT\s+(a3r2_[a-z0-9_]+)/gi)]
    .map((match) => match[1])
    .sort();
}

describe('A3-R2-R1 additive relationship migration contract', () => {
  it('lands every relationship guard NOT VALID before validating it separately', () => {
    const prepared = addedNotValidConstraints(preparation);
    const validated = validatedConstraints(validation);

    expect(prepared).toHaveLength(35);
    expect(validated).toEqual(prepared);
  });

  it('requires newly written compatibility rows to carry their additive identity', () => {
    expect(preparation).toContain('a3r2_practitioner_sessions_requires_practice');
    expect(preparation).toContain('a3r2_scribe_client_requires_practice');
    expect(preparation).toContain('a3r2_artifacts_requires_practice');
    expect(preparation).toContain('a3r2_invites_requires_practice');
    expect(preparation).toContain('a3r2_participants_require_team');
  });

  it('uses exact evidence and never chooses an arbitrary practice identity', () => {
    expect(preparation).not.toMatch(/LIMIT\s+1/i);
    expect(preparation).toContain('HAVING count(DISTINCT practitioner_id) = 1');
    expect(preparation).toContain('min(practitioner_id::text)::uuid');
  });

  it('keeps the adjudication ledger ID-only and requires an explicit resolution', () => {
    expect(preparation).toContain("NULLIF(btrim(resolution), '') IS NOT NULL");
    expect(preparation).not.toMatch(/jsonb_build_object\([\s\S]*?'(email|name|container)'[\s\S]*?\)/i);
  });

  it('makes reciprocal Session Room disagreement a deferred transaction refusal', () => {
    expect(preparation).toContain('CREATE CONSTRAINT TRIGGER a3r2_sessions_reciprocal_scribe_link');
    expect(preparation).toContain('CREATE CONSTRAINT TRIGGER a3r2_scribe_reciprocal_booking_link');
    expect(preparation.match(/DEFERRABLE INITIALLY DEFERRED/g)).toHaveLength(2);
  });
});
