/**
 * EDITORIAL-WRITE-CARRY-COMPLETION-01 · EXECUTION PROBE.
 *
 * ⭐⭐ THE ONE QUESTION: does `executeAuthorization` reach and complete its
 * mutation, rather than dying on a missing export?
 *
 * ⛔ IT PROVES NOTHING ABOUT ADOPTION. No route, no surface, no gesture. It
 * exercises the manuscript EXECUTION PATH directly, because that is the
 * dependency this act restored and the only thing it is entitled to claim.
 *
 * ⭐ AND IT IS FALSIFIABLE. Run against canonical — where the export is absent —
 * P4 must DIE. A probe that passes on the broken tree would prove nothing at
 * all, so the control run is part of the evidence, never an afterthought.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

const PASSAGE = 'The spiral is not a circle, fixated on its own return.';
const EXPECTED = ', fixated';
const REPLACEMENT = ', steady';

async function main() {
  const pg = new Client({ connectionString: DSN });
  await pg.connect();
  const db = (await pg.query('SELECT current_database() d')).rows[0].d as string;
  if (!db.includes('witness')) {
    console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2);
  }

  const M = randomUUID(), LW = randomUUID(), WK = randomUUID();
  const DR = randomUUID(), SRC = randomUUID(), DS = randomUUID();
  const CH = randomUUID(), V1 = randomUUID(), V2 = randomUUID();
  const HEADING = 'Chapter Ten';
  const STORED = `${HEADING}\n\n${PASSAGE}`;

  /* ⛔ UNIQUE PER RUN. ⚠️ A first attempt reset the fixture with
     `TRUNCATE members CASCADE` and was REFUSED by the S3 truncate guard —
     *"it would bypass every row-level deletion guard and resurrect every live
     authorization at once"*. ⭐ The guard is right and the probe was wrong:
     each run brings its own identities rather than clearing the database. */
  await pg.query(`INSERT INTO members (id,passkey,username,password_hash,name)
                  VALUES ($1,$2,$3,'x','E')`,
    [M, `EWCC-${M.slice(0, 8)}`, `ewcc-${M.slice(0, 8)}`]);
  await pg.query(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'Probe Work')`, [LW, M]);
  await pg.query(`INSERT INTO living_work_expressions
                    (living_work_id,expression_type,expression_id,declared_by)
                  VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await pg.query(`INSERT INTO member_manuscripts (id,member_id,title)
                  VALUES ($1,$2,'Probe Work')`, [WK, M]);
  await pg.query(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
                  VALUES ($1,$2,0,$3,$4)`, [SRC, WK, HEADING, PASSAGE]);

  /* ⭐⭐ THE ROUND-TRIP TRIGGER IS IMMEDIATE, NOT DEFERRED — the first fixture
     assumed otherwise and died at the section INSERT with
     `sections 67 chars, content 0 chars`. ⛔ The honest fix is to build the
     draft in the state the trigger describes, never to weaken the trigger:
     the draft is NOT section-addressable while it is being assembled, the
     `content` is DERIVED from the sections by `string_agg`, and addressability
     is declared LAST, once the composition is already true. */
  await pg.query('BEGIN');
  await pg.query(
    `INSERT INTO manuscript_working_drafts
       (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at)
     VALUES ($1,$2,$3,'','probe',1,41,NULL)`, [DR, WK, M]);
  await pg.query(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
                  VALUES ($1,$2,0,$3,$4)`, [DS, DR, STORED, SRC]);
  await pg.query(
    `UPDATE manuscript_working_drafts
        SET content = (SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                         FROM manuscript_draft_sections WHERE draft_id = $1),
            section_addressable_at = now()
      WHERE id = $1`, [DR]);
  await pg.query('COMMIT');

  /* The chain, opened against the writer's own wording. */
  await pg.query(
    `INSERT INTO proposal_chains
       (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text)
     VALUES ($1,$2,$3,$4,41,$5,$6)`, [CH, M, WK, DR, DS, EXPECTED]);
  /* ⭐ TWO versions, and the probe will authorize the FIRST. ⛔ Not the head:
     the carry act does not get to prove exact-version choice — that is
     ADOPTION-01's witness A — but the fixture must not quietly make head and
     choice the same object either. */
  await pg.query(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
                  VALUES ($1,$2,'maia',$3,NULL)`, [V1, CH, REPLACEMENT]);
  await pg.query(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
                  VALUES ($1,$2,'member',', still',$3)`, [V2, CH, V1]);

  const { authorizeVersion } = await import('@/lib/manuscript/revisionAuthorization/store');
  const { executeAuthorization } = await import('@/lib/manuscript/revisionAuthorization/execute');

  /* ── P1 · the permission ─────────────────────────────────────────────── */
  const authorized = await authorizeVersion(M, CH, V1);
  if (!authorized.ok) {
    bad('P1 authorizeVersion succeeds', `refused: ${authorized.reason}`);
    console.log(`\n  ${pass} passed · ${fail} failed`); await pg.end(); process.exit(1);
  }
  ok('P1 authorizeVersion succeeds');
  eq('P2 the binding names the Work version this act READ', authorized.authorization.guard.baseVersion, 41);
  eq('P3 the permission is unspent', authorized.authorization.acceptedAt, null);

  /* ── P4 · ⭐⭐ THE DECISIVE ONE. On canonical this THROWS:
             `saveSectionInTransaction is not a function`. ────────────────── */
  let threw: string | null = null;
  let outcome: Awaited<ReturnType<typeof executeAuthorization>> | null = null;
  try { outcome = await executeAuthorization(M, authorized.authorization.id); }
  catch (e) { threw = e instanceof Error ? e.message : String(e); }
  if (threw !== null) {
    bad('P4 executeAuthorization reaches its mutation without throwing', threw);
  } else {
    ok('P4 executeAuthorization reaches its mutation without throwing');
  }

  /* ⛔ NO SILENT SKIP. ⚠️ A first cut wrapped P5–P7 in `if (outcome !== null)`,
     so on the broken tree they simply vanished and the control still reported
     four passes. A skipped obligation never discharges anything — where there
     is no outcome to inspect, each of them FAILS and says why. */
  if (outcome === null) {
    bad('P5 the outcome is executed', 'no outcome — execution threw');
    bad('P6 the receipt is whole · resultingVersion', 'no outcome — execution threw');
    bad('P7 the receipt is whole · acceptedAt', 'no outcome — execution threw');
  } else {
    eq('P5 the outcome is executed', outcome.outcome, 'executed');
    if (outcome.outcome === 'executed') {
      eq('P6 the receipt is whole · resultingVersion',
        outcome.authorization.resultingVersion, 42);
      eq('P7 the receipt is whole · acceptedAt is present',
        outcome.authorization.acceptedAt !== null, true);
    } else {
      bad('P6 the receipt is whole · resultingVersion', `refused: ${outcome.reason}`);
      bad('P7 the receipt is whole · acceptedAt is present', `refused: ${outcome.reason}`);
    }
  }

  /* ── P8 · ⭐ THE MANUSCRIPT ACTUALLY MOVED. ⛔ An outcome object is not a
         manuscript; the probe reads the stored row. ───────────────────────── */
  const after = (await pg.query('SELECT text FROM manuscript_draft_sections WHERE id = $1', [DS])).rows[0];
  eq('P8 the section body carries the adopted wording',
    after?.text, `${HEADING}\n\n${'The spiral is not a circle, steady on its own return.'}`);

  const d = (await pg.query('SELECT version, content FROM manuscript_working_drafts WHERE id = $1', [DR])).rows[0];
  eq('P9 the draft version advanced exactly once', Number(d?.version), 42);
  /* ⚠️ VACUOUS ON A TREE THAT DID NOT WRITE — an untouched draft satisfies this
     trivially. It is kept because it is load-bearing on the RESTORED tree,
     where the derivation actually ran, and the control's other failures are
     what carry the falsification. */
  eq('P10 the compatibility content was DERIVED from the sections', d?.content, after?.text);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  await pg.end();
  process.exit(fail === 0 ? 0 : 1);
}

void main();
