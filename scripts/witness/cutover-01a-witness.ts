/**
 * CUTOVER-01A — the read/mount cutover, C1…C10.
 *
 * ⭐⭐ THE CUTOVER LAW:
 *   A proposal may lose its exact place in the current Work
 *   without losing its place in the conversation.
 *
 * ⛔ DISPOSABLE DATABASE ONLY.
 *
 * ── EVIDENCE CLASSES, NAMED (the lane's standing rule) ─────────────────────
 *
 *  BEHAVIOURAL  C1…C9 — real rows, the real `resolveDraftWriteState` the route
 *               itself calls, and the real projection. These prove STATES.
 *
 *  SOURCE-LEVEL C10 and the mount rule. ⚠️ The route cannot be driven from a
 *               witness: `getMemberIdFromRequest` refuses a bare `x-member-id`
 *               without a verified session — correctly, and ⛔ it is not
 *               weakened and no test hook is added to production to make this
 *               easier. So the route's own two lines are read, with comments
 *               stripped (the C21 class), and are labelled SOURCE-LEVEL rather
 *               than dressed up as behaviour.
 */
import { query, closePool } from '@/lib/db/postgres';
import { resolveDraftWriteState } from '@/lib/manuscript/sections/saveSection';
import { readProposalWorkTarget } from '@/lib/manuscript/proposalChain/proposalWorkTarget';
import { authorizeVersion } from '@/lib/manuscript/revisionAuthorization/store';
import { executeAuthorization } from '@/lib/manuscript/revisionAuthorization/execute';

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
const BODY = 'He was there, fixated, and the river ran on without him.';

async function makeWork(member: string, body = BODY, v = 41) {
  const workId = await uuid(); const draftId = await uuid(); const sectionId = await uuid();
  await query(`INSERT INTO member_manuscripts (id) VALUES ($1)`, [workId]);
  await query(`INSERT INTO manuscript_working_drafts
                 (id, manuscript_id, member_id, version, section_addressable_at)
               VALUES ($1,$2,$3,$4, now())`, [draftId, workId, member, v]);
  await query(`INSERT INTO manuscript_draft_sections (id, draft_id, text)
               VALUES ($1,$2,$3)`, [sectionId, draftId, body]);
  return { workId, draftId, sectionId };
}
async function makeChain(member: string, w: { workId: string; draftId: string; sectionId: string },
                         expected = ', fixated') {
  const c = await query<{ id: string }>(
    `INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version,
                                  target_section_id, expected_text)
     VALUES ($1,$2,$3,41,$4,$5) RETURNING id`,
    [member, w.workId, w.draftId, w.sectionId, expected]);
  return c.rows[0].id;
}
async function addVersion(chainId: string, author: 'maia' | 'member',
                          text: string, supersedes: string | null) {
  const r = await query<{ id: string }>(
    `INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)
     VALUES ($1,$2,$3,$4) RETURNING id`, [chainId, author, text, supersedes]);
  return r.rows[0].id;
}

/** The Work state the ROUTE itself resolves, handed to the projection as the
 *  route hands it — ⛔ never a second read that could disagree. */
async function sectionsOf(workId: string, member: string) {
  const st = await resolveDraftWriteState(workId, member);
  if (st.kind !== 'section_aware') throw new Error(`write state is ${st.kind}`);
  return st.sections;
}

