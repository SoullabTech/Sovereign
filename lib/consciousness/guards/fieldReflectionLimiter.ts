/**
 * Field Reflection Rate Limiter
 *
 * Prevents MAIA from over-naming field dynamics.
 * Limits meta-reflections to one per 60-second window.
 *
 * Created: November 6, 2025
 * Purpose: Enforce micro-behavior "Don't force meta-commentary on every dynamic shift"
 */

export interface FieldLimiterState {
  lastReflectionAt?: number;
}

const WINDOW_MS = 60_000; // 60 seconds

/**
 * Patterns that indicate a field meta-reflection
 */
const REFLECTION_PATTERNS = [
  /field feels/i,
  /rhythm/i,
  /coherence/i,
  /pause/i,
  /space feels/i,
  /space between/i,
  /the pace/i,
  /something shifted/i,
  /I notice.*(?:rhythm|pace|field)/i
];

/**
 * Field Reflection Rate Limiter
 *
 * Tracks when MAIA last made a field reflection and enforces
 * a cooling-off period to prevent stacking meta-commentary.
 */
export class FieldReflectionLimiter {
  private state: FieldLimiterState;

  constructor(state?: FieldLimiterState) {
    this.state = state ?? {};
  }

  /**
   * Check if a reflection is allowed given the current time
   */
  canReflect(now = Date.now()): boolean {
    const last = this.state.lastReflectionAt;
    // If never reflected, allow first reflection
    if (last === undefined) return true;
    return now - last >= WINDOW_MS;
  }

  /**
   * Mark that a reflection has occurred at the given time
   */
  markReflected(now = Date.now()): void {
    this.state.lastReflectionAt = now;
  }

  /**
   * Get the current state (for persistence)
   */
  getState(): FieldLimiterState {
    return this.state;
  }

  /**
   * Time remaining until next reflection allowed (in ms)
   */
  timeUntilNextReflection(now = Date.now()): number {
    if (this.canReflect(now)) return 0;
    const last = this.state.lastReflectionAt ?? 0;
    return Math.max(0, WINDOW_MS - (now - last));
  }
}

/**
 * Detect if text contains a field meta-reflection
 */
export function isFieldReflection(text: string): boolean {
  return REFLECTION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Strip field reflection sentence from text
 *
 * Keeps the first sentence (content), removes meta-reflection.
 * Used when rate limit is exceeded.
 */
export function stripReflection(text: string): string {
  // If text has no periods, return as-is
  if (!text.includes('.')) {
    return text;
  }

  // Split into sentences
  const sentences = text.split(/\.\s+/);

  // Find first non-reflection sentence
  const contentSentence = sentences.find(s => !isFieldReflection(s));

  // Return content sentence, or if all are reflections, return first sentence
  // Only add period if it doesn't already end with one
  if (contentSentence) {
    return contentSentence.endsWith('.') ? contentSentence : contentSentence + '.';
  }

  if (sentences[0]) {
    return sentences[0].endsWith('.') ? sentences[0] : sentences[0] + '.';
  }

  return text;
}

/**
 * Apply rate limiting to MAIA's response
 *
 * @param text - Raw generated text
 * @param limiter - Field reflection limiter instance
 * @param now - Current timestamp (for testing)
 * @returns Cleaned text with rate limiting applied
 */
export function applyReflectionRateLimit(
  text: string,
  limiter: FieldReflectionLimiter,
  now = Date.now()
): string {
  // Check if text contains a field reflection
  if (!isFieldReflection(text)) {
    return text; // No reflection, pass through
  }

  // Check if reflection is allowed
  if (limiter.canReflect(now)) {
    limiter.markReflected(now);
    return text; // Reflection allowed
  }

  // Rate limit exceeded - strip reflection
  const timeRemaining = limiter.timeUntilNextReflection(now);
  console.log(
    `⏱️  [REFLECTION LIMITER] Rate limit active (${Math.ceil(timeRemaining / 1000)}s remaining), stripping meta-reflection`
  );

  return stripReflection(text);
}
