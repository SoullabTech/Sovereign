/**
 * SpeechWeaver — engine-aware prosody shaping for spoken text.
 *
 * Kokoro is a literal prosody engine: it reads punctuation and spacing,
 * but doesn't infer emphasis or emotional cadence from meaning.
 * OpenAI TTS is a semantic prosody engine: it adds breath, emphasis,
 * and pitch contour automatically.
 *
 * SpeechWeaver bridges the gap. It reshapes text for Kokoro so the
 * spoken output carries the presence that PFI's intent demands.
 *
 * Rules:
 *   A. Pronunciation fixes (MAIA -> Mya, etc.)
 *   B. Breath segmentation (break long sentences at clause joints)
 *   C. Tender spacing (ellipses, line breaks for warmth > 0.7)
 *   D. Directive crispness (clean edges for high directiveness)
 *   E. Ritual lineation (one sentence per breath)
 *   F. Playful rhythm (shorter phrases, beat dashes)
 *
 * SOVEREIGNTY: This layer only changes how text is spoken, never what
 * is stored or displayed. The chat transcript is untouched.
 *
 * @module lib/tts/speechWeaver
 */

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface WeaverIntent {
  /** Elemental state from conductor */
  element?: string;
  /** Warmth signal — 'warm' or 'very_warm' trigger softer shaping */
  warmth?: 'cool' | 'neutral' | 'warm' | 'very_warm';
  /** PFI intensity 0-1 — high intensity gets more deliberate pacing */
  intensity?: number;
  /** Motion — 'stuck' gets gentler, 'breakthrough' gets brighter */
  motion?: 'ascending' | 'stuck' | 'breakthrough';
  /** Relational stance from relationalHint */
  stance?: 'HOLD' | 'MIRROR' | 'CHALLENGE' | 'RELEASE' | 'SEASONAL_RETURN';
  /** Intent tag from prosodyHints (if already built upstream) */
  intentTag?: 'regulate' | 'attune' | 'encourage' | 'instruct' | 'ritual' | 'play';
  /** Directiveness 0-1 — high directiveness gets clean edges */
  directiveness?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

/** Max chars before sentence splitting kicks in */
const MAX_SENTENCE_CHARS = 100;

/** Clause-splitting conjunctions */
const CLAUSE_JOINTS = /\s+(and|but|so|because|which|that|while|however|therefore|although|though|since|before|after|when|if)\s+/gi;

// ═══════════════════════════════════════════════════════════════════════════
// Pronunciation Fixes (engine-agnostic — apply everywhere)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fix pronunciation issues that affect TTS engines.
 * Safe to apply to any engine — these are phonetic corrections, not style.
 */
function fixPronunciation(text: string): string {
  let t = text;

  // MAIA → Mya — both engines mispronounce "MAIA" as "MAY-ah"
  // We want "MY-ah" (like the name Maya)
  t = t.replace(/\bMAIA\b/g, 'Mya');
  t = t.replace(/\bMaia\b/g, 'Mya');

  // Soullab → Soul Lab (prevent running together)
  t = t.replace(/\bSoullab\b/gi, 'Soul Lab');
  t = t.replace(/\bSOULLAB\b/g, 'Soul Lab');

  return t;
}

// ═══════════════════════════════════════════════════════════════════════════
// Kokoro-Specific Shaping
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rule A: Break long sentences at clause joints.
 * Kokoro reads long sentences in a single monotone arc.
 * Splitting at natural joints gives it breath points.
 */
function segmentBreath(text: string, maxChars: number = MAX_SENTENCE_CHARS): string {
  // Split on sentence boundaries first
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length <= maxChars) {
      out.push(sentence);
      continue;
    }

    // Split long sentence at clause joints
    const parts: string[] = [];
    let remaining = sentence;
    let match: RegExpExecArray | null;
    const localJoints = new RegExp(CLAUSE_JOINTS.source, 'gi');

    while ((match = localJoints.exec(remaining)) !== null) {
      const before = remaining.slice(0, match.index).trim();
      if (before.length > 0) {
        parts.push(before);
      }
      remaining = match[1] + ' ' + remaining.slice(match.index + match[0].length);
      localJoints.lastIndex = 0; // Reset after modifying remaining
    }
    if (remaining.trim()) {
      parts.push(remaining.trim());
    }

    if (parts.length <= 1) {
      // Couldn't split — use as-is
      out.push(sentence);
    } else {
      // Join with period+space to create breath points
      out.push(parts.join('. '));
    }
  }

  return out.join(' ');
}

/**
 * Rule B: Tender/warm spacing — softer delivery for holding states.
 * Adds ellipses and line breaks so Kokoro pauses between sentences.
 */
function applyTenderSpacing(text: string): string {
  // Replace hard period transitions with ellipsis for breath
  let t = text.replace(/\. (I|We|You|It|This|That|There|Here|What|How|Let)\b/g, '... $1');

  // Add line breaks between sentences for Kokoro to breathe
  t = t.replace(/\.\s+/g, '.\n');
  t = t.replace(/\?\s+/g, '?\n');

  return t;
}

/**
 * Rule C: Directive crispness — clean edges for clear guidance.
 * Removes softening punctuation, keeps sentences tight.
 */
