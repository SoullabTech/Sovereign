/**
 * ER-R2 · PRODUCER REGISTRATION + COGNITION ASSEMBLY — DATABASE EVIDENCE.
 *
 * ⭐⭐ THE CENTRAL FALSIFIER: persist a member turn, assemble cognition, and FAIL
 * if those same words occur inside editorial HISTORY as well as being the
 * current utterance. ER-R1 persists the turn before cognition, so that
 * duplication is the bug most likely to exist right now.
 *
 * ⛔ DISPOSABLE DATABASES ONLY — the name must contain `witness`, local cluster.
 *     bash scripts/witness/er-runtime-rebuild-db.sh
 *     DATABASE_URL=… npx tsx scripts/witness/er-r2-assembly-witness.ts
 */
import { readFileSync } from 'node:fs';
import { query, closePool } from '@/lib/db/postgres';
import { persistMemberEditorialAct } from '@/lib/manuscript/editorialRuntime/memberAct';
import { assembleEditorialCognition } from '@/lib/manuscript/editorialRuntime/assembly';
import { PRODUCER_REGISTRY, PRODUCER_IDS } from '@/lib/maia/canonical-turn/producerRegistry';
import { EDITORIAL_PRODUCER_IDS } from '@/lib/manuscript/editorialDiscourse/contract';
import { createMaiaDirection } from '@/lib/manuscript/editorialWorkspace/store';

const M = '11111111-0000-4000-8000-00000000002e';
const WK = '22222222-0000-4000-8000-00000000002e';
const DR = '33333333-0000-4000-8000-00000000002e';
const SE = '44444444-0000-4000-8000-00000000002e';
const CX = 'cccccccc-0000-4000-8000-00000000002e';
const TE = 'aaaa0000-0000-4000-8000-00000000002e';
const V1 = '99990000-0000-4000-8000-000000000021';
const V2 = '99990000-0000-4000-8000-000000000022';

let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);
const one = async (sql: string, p: unknown[] = []) =>
  (await query<Record<string, any>>(sql, p as any[])).rows[0]!;

const THE_WORDS = 'Could you make this quieter, throughout?';
const blockFor = (bs: readonly { producerId: string; text: string }[], id: string) =>
  bs.find((b) => b.producerId === id)?.text ?? '';

