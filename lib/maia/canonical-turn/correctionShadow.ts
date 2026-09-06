/**
 * E1 — correction-candidate shadow (Phase 2, JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1).
 *
 * Founder authorization 2026-09-06 (whole-organism map §9): the first zero-diff shadow
 * instrument. The census found that MAIA has no system-level way to notice "no — that isn't
 * what I meant" (map rank 1; AP14 / AP15 unfalsifiable; P3 aspiration). This module is the
 * smallest evidence-producing step: it classifies the MEMBER'S turn — after MAIA has already
 * responded to it — as a candidate correction / disagreement / not-it, and the route emits
 * counts only under [MAIA/shadow] correction-candidate.
 *
 * What it is NOT: not a detector of misattunement (a candidate is a lexical marker, not a
 * finding); not an input to cognition (it runs after the legacy response and nothing reads
 * it); not a persistence surface (no db import, no writer); not a Sanctuary participant
 * (returns null under Sanctuary — refused inside the module as well as at the route).
 *
 * Content never leaves this function: no member text, no substring, no length in characters
 * — only the candidate class, the number of markers hit, the distinct classes, and whether a
 * prior MAIA response existed for the member to be correcting. Spec:
 * docs/programme/E1_CORRECTION_SHADOW_SPEC_2026-09-06.md. Falsifier: refusal R32.
 */

export const CORRECTION_SHADOW_MARKER = '[MAIA/shadow] correction-candidate';

export type CorrectionCandidateClass = 'correction' | 'disagreement' | 'not-it' | 'none';

export interface CorrectionCandidate {
  /** Highest-precedence class hit: correction > not-it > disagreement > none. */
  readonly candidate: CorrectionCandidateClass;
  /** Total lexical markers hit across all classes. */
  readonly markers: number;
  /** Distinct classes with at least one marker, in precedence order. */
  readonly classes: readonly Exclude<CorrectionCandidateClass, 'none'>[];
  /** A member turn can only correct MAIA if MAIA said something before it. */
  readonly hasPriorResponse: boolean;
}

export interface CorrectionShadowInput {
  readonly memberMessage: string;
  /** MAIA's immediately preceding response, if any (presence is all that is used). */
  readonly priorAssistantResponse: string | null | undefined;
  readonly sanctuary: boolean;
}

/**
 * Conservative English lexicon. Word-bounded, case-insensitive. Precedence is deliberate:
 * "correction" is the member saying MAIA got THEM wrong; "not-it" is the member saying the
 * offered reading does not fit; "disagreement" is the member contesting a claim. All three are
 * candidates for the E1 witness ("did MAIA notice when she got you wrong"); none is a verdict.
 */
const LEXICON: Readonly<Record<Exclude<CorrectionCandidateClass, 'none'>, readonly RegExp[]>> = {
  correction: [
    /\b(?:that'?s|that is|this is) not what i (?:meant|said|was (?:saying|asking|getting at))\b/i,
    /\bnot what i (?:meant|said|asked)\b/i,
    /\bi didn'?t (?:mean|say|ask) (?:that|it|for that)\b/i,
    /\byou (?:misunderstood|misread|misheard|mis-?interpreted)\b/i,
    /\byou (?:missed|are missing|'re missing) (?:the|my) point\b/i,
    /\byou (?:got|have) (?:me|it|that|this) wrong\b/i,
    /\bthat'?s not (?:it|right|quite it|what i'?m saying|what i'?m asking)\b/i,
    /\blet me (?:rephrase|clarify|be clearer|say that again)\b/i,
    /\bno[,.]? (?:that'?s not|i (?:meant|didn'?t)|you (?:misunderstood|misread))\b/i,
  ],
  'not-it': [
    /\b(?:doesn'?t|does not|didn'?t|did not) (?:resonate|fit|land|feel (?:right|true|accurate))\b/i,
    /\bnot quite\b/i,
    /\bthat'?s not (?:how|where|what) i (?:feel|am|experience|see it)\b/i,
    /\bit'?s not (?:that|like that|about that)\b/i,
    /\bthat (?:isn'?t|is not) (?:it|me|quite right)\b/i,
  ],
  disagreement: [
    /\bi disagree\b/i,
    /\bi don'?t (?:think|agree|believe) (?:that'?s|so|with that|that is)\b/i,
    /\bthat'?s not true\b/i,
    /\byou'?re wrong\b/i,
    /\bthat'?s (?:unfair|a stretch|off base|off)\b/i,
  ],
};

const PRECEDENCE: readonly Exclude<CorrectionCandidateClass, 'none'>[] = ['correction', 'not-it', 'disagreement'];

/**
 * Pure. Returns null under Sanctuary (the module refuses; the route refuses too). Returns a
 * content-free candidate otherwise. Never throws on odd input.
 */
export function classifyCorrectionCandidate(input: CorrectionShadowInput): CorrectionCandidate | null {
  if (input.sanctuary) return null;
  const text = typeof input.memberMessage === 'string' ? input.memberMessage : '';
  const hasPriorResponse =
    typeof input.priorAssistantResponse === 'string' && input.priorAssistantResponse.trim().length > 0;

  let markers = 0;
  const classes: Exclude<CorrectionCandidateClass, 'none'>[] = [];
  for (const cls of PRECEDENCE) {
    let hits = 0;
    for (const re of LEXICON[cls]) {
      if (re.test(text)) hits += 1;
    }
    if (hits > 0) {
      markers += hits;
      classes.push(cls);
    }
  }

  // Without a prior MAIA response there is nothing for the member to be correcting; the
  // markers are still counted (they may be about something else) but no candidate is declared.
  const candidate: CorrectionCandidateClass = hasPriorResponse && classes.length > 0 ? classes[0] : 'none';
  return { candidate, markers, classes, hasPriorResponse };
}

/** The exact, content-free shape the route logs. Kept here so the falsifier can pin it. */
export interface CorrectionShadowLogPayload {
  readonly memberRef: string | null;
  readonly candidate: CorrectionCandidateClass;
  readonly markers: number;
  readonly classes: readonly string[];
  readonly hasPriorResponse: boolean;
  readonly turnIndex: number;
}
