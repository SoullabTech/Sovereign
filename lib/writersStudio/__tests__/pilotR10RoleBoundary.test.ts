/**
 * R10 regression guard: separation between normal Writer runtime and the
 * review-only service mutation SQL. Pure source tests; real PG16 witness
 * lives in scripts/writers-studio/r10-fixture/pilotR10RoleContractProof.ts.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const app = readFileSync(join(root,'lib/writersStudio/pilotGrantServer.ts'),'utf8');
const authority = readFileSync(join(root,'lib/writersStudio/pilotR20Authority.ts'),'utf8');
const sql = readFileSync(join(root,'scripts/writers-studio/r10-fixture/pilotRoleContract.sql'),'utf8');
const roleProofSource = readFileSync(join(root,
  'scripts/writers-studio/r10-fixture/pilotR10RoleContractProof.ts'),'utf8');
const roles = readFileSync(join(root,
  'scripts/writers-studio/r9-fixture/fictionalPilotGrantDbModel.ts'),'utf8');

test('normal grant server offers no SQL-bearing mutation exports',() => {
  expect(app).not.toMatch(/INSERT\s+INTO\s+writer_studio_beta_grants/i);
  expect(app).not.toMatch(/UPDATE\s+writer_studio_beta_grants/i);
  expect(app).not.toMatch(/DELETE\s+FROM\s+writer_studio_beta_grants/i);
  expect(app).toContain('PilotR20AuthorityUnavailable');
});
test('production R20 signer is still unavailable by design',() => {
  expect(authority).toContain('throw new PilotR20AuthorityUnavailable()');
  expect(authority).not.toContain('require(' + `'../scripts/writers-studio/r10-fixture'` + ')');
});
test('service routine is fixture-only and not an auto-applied migration',() => {
  expect(sql).toContain('FICTIONAL ONLY');
  expect(roleProofSource).toContain('R10_refused_unverified_test_container');
  expect(roleProofSource).toContain('R10_refused_reused_or_wrong_version_database');
  expect(roles).toContain('assertFictionalWriterPilotDb');
});
test('SECURITY DEFINER has explicit pinned search path and qualified tables',() => {
  expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = pg_catalog, public/i);
  expect(sql).toContain('public.writer_studio_beta_grants');
  expect(sql).toContain('public.writer_studio_pilot_admission_control');
  expect(sql).toContain('public.writer_r10_fixture_applied_operations');
});
test('routine explicitly removes default EXECUTE from PUBLIC',() => {
  expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.writer_r10_fixture_apply_event/);
  expect(sql).toMatch(/FROM PUBLIC/);
});
test('mutator role receives only explicit EXECUTE and no raw table DML grants',() => {
  expect(roleProofSource).toContain('TO writer_r10_fixture_mutator');
  expect(roleProofSource).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE)\b/i);
  expect(roleProofSource).toContain('mutator cannot directly update grant state');
  expect(roleProofSource).toContain('mutator cannot rewrite issued-seat counter');
});
test('operation UUID protects against cross-writer and cross-action replay',() => {
  expect(sql).toContain('operation_id UUID PRIMARY KEY');
  expect(sql).toContain('r10_operation_replay_mismatch');
  expect(sql).toContain('r10_revoked_generation_cannot_replay');
  expect(sql).toContain("p_action = 'issued'");
  expect(sql).toContain("p_action = 'accepted'");
  expect(sql).toContain("p_action <> 'revoked'");
});
test('the test records the compromised-mutator credential counterexample',() => {
  expect(roleProofSource).toContain('stolen mutator login could forge an issue');
  expect(roleProofSource).toContain('ROLLBACK');
  expect(roleProofSource).toContain('no issued seat or grant');
});
test('DB test locks exact memory-backed Postgres16 container to loopback',() => {
  expect(roleProofSource).toContain('ws-tiers-r2-fictional-20261022');
  expect(roleProofSource).toContain('ws-tiers-r2-fictional-20261022');
  expect(roleProofSource).toContain("'postgres:16'");
  expect(roleProofSource).toContain("'127.0.0.1'");
  expect(roleProofSource).toContain("'55439'");
  expect(roleProofSource).toContain('HostConfig?.Tmpfs');
});
