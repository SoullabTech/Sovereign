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
import { diff, type Op } from './lib/myers';
import { composeCurrent, composeLegacyHashHeadings, type SourceSection } from './lib/composers';

/**
 * The current composer, instrumented to report — from inside the composition,
 * not from inspecting the output — which line index carries each section's
 * heading and where each section boundary falls.
 */
export function composeCurrentWithMarks(sections: SourceSection[]) {
  const lines: string[] = [];
  /** line index of section i's heading line, or null when the section has none */
  const headingLineOf: (number | null)[] = [];
  /** line index where section i begins */
  const boundaryLineOf: number[] = [];

  for (const s of sections) {
    boundaryLineOf.push(lines.length);
    const h = s.heading?.trim();
    if (h) {
      headingLineOf.push(lines.length);
      lines.push(h);
      lines.push('');
    } else {
      headingLineOf.push(null);
    }
    lines.push(...s.body.split('\n'));
    lines.push('');
  }
  return { lines, headingLineOf, boundaryLineOf };
}

export interface LineProof {
  headedCount: number;
  exactLegacy: number;
  otherHeadingDiff: number;
  bodyDiff: number;
  resolved: number;
  boundaries: number;
  unresolved: number[];
}

/**
 * The per-line pass, over an already-composed pair of texts. Extracted so it
 * can be exercised on synthetic manuscripts without a database — an
 * instrument that has never been run against a known answer is not evidence.
 */
