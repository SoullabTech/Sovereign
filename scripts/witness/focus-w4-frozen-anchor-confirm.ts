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

import { query } from '@/lib/db/postgres';
import { loadFrozenDevelopmentalReading } from '@/lib/manuscript/ask/frozenDevelopmentalReading';
import { focusAnchorsFor } from '@/lib/writersStudio/focusAnchors';
import { resolveFocusPassage } from '@/lib/writers-studio/focusPassage';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
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

  /* ⭐ The CURRENT Working Draft, by the same ownership the Canvas renders it
     under. Read here only to measure — nothing is returned to anyone. */
  const rows = await query<{ id: string; heading: string | null; text: string }>(
    `SELECT s.id, s.heading, s.text
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN manuscripts m ON m.id = d.manuscript_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2`,
    [workRef, memberId],
  );
  const live = new Map(rows.rows.map((r) => [r.id, r]));

  for (const a of anchors) {
    const row = live.get(a.sectionId);
    const short = a.sectionId.slice(0, 8);

    if (!row) { console.log(`${short}  ${a.kind.padEnd(7)}  SECTION NOT IN THE CURRENT DRAFT`); continue; }

    const split = splitStoredSection(row.text, row.heading);
    const storedCp = codePointLength(row.text);
    const prefixCp = split ? codePointLength(split.headingPrefix) : null;
    const bodyCp = split ? codePointLength(split.body) : null;
    const frozen = reading.readState.sections[a.sectionId];
    const unchanged = frozen ? sha256(row.text) === frozen.digest : null;

    if (a.kind === 'section') {
      console.log(`${short}  section  whole  ·  stored ${storedCp}  ·  digest ${unchanged === null ? 'no frozen state' : unchanged ? 'unchanged' : 'CHANGED'}`);
      continue;
    }

    const r = resolveFocusPassage({ storedText: row.text, heading: row.heading, range: a.range });
    const translated = prefixCp === null ? null
      : `${a.range.start - prefixCp}–${a.range.end - prefixCp}`;

    console.log(
      `${short}  passage  ${a.range.space}  ${a.range.start}–${a.range.end}\n`
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
    if (a.kind === 'section') { readable += 1; continue; }
    const r = resolveFocusPassage({ storedText: row.text, heading: row.heading, range: a.range });
    if (r.ok) readable += 1;
    else refusals.push(`${a.sectionId.slice(0, 8)} ${r.refusal}`);
  }
  console.log(`DECLARED           ${anchors.length}`);
  console.log(`EXPECTED READABLE  ${readable} of ${anchors.length}`);
  for (const r of refusals) console.log(`  withheld · ${r}`);
  console.log('');
  console.log('⛔ This is a measurement of the Work as it is now. The live server');
  console.log('   preflight gets the final word at witness time.');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
