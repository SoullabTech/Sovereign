/**
 * Assistant Turn Type Classifier
 *
 * Deterministic (no LLM) classifier for MAIA assistant turns.
 * Used by AIN shape telemetry to categorise each response for
 * continuity-stack analysis.
 *
 * Categories (in precedence order):
 *   repair          — self-correction language detected
 *   anchor          — AIN nextStep / practice invitation
 *   question        — ends with ? or contains interrogative structure
 *   option_followup — references a previously listed option
 *   reflection      — mirror/bridge language without a question
 *   explanation     — default fallback
 */

export type AssistantTurnType =
  | 'question'
  | 'reflection'
  | 'anchor'
  | 'explanation'
  | 'option_followup'
  | 'repair';

/** Pattern: explicit self-correction or reset language */
const REPAIR_PATTERN =
  /\b(i'?m sorry|let me clarify|that came out wrong|let me try that again|let'?s reset|i misspoke|i should clarify|i was wrong|let me rephrase|apologies for|my mistake)\b/i;

/**
 * Pattern: AIN nextStep / practice invitation language.
 * Mirrors nextStepNatural in ainResponseShape.ts but scoped to explicit
 * somatic/practice anchors rather than the broader set used for scoring.
 */
const ANCHOR_PATTERN =
  /\b(sit with (this|that|it)|one small (thing|experiment|step)|you might try|here'?s a practice|notice what happens|i invite you to|take one (slow|deep|breath|moment)|pause (and notice|for a moment)|for the next (few|60|30|90) (seconds?|minutes?)|write (one|a) sentence|keep a (note|record|log))\b/i;

/** Pattern: option follow-up — picks up a previously listed option */
const OPTION_FOLLOWUP_PATTERN =
  /\b(you mentioned|going back to|earlier you (said|named|described)|you (just )?(named|pointed to)|returning to what you said|picking up on)\b/i;

/**
 * Pattern: mirror / bridge language (no trailing ?) — reflection.
 * Shared vocabulary with ainResponseShape mirror+bridge detectors.
 */
const REFLECTION_PATTERN =
  /\b(i hear (you|that)|what i'?m hearing|it sounds like|i can see how|makes sense|what you'?re (naming|describing|pointing to)|i'?m noticing (that|how|a |the )|the (pattern|tension|thread) here|what (sits|lives) underneath|in other words)\b/i;

/**
 * Classify an assistant response text into one of six turn types.
 * Rules are evaluated in strict precedence order — first match wins.
 *
 * @param text - The final assistant response text (post-cleaning).
 * @returns AssistantTurnType
 */
export function classifyAssistantTurn(text: string): AssistantTurnType {
  const t = (text ?? '').trim();
  if (!t) return 'explanation';

  // 1. Repair — highest specificity, checked first
  if (REPAIR_PATTERN.test(t)) return 'repair';

  // 2. Anchor — practice / somatic invitation
  if (ANCHOR_PATTERN.test(t)) return 'anchor';

  // 3. Question — ends with ? OR interrogative word near end-of-sentence ?
  //    Check after repair/anchor so "Would you like to try this?" → anchor wins
  //    if anchor language is also present, but a plain question still routes here.
  const endsWithQuestion = /\?\s*$/.test(t);
  const hasInterrogativeQuestion = /\b(what|how|where|when|who|which|why)\b[^?]{0,120}\?/i.test(t);
  if (endsWithQuestion || hasInterrogativeQuestion) return 'question';

  // 4. Option follow-up — references a previously listed option
  if (OPTION_FOLLOWUP_PATTERN.test(t)) return 'option_followup';

  // 5. Reflection — mirror / bridge language, no question
  if (REFLECTION_PATTERN.test(t)) return 'reflection';

  // 6. Explanation — default
  return 'explanation';
}
