/**
 * WS-TIERS-R8: fictional PostgreSQL16 + ephemeral Ed25519 R20 seal witness.
 *
 * External seal is an IN-MEMORY FIXTURE, never a deployed R20 authority.
 * The database is a brand-new empty isolated loopback port-55439 container;
 * no production/staging database, real contact or member is ever accessed.
 *
 * This verifies SQL idempotency and founder/canary constraints alongside the
 * pure R8 protocol. It DOES NOT prove durable WORM, real service transport,
 * production routes, signer custody, backup erasure or deployment safety.
 */
import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { readFileSync, statfsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool, type PoolClient } from 'pg';
import {
  R8_AUDIENCE, R8MutationRefused, coordinateR8SealedMutation,
  r8MutationBytes, type R8MutationIntent, type R8MutationClaims,
  type R8MutationReceipt, type R8Action, type R8VerifiedMutation,
  type R8TrustedSigner,
} from '../../../lib/writersStudio/pilotR20MutationCandidate';

const sourceUrl = process.env.WS_R8_FICTIONAL_POSTGRES;
if (!sourceUrl) throw new Error('explicit_disposable_pg16_url_required');
const parsed = new URL(sourceUrl);
if (parsed.hostname !== '127.0.0.1' || parsed.port !== '55439'
  || parsed.pathname !== '/postgres' || parsed.username !== 'postgres') {
  throw new Error('refusing_nonfictional_database');
}
const volume = statfsSync(process.cwd());
if ((volume.bavail * volume.bsize) / (1024 ** 3) < 6) {
  throw new Error('R8_FIXTURE_REFUSED_LOW_HOST_DISK_FREE_SPACE');
}
const founder = '11111111-1111-4111-8111-111111111111';
const writerA = '22222222-2222-4222-8222-222222222222';
const writerB = '33333333-3333-4333-8333-333333333333';
const outsider = '44444444-4444-4444-8444-444444444444';
const now = 1_795_000_000_000;
const commitmentFor = (subject: string) =>
  createHash('sha256').update('disposable-r8-fictional:' + subject).digest('hex');

function intent(
  action: R8Action, memberId: string, grantId?: string, operationId = randomUUID(),
): R8MutationIntent {
  return {
    action, memberId, actorId: action === 'accepted' ? memberId : founder,
    operationId, subjectCommitment: commitmentFor(memberId),
    ...(grantId ? { expectedGrantId: grantId } : {}),
  };
}

const pair = generateKeyPairSync('ed25519');
const trust: R8TrustedSigner = {
  issuer: 'disposable-r8-independent-issuer',
  keyId: 'ephemeral-ed25519-review-fixture',
  publicKeyPem: pair.publicKey.export({ type: 'spki', format: 'pem' }).toString('utf8'),
  minimumSequence: 1,
};
type State = 'issued' | 'accepted' | 'revoked';
type Entry = { memberId: string; grantId: string; state: State; commitment: string };

/**
 * This intentionally has no independently durable storage, receipt replay
 * protection beyond process lifetime or production key management.
 */
