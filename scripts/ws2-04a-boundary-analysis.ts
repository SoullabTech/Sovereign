/**
 * WS2-04A — reconciliation dry run. READ ONLY. Writes nothing, persists nothing.
 *
 * For an EDITED draft, the census says only "this changed". This says WHERE,
 * and how many of the Source's section boundaries can still be located in the
 * current draft with certainty.
 *
 * ── THE INSTRUMENT, AND ITS LIMIT ──────────────────────────────────────────
 *
 * Composition is deterministic, so every Source section has an exact offset in
 * the text the draft STARTED as. The question is where those offsets went.
 *
 * The method is anchoring, not similarity: compute the longest common prefix
 * and longest common suffix between the recomposed Source and the current
 * draft. Everything outside that changed span is byte-identical, so a boundary
 * lying in it is located EXACTLY — by identity, not by resemblance. No heading
 * text is matched, no fuzzy scoring, no threshold anyone has to trust.
 *
 * The limit, stated plainly: prefix/suffix anchoring collapses scattered edits
 * into one span. Two small changes at opposite ends of a book make everything
 * between them "uncertain", even though most of it is untouched.
 *
 * That makes this classifier SOUND BUT NOT COMPLETE. Everything it calls
 * MATCHED is provably matched. Some things it calls uncertain are resolvable
 * with a finer alignment. The error runs one way only — toward asking the
 * writer — which is the only direction it is allowed to run. A later Myers
 * diff can move boundaries INTO matched; nothing can move one out.
 *
 * Run:
 *   npx tsx scripts/ws2-04a-boundary-analysis.ts <manuscript-id>
 */

import { query } from '../lib/db/postgres';

/** Historical composer, copied verbatim — see the census for why. */
function composeWithOffsets(sections: { heading: string | null; body: string }[]) {
  const parts: string[] = [];
  const starts: number[] = [];
  let offset = 0;
  const push = (s: string) => { parts.push(s); offset += s.length + 1; };
  for (const s of sections) {
    starts.push(offset);
    const heading = s.heading?.trim();
    if (heading) { push(heading); push(''); }
    push(s.body);
    push('');
  }
  return { text: parts.join('\n'), starts };
}

const commonPrefix = (a: string, b: string) => {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
};

const commonSuffix = (a: string, b: string, floor: number) => {
  const n = Math.min(a.length, b.length) - floor;
  let i = 0;
  while (i < n && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
  return i;
};

async function main() {
  const manuscriptId = process.argv[2];
  if (!manuscriptId) {
    console.error('usage: npx tsx scripts/ws2-04a-boundary-analysis.ts <manuscript-id>');
    process.exit(1);
  }

  const secs = await query<{ heading: string | null; body: string }>(
    `SELECT heading, body FROM manuscript_sections
      WHERE manuscript_id = $1 ORDER BY position ASC`,
    [manuscriptId],
  );
  const draft = await query<{ content: string }>(
    `SELECT content FROM manuscript_working_drafts WHERE manuscript_id = $1`,
    [manuscriptId],
  );
  if (draft.rows.length === 0) { console.error('no working draft'); process.exit(1); }

  const current = draft.rows[0].content;
  const { text: recomposed, starts } = composeWithOffsets(secs.rows);

  const P = commonPrefix(recomposed, current);
  const S = commonSuffix(recomposed, current, P);
  const shift = current.length - recomposed.length;
  const changedFrom = P;
  const changedTo = recomposed.length - S; // exclusive, in recomposed coords

  console.log(`\nWS2-04A BOUNDARY ANALYSIS — ${manuscriptId}\n`);
  console.log(`  source sections     ${secs.rows.length}`);
  console.log(`  recomposed chars    ${recomposed.length}`);
  console.log(`  current draft chars ${current.length}   (${shift >= 0 ? '+' : ''}${shift})`);
  console.log(`  identical prefix    ${P}`);
  console.log(`  identical suffix    ${S}`);
  console.log(`  changed span        [${changedFrom}, ${changedTo}) = ${Math.max(0, changedTo - changedFrom)} chars`);
  console.log(`  untouched           ${(((P + S) / recomposed.length) * 100).toFixed(2)}% of the source text\n`);

  const counts = { MATCHED: 0, CHANGED: 0, AMBIGUOUS: 0 };
  const needsEye: string[] = [];

  starts.forEach((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1] : recomposed.length;
    const boundaryLocated = start <= P || start >= changedTo;
    const bodyTouched = !(end <= changedFrom || start >= changedTo);

    let state: keyof typeof counts;
    if (!boundaryLocated) state = 'AMBIGUOUS';
    else if (bodyTouched) state = 'CHANGED';
    else state = 'MATCHED';

    counts[state]++;
    if (state !== 'MATCHED') {
      const heading = secs.rows[i].heading?.trim() || '(untitled)';
      needsEye.push(`     ${String(i).padStart(3)}  ${state.padEnd(9)} ${heading.slice(0, 52)}`);
    }
  });

  console.log(`  MATCHED    ${counts.MATCHED}\tboundary located by identity, body untouched`);
  console.log(`  CHANGED    ${counts.CHANGED}\tboundary located by identity, body edited`);
  console.log(`  AMBIGUOUS  ${counts.AMBIGUOUS}\tboundary falls inside the changed span\n`);

  if (needsEye.length > 0) {
    console.log('  Sections the writer would see in review:');
    needsEye.forEach((l) => console.log(l));
    console.log('');
  }

  const resolved = counts.MATCHED + counts.CHANGED;
  console.log(`  ${resolved}/${starts.length} boundaries mechanically resolved.`);
  console.log(`  ${counts.AMBIGUOUS} would require the writer to say where the break falls.\n`);
  console.log('  Sound, not complete: everything MATCHED is provably matched.');
  console.log('  A finer alignment can only move boundaries INTO resolved, never out.\n');
  process.exit(0);
}

main().catch((e) => { console.error('analysis failed:', e?.message ?? e); process.exit(1); });
