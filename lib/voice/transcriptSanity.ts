/**
 * DESKTOP-WHISPER-REPETITION-LOOP-01 — a hallucinated loop is not what the
 * member said.
 *
 * ⛔ THE DEFECT, device-witnessed 2026-08-30 during a working hands-free
 * conversation. Whisper returned turns like:
 *
 *   "…Is there bread for this? Yes, there is. There is. There is. There is."
 *      × ~60
 *   "No, no, no, no, no, no, no…"  × ~100
 *   "Good to have a star with an apple."  × ~40
 *
 * This is a well-known degenerate mode of Whisper-family decoders: on noisy,
 * quiet, or low-information audio the model falls into repeating one phrase
 * until it runs out of budget. Two things made it worse here. The transcription
 * request sent no VAD filter, so stretches of room tone were fed to the decoder
 * as if they were speech; and nothing between Whisper and the conversation ever
 * asked whether the text was plausible.
 *
 * ⛔ WHY IT MATTERS MORE THAN IT LOOKS. These loops were committed as MEMBER
 * TURNS. They entered the visible conversation, went to MAIA as the member's
 * words, and travelled onward into whatever memory that conversation feeds. A
 * system that records a hundred fabricated "no"s as something a person said is
 * not merely noisy — it is keeping a false record of them.
 *
 * ⭐ WHY THIS COLLAPSES RATHER THAN DISCARDS. The witnessed loops were preceded
 * by REAL SPEECH: "No, you're not supposed to use the middle… Is there bread
 * for this? Yes, there is." Dropping the turn would throw away what the member
 * actually said in order to remove what they did not. So the loop tail is
 * collapsed and the speech is kept. Refusing the whole turn is reserved for the
 * case where nothing survives collapsing.
 *
 * ⛔ AND WHY IT IS DELIBERATELY CONSERVATIVE. People repeat themselves — "no,
 * no, no" is ordinary emphasis, and saying a short sentence twice is normal.
 * The thresholds here are set well above natural repetition, so this trims
 * runaway decoding without editing anyone's speech. When in doubt it keeps the
 * member's words.
 */

/** Consecutive identical WORDS above this are decoding, not emphasis. */
const MAX_WORD_RUN = 3;

/** Consecutive identical SENTENCES above this are decoding, not repetition. */
const MAX_SENTENCE_RUN = 2;

/** Compare on meaning, not punctuation or casing. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

/** Collapse runs of one repeated word: "no, no, no, no, no…" → "no, no, no". */
function collapseWordRuns(sentence: string): string {
  const parts = sentence.split(/(\s+)/);       // keep the whitespace
  const out: string[] = [];
  let lastWord = '';
  let run = 0;
  for (const part of parts) {
    if (/^\s+$/.test(part)) { out.push(part); continue; }
    const word = normalize(part);
    if (word && word === lastWord) {
      run += 1;
      if (run > MAX_WORD_RUN) {
        // Drop this word AND the separator we just pushed for it.
        if (out.length && /^\s+$/.test(out[out.length - 1])) out.pop();
        continue;
      }
    } else {
      lastWord = word;
      run = 1;
    }
    out.push(part);
  }
  return out.join('');
}

/**
 * Remove runaway repetition from a transcript, keeping the speech around it.
 *
 * Returns the cleaned text, and whether anything was collapsed — the caller may
 * want to know that this turn came back degenerate even after repair.
 */
export function collapseRepetitionLoops(raw: string): {
  text: string;
  collapsed: boolean;
} {
  const input = (raw ?? '').trim();
  if (!input) return { text: '', collapsed: false };

  // Split into sentences, keeping their terminators.
  const sentences = input.match(/[^.!?]+[.!?]*\s*/g) ?? [input];

  const kept: string[] = [];
  let lastNorm = '';
  let run = 0;
  let collapsed = false;

  for (const sentence of sentences) {
    const deWordRun = collapseWordRuns(sentence);
    if (deWordRun !== sentence) collapsed = true;

    const norm = normalize(deWordRun);
    if (!norm) { kept.push(deWordRun); continue; }

    if (norm === lastNorm) {
      run += 1;
      if (run > MAX_SENTENCE_RUN) { collapsed = true; continue; }
    } else {
      lastNorm = norm;
      run = 1;
    }
    kept.push(deWordRun);
  }

  return { text: kept.join('').replace(/\s+/g, ' ').trim(), collapsed };
}

/**
 * Is what remains still nothing but one phrase repeating?
 *
 * ⛔ THE LAST RESORT, not the first. If collapsing left real speech, the turn
 * stands. This catches the case where the ENTIRE capture decoded as a loop, so
 * there is nothing the member said to preserve — and committing it would put
 * words in their mouth.
 */
export function isDegenerate(text: string): boolean {
  const norm = normalize(text);
  if (!norm) return false;                       // empty is handled elsewhere
  const words = norm.split(' ');
  if (words.length < 8) return false;            // too short to judge
  const unique = new Set(words);
  // Eight or more words carrying two or fewer distinct ones is not a sentence.
  return unique.size <= 2;
}
