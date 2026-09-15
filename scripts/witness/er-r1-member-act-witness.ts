/**
 * ER-R1 · THE ATOMIC MEMBER ACT — DATABASE EVIDENCE.
 *
 * ⭐⭐ WHY THIS EXISTS: `ER-F7` models atomicity IN-PROCESS, against a test
 * double with no database and no transaction. That is enough to prove the law is
 * satisfiable and NOT enough to prove this implementation satisfies it. Here the
 * refusal positions are real, the rollback is PostgreSQL's, and the counts are
 * read back from the tables afterwards.
 *
 * ⛔ DISPOSABLE DATABASES ONLY. The name must contain `witness`, and it takes a
 * LOCAL CLUSTER, never a DSN — it cannot reach the protected host.
 *
 *     PGP=5603 npx tsx scripts/witness/er-r1-member-act-witness.ts
 */
import { query, closePool } from '@/lib/db/postgres';
import { persistMemberEditorialAct } from '@/lib/manuscript/editorialRuntime/memberAct';

const M = '11111111-0000-4000-8000-00000000000e';
const WK = '22222222-0000-4000-8000-00000000000e';
const DR = '33333333-0000-4000-8000-00000000000e';
const SE = '44444444-0000-4000-8000-00000000000e';
const CX = 'cccccccc-0000-4000-8000-00000000000e'; /* the thread's own chain */
const CY = 'cccccccc-0000-4000-8000-00000000000f'; /* a foreign chain */
const TE = 'aaaa0000-0000-4000-8000-00000000000e'; /* editorial thread */
const TA = 'aaaa0000-0000-4000-8000-00000000000a'; /* anchored Ask thread */
const VF = '99990000-0000-4000-8000-00000000000f'; /* a version in the FOREIGN chain */

let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

const one = async (sql: string, p: unknown[] = []) =>
  (await query<Record<string, any>>(sql, p as any[])).rows[0]!;

/** ⭐ The three counts, always read together. A refusal must move none of them. */
async function counts(threadId: string) {
  const r = await one(
    `SELECT (SELECT count(*) FROM ask_turns WHERE thread_id = $1)::int AS turns,
            (SELECT count(*) FROM proposal_chain_directions)::int      AS directions,
            (SELECT count(*) FROM editorial_turn_bindings)::int        AS bindings`,
    [threadId]);
  return `${r.turns}/${r.directions}/${r.bindings}`;
}

const turnsOn = async (threadId: string) =>
  Number((await one('SELECT count(*)::int AS n FROM ask_turns WHERE thread_id = $1', [threadId])).n);

