/**
 * Idea Detection — Heuristic detection of generative moments in conversation
 *
 * Architecture: 3-layer ladder
 *   1. Heuristic flagging (this module) — detect generative language
 *   2. Soft UI prompt (client toast) — "Possible idea — Save / Dismiss"
 *   3. User confirmation — only stored if member confirms
 *
 * Detection is weighted toward the USER message, not MAIA's response.
 * MAIA's response may help summarize/title an idea but must not originate
 * an idea candidate on its own. This protects authorship.
 */

export interface IdeaCandidate {
  title: string;
  summary: string;
  sourceText: string;
  confidence: number;
  /** Hash for deduplication within a session */
  fingerprint: string;
}

// --- Language markers weighted by generative intent ---

const USER_IDEA_MARKERS: Array<{ pattern: RegExp; weight: number; label: string }> = [
  // Explicit idea declaration — the strongest signal
  { pattern: /\bi have an idea\b/i, weight: 0.55, label: 'idea-declaration' },
  { pattern: /\bhere('s| is) (an |my |the )?idea\b/i, weight: 0.5, label: 'idea-declaration' },
  { pattern: /\bi('ve| have) been thinking about\b/i, weight: 0.4, label: 'idea-declaration' },
  { pattern: /\bi('d| would) like to (develop|start|launch|bring)\b/i, weight: 0.45, label: 'idea-declaration' },

  // Exploratory / generative
  { pattern: /\bwhat if\b/i, weight: 0.4, label: 'exploratory' },
  { pattern: /\bi wonder (if|whether|about)\b/i, weight: 0.35, label: 'wondering' },
  { pattern: /\bit would be interesting (if|to)\b/i, weight: 0.35, label: 'generative-interest' },
  { pattern: /\bwhat about\b/i, weight: 0.25, label: 'exploratory' },
  { pattern: /\bimagine if\b/i, weight: 0.4, label: 'visionary' },
  { pattern: /\bwhat would happen if\b/i, weight: 0.4, label: 'exploratory' },

  // Pattern recognition / insight
  { pattern: /\bi('m| am) (seeing|noticing|realizing|recognizing)\b/i, weight: 0.4, label: 'insight' },
  { pattern: /\bi just (realized|noticed|saw|understood)\b/i, weight: 0.45, label: 'insight' },
  { pattern: /\bthe pattern (here |is |seems )/i, weight: 0.4, label: 'pattern-recognition' },
  { pattern: /\bthere('s| is) something (here |about |in )/i, weight: 0.35, label: 'emerging' },
  { pattern: /\bthat reminds me of\b/i, weight: 0.3, label: 'association' },
  { pattern: /\bi('m| am) starting to (see|think|understand)\b/i, weight: 0.35, label: 'dawning' },

  // Building / creating
  { pattern: /\bi want to (build|create|make|design|write|develop)\b/i, weight: 0.45, label: 'building' },
  { pattern: /\bthis could (become|be|turn into)\b/i, weight: 0.4, label: 'potential' },
  { pattern: /\bwe (could|should|might) (build|create|try|explore)\b/i, weight: 0.35, label: 'collaborative' },
  { pattern: /\bi('d| would) (like|love|want) to (try|explore|experiment)\b/i, weight: 0.35, label: 'aspiration' },

  // Synthesis / naming
  { pattern: /\bi('ll| will) call (this|it)\b/i, weight: 0.5, label: 'naming' },
  { pattern: /\bthe (principle|framework|concept|idea) (is|here is|would be)\b/i, weight: 0.45, label: 'framework' },
  { pattern: /\bso (basically|essentially|fundamentally)\b/i, weight: 0.3, label: 'synthesis' },
  { pattern: /\bto put it (simply|another way)\b/i, weight: 0.25, label: 'synthesis' },

  // Energy / excitement
  { pattern: /\boh[!,] /i, weight: 0.2, label: 'exclamation' },
  { pattern: /\byes[!] /i, weight: 0.15, label: 'affirmation' },
  { pattern: /\bthat('s| is) (it|exactly|the thing)\b/i, weight: 0.3, label: 'crystallization' },
];

/** Minimum total score from user message to consider a candidate */
const USER_THRESHOLD = 0.4;

/** Minimum overall confidence to surface a candidate.
 *  Matches USER_THRESHOLD — a single strong user-origin signal is enough.
 *  MAIA boost can only raise confidence, never originate it. */
const CONFIDENCE_THRESHOLD = 0.4;

/** Maximum confidence (clamped) */
const MAX_CONFIDENCE = 0.95;

/**
 * Detect whether a conversation turn contains an idea-worthy moment.
 *
 * Detection is weighted toward the user's message. MAIA's response
 * may boost confidence or help with titling, but cannot originate
 * an idea candidate on its own.
 */
export function detectIdeaCandidate(
  userMessage: string,
  maiaResponse: string,
): IdeaCandidate | null {
  if (!userMessage || userMessage.length < 15) return null;

  // Score user message (primary source)
  const userScore = scoreMessage(userMessage);
  if (userScore.total < USER_THRESHOLD) return null;

  // MAIA response can provide a small boost but not originate
  const maiaScore = scoreMessage(maiaResponse || '');
  const maiaBoost = Math.min(maiaScore.total * 0.3, 0.15); // Capped at 0.15

  const rawConfidence = userScore.total + maiaBoost;
  const confidence = Math.min(rawConfidence, MAX_CONFIDENCE);

  if (confidence < CONFIDENCE_THRESHOLD) return null;

  // Extract the most idea-worthy sentence from user message
  const sourceText = extractKeySentence(userMessage, userScore.matchedLabels);
  const title = generateTitle(sourceText, userScore.matchedLabels);

  return {
    title,
    summary: sourceText,
    sourceText: userMessage.slice(0, 500), // Preserve context, capped
    confidence: Math.round(confidence * 100) / 100,
    fingerprint: hashFingerprint(title + sourceText),
  };
}

// --- Internal helpers ---

interface ScoreResult {
  total: number;
  matchedLabels: string[];
}

function scoreMessage(text: string): ScoreResult {
  let total = 0;
  const matchedLabels: string[] = [];

  for (const marker of USER_IDEA_MARKERS) {
    if (marker.pattern.test(text)) {
      total += marker.weight;
      matchedLabels.push(marker.label);
    }
  }

  // Diminishing returns — many weak matches shouldn't override threshold
  // but multiple strong matches should compound slightly
  if (matchedLabels.length > 3) {
    total = total * 0.85 + 0.15 * matchedLabels.length * 0.1;
  }

  return { total: Math.round(total * 100) / 100, matchedLabels };
}

function extractKeySentence(text: string, labels: string[]): string {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (sentences.length === 0) return text.slice(0, 200);

  // Find the sentence with the most marker matches
  let bestSentence = sentences[0];
  let bestScore = 0;

  for (const sentence of sentences) {
    let score = 0;
    for (const marker of USER_IDEA_MARKERS) {
      if (marker.pattern.test(sentence)) score += marker.weight;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }

  return bestSentence.slice(0, 300);
}

function generateTitle(sourceText: string, labels: string[]): string {
  // PRINCIPLE: Titles should feel like the user's words, not a system-generated label.
  // Prefer the user's phrasing over abstraction. Keep generative markers
  // ("what if", "I want to build") — they signal authorship.
  //
  // Only strip pure filler ("um", "well", "so basically") not intentional framing.

  const cleaned = sourceText
    .replace(/^(well,? |um,? |so basically,? |like,? )/i, '')
    .trim();

  // Take up to 10 words to preserve natural phrase boundaries
  const words = cleaned.split(/\s+/).slice(0, 10);
  let title = words.join(' ');

  // If it ends mid-phrase, trim to last natural break
  if (words.length >= 10) {
    title = title.replace(/\s+(and|or|but|that|which|the|a|an|to|for|in|of)$/i, '');
    title += '...';
  }

  // Capitalize first letter only — preserve the user's casing otherwise
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Remove trailing commas/semicolons (but keep ellipsis)
  title = title.replace(/[,;:]$/, '');

  return title || 'Emerging thought';
}

function hashFingerprint(input: string): string {
  // Simple hash for session-level deduplication (not cryptographic)
  let hash = 0;
  const normalized = input.toLowerCase().replace(/\s+/g, ' ').trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `idea_${Math.abs(hash).toString(36)}`;
}
