/**
 * EXPERIENCES WITNESS — the §XX return gate.
 *
 * AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §XX.
 *
 * Drives the real library against a real database with all four witnesses, and then attempts the
 * negative privacy route the constitution says must terminate in no authority:
 *
 *   participation → participant's private Work
 *
 * SAFETY. Disposable databases only. Creates and destroys its own fixtures.
 *
 *   DATABASE_URL=postgresql://…/…_fixture EXPERIENCES_WITNESS_CONFIRM=1 \
 *     npx tsx scripts/witness/experiences-witness.ts
 */
import { randomUUID } from 'crypto';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

import { query, closePool } from '@/lib/db/postgres';
import {
  createExperience, addMovements, reviseExperience, beginParticipation,
  relateWork, recordContribution, adoptContribution, workContributions,
} from '@/lib/writersStudio/experiences';

type Verdict = 'PASS' | 'FAIL';
interface Line { block: string; id: string; verdict: Verdict; label: string; detail: string }
const lines: Line[] = [];
const check = (block: string, id: string, label: string, pass: boolean, detail = '') =>
  lines.push({ block, id, verdict: pass ? 'PASS' : 'FAIL', label, detail });

function assertDisposable() {
  if (process.env.EXPERIENCES_WITNESS_CONFIRM !== '1') {
    throw new Error('Refusing to run: writes fixtures. Set EXPERIENCES_WITNESS_CONFIRM=1.');
  }
  const url = process.env.DATABASE_URL ?? '';
  const local = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url);
  const disposable = /\/[a-z0-9_]*(falsifier|fixture|shadow|disposable|legacy)[a-z0-9_]*(\?|$)/i.test(url);
  if (!local || !disposable) throw new Error('Refusing: DATABASE_URL must be local and disposable.');
}

async function member(name: string): Promise<string> {
  const id = randomUUID();
  await query(
    `INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
     VALUES ($1,$2,$3,$4,$5,$6,true)`,
    [id, `EXPW-${id.slice(0, 8)}`, `expw_${id.slice(0, 8)}`, 'x'.repeat(64), name,
     `expw+${id.slice(0, 8)}@fixture.invalid`]);
  return id;
}

async function livingWork(memberId: string, title: string, form: string | null): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO living_works (member_id, title, form) VALUES ($1,$2,$3) RETURNING id`,
    [memberId, title, form]);
  return r.rows[0].id;
}

const created: string[] = [];

/* ══════════════ WITNESS A — SELF / POETRY ══════════════════════════════════ */
async function witnessA() {
  const m = await member('Poet'); created.push(m);
  const { experienceId, versionId } = await createExperience({
    ownerMemberId: m, orientation: 'for_myself',
    title: '30 Days of Poetry',
    intention: 'I have always wanted to write poetry and I do not know where to start.',
  });
  await addMovements(versionId, [
    { position: 0, kind: 'day', title: 'Image' },
    { position: 1, kind: 'day', title: 'Sound' },
    { position: 2, kind: 'day', title: 'Compression' },
  ], m);

  // Zero participation rows is a NORMAL state, not an empty one.
  const parts = await query<{ n: string }>(
    `SELECT count(*) AS n FROM writer_experience_participations WHERE experience_id = $1`, [experienceId]);
  check('A', 'A1', 'a self-directed Experience exists with NO participation record',
    parts.rows[0].n === '0', 'zero rows — no student record');

  // No column anywhere can carry progress. Asserted against the live schema, not the source.
  const progressish = await query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns
      WHERE table_name LIKE 'writer_experience%'
        AND (column_name ~ '(current|complet|progress|percent|score|level|rank|stage|streak)')`);
  check('A', 'A2', 'no progress-bearing column exists anywhere in the Experience schema',
    progressish.rows.length === 0,
    progressish.rows.map((r) => `${r.table_name}.${r.column_name}`).join(', ') || 'none');

  // MAIA authored nothing: every movement is the member's.
  const authored = await query<{ n: string }>(
    `SELECT count(*) AS n FROM writer_experience_movements
      WHERE version_id = $1 AND authorship <> 'facilitator'`, [versionId]);
  check('A', 'A3', 'the member authored the container; nothing is MAIA-derived',
    authored.rows[0].n === '0', 'all movements member-authored');
  return { m, experienceId, versionId };
}

