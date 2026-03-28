/**
 * Kokoro Prosody Adapter — translates style presets into Kokoro-actionable params.
 *
 * Kokoro does not have an `instructions` field like gpt-4o-mini-tts.
 * Prosody is achieved through:
 *   1. Speed multiplier (Kokoro native `speed` param)
 *   2. Text shaping (sentence breaking, pause-friendly punctuation)
 *   3. Chunk-level synthesis with silence insertion between chunks
 *
 * Architecture:
 *   shapeForSpeech() → splitIntoChunks() → applyKokoroProsody() → Kokoro synth per chunk
 *
 * Reuses:
 *   - classifyChunk() from prosodyFromPFI.ts for chunk-type awareness
 *   - shapeForSpeech() from textShaper.ts for pre-speech text transformation
 *   - getPresetParams() from stylePresets.ts for delivery parameters
 *
 * See: docs/maia-voice-spec-v1.md § Prosody System
 */

import type { Element } from '@/lib/types/voiceIntent';
import type { StylePreset } from '@/lib/voice/stylePresets';
import { getPresetParams } from '@/lib/voice/stylePresets';
import { shapeForSpeech, splitIntoChunks } from '@/lib/voice/textShaper';
import { classifyChunk, type ChunkType } from '@/lib/voice/prosodyFromPFI';

// ── Types ────────────────────────────────────────────────────────────────────

export interface KokoroChunk {
  /** Shaped text for this chunk */
  text: string;
  /** Kokoro speed multiplier for this chunk */
  speed: number;
  /** Milliseconds of silence to insert after this chunk */
  pauseAfterMs: number;
  /** Chunk classification (for logging) */
  chunkType: ChunkType;
}

export interface KokoroProsodyResult {
  /** Ordered chunks ready for sequential synthesis */
  chunks: KokoroChunk[];
  /** Kokoro voice ID */
  voice: string;
  /** Overall style preset used */
  preset: StylePreset;
}

// ── Chunk-Type Speed Adjustments ─────────────────────────────────────────────
// Relative to the preset's base speed. Subtle — not theatrical.

const CHUNK_SPEED_MODIFIER: Record<ChunkType, number> = {
  'question':     0.97,   // Slightly slower — genuine, not searching
  'exclamation':  1.02,   // Slightly faster — energy, not urgency
  'short-clause': 0.95,   // Slower — presence signal, grounding
  'invitation':   0.96,   // Slower — spacious, open
  'transition':   1.01,   // Neutral — connective, carry forward
  'list-item':    1.00,   // Even — consistent across items
  'declaration':  1.00,   // Base — element profile primary
};

// ── Chunk-Type Pause Adjustments ─────────────────────────────────────────────
// Multiplier on the preset's base pauseBetweenSentences.

const CHUNK_PAUSE_MODIFIER: Record<ChunkType, number> = {
  'question':     1.3,    // Longer pause after questions — let it land
  'exclamation':  1.1,    // Slightly longer — absorb the energy
  'short-clause': 1.5,    // Longest — presence marker, let it rest
  'invitation':   1.4,    // Long — leave air, don't rush to fill
  'transition':   0.7,    // Shorter — connective, keep momentum
  'list-item':    0.8,    // Shorter — even pacing, no building
  'declaration':  1.0,    // Base
};

// ── Element Speed Overlay ────────────────────────────────────────────────────
// Subtle element-specific speed bias, applied on top of preset + chunk modifiers.

const ELEMENT_SPEED_BIAS: Record<Element, number> = {
  fire:   1.03,   // Slightly forward
  water:  0.97,   // Slightly slower
  earth:  1.00,   // Centered
  air:    1.01,   // Slightly lifted
  aether: 0.98,   // Slightly suspended
};

// ── First/Last Chunk Adjustments ─────────────────────────────────────────────

const FIRST_CHUNK_SPEED_MODIFIER = 0.97;    // Settle before speaking
const FIRST_CHUNK_PAUSE_MODIFIER = 1.2;     // Extra breath after opening
const LAST_CHUNK_PAUSE_MS = 0;              // No trailing silence (player handles)

// ── Main Export ──────────────────────────────────────────────────────────────

/**
 * Apply Kokoro-specific prosody to text.
 *
 * Full pipeline:
 *   1. Shape text for speech (break sentences, fix pronunciation, etc.)
 *   2. Split into sentence chunks
 *   3. Classify each chunk
 *   4. Compute per-chunk speed and pause
 *   5. Return chunks ready for sequential Kokoro synthesis
 */
export function applyKokoroProsody(opts: {
  /** Raw text from MAIA oracle response */
  text: string;
  /** Resolved style preset */
  preset: StylePreset;
  /** Current Spiralogic element (optional) */
  element?: Element;
  /** Kokoro voice ID */
  voice: string;
}): KokoroProsodyResult {
  const { preset, element, voice } = opts;
  const params = getPresetParams(preset);
  const elementBias = element ? ELEMENT_SPEED_BIAS[element] : 1.0;

  // Step 1+2: Shape and split
  const shaped = shapeForSpeech(opts.text);
  const rawChunks = splitIntoChunks(shaped);

  // Handle edge case: empty or very short text
  if (rawChunks.length === 0) {
    return { chunks: [], voice, preset };
  }

  // Single chunk: no need for per-chunk prosody
  if (rawChunks.length === 1) {
    const chunkType = classifyChunk(rawChunks[0]);
    return {
      chunks: [{
        text: rawChunks[0],
        speed: clampSpeed(params.speed * elementBias * CHUNK_SPEED_MODIFIER[chunkType]),
        pauseAfterMs: 0,
        chunkType,
      }],
      voice,
      preset,
    };
  }

  // Multi-chunk: full prosody
  const chunks: KokoroChunk[] = rawChunks.map((text, i) => {
    const isFirst = i === 0;
    const isLast = i === rawChunks.length - 1;
    const chunkType = classifyChunk(text);

    // Speed: preset × element × chunk-type × position
    let speed = params.speed * elementBias * CHUNK_SPEED_MODIFIER[chunkType];
    if (isFirst) speed *= FIRST_CHUNK_SPEED_MODIFIER;

    // Pause: preset × chunk-type × position
    let pauseAfterMs = params.pauseBetweenSentences * CHUNK_PAUSE_MODIFIER[chunkType];
    if (isFirst) pauseAfterMs *= FIRST_CHUNK_PAUSE_MODIFIER;
    if (isLast) pauseAfterMs = LAST_CHUNK_PAUSE_MS;

    return {
      text,
      speed: clampSpeed(speed),
      pauseAfterMs: Math.round(pauseAfterMs),
      chunkType,
    };
  });

  return { chunks, voice, preset };
}

/**
 * Simplified single-call: apply prosody and return flat text + speed.
 *
 * For callers that don't need per-chunk synthesis (e.g., short responses).
 * Joins chunks back together with the speed of the first chunk.
 */
export function applyKokoroProsodySimple(opts: {
  text: string;
  preset: StylePreset;
  element?: Element;
  voice: string;
}): { text: string; speed: number; voice: string } {
  const result = applyKokoroProsody(opts);

  if (result.chunks.length === 0) {
    return { text: '', speed: 1.0, voice: opts.voice };
  }

  return {
    text: result.chunks.map(c => c.text).join(' '),
    speed: result.chunks[0].speed,
    voice: result.voice,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp speed to Kokoro's comfortable range. */
function clampSpeed(speed: number): number {
  return Math.max(0.75, Math.min(1.15, speed));
}