class FictionalR20Issuer {
  private sequence = 0;
  private readonly byMember = new Map<string, Entry>();
  private readonly byOperation = new Map<string, {
    expectation: string; claims: R8MutationClaims;
  }>();
  get events(): number { return this.sequence; }
  get issuedSeats(): number {
    return [...this.byMember.values()].length;
  }
  getState(memberId: string): State | undefined {
    return this.byMember.get(memberId)?.state;
  }
  async seal(expected: R8MutationIntent, issuedAtMs: number): Promise<R8MutationReceipt> {
    const expectation = JSON.stringify(expected);
    const prior = this.byOperation.get(expected.operationId);
    if (prior) {
      if (prior.expectation !== expectation) throw new R8MutationRefused();
      // Once a newer terminal event is sealed, do not refresh an older
      // "issued" or "accepted" receipt from its idempotency entry.
      if (this.byMember.get(expected.memberId)?.state === 'revoked'
        && expected.action !== 'revoked') throw new R8MutationRefused();
      return this.signed({ ...prior.claims,
        issuedAtMs, expiresAtMs: issuedAtMs + 15_000,
      });
    }
    const entry = this.byMember.get(expected.memberId);
    if (expected.action === 'issued') {
      if (entry || this.issuedSeats >= 2 || expected.actorId !== founder) {
        throw new R8MutationRefused();
      }
    } else if (!entry || entry.grantId !== expected.expectedGrantId
      || entry.state === 'revoked') {
      throw new R8MutationRefused();
    } else if (expected.action === 'accepted'
      && (entry.state !== 'issued' || expected.actorId !== expected.memberId)) {
      throw new R8MutationRefused();
    } else if (expected.action === 'revoked' && expected.actorId !== founder) {
      throw new R8MutationRefused();
    }
    const grantId = entry?.grantId ?? randomUUID();
    const sequence = ++this.sequence;
    if (expected.action === 'issued') {
      this.byMember.set(expected.memberId, {
        memberId: expected.memberId, grantId,
        commitment: expected.subjectCommitment, state: 'issued',
      });
    } else if (entry) {
      entry.state = expected.action;
    }
    const claims: R8MutationClaims = {
      version: 1, audience: R8_AUDIENCE,
      issuer: trust.issuer, keyId: trust.keyId,
      memberId: expected.memberId, actorId: expected.actorId,
      subjectCommitment: expected.subjectCommitment,
      action: expected.action, grantId,
      operationId: expected.operationId, sequence,
      issuedAtMs, expiresAtMs: issuedAtMs + 15_000,
    };
    this.byOperation.set(expected.operationId, { expectation, claims });
    return this.signed(claims);
  }
  private signed(claims: R8MutationClaims): R8MutationReceipt {
    return {
      claims,
      signature: sign(null, r8MutationBytes(claims), pair.privateKey).toString('base64url'),
    };
  }
}

