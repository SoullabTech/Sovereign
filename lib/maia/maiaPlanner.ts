/**
 * MAIA Planner — MAIA decides before Claude speaks.
 *
 * Architecture inversion: MAIA plans → Claude renders under plan → MAIA edits.
 * Claude is the rendering instrument. MAIA is the intelligence.
 *
 * Pipeline:
 *   1. buildMaiaPlan()        — deterministic, no LLM call, runs before generateSpiralogicResponseWithLLM
 *   2. buildRenderPrompt()    — injects MAIA directive into system prompt
 *   3. finalizeMaiaResponse() — CI shaping → spokenText / displayText split
 *   4. curateMemoryWrite()    — gates memory storage by plan.memoryWrite
 *
 * SOVEREIGNTY: buildMaiaPlan is deterministic and non-blocking. finalizeMaiaResponse
 * never throws — Sesame CI shaping failure falls back silently to displayText.
 */

import type { VoiceIntent, Element } from '@/lib/types/voiceIntent';
import type { RelationalHint } from '@/lib/types/relationalHint';

// ── Types ──────────────────────────────────────────────────────────────────

export interface MAIAResponsePlan {
  /** How MAIA holds space this turn */
  stance: 'witness' | 'mirror' | 'guide' | 'challenge' | 'hold_silence';
  /** Hysteresis-stable element from Conductor */
  element: Element;
  phase: number;
  /** Shape of the response */
  responseType: 'reflection' | 'question' | 'reframe' | 'resource' | 'ritual';
  /** Hard word cap injected into Claude's render prompt */
  maxWords: number;
  /** Conductor's VoiceIntent — carried through for TTS and response assembly */
  voiceHint: VoiceIntent;
  /** What to persist: full = all layers, structural_only = Bridge D only, skip = Sanctuary */
  memoryWrite: 'full' | 'structural_only' | 'skip';
  tone: { warmth: number; directness: number; poetry: number };
  /** Optional micro-acknowledgment for distress/dysregulation (future streaming use) */
  presenceSignal?: string;
  /**
   * Compact instruction string for OpenAI TTS `instructions` field.
   * Derived from stance + element + tone. Tells the voice engine HOW to speak.
   * MAIA controls pacing, warmth, intensity, texture — not the engine.
   */
  ttsInstructions: string;
}

interface BuildMaiaPlanContext {
  voiceHint: VoiceIntent;
  relationalHint: RelationalHint;
  distressSignal?: { isDistressed: boolean; intensity: string } | null;
  conversationDepth: number;
  isSanctuary?: boolean;
}

// ── Presence pool for distress micro-acknowledgments ──────────────────────

const DISTRESS_PRESENCE = ["I'm here.", "With you.", "That's hard.", "I hear you."];

// ── Stance → Sesame CI style mapping ─────────────────────────────────────

const STANCE_TO_STYLE: Record<MAIAResponsePlan['stance'], string> = {
  witness:      'presence',
  mirror:       'reflection',
  guide:        'guidance',
  challenge:    'exploration',
  hold_silence: 'reassurance',
};

// ── Descriptions for MAIA directive block ────────────────────────────────

const STANCE_DESCRIPTION: Record<MAIAResponsePlan['stance'], string> = {
  witness:      'Presence before insight. Witness without fixing.',
  mirror:       'Reflect back what you hear. Do not add, analyze, or redirect.',
  guide:        'Offer one next step. Trust the human to take it or leave it.',
  challenge:    'Name what you see directly. One clear reflection. No padding.',
  hold_silence: 'Hold space. This is a distress threshold — presence only.',
};

const RESPONSE_TYPE_DESCRIPTION: Record<MAIAResponsePlan['responseType'], string> = {
  reflection: 'No questions, no advice. Reflect only.',
  question:   'One open question at most. Genuine inquiry, not Socratic pressure.',
  reframe:    'Offer a different lens. One reframe, nothing more.',
  resource:   'Acknowledge agency. One concrete offer. Do not linger.',
  ritual:     'Speak with space. Let the symbolic breathe.',
};

