/**
 * WS-DELETE-01 — positive proof that reconstructive provenance does not survive.
 *
 * Founder ruling 2026-09-07, closure condition 2:
 *
 *   "Audit every substrate touched by the manuscript cascade and record the
 *    post-erasure survivor set. Positive proof is required that no surviving row
 *    or object retains extracted text, manuscript content, content-bearing
 *    derivatives, or anything sufficient to reconstruct the writing. Do not infer
 *    this from FK/cascade definitions alone."
 *
 * ── Why this does not read the migrations ────────────────────────────────
 * A cascade audit built from `REFERENCES member_manuscripts` proves what the
 * migration FILES say. It cannot see a table whose migration never ran, a column
 * added by hand, a soft reference carrying no FK at all (living_work_expressions
 * is exactly that), or a substrate nobody thought to grep for. Reading the
 * schema to decide what to check would make the check inherit the blind spots of
 * the person writing it.
 *
 * So this proves the property directly. Every content field of a real manuscript
 * is seeded with an unguessable sentinel; the manuscript is erased; then EVERY
 * text-ish column of EVERY table in the database is scanned for that sentinel.
 * A survivor anywhere is a failure, and the failure NAMES the table and column —
 * including one this file has never heard of.
 *
 * The vault file is seeded with the same sentinel and must be absent afterwards.
 *
 * ── What may legitimately survive ────────────────────────────────────────
 * Non-reconstructive audit provenance. The sentinel is CONTENT, so a row that
 * holds only counts, timestamps, or opaque ids passes: it never contained the
 * sentinel to begin with. That is the line the ruling draws, made mechanical —
 * survivors are judged by whether the member's writing can be recovered from
 * them, not by whether a row exists.
 *
 * ── Usage ────────────────────────────────────────────────────────────────
 *   DATABASE_URL=… npx tsx scripts/witness/ws-delete-01-erasure-witness.ts
 *
 * Read-write: it creates its own member and material, and removes them. It never
 * touches anything it did not create. Exits non-zero on any failure.
 */

import { randomUUID, createHash } from 'crypto';
import { writeFile, mkdir, stat, rmdir } from 'fs/promises';
import { spawnSync } from 'child_process';
import path from 'path';
import { query, closePool } from '../../lib/db/postgres';
import { resolveVaultRoot } from '../../lib/storage/fileVault';
import { eraseManuscript, sweepVaultErasureQueue } from '../../lib/manuscript/source/eraseManuscript';

/* Unguessable, and shaped so it cannot occur in real writing or collide with a
   previous run. Every content field of the doomed manuscript gets this. */
const RUN = randomUUID().replace(/-/g, '');
const SENTINEL = `WSDELETE01SENTINEL${RUN}`;
/* A second manuscript, untouched by the erasure, proves the act is not simply
   deleting everything in sight. */
const BYSTANDER = `WSDELETE01BYSTANDER${RUN}`;

let failures = 0;
let checks = 0;

function check(name: string, pass: boolean, detail = '') {
  checks += 1;
  if (!pass) failures += 1;
  console.log(`${pass ? '  ok  ' : 'FAIL  '}${name}${detail ? ` — ${detail}` : ''}`);
}

/** Columns anywhere in the database that could hold a member's words. */
async function contentColumns() {
  const res = await query<{ table_name: string; column_name: string }>(
    `SELECT c.table_name, c.column_name
       FROM information_schema.columns c
       JOIN information_schema.tables t
         ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND c.data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
      ORDER BY c.table_name, c.column_name`,
  );
  return res.rows;
}