/* ══════════════ WITNESS B — FACILITATOR / MEMOIR ═══════════════════════════ */
async function witnessB() {
  const teacher = await member('Memoir facilitator'); created.push(teacher);
  const student = await member('Memoir participant'); created.push(student);

  const { experienceId, versionId } = await createExperience({
    ownerMemberId: teacher, orientation: 'for_others',
    title: 'Six Weeks of Memoir', intention: 'Accompany writers into their own material.',
  });
  await addMovements(versionId, [
    { position: 0, kind: 'week', title: 'The Story Calling You', body: 'My own sequence.', authorship: 'facilitator' },
    { position: 1, kind: 'week', title: 'Memory Into Scene', authorship: 'facilitator' },
  ], teacher);

  // The participant's private Studio, made before they join.
  const privateWork = await livingWork(student, 'The House on Laurel Street', 'Memoir');
  await beginParticipation(experienceId, student);

  /* The participant's Work must not become reachable by ANY declared bridge. The one bridge that
     exists — the author declaring their Work into the Experience — was never used here, and
     joining is a member act the facilitator cannot perform on their behalf. */
  const declaredBridges = await query<{ n: string }>(
    `SELECT count(*) AS n FROM writer_experience_work_relations
      WHERE experience_id = $1 AND living_work_id = $2`, [experienceId, privateWork]);
  const shareSurface = await query<{ n: string }>(
    `SELECT count(*) AS n FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'writer_experience%'
        AND (table_name ~ '(shar|grant|access|visib|roster)')`);
  check('B', 'B1', 'no bridge exists from the Experience to a participant Work',
    declaredBridges.rows[0].n === '0' && shareSurface.rows[0].n === '0',
    `declared relations to the private Work=${declaredBridges.rows[0].n}; ` +
    `sharing/access tables in the Experience namespace=${shareSurface.rows[0].n}`);

  const authorship = await query<{ authorship: string; owner: string }>(
    `SELECT m.authorship, m.authored_by_member_id::text AS owner
       FROM writer_experience_movements m WHERE m.version_id = $1 ORDER BY m.position LIMIT 1`,
    [versionId]);
  check('B', 'B2', "the facilitator's method is attributed to them at movement level",
    authorship.rows[0].authorship === 'facilitator' && authorship.rows[0].owner === teacher,
    'authorship=facilitator, attributed to its author');

  // Revise for next year. The encountered version must not move.
  const before = await query<{ digest: string }>(
    `SELECT md5(string_agg(title, '|' ORDER BY position)) AS digest
       FROM writer_experience_movements WHERE version_id = $1`, [versionId]);
  let refused = false; let detail = '';
  try {
    await addMovements(versionId, [{ position: 2, kind: 'week', title: 'Smuggled into last year' }], teacher);
    detail = 'NOT REFUSED — an encountered version accepted an edit';
  } catch (e) { refused = true; detail = (e as Error).message.slice(0, 90); }
  const after = await query<{ digest: string }>(
    `SELECT md5(string_agg(title, '|' ORDER BY position)) AS digest
       FROM writer_experience_movements WHERE version_id = $1`, [versionId]);
  check('B', 'B3', 'an encountered version cannot be rewritten',
    refused && before.rows[0].digest === after.rows[0].digest, detail);

  const v2 = await reviseExperience(experienceId, 'next year');
  await addMovements(v2, [{ position: 2, kind: 'week', title: 'Voice Across Time' }], teacher);
  const held = await query<{ vn: number }>(
    `SELECT v.version_number AS vn FROM writer_experience_participations p
       JOIN writer_experience_versions v ON v.id = p.version_id
      WHERE p.experience_id = $1 AND p.member_id = $2`, [experienceId, student]);
  check('B', 'B4', 'the earlier participant still holds the version they moved through',
    held.rows[0].vn === 1, `participant on version ${held.rows[0].vn}, revision is version 2`);

  return { teacher, student, experienceId, privateWork };
}

