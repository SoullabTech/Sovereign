/**
 * W5-4 — THE EDITORIAL RECORD STORE SEAM. I1…I5 · D1…D6 · R1…R3 · Z1…Z4.
 *
 * ⭐⭐ THE GOVERNING SENTENCE (founder, 2026-09-14):
 *
 *     Opening an editorial relationship and recording the first thing MAIA
 *     actually saw must be ONE DURABLE ACT; failure may leave neither half
 *     pretending the other happened.
 *
 * ⛔ DISPOSABLE DATABASE ONLY — and specifically the **W5 schema** database,
 * which carries `20260914000005`. Rebuild with `scripts/witness/w5-rebuild-db.sh`.
 *
 * ── EVIDENCE CLASSES, NAMED (the lane's standing rule) ─────────────────────
 *
 *  BEHAVIOURAL   every obligation but Z4 — real rows through the real store,
 *                including the real foreign-key refusals and a real aborted
 *                transaction.
 *
 *  SOURCE-LEVEL  Z4 only: "no second proposal-chain INSERT exists" is a claim
 *                about the CODEBASE, and no runtime behaviour can establish it.
 *                Labelled, comment-stripped (the C21 class), anchored.
 *
 * ⛔ R3 IS RUN AGAINST A GENUINELY BROKEN SUBSTRATE, not a stubbed one: the
 * table is renamed out from under the read and restored in a `finally`. That is
 * the 2026-09-10 walk-12 shape, so it is bounded here by the disposable-database
 * guard above — ⛔ it must never point at a database anyone uses.
 */
import { query, closePool } from '@/lib/db/postgres';
import type { InsightResult } from '@/lib/manuscript/editorialWorkspace/store';
import {
  createInsight, readInsights,
  createMemberDirection, createMaiaDirection, readDirections,
  openChainWithInsight,
} from '@/lib/manuscript/editorialWorkspace/store';
import { openChain } from '@/lib/manuscript/proposalChain/store';