async function main() {
  const db = (await one('SELECT current_database() AS d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }
  const dirty = Number((await one(
    'SELECT (SELECT count(*) FROM proposal_chains)+(SELECT count(*) FROM ask_threads) AS n')).n);
  if (dirty !== 0) {
    console.log('  ⛔ REFUSED — this witness database already holds editorial state.');
    console.log('     Rebuild: bash scripts/witness/er-runtime-rebuild-db.sh');
    await closePool(); process.exit(2);
  }
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ER-R2 · PRODUCER REGISTRATION + COGNITION ASSEMBLY');
  console.log('══════════════════════════════════════════════════════════════════\n');

  /* ══ REGISTRATION ══════════════════════════════════════════════════════ */
  console.log('── the four producers ────────────────────────────────────────────');
  const FROZEN: Record<string, readonly [string, string, string]> = {
    'retrieved.writer_editorial_locus': ['member', 'retrieved', 'situate'],
    'member.writer_editorial_history':  ['member', 'retrieved', 'situate'],
    'system.writer_editorial_history':  ['system', 'retrieved', 'situate'],
    'member.writer_editorial_act':      ['member', 'declared',  'situate'],
  };
  eq('A1 the declared set IS the registered set (exactly four)',
     [...EDITORIAL_PRODUCER_IDS].sort().join('|'), Object.keys(FROZEN).sort().join('|'));
  for (const [id, axes] of Object.entries(FROZEN)) {
    const spec = (PRODUCER_REGISTRY as any)[id];
    if (!spec) { bad(`A2 ${id} registered`, 'absent from PRODUCER_REGISTRY'); continue; }
    eq(`A2 ${id} · axes`, [spec.authoredBy, spec.participationClass, spec.authority].join('/'), axes.join('/'));
    eq(`A3 ${id} · writers_studio ONLY`, spec.rooms.join(','), 'writers_studio');
    eq(`A3 ${id} · not mandatory · route · verified · notSanctuary false`,
       `${spec.mandatory}/${spec.scope}/${spec.requires.identity}/${spec.requires.notSanctuary}`,
       'false/route/verified/false');
  }
  eq('A4 ⛔ no FIFTH editorial id crept into the registry',
     PRODUCER_IDS.filter((i) => i.includes('writer_editorial')).length, 4);

  /* ══ FIXTURES ══════════════════════════════════════════════════════════ */
  await query(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'ER-R2','er_r2','x')`, [M]);
  await query(`INSERT INTO member_manuscripts (id,member_id) VALUES ($1,$2)`, [WK, M]);
  await query(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash)
               VALUES ($1,$2,$3,'Before the water.','sha-er2')`, [DR, WK, M]);
  await query(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text)
               VALUES ($1,$2,1,'Before the water.')`, [SE, DR]);
  await query(`INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text)
               VALUES ($1,$2,$3,$4,1,$5,'Before the water.')`, [CX, M, WK, DR, SE]);
  /* ⭐ a real two-step succession, so lineage order is observable */
  await query(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
               VALUES ($1,$2,'maia','ALPHA-FIRST',NULL)`, [V1, CX]);
  await query(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
               VALUES ($1,$2,'member','OMEGA-SECOND',$3)`, [V2, CX, V1]);
  await query(`INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,canonical_at_open,initiated_by,proposal_chain_id)
               VALUES ($1,$2,$3,NULL,'c1','author',$4)`, [TE, WK, M, CX]);
  /* prior discourse: member turn 0, maia turn 1, and a MAIA Direction bound to turn 1 */
  const md = await createMaiaDirection(M, CX, { instruction: 'try it quieter', refersTo: V1 });
  if (!md.ok) { bad('FIXTURE maia direction', md.reason); }
  await query(`INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness)
               VALUES ($1,0,'author','What if it were softer?','{}'::jsonb),
                      ($1,1,'maia','Here is one way.','{}'::jsonb)`, [TE]);
  if (md.ok) {
    await query(`INSERT INTO editorial_turn_bindings
                   (thread_id,turn_index,turn_speaker,proposal_chain_id,act_author,direction_id,version_id)
                 VALUES ($1,1,'maia',$2,'maia',$3,NULL)`, [TE, CX, md.direction.id]);
  }

  /* ══ THE CENTRAL FALSIFIER ═════════════════════════════════════════════ */
  console.log('\n── ⭐⭐ the current utterance is not history ──────────────────────');
  const act = await persistMemberEditorialAct({
    memberId: M, threadId: TE, act: { act: 'direction', text: THE_WORDS, refersTo: V2 } });
  if (!act.ok) { bad('B0 the member act landed', act.reason); await closePool(); process.exit(1); }
  eq('B0 the member act landed at turn 2', act.turnIndex, 2);

  const a = await assembleEditorialCognition({
    memberId: M, threadId: TE, currentTurnIndex: act.turnIndex,
    declaredAct: 'direction', currentDirectionId: act.direction!.id });
  if (!a.ok) { bad('B1 assembly succeeded', a.reason); await closePool(); process.exit(1); }
  ok('B1 assembly succeeded');

  const all = a.blocks.map((b) => b.text).join('\n');
  const memberHistory = blockFor(a.blocks, 'member.writer_editorial_history');
  const systemHistory = blockFor(a.blocks, 'system.writer_editorial_history');
  const actBlock = blockFor(a.blocks, 'member.writer_editorial_act');

  eq('B2 ⭐⭐ the current utterance is ABSENT from member history',
     memberHistory.includes(THE_WORDS), false);
  eq('B2b ⭐⭐ and absent from EVERY assembled block',
     all.includes(THE_WORDS), false);
  eq('B3 ⭐⭐ the Direction this act created is absent from history too',
     all.includes('quieter, throughout'), false);
  eq('B4 ⭐ the declared-act block carries the KIND and no second copy of the words',
     actBlock.length > 0 && !actBlock.includes(THE_WORDS), true);

  /* ══ PARTITION · INTERLEAVING · LINEAGE · RELATIONS ════════════════════ */
  console.log('\n── partition · interleaving · lineage · relations ────────────────');
  eq('C1 prior MEMBER turn is in the member half', memberHistory.includes('What if it were softer?'), true);
  eq('C1b ⛔ and NOT in the system half', systemHistory.includes('What if it were softer?'), false);
  eq('C2 prior MAIA turn is in the system half', systemHistory.includes('Here is one way.'), true);
  eq('C2b ⛔ and NOT in the member half', memberHistory.includes('Here is one way.'), false);
  eq('C3 ⭐ the MAIA Direction is in the SYSTEM half — authorship decides, not the room',
     systemHistory.includes('try it quieter'), true);
  eq('C4 ⭐ turn interleaving survives via turn_index', /\b0\b[\s\S]*\b1\b/.test(all), true);
  /* ⭐⭐ C5 WAS REPAIRED, AND THE REPAIR IS THE FINDING.
   *
   * It first asserted text ORDER across the whole assembly — `', held'` before
   * `', held twice'` — and failed for two reasons, neither of them a lineage
   * defect: the fixture strings were prefix-confusable, and, more importantly,
   * ⭐ VERSIONS ARE PARTITIONED BY AUTHORSHIP, so a MAIA version and the member
   * version succeeding it land in DIFFERENT BLOCKS. Concatenation order across
   * the partition says nothing about succession.
   *
   * ⭐⭐ The contract carries lineage as an EXPLICIT RELATION instead — the root
   * is marked `the first`, the successor names its predecessor BY ID — and that
   * relation SURVIVES the authorship partition. That is the W4-1.2 law
   * (*partitioning provenance must not partition away relationship*) holding in
   * the rendering, and it is strictly stronger than the order test it replaces. */
  eq('C5a ⭐ the root version is marked as the first', /ALPHA-FIRST/.test(systemHistory)
     && /the first[^\n]*ALPHA-FIRST/.test(systemHistory), true);
  eq('C5b ⭐⭐ the successor names its predecessor BY ID, across the partition',
     memberHistory.includes(`succeeding ${V1}`) && memberHistory.includes('OMEGA-SECOND'), true);
  eq('C5c ⭐ and the two really are in different halves — the relation crosses it',
     systemHistory.includes('OMEGA-SECOND') || memberHistory.includes('ALPHA-FIRST'), false);
  eq('C6 ⭐ Direction→turn relation survives', /turn\s*1/i.test(systemHistory), true);
  eq('C7 the predecessor MAIA is invoked against is the head', a.invokedAgainstVersionId, V2);

  /* ══ DISCOURSE MINTS NOTHING ═══════════════════════════════════════════ */
  console.log('\n── discourse mints nothing · no generic history ──────────────────');
  const before = Number((await one('SELECT count(*)::int n FROM proposal_chain_directions')).n);
  const d2 = await persistMemberEditorialAct({
    memberId: M, threadId: TE, act: { act: 'discourse', text: 'Could you make this quieter?', refersTo: null } });
  eq('D1 declared discourse succeeds', d2.ok, true);
  eq('D1b ⭐ directive-sounding discourse minted NO Direction',
     Number((await one('SELECT count(*)::int n FROM proposal_chain_directions')).n), before);

  const SRC = readFileSync('lib/manuscript/editorialRuntime/assembly.ts', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  eq('D2 ⛔ [SOURCE] no generic conversation history is consulted',
     /conversation_turns|conversationHistory|loadConversation/.test(SRC), false);
  eq('D3 ⛔ [SOURCE] the assembly writes nothing',
     /INSERT INTO|UPDATE |DELETE FROM/.test(SRC), false);
  eq('D4 ⛔ [SOURCE] no generic escape hatch',
     /extraCandidates|Record<string,\s*unknown>|as any/.test(SRC), false);
  eq('D5 ⛔ [SOURCE] readProposalWork, never raw readChain',
     /readProposalWork/.test(SRC) && !/\breadChain\b/.test(SRC), true);
  const ct = await one(`SELECT to_regclass('public.conversation_turns') IS NOT NULL AS t`);
  if (ct.t) {
    eq('D6 ⛔ no conversation_turns row was written',
       Number((await one('SELECT count(*)::int n FROM conversation_turns')).n), 0);
  } else ok('D6 ⛔ conversation_turns is not even reachable from this schema');

  console.log(`\n  ${pass} passed · ${fail} failed`);
  await closePool();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await closePool(); process.exit(2); });
