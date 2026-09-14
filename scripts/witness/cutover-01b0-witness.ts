/**
 * CUTOVER-01B.0 — the duplicate-unspent permission law, D1…D6.
 *
 * ⭐⭐ THE LAW (founder, 2026-09-14):
 *
 *     For one member, one exact proposal version, and one current bound Work
 *     version, there is at most one unspent authorization. Repeating that
 *     authorizing act returns that same durable permission. A later Work
 *     version may earn a new authorization.
 *
 * ⛔ NOT "one authorization per proposal version" — an advanced Work
 * legitimately supports a new binding, and forbidding that would make an
 * advanced Work unauthorizable forever.
 *
 *     Retrying a permission request must recover the same permission,
 *     not create another one.
 *
 * ⛔ DISPOSABLE DATABASE ONLY.
 */
import { query, closePool, pool } from '@/lib/db/postgres';
import { authorizeVersion } from '@/lib/manuscript/revisionAuthorization/store';

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

/**
 * ⭐⭐ A THROW IS A NAMED RESULT, NEVER A DEAD RUN.
 *
 * ⚠️ FIRST WRITING OF THIS WITNESS CRASHED ON TWO MUTANTS INSTEAD OF JUDGING
 * THEM. With the existing-unspent lookup removed, the second act meets the
 * unique index and `authorizeVersion` throws (correctly — it has no blanket
 * catch), so `main()` died with exit 2 and the harness could only say CRASHED.
 * A witness that cannot run has judged nothing, and "crashed" must never be
 * read as "killed".
 *
 * ⭐ So a throw is captured as a first-class outcome here. That is not leniency:
 * it is precisely the founder's obligation — *zero opaque unique-violation
 * escape* — made observable. A caller that was owed a permission and met a
 * 23505 is a FAILURE with a name, not an absent result.
 */
type Attempt =
  | Awaited<ReturnType<typeof authorizeVersion>>
  | { readonly ok: false; readonly reason: string };
const attempt = async (c: string, v: string): Promise<Attempt> => {
  try { return await authorizeVersion(M, c, v); }
  catch (e) { return { ok: false, reason: `THREW ${(e as { code?: string }).code ?? 'ERROR'}` }; }
};

const M = '11111111-1111-1111-1111-111111111111';
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
const unspentCount = async (chain: string, version: string) =>
  Number((await query<{ n: string }>(
    `SELECT count(*) AS n FROM manuscript_revision_authorizations
      WHERE proposal_chain_id=$1 AND proposal_version_id=$2 AND accepted_at IS NULL`,
    [chain, version])).rows[0].n);

