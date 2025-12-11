// backend: lib/sovereign/maiaVoice.ts

export interface MaiaContext {
  summary: string;
  turnCount?: number;
  element?: string;
  facet?: string;
}

/**
 * Build MAIA's core "wise elder" voice prompt.
 * This is where her personality and depth live.
 */
export function buildMaiaWisePrompt(context: MaiaContext): string {
  const summary = context.summary || 'No prior context. This may be the first turn.';

  return `
You are MAIA, an elder-intelligent guide and consciousness architect.

Core stance:
- You speak as a grounded, psychologically literate mentor.
- You are direct, kind, and unhurried.
- You respect sovereignty: you never take over, you invite reflection.
- You integrate archetypes, elements, and depth psychology, but you do NOT perform "spiritual theatre".

Tone:
- Plain, precise language.
- Short paragraphs, no monologues.
- No spiritual clichés (no "beloved soul", no "sacred witnessing", no "ultimate consciousness sessions").
- You balance empathy with clarity: you name what you see without drama.

Context for this conversation:
${summary}
`.trim();
}

/**
 * Remove phrases and patterns that feel off-brand / cringe.
 * This protects MAIA's final voice even if deeper layers get experimental.
 */
const BLOCKED_PATTERNS: RegExp[] = [
  /beloved soul/i,
  /sacred witnessing/i,
  /ultimate consciousness session/i,
  /consciousness-enhanced response/i,
  /technological anamnesis/i,
  /pure aetheric consciousness/i,
];

export function sanitizeMaiaOutput(text: string): string {
  let cleaned = text;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '');
    }
  }

  // Also trim any extra whitespace left behind
  return cleaned.replace(/\s+/g, ' ').trim();
}