/**
 * OpenAI Speech Delivery Adapter — JARVIS-VOICE-PROSODY-ALLOY-01
 *
 * Translates MAIA's semantic prosody intent into OpenAI-specific speech
 * controls. This is the provider boundary: MAIA decides HOW she intends to
 * speak; this module says it in the provider's dialect; the provider actuates.
 *
 * ── SOVEREIGNTY ─────────────────────────────────────────────────────────────
 *
 * ⛔ The provider NEVER decides MAIA's emotional posture. Every instruction
 * clause emitted here is selected from a CLOSED vocabulary keyed on MAIA's own
 * enum-valued hints (`ProsodyHints`) and her own relational `MoveIntent`.
 *
 * ⛔ Member content and MAIA's generated text NEVER enter the instructions.
 * `buildSpeechInstructions` does not take the spoken text as a parameter at
 * all — it cannot leak it, and no prompt-injection path exists from what a
 * member says into what the provider is told. The words stay in `input`.
 *
 * ⛔ The instructions never license the provider to change words. Every
 * instruction string ends with an explicit fidelity clause.
 *
 * ── PROVIDER CAPABILITY (verified 2026-08-28 against openai@4.104.0) ────────
 *
 * From the pinned SDK's `SpeechCreateParams`:
 *
 *   instructions?: string
 *     "Control the voice of your generated audio with additional
 *      instructions. Does not work with `tts-1` or `tts-1-hd`."
 *
 *   speed?: number
 *     "The speed of the generated audio. Select a value from `0.25` to `4.0`.
 *      `1.0` is the default. Does not work with `gpt-4o-mini-tts`."
 *
 *   SpeechModel = 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts'
 *
 * ⭐ THE TWO CONTROLS ARE MUTUALLY EXCLUSIVE. There is no model on which both
 * `instructions` and `speed` are honoured. This is the single most important
 * fact about this boundary, and it is why pace cannot simply be "added to" the
 * existing speed channel: on an instruction-capable model, `speed` is dead, so
 * pace MUST be carried by language instead. Sending both would not be richer —
 * it would be one control silently ignored and a false belief that it applied.
 *
 * Consequently this adapter resolves to exactly one of two delivery shapes,
 * and the caller sends exactly the fields that shape names.
 */

import type { ProsodyHints } from '@/src/types/voice';
import type { MoveIntent } from '@/lib/voice/moshi/MoshiSessionManager';

/** Models on which the `instructions` parameter is honoured. */
export const INSTRUCTION_CAPABLE_MODELS = new Set<string>(['gpt-4o-mini-tts']);

/** Models on which the `speed` parameter is honoured. */
export const SPEED_CAPABLE_MODELS = new Set<string>(['tts-1', 'tts-1-hd']);

export function modelSupportsInstructions(model: string): boolean {
  return INSTRUCTION_CAPABLE_MODELS.has(model);
}

export function modelSupportsSpeed(model: string): boolean {
  return SPEED_CAPABLE_MODELS.has(model);
}

/**
 * Upper bound on generated instructions. Instructions are billed as input
 * tokens on every synthesis call, and MAIA streams sentence-by-sentence, so
 * this is a per-sentence cost. The closed vocabulary below cannot approach
 * this, but the cap is asserted so a future clause cannot quietly blow it out.
 */
export const MAX_INSTRUCTIONS_CHARS = 600;

/**
 * What the provider should actually be sent.
 *
 * Discriminated so the call site cannot accidentally send a control the
 * chosen model ignores.
 */
export type OpenAISpeechDelivery =
  | {
      channel: 'instructions';
      model: string;
      instructions: string;
      /** Always undefined — `speed` is ignored by instruction-capable models. */
      speed?: undefined;
    }
  | {
      channel: 'speed';
      model: string;
      /** Always undefined — `instructions` is ignored by tts-1/tts-1-hd. */
      instructions?: undefined;
      speed: number;
    };

