/**
 * Daoist Voice Transformer — Layer 3 (Expression Refinement)
 *
 * Shapes how insight is spoken, not what is concluded.
 * Reduces explanatory drift and moves language toward image, space, and process.
 *
 * 5 Voice Laws:
 *   1. Say less than you could
 *   2. Prefer image over abstraction
 *   3. Allow paradox
 *   4. No premature meaning
 *   5. Speak from within the process
 *
 * This is a post-processing style pass, not a new generator.
 * The same system, speaking with more grace.
 *
 * Canon: docs/canon/SOULLAB_VOICE_DOCTRINE_DAOIST.md
 *
 * PHASE GATE: This module is available but gated behind
 * the `daoistVoiceLayer` feature flag. Phase 2+ only.
 */

export interface DaoistVoiceOptions {
  maxSentences?: number;
  preserveQuestions?: boolean;
}

const DEFAULT_OPTIONS: DaoistVoiceOptions = {
  maxSentences: 4,
  preserveQuestions: true,
};

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\byou are experiencing\b/gi, 'you are in'],
  [/\bthis means that\b/gi, 'this suggests'],
  [/\bit is important to\b/gi, 'let yourself'],
  [/\byou need to\b/gi, 'you may need to'],
  [/\bthe situation is\b/gi, 'the field is'],
  [/\bunresolved material\b/gi, 'what has not yet settled'],
  [/\bemotional processing\b/gi, 'something moving beneath the surface'],
  [/\bclarity\b/gi, 'clear seeing'],
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function softenDirectiveLanguage(text: string): string {
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function removeOverExplanation(text: string): string {
  return text
    .replace(/\btherefore\b/gi, '')
    .replace(/\bhowever\b/gi, 'but')
    .replace(/\bin other words\b/gi, '')
    .replace(/\bessentially\b/gi, '')
    .replace(/\bbasically\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function makeMoreImageBased(text: string): string {
  return text
    .replace(/\bprocess\b/gi, 'movement')
    .replace(/\bpattern\b/gi, 'shape')
    .replace(/\bstate\b/gi, 'weather')
    .replace(/\btransition\b/gi, 'crossing');
}

export function toDaoistVoice(
  input: string,
  options: DaoistVoiceOptions = DEFAULT_OPTIONS,
): string {
  const merged = { ...DEFAULT_OPTIONS, ...options };

  let text = input.trim();
  text = softenDirectiveLanguage(text);
  text = removeOverExplanation(text);
  text = makeMoreImageBased(text);

  let sentences = splitSentences(text);

  if (!merged.preserveQuestions) {
    sentences = sentences.filter(sentence => !sentence.endsWith('?'));
  }

  sentences = sentences.slice(0, merged.maxSentences);

  return sentences.join(' ').trim();
}
