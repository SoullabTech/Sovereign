/**
 * W2 — the formulation composer. W2-1 … W2-10.
 *
 * ⭐⭐ THE GOVERNING SENTENCE:
 *     The writer may author the next wording. The system may judge whether that
 *     succession is still possible; it may never choose a different succession
 *     on the writer's behalf.
 *
 * ⛔ DISPOSABLE DATABASE ONLY.
 *
 * EVIDENCE CLASSES, named: W2-1/3/4/5/6/9/10 are BEHAVIOURAL against real rows
 * through the real store. W2-2/7/8 are SOURCE-LEVEL, comments stripped — the
 * route needs a verified session and neither it nor the auth boundary is
 * weakened to make this behavioural.
 */
import { query, closePool } from '@/lib/db/postgres';
import { appendAuthoredVersion, readChain } from '@/lib/manuscript/proposalChain/store';
import { readProposalWork } from '@/lib/manuscript/proposalChain/proposalWork';
import { editorialThread } from '@/lib/writersStudio/editorialThread';

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

async function makeChain(member: string) {
  const workId = await uuid(); const draftId = await uuid(); const sectionId = await uuid();
  await query(`INSERT INTO member_manuscripts (id) VALUES ($1)`, [workId]);
  await query(`INSERT INTO manuscript_working_drafts
                 (id, manuscript_id, member_id, version, section_addressable_at)
               VALUES ($1,$2,$3,41, now())`, [draftId, workId, member]);
  await query(`INSERT INTO manuscript_draft_sections (id, draft_id, text)
               VALUES ($1,$2,$3)`, [sectionId, draftId,
    'He was there, fixated, and the river ran on without him.']);
  const c = await query<{ id: string }>(
    `INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version,
                                  target_section_id, expected_text)
     VALUES ($1,$2,$3,41,$4,', fixated') RETURNING id`,
    [member, workId, draftId, sectionId]);
  return { chainId: c.rows[0].id, workId, draftId, sectionId };
}
const maia = (chainId: string, text: string, supersedes: string | null) =>
  appendAuthoredVersion(M, chainId, { supersedes, replacementText: text, author: 'maia' });