/** Every place the needle still appears, named precisely. */
async function findSurvivors(needle: string) {
  const found: string[] = [];
  for (const { table_name, column_name } of await contentColumns()) {
    try {
      const hit = await query<{ n: number }>(
        `SELECT count(*)::int AS n FROM "${table_name}" WHERE "${column_name}"::text LIKE $1`,
        [`%${needle}%`],
      );
      if ((hit.rows[0]?.n ?? 0) > 0) {
        found.push(`${table_name}.${column_name} (${hit.rows[0].n} row(s))`);
      }
    } catch (err) {
      /* A column we cannot scan is not a column we may assume is clean. */
      found.push(`${table_name}.${column_name} UNSCANNABLE: ${(err as Error).message}`);
    }
  }
  return found;
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

async function seedManuscript(memberId: string, marker: string) {
  const manuscriptId = (
    await query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, `${marker} title`],
    )
  ).rows[0].id;

  await query(
    `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
     VALUES ($1, 1, $2, $3)`,
    [manuscriptId, `${marker} heading`, `${marker} section body`],
  );

  await query(
    `INSERT INTO manuscript_working_drafts (manuscript_id, member_id, content, base_source_hash)
     VALUES ($1, $2, $3, $4)`,
    [manuscriptId, memberId, `${marker} draft content`, sha(marker)],
  );

  /* Source custody: the extracted text AND real bytes on disk. */
  const rel = path.join('ws-delete-01', `${marker}.txt`);
  const full = path.join(resolveVaultRoot(), rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, `${marker} the original uploaded bytes`);

  await query(
    `INSERT INTO manuscript_source_arrivals
       (member_id, manuscript_id, source_kind, artifact_ref, artifact_hash, artifact_size,
        original_filename, mime_type, source_text, source_text_hash,
        extraction_method, extractor_version)
     VALUES ($1,$2,'artifact_extraction',$3,$4,$5,$6,'text/plain',$7,$8,'witness','1')`,
    [
      memberId, manuscriptId, rel, sha(marker), 42,
      `${marker}.txt`, `${marker} extracted source text`, sha(marker),
    ],
  );

  const workId = (
    await query<{ id: string }>(
      `INSERT INTO living_works (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, `${marker} work`],
    )
  ).rows[0].id;
  await query(
    `INSERT INTO living_work_expressions
       (living_work_id, expression_type, expression_id, declared_by)
     VALUES ($1, 'manuscript', $2, $3)`,
    [workId, manuscriptId, memberId],
  );

  return { manuscriptId, workId, vaultPath: full };
}

const absent = async (p: string) => {
  try {
    await stat(p);
    return false;
  } catch {
    return true;
  }
};

async function main() {
  console.log(`WS-DELETE-01 erasure witness — run ${RUN}\n`);

  const memberId = (
    await query<{ id: string }>(
      `INSERT INTO members (passkey, username, name, password_hash)
       VALUES ($1, $1, 'WS-DELETE-01 witness', $2) RETURNING id`,
      [`ws-delete-01-${RUN}`, sha(RUN)],
    )
  ).rows[0].id;

  const doomed = await seedManuscript(memberId, SENTINEL);
  const bystander = await seedManuscript(memberId, BYSTANDER);

  /* The seed must actually be findable, or the scan proves nothing. A witness
     that cannot detect the thing it is looking for is not a witness. */
  const before = await findSurvivors(SENTINEL);
  check('sentinel is present before erasure (the scan can see it)', before.length > 0,
    `${before.length} column(s)`);
  check('sentinel bytes are on disk before erasure', !(await absent(doomed.vaultPath)));

  console.log('\n── erasing ──');
  const outcome = await eraseManuscript(doomed.manuscriptId, memberId);
  check('erasure reported success', outcome.ok,
    outcome.ok ? `queued ${outcome.artifactsQueued}, swept all: ${outcome.sweptAll}` : outcome.refusal);
  if (outcome.ok) check('vault sweep completed', outcome.sweptAll);

  console.log('\n── post-erasure survivor set ──');
  const survivors = await findSurvivors(SENTINEL);
  check('NO reconstructive provenance survives anywhere in the database',
    survivors.length === 0,
    survivors.length ? survivors.join(' | ') : 'scanned every text column in public');

  check('vault bytes absent', await absent(doomed.vaultPath), doomed.vaultPath);

  const work = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM living_works WHERE id = $1`, [doomed.workId]);
  check('no detached declaration — the Work is gone with its only expression',
    work.rows[0].n === 0);

  const expr = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM living_work_expressions WHERE expression_id = $1`,
    [doomed.manuscriptId]);
  check('no expression row points at erased material', expr.rows[0].n === 0);

  const owed = await query<{ n: number }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`);
  check('nothing left owed in the erasure queue', owed.rows[0].n === 0,
    `${owed.rows[0].n} pending`);

  console.log('\n── the bystander must be untouched ──');
  const bystanderRows = await findSurvivors(BYSTANDER);
  check('unrelated material still fully present', bystanderRows.length >= before.length,
    `${bystanderRows.length} column(s)`);
  check('unrelated vault bytes still present', !(await absent(bystander.vaultPath)));

  /* Clean up the bystander through the act under test, exercising it twice. */
  await eraseManuscript(bystander.manuscriptId, memberId);
  await sweepVaultErasureQueue();

  await witnessAbandonedErasureCompletes(memberId);
}

/**
 * The founder's condition on the word "self-completing" (2026-09-07).
 *
 *   commit succeeds → vault deletion fails → request/process ends
 *   → queue obligation survives → later consumer sees it
 *   → vault deletion succeeds → obligation disappears
 *
 * Proven end to end, with a real failure rather than a simulated one: the arrival
 * points at a path that is a DIRECTORY, so `unlink` fails with EPERM/EISDIR on
 * every platform we run. The erase therefore commits its rows and genuinely
 * cannot destroy the bytes — the exact abandonment being asked about.
 *
 * The "later consumer" is the standalone sweeper, invoked as a separate process
 * so this proves an INDEPENDENT consumer rather than another call from inside the
 * same request. If the only thing that could finish an erasure were the original
 * HTTP request, this step would fail here.
 */
