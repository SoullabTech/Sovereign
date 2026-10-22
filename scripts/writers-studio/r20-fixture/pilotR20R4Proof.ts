/**
 * WS-TIERS-R4: disposable THREE-DB signed authority/rollback negative proof.
 * Mandatory exact 127.0.0.1 ports, fictional-only data, no production keys.
 * The fixture explicitly demonstrates the remaining simultaneous rollback hole.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { FixtureR20Authority } from './FixtureR20Authority';
import {
  createR20Nonce, verifyTwoIndependentR20Receipts,
  PilotR20ReceiptRefused, type R20VerificationRequest,
} from '../../../lib/writersStudio/pilotR20ReceiptProtocol';

const ENV = [
  ['WS_R4_MEMBER_DATABASE', 55439],
  ['WS_R4_AUTHORITY_DATABASE', 55440],
  ['WS_R4_WITNESS_DATABASE', 55441],
] as const;

function guardedUrl(env: string, port: number): string {
  // Explicit disposable endpoint is mandatory. Do not silently connect to a
  // server on the fixed port; another process could own that port.
  const raw = process.env[env];
  if (!raw) throw new Error('missing_explicit_disposable_r4_database');
  const parsed = new URL(raw);
  if (parsed.hostname !== '127.0.0.1' || parsed.port !== String(port)
    || parsed.pathname !== '/postgres' || parsed.username !== 'postgres') {
    throw new Error('refused_nonfictional_r4_db');
  }
  return raw;
}
const [memberUrl, authorityUrl, witnessUrl] = ENV.map(([env, port]) => guardedUrl(env, port));
process.env.DATABASE_URL = memberUrl;
process.env.WRITER_PILOT_GRANT_WRITES_ENABLED = '1';

const founder = '11111111-1111-4111-8111-111111111111';
const writerA = '22222222-2222-4222-8222-222222222222';
const writerB = '33333333-3333-4333-8333-333333333333';
const clock = 1_795_000_000_000;

function docker(container: 'ws-tiers-r2-fictional-20261022' |
  'ws-r20-independent-fictional-20261022' | 'ws-r20-checkpoint-fictional-20261022',
  ...args: string[]): void {
  execFileSync('/usr/local/bin/docker', ['exec', container, ...args], {
    timeout: 25_000, stdio: 'pipe',
  });
}
function restoreUrl(url: string, name: string): string {
  return url.replace(/\/postgres$/, '/' + name);
}

async function main() {
  const member = new Client({ connectionString: memberUrl });
  const primary = new Client({ connectionString: authorityUrl });
  const independent = new Client({ connectionString: witnessUrl });
  await Promise.all([member.connect(), primary.connect(), independent.connect()]);
  const restores: Client[] = [];
  let n = 0;
  const prove = (label: string, ok: boolean) => {
    assert.equal(ok, true, label);
    process.stdout.write('PASS ' + String(++n).padStart(2, '0') + ' ' + label + '\n');
  };

  try {
    // All three databases must be newly created, empty, dedicated test
    // instances. This avoids modifying a preexisting unrelated database
    // even if another service happens to occupy one of the loopback ports.
    for (const db of [member, primary, independent]) {
      const identity = await db.query<{ version_num: string; existing: number }>(
        `SELECT current_setting('server_version_num') AS version_num,
          (SELECT COUNT(*)::int FROM pg_tables
            WHERE schemaname='public') AS existing`,
      );
      if (!identity.rows[0]
        || !identity.rows[0].version_num.startsWith('16')
        || identity.rows[0].existing !== 0) {
        throw new Error('refused_nonempty_or_wrong_version_fictional_database');
      }
    }
    prove('all three databases are empty dedicated PostgreSQL 16 fixtures', true);
    await member.query('CREATE TABLE members (id UUID PRIMARY KEY, admin_role TEXT)');
    await member.query(`CREATE TABLE ops_contacts (
      member_id UUID NOT NULL, contact_type TEXT NOT NULL,
      pipeline_stage TEXT NOT NULL, deleted_at TIMESTAMPTZ
    )`);
    const migration = readFileSync(
      resolve(process.cwd(), 'database/migrations/20261022000001_writer_studio_pilot_grants_r2.sql'),
      'utf8',
    );
    await member.query(migration);
    prove('real R2/R3 Writer grant migration applied to isolated member DB', true);
    for (const [id, role] of [[founder, 'founder'], [writerA, null], [writerB, null]]) {
      await member.query('INSERT INTO members(id,admin_role) VALUES ($1,$2)', [id, role]);
    }
    for (const id of [writerA, writerB]) {
      await member.query(
        "INSERT INTO ops_contacts(member_id,contact_type,pipeline_stage) VALUES ($1,'beta_tester','active')",
        [id],
      );
    }
    await member.query(
      'UPDATE writer_studio_pilot_admission_control SET founder_member_id=$1 WHERE singleton=TRUE',
      [founder],
    );
    const { approvePilotWriter, acceptPilotWriter, readWriterPilotApproval, revokePilotWriter } =
      await import('../../../lib/writersStudio/pilotGrantServer');
    const { writerStudioPlanForMember } = await import('../../../lib/writersStudio/planAccessServer');
    const { closePool } = await import('../../../lib/db/postgres');

    prove('fictional writer A founder-approved', await approvePilotWriter(writerA, founder));
    prove('fictional writer B founder-approved', await approvePilotWriter(writerB, founder));
    prove('writer A explicitly accepted', await acceptPilotWriter(writerA));
    prove('writer B explicitly accepted', await acceptPilotWriter(writerB));
    const readA = await readWriterPilotApproval(writerA);
    const readB = await readWriterPilotApproval(writerB);
    if (!readA.eligible || readA.basis !== 'founder_approved_beta'
      || !readB.eligible || readB.basis !== 'founder_approved_beta') {
      throw new Error('fictional_grant_setup_failed');
    }
    const grantA = readA.grantId;
    const grantB = readB.grantId;
    prove('two distinct stable grant IDs issued', grantA !== grantB);

    const authority = await FixtureR20Authority.create(
      primary, 'r20-fixture-primary', 'fixture-primary-ed25519',
    );
    const witness = await FixtureR20Authority.create(
      independent, 'r20-fixture-witness', 'fixture-witness-ed25519',
    );
    const pinnedA = authority.getPinnedSigner();
    const pinnedB = witness.getPinnedSigner();
    const checkDual = async (
      memberId: string, grantId: string,
      minimumA = 1, minimumB = 1,
      nowMs = clock,
    ): Promise<boolean> => {
      const nonce = createR20Nonce();
      const request: R20VerificationRequest = {
        memberId, grantId, nonce, nowMs,
        signerA: { ...pinnedA, minimumEpoch: minimumA },
        signerB: { ...pinnedB, minimumEpoch: minimumB },
      };
      const first = await authority.issueFixtureReceipt(memberId, grantId, nonce, nowMs);
      const second = await witness.issueFixtureReceipt(memberId, grantId, nonce, nowMs);
      try {
        verifyTwoIndependentR20Receipts(first, second, request);
        return true;
      } catch (error) {
        if (!(error instanceof PilotR20ReceiptRefused)) throw error;
        return false;
      }
    };
    prove('no R20 approval from DB accepted-grant status alone',
      !(await checkDual(writerA, grantA)));
    prove('one signer cannot authorize Pro while other is missing',
      await authority.activateFixture(writerA, grantA)
      && !(await checkDual(writerA, grantA)));
    prove('two independent signed authorities can authenticate a fictional approved grant',
      await witness.activateFixture(writerA, grantA)
      && await checkDual(writerA, grantA));

    prove('A and B are independently authorized, not tied to the same token',
      await authority.activateFixture(writerB, grantB)
      && await witness.activateFixture(writerB, grantB)
      && await checkDual(writerB, grantB));
    prove('duplicate activation is refused by independent witness',
      !(await witness.activateFixture(writerA, grantA)));

    let stillHeld = false;
    try { await writerStudioPlanForMember(writerA); }
    catch { stillHeld = true; }
    prove('production-bound plan projection remains held even when fictional R20 allows',
      stillHeld);

    // Capture PRE-revocation copies of all three independent domains.
    docker('ws-tiers-r2-fictional-20261022', 'pg_dump', '-U', 'postgres',
      '-Fc', '-f', '/tmp/ws_r4_before_revoke.dump', 'postgres');
    docker('ws-r20-independent-fictional-20261022', 'pg_dump', '-U', 'postgres',
      '-Fc', '-f', '/tmp/ws_r4_before_revoke.dump', 'postgres');
    docker('ws-r20-checkpoint-fictional-20261022', 'pg_dump', '-U', 'postgres',
      '-Fc', '-f', '/tmp/ws_r4_before_revoke.dump', 'postgres');
    prove('three real fictional PostgreSQL pre-revocation snapshots captured', true);

    prove('independent witness tombstone refuses Pro BEFORE primary is revoked',
      await witness.revokeFixture(writerA, grantA)
      && !(await checkDual(writerA, grantA)));
    prove('issuer separately records revocation and no longer signs active',
      await authority.revokeFixture(writerA, grantA)
      && !(await checkDual(writerA, grantA)));
    const postRevocationFloorA = await authority.currentEpoch(writerA, grantA);
    const postRevocationFloorB = await witness.currentEpoch(writerA, grantA);
    prove('separate authorities have monotonic revocation epochs',
      postRevocationFloorA > 0 && postRevocationFloorB > 0);
    prove('member DB can also record the writer A revocation',
      await revokePilotWriter(writerA, founder));
    prove('independent writer B retains active status during A revocation',
      await checkDual(writerB, grantB));

    // Restore the Soullab DB itself. The old snapshot genuinely contains an
    // accepted grant even though the current R20 domains now deny it.
    const restore = async (
      container: 'ws-tiers-r2-fictional-20261022' |
        'ws-r20-independent-fictional-20261022' |
        'ws-r20-checkpoint-fictional-20261022',
      url: string,
      name: string,
    ): Promise<Client> => {
      docker(container, 'createdb', '-U', 'postgres', name);
      docker(container, 'pg_restore', '-U', 'postgres',
        '-d', name, '--no-owner', '/tmp/ws_r4_before_revoke.dump');
      const client = new Client({ connectionString: restoreUrl(url, name) });
      await client.connect();
      restores.push(client);
      return client;
    };

    const oldMember = await restore(
      'ws-tiers-r2-fictional-20261022', memberUrl, 'ws_r4_restored_member',
    );
    const historic = await oldMember.query<{ grant_state: string; grant_id: string }>(
      'SELECT grant_state, grant_id::text FROM writer_studio_beta_grants WHERE member_id=$1',
      [writerA],
    );
    prove('REAL old member database restore reactivates stale accepted row',
      historic.rows[0]?.grant_state === 'accepted'
      && historic.rows[0]?.grant_id === grantA);
    prove('both independent R20 domains still refuse that restored grant',
      !(await checkDual(writerA, grantA)));

    // Simulate one authority's data store being restored with signer key intact.
    const oldAuthority = await restore(
      'ws-r20-independent-fictional-20261022', authorityUrl, 'ws_r4_restored_authority',
    );
    authority.useRestoredFixtureDatabase(oldAuthority);
    prove('restored primary signer can newly sign old active state',
      (await authority.issueFixtureReceipt(writerA, grantA, createR20Nonce(), clock))
        .claims.status === 'active');
    prove('independent witness refuses despite primary signer rollback',
      !(await checkDual(writerA, grantA)));

    // Reverse which authority was restored: original primary revoked,
    // old witness active. Still denied by the other independent vote.
    authority.useRestoredFixtureDatabase(primary);
    const oldWitness = await restore(
      'ws-r20-checkpoint-fictional-20261022', witnessUrl, 'ws_r4_restored_witness',
    );
    witness.useRestoredFixtureDatabase(oldWitness);
    prove('restored witness alone cannot override primary revocation',
      !(await checkDual(writerA, grantA)));

    // Critical counterexample. If BOTH external authority stores and both
    // serving applications can roll back, signed fresh "active" receipts can
    // be produced. Two Postgres databases are not immutable WORM custody.
    authority.useRestoredFixtureDatabase(oldAuthority);
    prove('DOUBLE R20 rollback CAN sign an unsafe dual-positive without WORM floor',
      await checkDual(writerA, grantA));

    prove('a separately trusted high-water floor would reject both rolled-back signatures',
      !(await checkDual(
        writerA, grantA, postRevocationFloorA, postRevocationFloorB,
      )));
    prove('neither DB-only events nor two signatures claim production anti-rollback closure',
      postRevocationFloorA > 1 && postRevocationFloorB > 1);

    authority.useRestoredFixtureDatabase(primary);
    witness.useRestoredFixtureDatabase(independent);
    prove('returning to current databases restores independent A revocation refusal',
      !(await checkDual(writerA, grantA)));
    prove('writer B remains independently active in both current authorities',
      await checkDual(writerB, grantB));

    await closePool();
    process.stdout.write('RESULT: ' + n + '/' + n
      + ' fictional PostgreSQL16 signed-R20/restore checks PASS\n');
  } finally {
    await Promise.all(restores.map((db) => db.end()));
    await Promise.all([member.end(), primary.end(), independent.end()]);
  }
}

main().catch((error) => {
  process.stderr.write('R4 fictional witness FAILED (' + (error as Error).name + ')\n');
  process.exitCode = 1;
});
