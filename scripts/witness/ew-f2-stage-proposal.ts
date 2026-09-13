/**
 * EW-F2 · STEP 2 — stage ONE fresh proposal for the runtime witness.
 *
 * ⛔ WITNESS DATABASE ONLY. This refuses to run unless DATABASE_URL names a
 * database whose name contains `witness`. Production and `maia_consciousness`
 * cannot be reached by it even by mistake.
 *
 * ⭐⭐ TWO PHASES, BECAUSE THE PASSAGE IS A DELIBERATE CHOICE.
 *
 *   --inspect            print the target's PROJECTED body and stop
 *   --create --text "…"  create one proposal to remove exactly that text
 *
 * ⛔ THIS SCRIPT NEVER CHOOSES THE PASSAGE. An instrument that picks "some
 * unique string" and calls the result an editorial recommendation has invented
 * the one thing the witness is not testing. The founder's constraint, kept
 * structural: there is no code path here that selects text.
 *
 * ⛔ AND IT PRINTS BEFORE IT WRITES. The exact passage, its occurrence count in
 * the projected body, the base version and the target are all on screen before
 * the INSERT runs.
 *
 * WHAT IT IS NOT. Staging against v35 records which Work state the proposal was
 * built against. It does not ratify v35; that ruling stays separate.
 * It touches no standing chain, no decision chain, no other proposal, and
 * NOTHING in the manuscript.
 */
import { query } from '@/lib/db/postgres';
import { proposeRevision } from '@/lib/manuscript/revisionProposal/store';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';

const MANUSCRIPT = 'a3ae67fd-a21e-4948-8766-4c397d2e4712';
const TARGET_POSITION = 22;                      // §23 — position is 0-indexed

function arg(name: string): string | null {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
const has = (f: string) => process.argv.includes(f);

async function main() {
  const url = process.env.DATABASE_URL ?? '';
  if (!/witness/i.test(url)) {
    console.error('REFUSED · DATABASE_URL does not name a witness database.');
    console.error('  This script writes a row. It runs nowhere else.');
    process.exit(2);
  }

  const d = await query<{ id: string; version: string; member_id: string }>(
    `SELECT id, version, member_id FROM manuscript_working_drafts
      WHERE manuscript_id = $1 ORDER BY created_at DESC LIMIT 1`, [MANUSCRIPT]);
  if (d.rows.length === 0) { console.error('no working draft'); process.exit(2); }
  const draft = d.rows[0];

  const s = await query<{ id: string; text: string; heading: string | null }>(
    `SELECT s.id, s.text, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.draft_id = $1 AND s.position = $2`, [draft.id, TARGET_POSITION]);
  if (s.rows.length === 0) { console.error('no section at that position'); process.exit(2); }
  const section = s.rows[0];

  /* ⛔ THE PROJECTED BODY IS THE COORDINATE SPACE THE GUARD USES. Counting
     occurrences in the STORED text would count a heading the guard never
     sees — FOCUS-W3's exact shape, in the instrument this time. */
  const split = splitStoredSection(section.text, section.heading);
  if (!split) { console.error('section is not projectable'); process.exit(2); }

  console.log('── target ───────────────────────────────────────────────');
  console.log('manuscript      ', MANUSCRIPT);
  console.log('draft           ', draft.id);
  console.log('base version    ', draft.version);
  console.log('section         ', section.id, `· position ${TARGET_POSITION} · §${TARGET_POSITION + 1}`);
  console.log('heading         ', JSON.stringify(section.heading));
  console.log('projected body  ', `${[...split.body].length} code points`);

  const text = arg('--text');

  if (has('--inspect') || !text) {
    console.log('\n── projected body, verbatim ─────────────────────────────');
    console.log(split.body);
    console.log('\n── next ─────────────────────────────────────────────────');
    console.log('Choose a passage deliberately, then rerun with:');
    console.log('  --create --text "<the exact passage>"');
    console.log('\nNOTHING WAS WRITTEN.');
    return;
  }

  const occurrences = split.body.split(text).length - 1;
  console.log('\n── proposed removal ─────────────────────────────────────');
  console.log('expected_text   ', JSON.stringify(text));
  console.log('code points     ', [...text].length);
  console.log('occurrences     ', occurrences);

  if (occurrences !== 1) {
    console.error('\nREFUSED · the guard requires EXACTLY ONE occurrence.');
    console.error('NOTHING WAS WRITTEN.');
    process.exit(1);
  }

  /* ⛔ ONE LIVE PROPOSAL. A second open proposal against the same state would
     make the witness ambiguous about which one the room resolved. */
  const live = await query<{ id: string }>(
    `SELECT id FROM manuscript_revision_proposals
      WHERE draft_id = $1 AND accepted_at IS NULL AND base_version = $2`,
    [draft.id, Number(draft.version)]);
  if (live.rows.length > 0) {
    console.error(`\nREFUSED · a live proposal against v${draft.version} already exists:`);
    for (const r of live.rows) console.error('  ', r.id);
    console.error('NOTHING WAS WRITTEN.');
    process.exit(1);
  }

  if (!has('--create')) {
    console.log('\nDry run. Add --create to write the row.');
    console.log('NOTHING WAS WRITTEN.');
    return;
  }

  const proposal = await proposeRevision(draft.member_id, {
    workId: MANUSCRIPT,
    draftId: draft.id,
    baseVersion: Number(draft.version),
    targetSectionId: section.id,
    expectedText: text,
    /* ⛔ delete_exact_text. The vocabulary opens at step 4, not here. */
    replacementText: '',
  });

  console.log('\n── created ──────────────────────────────────────────────');
  console.log('proposal        ', proposal.id);
  console.log('base version    ', proposal.baseVersion);
  console.log('accepted_at     ', proposal.acceptedAt);
  console.log('\nOpen, and DO NOT ACCEPT:');
  console.log(`  http://localhost:3100/writers-studio/canvas?m=${MANUSCRIPT}&proposal=${proposal.id}`);
  console.log('\nThe manuscript is unchanged. Version is still', draft.version);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
