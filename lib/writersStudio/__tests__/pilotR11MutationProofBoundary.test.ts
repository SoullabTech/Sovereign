/**
 * R11 immutable-review boundary: test-only pgcrypto HMAC precondition must
 * remain on the isolated SQL mutation function. Pure source guard.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const sql = readFileSync(join(ROOT,
  'scripts/writers-studio/r11-fixture/pilotSealedMutationContract.sql'), 'utf8');
const witness = readFileSync(join(ROOT,
  'scripts/writers-studio/r11-fixture/pilotR11SealedRoleProof.ts'), 'utf8');
const app = readFileSync(join(ROOT,
  'lib/writersStudio/pilotGrantServer.ts'), 'utf8');
const authority = readFileSync(join(ROOT,
  'lib/writersStudio/pilotR20Authority.ts'), 'utf8');

describe('WS-R11 signer proof distinct from SQL mutation credential', () => {
  test('research-only SQL not auto-applied to production', () => {
    expect(sql).toContain('FICTIONAL ONLY');
    expect(sql).toContain('NOT A DATABASE MIGRATION');
    expect(witness).toContain('R11_refused_nonfictional_database');
    expect(witness).toContain('R11_refused_unverified_test_container');
  });
  test('database checks pgcrypto HMAC internally before any grant mutation', () => {
    expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    expect(sql).toContain('public.hmac(');
    expect(sql.indexOf('r11_invalid_mutation_mac')).toBeLessThan(
      sql.indexOf('INSERT INTO public.writer_studio_beta_grants'),
    );
  });
  test('proof includes grant, member, actor, action and operation ID', () => {
    for (const component of [
      'p_operation_id::text', 'p_action', 'p_member_id::text',
      'p_actor_id::text', 'p_grant_id::text',
    ]) expect(sql).toContain(component);
    expect(sql).toContain('SOULLAB_WRITER_R11_SQL_CAPABILITY_V1|');
    expect(witness).toContain('SOULLAB_WRITER_R11_SQL_CAPABILITY_V1');
  });
  test('proof includes monotonic sequence and short expiration', () => {
    expect(sql).toContain('p_event_sequence::text');
    expect(sql).toContain('p_issued_at_ms::text');
    expect(sql).toContain('p_expires_at_ms::text');
    expect(sql).toContain('p_expires_at_ms - p_issued_at_ms > 30000');
    expect(sql).toContain('r11_event_sequence_not_next');
    expect(sql).toContain('event_sequence BIGINT NOT NULL UNIQUE');
  });
  test('verification secret is in separately denied private schema', () => {
    expect(sql).toContain('CREATE SCHEMA writer_r11_private');
    expect(sql).toContain('REVOKE ALL ON SCHEMA writer_r11_private FROM PUBLIC');
    expect(sql).toContain('writer_r11_private.fixture_mac_key');
    expect(witness).toContain('mutator cannot read the cryptographic verification secret');
    expect(witness).toContain('reader cannot read the cryptographic verification secret');
    expect(witness).toContain('NEGATIVE: DB owner can retrieve verification key');
  });
  test('function uses secure search path and no PUBLIC EXECUTE', () => {
    expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = pg_catalog, public, pg_temp/);
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.writer_r11_fixture_apply_event(');
    expect(sql).toContain('FROM PUBLIC');
  });
  test('a stolen mutator login with a fabricated MAC is explicitly refused', () => {
    expect(witness).toContain('STOLEN MUTATOR login with invented event and forged MAC is denied');
    expect(witness).toContain("'0'.repeat(64)");
    expect(witness).toContain('unsealedDenied');
  });
  test('tampering any signed identity or time field has a negative proof', () => {
    for (const clause of [
      'cannot be transferred to another grant ID',
      'cannot be transferred to another writer',
      'cannot be transferred to another actor',
      'cannot change issued to accepted',
      'cannot change its idempotent operation ID',
      'cannot change signed event sequence',
      'cannot change issuance time',
      'cannot extend expiry time',
      'expired independently signed proof is rejected',
      'future-dated independently signed proof is rejected',
    ]) expect(witness).toContain(clause);
  });
  test('local revocation and two-seat accounting remain terminal', () => {
    expect(sql).toContain('r11_revoked_generation_cannot_replay');
    expect(sql).toContain('issued_seats');
    expect(witness).toContain('stale issued and accepted operations stay refused');
    expect(witness).toContain('third writer still denied after revoked-row cleanup');
  });
  test('test host is verified by Docker image, loopback binding and tmpfs', () => {
    expect(witness).toContain('ws-tiers-r2-fictional-20261022');
    expect(witness).toContain("'postgres:16'");
    expect(witness).toContain("'127.0.0.1'");
    expect(witness).toContain("'55439'");
    expect(witness).toContain("HostConfig?.Tmpfs?.['/var/lib/postgresql/data']");
  });
  test('normal Writer app grant mutation exports still refuse all writes', () => {
    expect(app).not.toMatch(/INSERT\s+INTO\s+writer_studio_beta_grants/i);
    expect(app).not.toMatch(/UPDATE\s+writer_studio_beta_grants/i);
    expect(app).toContain('throw new PilotR20AuthorityUnavailable()');
    expect(authority).toContain('throw new PilotR20AuthorityUnavailable()');
    expect(app).not.toContain('pilotSealedMutationContract.sql');
  });
  test('signing key is generated dynamically and not checked into fixture SQL', () => {
    expect(witness).toContain('const signerKey = randomBytes(32)');
    expect(witness).toContain('createHmac');
    expect(sql).not.toMatch(/INSERT\s+INTO\s+writer_r11_private\.fixture_mac_key/i);
    expect(witness).not.toContain('console.log(signerKey)');
  });
});
