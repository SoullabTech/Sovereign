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

import { query } from '../../lib/db/postgres';
import { assembleFocus } from '../../lib/writers-studio/assembleFocus';
import { establishDisclosureBoundary, mayCrossBoundary } from '../../lib/disclosure/disclosureBoundary';
import { readDisclosed, type DisclosureLocus } from '../../lib/disclosure/disclosureAuthority';
import { actIdentifiers } from '../../lib/disclosure/actIdentity';
import { TurnPosture } from '../../lib/sanctuary/turnPosture';

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

/** One run, one set of acts, so repeated cases never collide as idempotent replays. */
const RUN = process.env.FOCUS_CONTRACT_RUN ?? Math.random().toString(36).slice(2, 10);
let act = 0;

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
  /* ⭐ The disclosure substrate is now a PREREQUISITE, not a subject: authority
     must come through the canonical boundary, and that boundary writes a consent
     row and a receipt before it will hand back a capability. */
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

  /* The ADDENDUM-01 vocabulary. A database predating it can still satisfy every
     assertion below, which is exactly why its absence must be named rather than
     tolerated: this witness would then be reading a schema older than its subject. */
  const vocab = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'context_disclosure_receipts'
        AND column_name = ANY($1::text[])`, [['unit_ref', 'range_from_ref', 'range_to_ref']]);
  for (const c of ['unit_ref', 'range_from_ref', 'range_to_ref']) {
    if (!vocab.rows.some(r => r.column_name === c)) missing.push(`context_disclosure_receipts.${c}`);
  }

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
 * ⭐⭐ AUTHORITY COMES THROUGH THE CANONICAL BOUNDARY, NOT AROUND IT.
 *
 * This witness adjudicates the ASSEMBLER's read authority against a real schema.
 * The capability is a prerequisite of reaching the assembler at all — so it is
 * established here the way production establishes it, and never minted directly.
 * `mintDisclosureAuthority` is the boundary's alone; a witness that called it
 * would be proving the assembler against an authority no request could obtain.
 *
 * ⛔ What this deliberately does NOT re-prove: absence, mismatch, spend and
 * evidence-set exactness. F1a-F1e and F1o hold those behaviorally. Duplicating
 * them here would make this witness about the capability rather than about the
 * one thing only it can prove — that the real SQL reads the right relations.
 */
async function disclose(
  memberId: string, workRef: string, locus: DisclosureLocus,
): Promise<string | null> {
  const { requestId, disclosureId } = actIdentifiers(`focus-contract-${RUN}-${++act}`);
  const boundary = await establishDisclosureBoundary({
    requestId, posture: TurnPosture.resolve({ userId: memberId }), memberId,
    sessionId: null, disclosureId,
    boundary: 'manuscript_prose->maia_cognition',
    sourceClass: 'work', participationBasis: 'member_invoked',
    workRef, locus, gesture: 'ask_maia',
  });
  if (!mayCrossBoundary(boundary)) {
    /* The boundary is SETUP here. If it refuses, the instrument cannot reach its
       subject, and reporting a failed assertion would blame the assembler for the
       harness. That distinction is the whole reason this is a hard stop. */
    console.error(`\n⛔ THE BOUNDARY REFUSED (${boundary.kind}) — the witness never reached the assembler.\n` +
      '   This is an instrument fault, not an assembler verdict.\n');
    process.exit(1);
  }
  const content = await assembleFocus({ authority: boundary.authority, memberId, workRef, locus });
  return content === null ? null : readDisclosed(content);
}

async function main() {
  await requireSchema();
  await seedMembers();

  const work = await seedWork(MEMBER, true, [DRAFT_1, DRAFT_2, DRAFT_EMOJI]);

  // ── the Work is the DRAFT, never the Source
  const whole = await disclose(MEMBER, work.manuscriptId, { scopeKind: 'whole_work' });
  w('draft differs from Source → draft wins', !!whole && whole.includes(DRAFT_1) && !whole.includes(SOURCE_1),
    `got: ${String(whole).slice(0, 80)}`);
  w('Source is never the payload', !!whole && !whole.includes('SOURCE'));
  w('whole Work preserves draft order',
    !!whole && whole.indexOf(DRAFT_1) < whole.indexOf(DRAFT_2));

  /**
   * ⭐⭐ 01B · THE THREE FIDELITY OBLIGATIONS.
   *
   * ⛔ EXACT comparison, byte for byte. A test that trims, collapses whitespace or
   * otherwise canonicalises before comparing would erase the very defect 01B
   * exists to detect.
   */
  const canonical = await query<{ flat: string }>(
    `SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '') AS flat
       FROM manuscript_draft_sections s WHERE s.draft_id = $1`, [work.draftId]);
  const flat = canonical.rows[0].flat;
  w('O1 · whole Work === the canonical flattening (exact)', whole === flat,
    `assembled ${JSON.stringify(whole)}\n        canonical ${JSON.stringify(flat)}`);

  const stored = await query<{ content: string }>(
    `SELECT content FROM manuscript_working_drafts WHERE id = $1`, [work.draftId]);
  w('O2 · whole Work === manuscript_working_drafts.content (exact)',
    whole === stored.rows[0].content,
    `assembled ${JSON.stringify(whole)}\n        content   ${JSON.stringify(stored.rows[0].content)}`);

  w('O3 · no character is manufactured at a section boundary',
    !!whole && Buffer.byteLength(whole, 'utf8') ===
      [DRAFT_1, DRAFT_2, DRAFT_EMOJI].reduce((n, t) => n + Buffer.byteLength(t, 'utf8'), 0),
    `assembled ${Buffer.byteLength(String(whole), 'utf8')} bytes`);

  // ── section identity is DRAFT-section identity
  const section = await disclose(MEMBER, work.manuscriptId,
    { scopeKind: 'section', sectionRef: work.sectionIds[1] });
  w('section id is draft-section identity', section === DRAFT_2, `got: ${String(section)}`);

  const sourceIds = await query<{ id: string }>(
    `SELECT id FROM manuscript_sections ORDER BY position`, []);
  const bySourceId = await disclose(MEMBER, work.manuscriptId,
    { scopeKind: 'section', sectionRef: sourceIds.rows[0].id });
  w('a SOURCE section id is not a valid locator', bySourceId === null, `got: ${String(bySourceId)}`);

  // ── the addressability gate
  const unaddressable = await seedWork(MEMBER, false, [DRAFT_1]);
  const gated = await disclose(MEMBER, unaddressable.manuscriptId, { scopeKind: 'whole_work' });
  w('addressability predicate holds → un-addressable draft yields no Work', gated === null,
    `got: ${String(gated)}`);

  // ── ownership
  const wrongMember = await disclose(OTHER, work.manuscriptId, { scopeKind: 'whole_work' });
  w('wrong member → no Work', wrongMember === null, `got: ${String(wrongMember)}`);
  const wrongMemberSection = await disclose(OTHER, work.manuscriptId,
    { scopeKind: 'section', sectionRef: work.sectionIds[0] });
  w('wrong member → no section, even with a real locator', wrongMemberSection === null);

  // ── ⭐ passage offsets in the browser's coordinate system
  const emojiText = DRAFT_EMOJI;
  const start = emojiText.indexOf('tide');           // UTF-16 code-unit offset, as a textarea reports
  const end = start + 'tide came in'.length;
  const passage = await disclose(MEMBER, work.manuscriptId,
    { scopeKind: 'passage', sectionRef: work.sectionIds[2], range: { start, end } });
  w('emoji before selection → exact selected text', passage === 'tide came in',
    `got: ${JSON.stringify(passage)} — code-point slicing yields ${JSON.stringify([...emojiText].slice(start, end).join(''))}`);

  /* ⭐ THE LAW MOVED UPSTREAM, SO IT IS PROVED TWICE. `DisclosureLocus` no longer
     admits a passage without its section, and `focusCrossing` refuses to build
     one before any authority exists. The cast asserts the assembler ALSO still
     refuses at runtime: a type is a compile-time promise, and this witness exists
     because compile-time promises about database reads have been wrong before. */
  const noLocator = await disclose(MEMBER, work.manuscriptId,
    { scopeKind: 'passage', range: { start, end } } as unknown as DisclosureLocus);
  w('passage without a locator cannot be assembled', noLocator === null);

  console.log(`\n${pass} passed · ${fail} failed`);
  // ⛔ Remove only the fixtures this run created. Dropping the subject relations
  // would destroy the repo-derived schema the next run depends on.
  await query(`DELETE FROM member_manuscripts WHERE member_id = ANY($1::uuid[])`, [[MEMBER, OTHER]]);
  await query(`DELETE FROM members WHERE id = ANY($1::uuid[])`, [[MEMBER, OTHER]]);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(err => { console.error('witness failed:', err); process.exit(1); });