// ═══════════════════════════════════════════════════════════════════════════
// CLOSED CLAUSE VOCABULARY
// ═══════════════════════════════════════════════════════════════════════════
//
// Every clause is keyed on one of MAIA's enum values. No free text, no
// interpolation, no member content. Read these as the provider-dialect
// translation of a semantic term, not as creative direction.

/** Relational posture — what MAIA is doing for the member this turn. */
const MOVE_CLAUSE: Record<MoveIntent, string> = {
  MEET_REGULATE:
    'You are settling and grounding someone. Slow down, leave space between phrases, and let the ending fall rather than lift.',
  MEET_BOUNDARY:
    'You are holding a limit kindly. Steady and even, without apology and without hardness.',
  MIRROR_REFLECT:
    'You are reflecting back what you heard. Contemplative and unhurried, more listening than telling.',
  MOVE_NEXT_STEP:
    'You are offering a concrete next step. Slightly more forward, with a firmer, clearer cadence.',
  MOVE_REFRAME:
    'You are offering a new angle. Light and open, with a small lift where the perspective turns.',
  MOVE_CREATIVE:
    'You are opening imaginative space. Unhurried and curious, with room around the images.',
};

/** Pace — carries what `speed` used to carry, since `speed` is dead here. */
const PACE_CLAUSE: Record<ProsodyHints['pace'], string> = {
  slow: 'Speak noticeably slower than a default reading pace.',
  steady: 'Speak at a relaxed, natural conversational pace.',
  brisk: 'Speak a little quicker than default, without rushing.',
};

const WARMTH_CLAUSE: Record<ProsodyHints['warmth'], string> = {
  cool: 'Tone is even and matter-of-fact.',
  neutral: 'Tone is natural and unforced.',
  warm: 'Tone is warm and companionable.',
  very_warm: 'Tone is warm and close, the way you speak to someone you care about.',
};

const EMPHASIS_CLAUSE: Record<ProsodyHints['emphasis'], string> = {
  minimal: 'Keep stress almost flat; let the words carry themselves.',
  selective: 'Stress only the one or two words that carry the meaning.',
  strong: 'Land the key words clearly, still without pushing.',
};

const CLARITY_CLAUSE: Record<ProsodyHints['clarity'], string> = {
  soft: 'Soften the consonants and edges.',
  clear: 'Keep articulation clear and unfussy.',
  crisp: 'Keep articulation precise and clean.',
};

const ENERGY_CLAUSE: Record<ProsodyHints['energy'], string> = {
  very_low: 'Energy is very low and quiet.',
  low: 'Energy is low and settled.',
  medium: 'Energy is moderate.',
  high: 'Energy is bright but contained.',
  very_high: 'Energy is bright; keep it contained rather than excited.',
};

/**
 * Delivery intent (`ProsodyHints.intentTag`). Only tags that genuinely change
 * delivery appear; the rest resolve to null so the instruction stays short.
 * `attune` is deliberately absent — it is the default warm presence already
 * carried by warmth + move clause, and repeating it only dilutes the signal.
 */
const INTENT_CLAUSE: Partial<Record<NonNullable<ProsodyHints['intentTag']>, string>> = {
  regulate: 'Let the pauses do the work; end each sentence gently.',
  encourage: 'A little more forward movement, without cheerleading.',
  instruct: 'Plain and informative; no extra warmth.',
  ritual: 'Spacious and formal, with long rests between sentences.',
  play: 'A touch lighter, with a hint of humour held back.',
};

/** Applied to every instruction, always last. Non-negotiable. */
const FIDELITY_CLAUSE =
  'Read the text exactly as written — add nothing, omit nothing, rephrase nothing. ' +
  'Do not perform, dramatize, or exaggerate. This is ordinary human speech, not a performance.';

