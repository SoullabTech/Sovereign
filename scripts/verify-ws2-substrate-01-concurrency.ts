/**
 * WS2-SUBSTRATE-01 Repair 2 — the concurrency falsification, against a real
 * PostgreSQL. PRE-MERGE GATE. Must pass on a host with a database.
 *
 * The jest suite pins the guard's STRUCTURE (the pair lock exists, is
 * transaction-scoped, and is taken before either counterpart read). Structure
 * is not proof. This drives two genuinely concurrent transactions at one
 * material/Work pair and asserts the invariant the migration claims:
 *
 *   a consideration and a belonging declaration cannot both exist
 *   for one pair — even when two member acts race from an empty start
 *
 * Without the lock this test fails: both transactions see an empty counterpart
 * under READ COMMITTED and both commit.
 *
 *   npx tsx scripts/verify-ws2-substrate-01-concurrency.ts
 *
 * Exits 0 on PASS, 1 on FAIL. Creates and removes its own fixtures; it does
 * not read or alter any member's data.
 */
import { Pool } from 'pg';

const DB = process.env.DATABASE_URL;
if (!DB) {
  console.error('[ws2-substrate-01] DATABASE_URL is unset. This gate needs a real database.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DB });

/**
 * PRECONDITION. The probe does not apply the candidate migration; it proves
 * that an applied one holds. Say so clearly rather than dying on a generic
 * missing-relation error twenty lines later.
 */
async function requireCandidateSchema() {
  const missing: string[] = [];

  const table = await pool.query(
    `SELECT to_regclass('public.living_work_material_considerations') AS t`
  );
  if (!table.rows[0].t) missing.push('table living_work_material_considerations');

  const fn = await pool.query(
    `SELECT prosrc FROM pg_proc WHERE proname = 'refuse_material_relationship_conflict'`
  );
  if (fn.rows.length === 0) {
    missing.push('function refuse_material_relationship_conflict');
  } else if (!fn.rows.some((r) => String(r.prosrc).includes('pg_advisory_xact_lock'))) {
    /* The exact failure that produced this probe: a guard exists, and it is the
       raceable one. Name it, so a FAIL is not mistaken for a design defect. */
    missing.push(
      'the INSTALLED refuse_material_relationship_conflict has no pg_advisory_xact_lock ' +
        '— an older, raceable copy is in this database'
    );
  }

  for (const t of [
    'living_work_material_considerations_no_declaration',
    'living_work_materials_no_consideration',
  ]) {
    const trg = await pool.query(`SELECT 1 FROM pg_trigger WHERE tgname = $1`, [t]);
    if (trg.rows.length === 0) missing.push(`trigger ${t}`);
  }

  if (missing.length > 0) {
    console.error('[ws2-substrate-01] PRECONDITION NOT MET — the candidate is not applied here:');
    for (const m of missing) console.error(`  · ${m}`);
    console.error(
      '\nApply database/migrations/20260828000001_living_work_material_considerations.sql ' +
        'to a DISPOSABLE database and re-run. Do not apply it to production to make this ' +
        'probe executable.'
    );
    process.exit(1);
  }
}

/** PostgreSQL restrict_violation, which the guard raises. */
const RESTRICT_VIOLATION = '23001';
const CONFLICT_PREFIX = 'material_relationship_conflict:';

/**
 * One racer, start to finish, on its own connection.
 *
 * The commit MUST live inside this path. An earlier version awaited both
 * inserts and only then committed — which deadlocks exactly when the lock
 * works: the winner holds a transaction-scoped lock it cannot release until
 * COMMIT, the loser blocks on that lock, and the script waits for the loser
 * before committing the winner. The test would hang as proof of success.
 */
async function racer(
  client: { query: (q: string, v?: unknown[]) => Promise<unknown> },
  deleteSql: string,
  insertSql: string,
  values: unknown[]
): Promise<'committed'> {
  try {
    await client.query('BEGIN');
    await client.query(deleteSql, values.slice(0, 2));
    await client.query(insertSql, values);
    await client.query('COMMIT');
    return 'committed';
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  }
}

/** Both racers start from a pair with NO row in either table. */
async function raceOnce(workId: string, materialId: string) {
  const a = await pool.connect();
  const b = await pool.connect();
  try {
    return await Promise.allSettled([
      racer(
        a,
        `DELETE FROM living_work_materials
          WHERE living_work_id = $1 AND material_type = 'manuscript' AND material_id = $2`,
        `INSERT INTO living_work_material_considerations
           (living_work_id, material_type, material_id, state, acted_by)
         VALUES ($1, 'manuscript', $2, 'maybe', $3)`,
        [workId, materialId, MEMBER]
      ),
      racer(
        b,
        `DELETE FROM living_work_material_considerations
          WHERE living_work_id = $1 AND material_type = 'manuscript' AND material_id = $2`,
        `INSERT INTO living_work_materials
           (living_work_id, material_type, material_id, relationship_sentence, declared_by)
         VALUES ($1, 'manuscript', $2, NULL, $3)`,
        [workId, materialId, MEMBER]
      ),
    ]);
  } finally {
    a.release();
    b.release();
  }
}

let MEMBER = '';

async function main() {
  await requireCandidateSchema();

  let failures = 0;
  const ROUNDS = 25; // a race that only sometimes loses is still a defect

  // ── Fixtures ──────────────────────────────────────────────────────────────
  const member = await pool.query(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1, $1, 'x', 'WS2 substrate probe') RETURNING id`,
    [`WS2-PROBE-${Date.now()}`]
  );
  MEMBER = member.rows[0].id;
  const work = await pool.query(
    `INSERT INTO living_works (member_id, title) VALUES ($1, 'probe') RETURNING id`,
    [MEMBER]
  );
  const workId = work.rows[0].id;
  const ms = await pool.query(
    `INSERT INTO member_manuscripts (member_id, title, provenance)
     VALUES ($1, 'probe', 'member_written') RETURNING id`,
    [MEMBER]
  );
  const materialId = ms.rows[0].id;

  try {
    for (let i = 1; i <= ROUNDS; i++) {
      const results = await raceOnce(workId, materialId);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

      /* EXACTLY ONE WINNER. Not "at most one row pair" — one act commits and
         the other is refused. Two winners is the race; two losers is a guard
         that refuses everything. */
      if (fulfilled.length !== 1 || rejected.length !== 1) {
        failures++;
        console.error(
          `[ws2-substrate-01] round ${i} FAIL — expected exactly one winner and one ` +
            `refusal; got ${fulfilled.length} committed, ${rejected.length} refused.`
        );
      }

      /* And the refusal must be THE refusal — not a deadlock, a unique
         violation, or a connection error that happens to look like success. */
      for (const r of rejected) {
        const e = r.reason as { code?: string; message?: string };
        if (e?.code !== RESTRICT_VIOLATION || !e?.message?.includes(CONFLICT_PREFIX)) {
          failures++;
          console.error(
            `[ws2-substrate-01] round ${i} FAIL — refusal was not the guard's. ` +
              `code=${e?.code ?? 'none'} message=${(e?.message ?? '').slice(0, 120)}`
          );
        }
      }

      const both = await pool.query(
        `SELECT
           (SELECT count(*) FROM living_work_materials
             WHERE living_work_id = $1 AND material_id = $2) AS declarations,
           (SELECT count(*) FROM living_work_material_considerations
             WHERE living_work_id = $1 AND material_id = $2) AS considerations`,
        [workId, materialId]
      );
      const d = Number(both.rows[0].declarations);
      const c = Number(both.rows[0].considerations);

      if (d > 0 && c > 0) {
        failures++;
        console.error(
          `[ws2-substrate-01] round ${i} FAIL — Belongs AND consideration coexist ` +
            `(declarations=${d}, considerations=${c}). The pair lock is not holding.`
        );
      }
      if (d + c === 0) {
        failures++;
        console.error(
          `[ws2-substrate-01] round ${i} FAIL — both writes lost; expected exactly one winner.`
        );
      }

      // Reset the pair for the next round.
      await pool.query(
        `DELETE FROM living_work_materials WHERE living_work_id = $1 AND material_id = $2`,
        [workId, materialId]
      );
      await pool.query(
        `DELETE FROM living_work_material_considerations
          WHERE living_work_id = $1 AND material_id = $2`,
        [workId, materialId]
      );
    }
  } finally {
    // ── Fixture cleanup. living_works and member_manuscripts cascade. ────────
    await pool.query(`DELETE FROM living_works WHERE id = $1`, [workId]);
    await pool.query(`DELETE FROM member_manuscripts WHERE id = $1`, [materialId]);
    await pool.query(`DELETE FROM members WHERE id = $1`, [MEMBER]);
    await pool.end();
  }

  if (failures > 0) {
    console.error(`\n[ws2-substrate-01] FAIL — ${failures} violation(s) across ${ROUNDS} rounds.`);
    process.exit(1);
  }
  console.log(
    `\n[ws2-substrate-01] PASS — ${ROUNDS} rounds, exactly one winner each time. ` +
      'Belongs and consideration never coexisted.'
  );
}

main().catch((e) => {
  console.error('[ws2-substrate-01] probe failed to run', e);
  process.exit(1);
});
