/**
 * STEP 2 · INTEGRATION — the ten `INTEGRATION REQUIRED` obligations.
 *
 * ⭐⭐ THE GOVERNING RULE:
 *
 *     Discussing a proposal and determining whether an authorization can
 *     execute are TWO DIFFERENT READS. Neither may be defined in terms of the
 *     other.
 *
 * ⛔ DISPOSABLE DATABASE ONLY.
 */
import { query, closePool } from '@/lib/db/postgres';
import { authorizeVersion } from '@/lib/manuscript/revisionAuthorization/store';
import { executeAuthorization } from '@/lib/manuscript/revisionAuthorization/execute';
import { readAuthorizationStatus } from '@/lib/manuscript/revisionAuthorization/status';
import { readProposalWork } from '@/lib/manuscript/proposalChain/proposalWork';
import { transaction as transactionRaw } from '@/lib/db/postgres';

/** ⛔ Comments stripped BEFORE any source scan — the C21 class: a prose ban that
 *  matches the comment documenting it. */
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
async function makeChain(member: string, w: { workId: string; draftId: string; sectionId: string }) {
  const c = await query<{ id: string }>(
    `INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version,
                                  target_section_id, expected_text)
     VALUES ($1,$2,$3,41,$4,', fixated') RETURNING id`,
    [member, w.workId, w.draftId, w.sectionId]);
  return c.rows[0].id;
}
async function addVersion(chainId: string, author: 'maia' | 'member',
                          text: string, supersedes: string | null) {
  const r = await query<{ id: string }>(
    `INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)
     VALUES ($1,$2,$3,$4) RETURNING id`, [chainId, author, text, supersedes]);
  return r.rows[0].id;
}

