/**
 * FOCUS-ASSEMBLER-CONTRACT-01 · the schema-contract witness.
 *
 *   ⭐⭐ Source-level assertions cannot validate a database contract.
 *
 * 190 unit falsifiers passed over an assembler whose SQL named a table that does
 * not exist, because every one of them mocked `@/lib/db/postgres`. This witness
 * imports the REAL `assembleFocus` and runs its REAL queries against a disposable
 * Postgres holding the REAL schema. It is the same discipline as the receipts
 * trigger witness, for the same reason.
 *
 *   DATABASE_URL=postgres://…/shadow npx tsx scripts/witness/focus-assembler-contract.ts
 *
 * ⛔ Disposable shadow only. It creates and drops its own tables.
 */

import { randomUUID } from 'crypto';
import { query } from '../../lib/db/postgres';
import { assembleFocus } from '../../lib/writers-studio/assembleFocus';
import { establishDisclosureBoundary, mayCrossBoundary } from '../../lib/disclosure/disclosureBoundary';
import {
  readDisclosed, discloseUnder,
  type DisclosedContent, type DisclosureAuthority, type DisclosureLocus,
} from '../../lib/disclosure/disclosureAuthority';
import { TurnPosture } from '../../lib/sanctuary/turnPosture';

/**
 * ⭐⭐ ENFORCEMENT RECONCILIATION (2026-09-10).
 *
 * This instrument was byte-identical to its 2de1b421 original while the code it
 * gates moved to a capability-bound interface. It still called
 * `assembleFocus({ memberId, workRef, scopeKind, sectionRef, range })`; the
 * assembler now takes `{ authority, memberId, workRef, locus }`. `tsx`
 * transpiles without typechecking, so the gate RAN, `locus` was `undefined`, and
 * it died on `locus.scopeKind` — failing closed, but incapable of passing.
 *
 *   ⛔ The ratified law it exists to enforce therefore had NO functioning
 *     instrument: *a database-dependent disclosure boundary cannot be licensed
 *     solely by a mocked database.*
 *
 * ⛔ THE FIX IS THE INSTRUMENT, NOT THE ARCHITECTURE. No compatibility shim was
 * added to `assembleFocus` to make this file green again. An obsolete instrument
 * does not get to drag a governed architecture backwards.
 *
 * ⭐ AUTHORITY IS MINTED BY THE REAL BOUNDARY, never by this file.
 * `mintDisclosureAuthority` has exactly one lawful non-test caller, and going
 * through `establishDisclosureBoundary` is not a detour — it is what makes this
 * a witness of the real path rather than of a hand-made token.
 */

/** The assembler under test. ⭐ A seam, so a known-broken custody can be run too. */
type Assembler = (ref: {
  authority: DisclosureAuthority; memberId: string; workRef: string; locus: DisclosureLocus;
}) => Promise<DisclosedContent | null>;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const OTHER  = '22222222-2222-2222-2222-222222222222';

/* ⭐ THE LOAD-BEARING FIXTURE: Source and Draft say DIFFERENT things, so no check
   can pass merely because both happen to contain the same words. */
const SOURCE_1 = 'SOURCE ONE: the keeper counted ships he could not save.';
/* ⭐ 01B: this section ENDS IN A BLANK LINE the writer authored. A synthesized
   `\n\n` at the boundary would be indistinguishable from it — which is the whole
   reason separators may not be manufactured. */
const DRAFT_1  = 'DRAFT ONE: the keeper stopped counting.\n\n';
const SOURCE_2 = 'SOURCE TWO: the lamp failed in November.';
const DRAFT_2  = 'DRAFT TWO: the lamp was never the point.';
/* An emoji before the selection: UTF-16 code units vs code points diverge here. */
const DRAFT_EMOJI = '🌊 the tide came in and the sentence changed';

