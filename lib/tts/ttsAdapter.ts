/**
 * TTS Adapter — translate semantic ProsodyHints to provider-specific controls.
 *
 * This is the "rendering layer" that knows how to achieve MAIA's prosody intent
 * with the current TTS provider (OpenAI today, potentially others later).
 *
 * SOVEREIGNTY: The adapter only renders — it never decides content.
 * MAIA decides WHAT to say and HOW it should feel (via ProsodyHints).
 * The adapter just makes it happen.
 *
 * Current strategy (OpenAI TTS):
 * - Text shaping via punctuation and spacing
 * - Speed adjustment
 * - Future: SSML if provider supports it
 */

import type { ProsodyHints } from '@/src/types/voice';

/**
 * Apply prosody hints to text via punctuation/spacing shaping.
 *
 * This is provider-agnostic: works with any TTS that responds to
 * punctuation, line breaks, and natural language rhythm.
 *
 * IMPORTANT: Run this BEFORE sanitizeForTts() so sanitization
 * remains the last defense against metadata leaks.
 */
export function applyProsodyToText(text: string, hints: ProsodyHints): string {
  let t = text.trim();
  if (!t) return t;

  const afterPause = hints.pauseMs?.afterSentence ?? 120;

  // ─── SENTENCE SPACING (based on pause length) ───
  // Longer pauses = more visual breathing room
  if (afterPause >= 420) {
    // Very long pauses: double line break for paragraph-like spacing
    t = t.replace(/([.!?])\s+/g, '$1\n\n');
  } else if (afterPause >= 240) {
    // Moderate pauses: single line break
    t = t.replace(/([.!?])\s+/g, '$1\n');
  } else if (afterPause >= 180) {
    // Subtle pauses: double space
    t = t.replace(/([.!?])\s+/g, '$1  ');
  }
  // Under 180ms: keep original spacing

  // ─── WARMTH SHAPING ───
  // Very warm delivery often lands better with softer endings
  if (hints.warmth === 'very_warm') {
    // Replace hard period endings with ellipsis for gentler landing
    // Only at the very end of the text
    t = t.replace(/\.(\s*)$/, '…$1');
  }

  // ─── CEREMONIAL / RITUAL SHAPING ───
  if (hints.intentTag === 'ritual') {
    // Add grounding opener (doesn't change meaning, just pacing)
    if (!t.startsWith('Okay.') && !t.startsWith('Alright.') && t.length > 80) {
      t = `Okay.\n${t}`;
    }
    // Soften the ending
    t = t.replace(/\.(\s*)$/, '…$1');
  }

  // ─── EMPHASIS SHAPING ───
  if (hints.emphasis === 'strong') {
    // Add micro-pauses around key conjunctions for emphasis
    t = t.replace(/,\s+(and|but|so|yet)\s+/gi, ' — $1 ');
  } else if (hints.emphasis === 'selective') {
    // Lighter version: only on "but" and "yet" (contrast points)
    t = t.replace(/,\s+(but|yet)\s+/gi, ' — $1 ');
  }

  // ─── PACE SHAPING ───
  if (hints.pace === 'slow') {
    // Slow pace: add breathing room after colons and semicolons
    t = t.replace(/([:;])\s+/g, '$1  ');
  }

  // ─── SOFT CLARITY ───
  if (hints.clarity === 'soft') {
    // Soft delivery: replace some commas with ellipsis for gentler pauses
    // Only do this sparingly (first comma per sentence)
    t = t.replace(/^([^.!?]+?),\s+/, '$1… ');
  }

  // ─── REGULATE INTENT ───
  if (hints.intentTag === 'regulate') {
    // Grounding/settling: ensure we end gently
    if (!t.endsWith('…')) {
      t = t.replace(/\.(\s*)$/, '.…$1');
    }
  }

  // ─── GUARDRAILS ───
  // Prevent over-shaping from causing weird punctuation

  // Clean up any double punctuation or excessive spaces we may have created
  t = t.replace(/\.\.\./g, '…');
  t = t.replace(/…\./g, '…');
  t = t.replace(/\.…/g, '…');
  t = t.replace(/\s{3,}/g, '  ');

  // Cap consecutive newlines to 2 (prevent runaway paragraph breaks)
  t = t.replace(/\n{3,}/g, '\n\n');

  // Don't stack lead-ins: if original text already had a conversational starter,
  // remove any duplicate we may have added
  if (/^(okay|alright|mm|yeah)\b/i.test(text.trim())) {
    t = t.replace(/^(Okay|Alright|Mm|Yeah)\.\n/i, '');
  }

  // ─── PRONUNCIATION FIXES ───
  // OpenAI TTS pronounces "MAIA" as "MAY-ah" — we want "MY-ah"
  // Substitute with phonetic spelling that TTS reads correctly
  t = t.replace(/\bMAIA\b/g, 'Mya');
  t = t.replace(/\bMaia\b/g, 'Mya');

  return t;
}