/* ══════════════ WITNESS C — SCREENWRITER ══════════════════════════════════ */
async function witnessC() {
  const m = await member('Screenwriter'); created.push(m);
  const { experienceId, versionId } = await createExperience({
    ownerMemberId: m, orientation: 'for_myself',
    title: 'Develop My Screenplay', intention: 'Twelve weeks with a feature that is already half-written.',
  });
  await addMovements(versionId, [
    { position: 0, kind: 'movement', title: 'Story calling' },
    { position: 1, kind: 'movement', title: 'Dramatic question' },
    { position: 9, kind: 'movement', title: 'Whole Script Encounter' },
  ], m);

  const work = await livingWork(m, 'Second Act Collapse', 'Screenplay');
  await relateWork({ experienceId, livingWorkId: work, declaredBy: m,
    relationshipSentence: 'I brought this screenplay into the twelve weeks.' });
  await beginParticipation(experienceId, m);

  // Entering at movement 9 is not represented at all — there is nowhere to record an entry point.
  const anyPosition = await query<{ n: string }>(
    `SELECT count(*) AS n FROM information_schema.columns
      WHERE table_name = 'writer_experience_participations'
        AND column_name NOT IN ('id','experience_id','version_id','member_id','began_at','ended_at')`);
  check('C', 'C1', 'participation records no position, so entering anywhere violates no invariant',
    anyPosition.rows[0].n === '0', 'participation carries no movement reference of any kind');

  const rel = await query<{ sentence: string }>(
    `SELECT relationship_sentence AS sentence FROM writer_experience_work_relations
      WHERE experience_id = $1 AND living_work_id = $2`, [experienceId, work]);
  check('C', 'C2', "the Work's relation to the Experience is the author's own sentence",
    !!rel.rows[0]?.sentence, rel.rows[0]?.sentence ?? '');

  // The Experience did not decide what kind of Work this is.
  const form = await query<{ form: string | null }>(`SELECT form FROM living_works WHERE id = $1`, [work]);
  const expHasForm = await query<{ n: string }>(
    `SELECT count(*) AS n FROM information_schema.columns
      WHERE table_name LIKE 'writer_experience%' AND column_name = 'form'`);
  check('C', 'C3', 'form belongs to the Work and the Experience has no form column at all',
    form.rows[0].form === 'Screenplay' && expHasForm.rows[0].n === '0',
    `living_works.form=${form.rows[0].form}; Experience form columns=${expHasForm.rows[0].n}`);
  return { m, work };
}

