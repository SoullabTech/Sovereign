/**
 * PT-3 ENFORCEMENT WITNESS — the §XI return gate.
 *
 * AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §XI. Returns executable evidence that:
 *
 *   ORDINARY AUTHORITY  cannot update or delete protected Source content, cannot disable the
 *                       constitutional refusal, cannot create a representation outside the seam,
 *                       cannot smuggle content through bookkeeping, cannot obtain the owner credential.
 *   LAWFUL AUTHORITY    can import, extract with custody atomically, re-extract, replace, withdraw,
 *                       erase, and perform custody bookkeeping.
 *   HISTORICAL TRUTH    can reconstruct which lineage was operative, when and why it changed, what
 *                       remains historical, what was withdrawn, what was erased.
 *   DEPLOYMENT EVIDENCE can attribute every owner-level schema act to its migration and commit.
 *
 * ⚠️ THE POINT OF THE TWO CONNECTIONS. This witness holds an OWNER pool and an APP pool at once,
 * because the claim under test is precisely that they differ. A witness that connected only as the
 * owner would report a green boundary while testing nothing — the superuser is refused by nothing.
 *
 *   OWNER_DATABASE_URL   the migration/custody authority (owns the protected tiers)
 *   APP_DATABASE_URL     maia_app — what the application will connect as
 *
 * SAFETY. Destructive by design. Runs only against a disposable fixture database, and only behind
 * an explicit confirmation. Deployment is HELD; this is the pre-deployment evidence.
 */
import { randomUUID, createHash } from 'crypto';
import { Pool } from 'pg';

type Verdict = 'PASS' | 'FAIL';
interface Line { block: string; id: string; verdict: Verdict; label: string; detail: string }
const lines: Line[] = [];
function check(block: string, id: string, label: string, pass: boolean, detail = '') {
  lines.push({ block, id, verdict: pass ? 'PASS' : 'FAIL', label, detail });
}

const sha = (s: string) => createHash('sha256').update(Buffer.from(s, 'utf-8')).digest('hex');

/**
 * Erase a member's Works the only lawful way: commission, then delete, IN ONE TRANSACTION.
 *
 * The seam opens a transaction-local window, so a `source_commission_erasure` issued on the pool
 * authorizes nothing for the next statement — each pool query is its own transaction. This teardown
 * originally got that wrong and was refused, which is the seam behaving exactly as designed: an
 * erasure window that leaked across statements would be the side-effect erasure §II forbids.
 */