/**
 * Translate a pause budget into language, since `<break>` and SSML are not
 * available on this provider. Only the extremes are worth saying; ordinary
 * conversational pauses need no instruction and saying so only adds tokens.
 */
function pauseClause(hints: ProsodyHints): string | null {
  const after = hints.pauseMs?.afterSentence ?? 120;
  if (after >= 420) return 'Leave a long, unhurried rest between sentences.';
  if (after >= 240) return 'Leave a clear pause between sentences.';
  if (after <= 60) return 'Keep the gaps between sentences short.';
  return null;
}

export interface SpeechInstructionInput {
  hints: ProsodyHints;
  /** MAIA's relational intent for this turn, when the caller has derived it. */
  moveIntent?: MoveIntent | null;
  /** Sanctuary turns get an explicit containment clause. */
  sanctuary?: boolean;
}

/**
 * Build the provider instruction string from MAIA's semantic intent.
 *
 * Deterministic: the same enum tuple always produces the same string, and the
 * string depends on NOTHING else — not the text, not the member, not the time.
 * That property is what makes this boundary auditable, and it is asserted in
 * `__tests__/openaiSpeechAdapter.test.ts`.
 */
export function buildSpeechInstructions(input: SpeechInstructionInput): string {
  const { hints, moveIntent, sanctuary } = input;

  const clauses: (string | null | undefined)[] = [
    // Posture first: it frames everything after it.
    moveIntent ? MOVE_CLAUSE[moveIntent] : null,
    sanctuary ? 'This is a private, held moment. Stay quiet and contained.' : null,
    PACE_CLAUSE[hints.pace],
    WARMTH_CLAUSE[hints.warmth],
    ENERGY_CLAUSE[hints.energy],
    EMPHASIS_CLAUSE[hints.emphasis],
    CLARITY_CLAUSE[hints.clarity],
    hints.intentTag ? INTENT_CLAUSE[hints.intentTag] : null,
    pauseClause(hints),
    FIDELITY_CLAUSE,
  ];

  const text = clauses.filter((c): c is string => Boolean(c)).join(' ');

  // Bound defensively rather than trusting the vocabulary to stay small.
  // Truncation would drop the fidelity clause, which must never be dropped, so
  // we trim the middle and re-append it instead.
  if (text.length > MAX_INSTRUCTIONS_CHARS) {
    const room = MAX_INSTRUCTIONS_CHARS - FIDELITY_CLAUSE.length - 1;
    return `${text.slice(0, Math.max(0, room)).trimEnd()} ${FIDELITY_CLAUSE}`;
  }
  return text;
}

/**
 * Resolve what to actually send OpenAI for this turn.
 *
 * `baseSpeed` is the already-prosody-adjusted speed from `mapProsodyToSpeed`.
 * On an instruction-capable model it is deliberately DROPPED rather than sent
 * and ignored — pace is carried by `PACE_CLAUSE` instead. The returned shape
 * makes that visible to the caller rather than silent.
 */
export function resolveOpenAISpeechDelivery(params: {
  model: string;
  baseSpeed: number;
  hints?: ProsodyHints | null;
  moveIntent?: MoveIntent | null;
  sanctuary?: boolean;
}): OpenAISpeechDelivery {
  const { model, baseSpeed, hints, moveIntent, sanctuary } = params;

  // No hints (e.g. voice preview, admin voice lab) → nothing semantic to say.
  // Fall back to the speed channel on a speed-capable model; on an
  // instruction-capable model there is simply no control to send.
  if (!hints) {
    return modelSupportsSpeed(model)
      ? { channel: 'speed', model, speed: baseSpeed }
      : { channel: 'instructions', model, instructions: FIDELITY_CLAUSE };
  }

  if (modelSupportsInstructions(model)) {
    return {
      channel: 'instructions',
      model,
      instructions: buildSpeechInstructions({ hints, moveIntent, sanctuary }),
    };
  }

  return { channel: 'speed', model, speed: baseSpeed };
}