/**
 * Map prosody hints to TTS speed parameter.
 *
 * Keeps adjustments subtle — we want "presence", not chipmunk/sloth.
 * OpenAI TTS supports 0.25-4.0, but we stay in a tight band.
 *
 * UPDATED: Raised all floors to prevent slow-sounding speech.
 * Natural conversational pace is 0.95-1.05.
 */
export function mapProsodyToSpeed(baseSpeed: number, hints: ProsodyHints): number {
  // Ritual intent goes slightly slower (but not glacial)
  if (hints.intentTag === 'ritual') {
    return Math.max(0.92, baseSpeed - 0.06);
  }

  // Regulate intent (settling) - minimal adjustment
  if (hints.intentTag === 'regulate') {
    return Math.max(0.93, baseSpeed - 0.04);
  }

  // Pace-based adjustment
  switch (hints.pace) {
    case 'slow':
      return Math.max(0.93, baseSpeed - 0.04);
    case 'brisk':
      return Math.min(1.10, baseSpeed + 0.05);
    default:
      // Floor at 0.92 for natural conversational pace
      return Math.max(0.92, baseSpeed);
  }
}

/**
 * Generate SSML markup for engines that support it (e.g. Kokoro-FastAPI).
 *
 * Returns null when ssmlOk is false so callers can fall back to plain text
 * shaping without branching.
 *
 * Supported elements:
 *   <prosody rate="">  — pace → 85% / 100% / 110%
 *   <break time="ms"/> — before/after sentence pauses
 *   <emphasis level=""> — selective / strong emphasis on the whole sentence
 *
 * NOT included (day-one): pitch, volume, phonemes, say-as.
 * Add those once we confirm the engine parses them correctly.
 *
 * NOTE: Do NOT send SSML to OpenAI TTS — it has no SSML parser and will
 * read the XML tags aloud.  PersonaPlex uses wisdomDirective instead.
 * Kokoro-FastAPI (localhost:8880) does support a meaningful SSML subset.
 */
export function generateSSML(text: string, hints: ProsodyHints): string | null {
  if (!hints.ssmlOk) return null;
  if (!text.trim()) return null;

  // ── RATE ────────────────────────────────────────────────────────────────
  // Map pace hint to a percentage that the SSML <prosody> element accepts.
  // Keep adjustments tight — warmth comes from content, not speed extremes.
  const rate =
    hints.pace === 'slow'  ? '88%' :
    hints.pace === 'brisk' ? '108%' :
    '100%';                             // steady

  // ── EMPHASIS ─────────────────────────────────────────────────────────────
  // Wrap the body in <emphasis> when prosody hints call for it.
  // 'minimal' → no wrapper (keep prose natural).
  const emphasisLevel =
    hints.emphasis === 'strong'    ? 'strong' :
    hints.emphasis === 'selective' ? 'moderate' :
    null; // minimal — no emphasis wrapper

  // ── PAUSES ───────────────────────────────────────────────────────────────
  // Cap at 600 ms; most SSML engines clip longer breaks silently.
  const beforeMs = Math.min(hints.pauseMs?.beforeSentence ?? 0, 600);
  const afterMs  = Math.min(hints.pauseMs?.afterSentence  ?? 0, 600);

  // ── ESCAPE XML ───────────────────────────────────────────────────────────
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // ── ASSEMBLE ─────────────────────────────────────────────────────────────
  const body = emphasisLevel
    ? `<emphasis level="${emphasisLevel}">${escaped}</emphasis>`
    : escaped;

  const parts: string[] = ['<speak>'];
  if (beforeMs > 0) parts.push(`<break time="${beforeMs}ms"/>`);
  parts.push(`<prosody rate="${rate}">${body}</prosody>`);
  if (afterMs > 0)  parts.push(`<break time="${afterMs}ms"/>`);
  parts.push('</speak>');

  return parts.join('');
}

/**
 * Full prosody application: text + speed + optional SSML.
 */
export function applyFullProsody(
  text: string,
  baseSpeed: number,
  hints: ProsodyHints
): { text: string; speed: number; ssml: string | null } {
  return {
    text: applyProsodyToText(text, hints),
    speed: mapProsodyToSpeed(baseSpeed, hints),
    ssml: generateSSML(text, hints),
  };
}
