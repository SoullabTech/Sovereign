/**
 * MEMBER-FACING LANGUAGE GUARD
 *
 * `JARVIS-WRITERS-STUDIO-COMPLETE-01 / B0`, checkpoint B2.
 *
 * ⭐ The grading prohibition is made MECHANICAL rather than editorial, the same
 * move as the capability resolver. A ruling that lives only in a document is
 * re-litigated every time someone writes a sentence; a ruling the suite can read
 * is not.
 *
 * ⭐ THE DISTINCTION THAT DOES THE WORK — *a stance is not a verdict.*
 *
 *   ⛔ VERDICT   "This is a beautiful passage."      a property of the Work
 *   ✅ STANCE    "I find this passage beautiful."    MAIA's own response
 *
 * A stance is owned, revisable and arguable — the writer may disagree with it
 * under the disagreement law. A verdict is MAIA grading the member's work.
 *
 * ⚠️ Stance is PERMITTED AND RATIONED. *The flagship should feel warm without
 * becoming flattering* — so the guard also bounds how often stance may appear,
 * which no word list alone could do.
 */

/** ⛔ Barred where presented as an objective property of the writing.
 *  ⭐ Both directions: praise stated as a property is the same act as criticism
 *  stated as one — the defect is GRADING, ⛔ not negativity. */
export const BARRED_VERDICT_WORDS = [
  'strong', 'good', 'authentic', 'engaging',
  'beautiful', 'luminous', 'weak', 'effective',
] as const;

/** First-person openings that mark a sentence as MAIA's own response. */
const STANCE_MARKERS = [
  'i find', 'i notice', 'i read this', 'i am drawn', "i'm drawn",
  'i keep returning', 'i find myself', 'to me', 'feels to me', 'reads to me',
];

/** Hedges that keep a reader claim hypothesis-shaped. */
const HYPOTHESIS_MARKERS = ['may ', 'might ', 'could ', 'hypothesis', 'perhaps', 'a reader may'];

export type LanguageCode =
  | 'VERDICT_AS_FACT'
  | 'READER_EFFECT_ASSERTED'
  | 'STANCE_OVER_BUDGET';

export interface LanguageFinding {
  readonly code: LanguageCode;
  readonly sentence: string;
  readonly detail: string;
}

const sentences = (text: string): string[] =>
  text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

const isStance = (s: string): boolean => {
  const l = s.toLowerCase();
  return STANCE_MARKERS.some((m) => l.includes(m));
};

const isHypothesis = (s: string): boolean => {
  const l = s.toLowerCase();
  return HYPOTHESIS_MARKERS.some((m) => l.includes(m));
};

/**
 * Inspect member-facing copy.
 *
 * @param text    what the member will read
 * @param budget  how many stance sentences this surface may carry. ⭐ Default 1:
 *                warmth, ⛔ not flattery. A whole-room scan passes its own total.
 */
export function inspectMemberCopy(text: string, budget = 1): readonly LanguageFinding[] {
  const out: LanguageFinding[] = [];
  let stanceCount = 0;

  for (const s of sentences(text)) {
    const lower = s.toLowerCase();
    const stance = isStance(s);
    if (stance) stanceCount += 1;

    const hits = BARRED_VERDICT_WORDS.filter((w) =>
      new RegExp(`\\b${w}\\b`, 'i').test(lower));
    /* ⭐ The same word is lawful inside a stance and barred as a fact. The guard
       therefore reads the SENTENCE, ⛔ never the word in isolation. */
    if (hits.length > 0 && !stance) {
      out.push({ code: 'VERDICT_AS_FACT', sentence: s,
        detail: `"${hits.join('", "')}" stated as a property of the Work. Give it evidence, or own it as stance.` });
    }

    if (/\breaders?\b/i.test(lower) && /\bwill\b|\bfind(s)? (it|this)\b|\bare\b/.test(lower)
      && !isHypothesis(s)) {
      out.push({ code: 'READER_EFFECT_ASSERTED', sentence: s,
        detail: 'Reader effect asserted. It is a permanent non-conclusion and stays hypothesis-shaped.' });
    }
  }

  if (stanceCount > budget) {
    out.push({ code: 'STANCE_OVER_BUDGET', sentence: `${stanceCount} stance sentences`,
      detail: `Budget is ${budget}. Warm, not flattering — prefer an observation carrying evidence.` });
  }
  return out;
}

/** ⛔ Technical vocabulary that must never reach member-facing copy. F13. */
export const BARRED_MACHINERY_WORDS = [
  'revision id', 'digest', 'payload', 'endpoint', 'schema', 'migration',
  'thread id', 'proposal chain', 'authorization', 'observation_id', 'section_id',
  'draft_section', 'reading id', 'lens id', 'fixture', 'null', 'undefined',
] as const;

export function inspectForMachinery(text: string): readonly string[] {
  const l = text.toLowerCase();
  return BARRED_MACHINERY_WORDS.filter((w) => l.includes(w));
}
