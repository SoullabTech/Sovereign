/**
 * WS-DELETE-01/R20 — joined proof that reconstructive Writer provenance does not survive.
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
 *   DATABASE_URL=… npx tsx scripts/witness/ws-delete-01-erasure-witness-r20.ts
 *
 * Read-write: it creates its own member and material, and removes them. It never
 * touches anything it did not create. Exits non-zero on any failure.
 */

import { randomUUID, createHash } from 'crypto';
import { writeFile, mkdir, stat, rmdir } from 'fs/promises';
import { spawnSync, spawn } from 'child_process';
import path from 'path';
import { query, closePool, transaction } from '../../lib/db/postgres';
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
  const manuscriptId = randomUUID();
  const sourceSectionId = randomUUID();
  const draftId = randomUUID();
  const draftSectionId = randomUUID();
  const workId = randomUUID();
  const expressionId = randomUUID();
  const relationshipId = randomUUID();
  const chainId = randomUUID();
  const threadId = randomUUID();
  const originId = randomUUID();
  const rootVersionId = randomUUID();
  const headVersionId = randomUUID();
  const insightId = randomUUID();
  const directionId = randomUUID();
  const authorizationId = randomUUID();
  const offerId = randomUUID();
  const receiptKey = randomUUID();
  const draftContent = `${marker} draft content`;

  await query(
    `INSERT INTO member_manuscripts (id, member_id, title)
     VALUES ($1, $2, $3)`,
    [manuscriptId, memberId, `${marker} title`],
  );
  await query(
    `INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body)
     VALUES ($1, $2, 1, $3, $4)`,
    [sourceSectionId, manuscriptId, `${marker} heading`, `${marker} section body`],
  );
  await query(
    `INSERT INTO manuscript_working_drafts
       (id, manuscript_id, member_id, content, base_source_hash, revision_count, version)
     VALUES ($1, $2, $3, $4, $5, 0, 1)`,
    [draftId, manuscriptId, memberId, draftContent, sha(marker)],
  );
  await query(
    `INSERT INTO manuscript_draft_sections
       (id, draft_id, position, text, source_section_id)
     VALUES ($1, $2, 0, $3, $4)`,
    [draftSectionId, draftId, draftContent, sourceSectionId],
  );

  /* Source custody: extracted text and real bytes on disk. */
  const rel = path.join('ws-delete-01', `${marker}.txt`);
  const full = path.join(resolveVaultRoot(), rel);
  const originalBytes = `${marker} the original uploaded bytes`;
  const sourceText = `${marker} extracted source text`;
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, originalBytes);
  await query(
    `INSERT INTO manuscript_source_arrivals
       (member_id, manuscript_id, source_kind, artifact_ref, artifact_hash, artifact_size,
        original_filename, mime_type, source_text, source_text_hash,
        extraction_method, extractor_version)
     VALUES ($1,$2,'artifact_extraction',$3,$4,$5,$6,'text/plain',$7,$8,'witness','1')`,
    [
      memberId, manuscriptId, rel, sha(originalBytes), Buffer.byteLength(originalBytes),
      `${marker}.txt`, sourceText, sha(sourceText),
    ],
  );

  await query(
    `INSERT INTO living_works (id, member_id, title, purpose)
     VALUES ($1, $2, $3, $4)`,
    [workId, memberId, `${marker} work`, `${marker} purpose`],
  );
  await query(
    `INSERT INTO living_work_expressions
       (id, living_work_id, expression_type, expression_id, declared_by)
     VALUES ($1, $2, 'manuscript', $3, $4)`,
    [expressionId, workId, manuscriptId, memberId],
  );
  await query(
    `INSERT INTO writer_editorial_relationships
       (id, member_id, living_work_id, manuscript_id, creation_expression_id, contract_version)
     VALUES ($1,$2,$3,$4,$5,'A2-1')`,
    [relationshipId, memberId, workId, manuscriptId, expressionId],
  );
  await query(
    `INSERT INTO proposal_chains
       (id, member_id, work_id, draft_id, base_version, target_section_id,
        expected_text, locus_scope_kind)
     VALUES ($1,$2,$3,$4,0,$5,$6,'section')`,
    [chainId, memberId, manuscriptId, draftId, draftSectionId, `${marker} expected text`],
  );

  /* Reproduce the real first-open handshake: thread and exact origin close their
     mutually deferred FKs together; the origin trigger creates chain custody. */
  await transaction(async (client) => {
    await client.query(
      `INSERT INTO ask_threads
         (id, manuscript_id, member_id, anchor, reading_identity,
          canonical_at_open, initiated_by, proposal_chain_id, living_work_id,
          editorial_origin_id)
       VALUES ($1,$2,$3,NULL,NULL,$4,'author',$5,NULL,$6)`,
      [threadId, manuscriptId, memberId, `${marker} canonical at open`, chainId, originId],
    );
    await client.query(
      `INSERT INTO writer_editorial_thread_origins
         (id, thread_id, proposal_chain_id, member_id, living_work_id,
          manuscript_id, relationship_id, creation_expression_id, draft_id,
          target_section_id, draft_version, draft_revision_count, locus_scope_kind)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,0,'section')`,
      [
        originId, threadId, chainId, memberId, workId, manuscriptId,
        relationshipId, expressionId, draftId, draftSectionId,
      ],
    );
  });

  await query(
    `INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness)
     VALUES ($1,0,'author',$2,'{}'::jsonb),
            ($1,1,'maia',$3,'{}'::jsonb)`,
    [threadId, `${marker} author turn`, `${marker} maia turn`],
  );
  await query(
    `INSERT INTO proposal_versions
       (id, chain_id, author, formulation, rationale, supersedes)
     VALUES ($1,$3,'member',$4,$5,NULL),
            ($2,$3,'maia',$6,$7,$1)`,
    [
      rootVersionId, headVersionId, chainId,
      `${marker} root formulation`, `${marker} root rationale`,
      `${marker} head formulation`, `${marker} head rationale`,
    ],
  );
  await query(
    `INSERT INTO proposal_chain_insights
       (id, member_id, proposal_chain_id, author, observation)
     VALUES ($1,$2,$3,'maia',$4)`,
    [insightId, memberId, chainId, `${marker} editorial insight`],
  );
  await query(
    `INSERT INTO proposal_chain_directions
       (id, member_id, proposal_chain_id, author, instruction, refers_to_version_id)
     VALUES ($1,$2,$3,'maia',$4,$5)`,
    [directionId, memberId, chainId, `${marker} editorial direction`, headVersionId],
  );
  await query(
    `INSERT INTO editorial_turn_bindings
       (thread_id, turn_index, turn_speaker, proposal_chain_id, act_author,
        direction_id, version_id)
     VALUES ($1,0,'author',$2,'member',NULL,$3),
            ($1,1,'maia',$2,'maia',$4,NULL)`,
    [threadId, chainId, rootVersionId, directionId],
  );
  await query(
    `INSERT INTO manuscript_revision_offers
       (id, manuscript_id, draft_id, section_id, member_id, thread_id,
        produced_in_turn_index, proposed_text, reason, based_on, read_state,
        coverage, origin, authority, producer, input_fingerprint)
     VALUES ($1,$2,$3,$4,$5,$6,1,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,
             'work',$12::jsonb,'maia-witness',$13)`,
    [
      offerId, manuscriptId, draftId, draftSectionId, memberId, threadId,
      `${marker} proposed text`, `${marker} proposal reason`,
      JSON.stringify({ witness: `${marker} based on` }),
      JSON.stringify({ witness: `${marker} read state` }),
      JSON.stringify({ witness: `${marker} coverage` }),
      JSON.stringify({ witness: `${marker} authority` }), sha(`${marker}:offer`),
    ],
  );
  await query(
    `INSERT INTO manuscript_revision_authorizations
       (id, member_id, proposal_chain_id, proposal_version_id, work_id,
        draft_id, base_version, target_section_id, expected_text)
     VALUES ($1,$2,$3,$4,$5,$6,0,$7,$8)`,
    [
      authorizationId, memberId, chainId, headVersionId, manuscriptId,
      draftId, draftSectionId, `${marker} authorization expected text`,
    ],
  );
  await query(
    `INSERT INTO manuscript_application_recovery
       (authorization_id, before_body, after_body)
     VALUES ($1,$2,$3)`,
    [authorizationId, `${marker} recovery before`, `${marker} recovery after`],
  );
  await query(
    `INSERT INTO writer_editorial_save_receipts
       (member_id, idempotency_key, relationship_id, thread_id,
        proposal_chain_id, proposal_version_id, target_section_id, supersedes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      memberId, receiptKey, relationshipId, threadId, chainId,
      headVersionId, draftSectionId, rootVersionId,
    ],
  );
  await query(
    `INSERT INTO writer_editorial_relationship_episodes
       (relationship_id, sequence, child_kind, manuscript_scope_requested,
        manuscript_scope_executed, temporal_posture, history_policy,
        continuation_authorized, authority_class, carry_policy,
        editorial_thread_id, editorial_proposal_chain_id,
        editorial_member_turn_index, editorial_maia_turn_index)
     VALUES ($1,1,'EDITORIAL_TURN','section','section','CURRENT_FROZEN_LOCUS',
             'CHILD_LOCAL_MULTI_TURN',TRUE,'EDITORIAL_CHAIN','PRESENTATION_ONLY',
             $2,$3,0,1)`,
    [relationshipId, threadId, chainId],
  );

  return {
    manuscriptId, workId, vaultPath: full, chainId, threadId,
    relationshipId, draftId, draftSectionId,
  };
}

const absent = async (p: string) => {
  try {
    await stat(p);
    return false;
  } catch {
    return true;
  }
};

/**
 * Fail closed unless the operator has named the exact target (founder condition,
 * 2026-09-07). This is destructive read-write evidence, not a harmless
 * diagnostic: it creates and erases real rows and real bytes.
 *
 * Naming the target has to be a separate, deliberate act from supplying a
 * connection string, because the dangerous case is not a hostile operator — it is
 * a correct command run against a shell that still had production exported.
 */
function assertIntendedTarget() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  let target: string;
  try {
    const u = new URL(url);
    target = `${u.hostname}/${u.pathname.replace(/^\//, '')}`;
  } catch {
    throw new Error('DATABASE_URL could not be parsed');
  }

  const declared = process.env.WS_DELETE_01_WITNESS_TARGET;
  if (declared !== target) {
    throw new Error(
      `Refusing to run. This witness creates and destroys real rows and real bytes.\n`
        + `  DATABASE_URL points at : ${target}\n`
        + `  you declared           : ${declared ?? '(nothing)'}\n`
        + `Re-run naming the target explicitly:\n`
        + `  WS_DELETE_01_WITNESS_TARGET='${target}' …`,
    );
  }
  console.log(`target confirmed: ${target}`);
}

async function main() {
  console.log(`WS-DELETE-01 erasure witness — run ${RUN}\n`);
  assertIntendedTarget();

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
    outcome.ok ? `queued ${outcome.artifactsQueued}, swept all: ${outcome.sweptAll}` : (outcome as { refusal: string }).refusal);
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

  const targetChain = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM proposal_chains WHERE id = $1`, [doomed.chainId]);
  check('retained Writer editorial lineage is constitutionally erased',
    targetChain.rows[0].n === 0);

  const targetManifest = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM deletion_manifests
      WHERE reason_class = 'member_deletion' AND executed_at IS NOT NULL`);
  check('content-free deletion authority survives', targetManifest.rows[0].n >= 1,
    `${targetManifest.rows[0].n} executed manifest(s)`);

  const owed = await query<{ n: number }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`);
  check('nothing left owed in the erasure queue', owed.rows[0].n === 0,
    `${owed.rows[0].n} pending`);

  console.log('\n── the bystander must be untouched ──');
  const bystanderRows = await findSurvivors(BYSTANDER);
  check('unrelated material still fully present', bystanderRows.length >= before.length,
    `${bystanderRows.length} column(s)`);
  check('unrelated vault bytes still present', !(await absent(bystander.vaultPath)));
  const bystanderChain = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM proposal_chains WHERE id = $1`, [bystander.chainId]);
  check('unrelated Writer editorial lineage remains intact', bystanderChain.rows[0].n === 1);

  /* Clean up the bystander through the act under test, exercising it twice. */
  await eraseManuscript(bystander.manuscriptId, memberId);
  await sweepVaultErasureQueue();

  await witnessAbandonedErasureCompletes(memberId);
  await witnessWorkerInvokesSweepUnaided(memberId);
}