async function main() {
  await query(`INSERT INTO members (id) VALUES ($1),($2) ON CONFLICT DO NOTHING`, [M, M2]);
  console.log('── STEP 2 · integration ──────────────────────────────────────');

  const w = await makeWork(M);
  const chain = await makeChain(M, w);
  const v1 = await addVersion(chain, 'maia', ', held', null);
  const v2 = await addVersion(chain, 'member', ', steady', v1);
  const v3 = await addVersion(chain, 'maia', ', quieter', v2);

  /* ── I-1 · R6 · proposal work exists with NO authorization at all. ─────── */
  const w1 = await readProposalWork(M, chain);
  eq('I-1 · ⭐ proposal work reads with NO authorization in existence',
    w1.ok ? [w1.work.versions.map((v) => v.replacementText), w1.work.focused?.id === v3]
      : w1, [[', held', ', steady', ', quieter'], true]);

  /* ── I-2 · ⛔ and it carries NO executability field, in any spelling. ──── */
  const flat = JSON.stringify(w1).toLowerCase();
  eq('I-2 · ⛔ the proposal-work read carries no authority/executability vocabulary',
    ['inspection', 'executionauthority', 'mayaccept', 'executable', 'authorizationenabled']
      .filter((t) => flat.includes(t)), []);

  /* ── I-3 · ⭐⭐ THE DISCRIMINATOR: the Work moves, the conversation lives. */
  const a = await authorizeVersion(M, chain, v2);
  if (!a.ok) { bad('I-3 · authorize', a.reason); return finish(); }
  await query(`UPDATE manuscript_working_drafts SET version=99 WHERE id=$1`, [w.draftId]);
  const stale = await readAuthorizationStatus(M, a.authorization.id);
  const stillWorking = await readProposalWork(M, chain);
  eq('I-3 · ⭐⭐ authorization NO LONGER FITS while proposal work is UNCHANGED',
    [stale?.state, (stale as { reason?: string })?.reason,
      stillWorking.ok && stillWorking.work.versions.length],
    ['no_longer_fits', 'stale_base', 3]);
  await query(`UPDATE manuscript_working_drafts SET version=41 WHERE id=$1`, [w.draftId]);

  /* ── I-4 · the expected text going gone is likewise not the end of talk. ── */
  await query(`UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1`,
    [w.sectionId, 'He was there and the river ran on.']);
  const gone = await readAuthorizationStatus(M, a.authorization.id);
  const talkGone = await readProposalWork(M, chain);
  eq('I-4 · the text gone → not executable, still discussable',
    [gone?.state, (gone as { reason?: string })?.reason, talkGone.ok],
    ['no_longer_fits', 'expected_text_absent', true]);
  await query(`UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1`, [w.sectionId, BODY]);

  /* ── I-5 · CS-3 · status and execution agree, because they share the law. */
  const fits = await readAuthorizationStatus(M, a.authorization.id);
  eq('I-5 · ⭐ status says executable', fits?.state, 'executable');
  const done = await executeAuthorization(M, a.authorization.id);
  eq('I-5b · ⭐⭐ and execution AGREES — the surface cannot advertise what the boundary refuses',
    done.outcome, 'executed');

  /* ── I-6 · CS-6 · a spent authorization reports spent, and the proposal
     remains readable — a finished permission is not a finished conversation. */
  const spent = await readAuthorizationStatus(M, a.authorization.id);
  const afterSpend = await readProposalWork(M, chain);
  eq('I-6 · spent is reported as spent, and proposal work survives it',
    [spent?.state, (spent as { resultingVersion?: number })?.resultingVersion,
      afterSpend.ok && afterSpend.work.versions.length],
    ['spent', 42, 3]);

  /* ── I-7 · CS-9 · unknown ≡ another member's, in BOTH read models. ─────── */
  const foreignWork = await readProposalWork(M2, chain);
  const absentWork = await readProposalWork(M, await uuid());
  const foreignAuth = await readAuthorizationStatus(M2, a.authorization.id);
  const absentAuth = await readAuthorizationStatus(M, await uuid());
  eq('I-7 · unknown ≡ foreign, in both reads',
    [foreignWork.ok === false && foreignWork.reason,
      absentWork.ok === false && absentWork.reason, foreignAuth, absentAuth],
    ['chain_unknown', 'chain_unknown', null, null]);

  /* ── I-8 · CS-5 · ⛔ NOTHING COMPUTES AN ALTERNATIVE — ASSERTED BEHAVIOURALLY.
     ⚠️ THE FIRST DRAFT BANNED A MECHANISM AND CAUGHT A LEGITIMATE USE. It
     scanned for `replace(|indexOf(|slice(` and went red the moment the status
     read gained a LOCATOR — which uses `indexOf` to find where the exact
     expected text already is, having first established it occurs exactly once.
     ⛔ Locating is not relocating. A ban on an API is not a statement about
     behaviour, and this programme has been caught by that shape before.

     ⭐ So the law is asserted on what the read DOES: when the exact characters
     are absent or ambiguous, it must produce NO locator and NO alternative —
     never a nearest match, never a widened span. */
  const wA = await makeWork(M, 'He was there and the river ran on.');
  const cA = await makeChain(M, wA);
  const vA = await addVersion(cA, 'maia', 'x', null);
  /* The Work no longer holds the expected text, so no authorization can even be
     created — the absence is refused at the earlier boundary too. */
  const noAuth = await authorizeVersion(M, cA, vA);
  eq('I-8 · ⭐ text absent → no authorization, and therefore no locator to widen',
    noAuth.ok === false ? noAuth.reason : 'AUTHORIZED', 'expected_text_absent');

  /* And an authorization whose Work LATER becomes ambiguous reports the
     ambiguity and offers no locator — ⛔ never "the first one". */
  const wB = await makeWork(M); const cB = await makeChain(M, wB);
  const vB = await addVersion(cB, 'maia', ', firmer', null);
  const aB = await authorizeVersion(M, cB, vB);
  await query(`UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1`,
    [wB.sectionId, 'a, fixated b, fixated c']);
  await query(`UPDATE manuscript_working_drafts SET version=41 WHERE id=$1`, [wB.draftId]);
  const ambiguous = await readAuthorizationStatus(M, aB.ok ? aB.authorization.id : '');
  eq('I-8b · ⭐⭐ ambiguous → reported as ambiguous, with NO locator offered',
    [ambiguous?.state, (ambiguous as { reason?: string })?.reason,
      'locator' in (ambiguous ?? {})],
    ['no_longer_fits', 'expected_text_ambiguous', false]);

  /* ⛔ The narrow source ban that remains is about REGENERATION, not location. */
  const readModels = ['lib/manuscript/proposalChain/proposalWork.ts',
    'lib/manuscript/revisionAuthorization/status.ts',
    'lib/manuscript/revisionAuthorization/executionFit.ts'].map(codeOf);
  eq('I-8c · ⛔ and no read model fuzzy-matches, approximates or regenerates',
    readModels.filter((c) => /fuzzy|nearest|approximate|similar|bestMatch/i.test(c)).length, 0);

  /* ── I-9 · F1-4 · WHERE THE NO-PROSE LAW APPLIES, AND WHERE IT DOES NOT.
     ⚠️ THE FIRST DRAFT ASSERTED THIS OVER THE READ MODEL AND FAILED — correctly.
     `readAuthorizationStatus` returns the whole authorization, and its binding
     contains `expectedText`, which IS manuscript prose. ⭐ That is not a defect:
     the binding is the law the execution seam consumes, and a server-side
     caller needs it.

     ⛔ F1-4 binds at the TRANSPORT. The consent channel names a place and
     carries no prose, because the member reads their Work from the Work. So the
     assertion moves to the route payload.

     ⚠️ SOURCE-LEVEL, and labelled as such: the witness issues no HTTP. What it
     proves is that the handler does not emit the binding — not that a running
     server withheld it. */
  const statusRouteSrc = require('fs').readFileSync(require('path').join(
    __dirname, '../../app/api/writers-studio/revision-authorizations/[authorizationId]/route.ts'),
    'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const payload = statusRouteSrc.slice(statusRouteSrc.indexOf('NextResponse.json({'));
  eq('I-9 · ⚠️ SOURCE-LEVEL — the status PAYLOAD emits no binding and no prose',
    [/guard/.test(payload), /expectedText/.test(payload), /replacementText/.test(payload)],
    [false, false, false]);
  eq('I-9b · ⭐ and the read MODEL does carry the binding, deliberately — it is the law execution consumes',
    (spent as { authorization?: { guard?: { expectedText?: string } } })
      ?.authorization?.guard?.expectedText, ', fixated');

  /* ── I-9A · ⛔ THE AUTHORIZE TRANSPORT CARRIES NO BINDING AT ALL.
     ⚠️ The first cut returned `binding: r.authorization.guard` under a comment
     saying "no wording is echoed" — and `guard.expectedText` IS prose. The
     comment and the payload said opposite things, and the payload ships. */
  const authPayload = codeOf(
    'app/api/writers-studio/proposal-chains/[chainId]/versions/[versionId]/authorize/route.ts');
  const authBody = authPayload.slice(authPayload.indexOf('NextResponse.json({\n    authorized: true'));
  eq('I-9A · ⚠️ SOURCE-LEVEL — the authorize payload emits no binding and no prose',
    ['binding', 'guard', 'expectedText', 'replacementText'].filter((t) => authBody.includes(t)),
    []);

  /* ── I-9B · ⭐⭐ AND THE CONSENT TRANSPORT NAMES AN EXACT PLACE.
     F1-4 is BOTH halves: coordinates and a label, not one manuscript character.
     The range is SERVER-DERIVED — the browser never searches the Work. */
  const wL = await makeWork(M); const cL = await makeChain(M, wL);
  const vL = await addVersion(cL, 'maia', ', calmer', null);
  const aL = await authorizeVersion(M, cL, vL);
  if (!aL.ok) { bad('I-9B · authorize', aL.reason); return finish(); }
  const st = await readAuthorizationStatus(M, aL.authorization.id);
  const loc = (st as { locator?: Record<string, unknown> })?.locator;
  /* BODY = 'He was there, fixated, …' — ', fixated' begins at code point 12. */
  eq('I-9B · ⭐ executable names section · label · projected-body code-point range',
    [st?.state, loc?.sectionId === wL.sectionId, loc?.range, loc?.operation, loc?.changeCount],
    ['executable', true,
      { space: 'projected_section_body', start: 12, end: 21 },
      'replace_exact_text', 1]);
  eq('I-9B2 · ⛔ and the locator carries not one character of the Work',
    ['fixated', 'river', 'calmer', 'expectedText', 'replacementText']
      .filter((t) => JSON.stringify(loc).includes(t)), []);

  /* ── I-STORE-ONE · ⭐ ONE ADAPTER FOR THE STEP-1 OBJECTS.
     ⛔ Not because SQL is forbidden in a read model, but because these two
     objects already have one reviewed adapter, and a later hydration correction
     must not land on one read path and not the other. */
  const pwCode = codeOf('lib/manuscript/proposalChain/proposalWork.ts');
  eq('I-STORE-ONE · ⭐ proposalWork consumes readChain and hydrates no rows itself',
    [/FROM proposal_chains|FROM proposal_versions/.test(pwCode), pwCode.includes('readChain(')],
    [false, true]);

  /* ── I-STATUS-RACE · ⭐⭐ STATUS NEVER EVALUATES A COLLAGE.
     ⚠️ EVIDENCE CLASS, STATED EXACTLY: a SCHEDULING RENDEZVOUS, not a
     deterministic one — the witness waits a fixed 250ms for the status read to
     reach the draft lock. ⛔ No test hook is added to production to make it
     prettier.

     The witness holds the draft row, starts the status read (which blocks on
     its own FOR SHARE), then moves the Work to v99 AND rewrites the section so
     the expected text is gone, and commits. A coherent read sees ONE of those
     states. A collage could report `executable` from the old version with the
     new body, or `stale_base` computed against a body it never saw. */
  const wR = await makeWork(M); const cR = await makeChain(M, wR);
  const vR = await addVersion(cR, 'maia', ', slower', null);
  const aR = await authorizeVersion(M, cR, vR);
  if (!aR.ok) { bad('I-STATUS-RACE · authorize', aR.reason); return finish(); }
  let racePromise!: Promise<Awaited<ReturnType<typeof readAuthorizationStatus>>>;
  await transactionRaw(async (tx) => {
    await tx.query('SELECT id FROM manuscript_working_drafts WHERE id=$1 FOR UPDATE',
      [wR.draftId]);
    racePromise = readAuthorizationStatus(M, aR.authorization!.id);
    await new Promise((r) => setTimeout(r, 250));
    await tx.query('UPDATE manuscript_working_drafts SET version=99 WHERE id=$1', [wR.draftId]);
    await tx.query('UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1',
      [wR.sectionId, 'He was there and the river ran on.']);
  });
  const raced = await racePromise;
  /* ⭐ The competing write commits first, so the coherent read observes v99 AND
     the new body — one state. `stale_base` is checked before the text, so that
     is the truthful answer. ⛔ `executable` would mean it read the old version
     with the new body, or the new version with the old one. */
  eq('I-STATUS-RACE · ⭐⭐ a competing write cannot interleave — one observed state, not a collage',
    [raced?.state, (raced as { reason?: string })?.reason], ['no_longer_fits', 'stale_base']);

  /* ── I-10 · ⛔ THE RETIRED VOCABULARY HAS NO SUCCESSOR, IN ANY SPELLING. ── */
  const newSurface = [
    'lib/manuscript/proposalChain/proposalWork.ts',
    'lib/manuscript/revisionAuthorization/status.ts',
    'lib/manuscript/revisionAuthorization/executionFit.ts',
    'lib/manuscript/revisionAuthorization/store.ts',
    'lib/manuscript/revisionAuthorization/execute.ts',
    'app/api/writers-studio/proposal-chains/[chainId]/route.ts',
    'app/api/writers-studio/proposal-chains/[chainId]/versions/[versionId]/authorize/route.ts',
    'app/api/writers-studio/revision-authorizations/[authorizationId]/route.ts',
    'app/api/writers-studio/revision-authorizations/[authorizationId]/execute/route.ts',
  ].map((f) => require('fs').readFileSync(
    require('path').join(__dirname, '../..', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
  const banned = ['inspection_only', 'member_acceptance', 'execution_authority',
    'executionAuthority', 'mayCrossIntoTheWork', 'isInspectionOnly',
    'authorizationEnabled', 'authorizationState'];
  const found = banned.filter((b) => newSurface.some((s) => s.includes(b)));
  eq('I-10 · ⛔ no retired authority vocabulary survives under any spelling', found, []);

  /* ── I-11 · the route identities cannot be confused for one another. ───── */
  const paths = require('fs').readdirSync(
    require('path').join(__dirname, '../../app/api/writers-studio')).sort();
  eq('I-11 · ⭐ the acts have separate route identities',
    paths.includes('proposal-chains') && paths.includes('revision-authorizations'), true);

  finish();
}
function finish(): void {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  void closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}
main().catch((e) => { console.error(e); void closePool().then(() => process.exit(1)); });