/* ══════════════ WITNESS D — PLAYWRIGHT (the suitcase) ═════════════════════ */
async function witnessD() {
  const playwright = await member('Playwright'); created.push(playwright);
  const { experienceId, versionId } = await createExperience({
    ownerMemberId: playwright, orientation: 'for_myself',
    title: 'Develop My Play', intention: 'Write, hear, stage and revise.',
  });
  await addMovements(versionId, [
    { position: 0, kind: 'movement', title: 'Dramatic situation' },
    { position: 1, kind: 'movement', title: 'Table read' },
    { position: 2, kind: 'movement', title: 'Rehearsal discovery' },
  ], playwright);
  const play = await livingWork(playwright, 'The Glass Orchard', 'Stage play');
  await relateWork({ experienceId, livingWorkId: play, declaredBy: playwright,
    relationshipSentence: 'The play is being developed inside this field.' });

  // The actor is not a member here, and never needs to be.
  const contribution = await recordContribution({
    livingWorkId: play, experienceId, recordedByMemberId: playwright,
    contributorName: 'Maria Alvarez, actor playing Ruth',
    kind: 'performance_discovery', context: 'rehearsal',
    body: "Ruth's line lands more painfully if she is already holding the suitcase.",
  });

  const stored = await query<{ name: string; mid: string | null }>(
    `SELECT contributor_name AS name, contributor_member_id::text AS mid
       FROM living_work_contributions WHERE id = $1`, [contribution]);
  check('D', 'D1', 'a contributor with no account keeps a human-readable identity',
    stored.rows[0].name === 'Maria Alvarez, actor playing Ruth' && stored.rows[0].mid === null,
    stored.rows[0].name);

  // Existence is not membership of the Work.
  const inWork = await query<{ n: string }>(
    `SELECT count(*) AS n FROM living_work_materials WHERE living_work_id = $1`, [play]);
  const adopted = await query<{ n: string }>(
    `SELECT count(*) AS n FROM living_work_contribution_adoptions WHERE contribution_id = $1`, [contribution]);
  check('D', 'D2', 'the contribution is in relationship to the Work without being part of it',
    inWork.rows[0].n === '0' && adopted.rows[0].n === '0',
    'no material, no adoption — the decision has not been taken');

  // The playwright rewrites the scene themselves. Influence adoption: no material changes hands.
  const adoption = await adoptContribution({
    contributionId: contribution, livingWorkId: play, adoptedByMemberId: playwright,
    adoptionKind: 'influence',
    note: 'I rewrote the scene with the suitcase already in her hands.',
  });
  const kind = await query<{ k: string; mat: string | null }>(
    `SELECT adoption_kind AS k, living_work_material_id::text AS mat
       FROM living_work_contribution_adoptions WHERE id = $1`, [adoption]);
  const stillNoMaterial = await query<{ n: string }>(
    `SELECT count(*) AS n FROM living_work_materials WHERE living_work_id = $1`, [play]);
  check('D', 'D3', 'influence adoption records causation without attaching any material',
    kind.rows[0].k === 'influence' && kind.rows[0].mat === null && stillNoMaterial.rows[0].n === '0',
    'the Work changed; nothing of the actor\'s was incorporated');

  // Provenance survives, and says exactly what happened — no more.
  const genealogy = await workContributions(play);
  check('D', 'D4', 'the provenance survives adoption and names the human it came from',
    genealogy.length === 1
      && genealogy[0].contributor_name.startsWith('Maria Alvarez')
      && (genealogy[0].adopted_kinds ?? []).includes('influence'),
    `${genealogy[0]?.contributor_name} → ${(genealogy[0]?.adopted_kinds ?? []).join(',')}`);

  // A Contribution must be possible with no Experience at all (§XV).
  const soloWork = await livingWork(playwright, 'An unrelated Work', null);
  const solo = await recordContribution({
    livingWorkId: soloWork, recordedByMemberId: playwright,
    contributorName: 'Nadia, my editor', kind: 'suggestion', body: 'Cut the prologue.',
  });
  const soloRow = await query<{ e: string | null }>(
    `SELECT experience_id::text AS e FROM living_work_contributions WHERE id = $1`, [solo]);
  check('D', 'D5', 'a Contribution needs no Experience — it belongs to the Work',
    soloRow.rows[0].e === null, 'recorded with experience_id NULL');
}

/* ══════════════ NEGATIVE PRIVACY WITNESS (§XII, §XX) ══════════════════════ */

/** Comments describe the boundary; only executable code may answer for it. */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ');

function* walk(dir: string): Generator<string> {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '__tests__' || e === '.next') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(full) && !/\.test\.tsx?$/.test(full)) yield full;
  }
}

const PRIVATE_TABLES = [
  'living_works', 'member_manuscripts', 'manuscript_sections', 'manuscript_working_drafts',
  'manuscript_draft_sections', 'member_reflections', 'memory_atoms',
];

