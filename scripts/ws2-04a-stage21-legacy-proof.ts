/**
 * WS2-04A STAGE 2.1 — LEGACY COMPOSER PROOF. READ ONLY.
 *
 * Stage 2 observed that every changed line fell on what it *believed* was a
 * heading, each ~2 characters longer, and concluded "systematic composition
 * difference". That was pattern recognition, and its heading test was weak:
 * it called every non-empty section-start line a heading, which misreads a
 * headingless section's first body line.
 *
 * Stage 2.1 replaces the inference with the known historical transform.
 * Repository history establishes it exactly: before 5f50f6790 (2026-08-05)
 * the draft route composed with `assembleManuscriptMarkdown`, which writes a
 * heading as `# ` + heading; that commit replaced it with `composeDraftText`,
 * which writes the heading as a plain line. The assembler's body has been
 * byte-identical since be2927c2f (2026-07-26), earlier than any draft founded
 * on Jul 30 — so today's function is the historical composer, not a copy.
 *
 * So this does not ask "is the difference regular?". It asks, per line:
 *
 *     currentDraftLine === "# " + sourceHeadingLine
 *
 * Heading status comes from manuscript_sections.heading, carried through the
 * composer itself — never guessed from a line's position or contents. Any
 * changed BODY line is counted separately and is disqualifying on its own.
 *
 * Only WHOLE-DRAFT byte equality promotes a draft into a composer class. The
 * per-line pass explains why a draft matches; it never gets to elect one. A
 * draft with some headings in the legacy form and some in the current form is
 * a partially edited draft — no composer emitted that hybrid — and calling it
 * a composer variant would discard a member's edits as scaffolding.
 *
 * Structural facts only. No member prose is printed.
 *
 * Run: npx tsx scripts/ws2-04a-stage21-legacy-proof.ts <manuscript-id>
 */

import { query } from '../lib/db/postgres';
import { type SourceSection } from '../lib/manuscript/sections/composers';
import { classifyDraft } from '../lib/manuscript/sections/draftProof';

async function main() {
  const id = process.argv[2];
  if (!id) { console.error('usage: npx tsx scripts/ws2-04a-stage21-legacy-proof.ts <manuscript-id>'); process.exit(1); }

  const secs = await query<SourceSection>(
    `SELECT heading, body FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position ASC`,
    [id],
  );
  const dr = await query<{ content: string }>(
    `SELECT content FROM manuscript_working_drafts WHERE manuscript_id = $1`, [id],
  );
  if (secs.rows.length === 0) { console.error('no sections'); process.exit(1); }
  if (dr.rows.length === 0) { console.error('no working draft'); process.exit(1); }

  const sections = secs.rows;
  const current = dr.rows[0].content;

  const { classification, wholeText, proof, perLineAgrees } = classifyDraft(sections, current);
  const { headedCount, exactLegacy, otherHeadingDiff, bodyDiff, resolved, boundaries, unresolved } = proof;

  console.log(`\nWS2-04A STAGE 2.1 — LEGACY COMPOSER PROOF — ${id}\n`);
  console.log('  whole-draft byte equality');
  console.log(`    current              ${wholeText.current ? 'EXACT MATCH' : 'differs'}`);
  console.log(`    legacy(# headings)   ${wholeText.legacy ? 'EXACT MATCH' : 'differs'}`);
  console.log('');

  console.log('  structural facts');
  console.log(`    sections                    ${sections.length}`);
  console.log(`    headed sections             ${headedCount}`);
  console.log(`    exact legacy "# " matches   ${exactLegacy}`);
  console.log(`    other heading differences   ${otherHeadingDiff}`);
  console.log(`    body differences            ${bodyDiff}`);
  console.log(`    boundaries resolved         ${resolved}/${boundaries}`);
  console.log('');

  /* Report the verdict. The RULE lives in scripts/lib/draftProof.ts and is
     shared with the census, so the two instruments cannot drift apart. */
  if (classification === 'PRISTINE') {
    console.log('  CLASSIFICATION: PRISTINE');
    console.log("    The draft is byte-for-byte the current composer's output.");
  } else if (classification === 'LEGACY_COMPOSER_VARIANT') {
    console.log('  CLASSIFICATION: LEGACY_COMPOSER_VARIANT');
    console.log('    whole draft byte-identical to assembleManuscriptMarkdown');
    console.log(`    ${exactLegacy}/${headedCount} heading differences are exactly the historical "# " form`);
    console.log('    0 body differences');
    console.log(`    ${resolved}/${boundaries} boundaries resolved`);
    console.log('');
    console.log('    This draft was composed before 5f50f6790 and has not been edited.');
    console.log('    No Structure Adoption review is owed the writer: there is nothing');
    console.log('    of theirs to review. It seeds byte-exactly, WITH its scaffolding.');
    console.log('');
    console.log('    Removing the "# " is NOT part of conversion and cannot be: it');
    console.log('    changes the draft\'s bytes, and conversion promises they are');
    console.log('    unchanged. Normalisation is a separate transform with its own');
    console.log('    proof — and until it runs, a writer opening this draft sees the');
    console.log('    scaffolding in their prose, which is what the 2026-08-05 persona');
    console.log('    walk objected to. That is a WS2-04B question, not a 04A one.');
  } else if (classification === 'WITHHELD') {
    console.log('  CLASSIFICATION: WITHHELD — instruments disagree');
    console.log('    The whole draft IS byte-identical to the legacy composer, but the');
    console.log('    per-line pass does not account for every difference:');
    console.log(`      exact legacy "# " matches   ${exactLegacy} (expected ${headedCount})`);
    console.log(`      other heading differences   ${otherHeadingDiff} (expected 0)`);
    console.log(`      body differences            ${bodyDiff} (expected 0)`);
    console.log(`      boundaries resolved         ${resolved}/${boundaries}`);
    console.log('');
    console.log('    Fix the line pass before classifying this manuscript. Do not');
    console.log('    migrate on a result the instrument cannot fully explain.');
  } else if (classification === 'NO_SOURCE') {
    console.log('  CLASSIFICATION: NO_SOURCE');
    console.log('    No source sections: this draft was never composed from a Source.');
    console.log('    A blank page someone started writing on. Nothing to seed FROM.');
  } else {
    console.log('  CLASSIFICATION: EDITED');
    console.log('    The draft matches no composer that ever ran:');
    console.log(`      ${otherHeadingDiff} heading difference(s) not in the historical "# " form`);
    console.log(`      ${bodyDiff} body line(s) differ`);
    if (unresolved.length) console.log(`      ${unresolved.length} boundary/boundaries do not map uniquely`);
    if (exactLegacy > 0 && exactLegacy < headedCount) {
      console.log('');
      console.log(`    ${exactLegacy} of ${headedCount} headings ARE in the legacy form and the rest are not.`);
      console.log('    A hybrid is not a composer — no composer emitted both. This is a');
      console.log('    partially edited draft, and the legacy-looking part of it is not');
      console.log('    licence to normalize the rest away.');
    }
    console.log('');
    console.log('    Not attributable to a composer change. Member content is at stake.');
  }
  void perLineAgrees;
  console.log('');
  console.log('  Exact equality only. No heading search, no similarity, no model.');
  console.log('  READ ONLY — nothing was written.\n');
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => { console.error('stage 2.1 failed:', e?.message ?? e); process.exit(1); });
}
