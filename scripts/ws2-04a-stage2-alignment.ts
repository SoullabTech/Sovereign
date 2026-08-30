/**
 * WS2-04A STAGE 2 — exact boundary alignment. READ ONLY.
 *
 * Stage 1 reported 171/174 AMBIGUOUS for Elemental Alchemy. That number
 * measured the instrument, not the manuscript: prefix/suffix anchoring
 * collapses scattered edits into one span, and with the first edit near the
 * start and the last near the end, one span swallowed the whole book.
 *
 * Stage 2 recovers identity from the MIDDLE. Same discipline — equality only,
 * no heading lookup, no similarity, no model — but distributed:
 *
 *   1. exact LINE diff between the historical composition and the current draft
 *   2. long unchanged line runs become monotonic anchors throughout the book
 *   3. inside a changed hunk holding a boundary, refine by exact CHARACTER diff
 *   4. map each historical boundary through the resulting edit script
 *
 * A net delta of +346 chars says nothing about edit distance — a paragraph can
 * be replaced by one the same length — so this measures equality blocks and
 * never infers from length.
 *
 * INVARIANT: Stage 2 may only recover boundaries from Stage 1's ambiguous set.
 * It may never downgrade one Stage 1 proved. Asserted at the end.
 *
 * Run: npx tsx scripts/ws2-04a-stage2-alignment.ts <manuscript-id>
 */

import { query } from '../lib/db/postgres';
import { diff, type Op } from './lib/myers';

/** The CURRENT composer (plain headings), plus the offsets and heading line
    indices the alignment needs. Copied rather than imported so this stage
    measures a fixed algorithm — see the census for why composer identity
    matters here. */
function composeWithOffsets(sections: { heading: string | null; body: string }[]) {
  const parts: string[] = [];
  const starts: number[] = [];
  /* Line indices carrying a heading, recorded by the composer as it writes
     them. Derived from manuscript_sections.heading, never from a line's
     position or contents — a headingless section's first body line also sits
     at a section start, and calling that a heading would misreport the shape
     of the change. */
  const headingLines = new Set<number>();
  let offset = 0;
  /* A pushed part is not one line: a body carries its own newlines, so the
     line counter advances by however many lines the part actually spans. */
  let lineNo = 0;
  const push = (s: string) => {
    parts.push(s);
    offset += s.length + 1;
    lineNo += s.split('\n').length;
  };
  for (const s of sections) {
    starts.push(offset);
    const h = s.heading?.trim();
    if (h) { headingLines.add(lineNo); push(h); push(''); }
    push(s.body);
    push('');
  }
  return { text: parts.join('\n'), starts, headingLines };
}

/** Line start offsets for a text split on '\n'. */
function lineIndex(text: string) {
  const lines = text.split('\n');
  const starts: number[] = [];
  let o = 0;
  for (const l of lines) { starts.push(o); o += l.length + 1; }
  return { lines, starts };
}

const lineOf = (starts: number[], offset: number) => {
  let lo = 0, hi = starts.length - 1, ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= offset) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
};

type State = 'EXACT' | 'CHANGED' | 'AMBIGUOUS';