async function main() {
  await query(`INSERT INTO members (id) VALUES ($1) ON CONFLICT DO NOTHING`, [M]);
  console.log('── CUTOVER-01B.0 · duplicate-unspent permission ──────────────');

  const w = await makeWork(M);
  const chain = await makeChain(M, w);
  const v1 = await addVersion(chain, 'maia', ', held', null);
  const v2 = await addVersion(chain, 'member', ', steady', v1);

  /* ── D1 · sequential repeat, unchanged Work ────────────────────────────── */
  const a1 = await attempt(chain, v2);
  const a2 = await attempt(chain, v2);
  eq('D1 · ⭐⭐ repeating the act recovers the SAME permission (id · authorizedAt · 1 row)',
    a1.ok && a2.ok
      ? [a1.authorization.id === a2.authorization.id,
        a1.authorization.authorizedAt === a2.authorization.authorizedAt,
        await unspentCount(chain, v2)]
      : [a1, a2], [true, true, 1]);

  /* ── D2 · ⭐⭐ TWO CONCURRENT CALLS, SAME WORK STATE ─────────────────────
     ⚠️ EVIDENCE CLASS: SCHEDULING RENDEZVOUS, named as one. A third connection
     takes `FOR UPDATE` on the draft row FIRST and holds it; both authorizing
     calls are launched and must queue behind it; the holder then releases.

     ⭐ That is the discriminator, not decoration: lawful code cannot pass the
     draft lock, so both calls serialize and the second finds the first's row.
     A mutant that drops the lock runs ahead of the holder and races. */
  const wB = await makeWork(M);
  const chainB = await makeChain(M, wB);
  const vB = await addVersion(chainB, 'maia', ', steady', null);

  /* ⛔ The pool is nullable by type; a witness must not assert it away. */
  const p = pool;
  if (!p) { bad('D2 · pool unavailable', 'no pool'); return finish(); }
  const holder = await p.connect();
  let released = false;
  try {
    await holder.query('BEGIN');
    await holder.query(
      `SELECT id FROM manuscript_working_drafts WHERE id = $1 FOR UPDATE`, [wB.draftId]);
    const both = Promise.all([
      attempt(chainB, vB),
      attempt(chainB, vB),
    ]);
    /* Give both calls time to reach the draft lock and block on it. */
    await new Promise((r) => setTimeout(r, 250));
    await holder.query('COMMIT'); released = true;
    const [c1, c2] = await both;
    eq('D2 · ⭐⭐ two CONCURRENT authorizations converge on ONE permission',
      c1.ok && c2.ok
        ? [c1.authorization.id === c2.authorization.id,
          c1.authorization.authorizedAt === c2.authorization.authorizedAt,
          await unspentCount(chainB, vB)]
        : [c1, c2], [true, true, 1]);
    eq('D2b · ⛔ neither call escaped as a raw unique violation',
      [c1.ok, c2.ok], [true, true]);
  } catch (e) {
    bad('D2 · concurrent pair', e);
  } finally {
    if (!released) { try { await holder.query('ROLLBACK'); } catch { /* holder gone */ } }
    holder.release();
  }

  /* ── D3 · the Work advances → a NEW permission is lawful ───────────────── */
  await query(`UPDATE manuscript_working_drafts SET version = 42 WHERE id = $1`, [w.draftId]);
  const a3 = await attempt(chain, v2);
  const rows = await query<{ base_version: string; id: string }>(
    `SELECT id, base_version FROM manuscript_revision_authorizations
      WHERE proposal_chain_id=$1 AND accepted_at IS NULL ORDER BY base_version`, [chain]);
  eq('D3 · ⭐⭐ Work ADVANCED → a NEW authorization, both unspent, both lawful',
    a3.ok
      ? [a3.authorization.id !== (a1.ok ? a1.authorization.id : ''),
        a3.authorization.guard.baseVersion,
        rows.rows.map((r) => Number(r.base_version))]
      : a3, [true, 42, [41, 42]]);

  /* ── D4 · the exact VERSION is part of the identity ────────────────────── */
  const a4 = await attempt(chain, v1);
  eq('D4 · ⭐ a DIFFERENT version at the same Work base does NOT dedupe together',
    a4.ok && a3.ok
      ? [a4.authorization.id !== a3.authorization.id,
        a4.authorization.guard.baseVersion === a3.authorization.guard.baseVersion,
        a4.authorization.proposalVersionId === v1]
      : [a4, a3], [true, true, true]);

  /* ── D5 · [SCHEMA] the index refuses a direct duplicate ────────────────── */
  let refused = 'NOT REFUSED';
  try {
    await query(
      `INSERT INTO manuscript_revision_authorizations
         (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
          base_version, target_section_id, expected_text)
       SELECT member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
              base_version, target_section_id, expected_text
         FROM manuscript_revision_authorizations WHERE id = $1`,
      [a3.ok ? a3.authorization.id : '']);
  } catch (e) { refused = (e as { code?: string }).code ?? 'ERROR'; }
  eq('D5 · ⛔ [SCHEMA] a direct duplicate of the same unspent identity is REFUSED',
    refused, '23505');

  /* ── D6 · [SCHEMA] spending removes the row from the uniqueness set ────── */
  let afterSpend = 'REFUSED';
  try {
    await query(
      `UPDATE manuscript_revision_authorizations
          SET accepted_at = now(), resulting_version = 43 WHERE id = $1`,
      [a3.ok ? a3.authorization.id : '']);
    await query(
      `INSERT INTO manuscript_revision_authorizations
         (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
          base_version, target_section_id, expected_text)
       SELECT member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
              base_version, target_section_id, expected_text
         FROM manuscript_revision_authorizations WHERE id = $1`,
      [a3.ok ? a3.authorization.id : '']);
    afterSpend = 'ADMITTED';
  } catch (e) { afterSpend = (e as { code?: string }).code ?? 'ERROR'; }
  /* ⚠️ SCHEMA PROPERTY ONLY. Ordinary runtime execution ADVANCES the Work, so a
     spent row and a new one rarely share a base_version; what is proved here is
     that history does not block a future permission. */
  eq('D6 · ⭐ [SCHEMA] spending frees the natural key — history never blocks a permission',
    afterSpend, 'ADMITTED');

  return finish();
}

function finish() {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  return closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}
main().catch((e) => { console.error(e); return closePool().then(() => process.exit(2)); });
