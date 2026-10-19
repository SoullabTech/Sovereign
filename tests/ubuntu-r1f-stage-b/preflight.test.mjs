/**
 * Pure offline guards. These tests NEVER connect to PostgreSQL or import the app.
 * A green suite certifies only refusal logic in preflight.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkConfiguration, REQUIRED, FIXTURE_URL, SOURCE_SHA } from './preflight.mjs';

function good() {
  return { ...REQUIRED, DATABASE_URL: FIXTURE_URL };
}
function expectsRefusal(env, code) {
  const result = checkConfiguration(env);
  assert.equal(result.status, 'REFUSED');
  assert.ok(result.problems.includes(code), 'missing expected refusal: ' + code);
  assert.equal(result.databaseContacted, false);
  assert.equal(result.sourceExecuted, false);
}

test('B-P01 exact explicitly fictional preflight is not execution', () => {
  const v = checkConfiguration(good());
  assert.equal(v.status, 'PREPARED_NOT_EXECUTED');
  assert.equal(v.networkIsolationVerified, false);
  assert.equal(v.disposableDatabaseVerified, false);
  assert.equal(v.noProductionPermissionsVerified, false);
});
test('B-P02 database URL is mandatory; no fallback', () => {
  const v = good(); delete v.DATABASE_URL;
  expectsRefusal(v, 'DATABASE_URL_MISSING_NO_FALLBACK');
});
test('B-P03 localhost connection refused even when database name looks fictional', () => {
  expectsRefusal({ ...good(), DATABASE_URL: FIXTURE_URL.replace('pg-fixture', 'localhost') }, 'DATABASE_URL_NOT_FICTIONAL_FIXTURE');
});
test('B-P04 real-looking domain refused', () => {
  expectsRefusal({ ...good(), DATABASE_URL: FIXTURE_URL.replace('pg-fixture', 'db.soullab.life') }, 'DATABASE_URL_NOT_FICTIONAL_FIXTURE');
});
test('B-P05 mismatched database name refused', () => {
  expectsRefusal({ ...good(), DATABASE_URL: FIXTURE_URL.replace('ubuntu_r1f_ephemeral', 'maia_consciousness') }, 'DATABASE_URL_NOT_FICTIONAL_FIXTURE');
});
test('B-P06 mismatched database user refused', () => {
  expectsRefusal({ ...good(), DATABASE_URL: FIXTURE_URL.replace('ubuntu_fixture_test', 'soullab') }, 'DATABASE_URL_NOT_FICTIONAL_FIXTURE');
});
test('B-P07 omitted scope refused', () => {
  const v = good(); delete v.R1F_STAGE_B_SCOPE;
  expectsRefusal(v, 'INVALID_R1F_STAGE_B_SCOPE');
});
test('B-P08 executable mode refused', () => {
  expectsRefusal({ ...good(), R1F_STAGE_B_MODE: 'RUN_SERVICE_TESTS' }, 'INVALID_R1F_STAGE_B_MODE');
});
test('B-P09 source commit must remain pinned', () => {
  expectsRefusal({ ...good(), R1F_SOURCE_SHA: 'HEAD' }, 'INVALID_R1F_SOURCE_SHA');
  assert.equal(SOURCE_SHA.length, 40);
});
test('B-P10 internet-enabled declaration refused', () => {
  expectsRefusal({ ...good(), R1F_EGRESS: 'INTERNET' }, 'INVALID_R1F_EGRESS');
});
test('B-P11 inherited provider key refused without echoing it', () => {
  const v = checkConfiguration({ ...good(), OPENAI_API_KEY: 'NEVER_LOG_FICTIONAL_VALUE' });
  assert.equal(v.status, 'REFUSED');
  assert.ok(v.problems.includes('AMBIENT_CREDENTIAL_OR_EXTERNAL_PROVIDER_KEYS'));
  assert.ok(!JSON.stringify(v).includes('NEVER_LOG_FICTIONAL_VALUE'));
});
test('B-P12 inherited Postgres host or password refused', () => {
  expectsRefusal({ ...good(), PGHOST: 'prod-server' }, 'AMBIENT_CREDENTIAL_OR_EXTERNAL_PROVIDER_KEYS');
  expectsRefusal({ ...good(), PGPASSWORD: 'not-disclosed' }, 'AMBIENT_CREDENTIAL_OR_EXTERNAL_PROVIDER_KEYS');
});
test('B-P13 session/test mode must be test-only', () => {
  expectsRefusal({ ...good(), NODE_ENV: 'production' }, 'INVALID_NODE_ENV');
});
test('B-P14 fabricated database attestation refused', () => {
  expectsRefusal({ ...good(), R1F_DATABASE_ATTESTATION: 'VERIFIED' }, 'INVALID_R1F_DATABASE_ATTESTATION');
});
test('B-P15 no credentials or URL displayed on errors', () => {
  const wrong = { ...good(), DATABASE_URL: 'postgresql://live_secret@production.example:5432/members' };
  const result = JSON.stringify(checkConfiguration(wrong));
  assert.equal(result.includes('live_secret'), false);
  assert.equal(result.includes('production.example'), false);
});
