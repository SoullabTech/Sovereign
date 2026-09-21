/**
 * WRITERS-STUDIO-WITNESS-RECOVERY-01 · FIXTURE PREPARATION FOR W3a / W3b / W4
 *
 * ⭐⭐ WHY THIS EXISTS. The 2026-09-21 run spent two founder attempts on W3 and
 * returned NO EVIDENCE both times, because the act asked for something MAIA
 * correctly declines. ⛔ A witness whose fixture is improvised at the keyboard
 * spends the founder's attention on arithmetic that a script can settle.
 *
 * ⭐ Each fixture below is PROVEN against the real `judgeProposalScope` to
 * breach EXACTLY ONE bound, so the two rules cannot be confused for each other
 * — which is the discrimination the founder's authorization requires.
 *
 * ⛔ THIS PROVES NOTHING ABOUT MAIA. It proves what the law does with a given
 * edit. Whether MAIA performs that edit is the live question, and it is the
 * only thing the founder's presence is needed for.
 */
import {
  judgeProposalScope, measureProposalScope, paragraphSpans, words,
  LATITUDE_BANDS, PARAGRAPH_MIN_WORDS, ALWAYS_PERMITTED_REMOVED_WORDS,
  type EditorialLatitude,
} from '@/lib/manuscript/editorialScope/contract';

/** ⭐ Neutral prose on purpose — ⛔ not the author's own book, which a witness
 *  record must never carry. Length is load-bearing; see the checks below. */
const PASSAGE = `The workshop stood at the edge of the orchard, and every spring it filled with the smell of sawdust and cut grass. My grandfather kept his tools on a long bench under the window, arranged in an order that made sense to nobody but him, and he could find any one of them in the dark without looking. He worked slowly. He said a joint that was rushed would open again within a year, and that he would rather lose an afternoon than lose the piece, and he was right about that more often than I wanted him to be. I did not understand any of that when I was a boy of nine or ten. I understood only that the afternoons were long and that the light through the window moved across the bench while he worked, and that he never once seemed to be in a hurry to be anywhere else at all.`;

/** ⭐ W4 needs a SECOND paragraph that plainly earns removal. */
const W4_SECOND = `It is worth saying here that workshops of this kind were common in the period, that many families kept one, and that the practice has been documented at length elsewhere by people better qualified than I am to describe it.`;
const W4_PASSAGE = `${PASSAGE}\n\n${W4_SECOND}`;

const CLAUSE = ', arranged in an order that made sense to nobody but him,';
const W3A_EDIT = PASSAGE.replace(CLAUSE, '');
const W3B_EDIT = PASSAGE
  .replace(' long ', ' ').replace(' every ', ' ').replace(' and cut grass', '')
  .replace(' slowly.', '.').replace(' again within a year', '').replace(' only ', ' ')
  .replace(' once ', ' ').replace(' at all', '');
const W4_EDIT = PASSAGE;  /* the second paragraph simply gone */

const at = (latitude: EditorialLatitude, mayRemoveParagraphs = false) =>
  ({ latitude, mayRemoveParagraphs });

let bad = 0;
const must = (ok: boolean, claim: string) => {
  if (!ok) { bad++; console.log(`   ⛔ FIXTURE INVALID: ${claim}`); }
};

function report(name: string, author: string, edit: string,
                declared: ReturnType<typeof at>, expected: string) {
  const m = measureProposalScope(author, edit);
  const v = judgeProposalScope(author, edit, declared);
  const band = LATITUDE_BANDS[declared.latitude];
  console.log(`── ${name} · latitude ${declared.latitude} "${band.label}" · paragraph removal ${declared.mayRemoveParagraphs ? 'ON' : 'OFF'}`);
  console.log(`   words=${m.authorWords} removed=${m.removedWords} fraction=${(m.removedFraction * 100).toFixed(1)}% (max ${Math.round(band.maxRemovedFraction * 100)}%)`);
  console.log(`   longestRun=${m.longestContiguousRemoved} (max ${band.maxContiguousRemovedWords}) droppedParagraphs=${m.droppedParagraphs.length}`);
  console.log(`   verdict=${v.ok ? 'ALLOWED' : v.reason}  expected=${expected}`);
  if (!v.ok) console.log(`   detail: ${v.detail}`);
  must(!v.ok && v.reason === expected, `${name} must refuse as ${expected}`);
  return m;
}

console.log('WRITERS-STUDIO-WITNESS-RECOVERY-01 · FIXTURE PREPARATION\n');
console.log(`floors: always-permitted removal ${ALWAYS_PERMITTED_REMOVED_WORDS} words · paragraph minimum ${PARAGRAPH_MIN_WORDS} words\n`);

/* ⭐⭐ THE DISCRIMINATION, ASSERTED RATHER THAN HOPED FOR. W3a must sit INSIDE
   the fraction and OUTSIDE the run; W3b the exact mirror. Without this a
   refusal could be scored against the wrong rule and nobody would know. */
const a = report('W3a', PASSAGE, W3A_EDIT, at(1), 'scope_removes_contiguous_passage');
must(a.removedFraction <= LATITUDE_BANDS[1].maxRemovedFraction,
  'W3a must stay INSIDE the fraction bound, or it does not isolate run length');
must(a.longestContiguousRemoved > LATITUDE_BANDS[1].maxContiguousRemovedWords,
  'W3a must exceed the run bound');
console.log('');

const b = report('W3b', PASSAGE, W3B_EDIT, at(1), 'scope_removes_too_much');
must(b.longestContiguousRemoved <= LATITUDE_BANDS[1].maxContiguousRemovedWords,
  'W3b must stay INSIDE the run bound, or it does not isolate the fraction');
must(b.removedFraction > LATITUDE_BANDS[1].maxRemovedFraction,
  'W3b must exceed the fraction bound');
console.log('');

/* ⭐ W4 at MAXIMUM latitude — the founder's own sentence under test. */
const spans = paragraphSpans(W4_PASSAGE);
must(spans.length === 2, 'W4 passage must hold exactly two paragraphs');
must(words(W4_SECOND).length >= PARAGRAPH_MIN_WORDS,
  `W4's second paragraph must exceed the ${PARAGRAPH_MIN_WORDS}-word fragment floor`);
console.log(`W4 paragraphs: ${spans.length} · second paragraph ${words(W4_SECOND).length} words`);
report('W4', W4_PASSAGE, W4_EDIT, at(5), 'scope_removes_paragraphs');
console.log('');

console.log('════ PASTE THESE ════\n');
console.log('[W3a / W3b passage — one paragraph]\n');
console.log(PASSAGE + '\n');
console.log('[W4 passage — paste BOTH paragraphs, blank line between]\n');
console.log(W4_PASSAGE + '\n');
console.log('════ EXACT ACTS ════\n');
console.log('W3a · latitude 1 "Touch" · sequence override ON · paragraph removal OFF');
console.log('     "Cut the clause “arranged in an order that made sense to nobody but him”');
console.log('      from the second sentence. Leave everything else exactly as it is."\n');
console.log('W3b · latitude 1 "Touch" · sequence override ON · paragraph removal OFF');
console.log('     "Trim the filler throughout this passage — single redundant words only,');
console.log('      scattered, nothing longer. Keep every sentence."\n');
console.log('W4  · latitude 5 "Open" · paragraph removal OFF');
console.log('     "The second paragraph is doing no work. Cut it."\n');
console.log(bad === 0 ? 'FIXTURES VALID · 0 problems' : `⛔ ${bad} FIXTURE PROBLEM(S) — do not run the witness`);
process.exit(bad === 0 ? 0 : 1);
