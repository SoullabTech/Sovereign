/**
 * Verification for ./teardown.ts. Runs against a DISPOSABLE database ONLY —
 * it writes fixtures, and Cases B and C leave rows behind on purpose (that IS
 * the assertion). It refuses to run against a database whose name does not
 * declare itself disposable.
 *
 *   createdb eval_teardown_test
 *   pg_dump --schema-only maia_consciousness | psql -q eval_teardown_test
 *   TEST_DB_URL=postgresql://soullab@localhost:5432/eval_teardown_test \
 *     npx tsx scripts/eval/lib/teardown.verify.ts
 *   dropdb eval_teardown_test
 *
 * Case A  ordinary fixture                 -> clean removal, dependency-ordered
 * Case B  append-only child present        -> refuses, rolls back, deletes nothing
 * Case C  real member points at the fixture-> refuses to delete the real member
 * Case D  statements split across backends -> refuses (transaction is fiction)
 * Case E  the xid premise Case D rests on  -> still true on this server
 */
import { Client } from 'pg';
import { teardownFixture, describeTeardown } from './teardown';

const URL = process.env.TEST_DB_URL ?? '';
if (!/_test(\b|$)|eval_teardown_test/.test(URL)) {
  throw new Error(
    'refusing: TEST_DB_URL must name a disposable database (…_test). This script writes fixtures and deliberately leaves some behind.',
  );
}
for (const marker of ['soullab.life', '192.168.0.104', 'minisforum']) {
  if (URL.includes(marker)) throw new Error(`refusing: production marker "${marker}" in TEST_DB_URL`);
}

const db = new Client({ connectionString: URL });