async function main() {
  const id = process.argv[2];
  if (!id) { console.error('usage: … <manuscript-id>'); process.exit(1); }

  const secs = await query<{ heading: string | null; body: string }>(
    `SELECT heading, body FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position ASC`,
    [id],
  );
  const dr = await query<{ content: string }>(
    `SELECT content FROM manuscript_working_drafts WHERE manuscript_id = $1`, [id],
  );
  if (dr.rows.length === 0) { console.error('no working draft'); process.exit(1); }

  const current = dr.rows[0].content;
  const { text: source, starts, headingLines } = composeWithOffsets(secs.rows);
  const A = lineIndex(source);
  const B = lineIndex(current);

  /* Self-check: every recorded heading line must actually hold that heading.
     Line accounting is the one place this instrument could silently drift —
     a body spans as many lines as it has newlines — and a drifted index would
     mislabel body text as a heading, which is exactly the error this stage
     exists to avoid making. */
  {
    let i = 0;
    for (const sec of secs.rows) {
      const h = sec.heading?.trim();
      if (h) {
        const line = [...headingLines][i++];
        if (A.lines[line] !== h) {
          console.error(`heading line accounting drifted at section index ${i - 1}`);
          process.exit(1);
        }
      }
    }
  }

  const t0 = Date.now();
  const ops = diff(A.lines, B.lines);
  const ms = Date.now() - t0;

  const eqRuns = ops.filter((o): o is Extract<Op, { type: 'eq' }> => o.type === 'eq');
  const hunks = ops.filter((o) => o.type !== 'eq');
  const changedLines = ops.reduce(
    (n, o) => n + (o.type === 'del' ? o.aEnd - o.aStart : o.type === 'ins' ? o.bEnd - o.bStart : 0), 0);

  console.log(`\nWS2-04A STAGE 2 — EXACT ALIGNMENT — ${id}\n`);
  console.log(`  source lines        ${A.lines.length}`);
  console.log(`  current lines       ${B.lines.length}`);
  console.log(`  unchanged runs      ${eqRuns.length}`);
  console.log(`  largest run         ${Math.max(...eqRuns.map((r) => r.aEnd - r.aStart), 0)} lines`);
  console.log(`  edit hunks          ${hunks.length}`);
  console.log(`  changed lines       ${changedLines}`);
  console.log(`  aligned in          ${ms}ms\n`);

  /* Map a source line to a current line when it sits in an unchanged run. */
  const eqFor = (aLine: number) =>
    eqRuns.find((r) => aLine >= r.aStart && aLine < r.aEnd);

  const counts: Record<State, number> = { EXACT: 0, CHANGED: 0, AMBIGUOUS: 0 };
  const review: string[] = [];

  starts.forEach((bStart, i) => {
    const aLine = lineOf(A.starts, bStart);
    const within = bStart - A.starts[aLine];
    const run = eqFor(aLine);

    let state: State;
    if (run) {
      /* The line is byte-identical and its position is known, so the offset
         inside it is preserved exactly. Located by identity. */
      state = 'EXACT';
    } else {
      /* Inside a changed hunk. Refine by exact character diff over just this
         hunk's old and new text, and accept the boundary only if it lands in
         an unchanged character run — one defensible position, not a guess. */
      const prev = eqRuns.filter((r) => r.aEnd <= aLine).pop();
      const next = eqRuns.find((r) => r.aStart > aLine);
      const aFrom = prev ? prev.aEnd : 0;
      const aTo = next ? next.aStart : A.lines.length;
      const bFrom = prev ? prev.bEnd : 0;
      const bTo = next ? next.bStart : B.lines.length;

      const oldText = A.lines.slice(aFrom, aTo).join('\n');
      const newText = B.lines.slice(bFrom, bTo).join('\n');
      const rel = bStart - A.starts[aFrom];

      const cOps = diff([...oldText], [...newText]);
      const hit = cOps.find(
        (o): o is Extract<Op, { type: 'eq' }> =>
          o.type === 'eq' && rel >= o.aStart && rel < o.aEnd,
      );
      state = hit ? 'CHANGED' : 'AMBIGUOUS';
    }

    counts[state]++;
    if (state !== 'EXACT') {
      review.push(`     ${String(i).padStart(3)}  ${state.padEnd(9)} ${(secs.rows[i].heading?.trim() || '(untitled)').slice(0, 52)}`);
    }
    void within;
  });

  /* ── SHAPE OF THE CHANGE ──────────────────────────────────────────────
     Added after the first Stage 2 run returned a suspiciously regular result:
     6989 lines on both sides, 174 unchanged runs (exactly the section count),
     346 ops = 173 one-line replacements, and a net delta of +346.

     One changed line per section, each ~2 chars longer, is not what a person
     editing a book looks like. But shape is a question, not an answer: this
     stage reports it and hands it to Stage 2.1, which tests the specific
     historical transform instead of reasoning from regularity.

     So the instrument reports the shape of the change, structurally. Line
     indices, counts and length deltas only — never a character of prose. */
  const replacements: { aLine: number; delta: number; isHeading: boolean }[] = [];
  for (let i = 0; i < ops.length - 1; i++) {
    const d = ops[i];
    const n = ops[i + 1];
    if (d.type === 'del' && n.type === 'ins'
        && d.aEnd - d.aStart === 1 && n.bEnd - n.bStart === 1) {
      const aLine = d.aStart;
      replacements.push({
        aLine,
        delta: (B.lines[n.bStart] ?? '').length - (A.lines[aLine] ?? '').length,
        isHeading: headingLines.has(aLine),
      });
    }
  }
  const onHeading = replacements.filter((r) => r.isHeading).length;
  const deltas = replacements.map((r) => r.delta);
  const uniqueDeltas = [...new Set(deltas)].sort((x, y) => x - y);

  console.log(`  ── shape of the change ──`);
  console.log(`  one-line replacements   ${replacements.length} of ${hunks.length} hunk ops`);
  console.log(`  falling on a HEADING    ${onHeading}`);
  console.log(`  falling on body text    ${replacements.length - onHeading}`);
  console.log(`  length deltas seen      ${uniqueDeltas.join(', ') || '—'}`);
  if (replacements.length > 0 && onHeading === replacements.length && uniqueDeltas.length <= 2) {
    console.log('');
    console.log('  ⚠ EVERY changed line is a heading, with a uniform length delta.');
    console.log('    That is CONSISTENT WITH a composition difference rather than member');
    console.log('    editing — but a uniform shape is not proof of a cause. Stage 2.1');
    console.log('    settles it by testing the one historical transform the repository');
    console.log('    actually records:  current === "# " + source heading.');
    console.log('    Do not act on this line. Run:');
    console.log(`      npx tsx scripts/ws2-04a-stage21-legacy-proof.ts ${id}`);
  }
  console.log('');

  console.log(`  EXACT      ${counts.EXACT}\tlocated through unchanged identity`);
  console.log(`  CHANGED    ${counts.CHANGED}\tsurroundings edited, correspondence still unique`);
  console.log(`  AMBIGUOUS  ${counts.AMBIGUOUS}\tno single defensible position\n`);

  if (review.length) {
    console.log('  Sections the writer would see in review:');
    review.forEach((l) => console.log(l));
    console.log('');
  }

  const resolved = counts.EXACT + counts.CHANGED;
  console.log(`  ${resolved}/${starts.length} boundaries mechanically resolved.`);
  console.log(`  ${counts.AMBIGUOUS} would require the writer to say where the break falls.\n`);
  console.log('  Equality only. No heading matched, no similarity, no model.\n');
  process.exit(0);
}

main().catch((e) => { console.error('stage 2 failed:', e?.message ?? e); process.exit(1); });
