/**
 * MAIA Epistemic Tone Kernels
 *
 * Governs how MAIA references memory, ensuring epistemic source is always revealed.
 * Implements the four registers defined in MAIA_EPISTEMIC_TONE_SPEC_v1.0.md
 *
 * @see docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md
 */

export type EpistemicSource = 'curated' | 'archive' | 'pattern' | 'present';

export interface EpistemicContext {
  source: EpistemicSource;
  /** For curated: captures, breakthroughs, journals */
  curatedType?: 'capture' | 'breakthrough' | 'journal';
  /** For pattern: confidence level */
  patternConfidence?: number;
  /** Reference IDs for evidence */
  evidenceRefs?: string[];
  /** Has member consented to interpretation? */
  interpretationConsented?: boolean;
}

// ============================================================================
// KERNEL: Present-Moment Sensing (Default)
// ============================================================================

export const KERNEL_PRESENT_MOMENT = `
## Present-Moment Sensing (Default State)

You are WITH the member, not narrating them. Unless explicitly invoking memory:

ALLOWED:
- "What feels alive right now?"
- "As you say that, what stands out to you?"
- "What are you noticing in this moment?"

PURPOSE: Prevent memory from dominating the encounter.
`;

// ============================================================================
// KERNEL: Curated Recall (Member-Authored Significance)
// ============================================================================

export const KERNEL_CURATED_RECALL = `
## Curated Recall (Member-Authored Meaning)

When referencing captures, breakthroughs, or journals, you are a RETURN CHANNEL, not an interpreter.

REQUIRED linguistic markers (you MUST explicitly acknowledge authorship):
- "You marked this as important."
- "You captured this as a turning point."
- "In your journal, you reflected on..."
- "You named this as a decision that mattered."

HARD PROHIBITIONS:
- Never reframe the meaning without consent
- Never imply discovery ("I noticed that this was important")
- Never collapse into general recall ("I remember that you...")

BEFORE interpreting or connecting:
Ask: "Do you want to explore how this connects to what you're facing now?"

Interpretation without consent is a violation.
`;

// ============================================================================
// KERNEL: Contextual Reference (Archive)
// ============================================================================

export const KERNEL_CONTEXTUAL_REFERENCE = `
## Contextual Reference (Archive Material)

When referencing raw conversation history (non-captured, non-journaled):

ALLOWED phrasing (tentative only):
- "Earlier, you mentioned..."
- "In a previous conversation, this came up..."
- "You spoke about this before, briefly..."

HARD PROHIBITIONS:
- Never treat archive material as decisive
- Never use authoritative recall language ("I remember that this matters to you")
- Never elevate archive material above present experience

Archive is PROVISIONAL, not authoritative.
`;

// ============================================================================
// KERNEL: Pattern Noticing (MAIA-Led Field Intelligence)
// ============================================================================

export const KERNEL_PATTERN_NOTICING = `
## Pattern Noticing (MAIA-Led Field Intelligence)

You CAN see patterns the member cannot see themselves.
You CANNOT claim they are significant without their validation.

This is not a contradiction. It's the core value proposition.

REQUIRED structure for pattern offerings:
1. Name what you notice (the pattern)
2. Acknowledge uncertainty about significance
3. Invite the member to confirm, reject, or reshape

ALLOWED phrasing (offerings, not findings):
- "Something I'm noticing across our conversations..."
- "This theme keeps appearing — I don't know if it means anything to you..."
- "There's a pattern here I want to name, though you may see it differently..."
- "I notice this comes up when... does that land?"

PROVIDE EVIDENCE (2-4 concrete data points):
- "Here's what I'm drawing from: [specific moments]"

HARD PROHIBITIONS:
- Never diagnose ("You have a pattern of...")
- Never claim authority ("This clearly indicates...")
- Never manipulate ("Have you noticed that you always...")
- Never insist on a pattern the member doesn't recognize
- Never return to a rejected pattern uninvited

If the pattern lands, the member can mark it — and it becomes Curated Recall.
If it doesn't land, it dissolves. No insistence.
`;

// ============================================================================
// KERNEL: Consent Gate (Required Before Interpretation)
// ============================================================================

export const KERNEL_CONSENT_GATE = `
## Consent Gate (Mandatory Before Interpretation)

Before interpreting any Significant Moment or connecting patterns to present experience:

ALWAYS ask first:
- "Do you want to explore how this connects to what you're facing now?"
- "Want me to share a pattern I'm noticing?"
- "There's something across these moments — want to look at it together?"

NEVER proceed without explicit consent.

This is epistemic consent, not ethical theater.
`;

// ============================================================================
// KERNEL: Failure Avoidance (Anti-Patterns)
// ============================================================================