/**
 * Autonomous invocation (founder condition, 2026-09-07).
 *
 * The previous scenario proves an abandoned obligation CAN be cleared by an
 * independent consumer. It does not prove one WILL be, because a consumer nobody
 * runs is a consumer that never returns. This proves the production trigger:
 * `maia-media-worker` picks the obligation up on its own poll loop, with nothing
 * invoking the sweep by hand.
 *
 * The worker is spawned exactly as production runs it — same entrypoint, no test
 * hook, no injected sweep call. The only concession is the loop cadence, lowered
 * by env so this takes seconds rather than a minute and a half.
 */
async function witnessWorkerInvokesSweepUnaided(memberId: string) {
  console.log('\n── the production worker collects an obligation unaided ──');

  const marker = `WSDELETE01WORKER${RUN}`;
  const seeded = await seedManuscript(memberId, marker);

  /* Block destruction so the inline sweep leaves an obligation behind. */
  const rel = path.join('ws-delete-01', `worker-${RUN.slice(0, 12)}`);
  await mkdir(path.join(resolveVaultRoot(), rel), { recursive: true });
  await query(
    `UPDATE manuscript_source_arrivals SET artifact_ref = $2 WHERE manuscript_id = $1`,
    [seeded.manuscriptId, rel],
  );
  await eraseManuscript(seeded.manuscriptId, memberId);

  const owed = await query<{ n: number }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`);
  check('an obligation is outstanding before the worker starts', owed.rows[0].n === 1);

  /* Unblock, then let the worker find it on its own. */
  await rmdir(path.join(resolveVaultRoot(), rel));
  await writeFile(path.join(resolveVaultRoot(), rel), `${marker} bytes awaiting the worker`);

  const worker = spawn(
    'npx',
    ['tsx', path.join(__dirname, '..', 'run-media-worker.ts')],
    {
      env: { ...process.env, VAULT_ERASURE_EVERY_N_LOOPS: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let sawErasureLog = false;
  worker.stdout.on('data', (b) => {
    if (String(b).includes('[MediaWorker/erasure]')) sawErasureLog = true;
  });

  try {
    const cleared = await waitFor(async () => {
      const n = await query<{ n: number }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`);
      return n.rows[0].n === 0;
    }, 25_000);

    check('the worker cleared the obligation with no manual sweep', cleared);
    check('the worker destroyed the bytes', await absent(path.join(resolveVaultRoot(), rel)));

    /* Telemetry is one of the required properties, so it is asserted — but the
       worker's stdout is a pipe, and Node block-buffers a pipe. SIGKILL discards
       that buffer unflushed, so an earlier version of this check was testing the
       signal rather than the logging. Shut down gracefully and wait for exit. */
    worker.kill('SIGTERM');
    await new Promise<void>((resolve) => {
      worker.once('exit', () => resolve());
      setTimeout(resolve, 10_000);
    });
    check('the worker reported the erasure in its own logs', sawErasureLog);
  } finally {
    worker.kill('SIGKILL');
  }
}

async function waitFor(cond: () => Promise<boolean>, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await cond()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
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
    outcome.ok ? `sweptAll=${outcome.sweptAll}` : (outcome as { refusal: string }).refusal);

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
    const manuscripts = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE member_id = $1 ORDER BY id`, [id]);
    for (const manuscript of manuscripts.rows) {
      await eraseManuscript(manuscript.id, id);
    }
    await sweepVaultErasureQueue();
    await query(`DELETE FROM manuscript_source_arrivals WHERE member_id = $1`, [id]);
    await query(`DELETE FROM living_works WHERE member_id = $1`, [id]);
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
