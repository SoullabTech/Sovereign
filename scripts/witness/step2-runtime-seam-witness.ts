/**
 * STEP 2 · the authorization runtime seam — A–G and E1–E13, against a REAL
 * database.
 *
 * ⭐⭐ The governing sentence: *the member chooses the formulation, the server
 * establishes the Work state, execution consumes both and invents neither.*
 *
 * ⛔ DISPOSABLE DATABASE ONLY — refuses any `DATABASE_URL` whose database name
 * lacks `witness`.
 *
 * ⭐ E11 IS THE ONE THAT MATTERS: a REAL failure injected AFTER the transaction
 * has begun, proving both the Work and the receipt rolled back. ⛔ Not source
 * inspection.
 */
import { query, closePool } from '@/lib/db/postgres';
import { authorizeVersion, readAuthorization } from '@/lib/manuscript/revisionAuthorization/store';
import { executeAuthorization } from '@/lib/manuscript/revisionAuthorization/execute';

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

/** One Work at version `v`, one draft section holding `body`. */
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

/** A chain at the SAME target, opened against an OLDER version (40). */
async function makeChain(member: string, w: { workId: string; draftId: string; sectionId: string },
                         expected = ', fixated') {
  const c = await query<{ id: string }>(
    `INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version,
                                  target_section_id, expected_text)
     VALUES ($1,$2,$3,40,$4,$5) RETURNING id`,
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

const bodyOf = async (sectionId: string) =>
  (await query<{ text: string }>(
    `SELECT text FROM manuscript_draft_sections WHERE id=$1`, [sectionId])).rows[0].text;
const versionOf = async (draftId: string) =>
  Number((await query<{ version: string }>(
    `SELECT version FROM manuscript_working_drafts WHERE id=$1`, [draftId])).rows[0].version);

async function main() {
  await query(`INSERT INTO members (id) VALUES ($1),($2) ON CONFLICT DO NOTHING`, [M, M2]);

  console.log('── A–G · authorization creation ──────────────────────────────');

  /* ── A · the binding comes from the WORK READ, not the chain's locus. ───── */
  const w = await makeWork(M);
  const chain = await makeChain(M, w);
  const v1 = await addVersion(chain, 'maia', ', held', null);
  const v2 = await addVersion(chain, 'member', ', steady', v1);
  const v3 = await addVersion(chain, 'maia', '', v2);
  const v4 = await addVersion(chain, 'member', ', still', v3);

  const a = await authorizeVersion(M, chain, v2);
  if (!a.ok) { bad('A · authorize', a.reason); return finish(); }
  eq('A · ⭐ chain locus is v40, the Work reads v41 → the binding is v41',
    [a.authorization.guard.baseVersion, 40], [41, 40]);

  /* ── B · the SELECTED version, not the head. ───────────────────────────── */
  eq('B · ⭐⭐ v2 is authorized while v4 is the head',
    a.authorization.proposalVersionId === v2 && v2 !== v4, true);

  /* ── C · the caller supplies nothing but three ids. ────────────────────── */
  const argCount = authorizeVersion.length;
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '../../lib/manuscript/revisionAuthorization/store.ts'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const leaks = ['WorkStateReading;', 'ResolvedGuardProof;', 'ExecutionBinding;']
    .filter((t) => code.includes(`input: ${t}`) || code.includes(`, ${t}`));
  argCount === 3 && leaks.length === 0
    ? ok('C · ⭐ the act takes member + chain + version, and nothing else  [3 args]')
    : bad('C · caller cannot supply Work facts', `args=${argCount} leaks=${leaks}`);
  const stored = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM information_schema.columns
      WHERE table_name='manuscript_revision_authorizations'
        AND column_name ~ 'replacement|proposed_text|rationale'`);
  eq('C2 · ⛔ and no replacement wording is persisted', stored.rows[0].n, '0');

  /* ── D · a foreign chain is indistinguishable from an absent one. ───────── */
  const foreign = await authorizeVersion(M2, chain, v2);
  const absent = await authorizeVersion(M, await uuid(), v2);
  eq('D · foreign chain ≡ absent chain',
    [foreign.ok === false && foreign.reason, absent.ok === false && absent.reason],
    ['chain_unknown', 'chain_unknown']);

  /* ── E · expected text absent / ambiguous → NO ROW. ────────────────────── */
  const wGone = await makeWork(M, 'He was there and the river ran on.');
  const cGone = await makeChain(M, wGone);
  const vGone = await addVersion(cGone, 'maia', 'x', null);
  const rGone = await authorizeVersion(M, cGone, vGone);

  const wTwice = await makeWork(M, 'a, fixated b, fixated c');
  const cTwice = await makeChain(M, wTwice);
  const vTwice = await addVersion(cTwice, 'maia', 'x', null);
  const rTwice = await authorizeVersion(M, cTwice, vTwice);

  eq('E · absent and ambiguous each refuse',
    [rGone.ok === false && rGone.reason, rTwice.ok === false && rTwice.reason],
    ['expected_text_absent', 'expected_text_ambiguous']);
  const none = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM manuscript_revision_authorizations
      WHERE proposal_chain_id IN ($1,$2)`, [cGone, cTwice]);
  eq('E2 · ⛔ and NO authorization row was written', none.rows[0].n, '0');

  /* ── F · creating a permission changes not one byte. ───────────────────── */
  eq('F · ⭐ authorization creation changed no Work byte and no version',
    [await bodyOf(w.sectionId), await versionOf(w.draftId)], [BODY, 41]);

  /* ── G · a database failure PROPAGATES. ───────────────────────────────── */
  await query(`CREATE OR REPLACE FUNCTION witness_fault() RETURNS trigger AS $fn$
               BEGIN RAISE EXCEPTION 'witness fault' USING ERRCODE='57P01'; END; $fn$
               LANGUAGE plpgsql`);
  await query(`DROP TRIGGER IF EXISTS witness_fault_t ON manuscript_revision_authorizations`);
  let propagated: unknown = 'NOTHING THROWN'; let returned: unknown = null;
  try {
    await query(`CREATE TRIGGER witness_fault_t BEFORE INSERT
                 ON manuscript_revision_authorizations
                 FOR EACH ROW EXECUTE FUNCTION witness_fault()`);
    try { returned = await authorizeVersion(M, chain, v3); }
    catch (e) { propagated = e; }
  } finally {
    await query(`DROP TRIGGER IF EXISTS witness_fault_t ON manuscript_revision_authorizations`);
  }
  (propagated as { code?: string })?.code === '57P01'
    ? ok('G · ⭐ a database failure ESCAPES — never a domain refusal  [57P01]')
    : bad('G · DB failure propagates',
        returned ? `collapsed into ${JSON.stringify(returned)}` : String(propagated));

  console.log('\n── E1–E13 · execution ────────────────────────────────────────');

  /* ── E1 · unknown/foreign refuses BEFORE the Work is read. ─────────────── */
  const e1a = await executeAuthorization(M2, a.authorization.id);
  const e1b = await executeAuthorization(M, await uuid());
  eq('E1 · foreign ≡ unknown, and both refuse',
    [e1a.outcome === 'refused' && e1a.reason, e1b.outcome === 'refused' && e1b.reason],
    ['authorization_unknown', 'authorization_unknown']);
  eq('E1b · ⛔ and the Work was not touched',
    [await bodyOf(w.sectionId), await versionOf(w.draftId)], [BODY, 41]);

  /* ── E4 · stale base refuses, and the permission stays unspent. ────────── */
  await query(`UPDATE manuscript_working_drafts SET version=99 WHERE id=$1`, [w.draftId]);
  const e4 = await executeAuthorization(M, a.authorization.id);
  const afterE4 = await readAuthorization(M, a.authorization.id);
  eq('E4 · stale base refuses, authorization UNSPENT',
    [e4.outcome === 'refused' && e4.reason, afterE4!.acceptedAt], ['stale_base', null]);
  await query(`UPDATE manuscript_working_drafts SET version=41 WHERE id=$1`, [w.draftId]);

  /* ── E5 · E6 · the text gone / ambiguous, at an UNCHANGED version. ─────── */
  await query(`UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1`,
    [w.sectionId, 'He was there and the river ran on.']);
  const e5 = await executeAuthorization(M, a.authorization.id);
  await query(`UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1`,
    [w.sectionId, 'a, fixated b, fixated c']);
  const e6 = await executeAuthorization(M, a.authorization.id);
  await query(`UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1`, [w.sectionId, BODY]);
  const afterE6 = await readAuthorization(M, a.authorization.id);
  eq('E5 · E6 · ⭐ the version alone never authorizes — gone and ambiguous both refuse',
    [e5.outcome === 'refused' && e5.reason, e6.outcome === 'refused' && e6.reason,
      afterE6!.acceptedAt],
    ['expected_text_absent', 'expected_text_ambiguous', null]);

  /* ── E11 · ⭐⭐ A REAL FAILURE AFTER THE TRANSACTION BEGAN. ─────────────── */
  await query(`CREATE OR REPLACE FUNCTION witness_write_fault() RETURNS trigger AS $fn$
               BEGIN RAISE EXCEPTION 'witness write fault' USING ERRCODE='57P01'; END; $fn$
               LANGUAGE plpgsql`);
  await query(`DROP TRIGGER IF EXISTS witness_write_fault_t ON manuscript_draft_sections`);
  let e11err: unknown = 'NOTHING THROWN'; let e11ret: unknown = null;
  try {
    await query(`CREATE TRIGGER witness_write_fault_t BEFORE UPDATE
                 ON manuscript_draft_sections FOR EACH ROW
                 EXECUTE FUNCTION witness_write_fault()`);
    try { e11ret = await executeAuthorization(M, a.authorization.id); }
    catch (e) { e11err = e; }
  } finally {
    await query(`DROP TRIGGER IF EXISTS witness_write_fault_t ON manuscript_draft_sections`);
  }
  const afterE11 = await readAuthorization(M, a.authorization.id);
  const thrown = (e11err as { code?: string })?.code === '57P01';
  const refusedNotThrown = !thrown && e11ret !== null;
  if ((thrown || refusedNotThrown) && afterE11!.acceptedAt === null
      && await bodyOf(w.sectionId) === BODY && await versionOf(w.draftId) === 41) {
    ok(`E11 · ⭐⭐ a failed write leaves the Work WHOLE and the permission UNSPENT  [${
      thrown ? 'propagated 57P01' : 'refused'}]`);
  } else {
    bad('E11 · failed write rolls back both sides',
      `thrown=${thrown} receipt=${afterE11!.acceptedAt} body=${
        (await bodyOf(w.sectionId)).slice(0, 20)} version=${await versionOf(w.draftId)}`);
  }
  eq('E11b · ⛔ and a failure was NOT collapsed into a tidy domain refusal',
    refusedNotThrown && (e11ret as { reason?: string })?.reason === 'write_refused'
      ? 'COLLAPSED' : 'propagated-or-refused-truthfully',
    'propagated-or-refused-truthfully');

  /* ── E2 · E3 · E7 · E8 · E12 · the lawful execution. ───────────────────── */
  const done = await executeAuthorization(M, a.authorization.id);
  const body = await bodyOf(w.sectionId);
  eq('E2 · ⭐ the wording came from the SELECTED version (v2), not the head (v4)',
    [body.includes(', steady'), body.includes(', still')], [true, false]);
  eq('E7 · ⭐ exactly the requested change, and nothing else',
    body, BODY.replace(', fixated', ', steady'));
  eq('E8 · exactly one version advance', await versionOf(w.draftId), 42);
  eq('E12 · the receipt was written, whole, after the mutation',
    done.outcome === 'executed'
      ? [done.authorization.resultingVersion, done.authorization.acceptedAt !== null]
      : done, [42, true]);

  /* ── E9 · a second execution refuses. ──────────────────────────────────── */
  const again = await executeAuthorization(M, a.authorization.id);
  eq('E9 · ⭐ a second execution refuses, and the Work does not move again',
    [again.outcome === 'refused' && again.reason, await versionOf(w.draftId)],
    ['already_spent', 42]);

  /* ── E3 · E10 · E13 · structural, over the seam's own source. ──────────── */
  const ex = require('fs').readFileSync(
    require('path').join(__dirname, '../../lib/manuscript/revisionAuthorization/execute.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  eq('E3 · ⛔ no head/latest/current lookup anywhere in the execution seam',
    /ORDER BY|LIMIT 1|headOf|latest|current/i.test(ex), false);
  eq('E10 · ⭐⭐ one TransactionClient — the transaction-aware seam, never the public wrapper',
    [ex.includes('saveSectionInTransaction'), /\bsaveSection\s*\(/.test(ex)], [true, false]);
  eq('E13 · ⛔ no second manuscript UPDATE path',
    /UPDATE\s+manuscript_draft_sections|UPDATE\s+manuscript_working_drafts/i.test(ex), false);

  finish();
}

function finish(): void {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  void closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}
main().catch((e) => { console.error(e); void closePool().then(() => process.exit(1)); });