async function eraseWorksOf(pool: Pool, memberId: string) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const works = await c.query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE member_id = $1`, [memberId]);
    for (const w of works.rows) {
      await c.query(`SELECT source_commission_erasure($1,$2,$3)`, [w.id, memberId, 'witness teardown']);
    }
    await c.query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
    await c.query('COMMIT');
  } catch { await c.query('ROLLBACK').catch(() => {}); } finally { c.release(); }
}

function assertDisposable(url: string, which: string) {
  const local = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url);
  const disposable = /\/[a-z0-9_]*(falsifier|fixture|shadow|disposable|legacy)[a-z0-9_]*(\?|$)/i.test(url);
  if (!local || !disposable) {
    throw new Error(
      `Refusing to run: ${which} must name a local host AND a disposable database ` +
      `(…falsifier / …fixture / …shadow / …disposable / …legacy). Source protection is never proven by ` +
      `attacking production or real member material.`);
  }
}

const OWNER_URL = process.env.OWNER_DATABASE_URL ?? '';
const APP_URL = process.env.APP_DATABASE_URL ?? '';

/** Did the statement fail for the reason claimed, rather than by accident? */
async function refused(
  pool: Pool, sql: string, params: unknown[], expect: RegExp,
): Promise<{ ok: boolean; detail: string }> {
  try {
    const r = await pool.query(sql, params);
    return { ok: false, detail: `NOT REFUSED — affected ${r.rowCount} row(s)` };
  } catch (e) {
    const msg = (e as Error).message;
    return { ok: expect.test(msg), detail: msg.slice(0, 110) };
  }
}

const SOURCE_TEXT = [
  '# The House on Laurel Street', '',
  'The kitchen door never closed properly. My mother said it was the frame.',
].join('\n');

const CUT = [
  { heading: 'The House on Laurel Street',
    body: 'The kitchen door never closed properly. My mother said it was the frame.',
    heading_depth: 1, heading_signal: 'markdown' },
];

const CUT_B = [
  { heading: 'The House on Laurel Street', body: 'The kitchen door never closed properly.',
    heading_depth: 1, heading_signal: 'markdown' },
  { heading: 'The Frame', body: 'My mother said it was the frame.',
    heading_depth: 1, heading_signal: 'markdown' },
];

async function main() {
  if (process.env.PT3_WITNESS_CONFIRM !== '1') {
    throw new Error('Refusing to run: destructive. Set PT3_WITNESS_CONFIRM=1.');
  }
  assertDisposable(OWNER_URL, 'OWNER_DATABASE_URL');
  assertDisposable(APP_URL, 'APP_DATABASE_URL');

  const owner = new Pool({ connectionString: OWNER_URL, max: 4 });
  const app = new Pool({ connectionString: APP_URL, max: 4 });

  const memberId = randomUUID();
  let manuscriptId = '';
  let arrivalId = '';
  let repA = '';

  try {
    // ── fixture ───────────────────────────────────────────────────────────────
    await owner.query(
      `INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
       VALUES ($1,$2,$3,$4,$5,$6,true)`,
      [memberId, `PT3W-${memberId.slice(0, 8)}`, `pt3w_${memberId.slice(0, 8)}`,
       'x'.repeat(64), 'PT-3 Witness', `pt3w+${memberId.slice(0, 8)}@fixture.invalid`]);

    // ══ BLOCK 2 — LAWFUL AUTHORITY (built first: the refusals need something to attack) ══

    // Import a Historical Source, as ordinary authority.
    const arr = await app.query<{ id: string }>(
      `INSERT INTO manuscript_source_arrivals
         (member_id, source_kind, source_text, source_text_hash, extraction_method, extractor_version)
       VALUES ($1,'member_supplied_text',$2,$3,'member-supplied','n/a') RETURNING id`,
      [memberId, SOURCE_TEXT, sha(SOURCE_TEXT)]);
    arrivalId = arr.rows[0].id;
    check('2', 'L1', 'ordinary authority can import a Historical Source', !!arrivalId, `arrival ${arrivalId.slice(0, 8)}`);

    const ms = await app.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title, provenance)
       VALUES ($1,'The House on Laurel Street','member_uploaded') RETURNING id`, [memberId]);
    manuscriptId = ms.rows[0].id;

    // Extraction through the seam — representation + custody atomically.
    const ex = await app.query<{ id: string }>(`SELECT source_extract($1,$2,$3,$4::jsonb) AS id`,
      [manuscriptId, memberId, arrivalId, JSON.stringify(CUT)]);
    repA = ex.rows[0].id;
    const custody = await owner.query<{ custody: string; arrival_id: string }>(
      `SELECT custody, arrival_id FROM manuscript_source_representations WHERE id = $1`, [repA]);
    const secCount = await owner.query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_sections WHERE representation_id = $1`, [repA]);
    check('2', 'L2', 'a representation is created WITH its custody, in one act',
      custody.rows[0]?.custody === 'source_custodied'
      && custody.rows[0]?.arrival_id === arrivalId
      && Number(secCount.rows[0].n) === CUT.length,
      `custody=${custody.rows[0]?.custody} sections=${secCount.rows[0].n}`);

    // Atomicity, proven by its negative: an uncustodiable arrival creates NOTHING.
    const before = await owner.query<{ n: string }>(`SELECT count(*) AS n FROM manuscript_sections`);
    /* An arrival belonging to someone else. The claim inside the seam is scoped by member, so
       this is the shape a cross-member import would actually take. */
    const otherId = randomUUID();
    await owner.query(
      `INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
       VALUES ($1,$2,$3,$4,$5,$6,true)`,
      [otherId, `PT3X-${otherId.slice(0, 8)}`, `pt3x_${otherId.slice(0, 8)}`,
       'x'.repeat(64), 'PT-3 Other', `pt3x+${otherId.slice(0, 8)}@fixture.invalid`]);
    const orphan = await app.query<{ id: string }>(
      `INSERT INTO manuscript_source_arrivals
         (member_id, source_kind, source_text, source_text_hash, extraction_method, extractor_version)
       VALUES ($1,'member_supplied_text','x',$2,'member-supplied','n/a') RETURNING id`,
      [otherId, sha('x')]);
    const atomic = await refused(app, `SELECT source_extract($1,$2,$3,$4::jsonb)`,
      [manuscriptId, memberId, orphan.rows[0].id, JSON.stringify(CUT)], /custody could not be established/);
    const after = await owner.query<{ n: string }>(`SELECT count(*) AS n FROM manuscript_sections`);
    check('2', 'L3', 'custody that cannot be established creates NOTHING (atomic, not partial)',
      atomic.ok && before.rows[0].n === after.rows[0].n, atomic.detail);

    // Re-extraction — a second representation from the SAME Historical Source.
    const beforeA = await owner.query<{ digest: string }>(
      `SELECT md5(string_agg(heading||body, '|' ORDER BY position)) AS digest
         FROM manuscript_sections WHERE representation_id = $1`, [repA]);
    const re = await app.query<{ id: string }>(`SELECT source_re_extract($1,$2,$3,$4::jsonb,$5) AS id`,
      [manuscriptId, memberId, arrivalId, JSON.stringify(CUT_B), 'finer cut']);
    const repB = re.rows[0].id;
    const afterA = await owner.query<{ digest: string }>(
      `SELECT md5(string_agg(heading||body, '|' ORDER BY position)) AS digest
         FROM manuscript_sections WHERE representation_id = $1`, [repA]);
    const opRep = await app.query<{ id: string }>(`SELECT source_operative_representation($1) AS id`, [manuscriptId]);
    check('2', 'L4', 're-extraction creates a new representation and alters no earlier one',
      repB !== repA && beforeA.rows[0].digest === afterA.rows[0].digest && opRep.rows[0].id === repB,
      `operative=${opRep.rows[0].id === repB ? 'new' : 'WRONG'} · earlier digest unchanged`);

    // Replacement — a NEW lineage becomes operative; the former stays historical.
    const arr2 = await app.query<{ id: string }>(
      `INSERT INTO manuscript_source_arrivals
         (member_id, source_kind, source_text, source_text_hash, extraction_method, extractor_version)
       VALUES ($1,'member_supplied_text',$2,$3,'member-supplied','n/a') RETURNING id`,
      [memberId, 'A CORRECTED MANUSCRIPT.', sha('A CORRECTED MANUSCRIPT.')]);
    await app.query(`SELECT source_replace_lineage($1,$2,$3,$4::jsonb,$5)`,
      [manuscriptId, memberId, arr2.rows[0].id, JSON.stringify(CUT), 'member replaced the file']);
    const opArr = await app.query<{ id: string }>(`SELECT source_operative_arrival($1) AS id`, [manuscriptId]);
    const firstArrivalIntact = await owner.query<{ source_text: string }>(
      `SELECT source_text FROM manuscript_source_arrivals WHERE id = $1`, [arrivalId]);
    check('2', 'L5', 'replacement moves the operative lineage without rewriting the former',
      opArr.rows[0].id === arr2.rows[0].id && firstArrivalIntact.rows[0].source_text === SOURCE_TEXT,
      `operative lineage moved · former text intact`);

    // Withdrawal — ceases to be operative WITHOUT being destroyed.
    const opBefore = await app.query<{ id: string }>(`SELECT source_operative_representation($1) AS id`, [manuscriptId]);
    await app.query(`SELECT source_withdraw_representation($1,$2,$3,$4)`,
      [manuscriptId, memberId, opBefore.rows[0].id, 'not what I meant']);
    const stillThere = await owner.query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_sections WHERE representation_id = $1`, [opBefore.rows[0].id]);
    const opAfter = await app.query<{ id: string }>(`SELECT source_operative_representation($1) AS id`, [manuscriptId]);
    check('2', 'L6', 'withdrawal removes currency and destroys nothing',
      Number(stillThere.rows[0].n) > 0 && opAfter.rows[0].id !== opBefore.rows[0].id,
      `withdrawn rows still present=${stillThere.rows[0].n}`);

    // Custody bookkeeping — the lawful column-bounded write.
    const spare = await app.query<{ id: string }>(
      `INSERT INTO manuscript_source_arrivals
         (member_id, source_kind, source_text, source_text_hash, extraction_method, extractor_version)
       VALUES ($1,'member_supplied_text','spare',$2,'member-supplied','n/a') RETURNING id`,
      [memberId, sha('spare')]);
    let bookkeeping = true; let bkDetail = '';
    try {
      const r = await app.query(
        `UPDATE manuscript_source_arrivals SET manuscript_id = $2 WHERE id = $1 AND manuscript_id IS NULL`,
        [spare.rows[0].id, manuscriptId]);
      bkDetail = `claimed ${r.rowCount} row(s)`;
    } catch (e) { bookkeeping = false; bkDetail = (e as Error).message.slice(0, 90); }
    check('2', 'L7', 'ordinary authority can still perform custody bookkeeping', bookkeeping, bkDetail);

    // ══ BLOCK 1 — ORDINARY AUTHORITY CANNOT ══════════════════════════════════
    // The three attacks that succeeded on 2026-09-08, unchanged in shape.

    const o1 = await refused(app, `UPDATE manuscript_sections SET body = $2 WHERE manuscript_id = $1`,
      [manuscriptId, 'CONTENT-WORKING MUTATION'], /permission denied|refused/i);
    check('1', 'O1', 'cannot UPDATE protected Source content (was A3.2 — 2 rows)', o1.ok, o1.detail);

    const o2 = await refused(app, `DELETE FROM manuscript_sections WHERE manuscript_id = $1`,
      [manuscriptId], /permission denied|refused/i);
    check('1', 'O2', 'cannot DELETE protected Source content (was A3.3 — 1 row)', o2.ok, o2.detail);

    const forged = 'A HISTORY THAT WAS NEVER RECEIVED.';
    const o3 = await refused(app,
      `UPDATE manuscript_source_arrivals SET source_text = $2, source_text_hash = $3 WHERE id = $1`,
      [arrivalId, forged, sha(forged)], /permission denied|refused/i);
    check('1', 'O3', 'cannot rewrite the Historical Source (was A4.1 — 1 row)', o3.ok, o3.detail);

    const o4 = await refused(app, `ALTER TABLE manuscript_sections DISABLE TRIGGER pt3_sections_refuse`,
      [], /must be owner|permission denied/i);
    check('1', 'O4', 'cannot disable the constitutional refusal', o4.ok, o4.detail);

    const o5 = await refused(app,
      `INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1,99,'x','y')`,
      [manuscriptId], /permission denied/i);
    check('1', 'O5', 'cannot create a Source Representation outside the governed seam', o5.ok, o5.detail);

    // Bookkeeping must not become a carrier for content.
    const o6 = await refused(app,
      `UPDATE manuscript_source_arrivals SET manuscript_id = $2, source_text = 'forged' WHERE id = $1`,
      [arrivalId, manuscriptId], /permission denied/i);
    check('1', 'O6', 'cannot smuggle content through bookkeeping authority', o6.ok, o6.detail);

    const o7 = await refused(app, `SELECT * FROM source_lifecycle_acts_insert_probe()`, [],
      /does not exist/i);
    const o7b = await refused(app,
      `INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id)
       VALUES ($1,'extraction',$2,true,$3)`, [manuscriptId, repA, memberId], /permission denied/i);
    check('1', 'O8', 'cannot declare currency without performing the act', o7b.ok, o7b.detail);
    void o7;

    // Erasure may not happen as a side effect: a cascade naming no act is refused.
    const o9 = await refused(app, `DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId],
      /refused|permission denied/i);
    check('1', 'O9', 'cascade cannot erase Source without erasure being commissioned', o9.ok, o9.detail);

    const appUser = await app.query<{ u: string; su: boolean }>(
      `SELECT current_user AS u, usesuper AS su FROM pg_user WHERE usename = current_user`);
    check('1', 'O10', 'ordinary authority is not the owner credential and is not superuser',
      appUser.rows[0].u === 'maia_app' && appUser.rows[0].su === false,
      `current_user=${appUser.rows[0].u} superuser=${appUser.rows[0].su}`);

    // ══ BLOCK 3 — HISTORICAL TRUTH ═══════════════════════════════════════════
    const hist = await app.query<{ act: string; operative: boolean; reason: string | null }>(
      `SELECT act, operative, reason FROM source_lifecycle_acts
        WHERE manuscript_id = $1 ORDER BY occurred_at, id`, [manuscriptId]);
    const acts = hist.rows.map((r) => r.act);
    check('3', 'H1', 'the history distinguishes each act by name, never one generic state',
      ['arrival', 'extraction', 're_extraction', 'replacement', 'withdrawal'].every((a) => acts.includes(a)),
      acts.join(' → '));
    check('3', 'H2', 'why it changed is recoverable',
      hist.rows.some((r) => r.reason === 'member replaced the file')
      && hist.rows.some((r) => r.reason === 'not what I meant'), 'reasons present');
    const historical = await owner.query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_source_representations WHERE manuscript_id = $1`, [manuscriptId]);
    check('3', 'H3', 'what remains historical is still present and unrewritten',
      Number(historical.rows[0].n) >= 3, `${historical.rows[0].n} representations retained`);

    // Erasure, commissioned — then the same cascade that was refused at O9 succeeds.
    const client = await app.connect();
    let erased = false; let eraseDetail = '';
    try {
      await client.query('BEGIN');
      await client.query(`SELECT source_commission_erasure($1,$2,$3)`,
        [manuscriptId, memberId, 'member-directed erasure']);
      const del = await client.query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
      await client.query('COMMIT');
      erased = (del.rowCount ?? 0) === 1;
      eraseDetail = `deleted ${del.rowCount} manuscript`;
    } catch (e) { await client.query('ROLLBACK'); eraseDetail = (e as Error).message.slice(0, 100); }
    finally { client.release(); }
    const leftovers = await owner.query<{ n: string }>(
      `SELECT (SELECT count(*) FROM manuscript_sections WHERE manuscript_id = $1)
            + (SELECT count(*) FROM manuscript_source_arrivals WHERE manuscript_id = $1) AS n`,
      [manuscriptId]);
    check('2', 'L8', 'erasure, once commissioned, destroys — and only then',
      erased && Number(leftovers.rows[0].n) === 0, `${eraseDetail} · protected rows remaining=${leftovers.rows[0].n}`);
    check('3', 'H4', 'what was erased is recoverable as a fact, without its content',
      (await owner.query<{ n: string }>(
        `SELECT count(*) AS n FROM source_lifecycle_acts WHERE manuscript_id = $1 AND act = 'erasure'`,
        [manuscriptId])).rows[0].n !== '0', 'erasure acts retained after the content is gone');

    // ══ BLOCK 4 — DEPLOYMENT EVIDENCE ════════════════════════════════════════
    const cols = await owner.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'schema_migrations'`);
    const have = cols.rows.map((r) => r.column_name);
    check('4', 'D1', 'the migration ledger can carry attribution',
      ['filename', 'checksum', 'applied_at', 'applied_by_authority', 'applied_by_commit', 'applied_run_id']
        .every((c) => have.includes(c)), have.join(','));
    const mig = await owner.query<{ n: string }>(
      `SELECT count(*) AS n FROM schema_migrations
        WHERE filename = '20260908000001_pt3_source_custody_enforcement.sql'
          AND applied_by_authority IS NOT NULL AND applied_by_commit IS NOT NULL
          AND applied_run_id IS NOT NULL AND checksum IS NOT NULL`);
    check('4', 'D2', 'this migration is attributable to its authority, commit and run',
      mig.rows[0].n === '1', `attributed rows=${mig.rows[0].n}`);
    const owns = await owner.query<{ owner: string }>(
      `SELECT tableowner AS owner FROM pg_tables WHERE tablename = 'manuscript_sections'`);
    check('4', 'D3', 'protected tiers are owned by custody authority, not the application role',
      owns.rows[0].owner !== 'maia_app', `owner=${owns.rows[0].owner}`);

    // ══ BLOCK 5 — CUTOVER (§VIII.E) — the world after runtime is constrained ══
    //
    // Enforcement that broke ordinary reading would be a worse outcome than the defect it fixed.
    // These check the three things a cutover must NOT cost: visible Works, imported Works that
    // resolve to the representation their author is actually working from, and blank
    // member-authored Works that never had a Source at all.

    const legacyMember = randomUUID();
    await owner.query(
      `INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
       VALUES ($1,$2,$3,$4,$5,$6,true)`,
      [legacyMember, `PT3C-${legacyMember.slice(0, 8)}`, `pt3c_${legacyMember.slice(0, 8)}`,
       'x'.repeat(64), 'PT-3 Cutover', `pt3c+${legacyMember.slice(0, 8)}@fixture.invalid`]);

    // An imported Work, created the lawful way, then re-cut once.
    const cwArr = await app.query<{ id: string }>(
      `INSERT INTO manuscript_source_arrivals
         (member_id, source_kind, source_text, source_text_hash, extraction_method, extractor_version)
       VALUES ($1,'member_supplied_text',$2,$3,'member-supplied','n/a') RETURNING id`,
      [legacyMember, SOURCE_TEXT, sha(SOURCE_TEXT)]);
    const cwMs = await app.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title, provenance)
       VALUES ($1,'Cutover import','member_uploaded') RETURNING id`, [legacyMember]);
    const cwId = cwMs.rows[0].id;
    await app.query(`SELECT source_extract($1,$2,$3,$4::jsonb)`,
      [cwId, legacyMember, cwArr.rows[0].id, JSON.stringify(CUT)]);
    const cwRe = await app.query<{ id: string }>(`SELECT source_re_extract($1,$2,$3,$4::jsonb,$5) AS id`,
      [cwId, legacyMember, cwArr.rows[0].id, JSON.stringify(CUT_B), 'cutover re-cut']);

    // A blank member-written Work: no arrival, no sections. §III — still lawful.
    const blank = await app.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title, provenance)
       VALUES ($1,'Cutover blank','member_written') RETURNING id`, [legacyMember]);
    check('5', 'C1', 'a blank member-authored Work remains lawful under the constrained role',
      !!blank.rows[0].id, 'created with no arrival and no sections');

    // Ordinary reading, as the application will actually do it.
    const visible = await app.query<{ n: string }>(
      `SELECT count(*) AS n FROM member_manuscripts WHERE member_id = $1`, [legacyMember]);
    check('5', 'C2', 'existing Works remain visible to ordinary authority',
      visible.rows[0].n === '2', `${visible.rows[0].n} Works readable`);

    // The scoped read the ten call sites now perform.
    const scoped = await app.query<{ heading: string }>(
      `SELECT heading FROM manuscript_sections
        WHERE manuscript_id = $1
          AND representation_id = COALESCE(source_operative_representation($1), representation_id)
        ORDER BY position`, [cwId]);
    const allRows = await owner.query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_sections WHERE manuscript_id = $1`, [cwId]);
    check('5', 'C3', 'an imported Work resolves to its OPERATIVE representation, not to every cut ever made',
      scoped.rows.length === CUT_B.length && Number(allRows.rows[0].n) === CUT.length + CUT_B.length,
      `operative cut=${scoped.rows.length} sections · all representations=${allRows.rows[0].n} sections`);

    // The superseded cut is still there, unrewritten — enforcement did not cost history.
    const superseded = await owner.query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_sections
        WHERE manuscript_id = $1 AND representation_id <> $2`, [cwId, cwRe.rows[0].id]);
    check('5', 'C4', 'the superseded representation is retained and simply not current',
      Number(superseded.rows[0].n) === CUT.length, `${superseded.rows[0].n} historical sections retained`);

    // §VIII.A/E — runtime cannot become the owner.
    let gotOwner = false; let ownerDetail = '';
    try {
      await app.query(`SET ROLE soullab`);
      gotOwner = true; ownerDetail = 'SET ROLE soullab SUCCEEDED';
    } catch (e) { ownerDetail = (e as Error).message.slice(0, 90); }
    check('5', 'C5', 'runtime cannot assume owner authority', !gotOwner, ownerDetail);

    await eraseWorksOf(owner, legacyMember);
    await owner.query(`DELETE FROM members WHERE id = $1`, [legacyMember]).catch(() => {});

  } finally {
    await eraseWorksOf(owner, memberId);
    /* Unclaimed arrivals belong to no Work and no erasure names them; they are left for the
       disposable database to take with it. */
    await owner.query(`DELETE FROM members WHERE id = $1 OR username LIKE 'pt3x_%'`, [memberId])
      .catch(() => {});
    await owner.end(); await app.end();
  }

  const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
  const names: Record<string, string> = {
    '1': 'ORDINARY AUTHORITY CANNOT', '2': 'LAWFUL AUTHORITY CAN',
    '3': 'HISTORICAL TRUTH', '4': 'DEPLOYMENT EVIDENCE', '5': 'CUTOVER',
  };
  let block = '';
  for (const l of lines.sort((a, b) => a.block.localeCompare(b.block))) {
    if (l.block !== block) { block = l.block; console.log(`\n── ${names[block]} ${'─'.repeat(46 - names[block].length)}`); }
    console.log(`${pad(l.verdict, 5)} ${pad(l.id, 5)} ${l.label}${l.detail ? `\n            ${l.detail}` : ''}`);
  }
  const failed = lines.filter((l) => l.verdict === 'FAIL');
  console.log(`\n${'═'.repeat(72)}`);
  console.log(`passed ${lines.length - failed.length} · failed ${failed.length}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(2); });