// ── buildTTSInstructions ─────────────────────────────────────────────────

/**
 * Derive a compact OpenAI TTS `instructions` string from plan parameters.
 *
 * Tells the voice engine HOW to speak — pacing, warmth, intensity, texture.
 * MAIA controls the voice intent. OpenAI renders it.
 * Used with model: "gpt-4o-mini-tts" which reads natural-language instructions.
 */
function buildTTSInstructions(opts: {
  stance: MAIAResponsePlan['stance'];
  element: Element;
  tone: { warmth: number; directness: number; poetry: number };
  maxWords: number;
}): string {
  const { stance, element, tone, maxWords } = opts;

  // Pacing
  const basePace =
    stance === 'hold_silence' || stance === 'witness' ? 'slow' :
    stance === 'mirror' ? 'slow-to-moderate' :
    stance === 'guide' ? 'moderate' :
    'deliberate'; // challenge

  // Intimacy from warmth
  const intimacy =
    tone.warmth >= 0.8 ? 'intimate and warm' :
    tone.warmth >= 0.6 ? 'present and clear' :
    'grounded and direct';

  // Energy intensity from directness + stance
  const intensity =
    stance === 'challenge' ? 'grounded, with weight' :
    stance === 'hold_silence' ? 'very soft, contained' :
    tone.directness >= 0.6 ? 'steady and clear' :
    'gentle, unhurried';

  // Elemental texture
  const ELEMENT_TEXTURES: Partial<Record<Element, string>> = {
    water:  'soft, tender, emotionally attuned',
    fire:   'warm, alive, energised',
    earth:  'grounded, steady, embodied',
    air:    'clear, light, spacious',
    aether: 'resonant, open, unhurried',
  };
  const texture = ELEMENT_TEXTURES[element] ?? 'present and clear';

  // Cadence density from maxWords
  const density =
    maxWords <= 40 ? 'sparse' :
    maxWords <= 80 ? 'measured' :
    'full';

  // Pauses from poetry weight
  const pauses =
    tone.poetry >= 0.7 ? 'let silence land between phrases' :
    tone.poetry >= 0.4 ? 'brief pauses at natural breaks' :
    'minimal pausing';

  return [
    `Voice: ${intimacy}.`,
    `Pace: ${basePace}.`,
    `Energy intensity: ${intensity}.`,
    `Texture: ${texture}.`,
    `Cadence: ${density}; ${pauses}.`,
    `Avoid: sounding rushed, overly theatrical, or preachy.`,
  ].join(' ');
}

// ── buildMaiaPlan ─────────────────────────────────────────────────────────

/**
 * Build a MAIAResponsePlan — deterministic, no LLM call.
 *
 * MAIA decides stance, voice calibration, brevity, and memory intent
 * BEFORE Claude renders. The plan constrains the render prompt and gates
 * post-generation steps (finalize, memory).
 */