async function negativePrivacyWitness(ctx: { teacher: string; student: string; experienceId: string; privateWork: string }) {
  // 1. THE ROUTE MUST NOT EXIST IN CODE. Any query mentioning participation and a private table.
  const repo = process.cwd();
  const offenders: string[] = [];
  for (const root of ['app', 'lib']) {
    for (const file of walk(join(repo, root))) {
      const code = stripComments(readFileSync(file, 'utf8'));
      if (!code.includes('writer_experience_participations')) continue;
      for (const t of PRIVATE_TABLES) {
        if (new RegExp(`\\b${t}\\b`).test(code)) offenders.push(`${relative(repo, file)} → ${t}`);
      }
    }
  }
  check('PRIV', 'P1', 'no shipped query reaches a private table from participation',
    offenders.length === 0, offenders.join(' | ') || 'no such query exists');

  /* 2. THE DATABASE OFFERS NO OBJECT THAT PERFORMS THE ROUTE.
   *
   * Stated precisely, because the honest version is narrower than "the route is impossible":
   * every member shares one database role, so participation is NOT a database privilege boundary —
   * it is an application one. What must therefore be true is that nothing has been BUILT that
   * travels it: no view, no function, no trigger. P1 covers the code; this covers the schema.
   * A hand-written join in a psql session still returns rows, and that is exactly why the boundary
   * is the absence of any built route rather than a permission check. */
  const builtRoutes = await query<{ name: string }>(
    `SELECT c.relname AS name FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('v','m')
        AND pg_get_viewdef(c.oid) ILIKE '%writer_experience_participations%'
    UNION ALL
    SELECT p.proname FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.prosrc ILIKE '%writer_experience_participations%'
        AND p.prosrc ILIKE ANY (ARRAY['%living_works%','%member_manuscripts%','%member_reflections%'])`);
  check('PRIV', 'P2', 'no view or function in the database travels participation to private material',
    builtRoutes.rows.length === 0,
    builtRoutes.rows.map((r) => r.name).join(', ') || 'no such database object exists');

  // 3. There is no sharing surface yet, so nothing has been shared.
  const shareTables = await query<{ n: string }>(
    `SELECT count(*) AS n FROM information_schema.tables
      WHERE table_name LIKE 'writer_experience%' AND table_name LIKE '%shar%'`);
  check('PRIV', 'P3', 'no Experience sharing surface exists yet — sharing stays a separate authority',
    shareTables.rows[0].n === '0', 'none built; sharing is not implied by participation');
}

async function main() {
  assertDisposable();
  try {
    await witnessA();
    const b = await witnessB();
    await witnessC();
    await witnessD();
    await negativePrivacyWitness(b);
  } finally {
    for (const m of created) {
      await query(`DELETE FROM living_work_contribution_adoptions WHERE adopted_by_member_id = $1`, [m]).catch(() => {});
      await query(`DELETE FROM living_work_contributions WHERE recorded_by_member_id = $1`, [m]).catch(() => {});
      await query(`DELETE FROM writer_experiences WHERE owner_member_id = $1`, [m]).catch(() => {});
      await query(`DELETE FROM living_works WHERE member_id = $1`, [m]).catch(() => {});
      await query(`DELETE FROM members WHERE id = $1`, [m]).catch(() => {});
    }
  }

  const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
  const names: Record<string, string> = {
    A: 'WITNESS A — SELF / POETRY', B: 'WITNESS B — FACILITATOR / MEMOIR',
    C: 'WITNESS C — SCREENWRITER', D: 'WITNESS D — PLAYWRIGHT (the suitcase)',
    PRIV: 'NEGATIVE PRIVACY WITNESS',
  };
  let block = '';
  for (const l of lines) {
    if (l.block !== block) { block = l.block; console.log(`\n── ${names[block]} ${'─'.repeat(Math.max(2, 48 - names[block].length))}`); }
    console.log(`${pad(l.verdict, 5)} ${pad(l.id, 6)} ${l.label}${l.detail ? `\n             ${l.detail}` : ''}`);
  }
  const failed = lines.filter((l) => l.verdict === 'FAIL');
  console.log(`\n${'═'.repeat(72)}`);
  console.log(`passed ${lines.length - failed.length} · failed ${failed.length}`);
  await closePool();
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await closePool().catch(() => {});
  process.exit(2);
});
