/**
 * FOCUS WITNESS · seed one addressable Work into a LOCAL/DISPOSABLE database.
 *
 *   ⭐⭐ The witness database is local or disposable. NEVER production.
 *       No production action is licensed by a missing local fixture.
 *
 * Prepares the substrate the held Focus walk needs, without member data:
 * one member, one Work, one section-addressable working draft, three draft
 * sections of structurally representative authored text.
 *
 *   DATABASE_URL=postgres://…/<disposable> npx tsx scripts/witness/seed-focus-witness-work.ts
 *
 * ⛔ REFUSES TO RUN AGAINST A DATABASE THAT ALREADY HOLDS MEMBER WORKS. That is a
 * structural guard, not a hostname heuristic: production holds 13 manuscripts, so
 * this script cannot seed it even if DATABASE_URL is pointed there by mistake.
 * A disposable witness database holds none.
 *
 * ⛔ Run `npm run db:bootstrap && npm run db:migrate` first — this seeds data, it
 * does not build schema. The schema must descend from repository truth.
 */

import { query } from '../../lib/db/postgres';

const MEMBER = '3f3f3f3f-0000-4000-8000-000000000001';

/**
 * ⭐ Structurally representative, NOT member data. Each section carries one of the
 * exact hazards the repaired assembler must survive:
 *
 *   S1  ends in an AUTHORED TRAILING BLANK LINE — indistinguishable from a
 *       manufactured `\n\n` if the assembler ever synthesizes one (01B).
 *   S2  ordinary prose, so section order is observable.
 *   S3  a NON-BMP character before the selection point — UTF-16 code units and
 *       code points diverge here (01A offsets).
 */
const SECTIONS = [
  'The keeper stopped counting the ships. That was the first change, and he did not notice it for a season.\n\n',
  'Later he would say the lamp had never been the point, though he could not have said so then.',
  '🌊 The tide came in and the sentence changed, which is the only kind of ending he trusted.',
];

async function main() {
  // ── the structural refusal
  const works = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM member_manuscripts WHERE member_id <> $1`, [MEMBER]);
  if (Number(works.rows[0].n) > 0) {
    console.error(
      `\n⛔ REFUSED — this database already holds ${works.rows[0].n} member Work(s).\n` +
      '   A witness database holds none. This looks like a real database, and the\n' +
      '   walk must never write its consent rows, receipts or turns into one.\n' +
      '   Point DATABASE_URL at a disposable database and run db:bootstrap + db:migrate.\n');
    process.exit(1);
  }

  await query(
    `INSERT INTO members (id, passkey, username, password_hash)
     VALUES ($1,'WITNESS-FOCUS-WALK','witness_focus_walk','x')
     ON CONFLICT (id) DO NOTHING`, [MEMBER]);

  const m = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title)
     VALUES ($1,'Witness Work — not member data') RETURNING id`, [MEMBER]);
  const workRef = m.rows[0].id;

  // Created un-addressable, sections written, THEN flattened and made addressable
  // in one step — `manuscript_working_drafts_round_trip()` requires content to
  // equal `string_agg(text, '' ORDER BY position)` the moment the gate is set.
  const d = await query<{ id: string }>(
    `INSERT INTO manuscript_working_drafts (manuscript_id, member_id, content, base_source_hash)
     VALUES ($1,$2,'','witness') RETURNING id`, [workRef, MEMBER]);
  const draftId = d.rows[0].id;

  const sectionIds: string[] = [];
  for (const [i, text] of SECTIONS.entries()) {
    const s = await query<{ id: string }>(
      `INSERT INTO manuscript_draft_sections (draft_id, position, text)
       VALUES ($1,$2,$3) RETURNING id`, [draftId, i, text]);
    sectionIds.push(s.rows[0].id);
  }

  await query(
    `UPDATE manuscript_working_drafts d
        SET content = (SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '')
                         FROM manuscript_draft_sections s WHERE s.draft_id = d.id),
            section_addressable_at = NOW()
      WHERE d.id = $1`, [draftId]);

  // The offsets a textarea would report for a selection AFTER the non-BMP char.
  const emoji = SECTIONS[2];
  const start = emoji.indexOf('tide came in');
  const end = start + 'tide came in'.length;

  console.log(`
✅ witness Work seeded (local/disposable database)

  memberId        ${MEMBER}
  workRef         ${workRef}
  draftId         ${draftId}
  sections        ${sectionIds.join('\n                  ')}

  passage fixture — section 3, UTF-16 offsets as a textarea reports them
    sectionRef    ${sectionIds[2]}
    range         { start: ${start}, end: ${end} }
    expects       "tide came in"

⛔ Not member data. Structurally representative only: an authored trailing blank
   line (01B), observable section order, and a non-BMP character before the
   selection point (01A).
`);
  process.exit(0);
}

main().catch(err => { console.error('seed failed:', err); process.exit(1); });