let pass = 0, fail = 0;
const w = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `\n        ${detail}`}`);
  ok ? pass++ : fail++;
};

/**
 * ⛔ CREATES NOTHING. It asserts the repo-derived schema is present, and names
 * exactly what is missing when it is not — a schema-lineage finding is more
 * valuable than a green fake schema.
 */
async function requireSchema() {
  /* ⭐ The disclosure substrate is part of the subject now: authority is minted
     by the real boundary, which requires the consent row and the receipt table.
     A witness that hand-made a capability would prove the assembler runs, not
     that the governed path can produce one. */
  const need = ['member_manuscripts', 'manuscript_sections',
                'manuscript_working_drafts', 'manuscript_draft_sections',
                'runtime_consent_state', 'context_disclosure_receipts'];
  const t = await query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ANY($1::text[])`, [need]);
  const found = t.rows.map(r => r.table_name);
  const missing = need.filter(n => !found.includes(n));
  const gate = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'manuscript_working_drafts' AND column_name = 'section_addressable_at'`, []);
  if (gate.rows.length === 0) missing.push('manuscript_working_drafts.section_addressable_at');

  if (missing.length) {
    console.error(
      `\n⛔ SCHEMA NOT CONSTRUCTED — missing: ${missing.join(', ')}\n` +
      '   The witness builds nothing. Construct the database from repository truth:\n' +
      '     npm run db:bootstrap && npm run db:migrate\n' +
      '   If repository schema history CANNOT produce these relations, that is a\n' +
      '   schema-history finding. ⛔ Do not repair it with copied DDL.\n');
    process.exit(1);
  }

  // Identities of the schema inputs, recorded with the verdict: a witness has two
  // subjects — the thing witnessed and the instrument witnessing it.
  const ledger = await query<{ n: string }>(`SELECT count(*)::text AS n FROM schema_migrations`, []);
  const genesis = await query<{ filename: string }>(
    `SELECT filename FROM schema_migrations WHERE filename LIKE '%manuscript_draft_sections%'`, []);
  console.log(`schema input   : ${ledger.rows[0].n} ledger entries · draft-section genesis: ${genesis.rows[0]?.filename ?? 'NOT IN LEDGER'}`);
}

/**
 * ⭐ Real members, because the real schema has FKs the hand-written DDL did not:
 * `member_manuscripts.member_id` and `manuscript_working_drafts.member_id` both
 * REFERENCE `members(id)`. The modelled schema silently omitted them — the first
 * concrete thing 01A caught.
 */
async function seedMembers() {
  for (const [i, id] of [MEMBER, OTHER].entries()) {
    await query(
      `INSERT INTO members (id, passkey, username, password_hash)
       VALUES ($1, $2, $3, 'x') ON CONFLICT (id) DO NOTHING`,
      [id, `WITNESS-FOCUS-${i}`, `witness_focus_${i}`]);
  }
}

/** One Work, its Source, and a draft that may or may not be addressable. */
async function seedWork(memberId: string, addressable: boolean, sections: string[]) {
  const m = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,'W') RETURNING id`, [memberId]);
  const manuscriptId = m.rows[0].id;
  for (const [i, body] of [SOURCE_1, SOURCE_2].entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, body) VALUES ($1,$2,$3)`,
      [manuscriptId, i, body]);
  }
  /**
   * ⭐ THE SECOND THING 01A CAUGHT. The real schema carries a trigger,
   * `manuscript_working_drafts_round_trip()`, which the hand-written DDL had no
   * trace of: once `section_addressable_at` is set, `content` MUST equal
   * `string_agg(s.text, '' ORDER BY s.position)` — the sections concatenated with
   * NO separator. So the draft is created un-addressable, its sections are
   * written, and only then is it flattened and made addressable in one step.
   */
  const d = await query<{ id: string }>(
    `INSERT INTO manuscript_working_drafts (manuscript_id, member_id, content, base_source_hash)
     VALUES ($1,$2,'','h') RETURNING id`, [manuscriptId, memberId]);
  const draftId = d.rows[0].id;
  const ids: string[] = [];
  for (const [i, text] of sections.entries()) {
    const s = await query<{ id: string }>(
      `INSERT INTO manuscript_draft_sections (draft_id, position, text) VALUES ($1,$2,$3) RETURNING id`,
      [draftId, i, text]);
    ids.push(s.rows[0].id);
  }
  if (addressable) {
    await query(
      `UPDATE manuscript_working_drafts d
          SET content = (SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '')
                           FROM manuscript_draft_sections s WHERE s.draft_id = d.id),
              section_addressable_at = NOW()
        WHERE d.id = $1`, [draftId]);
  }
  return { manuscriptId, draftId, sectionIds: ids };
}

/**
 * ⭐ ONE REAL CAPABILITY, from the real boundary. Returns `null` where the
 * boundary itself refused — which is a finding, not a fixture problem.
 */
async function authorityFor(memberId: string, workRef: string, locus: DisclosureLocus) {
  const outcome = await establishDisclosureBoundary({
    requestId: randomUUID(),
    posture: TurnPosture.resolve({}),
    memberId,
    sessionId: randomUUID(),
    disclosureId: randomUUID(),
    boundary: 'manuscript_prose->maia_cognition',
    sourceClass: 'work',
    participationBasis: 'member_invoked',
    workRef,
    locus,
    gesture: 'work_with_this',
  });
  return mayCrossBoundary(outcome) ? outcome.authority : null;
}

/** The characters an assembler let across, or `null`. ⛔ Sealed content only. */
const textOf = (c: DisclosedContent | null): string | null =>
  c === null ? null : readDisclosed(c);

/**
 * The contract, run against ONE assembler.
 *
 * ⭐ Returns its own failures rather than exiting, so the SAME obligations can be
 * required to pass for the real assembler and to FAIL for a known-broken custody
 * — the testing law this lane has held throughout: a repaired instrument earns
 * trust only when a broken implementation makes it red.
 */
async function runContract(assemble: Assembler, label: string): Promise<string[]> {
  const failures: string[] = [];
  const e = (id: string, ok: boolean, detail = '') => {
    if (!ok) failures.push(`${id}${detail ? ` — ${detail}` : ''}`);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(9)} ${id}${ok || !detail ? '' : ` — ${detail}`}`);
  };

  const work = await seedWork(MEMBER, true, [DRAFT_1, DRAFT_2, DRAFT_EMOJI]);
  const whole: DisclosureLocus = { scopeKind: 'whole_work' };

  /* ── E1 · a lawful member + Work + authority + locus reaches the real SQL ── */
  const auth = await authorityFor(MEMBER, work.manuscriptId, whole);
  if (!auth) { e('E1', false, 'the real boundary refused to mint — the gate cannot run'); return failures; }
  const text = textOf(await assemble({ authority: auth, memberId: MEMBER, workRef: work.manuscriptId, locus: whole }));
  e('E1', !!text && text.includes(DRAFT_1), `got ${JSON.stringify(String(text).slice(0, 60))}`);

  /* ── E6 · the payload source stays the governed working-draft substrate ──── */
  e('E6.a', !!text && !text.includes('SOURCE'), 'manuscript_sections became the payload');
  e('E6.b', !!text && text.indexOf(DRAFT_1) < text.indexOf(DRAFT_2), 'draft order not preserved');

  const canonical = await query<{ flat: string }>(
    `SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '') AS flat
       FROM manuscript_draft_sections s WHERE s.draft_id = $1`, [work.draftId]);
  /* ⛔ EXACT, byte for byte. Trimming or collapsing whitespace before comparing
     would erase the very defect 01B exists to detect. */
  e('O1', text === canonical.rows[0].flat, 'whole Work !== the canonical flattening');
  const stored = await query<{ content: string }>(
    `SELECT content FROM manuscript_working_drafts WHERE id = $1`, [work.draftId]);
  e('O2', text === stored.rows[0].content, 'whole Work !== working-draft content');
  e('O3', !!text && Buffer.byteLength(text, 'utf8') ===
      [DRAFT_1, DRAFT_2, DRAFT_EMOJI].reduce((n, t) => n + Buffer.byteLength(t, 'utf8'), 0),
    'a character was manufactured at a section boundary');

  /* section identity is DRAFT-section identity */
  const secLocus: DisclosureLocus = { scopeKind: 'section', sectionRef: work.sectionIds[1] };
  const secAuth = await authorityFor(MEMBER, work.manuscriptId, secLocus);
  const sec = secAuth && textOf(await assemble({ authority: secAuth, memberId: MEMBER, workRef: work.manuscriptId, locus: secLocus }));
  e('E1.section', sec === DRAFT_2, `got ${JSON.stringify(String(sec))}`);

  const sourceIds = await query<{ id: string }>(`SELECT id FROM manuscript_sections ORDER BY position`, []);
  const srcLocus: DisclosureLocus = { scopeKind: 'section', sectionRef: sourceIds.rows[0].id };
  const srcAuth = await authorityFor(MEMBER, work.manuscriptId, srcLocus);
  const bySource = srcAuth && await assemble({ authority: srcAuth, memberId: MEMBER, workRef: work.manuscriptId, locus: srcLocus });
  e('E6.c', bySource === null, 'a SOURCE section id was accepted as a locator');

  /* ── E2 · custody refuses a foreign member ──────────────────────────────── */
  const foreign = await authorityFor(OTHER, work.manuscriptId, whole);
  const foreignRead = foreign && await assemble({ authority: foreign, memberId: OTHER, workRef: work.manuscriptId, locus: whole });
  e('E2', foreignRead === null, 'another member\'s Work was disclosed');

  /* ── E3 · a non-addressable Work refuses ────────────────────────────────── */
  const unaddressable = await seedWork(MEMBER, false, [DRAFT_1]);
  const uAuth = await authorityFor(MEMBER, unaddressable.manuscriptId, whole);
  const uRead = uAuth && await assemble({ authority: uAuth, memberId: MEMBER, workRef: unaddressable.manuscriptId, locus: whole });
  e('E3', uRead === null, 'an un-addressable draft was disclosed');

  /* ── E4 · ⭐⭐ WITHOUT A CAPABILITY THE SQL IS UNREACHABLE ─────────────────
     Not "a check refuses": the queries never run. A forged object was never
     minted, so `discloseUnder` cannot match it. */
  const forged = Object.create(Object.getPrototypeOf(auth)) as DisclosureAuthority;
  const forgedRead = await assemble({ authority: forged, memberId: MEMBER, workRef: work.manuscriptId, locus: whole });
  e('E4', forgedRead === null, 'an unminted authority produced content');

  /* ── E5 · locus / authority mismatch refuses ────────────────────────────── */
  const other = await seedWork(MEMBER, true, [DRAFT_2]);
  const mismatchRead = await assemble({ authority: auth, memberId: MEMBER, workRef: other.manuscriptId, locus: whole });
  e('E5.work', mismatchRead === null, 'authority for one Work read another');
  const auth2 = await authorityFor(MEMBER, work.manuscriptId, whole);
  const scopeMismatch = auth2 && await assemble({
    authority: auth2, memberId: MEMBER, workRef: work.manuscriptId,
    locus: { scopeKind: 'section', sectionRef: work.sectionIds[0] } });
  e('E5.locus', scopeMismatch === null, 'whole-work authority satisfied a section load');

  /* ⭐ passage offsets in the browser's coordinate system */
  const start = DRAFT_EMOJI.indexOf('tide');
  const pLocus: DisclosureLocus = {
    scopeKind: 'passage', sectionRef: work.sectionIds[2],
    range: { start, end: start + 'tide came in'.length } };
  const pAuth = await authorityFor(MEMBER, work.manuscriptId, pLocus);
  const passage = pAuth && textOf(await assemble({ authority: pAuth, memberId: MEMBER, workRef: work.manuscriptId, locus: pLocus }));
  e('E1.passage', passage === 'tide came in', `got ${JSON.stringify(String(passage))}`);

  return failures;
}