async function main() {
  await query(`INSERT INTO members (id) VALUES ($1),($2) ON CONFLICT DO NOTHING`, [M, M2]);
  console.log('── CUTOVER-01A · read/mount ──────────────────────────────────');

  const w = await makeWork(M);
  const chain = await makeChain(M, w);
  const v1 = await addVersion(chain, 'maia', ', held', null);
  const v2 = await addVersion(chain, 'member', ', steady', v1);
  const v3 = await addVersion(chain, 'maia', ', quieter', v2);
  const S = () => sectionsOf(w.workId, M);

  /* ── C1 · chain + version · NO authorization anywhere ──────────────────── */
  const c1 = await readProposalWorkTarget(M, w.workId, chain, v2, await S());
  eq('C1 · ⭐ proposal work mounts with NO authorization in existence',
    c1.ok ? [c1.target.chainId === chain, c1.target.versionId === v2,
      c1.target.location.located] : c1, [true, true, true]);

  /* ⛔ and it carries no executability vocabulary, in any spelling. */
  eq('C1b · ⛔ the target carries no authority/executability vocabulary',
    ['inspection', 'executionauthority', 'mayaccept', 'executable', 'authorizationenabled']
      .filter((t) => JSON.stringify(c1).toLowerCase().includes(t)), []);

  /* ── C2 · authorization STALE → proposal work still mounts ─────────────── */
  const a = await authorizeVersion(M, chain, v2);
  if (!a.ok) { bad('C2 · authorize', a.reason); return finish(); }
  await query(`UPDATE manuscript_working_drafts SET version=99 WHERE id=$1`, [w.draftId]);
  const c2 = await readProposalWorkTarget(M, w.workId, chain, v2, await S());
  eq('C2 · ⭐ authorization STALE → proposal work STILL mounts, still located',
    c2.ok ? [true, c2.target.location.located] : c2, [true, true]);
  await query(`UPDATE manuscript_working_drafts SET version=41 WHERE id=$1`, [w.draftId]);

  /* ── C3 · authorization SPENT → proposal work still mounts ─────────────── */
  const ex = await executeAuthorization(M, a.authorization.id);
  if (ex.outcome !== 'executed') { bad('C3 · execute', ex.reason); return finish(); }
  const spentRow = await query<{ accepted_at: string | null }>(
    `SELECT accepted_at FROM manuscript_revision_authorizations WHERE id=$1`,
    [a.authorization.id]);
  const c3 = await readProposalWorkTarget(M, w.workId, chain, v2, await S());
  eq('C3 · ⭐ authorization SPENT → proposal work STILL mounts',
    [spentRow.rows[0]?.accepted_at !== null, c3.ok], [true, true]);
  /* ⭐ And note WHAT the spend did: the wording it applied is now IN the Work,
     so the chain's `expected_text` is gone — which is C4, arrived at honestly
     rather than staged. */
  eq('C4 · ⭐⭐ expected text ABSENT → mounts, location unavailable, NO mark',
    c3.ok ? [true, c3.target.location.located,
      (c3.target.location as { reason?: string }).reason]
      : c3, [true, false, 'expected_text_absent']);

  /* ── C5 · AMBIGUOUS → same: conversation survives, no guessed range ────── */
  const wa = await makeWork(M, 'a, fixated, b, fixated, c');
  const ca = await makeChain(M, wa);
  const va = await addVersion(ca, 'maia', ', steady', null);
  const c5 = await readProposalWorkTarget(M, wa.workId, ca, va, await sectionsOf(wa.workId, M));
  eq('C5 · ⭐ expected text AMBIGUOUS → mounts, NO guessed range',
    c5.ok ? [true, c5.target.location.located,
      (c5.target.location as { reason?: string }).reason]
      : c5, [true, false, 'expected_text_ambiguous']);

  /* ── C6 · exactly once → the exact locus, in the projected body ────────── */
  const wb = await makeWork(M);
  const cb = await makeChain(M, wb);
  const vb = await addVersion(cb, 'maia', ', steady', null);
  const secs = await sectionsOf(wb.workId, M);
  const c6 = await readProposalWorkTarget(M, wb.workId, cb, vb, secs);
  const loc = c6.ok && c6.target.location.located ? c6.target.location.range : null;
  eq('C6 · ⭐⭐ occurs ONCE → projected_section_body, at THAT exact locus',
    loc ? [loc.space, [...secs[0].body].slice(loc.start, loc.end).join('')] : c6,
    ['projected_section_body', ', fixated']);

  /* ── C7 · focused v2 while v3 is head → v2's wording, never the head's ─── */
  const c7 = await readProposalWorkTarget(M, w.workId, chain, v2, await S());
  const c7h = await readProposalWorkTarget(M, w.workId, chain, v3, await S());
  eq('C7 · ⭐⭐ the FOCUSED version renders, never silently the head',
    [c7.ok && c7.target.replacementText, c7.ok && c7.target.versionId === v2,
      c7h.ok && c7h.target.replacementText],
    [', steady', true, ', quieter']);

  /* ── C8 · foreign chain ≡ missing chain, no leak ───────────────────────── */
  const wf = await makeWork(M2); const cf = await makeChain(M2, wf);
  const vf = await addVersion(cf, 'maia', ', steady', null);
  const foreign = await readProposalWorkTarget(M, w.workId, cf, vf, await S());
  const missing = await readProposalWorkTarget(
    M, w.workId, '00000000-0000-0000-0000-000000000000', vf, await S());
  eq('C8 · ⛔ foreign chain ≡ missing chain — indistinguishable, nothing leaks',
    [foreign, missing], [{ ok: false, reason: 'chain_unknown' },
      { ok: false, reason: 'chain_unknown' }]);

  /* ── C9 · version foreign to the chain REFUSES, never re-focuses ───────── */
  const c9 = await readProposalWorkTarget(M, w.workId, chain, vb, await S());
  eq('C9 · ⛔ a version foreign to the chain REFUSES; no other version is focused',
    c9, { ok: false, reason: 'version_unknown' });

  /* ══ C11 · ⭐⭐ SAME MEMBER · WRONG WORK ═════════════════════════════════
     The second cutover law: a proposal may lose its place in the Work without
     losing its place in the conversation, but it may NOT migrate into a
     DIFFERENT Work merely because both belong to the same writer.

     ⚠️ `cb` is a real chain of THIS member, against manuscript `wb`. Asked for
     while the room displays manuscript `w`, it must refuse — and refuse
     BEFORE any target exists, so `wb`'s wording is never even assembled. */
  const c11 = await readProposalWorkTarget(M, w.workId, cb, vb, await S());
  eq('C11 · ⭐⭐ a valid own-chain from ANOTHER Work refuses — no target at all',
    c11, { ok: false, reason: 'wrong_work' });
  /* ⛔ And the room is told nothing that distinguishes it from any other
     unresolvable selector: the route collapses every refusal to the ordinary
     section state. A refusal is not an occasion to disclose. */
  eq('C11b · ⛔ nothing from the other Work is transported',
    JSON.stringify(c11).includes(', steady') || JSON.stringify(c11).includes(wb.sectionId),
    false);

  /* ══ C10 · SOURCE-LEVEL ═══════════════════════════════════════════════════
     ⚠️ Labelled, not disguised. The route needs a verified session and neither
     it nor the auth boundary is weakened to make this behavioural. */
  const ROUTE = codeOf('app/api/sovereign/manuscripts/[id]/write-state/route.ts');
  const PROJ = codeOf('lib/manuscript/proposalChain/proposalWorkTarget.ts');
  const WORK = codeOf('lib/manuscript/proposalChain/proposalWork.ts');
  eq('C10 · [SOURCE] no authorization table is read in the mount path',
    [ROUTE, PROJ, WORK].filter((c) => /manuscript_revision_authorizations/.test(c)).length, 0);
  eq('C10b · [SOURCE] readAuthorizationStatus is not reached from the mount path',
    [ROUTE, PROJ, WORK].filter((c) => /readAuthorizationStatus/.test(c)).length, 0);

  /* ══ M-R6 · THE ONE WE CARE ABOUT ════════════════════════════════════════
     *Make location failure return ordinary section mode* → this MUST go red.

     ⚠️ MY FIRST WRITING OF THIS CHECK WAS WRONG AND IS RECORDED, NOT REPAIRED
     AWAY. It banned the MECHANISM — any mention of `location.located` before
     `authorityOf` — and so it failed against the correct implementation, whose
     SUSPENSION decision legitimately reads that field. Banning a mechanism to
     forbid a behaviour is the same mistake this programme already paid for at
     I-8: *locating is not relocating*, and here *suspending is not mounting*.

     Re-asserted as the behaviour: the TARGET ASSIGNMENT — the thing `mode` is
     computed from — may not consult locatability. What happens afterwards is a
     different decision with its own name. */
  /* ⚠️ AND IT WENT STALE ONCE, SILENTLY — W5-Z0, 2026-09-14. The anchor was
     `const focus =`; W5-Z0 renamed that binding to `const requested =`, so
     `indexOf` returned -1, `slice(-1, …)` produced an empty string, and the
     regex could not fail. ⛔ A source pin whose ANCHOR can disappear is a pin
     that reports PASS for a file it never read. The anchors are now asserted to
     EXIST before the slice is judged — the vacuity is caught, not inherited. */
  const from = ROUTE.indexOf('const requested =');
  const to = ROUTE.indexOf('const suspendsAt');
  eq('M-R6a · [SOURCE] the resolution block is actually locatable (anti-vacuity)',
    from >= 0 && to > from, true);
  const resolution = from >= 0 && to > from ? ROUTE.slice(from, to) : '\u0000SENTINEL location located';
  eq('M-R6 · [SOURCE] the TARGET is assigned from the READ alone, never from location',
    /located|location/.test(resolution), false);
  eq('M-R6b · [SOURCE] and `mode` is computed from the target, not from a range',
    /mode:\s*target\s*\?/.test(ROUTE), true);

  /* ⭐ The BEHAVIOURAL half of M-R6, and the stronger one: the projection
     itself must never turn an unavailable location into a refusal. A mutant
     that does takes C4 and C5 down with it — no source pattern required. */
  eq('M-R6c · ⭐ [BEHAVIOURAL] an unavailable location still returns ok:true',
    [c3.ok, c5.ok], [true, true]);

  return finish();
}

function finish() {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  return closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}
main().catch((e) => { console.error(e); return closePool().then(() => process.exit(2)); });