async function main() {
  const db = (await one('SELECT current_database() AS d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ER-R1 · ATOMIC MEMBER ACT — DATABASE EVIDENCE');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(` database  ${db}\n`);

  /* ⭐⭐ IT CANNOT CLEAN UP AFTER ITSELF, AND THAT IS THE SCHEMA WORKING.
     A rerun found the first version passing only on a fresh database. The
     obvious repair — delete the fixtures first — IS IMPOSSIBLE BY DESIGN:
     `proposal_chains` is append-only and Directions are refused DELETE by
     `authored_editorial_record_immutable`. ⛔ An authored editorial record
     cannot be removed by anything, including its own witness.
     ⭐ So the witness REFUSES a dirty database and names the rebuild, rather
     than reporting a result that depends on whether it has run before. */
  const dirty = Number((await one(
    'SELECT (SELECT count(*) FROM proposal_chains) + (SELECT count(*) FROM ask_threads) AS n')).n);
  if (dirty !== 0) {
    console.log('  ⛔ REFUSED — this witness database already holds editorial state.');
    console.log('     Editorial records are constitutionally undeletable, so it cannot');
    console.log('     be cleaned in place. Rebuild it:');
    console.log('       bash scripts/witness/er-runtime-rebuild-db.sh');
    await closePool();
    process.exit(2);
  }

  await query(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'ER-R1','er_r1','x')`, [M]);
  await query(`INSERT INTO member_manuscripts (id,member_id) VALUES ($1,$2)`, [WK, M]);
  await query(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash)
               VALUES ($1,$2,$3,'Before the water.','sha-er1')`, [DR, WK, M]);
  await query(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text)
               VALUES ($1,$2,1,'Before the water.')`, [SE, DR]);
  await query(`INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text)
               VALUES ($1,$3,$4,$5,1,$6,'Before the water.'),($2,$3,$4,$5,1,$6,'Before the water.')`,
              [CX, CY, M, WK, DR, SE]);
  await query(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
               VALUES ($1,$2,'maia',', elsewhere',NULL)`, [VF, CY]);
  await query(`INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,canonical_at_open,initiated_by,proposal_chain_id)
               VALUES ($1,$2,$3,NULL,'c1','author',$4)`, [TE, WK, M, CX]);
  await query(`INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,canonical_at_open,initiated_by,proposal_chain_id)
               VALUES ($1,$2,$3,'{"kind":"section"}'::jsonb,'c1','author',NULL)`, [TA, WK, M]);

  /* ══ POSITIVE · declared discourse ═════════════════════════════════════ */
  console.log('── the positive halves ───────────────────────────────────────────');
  const d1 = await persistMemberEditorialAct({ memberId: M, threadId: TE,
    act: { act: 'discourse', text: 'Could you make this quieter?', refersTo: null } });
  eq('P1 declared discourse succeeds', d1.ok, true);
  eq('P1 ⭐ 1 turn · 0 Direction · 0 binding — prose that SOUNDS directive minted nothing',
     await counts(TE), '1/0/0');

  /* ══ POSITIVE · declared Direction ═════════════════════════════════════ */
  const RAW = '  Make it quieter.  ';
  const d2 = await persistMemberEditorialAct({ memberId: M, threadId: TE,
    act: { act: 'direction', text: RAW, refersTo: null } });
  eq('P2 declared Direction succeeds', d2.ok, true);
  eq('P2 ⭐ 2 turns · 1 Direction · 1 binding', await counts(TE), '2/1/1');
  const stored = await one(
    `SELECT d.instruction, t.body, b.turn_speaker, b.act_author, b.version_id
       FROM proposal_chain_directions d
       JOIN editorial_turn_bindings b ON b.direction_id = d.id
       JOIN ask_turns t ON t.thread_id = b.thread_id AND t.turn_index = b.turn_index`);
  eq('P2 ⭐⭐ instruction === turn body, character for character', stored.instruction, stored.body);
  eq('P2 ⛔ and the member’s whitespace survived the host', stored.instruction, RAW);
  eq('P2 the binding says author/member', `${stored.turn_speaker}/${stored.act_author}`, 'author/member');
  eq('P2 ⛔ and carries no version', stored.version_id, null);

  const base = await counts(TE);

  /* ══ REFUSAL 1 · the turn cannot be written ════════════════════════════ */
  console.log('\n── ⭐⭐ the three refusal positions ───────────────────────────────');
  const FOREIGN = '11111111-0000-4000-8000-0000000000ff';
  const r1 = await persistMemberEditorialAct({ memberId: FOREIGN, threadId: TE,
    act: { act: 'direction', text: 'not mine', refersTo: null } });
  eq('R1 a foreign member is refused', r1.ok === false && r1.reason, 'thread_not_found');
  eq('R1 ⭐ turn 0 · Direction 0 · binding 0 — nothing moved', await counts(TE), base);

  const rA = await persistMemberEditorialAct({ memberId: M, threadId: TA,
    act: { act: 'direction', text: 'on an anchored thread', refersTo: null } });
  eq('R1b an ANCHORED Ask thread has no editorial subject',
     rA.ok === false && rA.reason, 'not_editorial');
  eq('R1b ⛔ and the anchored thread has no turn of its own', await turnsOn(TA), 0);
  eq('R1b ⛔ nor did the editorial thread move', await counts(TE), base);

  /* ══ REFUSAL 2 · the Direction refuses AFTER the turn insert ═══════════ */
  const r2 = await persistMemberEditorialAct({ memberId: M, threadId: TE,
    act: { act: 'direction', text: 'steer me', refersTo: VF } });
  eq('R2 a reference to a version in ANOTHER chain is refused',
     r2.ok === false && r2.reason, 'direction_refused');
  eq('R2 ⭐⭐ ROLLBACK — the turn that had already been written is GONE', await counts(TE), base);

  /* ══ REFUSAL 3 · the binding refuses AFTER turn + Direction ════════════ */
  /* ⛔ A DISPOSABLE-ONLY FAULT. Installed here, dropped in `finally`, and the
     whole database is dropped afterwards. ⛔ NO PRODUCTION FAULT HOOK EXISTS —
     the 2026-09-10 lesson: a witness that mutates a database anyone uses is a
     witness that can wedge it. */
  await query(`CREATE FUNCTION er_r1_refuse_binding() RETURNS trigger AS $$
               BEGIN RAISE EXCEPTION 'er_r1 disposable fault'; END; $$ LANGUAGE plpgsql`);
  await query(`CREATE TRIGGER er_r1_fault BEFORE INSERT ON editorial_turn_bindings
               FOR EACH ROW EXECUTE FUNCTION er_r1_refuse_binding()`);
  try {
    let threw = false;
    try {
      await persistMemberEditorialAct({ memberId: M, threadId: TE,
        act: { act: 'direction', text: 'the binding will refuse', refersTo: null } });
    } catch { threw = true; }
    eq('R3 the binding refusal propagates (it is not a governed refusal)', threw, true);
    eq('R3 ⭐⭐ ROLLBACK — turn AND Direction both gone', await counts(TE), base);
  } finally {
    await query('DROP TRIGGER IF EXISTS er_r1_fault ON editorial_turn_bindings');
    await query('DROP FUNCTION IF EXISTS er_r1_refuse_binding()');
  }
  eq('R3b ⭐ and the fault is removed — the act succeeds again afterwards',
     (await persistMemberEditorialAct({ memberId: M, threadId: TE,
       act: { act: 'direction', text: 'now it lands', refersTo: null } })).ok, true);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  await closePool();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await closePool(); process.exit(2); });