/** Direct SQL fixture only; NEVER a member-serving production function. */
class FictionalMemberDb {
  failNext = false;
  constructor(private readonly pool: Pool) {}
  async applySealedMutation(
    checked: R8VerifiedMutation,
  ): Promise<'applied' | 'replayed'> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('fictional_pg_network_interruption');
    }
    const tx: PoolClient = await this.pool.connect();
    try {
      await tx.query('BEGIN');
      // R2/R3 schema serializes canary admission; all DB operations retain
      // current verified founder and the EXACT externally sealed grantId.
      const gate = await tx.query<{
        issued_seats: number;
        initial_seat_cap: number;
        founder_member_id: string;
      }>(`SELECT issued_seats, initial_seat_cap, founder_member_id
            FROM writer_studio_pilot_admission_control
           WHERE singleton=TRUE FOR UPDATE`);
      if (gate.rows[0]?.founder_member_id !== founder
        || gate.rows[0]?.initial_seat_cap !== 2) {
        throw new R8MutationRefused();
      }
      const known = await tx.query<{
        grant_id: string; grant_state: string; approved_by: string;
      }>(`SELECT grant_id::text, grant_state, approved_by
            FROM writer_studio_beta_grants WHERE member_id=$1`,
      [checked.memberId]);
      const existing = known.rows[0];
      if (checked.action === 'issued') {
        if (checked.actorId !== founder) throw new R8MutationRefused();
        if (existing) {
          if (existing.grant_id !== checked.grantId
            || existing.approved_by !== founder) throw new R8MutationRefused();
          await tx.query('COMMIT');
          return 'replayed';
        }
        if (gate.rows[0].issued_seats >= 2) throw new R8MutationRefused();
        const applied = await tx.query(
          `INSERT INTO writer_studio_beta_grants(member_id,grant_id,approved_by)
            SELECT m.id, $2::uuid, f.id
              FROM members m CROSS JOIN members f
             WHERE m.id=$1 AND f.id=$3 AND f.admin_role='founder'
               AND EXISTS (
                 SELECT 1 FROM ops_contacts c WHERE c.member_id=m.id
                   AND c.deleted_at IS NULL AND c.contact_type='beta_tester'
                   AND c.pipeline_stage='active'
               )
            ON CONFLICT (member_id) DO NOTHING
            RETURNING grant_id`,
          [checked.memberId, checked.grantId, founder],
        );
        if (applied.rows.length !== 1) throw new R8MutationRefused();
        await tx.query('COMMIT');
        return 'applied';
      }

      if (!existing || existing.grant_id !== checked.grantId
        || existing.approved_by !== founder) throw new R8MutationRefused();
      if (checked.action === 'accepted') {
        if (checked.actorId !== checked.memberId) throw new R8MutationRefused();
        if (existing.grant_state === 'accepted') {
          await tx.query('COMMIT');
          return 'replayed';
        }
        if (existing.grant_state !== 'pending') throw new R8MutationRefused();
        const update = await tx.query(
          `UPDATE writer_studio_beta_grants g
              SET grant_state='accepted', accepted_at=NOW()
            WHERE g.member_id=$1 AND g.grant_id=$2::uuid
              AND g.grant_state='pending'
              AND EXISTS (SELECT 1 FROM members f
                WHERE f.id=g.approved_by AND f.admin_role='founder')
            RETURNING g.member_id`,
          [checked.memberId, checked.grantId],
        );
        if (update.rows.length !== 1) throw new R8MutationRefused();
        await tx.query('COMMIT');
        return 'applied';
      }

      if (checked.actorId !== founder) throw new R8MutationRefused();
      if (existing.grant_state === 'revoked') {
        await tx.query('COMMIT');
        return 'replayed';
      }
      const update = await tx.query(
        `UPDATE writer_studio_beta_grants g
            SET grant_state='revoked', revoked_at=NOW(), revoked_by=$3::uuid
          WHERE g.member_id=$1 AND g.grant_id=$2::uuid
            AND g.grant_state IN ('pending','accepted')
          RETURNING g.member_id`,
        [checked.memberId, checked.grantId, founder],
      );
      if (update.rows.length !== 1) throw new R8MutationRefused();
      await tx.query('COMMIT');
      return 'applied';
    } catch (error) {
      await tx.query('ROLLBACK');
      throw error;
    } finally {
      tx.release();
    }
  }
}