let failures = 0;
const check = (name: string, ok: boolean, detail: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name} :: ${detail}`);
  if (!ok) failures++;
};

const RUN = process.env.RUN_TAG || String(Date.now());

async function makeFixture(rawTag: string) {
  const tag = `${rawTag}${RUN}`;
  const m = await db.query(
    `INSERT INTO members (passkey, username, password_hash, name, email, onboarded, onboarding_step, tester)
     VALUES ($1,$2,'!x!','EVAL-SYNTHETIC',$3,true,'complete',true) RETURNING id`,
    [`EVAL-SYNTHETIC-${tag}`, `eval_${tag}`, `eval-${tag}@synthetic.invalid`],
  );
  const memberId = m.rows[0].id as string;
  const email = `eval-${tag}@synthetic.invalid`;
  await db.query(
    `INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1,$2,NOW()+interval '1 day')`,
    [memberId, `tok-${tag}`],
  );
  await db.query(
    `INSERT INTO magic_link_tokens (email, token, expires_at) VALUES ($1,$2,NOW()+interval '1 day')`,
    [email, `mtok-${tag}`],
  );
  const f = await db.query(
    `INSERT INTO practice_fields (practitioner_member_id, field_slug) VALUES ($1,$2) RETURNING id`,
    [memberId, `eval-field-${tag}`],
  );
  return { memberId, email, fieldId: f.rows[0].id as string };
}

const roots = (memberId: string, email: string) => [
  { table: 'auth_sessions', whereSql: 'member_id = $1', params: [memberId] },
  { table: 'magic_link_tokens', whereSql: 'email = $1', params: [email] },
  { table: 'members', whereSql: 'id = $1', params: [memberId] },
];

const count = async (sql: string, p: unknown[]) =>
  Number((await db.query(sql, p as any[])).rows[0].c);

async function main() {
  await db.connect();

  // ── Case A: ordinary fixture, incl. a child (practice_fields) the old code
  //    deleted in the wrong order. Expect clean, all rows gone.
  {
    const f = await makeFixture('a');
    const r = await teardownFixture(db as any, roots(f.memberId, f.email), { guardedTables: ['members'] });
    describeTeardown(r).forEach((l) => console.log('   ' + l));
    check('A clean', r.clean, `clean=${r.clean} blocked=${JSON.stringify(r.blocked)}`);
    const remaining =
      (await count('SELECT count(*) c FROM members WHERE id=$1', [f.memberId])) +
      (await count('SELECT count(*) c FROM practice_fields WHERE id=$1', [f.fieldId])) +
      (await count('SELECT count(*) c FROM auth_sessions WHERE member_id=$1', [f.memberId])) +
      (await count('SELECT count(*) c FROM magic_link_tokens WHERE email=$1', [f.email]));
    check('A no residue', remaining === 0, `${remaining} rows remain`);
    check('A ordered practice_fields before members',
      r.deleted.findIndex((d) => d.table.endsWith('practice_fields')) <
        r.deleted.findIndex((d) => d.table.endsWith('members')),
      JSON.stringify(r.deleted.map((d) => d.table)));
  }

  // ── Case B: the actual reported failure. A revision row makes the field
  //    undeletable BY DESIGN (append-only trigger + RESTRICT FK).
  {
    const f = await makeFixture('b');
    await db.query(
      `INSERT INTO practice_field_revisions (practice_field_id, revision_number, layers, saved_by)
       VALUES ($1, 1, '{}'::jsonb, 'steward')`,
      [f.fieldId],
    );
    const r = await teardownFixture(db as any, roots(f.memberId, f.email), { guardedTables: ['members'] });
    describeTeardown(r).forEach((l) => console.log('   ' + l));
    check('B refuses', !r.clean, `clean=${r.clean}`);
    check('B names the append-only table',
      r.blocked.some((b) => b.table.includes('practice_field_revisions') && /append-only/.test(b.reason)),
      JSON.stringify(r.blocked));
    // The whole point of the transaction: a refusal deletes NOTHING.
    const kept =
      (await count('SELECT count(*) c FROM members WHERE id=$1', [f.memberId])) +
      (await count('SELECT count(*) c FROM auth_sessions WHERE member_id=$1', [f.memberId])) +
      (await count('SELECT count(*) c FROM magic_link_tokens WHERE email=$1', [f.email]));
    check('B rolled back (no partial teardown)', kept === 3, `${kept}/3 fixture rows still present`);
    check('B revision untouched',
      (await count('SELECT count(*) c FROM practice_field_revisions WHERE practice_field_id=$1', [f.fieldId])) === 1,
      'append-only row survived — no guard was disabled');
  }

  // ── Case C: a real member pointing at the fixture must never be deleted.
  {
    const f = await makeFixture('c');
    const other = await db.query(
      `INSERT INTO members (passkey, username, password_hash, name, email, onboarded, onboarding_step, invited_by)
       VALUES ($2,$3,'!x!','Real Person',$4,true,'complete',$1) RETURNING id`,
      [f.memberId, `REAL-C-${RUN}`, `real_c_${RUN}`, `real-c-${RUN}@example.test`],
    );
    const r = await teardownFixture(db as any, roots(f.memberId, f.email), { guardedTables: ['members'] });
    describeTeardown(r).forEach((l) => console.log('   ' + l));
    check('C refuses', !r.clean, `clean=${r.clean}`);
    check('C real member survives',
      (await count('SELECT count(*) c FROM members WHERE id=$1', [other.rows[0].id])) === 1,
      'non-fixture member was not deleted');
  }

  // ── Case D: a facade that spreads statements across backends — what
  //    pool.query() does under contention — must be caught, not silently
  //    executed outside the transaction. Simulated deterministically by
  //    alternating two live connections.
  {
    const c1 = new Client({ connectionString: URL });
    const c2 = new Client({ connectionString: URL });
    await c1.connect();
    await c2.connect();
    let n = 0;
    const roundRobin = { query: (s: string, p?: unknown[]) => (n++ % 2 ? c2 : c1).query(s, p as any[]) };
    let msg = '';
    try {
      await teardownFixture(roundRobin as any, [], {});
    } catch (e) {
      msg = e instanceof Error ? e.message : String(e);
    }
    await c1.end();
    await c2.end();
    check('D rejects split-connection facade', /not running in one transaction/.test(msg), msg || '(no error thrown)');
  }

  // ── Case E: the guard's premise — outside a transaction block, consecutive
  //    statements on the SAME connection must fingerprint differently. If this
  //    ever stops holding, Case D's protection is vacuous.
  {
    const solo = new Client({ connectionString: URL });
    await solo.connect();
    const a = await solo.query('SELECT pg_backend_pid() AS pid, transaction_timestamp() AS ts, pg_current_xact_id()::text AS xid');
    const b = await solo.query('SELECT pg_backend_pid() AS pid, transaction_timestamp() AS ts, pg_current_xact_id()::text AS xid');
    await solo.query('BEGIN');
    const c = await solo.query('SELECT pg_current_xact_id()::text AS xid');
    const d = await solo.query('SELECT pg_current_xact_id()::text AS xid');
    await solo.query('COMMIT');
    await solo.end();
    check('E xid distinguishes tx from no-tx',
      a.rows[0].xid !== b.rows[0].xid && c.rows[0].xid === d.rows[0].xid,
      `no-tx ${a.rows[0].xid} vs ${b.rows[0].xid}; in-tx ${c.rows[0].xid} vs ${d.rows[0].xid}`);
  }

  await db.end();
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('crashed:', e);
  process.exit(2);
});