function applyDirectiveCrispness(text: string): string {
  return text
    .replace(/\.\.\./g, '.')
    .replace(/…/g, '.')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Rule D: Ritual lineation — one sentence per breath, spacious pacing.
 * For threshold moments, ceremonies, and deep presence.
 */
function applyRitualLineation(text: string): string {
  const lines = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (lines.length <= 1) return text;

  // Blank line after first sentence = intentional breath
  const [first, ...rest] = lines;
  return [first, '', ...rest].join('\n').trim();
}

/**
 * Rule E: Playful rhythm — shorter phrases, beat dashes.
 * For Puck archetype and high-energy playful states.
 */
function applyPlayfulRhythm(text: string): string {
  // Add beat dashes at comma boundaries for rhythm
  return text
    .replace(/,\s+/g, ' -- ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// Mode Detection (from intent signals)
// ═══════════════════════════════════════════════════════════════════════════

function isTender(intent?: WeaverIntent): boolean {
  if (!intent) return false;
  return (
    intent.warmth === 'very_warm' ||
    intent.warmth === 'warm' ||
    intent.stance === 'HOLD' ||
    intent.intentTag === 'regulate' ||
    intent.intentTag === 'attune' ||
    intent.motion === 'stuck' ||
    (intent.element === 'water' && (intent.intensity ?? 0) > 0.5)
  );
}

function isDirective(intent?: WeaverIntent): boolean {
  if (!intent) return false;
  return (
    intent.stance === 'CHALLENGE' ||
    intent.intentTag === 'instruct' ||
    (typeof intent.directiveness === 'number' && intent.directiveness > 0.7)
  );
}

function isRitual(intent?: WeaverIntent): boolean {
  if (!intent) return false;
  return (
    intent.intentTag === 'ritual' ||
    intent.element === 'aether' ||
    (intent.intensity ?? 0) > 0.85
  );
}

function isPlayful(intent?: WeaverIntent): boolean {
  if (!intent) return false;
  return intent.intentTag === 'play';
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect if text has already been shaped by upstream prosody (ttsAdapter).
 * If so, skip mode-specific shaping to prevent double-prosody artifacts.
 *
 * Signs of upstream shaping:
 * - Line breaks between sentences (ttsAdapter adds these for pause timing)
 * - Multiple ellipses (warmth/ceremonial shaping)
 * - Em dashes around conjunctions (emphasis shaping)
 */
function hasUpstreamShaping(text: string): boolean {
  const newlineCount = (text.match(/\n/g) || []).length;
  const ellipsisCount = (text.match(/…/g) || []).length;
  const emDashCount = (text.match(/ — /g) || []).length;

  // If text has 2+ newlines, or 2+ ellipses, or em-dashes — it's been shaped
  return newlineCount >= 2 || ellipsisCount >= 2 || emDashCount >= 1;
}

/**
 * Weave text for Kokoro TTS.
 *
 * This is the embodiment layer. It doesn't change what MAIA says —
 * it changes how it's felt when spoken through a literal prosody engine.
 *
 * Applied in ttsRouter.synthesize() so ALL Kokoro paths benefit:
 * stream-conversation, local-tts, preview — everything.
 *
 * Double-shaping safety: If upstream applyProsodyToText() (ttsAdapter.ts)
 * has already shaped the text, SpeechWeaver only applies pronunciation
 * fixes and breath segmentation — skipping mode-specific shaping to
 * prevent over-articulation.
 *
 * @param rawText - The text to speak (may already have upstream prosody shaping)
 * @param intent - PFI intent signals (element, warmth, motion, stance, etc.)
 * @returns Weaved text optimized for Kokoro's prosody
 */
export function weaveForKokoro(rawText: string, intent?: WeaverIntent): string {
  let text = rawText.trim();
  if (!text) return text;

  // 1. Always: pronunciation fixes (idempotent — safe to run twice)
  text = fixPronunciation(text);

  // 2. Always: breath segmentation (Kokoro's #1 weakness is long sentences)
  //    Safe on already-segmented text — short sentences pass through unchanged
  text = segmentBreath(text);

  // 3. Mode-specific shaping — but ONLY if upstream hasn't already shaped.
  //    The stream-conversation path applies applyProsodyToText() before we get here.
  //    The local-tts and preview paths don't — they arrive unshapen.
  //    This check prevents double-prosody (over-articulated, performative voice).
  if (!hasUpstreamShaping(text)) {
    if (isDirective(intent)) {
      text = applyDirectiveCrispness(text);
    } else if (isRitual(intent)) {
      text = applyRitualLineation(text);
    } else if (isPlayful(intent)) {
      text = applyPlayfulRhythm(text);
    } else if (isTender(intent)) {
      text = applyTenderSpacing(text);
    }
  }

  // 4. Guardrails: clean up any shaping artifacts
  text = text.replace(/\.{4,}/g, '...');   // Prevent excessive dots
  text = text.replace(/…\./g, '...');       // Normalize ellipsis
  text = text.replace(/\.…/g, '...');
  text = text.replace(/\n{3,}/g, '\n\n');   // Cap newlines
  text = text.replace(/\s{3,}/g, '  ');     // Cap spaces

  return text.trim();
}

/**
 * Minimal shaping for non-Kokoro engines (OpenAI, future Sesame).
 * Applies pronunciation fixes and strips markdown — these engines handle prosody themselves.
 * Sesame will eventually get its own weaveForSesame() when the hybrid layer ships.
 */
export function weaveForCloud(rawText: string): string {
  let t = rawText.trim();
  t = fixPronunciation(t);
  // Strip markdown emphasis (bold/italic) — TTS should speak words, not asterisks
  t = t.replace(/\*\*(.+?)\*\*/g, '$1');
  t = t.replace(/\*(.+?)\*/g, '$1');
  t = t.replace(/__(.+?)__/g, '$1');
  t = t.replace(/_(.+?)_/g, '$1');
  return t;
}
