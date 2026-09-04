#!/usr/bin/env tsx
/**
 * SELF-ADDRESSED-RETURN-01 Tier 1 — §7.6 real-database integration proof.
 *
 * The four cases §7.6 named as remaining before the production witness:
 *
 *   1. creation is member-owned, and cannot create for another member
 *   2. a `sacred_protected` source is refused
 *   3. cancellation is idempotent
 *   4. two REAL, INDEPENDENT database connections race the same due reminder,
 *      and exactly one obtains dispatch authority
 *
 * Requires a real Postgres, and nothing here is mocked. §7.6 is explicit that a
 * mocked integration test asserts the mock: the ownership and sacred_protected
 * gates are single SQL predicates, and the dispatch race is decided by MVCC and
 * FOR UPDATE SKIP LOCKED. None of that has any meaning against a fake client.
 *
 * DESTRUCTIVE — deletes from members / member_memory_atoms / member_reminders.
 * Run it ONLY against a disposable database:
 *
 *   DATABASE_URL=postgresql://…/maia_sar01_integration \
 *     npx tsx scripts/verify-reminders-integration.ts
 */

import { Client } from 'pg';
import { query, closePool } from '../lib/db/postgres';
import { verifyReminderSource } from '../lib/reminders/source';
import { beginDispatch, cancelIfNotDispatching, claimDue } from '../lib/reminders/dispatch';

let passed = 0;
let failed = 0;

