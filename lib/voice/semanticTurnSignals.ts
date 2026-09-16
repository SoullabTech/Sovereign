/**
 * TURN-02 high-precision semantic turn cues.
 *
 * Observable wording only. No sentiment, arousal, personality, or psychological
 * inference. Scores are evidence for the shadow arbiter, never send authority.
 */
export type SemanticTurnSignals = {
  semanticIncomplete: number | null;
  semanticYield: number | null;
  reasons: string[];
};

const HOLD_PHRASES = [
  /\b(?:give me (?:a|one) (?:second|moment)|let me think|hold on|one second|one moment|i(?:'m| am) not done|stay with me)\b[.!?…]*$/i,
];

const YIELD_PHRASES = [
  /\b(?:i(?:'m| am) done|that(?:'s| is) it|your turn|go ahead|what do you think|what are your thoughts|how does that land|can you respond|tell me what you think)\b[.!?]*$/i,
];

const DANGLING_WORDS = new Set([
  'and', 'but', 'because', 'so', 'if', 'when', 'while', 'although', 'though',
  'that', 'which', 'who', 'where', 'with', 'without', 'for', 'from', 'to', 'of',
  'as', 'than', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'can', 'could', 'would', 'should', 'will', 'may', 'might', 'must',
  'the', 'a', 'an',
]);

const FILLER_ENDINGS = /(?:\b(?:um+|uh+|erm+|hmm+)|\b(?:you know|i mean|kind of|sort of))\s*[,.…]*$/i;

function maxNullable(a: number | null, b: number): number {
  return a == null ? b : Math.max(a, b);
}

export function inferSemanticTurnSignals(transcript: string): SemanticTurnSignals {
  const text = transcript.trim().replace(/\s+/g, ' ');
  if (!text) return { semanticIncomplete: null, semanticYield: null, reasons: [] };

  let semanticIncomplete: number | null = null;
  let semanticYield: number | null = null;
  const reasons: string[] = [];

  if (HOLD_PHRASES.some((r) => r.test(text))) {
    semanticIncomplete = 1;
    reasons.push('explicit_hold_phrase');
  }

  if (YIELD_PHRASES.some((r) => r.test(text))) {
    semanticYield = 1;
    reasons.push('explicit_yield_phrase');
  }

  if (/\.{3}|…$/.test(text)) {
    semanticIncomplete = maxNullable(semanticIncomplete, 0.9);
    reasons.push('trailing_ellipsis');
  }

  if (FILLER_ENDINGS.test(text)) {
    semanticIncomplete = maxNullable(semanticIncomplete, 0.82);
    reasons.push('trailing_filler');
  }

  const stripped = text.replace(/[.!?,;:…]+$/g, '').trim().toLowerCase();
  const lastWord = stripped.split(/\s+/).at(-1) ?? '';
  if (DANGLING_WORDS.has(lastWord)) {
    semanticIncomplete = maxNullable(semanticIncomplete, 0.9);
    reasons.push('dangling_syntax');
  }

  const pairs: Array<[string, string]> = [['(', ')'], ['[', ']'], ['{', '}']];
  if (pairs.some(([open, close]) => text.split(open).length - 1 > text.split(close).length - 1)) {
    semanticIncomplete = maxNullable(semanticIncomplete, 0.85);
    reasons.push('unclosed_delimiter');
  }

  return { semanticIncomplete, semanticYield, reasons };
}
