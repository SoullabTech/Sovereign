/**
 * FOCUS-W4 — one read-only confirmation of the FROZEN passage anchors.
 *
 * ⭐⭐ WHAT THIS PINS, AND WHY IT IS WORTH A SEPARATE RUN.
 *
 * FOCUS-W3 established that developmental passage offsets are STORED-section
 * coordinates and were being applied to the PROJECTED body. The repair refuses
 * an anchor that translates below zero (`range_precedes_body`) rather than
 * clamping it. §56's measured prefix is 23 and its anchor is believed to begin
 * at 22 — one code point inside the separator — which would make it
 * unprojectable even though the section is untouched.
 *
 *   "believed to begin at 22" is exactly what this script exists to remove.
 *
 * The numbers in the session record came from a reconstruction. This reads them
 * from `developmental_readings.observations` at their SOURCE, so the new Act 3
 * acceptance criteria rest on the frozen evidence rather than on a remembered
 * table.
 *
 * ── ⛔ WHAT IT MAY NOT DO ──────────────────────────────────────────────────
 *
 * ⛔ READ-ONLY. Every statement is a SELECT. It mints no act, no receipt and no
 * consent row; it calls no model; it opens no crossing. Running it does not
 * spend the witness and does not change what the witness will find.
 *
 * ⛔ NO MEMBER PROSE IS PRINTED. Section ids, code-point lengths, booleans and
 * refusal names only. Not one character of the manuscript reaches stdout — a
 * provenance check that pastes the writer's prose into a terminal transcript
 * has created a second copy of the Work in a place with its own retention
 * answer, which is the whole reason the door carries identities and not text.
 *
 * ⭐ IT ASKS THE RUNTIME, NOT A COPY OF IT. The verdict comes from
 * `resolveFocusPassage` — the same function the preflight and the Ask consume.
 * A confirmation that re-implemented the translation could agree with itself
 * and disagree with the server, which is precisely the class of defect
 * FOCUS-W3 was.
 *
 * ── RUN ────────────────────────────────────────────────────────────────────
 *
 *   DATABASE_URL=postgresql://... npx tsx scripts/witness/focus-w4-frozen-anchor-confirm.ts \
 *     --work <manuscriptId> --reading <readingId> --member <memberId> --observation o1
 *
 * ⛔ Point it at the local or disposable database. It needs no credential of any
 * other kind: there is no model call here.
 */

import { loadFrozenDevelopmentalReading } from '@/lib/manuscript/ask/frozenDevelopmentalReading';
import { focusAnchorsFor } from '@/lib/writersStudio/focusAnchors';
import { resolveFocusPassage } from '@/lib/writers-studio/focusPassage';
import { loadEditableSections, splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import { codePointLength } from '@/lib/manuscript/draftSections';
import { sha256 } from '@/lib/manuscript/development/readState';

const arg = (name: string): string | null => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
};

const need = (name: string): string => {
  const v = arg(name);
  if (!v) { console.error(`missing --${name}`); process.exit(2); }
  return v!;
};