export function buildMaiaPlan(
  _message: string,
  context: BuildMaiaPlanContext
): MAIAResponsePlan {
  const {
    voiceHint,
    relationalHint,
    distressSignal,
    conversationDepth,
    isSanctuary = false,
  } = context;

  // ── Stance ──────────────────────────────────────────────────────────────
  let stance: MAIAResponsePlan['stance'];
  if (distressSignal?.intensity === 'high') {
    stance = 'hold_silence';
  } else if (relationalHint.stance === 'MIRROR') {
    stance = 'mirror';
  } else if (relationalHint.stance === 'CHALLENGE') {
    stance = 'challenge';
  } else if (
    relationalHint.stance === 'RELEASE' ||
    relationalHint.stance === 'SEASONAL_RETURN'
  ) {
    stance = 'guide';
  } else {
    // HOLD or default
    stance = 'witness';
  }

  // ── Response type ────────────────────────────────────────────────────────
  let responseType: MAIAResponsePlan['responseType'];
  if (distressSignal?.isDistressed) {
    responseType = 'reflection';
  } else if (relationalHint.stance === 'CHALLENGE') {
    responseType = 'reframe';
  } else if (relationalHint.returnPowerLevel > 0.7) {
    responseType = 'resource';
  } else if (voiceHint.element === 'aether' && conversationDepth >= 5) {
    responseType = 'ritual';
  } else if (conversationDepth < 3) {
    // Early conversation: questions open space better for water/earth;
    // fire/air benefit from reflective grounding first
    responseType =
      voiceHint.element === 'water' || voiceHint.element === 'earth'
        ? 'reflection'
        : 'question';
  } else {
    responseType = 'reflection';
  }

  // ── Max words ────────────────────────────────────────────────────────────
  let maxWords: number;
  if (relationalHint.brevityLevel >= 0.66) maxWords = 40;
  else if (relationalHint.brevityLevel >= 0.33) maxWords = 80;
  else maxWords = 150;

  // Distress threshold always uses compressed presence
  if (stance === 'hold_silence') maxWords = Math.min(maxWords, 40);

  // ── Memory write intent ──────────────────────────────────────────────────
  let memoryWrite: MAIAResponsePlan['memoryWrite'];
  if (isSanctuary) {
    memoryWrite = 'skip';
  } else if (relationalHint.holdLevel > 0.7) {
    // High containment: only persist structural position, not content
    memoryWrite = 'structural_only';
  } else {
    memoryWrite = 'full';
  }

  // ── Tone from archetype ──────────────────────────────────────────────────
  let tone: MAIAResponsePlan['tone'];
  if (voiceHint.archetype === 'oracle') {
    tone = { warmth: 0.6, directness: 0.4, poetry: 0.8 };
  } else if (voiceHint.archetype === 'guide') {
    tone = { warmth: 0.8, directness: 0.6, poetry: 0.4 };
  } else {
    // companion (default)
    tone = { warmth: 0.9, directness: 0.4, poetry: 0.3 };
  }

  // ── Presence signal ──────────────────────────────────────────────────────
  // Immediate micro-acknowledgment for distress/dysregulation.
  // Surfaced in response for future streaming use (sent before full oracle response).
  let presenceSignal: string | undefined;
  if (distressSignal?.isDistressed || relationalHint.signals.dysregulation) {
    presenceSignal =
      DISTRESS_PRESENCE[Math.floor(Math.random() * DISTRESS_PRESENCE.length)];
  }

  const ttsInstructions = buildTTSInstructions({
    stance,
    element: voiceHint.element,
    tone,
    maxWords,
  });

  console.info('[maia.plan]', JSON.stringify({
    stance,
    responseType,
    maxWords,
    element: voiceHint.element,
    phase: voiceHint.phase,
    archetype: voiceHint.archetype,
    memoryWrite,
    hasPresenceSignal: Boolean(presenceSignal),
  }));

  return {
    stance,
    element: voiceHint.element,
    phase: voiceHint.phase,
    responseType,
    maxWords,
    voiceHint,
    memoryWrite,
    tone,
    presenceSignal,
    ttsInstructions,
  };
}

// ── buildRenderPrompt ─────────────────────────────────────────────────────

/**
 * Inject the MAIA directive into the base system prompt.
 *
 * Appends a hard constraint block at the end — overrides conflicting
 * instructions in the sacred attending prompt. The sacred attending prompt
 * is untouched; this block adds precision on top.
 */