export function proveLines(
  aLines: string[],
  bLines: string[],
  headingLineOf: (number | null)[],
  boundaryLineOf: number[],
): LineProof {
  const headedCount = headingLineOf.filter((l) => l !== null).length;
  const headingLineSet = new Map<number, number>(); // source line -> section index
  headingLineOf.forEach((l, i) => { if (l !== null) headingLineSet.set(l, i); });

  /* ── Per-line proof against the current composer. Every difference must be
     accounted for by the known historical transform, or it is a real edit. */
  const ops = diff(aLines, bLines);

  let exactLegacy = 0;          // heading line, current === "# " + source
  let otherHeadingDiff = 0;     // heading line, but NOT the legacy form
  let bodyDiff = 0;             // any changed line that is not a heading line
  const changedHeadingSections = new Set<number>();

  /* Walk the ops. A heading rewritten in place shows as a deletion run
     immediately followed by an insertion run; the k-th deleted line and the
     k-th inserted line are the same line before and after. Any surplus on
     either side is text that appeared or vanished outright. */
  for (let i = 0; i < ops.length; i++) {
    const o = ops[i];
    if (o.type === 'eq') continue;

    const del = o.type === 'del' ? o : null;
    const next = ops[i + 1];
    const ins = o.type === 'ins'
      ? o
      : (next && next.type === 'ins' ? next : null);
    if (del && ins) i++; // the paired insertion is consumed here

    const dCount = del ? del.aEnd - del.aStart : 0;
    const iCount = ins ? ins.bEnd - ins.bStart : 0;
    const paired = Math.min(dCount, iCount);

    for (let k = 0; k < paired; k++) {
      const aLine = del!.aStart + k;
      const bLine = ins!.bStart + k;
      const sectionIdx = headingLineSet.get(aLine);
      if (sectionIdx === undefined) { bodyDiff++; continue; }
      changedHeadingSections.add(sectionIdx);
      if (bLines[bLine] === `# ${aLines[aLine]}`) exactLegacy++;
      else otherHeadingDiff++;
    }
    for (let k = paired; k < dCount; k++) {
      const aLine = del!.aStart + k;
      if (headingLineSet.has(aLine)) otherHeadingDiff++; else bodyDiff++;
    }
    bodyDiff += Math.max(0, iCount - paired);
  }

  /* ── Boundary resolution. A boundary is uniquely located when its source
     line sits in an unchanged run, or is a heading line rewritten 1:1 between
     two unchanged runs — in both cases exactly one position corresponds. */
  const eqRuns = ops.filter((o): o is Extract<Op, { type: 'eq' }> => o.type === 'eq');
  const inEq = (aLine: number) => eqRuns.some((r) => aLine >= r.aStart && aLine < r.aEnd);
  let resolved = 0;
  const unresolved: number[] = [];
  boundaryLineOf.forEach((aLine, i) => {
    const headingLine = headingLineOf[i];
    if (inEq(aLine)) { resolved++; return; }
    /* the section's first line changed — resolved iff it is its own heading
       line and that heading is accounted for by the legacy transform */
    if (headingLine === aLine && changedHeadingSections.has(i) && otherHeadingDiff === 0) { resolved++; return; }
    unresolved.push(i);
  });

  return { headedCount, exactLegacy, otherHeadingDiff, bodyDiff, resolved, boundaries: boundaryLineOf.length, unresolved };
}

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
  const { lines: aLines, headingLineOf, boundaryLineOf } = composeCurrentWithMarks(sections);
  const bLines = current.split('\n');

  /* Self-check before any claim is made: every line this instrument calls a
     heading must literally hold that section's heading. The whole proof rests
     on heading identity coming from manuscript_sections rather than from a
     line's position, so the mapping is verified, not assumed. */
  headingLineOf.forEach((line, i) => {
    const h = sections[i].heading?.trim();
    if (line === null) { if (h) { console.error(`section ${i} has a heading but no heading line`); process.exit(1); } return; }
    if (aLines[line] !== h) { console.error(`heading line accounting drifted at section ${i}`); process.exit(1); }
  });

  console.log(`\nWS2-04A STAGE 2.1 — LEGACY COMPOSER PROOF — ${id}\n`);

  /* ── The decisive test, before any diff: whole-text equality against each
     named composer. A draft either IS one composer's output or it is not. */
  const wholeText: Record<string, boolean> = {
    'current': composeCurrent(sections) === current,
    'legacy(# headings)': composeLegacyHashHeadings(sections) === current,
  };
  console.log('  whole-draft byte equality');
  for (const [name, eq] of Object.entries(wholeText)) {
    console.log(`    ${name.padEnd(20)} ${eq ? 'EXACT MATCH' : 'differs'}`);
  }
  console.log('');

  const { headedCount, exactLegacy, otherHeadingDiff, bodyDiff, resolved, unresolved } =
    proveLines(aLines, bLines, headingLineOf, boundaryLineOf);

  console.log('  structural facts');
  console.log(`    sections                    ${sections.length}`);
  console.log(`    headed sections             ${headedCount}`);
  console.log(`    exact legacy "# " matches   ${exactLegacy}`);
  console.log(`    other heading differences   ${otherHeadingDiff}`);
  console.log(`    body differences            ${bodyDiff}`);
  console.log(`    boundaries resolved         ${resolved}/${boundaryLineOf.length}`);
  console.log('');

  /* ── Classification.
     WHOLE-DRAFT EQUALITY IS THE ONLY PROMOTING EVIDENCE. The per-line
     analysis explains WHY a draft matches; it may never promote one into a
     historical-composer class on its own.

     The case that forced this: a draft with some headings in the legacy "# "
     form and some in the current plain form, body untouched, boundaries all
     resolvable. No composer that ever ran produced that hybrid — it is a
     partially edited draft — yet a predicate satisfied by "every difference
     I can see is legacy-shaped" would have called it LEGACY_COMPOSER_VARIANT
     and mechanically discarded a member's edits as scaffolding.

     So: a draft is the legacy composer's output or it is not. */
  const legacyWholeDraft = wholeText['legacy(# headings)'] === true;

  /* Independent per-line corroboration. Not evidence for the class — a check
     that the two instruments tell the same story. */
  const perLineAgrees =
    exactLegacy === headedCount &&
    otherHeadingDiff === 0 &&
    bodyDiff === 0 &&
    resolved === boundaryLineOf.length;

  const isLegacy = legacyWholeDraft && perLineAgrees;

  if (wholeText['current']) {
    console.log('  CLASSIFICATION: PRISTINE');
    console.log("    The draft is byte-for-byte the current composer's output.");
  } else if (isLegacy) {
    console.log('  CLASSIFICATION: LEGACY_COMPOSER_VARIANT');
    console.log('    whole draft byte-identical to assembleManuscriptMarkdown');
    console.log(`    ${exactLegacy}/${headedCount} heading differences are exactly the historical "# " form`);
    console.log('    0 body differences');
    console.log(`    ${resolved}/${boundaryLineOf.length} boundaries resolved`);
    console.log('');
    console.log('    This draft was composed before 5f50f6790 and has not been edited.');
    console.log('    No Structure Adoption review is owed the writer: there is nothing');
    console.log('    of theirs to review. The obsolete "# " scaffold can be removed');
    console.log('    mechanically, preserving every member-authored body character.');
  } else if (legacyWholeDraft) {
    /* The decisive test passed and the corroborating one did not. That is a
       fault in this instrument, not a finding about the book, and it must not
       resolve into either class by default. */
    console.log('  CLASSIFICATION: WITHHELD — instruments disagree');
    console.log('    The whole draft IS byte-identical to the legacy composer, but the');
    console.log('    per-line pass does not account for every difference:');
    console.log(`      exact legacy "# " matches   ${exactLegacy} (expected ${headedCount})`);
    console.log(`      other heading differences   ${otherHeadingDiff} (expected 0)`);
    console.log(`      body differences            ${bodyDiff} (expected 0)`);
    console.log(`      boundaries resolved         ${resolved}/${boundaryLineOf.length}`);
    console.log('');
    console.log('    Fix the line pass before classifying this manuscript. Do not');
    console.log('    migrate on a result the instrument cannot fully explain.');
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
  console.log('');
  console.log('  Exact equality only. No heading search, no similarity, no model.');
  console.log('  READ ONLY — nothing was written.\n');
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => { console.error('stage 2.1 failed:', e?.message ?? e); process.exit(1); });
}