async function main(): Promise<void> {
  const pool = new Pool({
    connectionString: sourceUrl,
    max: 10,
    connectionTimeoutMillis: 2000,
  });
  let checks = 0;
  const proof = (label: string, passes: boolean) => {
    assert.equal(passes, true, label);
    checks++;
    process.stdout.write('PASS ' + String(checks).padStart(2, '0') + ' ' + label + '\n');
  };
  try {
    const base = await pool.query<{
      version_num: string; count: number;
    }>(`SELECT current_setting('server_version_num') AS version_num,
        (SELECT count(*)::int FROM pg_tables WHERE schemaname='public') AS count`);
    if (!base.rows[0]?.version_num.startsWith('16')
      || base.rows[0]?.count !== 0) {
      throw new Error('R8_fixture_must_use_FRESH_empty_disposable_PG16');
    }
    proof('disposable PostgreSQL 16 is fresh, empty and loopback-bound', true);

    await pool.query('CREATE TABLE members(id UUID PRIMARY KEY, admin_role TEXT)');
    await pool.query(`CREATE TABLE ops_contacts(
      member_id UUID REFERENCES members(id), contact_type TEXT,
      pipeline_stage TEXT, deleted_at TIMESTAMPTZ
    )`);
    await pool.query(readFileSync(resolve(process.cwd(),
      'database/migrations/20261022000001_writer_studio_pilot_grants_r2.sql'), 'utf8'));
    proof('actual R2/R3 founder-bound migration accepted', true);
    for (const id of [founder, writerA, writerB, outsider]) {
      await pool.query('INSERT INTO members(id,admin_role) VALUES ($1,$2)', [
        id, id === founder ? 'founder' : null,
      ]);
      if (id !== founder) {
        await pool.query(`INSERT INTO ops_contacts(member_id,contact_type,pipeline_stage)
          VALUES($1,'beta_tester','active')`, [id]);
      }
    }
    await pool.query(`UPDATE writer_studio_pilot_admission_control
      SET founder_member_id=$1 WHERE singleton=TRUE`, [founder]);
    const witness = new FictionalR20Issuer();
    const memberDb = new FictionalMemberDb(pool);
    const run = (i: R8MutationIntent, nowMs = now) =>
      coordinateR8SealedMutation(i, witness, memberDb, trust, nowMs);

    const issueA = intent('issued', writerA);
    memberDb.failNext = true;
    let failed = false;
    try { await run(issueA); } catch { failed = true; }
    proof('external sealed grant A exists after intentionally failed DB write',
      failed && witness.issuedSeats === 1
        && (await pool.query('SELECT count(*)::int AS n FROM writer_studio_beta_grants'))
          .rows[0]?.n === 0);
    const restoredA = await run(issueA, now + 4000);
    proof('retry commits exact same externally minted A grant generation',
      restoredA.status === 'applied'
      && (await pool.query('SELECT grant_id::text FROM writer_studio_beta_grants WHERE member_id=$1',
        [writerA])).rows[0]?.grant_id === restoredA.grantId);
    const againA = await run(issueA, now + 4500);
    proof('same issue operation is idempotent without consuming a second seat',
      againA.status === 'replayed'
      && againA.grantId === restoredA.grantId
      && witness.issuedSeats === 1);

    const issueB = intent('issued', writerB);
    const simultaneous = await Promise.all(
      Array.from({ length: 8 }, () => run(issueB, now + 5000)),
    );
    proof('8 concurrent B requests produce same externally sealed grant ID',
      new Set(simultaneous.map((r) => r.grantId)).size === 1);
    proof('8 concurrent B requests commit exactly one SQL row and spend one seat',
      simultaneous.filter((r) => r.status === 'applied').length === 1
      && simultaneous.filter((r) => r.status === 'replayed').length === 7
      && (await pool.query('SELECT issued_seats FROM writer_studio_pilot_admission_control'))
        .rows[0]?.issued_seats === 2);
    proof('two fixture members have distinct canonical UUID grants',
      simultaneous[0].grantId !== restoredA.grantId);

    let capDenied = false;
    try { await run(intent('issued', outsider)); } catch (e) {
      capDenied = e instanceof R8MutationRefused;
    }
    proof('third otherwise eligible member denied by independent issuer', capDenied);

    const acceptA = intent('accepted', writerA, restoredA.grantId);
    const acceptedA = await run(acceptA, now + 6000);
    proof('writer A accepts only the externally sealed matching grant',
      acceptedA.grantId === restoredA.grantId && acceptedA.status === 'applied');
    proof('writer A acceptance is idempotent in actual PostgreSQL',
      (await run(acceptA, now + 6200)).status === 'replayed');

    const acceptB = intent('accepted', writerB, simultaneous[0].grantId);
    memberDb.failNext = true;
    let bDbInterrupted = false;
    try { await run(acceptB, now + 6800); } catch { bDbInterrupted = true; }
    proof('externally sealed B acceptance survives local PostgreSQL interruption',
      bDbInterrupted && witness.getState(writerB) === 'accepted'
      && (await pool.query('SELECT grant_state FROM writer_studio_beta_grants WHERE member_id=$1',
        [writerB])).rows[0]?.grant_state === 'pending');
    const acceptedB = await run(acceptB, now + 7100);
    proof('retry repairs B acceptance without issuing an additional R20 event',
      acceptedB.status === 'applied' && witness.events === 4);
    proof('two writer-grant IDs remain unchanged in database',
      (await pool.query('SELECT grant_id::text FROM writer_studio_beta_grants WHERE member_id=$1',
        [writerB])).rows[0]?.grant_id === simultaneous[0].grantId);

    let stolenRejected = false;
    try {
      await run(intent('accepted', outsider, restoredA.grantId), now + 7300);
    } catch (e) { stolenRejected = e instanceof R8MutationRefused; }
    proof('an outsider cannot accept or appropriate A grant generation', stolenRejected);

    const revokeA = intent('revoked', writerA, restoredA.grantId);
    memberDb.failNext = true;
    let aRevocationDbFailed = false;
    try { await run(revokeA, now + 7500); } catch { aRevocationDbFailed = true; }
    proof('external revocation seals first, even while local DB still says accepted',
      aRevocationDbFailed && witness.getState(writerA) === 'revoked'
      && (await pool.query('SELECT grant_state FROM writer_studio_beta_grants WHERE member_id=$1',
        [writerA])).rows[0]?.grant_state === 'accepted');
    proof('R8 issuer cannot resurrect A with another operation after external revocation',
      await (async () => {
        try { await run(intent('issued', writerA), now + 8000); return false; }
        catch { return true; }
      })());
    const repairedRevokeA = await run(revokeA, now + 8500);
    proof('retry applies same external terminal A revoke in PostgreSQL',
      repairedRevokeA.status === 'applied'
      && (await pool.query('SELECT grant_state FROM writer_studio_beta_grants WHERE member_id=$1',
        [writerA])).rows[0]?.grant_state === 'revoked');
    proof('R8 sealed A revocation idempotency returns replay',
      (await run(revokeA, now + 9000)).status === 'replayed');
    proof('writer B remains active and accepted throughout unrelated A revocation',
      (await pool.query('SELECT grant_state FROM writer_studio_beta_grants WHERE member_id=$1',
        [writerB])).rows[0]?.grant_state === 'accepted');

    const after = await pool.query('SELECT issued_seats FROM writer_studio_pilot_admission_control');
    proof('terminal revocation does not replenish historical two-seat budget',
      after.rows[0]?.issued_seats === 2 && witness.issuedSeats === 2);
    await pool.query('DELETE FROM writer_studio_beta_grants WHERE member_id=$1', [writerA]);
    proof('fictional revoked-row cleanup cannot recycle an issued database seat',
      (await pool.query('SELECT issued_seats FROM writer_studio_pilot_admission_control'))
        .rows[0]?.issued_seats === 2);
    let staleIssuedIdRefused = false;
    try { await run(issueA, now + 9100); } catch (e) {
      staleIssuedIdRefused = e instanceof R8MutationRefused;
    }
    proof('externally revoked grant cannot re-seal its old issued idempotency ID',
      staleIssuedIdRefused);
    let staleAcceptIdRefused = false;
    try { await run(acceptA, now + 9150); } catch (e) {
      staleAcceptIdRefused = e instanceof R8MutationRefused;
    }
    proof('externally revoked grant cannot re-seal old accepted ID after local deletion',
      staleAcceptIdRefused);
    let afterCleanupDenied = false;
    try { await run(intent('issued', outsider), now + 9200); } catch {
      afterCleanupDenied = true;
    }
    proof('external R20 issuer still denies a third account after local row cleanup',
      afterCleanupDenied && witness.events === 5);

    const rows = await pool.query('SELECT count(*)::int AS n FROM writer_studio_beta_grants');
    proof('the fictional exercise did not create unexpected grants',
      rows.rows[0]?.n === 1);

    process.stdout.write('RESULT: ' + checks + '/' + checks
      + ' R8 fictional PostgreSQL16/Ed25519 reconciliation checks PASS\n');
  } finally {
    await pool.end();
  }
}
main().catch((error) => {
  process.stderr.write('R8 fictional PostgreSQL fixture FAILED ('
    + (error as Error).name + ')\n');
  process.exitCode = 1;
});