async function witnessAbandonedErasureCompletes(memberId: string) {
  console.log('\n── an abandoned erasure is finished by an independent consumer ──');

  const marker = `WSDELETE01ABANDONED${RUN}`;
  const seeded = await seedManuscript(memberId, marker);

  /* Replace the arrival's target with an undeletable path.

     The path deliberately carries NO marker, mirroring how production builds an
     artifact_ref ({namespace}/{timestamp}-{hash}.{ext} — no member filename). If
     the marker appeared here the survivor scan below would find it in the queue
     row and could not tell a real leak from the witness's own seeding. */
  const rel = path.join('ws-delete-01', `blocked-${RUN.slice(0, 12)}`);
  await mkdir(path.join(resolveVaultRoot(), rel), { recursive: true });
  await query(
    `UPDATE manuscript_source_arrivals SET artifact_ref = $2 WHERE manuscript_id = $1`,
    [seeded.manuscriptId, rel],
  );

  const outcome = await eraseManuscript(seeded.manuscriptId, memberId);
  check('rows committed even though the bytes could not be destroyed',
    outcome.ok && !outcome.sweptAll,
    outcome.ok ? `sweptAll=${outcome.sweptAll}` : outcome.refusal);

  /* The member's Work is gone regardless — that half is transactional. */
  const rows = await findSurvivors(marker);
  check('the manuscript rows are gone despite the failed sweep', rows.length === 0,
    rows.join(' | '));

  const owed = await query<{ n: number; ref: string }>(
    `SELECT count(*)::int AS n, min(artifact_ref) AS ref FROM vault_erasure_queue`);
  check('the obligation SURVIVES the request that created it', owed.rows[0].n === 1,
    `${owed.rows[0].n} owed`);

  /* Whatever blocked destruction is resolved, as an operator would resolve it. */
  await rmdir(path.join(resolveVaultRoot(), rel));
  await writeFile(path.join(resolveVaultRoot(), rel), `${marker} the bytes, now destroyable`);

  /* A SEPARATE PROCESS — the independence is the point being proven. */
  const sweeper = spawnSync(
    'npx',
    ['tsx', path.join(__dirname, '..', 'ops', 'sweep-vault-erasure-queue.ts')],
    { encoding: 'utf8', env: process.env },
  );
  check('the independent consumer ran and cleared the vault',
    sweeper.status === 0,
    (sweeper.stdout || '').trim().split('\n').pop() ?? String(sweeper.stderr).slice(0, 200));

  check('the bytes are destroyed by that later pass',
    await absent(path.join(resolveVaultRoot(), rel)));

  const after = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM vault_erasure_queue`);
  check('the obligation DISAPPEARS once it is honoured', after.rows[0].n === 0,
    `${after.rows[0].n} still owed`);
}

/**
 * Remove everything any run of this witness has ever created, by passkey prefix.
 *
 * By PREFIX rather than by this run's member id, so an earlier run that aborted
 * part-way is collected too. A witness that litters the database it is auditing
 * has no business being pointed at production, and one that only tidies up when
 * it succeeds tidies up exactly when it did not need to.
 */
async function cleanup() {
  const mine = await query<{ id: string }>(
    `SELECT id FROM members WHERE passkey LIKE 'ws-delete-01-%'`,
  );
  for (const { id } of mine.rows) {
    await query(`DELETE FROM manuscript_source_arrivals WHERE member_id = $1`, [id]);
    await query(`DELETE FROM living_works WHERE member_id = $1`, [id]);
    await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [id]);
    await query(`DELETE FROM members WHERE id = $1`, [id]);
  }
  await sweepVaultErasureQueue();
  return mine.rows.length;
}

(async () => {
  let aborted: unknown = null;
  try {
    await main();
  } catch (err) {
    aborted = err;
    console.error('\nWITNESS ABORTED:', err);
  }

  try {
    const swept = await cleanup();
    if (swept > 1) console.log(`\n(cleanup also collected ${swept - 1} earlier aborted run(s))`);
  } catch (err) {
    console.error('CLEANUP FAILED — witness rows may remain:', err);
    failures += 1;
  }

  console.log(`\n${checks - failures} passed · ${failures} failed`);
  await closePool().catch(() => {});
  process.exit(aborted || failures > 0 ? 1 : 0);
})();