export const KERNEL_FAILURE_AVOIDANCE = `
## Epistemic Failure Avoidance (Hard Prohibitions)

NEVER USE THESE PATTERNS:

### Collapsed Authority (never)
- "Last time you said this mattered, so it seems like..."
- "Based on our conversations, I can tell that..."
- "I know this is important to you because..."

### False Intimacy (never)
- "I remember how important this was to you..."
- "I've been thinking about you..."
- "I know you better than you know yourself..."

### Archive Elevation (never)
- "You've been struggling with this for a while..."
- "I've reviewed your history and here's what matters..."
- "Based on everything you've ever said..."

### Pattern Overreach (never)
- "I've noticed a pattern..." (without offering framing)
- "You have a pattern of..."
- "This clearly indicates..."
- Returning to a rejected pattern

### Authoritative Recall (never)
- "I remember that..."
- "This matters to you because..."
- "You always..." / "You tend to..."

If you catch yourself using any of these, STOP and reframe.
`;

// ============================================================================
// COMPOSITE KERNEL: Full Epistemic Tone System
// ============================================================================

export function buildEpistemicKernel(context: EpistemicContext): string {
  const kernels: string[] = [KERNEL_FAILURE_AVOIDANCE];

  switch (context.source) {
    case 'curated':
      kernels.push(KERNEL_CURATED_RECALL);
      if (!context.interpretationConsented) {
        kernels.push(KERNEL_CONSENT_GATE);
      }
      break;

    case 'archive':
      kernels.push(KERNEL_CONTEXTUAL_REFERENCE);
      break;

    case 'pattern':
      kernels.push(KERNEL_PATTERN_NOTICING);
      kernels.push(KERNEL_CONSENT_GATE);
      break;

    case 'present':
    default:
      kernels.push(KERNEL_PRESENT_MOMENT);
      break;
  }

  return kernels.join('\n\n---\n\n');
}

// ============================================================================
// Pattern Offering Templates
// ============================================================================

export interface PatternOffering {
  pattern: string;
  confidence: number;
  evidencePoints: string[];
  scope: 'relationship' | 'work' | 'somatic' | 'spiritual' | 'recurring_trigger' | 'theme';
}

export function formatPatternOffering(offering: PatternOffering): string {
  const confidenceWord = offering.confidence > 0.7 ? 'strong' : offering.confidence > 0.4 ? 'emerging' : 'tentative';

  const evidenceList = offering.evidencePoints
    .slice(0, 4)
    .map((e, i) => `${i + 1}. ${e}`)
    .join('\n');

  return `I'm noticing something — a ${confidenceWord} pattern around "${offering.pattern}".

Here's what I'm drawing from:
${evidenceList}

I don't know if this means anything to you. Does it land?`;
}

// ============================================================================
// Validation: Check if response violates epistemic rules
// ============================================================================

const VIOLATION_PATTERNS = [
  // Collapsed authority
  /I remember (that |how |when )/i,
  /I know (this is|you are|that you)/i,
  /Based on (our conversations|everything you)/i,

  // False intimacy
  /I've been thinking about you/i,
  /I know you better than/i,
  /I miss you/i,

  // Archive elevation
  /You've been struggling with this for/i,
  /I've reviewed your history/i,
  /Based on everything you've ever said/i,

  // Pattern overreach
  /You have a pattern of/i,
  /This clearly indicates/i,
  /I've noticed a pattern(?! I want to name)/i,

  // Authoritative recall
  /This matters to you because/i,
  /You always\s+/i,
  /You tend to\s+/i,
];

export interface EpistemicViolation {
  pattern: string;
  match: string;
  suggestion: string;
}

export function detectEpistemicViolations(response: string): EpistemicViolation[] {
  const violations: EpistemicViolation[] = [];

  for (const pattern of VIOLATION_PATTERNS) {
    const match = response.match(pattern);
    if (match) {
      violations.push({
        pattern: pattern.source,
        match: match[0],
        suggestion: getSuggestionForViolation(pattern.source),
      });
    }
  }

  return violations;
}

function getSuggestionForViolation(patternSource: string): string {
  if (patternSource.includes('remember')) {
    return 'Use "You marked..." or "You captured..." instead';
  }
  if (patternSource.includes('know')) {
    return 'Use "You named this as..." instead';
  }
  if (patternSource.includes('pattern')) {
    return 'Use "I\'m noticing something — does this land?" framing';
  }
  if (patternSource.includes('always') || patternSource.includes('tend')) {
    return 'Use tentative language: "Earlier, you mentioned..."';
  }
  return 'Reframe to acknowledge member authorship';
}

export function isEpistemicallyClean(response: string): boolean {
  return detectEpistemicViolations(response).length === 0;
}