function ok(label: string, detail = '') {
  passed++;
  console.log(`  \x1b[32m✔\x1b[0m ${label}${detail ? `  \x1b[2m(${detail})\x1b[0m` : ''}`);
}
function bad(label: string, detail = '') {
  failed++;
  console.log(`  \x1b[31m✘\x1b[0m ${label}${detail ? `  \x1b[31m→ ${detail}\x1b[0m` : ''}`);
}
function expect(cond: boolean, label: string, detail = '') {
  cond ? ok(label) : bad(label, detail);
}

/**
 * Refuse to run against anything that is not an obviously disposable database.
 *
 * This script issues unqualified DELETEs. The dispatch verifier alongside it
 * does the same and carries no such guard — pointing either at a real
 * environment would wipe its members table.
 */
async function assertDisposableDatabase(): Promise<string> {
  // current_database() over the live connection, not a parse of DATABASE_URL:
  // the URL is not authoritative about where the client actually lands (the
  // database segment may be absent, PGDATABASE may override it, an alias may
  // redirect it). The connection itself is the only thing that knows.
  const r = await query<{ db: string }>(`SELECT current_database() AS db`);
  const db = r.rows[0].db;
  if (!/(^|_)(test|integration)$/.test(db)) {
    console.error(
      `\x1b[31mREFUSING TO RUN\x1b[0m — this script issues unqualified DELETEs and the ` +
        `connected database is "${db}", which is not disposable.\n` +
        `Its name must end in _test or _integration. No statement has been executed.`
    );
    await closePool().catch(() => {});
    process.exit(2);
  }
  return db;
}

async function makeMember(tag: string): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO members (email, passkey, username, password_hash)
     VALUES ($1, $2, $3, 'not-a-real-hash') RETURNING id`,
    [`${tag}@example.test`, `SOULLAB-${tag.toUpperCase()}`, tag]
  );
  return r.rows[0].id;
}

async function makeAtom(memberId: string, registers: string[]): Promise<string> {
  // 'spontaneous' is the one source_type that carries its own body rather than
  // pointing at another object, so it needs no upstream fixture row.
  // The schema requires a sacred_protected atom to carry status='protected'
  // (constraint sacred_protected_register_status) — the register and the status
  // are one fact, not two, so the fixture must not be able to create the
  // half-state the constraint exists to forbid.
  const status = registers.includes('sacred_protected') ? 'protected' : 'active';
  const r = await query<{ id: string }>(
    `INSERT INTO member_memory_atoms (member_id, source_type, title, body, registers, status)
     VALUES ($1, 'spontaneous', 'a thing the member chose to keep',
             'the member''s own words', $2, $3)
     RETURNING id`,
    [memberId, registers, status]
  );
  return r.rows[0].id;
}

/** cancel_token_hash is UNIQUE; fixtures only need distinctness, not realism. */
let reminderSeq = 0;

/** A due, un-claimed reminder — the shape the worker is allowed to see. */
async function makeDueReminder(memberId: string): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO member_reminders
       (member_id, source_type, source_id, delivery_at, delivery_timezone,
        delivery_deadline, delivery_text, cancel_token_hash)
     VALUES ($1, 'member_note', NULL, now() - interval '1 minute', 'America/New_York',
             now() + interval '1 hour', 'the words the member approved', $2)
     RETURNING id`,
    [memberId, `cancel-token-hash-${++reminderSeq}`]
  );
  return r.rows[0].id;
}

async function main() {
  const dbName = await assertDisposableDatabase();

  await query(`DELETE FROM member_reminders`);
  await query(`DELETE FROM member_memory_atoms`);
  await query(`DELETE FROM members`);

  console.log('\n\x1b[1mSELF-ADDRESSED-RETURN-01 §7.6 — real-database integration proof\x1b[0m');
  console.log(`\x1b[2mdatabase: ${dbName}\x1b[0m\n`);

  const alice = await makeMember('alice');
  const bob = await makeMember('bob');

  // ── 0. The table's constitutional constraints actually REFUSE ───────────
  // Declared constraints are not enforcement until the database rejects the row.
  // Each of these is a state the spec says must be unrepresentable.
  console.log('\x1b[1m0. member_reminders constraints refuse the states they forbid\x1b[0m');
  {
    const base = `INSERT INTO member_reminders
      (member_id, source_type, source_id, delivery_at, delivery_timezone,
       delivery_deadline, delivery_text, cancel_token_hash`;

    async function refuses(label: string, cols: string, vals: string, constraint: string) {
      const hash = `constraint-probe-${++reminderSeq}`;
      try {
        await query(
          `${base}${cols})
           VALUES ($1, 'member_note', NULL, now(), 'America/New_York',
                   now() + interval '1 hour', 'words', '${hash}'${vals})`,
          [alice]
        );
        bad(label, 'the database ACCEPTED a state the spec forbids');
      } catch (e: unknown) {
        const c = (e as { constraint?: string }).constraint ?? '';
        expect(c === constraint, label, `expected ${constraint}, got ${c || String(e)}`);
      }
    }

    await refuses(
      'cancelled AND dispatched is unrepresentable',
      ', cancelled_at, claimed_at, claim_token, claim_expires_at, dispatch_started_at',
      `, now(), now(), gen_random_uuid(), now() + interval '5 min', now()`,
      'member_reminders_cancel_xor_dispatch'
    );
    await refuses(
      'delivery without a dispatch is unrepresentable',
      ', delivered_at',
      ', now()',
      'member_reminders_delivery_requires_dispatch'
    );
    await refuses(
      'dispatch without a claim is unrepresentable',
      ', dispatch_started_at',
      ', now()',
      'member_reminders_dispatch_requires_claim'
    );
    await refuses(
      'a partial claim lease is unrepresentable',
      ', claimed_at',
      ', now()',
      'member_reminders_claim_is_whole'
    );
    await refuses(
      'a failure code without a failure time is unrepresentable',
      ', failure_code',
      `, 'expired'`,
      'member_reminders_failure_code_with_failed_at'
    );

    // A deadline before the delivery instant would make the reminder born expired.
    try {
      await query(
        `INSERT INTO member_reminders
           (member_id, source_type, source_id, delivery_at, delivery_timezone,
            delivery_deadline, delivery_text, cancel_token_hash)
         VALUES ($1, 'member_note', NULL, now(), 'America/New_York',
                 now() - interval '1 hour', 'words', 'probe-deadline')`,
        [alice]
      );
      bad('a deadline before delivery is unrepresentable', 'ACCEPTED');
    } catch (e: unknown) {
      expect(
        (e as { constraint?: string }).constraint === 'member_reminders_deadline_after_delivery',
        'a deadline before delivery is unrepresentable'
      );
    }

    // member_note carries no source object; a typed source must name one.
    try {
      await query(
        `INSERT INTO member_reminders
           (member_id, source_type, source_id, delivery_at, delivery_timezone,
            delivery_deadline, delivery_text, cancel_token_hash)
         VALUES ($1, 'memory_atom', NULL, now(), 'America/New_York',
                 now() + interval '1 hour', 'words', 'probe-source')`,
        [alice]
      );
      bad('a typed source with no source_id is unrepresentable', 'ACCEPTED');
    } catch (e: unknown) {
      expect(
        (e as { constraint?: string }).constraint ===
          'member_reminders_source_id_present_unless_note',
        'a typed source with no source_id is unrepresentable'
      );
    }

    // Absence-blindness, asserted against the LIVE table rather than the migration
    // text: a column that does not exist cannot be read by a future patch.
    const forbidden = await query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'member_reminders'
          AND column_name IN ('last_seen','last_active','days_absent','engagement_score',
                              'return_status','opened_then_returned','inferred_need',
                              'priority','recipient_email')`
    );
    expect(
      forbidden.rows.length === 0,
      'the live table carries no absence, engagement, or recipient column',
      forbidden.rows.map((r) => r.column_name).join(', ')
    );
  }

  // ── 1. Creation is member-owned ─────────────────────────────────────────
  console.log('\x1b[1m1. Creation is member-owned\x1b[0m');
  {
    const aliceAtom = await makeAtom(alice, ['episodic']);

    const own = await verifyReminderSource(alice, 'memory_atom', aliceAtom);
    expect(own.ok === true, 'a member may schedule the return of their OWN atom');

    const other = await verifyReminderSource(bob, 'memory_atom', aliceAtom);
    expect(
      other.ok === false && other.status === 404,
      "another member's atom is refused",
      JSON.stringify(other)
    );

    // The ownership predicate is in SQL, so the refusal cannot be reached by a
    // caller who supplies a member id in the body: the id comes from the session.
    const absent = await verifyReminderSource(bob, 'memory_atom', aliceAtom);
    const missing = await verifyReminderSource(
      bob,
      'memory_atom',
      '00000000-0000-0000-0000-000000000000'
    );
    expect(
      absent.ok === false &&
        missing.ok === false &&
        absent.status === missing.status &&
        absent.error === missing.error,
      "someone else's atom is indistinguishable from one that does not exist",
      `${JSON.stringify(absent)} vs ${JSON.stringify(missing)}`
    );

    const noteWithId = await verifyReminderSource(alice, 'member_note', aliceAtom);
    expect(
      noteWithId.ok === false && noteWithId.status === 400,
      'member_note carrying a source id is rejected'
    );

    const note = await verifyReminderSource(alice, 'member_note', null);
    expect(note.ok === true, 'a member_note needs no source object');
  }

  // ── 2. sacred_protected is refused ──────────────────────────────────────
  console.log('\n\x1b[1m2. sacred_protected source is refused\x1b[0m');
  {
    const sacred = await makeAtom(alice, ['sacred_protected']);
    const res = await verifyReminderSource(alice, 'memory_atom', sacred);
    expect(
      res.ok === false && res.status === 404,
      'the member\'s OWN sacred_protected atom is refused',
      JSON.stringify(res)
    );

    // R04 excludes sacred_protected from ambient recall; scheduling one into the
    // inbox would route around that through a different door (§6.6).
    const missing = await verifyReminderSource(
      alice,
      'memory_atom',
      '00000000-0000-0000-0000-000000000000'
    );
    expect(
      res.ok === false &&
        missing.ok === false &&
        res.status === missing.status &&
        res.error === missing.error,
      'the refusal reveals nothing about which case occurred',
      `${JSON.stringify(res)} vs ${JSON.stringify(missing)}`
    );

    // Webbing: an atom in several registers, one of which is sacred_protected,
    // is still refused — the predicate is ANY(), not equality on a scalar.
    const webbed = await makeAtom(alice, ['episodic', 'sacred_protected', 'thematic']);
    const webRes = await verifyReminderSource(alice, 'memory_atom', webbed);
    expect(
      webRes.ok === false,
      'an atom webbed across registers is refused if ANY of them is sacred_protected'
    );

    const ordinary = await makeAtom(alice, ['episodic', 'thematic']);
    expect(
      (await verifyReminderSource(alice, 'memory_atom', ordinary)).ok === true,
      'a non-sacred atom in the same registers is still available (non-vacuous)'
    );
  }

  // ── 3. Cancellation is idempotent ───────────────────────────────────────
  console.log('\n\x1b[1m3. Cancellation is idempotent\x1b[0m');
  {
    const id = await makeDueReminder(alice);

    const first = await cancelIfNotDispatching({ id, memberId: alice });
    expect(first === 'cancelled', 'first cancellation succeeds', first);

    const second = await cancelIfNotDispatching({ id, memberId: alice });
    expect(second === 'cancelled', 'cancelling again still reports cancelled', second);

    const third = await cancelIfNotDispatching({ id, memberId: alice });
    expect(third === 'cancelled', 'and again — the answer is stable, not a failure', third);

    const rows = await query<{ n: string }>(
      `SELECT count(*) AS n FROM member_reminders WHERE id = $1 AND cancelled_at IS NOT NULL`,
      [id]
    );
    expect(rows.rows[0].n === '1', 'the row is cancelled exactly once, not re-stamped');

    const byOther = await cancelIfNotDispatching({ id, memberId: bob });
    expect(
      byOther === 'not_found',
      'another member cannot cancel it, and learns nothing about it',
      byOther
    );

    // Idempotence must not extend past the linearization point: once dispatch
    // has begun, the honest answer changes.
    const live = await makeDueReminder(alice);
    const [claim] = (await claimDue(10)).filter((r) => r.id === live);
    expect(!!claim, 'a due reminder is claimable');
    const began = await beginDispatch(live, claim.claim_token);
    expect(began.ok === true, 'dispatch begins');
    const afterDispatch = await cancelIfNotDispatching({ id: live, memberId: alice });
    expect(
      afterDispatch === 'already_sending',
      'after dispatch begins cancellation reports already_sending, not a false success',
      afterDispatch
    );
  }

  // ── 4. Two INDEPENDENT connections race one due reminder ────────────────
  console.log('\n\x1b[1m4. Two independent connections race one due reminder\x1b[0m');
  {
    const id = await makeDueReminder(alice);
    const url = process.env.DATABASE_URL!;

    // Genuinely separate TCP connections and separate backends — not two calls
    // multiplexed over one client, and not the shared pool.
    const a = new Client({ connectionString: url });
    const b = new Client({ connectionString: url });
    await a.connect();
    await b.connect();

    const backends = await Promise.all([
      a.query<{ pid: number }>('SELECT pg_backend_pid() AS pid'),
      b.query<{ pid: number }>('SELECT pg_backend_pid() AS pid'),
    ]);
    const pidA = backends[0].rows[0].pid;
    const pidB = backends[1].rows[0].pid;
    expect(pidA !== pidB, 'the two connections are distinct server backends', `${pidA} vs ${pidB}`);

    // The exact claim the worker runs, issued simultaneously on both backends.
    const CLAIM = `
      WITH due AS (
        SELECT id FROM member_reminders
         WHERE delivery_at <= now() AND cancelled_at IS NULL AND delivered_at IS NULL
           AND failed_at IS NULL AND dispatch_started_at IS NULL
           AND (claim_expires_at IS NULL OR claim_expires_at < now())
         ORDER BY delivery_at LIMIT 10
         FOR UPDATE SKIP LOCKED
      )
      UPDATE member_reminders r
         SET claimed_at = now(), claim_token = gen_random_uuid(),
             claim_expires_at = now() + interval '5 minutes'
        FROM due WHERE r.id = due.id
      RETURNING r.id, r.claim_token`;

    const [ra, rb] = await Promise.all([
      a.query<{ id: string; claim_token: string }>(CLAIM),
      b.query<{ id: string; claim_token: string }>(CLAIM),
    ]);

    const claimants = [...ra.rows, ...rb.rows].filter((r) => r.id === id);
    expect(
      claimants.length === 1,
      'exactly one connection leases the reminder (FOR UPDATE SKIP LOCKED)',
      `${claimants.length} claimants`
    );

    // Dispatch authority: even if both somehow held a token, only one UPDATE can
    // set the linearization point — the loser must be told it lost.
    const winner = claimants[0];
    const first = await beginDispatch(id, winner.claim_token);
    expect(first.ok === true, 'the claimant obtains dispatch authority');

    const second = await beginDispatch(id, winner.claim_token);
    expect(
      second.ok === false && second.reason === 'already_dispatched',
      'a second dispatch on the same row is refused',
      JSON.stringify(second)
    );

    const forged = await beginDispatch(id, '00000000-0000-0000-0000-000000000000');
    expect(
      forged.ok === false,
      'a connection without the winning claim token cannot dispatch',
      JSON.stringify(forged)
    );

    const sent = await query<{ n: string }>(
      `SELECT count(*) AS n FROM member_reminders
        WHERE id = $1 AND dispatch_started_at IS NOT NULL AND delivery_attempts = 1`,
      [id]
    );
    expect(
      sent.rows[0].n === '1',
      'the member’s words were dispatched exactly once, never twice'
    );

    await a.end();
    await b.end();
  }

  // ── Invariants ──────────────────────────────────────────────────────────
  console.log('\n\x1b[1mInvariants across every row touched\x1b[0m');
  {
    const both = await query<{ n: string }>(
      `SELECT count(*) AS n FROM member_reminders
        WHERE cancelled_at IS NOT NULL AND dispatch_started_at IS NOT NULL`
    );
    expect(both.rows[0].n === '0', 'no row is both cancelled and dispatched');

    const orphan = await query<{ n: string }>(
      `SELECT count(*) AS n FROM member_reminders
        WHERE delivered_at IS NOT NULL AND dispatch_started_at IS NULL`
    );
    expect(orphan.rows[0].n === '0', 'no delivery without a dispatch');

    const crossMember = await query<{ n: string }>(
      `SELECT count(*) AS n FROM member_reminders r
         JOIN member_memory_atoms a ON a.id = r.source_id
        WHERE a.member_id <> r.member_id`
    );
    expect(crossMember.rows[0].n === '0', 'no reminder points at another member’s atom');
  }

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(
    `\x1b[1m${passed} passed · ${failed} failed\x1b[0m` +
      (failed === 0 ? '\n\n✅ §7.6 holds against a real database.\n' : '\n')
  );

  await closePool();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await closePool().catch(() => {});
  process.exit(1);
});