const codeOf = (rel: string) => require('fs')
  .readFileSync(require('path').join(__dirname, '../..', rel), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const url = process.env.DATABASE_URL ?? '';
const dbName = url.split('?')[0].split('/').pop() ?? '';
if (!dbName.includes('witness')) {
  console.error(`REFUSED · '${dbName || '(none)'}' is not a witness database.`);
  process.exit(2);
}
let pass = 0; let fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: unknown) => { fail++; console.log(`  FAIL  ${s}\n     -> ${String(d)}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  JSON.stringify(got) === JSON.stringify(want)
    ? ok(`${s}  [${JSON.stringify(got)}]`)
    : bad(s, `got ${JSON.stringify(got)} · want ${JSON.stringify(want)}`);

const M = '11111111-1111-1111-1111-111111111111';
const M2 = '55555555-5555-5555-5555-555555555555';
const uuid = async () => (await query<{ u: string }>('SELECT gen_random_uuid() AS u')).rows[0].u;
const ABSENT = '99999999-9999-9999-9999-999999999999';

/**
 * ⭐ ONE OBLIGATION'S THROW IS THAT OBLIGATION'S FAILURE.
 *
 * ⛔ The catch-all in `main()` keeps the process alive, but a mutant killed only
 * by *"the witness could not complete"* is killed for the wrong reason: the
 * obligation that should have named it was never evaluated. Creation calls that
 * a mutant can make throw are wrapped, so the comparison still happens and the
 * failure still says what was actually wrong.
 */
const attempt = async <T>(f: () => Promise<T>): Promise<T | { threw: string }> =>
  f().catch((e) => ({ threw: String((e as { code?: string }).code ?? e) }));

const counts = async (chainId: string) => {
  const v = await query<{ n: string }>(
    'SELECT count(*) AS n FROM proposal_versions WHERE chain_id = $1', [chainId]);
  return Number(v.rows[0].n);
};

async function locusFor(member: string) {
  const workId = await uuid(); const draftId = await uuid(); const sectionId = await uuid();
  await query(`INSERT INTO member_manuscripts (id) VALUES ($1)`, [workId]);
  await query(`INSERT INTO manuscript_working_drafts
                 (id, manuscript_id, member_id, version, section_addressable_at)
               VALUES ($1,$2,$3,41, now())`, [draftId, workId, member]);
  await query(`INSERT INTO manuscript_draft_sections (id, draft_id, text)
               VALUES ($1,$2,$3)`, [sectionId, draftId,
    'He was there, fixated, and the river ran on without him.']);
  return { workId, draftId, baseVersion: 41, targetSectionId: sectionId,
           expectedText: ', fixated' };
}
async function addVersion(chainId: string, text: string, supersedes: string | null) {
  const r = await query<{ id: string }>(
    `INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)
     VALUES ($1,'maia',$2,$3) RETURNING id`, [chainId, text, supersedes]);
  return r.rows[0].id;
}

async function run() {
  await query(`INSERT INTO members (id) VALUES ($1),($2) ON CONFLICT DO NOTHING`, [M, M2]);
  console.log('── W5-4 · the editorial record store seam ─────────────────────');

  const locus = await locusFor(M);
  const chain = (await openChain(M, { locus })).id;
  const foreignLocus = await locusFor(M2);
  const foreignChain = (await openChain(M2, { locus: foreignLocus })).id;

  /* ══════════════════════════════════════════════════════════════════════════
     INSIGHT
     ══════════════════════════════════════════════════════════════════════════ */

  const OBS = 'The paragraph turns twice on "fixated"; the second turn is doing '
    + 'the work of the first.';
  const i1 = await createInsight(M, chain, OBS);
  eq('I1 · ⭐ an Insight on an owned chain is MAIA-authored and round-trips exactly',
    i1.ok ? [i1.insight.author, i1.insight.observation === OBS,
             i1.insight.chainId === chain, typeof i1.insight.id === 'string',
             i1.insight.__notAuthorizable] : i1,
    ['maia', true, true, true, true]);

  /* ⛔ I2 · THE CALLER CANNOT CHOOSE THE AUTHOR, and the proof is structural
     rather than a rejected value: `createInsight` HAS NO author parameter, so
     there is nothing for a future route to forward. The database agrees —
     `author text NOT NULL CHECK (author = 'maia')` with no default. */
  eq('I2 · ⭐⭐ createInsight takes exactly (memberId, chainId, observation)',
    createInsight.length, 3);
  /* ⭐⭐ AND THE BEHAVIOURAL HALF, because arity alone is not enough: a DEFAULT
     parameter keeps `Function.length` at 3 while opening the door completely.
     ⛔ So a spurious fourth argument is pushed at it, as a future route
     forwarding a request body would, and the record must be unmoved. */
  /* ⚠️ ON ITS OWN CHAIN, AND THAT IS NOT TIDINESS. The first writing of this
     probe wrote a third Insight into `chain`, and I5 and R3b — which count that
     chain's record — went red on the CLEAN implementation. An obligation that
     changes the fixture it is measured beside is an obligation that breaks its
     neighbours, and the mutation run taken against it had to be withdrawn. */
  const smuggleChain = (await openChain(M, { locus: await locusFor(M) })).id;
  const smuggled = await (createInsight as unknown as (
    m: string, c: string, o: string, a: string) => Promise<InsightResult>)(
      M, smuggleChain, 'Smuggled authorship.', 'member')
    .then((r) => (r.ok ? r.insight.author : `REFUSED:${r.reason}`))
    .catch((e) => `THREW:${(e as { code?: string }).code}`);
  eq('I2c · ⭐⭐ a fourth argument naming another author changes nothing',
    smuggled, 'maia');

  const forced = await query(
    `INSERT INTO proposal_chain_insights (member_id, proposal_chain_id, author, observation)
     VALUES ($1,$2,'member','x') RETURNING id`, [M, chain])
    .then(() => 'ACCEPTED').catch((e) => (e as { code?: string }).code);
  eq('I2b · ⛔ and the substrate itself refuses any other author', forced, '23514');

  /* ── I3 · foreign / unknown chain → the same outward refusal ───────────── */
  const i3a = await createInsight(M, foreignChain, OBS);
  const i3b = await createInsight(M, ABSENT, OBS);
  eq('I3 · ⛔ another member\'s chain and a non-existent one are indistinguishable',
    [i3a.ok ? 'WROTE' : i3a.reason, i3b.ok ? 'WROTE' : i3b.reason],
    ['chain_unknown', 'chain_unknown']);
  eq('I3b · ⛔ and nothing was written into the foreign chain',
    (await readInsights(M2, foreignChain)).length, 0);

  /* ── I4 · ⭐⭐ AN INSIGHT NEVER BECOMES A SUGGESTION ───────────────────── */
  eq('I4 · ⭐⭐ creating an Insight adds ZERO ProposalVersions', await counts(chain), 0);
  /* ⚠️ AND THIS OBLIGATION CAUGHT ME, NOT THE CODE — the C21 class, again. The
     first writing scanned the record for `authoriz`, which matched
     `__notAuthorizable`: a ban on authorization vocabulary firing on the one
     field whose entire purpose is to DECLARE that the object is not
     authorizable. ⭐ Asserted as the whole shape instead, which is what was
     meant and cannot be satisfied by a spelling: the record has exactly these
     fields and there is nowhere for wording to live. */
  eq('I4b · ⭐⭐ the Insight has EXACTLY the contract fields — nowhere to put wording',
    i1.ok ? Object.keys(i1.insight).sort() : i1,
    ['__notAuthorizable', 'author', 'authoredAt', 'chainId', 'id', 'observation']);
  eq('I4c · ⛔ and no candidate/execution field in any spelling, brand excluded',
    ['replacementtext', 'formulation', 'supersedes', 'operation', 'expectedtext',
     'range', 'authorization', 'executable']
      .filter((t) => (i1.ok ? Object.keys(i1.insight) : [])
        .filter((k) => k !== '__notAuthorizable')
        .some((k) => k.toLowerCase().includes(t))), []);

  /* ── I5 · several observations, and NONE of them is "current" ──────────── */
  const i5 = await createInsight(M, chain, 'And the river image is the better anchor.');
  const insights = await readInsights(M, chain);
  eq('I5 · ⭐ a second Insight does not withdraw the first — both survive',
    [i5.ok, insights.length,
     insights.some((x) => x.observation === OBS),
     insights.every((x) => x.author === 'maia')], [true, 2, true, true]);
  eq('I5b · ⛔ and nothing in the returned record declares one of them current',
    ['current', 'latest', 'active', 'head', 'spent', 'answered']
      .filter((t) => JSON.stringify(insights).toLowerCase().includes(t)), []);

  /* ══════════════════════════════════════════════════════════════════════════
     DIRECTION
     ══════════════════════════════════════════════════════════════════════════ */

  const v1 = await addVersion(chain, ', held', null).catch(() => 'FIXTURE_THREW');
  const otherChain = (await openChain(M, { locus: await locusFor(M) })).id;
  const otherV = await addVersion(otherChain, ', elsewhere', null);

  const d1 = await attempt(() => createMemberDirection(M, chain, {
    instruction: 'Give me a gentler option.', refersTo: null }));
  eq('D1 · ⭐ the member steers, and the record says so',
    'ok' in d1 && d1.ok
      ? [d1.direction.author, d1.direction.instruction, d1.direction.refersTo] : d1,
    ['member', 'Give me a gentler option.', null]);

  const d2 = await attempt(() => createMaiaDirection(M, chain, {
    instruction: 'Let me try the shorter form first.', refersTo: null }));
  eq('D2 · ⭐ MAIA steers through a DIFFERENT function, never a field',
    'ok' in d2 && d2.ok ? d2.direction.author : d2, 'maia');
  eq('D2b · ⭐⭐ neither creator accepts an author argument',
    [createMemberDirection.length, createMaiaDirection.length], [3, 3]);

  eq('D3 · a Direction with no reference is lawful',
    'ok' in d1 && d1.ok ? d1.direction.refersTo : d1, null);

  const d4 = await attempt(() => createMemberDirection(M, chain, {
    instruction: 'Go back to what V1 was doing.', refersTo: v1 }));
  eq('D4 · ⭐ a reference to a version of THIS chain is lawful',
    'ok' in d4 && d4.ok ? d4.direction.refersTo === v1 : d4, true);
  /* ⛔⛔ AND IT IS A REFERENCE, NOT A SUCCESSION. */
  eq('D4b · ⛔ referring to V1 creates no succession fact anywhere',
    [Object.keys('ok' in d4 && d4.ok ? d4.direction : {}).includes('supersedes'),
     await counts(chain)], [false, 1]);

  const d5 = await attempt(() => createMemberDirection(M, chain, {
    instruction: 'Do that one instead.', refersTo: otherV }));
  eq('D5 · ⭐⭐ a reference to ANOTHER chain\'s version is REFUSED',
    'ok' in d5 ? (d5.ok ? 'WROTE' : d5.reason) : d5, 'reference_not_in_chain');
  /* ⭐ THE OBLIGATION THAT MATTERS MOST: refusing is not the whole of it. A
     "helpful" store could pick the nearest version of this chain instead. */
  const afterD5 = await readDirections(M, chain);
  eq('D5b · ⛔ and NO substitute version was chosen — the row simply does not exist',
    afterD5.filter((d) => d.instruction === 'Do that one instead.').length, 0);

  const d5b = await attempt(() => createMemberDirection(M, foreignChain, {
    instruction: 'Not mine.', refersTo: null }));
  eq('D5c · ⛔ a foreign chain refuses as absence, distinctly from a bad reference',
    'ok' in d5b ? (d5b.ok ? 'WROTE' : d5b.reason) : d5b, 'chain_unknown');

  eq('D6 · ⭐⭐ Direction creation adds ZERO ProposalVersions', await counts(chain), 1);
  eq('D6b · ⛔ and no Direction carries candidate wording in any spelling',
    ['replacementtext', 'formulation', 'supersedes', 'operation']
      .filter((t) => JSON.stringify(afterD5).toLowerCase().includes(t)), []);
  eq('D6c · ⛔ nor an answer state', afterD5.length > 0
    && ['spent', 'answered', 'current', 'latest', 'open']
      .filter((t) => JSON.stringify(afterD5).toLowerCase().includes(t)), []);

  /* ══════════════════════════════════════════════════════════════════════════
     READS
     ══════════════════════════════════════════════════════════════════════════ */

  eq('R1 · ⛔ another member cannot read these Insights',
    (await readInsights(M2, chain)).length, 0);
  eq('R2 · ⛔ another member cannot read these Directions',
    (await readDirections(M2, chain)).length, 0);
  eq('R1b · ⭐ and the owner still can — the read is not simply broken',
    [(await readInsights(M, chain)).length > 0,
     (await readDirections(M, chain)).length > 0], [true, true]);

  /* ── R3 · ⭐⭐ AN OUTAGE IS NEVER REPORTED AS "NOTHING TO SAY" ──────────── */
  let insightThrew = 'RETURNED EMPTY'; let directionThrew = 'RETURNED EMPTY';
  try {
    await query('ALTER TABLE proposal_chain_insights RENAME TO pci__witness_offline');
    await query('ALTER TABLE proposal_chain_directions RENAME TO pcd__witness_offline');
    try { await readInsights(M, chain); } catch { insightThrew = 'THREW'; }
    try { await readDirections(M, chain); } catch { directionThrew = 'THREW'; }
  } finally {
    await query('ALTER TABLE pci__witness_offline RENAME TO proposal_chain_insights')
      .catch(() => undefined);
    await query('ALTER TABLE pcd__witness_offline RENAME TO proposal_chain_directions')
      .catch(() => undefined);
  }
  eq('R3 · ⭐⭐ a broken substrate THROWS — never "no insights" / "no directions"',
    [insightThrew, directionThrew], ['THREW', 'THREW']);
  eq('R3b · ⭐ and the restore worked, so later obligations are judging real rows',
    (await readInsights(M, chain)).length, 2);

  /* ══════════════════════════════════════════════════════════════════════════
     ⭐⭐ THE ZERO-VERSION ACT
     ══════════════════════════════════════════════════════════════════════════ */

  const chainsBefore = Number((await query<{ n: string }>(
    'SELECT count(*) AS n FROM proposal_chains WHERE member_id = $1', [M])).rows[0].n);

  const z = await openChainWithInsight(M, { locus: await locusFor(M) },
    'I would keep this as it stands.');
  eq('Z1 · ⭐⭐ one new chain · ZERO versions · one MAIA Insight',
    [await counts(z.chain.id),
     (await readInsights(M, z.chain.id)).length,
     z.insight.author, z.insight.chainId === z.chain.id],
    [0, 1, 'maia', true]);

  /* ── Z2 · ⭐⭐ THE ORPHAN-CHAIN OBLIGATION ─────────────────────────────── */
  /* A real failure of the Insight insert, caused by a real constraint: the
     observation CHECK refuses blank text. ⛔ Nothing is stubbed and nothing is
     mocked — this is the same insert every other path takes. */
  const before = Number((await query<{ n: string }>(
    'SELECT count(*) AS n FROM proposal_chains WHERE member_id = $1', [M])).rows[0].n);
  let z2 = 'RETURNED';
  try {
    await openChainWithInsight(M, { locus: await locusFor(M) }, '   ');
  } catch { z2 = 'THREW'; }
  const after = Number((await query<{ n: string }>(
    'SELECT count(*) AS n FROM proposal_chains WHERE member_id = $1', [M])).rows[0].n);
  eq('Z2 · ⭐⭐ the Insight fails → the whole act rolls back → ZERO new chain',
    [z2, after - before], ['THREW', 0]);

  /* ── Z3 · the existing public behaviour is untouched ───────────────────── */
  const z3chain = await openChain(M, { locus: await locusFor(M) });
  eq('Z3 · ⭐ openChain() still opens a chain, alone, with no editorial record',
    [typeof z3chain.id === 'string', z3chain.memberId === M,
     await counts(z3chain.id), (await readInsights(M, z3chain.id)).length],
    [true, true, 0, 0]);
  eq('Z3b · ⭐ and the chain count moved only by the acts that were meant to open one',
    Number((await query<{ n: string }>(
      'SELECT count(*) AS n FROM proposal_chains WHERE member_id = $1', [M])).rows[0].n)
      - chainsBefore, 2);

  /* ── Z4 · [SOURCE] one chain INSERT in the whole codebase ──────────────── */
  const STORE = codeOf('lib/manuscript/proposalChain/store.ts');
  const EDITORIAL = codeOf('lib/manuscript/editorialWorkspace/store.ts');
  eq('Z4 · ⭐⭐ [SOURCE] the chain adapter holds exactly ONE chain INSERT',
    (STORE.match(/INSERT INTO proposal_chains/g) ?? []).length, 1);
  eq('Z4b · ⛔ [SOURCE] and the editorial store holds NONE — it reuses the adapter',
    [(EDITORIAL.match(/INSERT INTO proposal_chains/g) ?? []).length,
     /openChainWithExecutor\(tx,/.test(EDITORIAL)], [0, true]);
  eq('Z4c · ⛔ [SOURCE] nor a second Insight INSERT',
    (EDITORIAL.match(/INSERT INTO proposal_chain_insights/g) ?? []).length, 1);
  eq('Z4d · ⛔ [SOURCE] openChain() still exists and is the public opener',
    /export async function openChain\(/.test(STORE), true);
  /* ⛔ AND THE CHRONOLOGY BAN, asserted where it would be committed: ordering
     an authored record by its own timestamp. ⭐ Asserted as the SQL clause, not
     as the word — `authored_at` is legitimately SELECTed and hydrated. */
  eq('Z4e · ⛔ [SOURCE] no editorial read orders by a timestamp',
    /ORDER BY[^`]*authored_at/.test(EDITORIAL), false);
  eq('Z4f · ⛔ [SOURCE] and no "current"/"latest" reader exists',
    /latestInsight|currentInsight|activeInsight|currentDirection|latestDirection/
      .test(EDITORIAL), false);
}