async function main() {
  await query(`INSERT INTO members (id) VALUES ($1),($2) ON CONFLICT DO NOTHING`, [M, M2]);
  console.log('── W2 · formulation composer ─────────────────────────────────');

  const { chainId, sectionId } = await makeChain(M);
  const r1 = await maia(chainId, ', held', null);
  if (r1.outcome !== 'appended') { bad('setup v1', r1.reason); return finish(); }
  const v1 = r1.version.id;
  const r2 = await appendAuthoredVersion(M, chainId,
    { supersedes: v1, replacementText: ', steady', author: 'member' });
  if (r2.outcome !== 'appended') { bad('setup v2', r2.reason); return finish(); }
  const v2 = r2.version.id;
  const r3 = await maia(chainId, ', quieter', v2);
  if (r3.outcome !== 'appended') { bad('setup v3', r3.reason); return finish(); }
  const v3 = r3.version.id;

  /* ── W2-1 · the writer chooses v3 and authors wording ──────────────────── */
  const before = await query<{ text: string }>(
    `SELECT text FROM manuscript_draft_sections WHERE id = $1`, [sectionId]);
  const a = await appendAuthoredVersion(M, chainId,
    { supersedes: v3, replacementText: ', unhurried', author: 'member' });
  eq('W2-1 · ⭐⭐ the writer authors v4 — author member, supersedes the version they answered',
    a.outcome === 'appended'
      ? [a.version.author, a.version.supersedes === v3, a.version.replacementText]
      : a, ['member', true, ', unhurried']);
  const v4 = a.outcome === 'appended' ? a.version.id : '';

  /* ── W2-9 · the append changed succession ONLY ─────────────────────────── */
  const after = await query<{ text: string }>(
    `SELECT text FROM manuscript_draft_sections WHERE id = $1`, [sectionId]);
  const dv = await query<{ version: string }>(
    `SELECT version FROM manuscript_working_drafts WHERE id =
       (SELECT draft_id FROM proposal_chains WHERE id = $1)`, [chainId]);
  const auths = await query<{ n: string }>(
    `SELECT count(*) AS n FROM manuscript_revision_authorizations
      WHERE proposal_chain_id = $1`, [chainId]);
  eq('W2-9 · ⛔ succession only — manuscript byte-identical, draft version unmoved, no authorization',
    [after.rows[0].text === before.rows[0].text, Number(dv.rows[0].version),
      Number(auths.rows[0].n)], [true, 41, 0]);

  /* ── W2-3 · a stale predecessor REFUSES, and nothing is substituted ────── */
  const stale = await appendAuthoredVersion(M, chainId,
    { supersedes: v3, replacementText: ', slower', author: 'member' });
  const headNow = await readChain(M, chainId);
  eq('W2-3 · ⭐⭐ stale predecessor → not_successor_of_head · nothing written · head unmoved',
    [stale.outcome, stale.outcome === 'refused' ? stale.reason : null,
      headNow ? headNow.versions.length : -1,
      headNow ? headNow.versions.some((v) => v.replacementText === ', slower') : null],
    ['refused', 'not_successor_of_head', 4, false]);

  /* ── W2-5 · empty wording is a LAWFUL deletion candidate ───────────────── */
  const del = await appendAuthoredVersion(M, chainId,
    { supersedes: v4, replacementText: '', author: 'member' });
  eq('W2-5 · ⭐ `` is lawful candidate wording — a deletion, not a missing value',
    del.outcome === 'appended'
      ? [del.version.replacementText, del.version.author] : del, ['', 'member']);
  const v5 = del.outcome === 'appended' ? del.version.id : '';

  /* ── W2-6 · a foreign chain reads exactly as a missing one ─────────────── */
  const foreign = await appendAuthoredVersion(M2, chainId,
    { supersedes: v5, replacementText: 'x', author: 'member' });
  const missing = await appendAuthoredVersion(
    M, '00000000-0000-0000-0000-000000000000',
    { supersedes: null, replacementText: 'x', author: 'member' });
  eq('W2-6 · ⛔ foreign chain ≡ missing chain — indistinguishable',
    [foreign, missing],
    [{ outcome: 'refused', reason: 'chain_unknown' },
      { outcome: 'refused', reason: 'chain_unknown' }]);

  /* ══ W2-10 · the W1 thread can now represent the whole exchange ══════════
     ⚠️ THE FIRST WRITING OF THIS OBLIGATION FAILED, AND THE FAILURE WAS REAL
     EVIDENCE, NOT NOISE. It fed `readChain()` straight into the projection —
     but that store read is `ORDER BY id`, PRESENTATION ORDER ONLY, and its own
     comment says so. UUID-lexicographic order is not lineage (the S3 F2 defect
     exactly), and `editorialThread` REFUSED it as `not_structural`.

     ⭐ That is the W1 guard doing precisely its job on its first contact with
     real rows: it declined to render a plausible order nobody authored. The
     repair is to consume the ORDERED read — `readProposalWork()`, which applies
     `lineage()` — not to loosen the guard. */
  const work = await readProposalWork(M, chainId, v4);
  const chain = work.ok ? { chain: work.work.chain, versions: work.work.versions } : null;
  const t = chain ? editorialThread({
    chainId, locus: { expectedText: chain.chain.locus.expectedText },
    versions: chain.versions.map((v) => ({
      id: v.id, author: v.author, supersedes: v.supersedes,
      replacementText: v.replacementText,
      ...(v.rationale !== undefined ? { rationale: v.rationale } : {}),
      authoredAt: v.authoredAt,
    })),
    focusedVersionId: v4,
  }) : { ok: false as const, reason: 'no chain' as never };
  eq('W2-10 · ⭐⭐ MAIA v1 → You v2 → MAIA v3 → You v4 → You v5, authorship explicit',
    t.ok ? t.rows.map((r) => (r.kind === 'original' ? 'Original'
      : `${r.author === 'maia' ? 'MAIA' : 'You'} ${r.ordinal}`)) : t,
    ['Original', 'MAIA 1', 'You 2', 'MAIA 3', 'You 4', 'You 5']);

  /* ══ SOURCE-LEVEL — labelled, not disguised ══════════════════════════════ */
  const ROUTE = codeOf('app/api/writers-studio/proposal-chains/[chainId]/versions/route.ts');
  const COMPOSER = codeOf('app/writers-studio/VersionComposer.tsx');

  eq('W2-2 · [SOURCE] the client cannot choose the author — the route writes `member`',
    [/author:\s*'member'/.test(ROUTE), /author:\s*b\.author|b\[['"]author/.test(ROUTE)],
    [true, false]);

  /* W2-7 · the closed field set, and an unknown field refused rather than dropped */
  eq('W2-7 · ⛔ [SOURCE] only authoring facts are accepted; anything else is a 400',
    [/AUTHORING_FIELDS\s*=\s*new Set\(\['supersedes', 'replacementText'\]\)/.test(ROUTE),
      /unknown_field/.test(ROUTE),
      /b\.(rationale|locus|expectedText|targetSectionId|baseVersion|authorizationId)/.test(ROUTE)],
    [true, true, false]);
  /* ⛔ and no truthiness gate that would forbid a deletion */
  eq('W2-7b · ⛔ [SOURCE] `replacementText` is type-checked, never truthiness-checked',
    [/typeof b\.replacementText !== 'string'/.test(ROUTE),
      /!b\.replacementText|b\.replacementText\.length\s*===\s*0|\.trim\(\)/.test(ROUTE)],
    [true, false]);

  eq('W2-8 · ⛔ [SOURCE] the composer offers no question / direction / chat affordance',
    [/Ask MAIA|Reply|Send|Tell MAIA|question|prompt/i.test(COMPOSER.replace(/\bquestion mark\b/g, '')),
      /Write the wording you would put in the manuscript\./.test(COMPOSER),
      /Add my version/.test(COMPOSER)],
    [false, true, true]);
  /* ⚠️ MY BAN CAUGHT THE PROOF OF COMPLIANCE, AND IT IS RECORDED. The first
     writing forbade the substring `head`, which matched `not_successor_of_head`
     — the refusal name the composer must handle in order to obey the law. That
     is the C21 class and the FOURTH time today I have banned a mechanism where
     a behaviour was meant: a prose ban must never read as the banned behaviour
     returning.

     ⭐ Re-asserted as the shapes a retry or a head lookup would actually need:
     the composer owns no network of its own, submits exactly once per press,
     and passes the version the writer acted against VERBATIM. */
  eq('W2-8b · ⛔ [SOURCE] no prefill from MAIA, and nothing a retry or head lookup would need',
    [/useState\(''\)/.test(COMPOSER),
      /defaultValue|prefill|target\.(text|replacementText)/.test(COMPOSER),
      /fetch\(|apiFetch|\.json\(\)/.test(COMPOSER),
      (COMPOSER.match(/onSubmit\(/g) ?? []).length,
      /supersedes:\s*target\.versionId/.test(COMPOSER)],
    [true, false, false, 1, true]);
  eq('W2-8c · ⛔ [SOURCE] the composer reaches no authorization and no manuscript write',
    /authoriz|execute|revision-authorizations|write-state|save/i.test(COMPOSER), false);

  return finish();
}

function finish() {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  return closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}
main().catch((e) => { console.error(e); return closePool().then(() => process.exit(2)); });
