/**
 * Forward-Readiness Detection
 *
 * Detects when the user has completed deliberation and is explicitly asking
 * for practical movement (language, framing, articulation, execution support).
 *
 * The Sacred Attending prompt biases MAIA toward reflection and depth. That is
 * usually correct. But when the user has already decided and is asking for
 * help with HOW to communicate, frame, or act, the depth-first reflex can
 * re-open decisions the user has explicitly closed.
 *
 * This module adds a lightweight pre-prompt signal. When forward-readiness is
 * detected, an addendum is appended to the system prompt instructing the LLM
 * to honor the practical request directly, without re-opening deliberation.
 *
 * DESIGN PRINCIPLES:
 *   - Conservative: fires only on explicit directive-shift signals
 *   - Blocked by doubt: any active ambivalence in the message suppresses it
 *   - Additive: does not modify the Sacred Attending prompt itself
 *   - Stateless: evaluates the current message only
 *
 * CANON ALIGNMENT:
 *   - Sovereignty first: honors the user's stated request
 *   - No coercion: returns authorship rather than imposing depth
 *   - Reduces psychological centrality: moves life outward into action
 */

export type ForwardReadiness = {
  ready: boolean;
  signals: string[];
};

/**
 * Detect forward-readiness in a user message.
 *
 * Returns `ready: true` only when:
 *   1. No active doubt or deliberation is present in the message, AND
 *   2. At least one explicit directive-shift pattern is matched
 *
 * Returns `ready: false` when the message contains doubt language
 * (second-guessing, reconsidering, "i don't know", etc.), or when no
 * directive-shift signal is found.
 */
export function detectForwardReadiness(message: string): ForwardReadiness {
  const m = message.toLowerCase();

  // Negative signals: active doubt or deliberation in the current message.
  // When any of these are present, forward-readiness does not apply —
  // the user is still processing, not asking for execution support.
  //
  // NOTE: "part of me" is intentionally NOT in this list. It is often a
  // healthy dual-state expression (parts-work, holding complexity) rather
  // than doubt per se, and blocking on it would suppress valid integration.
  const doubtRegex =
    /\b(second-?guess|reconsider|not sure|unsure|conflicted|i don'?t know|going back and forth|maybe i shouldn'?t|wondering if|what if)\b/;
  if (doubtRegex.test(m)) {
    return { ready: false, signals: ['doubt_present'] };
  }

  const signals: string[] = [];

  // Positive signals: explicit directive-shift patterns.
  // Each pattern captures a way the user signals "deliberation is done,
  // I need help with the practical move now."
  const patterns: Array<[string, RegExp]> = [
    [
      'ask_for_language',
      /\b(help me (say|communicate|frame|craft|articulate|draft|find (the )?words|finding (the )?(language|words))|give me (a )?(script|language|the words)|how (do|should) i (say|tell|communicate)|what should i say)\b/,
    ],
    ['what_matters_now', /\bwhat matters now is how\b/],
    ['short_version', /\bshort,?\s*clear version\b/],
    [
      'past_deciding',
      /\b(i don'?t need help deciding|past (deciding|deliberation)|done deciding|not asking whether)\b/,
    ],
    [
      'directive_practical',
      /\b(just (need|want) (the )?(words|language|script|version|answer)|keep it (simple|short|practical))\b/,
    ],
    // Softer, more natural language for "help me approach / frame / handle this"
    // that users often reach for without using imperative "help me say" phrasing.
    [
      'soft_how',
      /\b(how to (approach|handle|have|frame)|best way to (say|handle|approach)|want to (be|say|do this) (well|right|carefully|thoughtful(ly)?))\b/,
    ],
  ];

  for (const [name, re] of patterns) {
    if (re.test(m)) signals.push(name);
  }

  return { ready: signals.length > 0, signals };
}

/**
 * Build the system prompt addendum for forward-readiness.
 *
 * This block is appended to the final system prompt (last position, after
 * all other context blocks) so it takes priority over the depth-first
 * default in the Sacred Attending prompt.
 *
 * The block is intentionally terse. It lists two soft restraints (don't
 * re-open decisions unless asked, don't prioritize inward exploration first)
 * plus a positive instruction (offer the concrete thing they asked for).
 *
 * Depth work remains welcome — it just cannot precede the practical delivery
 * when forward-readiness is detected.
 */
export function buildForwardReadinessBlock(): string {
  return [
    '',
    '## FORWARD READINESS (detected)',
    'The user has indicated that deliberation on this topic has completed and they are asking for practical movement — language, framing, articulation, or execution support. Honor the request directly.',
    '',
    '- Do not re-open the decision layer unless the user explicitly asks to revisit it',
    '- Do not prioritize further inward exploration before responding to the practical request',
    '- Do offer the concrete thing they asked for: words, script, frame, structure',
    '- If additional depth feels necessary, offer it AFTER the practical response, not instead of it',
    '- The user\'s explicit request is the authoritative signal; respect it',
    '',
  ].join('\n');
}