/**
 * ⭐⭐ AN UNEXPECTED THROW IS A NAMED FAILURE, NOT AN EXIT CODE.
 *
 * ⚠️ THE 01B.0 LESSON, AND IT COST THIS RUN TOO. Two W5-4 mutants
 * (`M-W5-CONVERT-INSIGHT`, `M-W5-CONVERT-DIRECTION`) manufacture a
 * `ProposalVersion` from an Insight or a Direction. That extra row then
 * collides with the one-root index when the witness lays its NEXT fixture, so
 * `main()` rejected with exit 2 and the harness reported CRASHED —
 *
 *     ⛔ a witness that cannot run has judged nothing,
 *        and CRASHED is never evidence that a mutant is dead.
 *
 * ⭐ The throw is now caught HERE and recorded as a failing obligation, so the
 * run completes, reports rc=1, and the mutant is killed for the reason it
 * should be. ⛔ And it is named honestly: everything after the throw was NOT
 * judged, which the operator must be able to see.
 */
async function main() {
  try {
    await run();
  } catch (e) {
    bad('⛔⛔ THE WITNESS COULD NOT COMPLETE — every obligation after this point'
      + ' was NOT judged', e);
  }
  return finish();
}

function finish() {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  return closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}
main().catch((e) => { console.error(e); return closePool().then(() => process.exit(2)); });
