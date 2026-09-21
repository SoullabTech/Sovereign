/**
 * WS-EDITORIAL-SCOPE-01 · VOICE — THE WORDS A SUGGESTION BRINGS THAT ARE NOT YOURS.
 *
 * ⭐⭐ THE GAP THIS CLOSES, STATED EXACTLY.
 *
 * `contract.ts` bounds HOW MUCH of the author's text a proposal may change.
 * `surround.ts` bounds WHAT MAIA MAY READ. Neither says anything about WHOSE
 * VOICE THE REPLACEMENT IS IN — and a proposal can sit comfortably inside every
 * size bound while quietly not sounding like the writer at all:
 *
 *     author     "Fire appears through energy, vision, imagination."
 *     proposal   "Fire discloses itself as a phenomenological register."
 *
 * Nine words for nine. Every size bound satisfied. ⛔ And it is not their book.
 *
 * ── ⭐⭐ WHY THIS MATTERS MORE HERE THAN IT WOULD ELSEWHERE ────────────────
 *
 * This studio is for people with something real to say who are **not yet
 * confident writers** — helpers, healers, practitioners, people carrying hard-won
 * understanding in a voice they have not fully trusted yet. That is exactly the
 * reader who accepts a suggestion *because it sounds better*, and exactly the
 * writer who cannot yet tell *better* from *more like everyone else*.
 *
 * ⛔ A confident writer defends their voice by instinct. Someone still finding
 * theirs loses it one accepted suggestion at a time, and never sees the moment
 * it happened. **That is the failure this file exists to make visible.**
 *
 * ── ⭐ DISCLOSURE FIRST, REFUSAL ONLY AT THE EDGE ─────────────────────────
 *
 * ⛔ Introducing a word is NOT a wrong. A good editor hands a writer a word they
 * did not have; that is half of what editing is for. The wrong is introducing
 * fifteen of them **silently**, to someone not yet equipped to notice.
 *
 * So the instrument is mostly a REPORT — *this suggestion uses seven words you
 * haven't used here* — and only refuses when the count is far past what the
 * writer's declared latitude could plausibly mean. ⭐ A studio that teaches
 * shows the writer the thing; a studio that polices just says no.
 *
 * ── ⛔ WHAT THIS IS NOT ───────────────────────────────────────────────────
 *
 * ⛔ NOT a style score. Nothing here rates prose, and no number means *good*.
 * ⛔ NOT a readability metric. No sentence lengths, no grade levels — those
 *    measure conformity to an average, which is the opposite of the job.
 * ⛔ NOT a stoplist. A curated list of words-that-do-not-count would be a
 *    judgement about which vocabulary matters, in one language, imported into a
 *    system whose Invariant 14 forbids exactly that. The author's own sample
 *    supplies the common words, or it does not, and either way it is theirs.
 */

import { diff } from '@/lib/manuscript/sections/myers';

/**
 * ⭐⭐ A DIFFERENT QUESTION TAKES A DIFFERENT TOKENISER, AND THE ASYMMETRY WITH
 * `contract.ts` IS DELIBERATE.
 *
 * The size law refuses to normalise: every normalisation decides which of the
 * author's marks do not matter, and changing a comma IS a change to their text.
 *
 * ⭐ Vocabulary is the other question. *Phenomenological,* and
 * *phenomenological* are ONE word a writer has or has not used, and treating
 * them as two would report a stranger the writer has already met.
 *
 * ⛔ Case and edge punctuation only. No stemming, no lemmatising — *spiral* and
 * *spiralling* stay distinct, because a writer who uses one and not the other
 * is telling you something, and a stemmer would erase it.
 */
export function vocabulary(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []);
}

export interface VoiceMeasure {
  /** Word tokens the proposal adds to the passage. */
  readonly addedWords: number;
  /**
   * ⭐ Distinct added words that appear NOWHERE in the author's own sample —
   * in first-appearance order, so the writer reads them as they would meet them.
   * ⛔ Not ranked, not scored.
   */
  readonly unfamiliar: readonly string[];
  /** ⭐ How much of the author's own vocabulary the comparison could see. */
  readonly sampleWords: number;
}

/**
 * ⭐ THE MEASUREMENT.
 *
 * `authorSample` is the writer's own nearby text — today the section around the
 * passage, which the surround has already loaded. ⚠️ **A BOUNDED SAMPLE, AND
 * THE BOUND IS HONEST**: a word the writer used in chapter one and nowhere near
 * here will be reported as unfamiliar. That is a false positive of scope, ⛔ not
 * of kind, and widening the sample to the whole Work is a separate act with its
 * own cost. `sampleWords` travels with the result so a surface can say how much
 * the comparison saw rather than implying it saw everything.
 */
export function measureVoiceIntrusion(
  authorSample: string, authorText: string, replacementText: string,
): VoiceMeasure {
  const known = new Set<string>([...vocabulary(authorSample), ...vocabulary(authorText)]);

  const a = vocabulary(authorText);
  const b = vocabulary(replacementText);
  const ops = diff(a, b);

  const unfamiliar: string[] = [];
  const seen = new Set<string>();
  let addedWords = 0;
  for (const op of ops) {
    if (op.type !== 'ins') continue;
    for (let i = op.bStart; i < op.bEnd; i++) {
      const w = b[i];
      if (w === undefined) continue;
      addedWords++;
      /* ⛔ `known` includes the passage's OWN words, so moving the writer's word
         around inside their sentence is never reported as an intrusion. */
      if (!known.has(w) && !seen.has(w)) { seen.add(w); unfamiliar.push(w); }
    }
  }

  return { addedWords, unfamiliar, sampleWords: known.size };
}

/**
 * ⭐ How many unfamiliar words a latitude can plausibly mean.
 *
 * ⛔ GENEROUS ON PURPOSE. These are not targets and crossing one is not a style
 * verdict — it is the point past which *a small edit* and *a passage in someone
 * else's vocabulary* have stopped being the same thing. Below the bound the
 * count is REPORTED and nothing is blocked.
 *
 * ⛔ Latitude 1 is not zero: replacing one word with a better one is the whole
 * of what "Touch" is for, and a bound of zero would forbid the edit the band
 * exists to permit.
 */
export const UNFAMILIAR_BOUND: Readonly<Record<1 | 2 | 3 | 4 | 5, number>> = {
  1: 3, 2: 6, 3: 12, 4: 25, 5: Number.MAX_SAFE_INTEGER,
};

/**
 * ⭐ THE WRITER-FACING SENTENCE, or `null` when there is nothing to say.
 *
 * ⛔ It states a FACT and asks a QUESTION. It never says the suggestion is bad,
 * never says the writer's original is better, and never uses the word *voice*
 * as a verdict — the writer decides what their voice is, and this only makes
 * the choice visible in time to be made.
 */
export function voiceNote(m: VoiceMeasure): string | null {
  if (m.unfamiliar.length === 0) return null;
  const shown = m.unfamiliar.slice(0, 8);
  const rest = m.unfamiliar.length - shown.length;
  return `This suggestion brings in ${m.unfamiliar.length} word`
    + `${m.unfamiliar.length === 1 ? '' : 's'} you haven't used nearby: `
    + shown.join(', ') + (rest > 0 ? `, and ${rest} more` : '')
    + '. Worth a look — are they yours?';
}
