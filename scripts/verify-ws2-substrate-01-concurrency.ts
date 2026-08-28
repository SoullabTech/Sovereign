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

/** Both racers start from a pair with NO row in either table. */
async function raceOnce(workId: string, materialId: string) {
  const a = await pool.connect();
  const b = await pool.connect();
  try {
    await a.query('BEGIN');
    await b.query('BEGIN');

    // Each transition deletes its counterpart first, exactly as the routes do.
    await a.query(
      `DELETE FROM living_work_materials
        WHERE living_work_id = $1 AND material_type = 'manuscript' AND material_id = $2`,
      [workId, materialId]
    );
    await b.query(
      `DELETE FROM living_work_material_considerations
        WHERE living_work_id = $1 AND material_type = 'manuscript' AND material_id = $2`,
      [workId, materialId]
    );

    // Now both insert. Whichever takes the pair lock first wins; the other
    // must be refused by the guard.
    const insertA = a.query(
      `INSERT INTO living_work_material_considerations
         (living_work_id, material_type, material_id, state, acted_by)
       VALUES ($1, 'manuscript', $2, 'maybe', $3)`,
      [workId, materialId, MEMBER]
    );
    const insertB = b.query(
      `INSERT INTO living_work_materials
         (living_work_id, material_type, material_id, relationship_sentence, declared_by)
       VALUES ($1, 'manuscript', $2, NULL, $3)`,
      [workId, materialId, MEMBER]
    );

    const results = await Promise.allSettled([insertA, insertB]);
    await Promise.allSettled([
      results[0].status === 'fulfilled' ? a.query('COMMIT') : a.query('ROLLBACK'),
      results[1].status === 'fulfilled' ? b.query('COMMIT') : b.query('ROLLBACK'),
    ]);
    return results;
  } finally {
    a.release();
    b.release();
  }
}

let MEMBER = '';

async function main() {
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
      const refused = results.filter((r) => r.status === 'rejected').length;
      if (refused > 1) {
        failures++;
        console.error(`[ws2-substrate-01] round ${i} FAIL — both racers refused.`);
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