/**
 * ⛔ A DELIBERATELY BROKEN CUSTODY — the exact defect `2de1b421` repaired: it
 * reads the SOURCE ingest relation as the payload, with no member predicate and
 * no addressability gate.
 *
 * ⭐⭐ IT GOES THROUGH `discloseUnder` PROPERLY. An earlier draft bypassed the
 * capability entirely, so it went red on `readDisclosed` refusing unsealed
 * content — which proves the SEAL works and says nothing about whether the
 * custody obligations can catch a custody defect. A broken implementation must
 * fail the obligations that name the defect, not a different guard on its way
 * past them.
 */
const brokenCustody: Assembler = async ({ authority, memberId, workRef, locus }) => {
  const outcome = await discloseUnder(authority, { memberId, workRef, locus }, async () => {
    const r = await query<{ body: string }>(
      `SELECT s.body FROM manuscript_sections s WHERE s.manuscript_id = $1 ORDER BY s.position`, [workRef]);
    return r.rows.length ? r.rows.map(x => x.body).join('\n\n') : null;
  });
  return outcome.kind === 'disclosed' ? outcome.content : null;
};

async function main() {
  await requireSchema();
  await seedMembers();

  const real = await runContract(assembleFocus as unknown as Assembler, 'REAL');

  /* ⭐⭐ THE INSTRUMENT MUST BE ABLE TO FAIL. `readDisclosed` refuses anything
     this module did not seal, so the broken assembler's fake content throws
     rather than returning text — which is itself the contract holding. Either
     way it must NOT come back clean. */
  let brokenFailures: string[];
  try {
    brokenFailures = await runContract(brokenCustody, 'BROKEN');
  } catch (err) {
    brokenFailures = [`threw: ${(err as Error).message.slice(0, 80)}`];
    console.log(`FAIL  BROKEN    threw — ${(err as Error).message.slice(0, 80)}`);
  }

  console.log(`\nREAL   : ${real.length === 0 ? 'all obligations PASS' : `${real.length} FAILED — ${real.join(' · ')}`}`);
  console.log(`BROKEN : ${brokenFailures.length} failure(s) — the instrument discriminates`);

  /* ⛔ THE RECEIPTS THIS RUN MINTED ARE NOT CLEANED UP, AND MUST NOT BE.
     `context_disclosure_receipt_governed_delete()` refuses a DELETE that does not
     name a deletion manifest, and it is right to: a receipt is evidence of a
     crossing, not a fixture. An earlier draft attempted the delete and swallowed
     the refusal — which would have taught a reader that the refusal is noise.
     ⭐ The rows die with the disposable database, which is the lawful disposal. */
  await query(`DELETE FROM member_manuscripts WHERE member_id = ANY($1::uuid[])`, [[MEMBER, OTHER]]);
  await query(`DELETE FROM members WHERE id = ANY($1::uuid[])`, [[MEMBER, OTHER]]);

  const ok = real.length === 0 && brokenFailures.length > 0;
  console.log(ok ? '\n✅ gate PASSED' : '\n⛔ gate FAILED');
  process.exit(ok ? 0 : 1);
}

main().catch(err => { console.error('witness failed:', err); process.exit(1); });
