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

const MEMBER = '11111111-1111-1111-1111-111111111111';
const OTHER  = '22222222-2222-2222-2222-222222222222';

/* ⭐ THE LOAD-BEARING FIXTURE: Source and Draft say DIFFERENT things, so no check
   can pass merely because both happen to contain the same words. */
const SOURCE_1 = 'SOURCE ONE: the keeper counted ships he could not save.';
const DRAFT_1  = 'DRAFT ONE: the keeper stopped counting.';
const SOURCE_2 = 'SOURCE TWO: the lamp failed in November.';
const DRAFT_2  = 'DRAFT TWO: the lamp was never the point.';
/* An emoji before the selection: UTF-16 code units vs code points diverge here. */
const DRAFT_EMOJI = '🌊 the tide came in and the sentence changed';

let pass = 0, fail = 0;
const w = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `\n        ${detail}`}`);
  ok ? pass++ : fail++;
};

async function schema() {
  await query(`
    CREATE TABLE member_manuscripts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL, title text);
    CREATE TABLE manuscript_sections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), manuscript_id uuid NOT NULL,
      position int NOT NULL, heading text, body text NOT NULL);
    CREATE TABLE manuscript_working_drafts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), manuscript_id uuid NOT NULL,
      member_id uuid NOT NULL, content text NOT NULL, base_source_hash text NOT NULL,
      section_addressable_at timestamptz);
    CREATE TABLE manuscript_draft_sections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
      position int NOT NULL, text text NOT NULL,
      source_section_id uuid REFERENCES manuscript_sections(id) ON DELETE SET NULL,
      UNIQUE (draft_id, position));
  `);
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
  const d = await query<{ id: string }>(
    `INSERT INTO manuscript_working_drafts (manuscript_id, member_id, content, base_source_hash, section_addressable_at)
     VALUES ($1,$2,'flattened','h', ${addressable ? 'NOW()' : 'NULL'}) RETURNING id`,
    [manuscriptId, memberId]);
  const draftId = d.rows[0].id;
  const ids: string[] = [];
  for (const [i, text] of sections.entries()) {
    const s = await query<{ id: string }>(
      `INSERT INTO manuscript_draft_sections (draft_id, position, text) VALUES ($1,$2,$3) RETURNING id`,
      [draftId, i, text]);
    ids.push(s.rows[0].id);
  }
  return { manuscriptId, draftId, sectionIds: ids };
}

async function main() {
  await schema();

  const work = await seedWork(MEMBER, true, [DRAFT_1, DRAFT_2, DRAFT_EMOJI]);

  // ── the Work is the DRAFT, never the Source
  const whole = await assembleFocus({ memberId: MEMBER, workRef: work.manuscriptId, scopeKind: 'whole_work' });
  w('draft differs from Source → draft wins', !!whole && whole.includes(DRAFT_1) && !whole.includes(SOURCE_1),
    `got: ${String(whole).slice(0, 80)}`);
  w('Source is never the payload', !!whole && !whole.includes('SOURCE'));
  w('whole Work preserves draft order',
    !!whole && whole.indexOf(DRAFT_1) < whole.indexOf(DRAFT_2));

  // ── section identity is DRAFT-section identity
  const section = await assembleFocus({
    memberId: MEMBER, workRef: work.manuscriptId, scopeKind: 'section', sectionRef: work.sectionIds[1] });
  w('section id is draft-section identity', section === DRAFT_2, `got: ${String(section)}`);

  const sourceIds = await query<{ id: string }>(
    `SELECT id FROM manuscript_sections ORDER BY position`, []);
  const bySourceId = await assembleFocus({
    memberId: MEMBER, workRef: work.manuscriptId, scopeKind: 'section', sectionRef: sourceIds.rows[0].id });
  w('a SOURCE section id is not a valid locator', bySourceId === null, `got: ${String(bySourceId)}`);

  // ── the addressability gate
  const unaddressable = await seedWork(MEMBER, false, [DRAFT_1]);
  const gated = await assembleFocus({
    memberId: MEMBER, workRef: unaddressable.manuscriptId, scopeKind: 'whole_work' });
  w('addressability predicate holds → un-addressable draft yields no Work', gated === null,
    `got: ${String(gated)}`);

  // ── ownership
  const wrongMember = await assembleFocus({
    memberId: OTHER, workRef: work.manuscriptId, scopeKind: 'whole_work' });
  w('wrong member → no Work', wrongMember === null, `got: ${String(wrongMember)}`);
  const wrongMemberSection = await assembleFocus({
    memberId: OTHER, workRef: work.manuscriptId, scopeKind: 'section', sectionRef: work.sectionIds[0] });
  w('wrong member → no section, even with a real locator', wrongMemberSection === null);

  // ── ⭐ passage offsets in the browser's coordinate system
  const emojiText = DRAFT_EMOJI;
  const start = emojiText.indexOf('tide');           // UTF-16 code-unit offset, as a textarea reports
  const end = start + 'tide came in'.length;
  const passage = await assembleFocus({
    memberId: MEMBER, workRef: work.manuscriptId, scopeKind: 'passage',
    sectionRef: work.sectionIds[2], range: { start, end } });
  w('emoji before selection → exact selected text', passage === 'tide came in',
    `got: ${JSON.stringify(passage)} — code-point slicing yields ${JSON.stringify([...emojiText].slice(start, end).join(''))}`);

  const noLocator = await assembleFocus({
    memberId: MEMBER, workRef: work.manuscriptId, scopeKind: 'passage', range: { start, end } });
  w('passage without a locator cannot be assembled', noLocator === null);

  console.log(`\n${pass} passed · ${fail} failed`);
  await query(`DROP TABLE manuscript_draft_sections, manuscript_working_drafts, manuscript_sections, member_manuscripts`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(err => { console.error('witness failed:', err); process.exit(1); });
