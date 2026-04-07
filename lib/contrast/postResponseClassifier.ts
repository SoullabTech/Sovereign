/**
 * Post-Response Classifier — Offline Analysis Tool
 *
 * Classifies the user's next message after MAIA's primary response.
 * NOT wired into the live path. Used for:
 * 1. Backfill classification of stored contrast events
 * 2. Calibrating the contrast gate thresholds
 * 3. Comparing predicted vs reviewed labels
 *
 * Labels:
 *   shift    = user shows reorientation, softening, reframing
 *   continue = user keeps exploring same line without clear shift
 *   resist   = user rejects, pushes back, asks for directness only
 *   unclear  = too short, ambiguous, or not enough signal
 */

export type PostResponseState = 'shift' | 'continue' | 'resist' | 'unclear';

const CLASSIFIER_PROMPT = `Classify the user's next message after MAIA's primary response.

Return exactly one label:
- shift = user shows reorientation, softening, emotional naming, reframing, or a visible "oh / hmm / maybe / I think..." movement
- continue = user keeps exploring the same line without clear reorientation or resistance
- resist = user rejects, pushes back, asks for directness only, or shows irritation with the framing
- unclear = too short, ambiguous, or not enough signal

Rules:
- "yeah", "ok", "maybe", "I guess" alone are unclear unless they clearly include reframing
- agreement without movement is continue, not shift
- destabilization or confusion that increases distress is resist, not shift

Output only one word:
shift
continue
resist
unclear`;

/**
 * Build the classification prompt for a single event.
 * Returns a system + user message pair for the LLM call.
 */
export function buildClassificationInput(params: {
  primaryResponse: string;
  nextUserMessage: string;
}): { system: string; userMessage: string } {
  return {
    system: CLASSIFIER_PROMPT,
    userMessage: `MAIA's response:\n${params.primaryResponse}\n\nUser's next message:\n${params.nextUserMessage}`,
  };
}

/**
 * Parse the classifier output into a valid label.
 * Returns 'unclear' if the output doesn't match a known label.
 */
export function parseClassifierOutput(raw: string): PostResponseState {
  const cleaned = raw.trim().toLowerCase();
  if (cleaned === 'shift') return 'shift';
  if (cleaned === 'continue') return 'continue';
  if (cleaned === 'resist') return 'resist';
  return 'unclear';
}

/**
 * Cheap heuristic classifier — no LLM needed.
 * Good for initial pass before running full classification.
 * Returns null if confidence is too low (should use LLM instead).
 */
export function heuristicClassify(nextUserMessage: string): {
  label: PostResponseState;
  confidence: number;
} | null {
  const t = nextUserMessage.toLowerCase().trim();

  // Too short to classify
  if (t.length < 8) return { label: 'unclear', confidence: 0.9 };

  // Resist signals
  if (/\b(just tell me|stop|don't want|that's not|you're not listening|this isn't helping|enough)\b/.test(t)) {
    return { label: 'resist', confidence: 0.75 };
  }

  // Shift signals
  if (/\b(oh|hmm|i think|maybe|i never thought|that's|i see|something shifted|that lands|wow)\b/.test(t)) {
    if (t.length > 20) return { label: 'shift', confidence: 0.65 };
  }

  // Emotional naming (strong shift signal)
  if (/\b(i feel|i'm feeling|part of me|i realize|i notice)\b/.test(t)) {
    return { label: 'shift', confidence: 0.70 };
  }

  // Continuation signals
  if (/\b(yeah|but|and|also|what about|i was thinking|the thing is)\b/.test(t)) {
    return { label: 'continue', confidence: 0.60 };
  }

  // Not enough signal for heuristic
  return null;
}
