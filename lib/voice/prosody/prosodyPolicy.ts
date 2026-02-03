/**
 * MAIA Prosody Policy
 *
 * Deterministic prosody shaping derived from MAIA's relational state.
 * This is NOT model-driven — it's MAIA's own policy applied to text + speed.
 *
 * The sovereignty guarantee:
 * - Prosody is computed from MAIA's relational stack (mode, activation, posture, element, sanctuary)
 * - OpenAI TTS only renders audio from provided text + speed
 * - No external model decides prosody — MAIA decides, TTS executes
 *
 * Range levels (increasing effect):
 * 0 — Neutral: minimal shaping, clean speech
 * 1 — Subtle: tiny pacing + micro-pauses, slightly warmer cadence
 * 2 — Expressive: stronger pauses, emphasis shaping, more rhythmic phrasing
 * 3 — Ceremonial: spacious pauses, softened directives, temple-calm cadence
 */

export type ProsodyRange = 0 | 1 | 2 | 3;

export interface MaiaProsodyContext {
  mode?: string | null;        // e.g. REGULATOR / GUIDE / CARE
  element?: string | null;     // Fire/Water/Earth/Air/Aether
  posture?: string | null;     // e.g. MEET / HOLD / WITNESS
  activation?: number | null;  // 0..1
  sanctuary?: boolean | null;
}

export interface ProsodyPolicy {
  range: ProsodyRange;
  speed: number;              // OpenAI TTS speed (0.25 - 4.0, default ~1.0)
  pauseMs: number;            // conceptual pause length (shapes punctuation density)
  softness: number;           // 0..1 (affects directive softening)
  emphasis: number;           // 0..1 (affects emphasis punctuation)
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Build prosody policy from MAIA's relational context + desired range.
 *
 * This is deterministic: same input always produces same policy.
 */
export function buildProsodyPolicy(
  ctx: MaiaProsodyContext,
  range: ProsodyRange
): ProsodyPolicy {
  const activation = clamp(ctx.activation ?? 0.3, 0, 1);

  // Base speed from activation (more activated => slightly faster, but not rushed)
  let speed = 0.92 + activation * 0.16; // ~0.92..1.08

  // Sanctuary biases toward gentleness
  if (ctx.sanctuary) speed -= 0.05;

  // Mode-based adjustments
  const modeUpper = (ctx.mode ?? '').toUpperCase();
  if (modeUpper.includes('REGULATOR')) speed -= 0.04;
  if (modeUpper.includes('CARE')) speed -= 0.03;
  if (modeUpper.includes('NOTE')) speed += 0.02; // scribe mode slightly crisper

  // Element-based micro-adjustments (subtle, not theatrical)
  const el = (ctx.element ?? '').toLowerCase();
  if (el.includes('water')) speed -= 0.02;
  if (el.includes('earth')) speed -= 0.015;
  if (el.includes('fire')) speed += 0.015;
  if (el.includes('air')) speed += 0.01;
  if (el.includes('aether')) speed -= 0.01; // spacious

  // Posture adjustments
  const postureUpper = (ctx.posture ?? '').toUpperCase();
  if (postureUpper.includes('HOLD')) speed -= 0.02;
  if (postureUpper.includes('WITNESS')) speed -= 0.03;

  // Scale effect intensity by range
  const rangeScale = [0.0, 0.35, 0.7, 1.0][range];

  // Pause conceptual length (shapes how we add breathing room)
  const pauseMs = Math.round(140 + 220 * rangeScale); // 140..360

  // Softness determines directive transformation intensity
  const softness = clamp(
    0.25 + 0.6 * rangeScale + (ctx.sanctuary ? 0.1 : 0),
    0,
    1
  );

  // Emphasis determines punctuation lift intensity
  const emphasis = clamp(0.15 + 0.65 * rangeScale, 0, 1);

  // Apply range-based speed reduction (higher range = more spacious)
  speed = clamp(speed - 0.06 * rangeScale, 0.75, 1.15);

  return { range, speed, pauseMs, softness, emphasis };
}

/**
 * Apply prosody policy to text using punctuation + phrasing.
 *
 * This is deterministic text transformation — no SSML, no model involvement.
 * We nudge cadence through punctuation and spacing, not by rewriting meaning.
 *
 * IMPORTANT: Call this BEFORE sanitizeForTts() so sanitization remains last defense.
 */
export function applyProsodyToText(text: string, policy: ProsodyPolicy): string {
  let t = text.trim();

  if (!t) return t;

  // Range 0: no transformation
  if (policy.range === 0) return t;

  // ─── 1. BREATHING ROOM ───
  // Add gentle space after strong stops to slow cadence
  const extraSpace = policy.range >= 2 ? '  ' : ' ';
  t = t.replace(/([.!?])\s+/g, `$1${extraSpace}`);

  // ─── 2. MICRO-PAUSES ───
  // Encourage natural pauses with em-dashes at conjunctions (Range 2+)
  // Only transform existing commas — don't add new semantic meaning
  if (policy.range >= 2) {
    t = t.replace(/,\s+(and|but|so|yet)\s+/gi, ' — $1 ');
  }

  // ─── 3. SOFTEN DIRECTIVES (Range 3 only) ───
  // Transform sharp imperatives into invitations without changing meaning
  // "Temple calm" vibe: unhurried, grounding, non-commanding
  if (policy.range === 3 && policy.softness > 0.7) {
    // Only at sentence start, preserves meaning
    t = t.replace(/^(Do|Try|Start|Stop|Just)\s+/i, (match, verb) => {
      const lower = verb.toLowerCase();
      if (lower === 'do') return 'You might ';
      if (lower === 'try') return 'Consider ';
      if (lower === 'start') return 'Begin by ';
      if (lower === 'stop') return 'Pause ';
      if (lower === 'just') return 'Simply ';
      return match;
    });
  }

  // ─── 4. EMPHASIS LIFT (Range 2+) ───
  // Add subtle comma after key feeling words to create micro-pause
  // This creates natural emphasis without being theatrical
  if (policy.range >= 2 && policy.emphasis > 0.5) {
    // Only if not already followed by punctuation
    t = t.replace(
      /\b(important|matters|notice|feel|breath|moment|pause|here|now)\b(?![,.:;!?])/gi,
      '$1,'
    );
  }

  // ─── 5. CEREMONIAL SPACIOUSNESS (Range 3 only) ───
  // Add breathing room around ellipses and long pauses
  if (policy.range === 3) {
    t = t.replace(/\.\.\./g, ' … ');
    // Ensure sentences have room
    t = t.replace(/\.\s+([A-Z])/g, '.  $1');
  }

  // Clean up any double-double spaces we might have created
  t = t.replace(/\s{3,}/g, '  ');

  return t;
}

/**
 * Get human-readable label for prosody range.
 */
export function getProsodyRangeLabel(range: ProsodyRange): string {
  switch (range) {
    case 0: return 'Neutral';
    case 1: return 'Subtle';
    case 2: return 'Expressive';
    case 3: return 'Ceremonial';
    default: return 'Unknown';
  }
}
