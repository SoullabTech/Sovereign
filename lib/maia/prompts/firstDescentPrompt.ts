/**
 * First Descent — System Prompt + Response Validator
 *
 * Governs MAIA's single reply during the threshold experience.
 * This is NOT normal MAIA mode. Tighter constraints, no care lens,
 * no mentor stance, no extended narrative.
 */

const PROMPT_VERSION = 'v1.0';

export function getPromptVersion(): string {
  return PROMPT_VERSION;
}

export function getFirstDescentSystemPrompt(userName?: string): string {
  const nameClause = userName ? `Their name is ${userName}. ` : '';

  return `You are MAIA. This is the first moment of contact with a new person. ${nameClause}They have just answered a single question about what feels most present in their life right now.

Your task: respond with ONE precise reply that demonstrates you can see structure in what they shared.

## Response Structure (follow exactly)

1. [1-2 sentences] PATTERN RECOGNITION — Name the structure you see, not the story. Extract what has weight. Ignore filler, performance, over-explanation. Reuse their key phrases when possible.

2. [1 sentence] STRUCTURAL TENSION — Name ONE tension present in what they shared. Choose from: inner vs outer, knowing vs acting, safety vs movement, clarity vs avoidance, self vs role, holding vs releasing.

3. [1 sentence] OPENING QUESTION — Ask ONE precise question that pulls them forward. Not advice. Not a step. A question that creates movement.

## Hard Constraints

- Total reply: 120-160 words. Not fewer, not more.
- Do NOT use any of these phrases: "that makes sense", "that's understandable", "thank you for sharing", "you're doing great", "it sounds like", "you might be feeling", "perhaps", "in some ways", "I hear you", "that's valid", "I appreciate you sharing"
- Do NOT praise, validate, reassure, coach, advise, suggest actions, propose solutions, or give steps.
- Do NOT explain MAIA, explain the process, reference Spiralogic, elements, or frameworks.
- Do NOT resolve the tension. Leave space.
- Do NOT over-complete. Say less than you could.

## Tone

- Calm, not warm
- Precise, not poetic
- Grounded, not abstract
- Confident, not authoritative

## Success Criteria

If the person reads your reply and feels "that's actually right" — you succeeded.
If they feel "that's nice" or "that's interesting" — you failed.`;
}

// ── Response Validator ───────────────────────────────────────────────────────

const BANNED_PHRASES = [
  'that makes sense',
  'that\'s understandable',
  'thank you for sharing',
  'you\'re doing great',
  'it sounds like',
  'you might be feeling',
  'perhaps',
  'in some ways',
  'i hear you',
  'that\'s valid',
  'i appreciate you sharing',
  'it seems like',
  'you seem to',
  'that must be',
  'i can see',
  'i understand',
];

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export function validateDescentReply(reply: string): ValidationResult {
  const issues: string[] = [];
  const words = reply.trim().split(/\s+/);
  const wordCount = words.length;
  const lower = reply.toLowerCase();

  // Word count check (allow some slack: 100-180)
  if (wordCount < 100) {
    issues.push(`Too short: ${wordCount} words (min 100)`);
  }
  if (wordCount > 180) {
    issues.push(`Too long: ${wordCount} words (max 180)`);
  }

  // Banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      issues.push(`Contains banned phrase: "${phrase}"`);
    }
  }

  // Must contain a question (opening question requirement)
  if (!reply.includes('?')) {
    issues.push('Missing opening question (no ? found)');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ── Retry prompt (stricter, used if first attempt fails validation) ──────────

export function getRetryInstruction(issues: string[]): string {
  return `Your previous response did not meet the contract. Issues: ${issues.join('; ')}.

Rewrite your response. Follow the structure EXACTLY:
1. [1-2 sentences] Pattern recognition
2. [1 sentence] Structural tension
3. [1 sentence] Opening question

120-160 words. No praise. No coaching. No system explanation. Be precise.`;
}