async function main() {
  const workRef = need('work');
  const readingId = need('reading');
  const memberId = need('member');
  const observationKey = arg('observation') ?? 'o1';

  const reading = await loadFrozenDevelopmentalReading(workRef, readingId, memberId);
  if (!reading) {
    /* ⛔ Null does not distinguish "absent" from "not yours", by design in the
       loader. This check does not invent the distinction either. */
    console.log('READING  not found, or not this member\'s');
    process.exit(1);
  }

  const observation = reading.observations.find((o) => o.key === observationKey);
  if (!observation) {
    console.log(`OBSERVATION  ${observationKey} is not in this reading`);
    process.exit(1);
  }

  const anchors = focusAnchorsFor(observation.evidenceRefs);
  console.log(`READING      ${readingId}`);
  console.log(`REVISION     ${reading.readState.revisionNumber}  (what MAIA read)`);
  console.log(`OBSERVATION  ${observationKey}  ·  ${anchors.length} anchor(s) declared`);
  console.log('');

  /**
   * ⭐⭐ THE AUTHORITATIVE CURRENT-DRAFT SEAM, NOT A SECOND COPY OF IT.
   *
   * ⛔ FOUNDER FINDING, 2026-09-12 — this instrument's first version FAILED
   * here, and failed instructively. It issued its own SELECT over
   * `manuscript_draft_sections JOIN manuscript_working_drafts JOIN manuscripts`
   * and asked for `s.heading`. Three things were wrong at once: there is no
   * `manuscripts` table, `manuscript_draft_sections` has no `heading` column
   * (the heading lives on the Source row, reached through `source_section_id`),
   * and ownership is `manuscript_working_drafts.member_id`.
   *
   * But the SQL being wrong is the small half. The large half:
   *
   *   If an authoritative read seam already exists, a witness that
   *   reimplements the read is itself a new source of disagreement.
   *
   * `loadEditableSections` already owns the member-scoped current-draft read
   * and the Source-heading join, and Canvas, the preflight and the Ask all go
   * through it. A confirmation reading the Work by another path could agree
   * with itself and disagree with the server — the same class as FOCUS-W3, and
   * the same class as re-deriving the geometry here would have been. The repair
   * is therefore not better SQL. It is no SQL.
   *
   * ⛔ Only the anchored sections are loaded — the confirmation reads exactly
   * the places the observation cited, never the whole Work.
   */
  const anchorIds = [...new Set(anchors.map((a) => a.sectionId))];
  const draft = await loadEditableSections(workRef, memberId, anchorIds);
  const live = new Map(draft.sections.map((s) => [s.id, s]));
  console.log(`DRAFT        ${draft.draftId}  ·  version ${draft.version}`);
  console.log(`SECTIONS     ${live.size} of ${anchorIds.length} anchored section(s) present`);
  console.log('');

  for (const a of anchors) {
    const row = live.get(a.sectionId);
    const short = a.sectionId.slice(0, 8);

    if (!row) { console.log(`${short}  ${a.kind.padEnd(7)}  SECTION NOT IN THE CURRENT DRAFT`); continue; }

    /* ⭐ `position` is 0-indexed, so the writer's "§45" is position 44. Printed
       as the writer names it, because a confirmation whose section labels do
       not match how the founder reads them invites exactly the off-by-one this
       lane has already spent an afternoon on. */
    const asWritten = `§${row.position + 1}`;

    const split = splitStoredSection(row.storedText, row.heading);
    const storedCp = codePointLength(row.storedText);
    const prefixCp = split ? codePointLength(split.headingPrefix) : null;
    const bodyCp = split ? codePointLength(split.body) : null;
    const frozen = reading.readState.sections[a.sectionId];
    const unchanged = frozen ? sha256(row.storedText) === frozen.digest : null;

    if (a.kind === 'section') {
      console.log(`${short}  ${asWritten}  section  whole  ·  stored ${storedCp}  ·  digest ${unchanged === null ? 'no frozen state' : unchanged ? 'unchanged' : 'CHANGED'}`);
      continue;
    }

    const r = resolveFocusPassage({ storedText: row.storedText, heading: row.heading, range: a.range });
    const translated = prefixCp === null ? null
      : `${a.range.start - prefixCp}–${a.range.end - prefixCp}`;

    console.log(
      `${short}  ${asWritten}  passage  ${a.range.space}  ${a.range.start}–${a.range.end}\n`
      + `          stored ${storedCp} · prefix ${prefixCp ?? '—'} · body ${bodyCp ?? '—'}\n`
      + `          translated ${translated ?? '—'}  →  ${r.ok ? 'PROJECTABLE' : `REFUSED · ${r.refusal}`}\n`
      + `          digest ${unchanged === null ? 'no frozen state' : unchanged ? 'unchanged' : 'CHANGED'}`,
    );
    if (!r.ok && r.refusal === 'range_precedes_body') {
      console.log('          ⭐ FOCUS-W4 · this anchor begins inside the heading prefix.');
      console.log('             It is refused, not nudged. Expected currency: needs_confirmation.');
    }
    console.log('');
  }

  /**
   * ⭐ The summary the witness criteria rest on — each anchor counted for the
   * reason that actually applies to it.
   *
   * ⛔ A whole-section anchor is NOT assumed readable. Its section can have
   * left the Work, and a summary that folded that case into "sections are
   * always fine" would predict a count the server will not produce.
   */
  let readable = 0;
  const refusals: string[] = [];
  for (const a of anchors) {
    const row = live.get(a.sectionId);
    if (!row) { refusals.push(`${a.sectionId.slice(0, 8)} section absent`); continue; }
    const label = `§${row.position + 1}`;
    if (a.kind === 'section') { readable += 1; continue; }
    const r = resolveFocusPassage({ storedText: row.storedText, heading: row.heading, range: a.range });
    if (r.ok) readable += 1;
    else refusals.push(`${label} ${r.refusal}`);
  }
  console.log(`DECLARED           ${anchors.length}`);
  console.log(`EXPECTED READABLE  ${readable} of ${anchors.length}`);
  for (const r of refusals) console.log(`  withheld · ${r}`);
  console.log('');
  console.log('⛔ This is a measurement of the Work as it is now. The live server');
  console.log('   preflight gets the final word at witness time.');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