export function buildRenderPrompt(
  plan: MAIAResponsePlan,
  baseSystemPrompt: string
): string {
  const directive = [
    '',
    '── MAIA DIRECTIVE (this overrides any conflicting instruction above) ──',
    `STANCE: ${plan.stance}. ${STANCE_DESCRIPTION[plan.stance]}`,
    `RESPONSE TYPE: ${plan.responseType}. ${RESPONSE_TYPE_DESCRIPTION[plan.responseType]}`,
    `MAX WORDS: ${plan.maxWords}. Stop at the boundary — do not complete thoughts that need the next line.`,
    `TONE: warmth=${plan.tone.warmth.toFixed(1)}, directness=${plan.tone.directness.toFixed(1)}, poetry=${plan.tone.poetry.toFixed(1)}`,
    `Element: ${plan.element} (phase ${plan.phase})`,
    '──',
    '',
  ].join('\n');

  return `${baseSystemPrompt}${directive}`;
}

// ── finalizeMaiaResponse ──────────────────────────────────────────────────

/**
 * Finalize MAIA's response after Socratic validation.
 *
 * Calls Sesame CI shaping to produce spokenText (prosody-marked).
 * Falls back gracefully if Sesame is unreachable — never throws.
 *
 * Returns:
 *   coreMessage  — the validated oracle text (unchanged)
 *   spokenText   — prosody-shaped text for TTS synthesis
 *   displayText  — clean text for screen rendering
 */
export async function finalizeMaiaResponse(
  draft: string,
  plan: MAIAResponsePlan,
  sesameUrl = 'http://maia-sesame-tts:8000'
): Promise<{ coreMessage: string; spokenText: string; displayText: string }> {
  const displayText = draft;
  let spokenText = draft;
  let shaped = false;

  try {
    const response = await fetch(`${sesameUrl}/ci/shape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: draft,
        style: STANCE_TO_STYLE[plan.stance],
        element: plan.element,
        archetype: plan.voiceHint.archetype ?? 'companion',
      }),
      signal: AbortSignal.timeout(5_000),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof data.shaped === 'string' && data.shaped.length > 0) {
        spokenText = data.shaped;
        shaped = true;
      }
    }

    console.info('[tts.finalize]', JSON.stringify({
      stage: 'ci_shape',
      ok: response.ok,
      shaped,
      element: plan.element,
      stance: plan.stance,
    }));
  } catch (err: any) {
    // Silent fallback: Sesame unavailable, spokenText equals displayText
    console.info('[tts.finalize]', JSON.stringify({
      stage: 'ci_shape_fallback',
      reason: err?.code ?? err?.message ?? 'unknown',
    }));
  }

  return { coreMessage: draft, spokenText, displayText };
}

// ── curateMemoryWrite ─────────────────────────────────────────────────────

/**
 * Gate memory writes by plan.memoryWrite.
 *
 * Usage in oracle route:
 *   await curateMemoryWrite(maiaPlan, isSanctuary, async () => {
 *     // existing session/palace/anamnesis writes
 *   });
 *
 * Tiers:
 *   skip              — no writes (Sanctuary or explicit skip)
 *   structural_only   — Bridge D upsert handles structural position (already fire-and-forget).
 *                       Skip session memory, memory palace, and anamnesis to reduce
 *                       content retention during high-hold containment turns.
 *   full              — all existing writes (unchanged behaviour)
 */
export async function curateMemoryWrite(
  plan: MAIAResponsePlan,
  isSanctuary: boolean,
  writeAll: () => Promise<void>
): Promise<void> {
  // Double-enforced Sanctuary boundary (also enforced at route level)
  if (isSanctuary || plan.memoryWrite === 'skip') {
    console.info('[memory.curate] skip — sanctuary or plan.memoryWrite=skip');
    return;
  }

  // structural_only: Bridge D upsert (fire-and-forget at line ~1163) already persists
  // the structural position (element/phase). Skip content-bearing layers.
  if (plan.memoryWrite === 'structural_only') {
    console.info('[memory.curate] structural_only — skipping session/palace/anamnesis');
    return;
  }

  // full: run all existing writes
  await writeAll();
}
