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
import type { DraftPolicy } from '@/lib/consciousness/pfi';
import { DEFAULT_FORBIDDEN_PHRASES } from '@/lib/consciousness/pfi';

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

  // ── ANTI-STACKING RULE ──────────────────────────────────────────────────
  // Each dimension uses DISTINCT vocabulary. No two dimensions may both say
  // "slow", "soft", "gentle", or "unhurried". When multiple signals push
  // the same direction, the TTS model compounds them and sounds sedated.
  //
  // Dimension vocabulary lanes:
  //   Pace     → tempo words only (slow, moderate, deliberate, brisk)
  //   Tone     → color words only (warm, bright, cool, rich)
  //   Energy   → projection words only (contained, open, full, projected)
  //   Texture  → tactile words only (smooth, textured, crisp, round)
  //   Cadence  → rhythm words only (measured, flowing, staccato, legato)

  // Pacing — tempo only, no softness words
  const basePace =
    stance === 'hold_silence' || stance === 'witness' ? 'unhurried' :
    stance === 'mirror' ? 'moderate' :
    stance === 'guide' ? 'moderate-to-brisk' :
    'deliberate'; // challenge

  // Tone color from warmth — warmth/brightness, NOT pace or volume
  const toneColor =
    tone.warmth >= 0.8 ? 'warm and rich' :
    tone.warmth >= 0.6 ? 'warm and present' :
    'bright and direct';

  // Energy — projection level, NOT softness or speed
  const energy =
    stance === 'challenge' ? 'full, with weight behind it' :
    stance === 'hold_silence' ? 'contained, close to the mic' :
    tone.directness >= 0.6 ? 'open and steady' :
    'contained but clear';

  // Elemental texture — tactile quality, NOT tempo or volume
  const ELEMENT_TEXTURES: Partial<Record<Element, string>> = {
    water:  'smooth and round',
    fire:   'textured and alive',
    earth:  'grounded and embodied',
    air:    'crisp and spacious',
    aether: 'resonant and open',
  };
  const texture = ELEMENT_TEXTURES[element] ?? 'natural and present';

  // Cadence — rhythm pattern, NOT speed
  const cadence =
    maxWords <= 40 ? 'sparse' :
    maxWords <= 80 ? 'measured' :
    'flowing';

  // Pauses from poetry weight — ONE instruction, not compounding
  const pauses =
    tone.poetry >= 0.7 ? 'let phrases land before continuing' :
    tone.poetry >= 0.4 ? 'natural breathing pauses' :
    '';

  const parts = [
    `Tone: ${toneColor}.`,
    `Pace: ${basePace}.`,
    `Energy: ${energy}.`,
    `Texture: ${texture}.`,
    `Cadence: ${cadence}${pauses ? '; ' + pauses : ''}.`,
    `Avoid: sounding rushed, theatrical, or preachy.`,
  ];

  return parts.join(' ');
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

// ── DraftMetrics ──────────────────────────────────────────────────────────

/**
 * Per-turn fidelity metrics from the sanitize step.
 * Logged fire-and-forget for drift tracking. Never blocks the pipeline.
 * These are the Stage 2 apprenticeship training labels.
 */
export interface DraftMetrics {
  /** Raw word count before sanitization */
  actual_word_count: number;
  /** Plan-mandated word budget */
  maxWords_expected: number;
  /** Words over budget (0 if compliant) */
  words_over_budget: number;
  /** Forbidden phrases found and stripped */
  forbidden_phrase_hits: string[];
  /** Claude-ism abstraction markers found and stripped */
  abstraction_marker_hits: string[];
  /** True if draft was within word budget before clamping */
  length_compliant: boolean;
  /** True if any sanitization was required */
  drift_detected: boolean;
}

// Claude-ism abstraction patterns that survive forbidden phrase filter
const ABSTRACTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bAs an AI\b/gi,                                    label: 'as-an-ai' },
  { pattern: /\bI (can't|cannot) (help|assist)\b/gi,              label: 'cannot-help' },
  { pattern: /\bI don't have access to\b/gi,                      label: 'no-access' },
  { pattern: /\bIt('s| is) important to (note|remember|understand)\b/gi, label: 'important-to-note' },
  { pattern: /\bI should (note|mention|clarify)\b/gi,             label: 'i-should-note' },
  { pattern: /\bAs a language model\b/gi,                         label: 'language-model' },
  { pattern: /\bI want to be transparent\b/gi,                    label: 'transparency-meta' },
];

/** Hard-clamp draft at sentence boundary near maxWords. */
function clampAtBoundary(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;

  // Look for a sentence boundary within a small buffer past the limit
  const buffer = words.slice(0, maxWords + 8).join(' ');
  const lastPeriod   = buffer.lastIndexOf('. ');
  const lastBang     = buffer.lastIndexOf('! ');
  const lastQuestion = buffer.lastIndexOf('? ');
  const boundary = Math.max(lastPeriod, lastBang, lastQuestion);

  if (boundary > 0) {
    return buffer.slice(0, boundary + 1).trim();
  }
  // No sentence boundary — hard cut
  return words.slice(0, maxWords).join(' ');
}

/**
 * The single draft sanitization choke point.
 *
 * Runs BEFORE Sesame CI shaping, BEFORE voice output, AFTER LLM generation.
 * This is where PFI re-authors the draft — stripping what shouldn't be there
 * and clamping to the plan's constraints.
 *
 * Order matters:
 *   1. Forbidden phrases (sovereignty integrity)
 *   2. Abstraction markers (voice fidelity)
 *   3. Length clamp (plan compliance)
 *
 * Never throws. Returns original draft on error.
 */
export function sanitizeDraft(
  draft: string,
  plan: MAIAResponsePlan,
  draftPolicy?: DraftPolicy
): { sanitized: string; metrics: DraftMetrics } {
  try {
    let text = draft;
    const originalWordCount = text.trim().split(/\s+/).filter(Boolean).length;

    // 1. Forbidden phrases — sovereignty guard
    const forbidList = draftPolicy?.forbidPhrases ?? DEFAULT_FORBIDDEN_PHRASES;
    const forbidden_phrase_hits: string[] = [];
    for (const phrase of forbidList) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      if (regex.test(text)) {
        forbidden_phrase_hits.push(phrase);
        text = text.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
      }
    }

    // 2. Abstraction markers — Claude-ism guard
    const abstraction_marker_hits: string[] = [];
    for (const { pattern, label } of ABSTRACTION_PATTERNS) {
      if (pattern.test(text)) {
        abstraction_marker_hits.push(label);
        text = text.replace(pattern, '').replace(/\s{2,}/g, ' ').trim();
      }
    }

    // 3. Length clamp — plan compliance
    const words_over_budget = Math.max(0, originalWordCount - plan.maxWords);
    if (words_over_budget > 0) {
      text = clampAtBoundary(text, plan.maxWords);
    }

    const drift_detected =
      forbidden_phrase_hits.length > 0 ||
      abstraction_marker_hits.length > 0 ||
      words_over_budget > 0;

    return {
      sanitized: text || draft, // never return empty — fallback to original
      metrics: {
        actual_word_count: originalWordCount,
        maxWords_expected: plan.maxWords,
        words_over_budget,
        forbidden_phrase_hits,
        abstraction_marker_hits,
        length_compliant: words_over_budget === 0,
        drift_detected,
      },
    };
  } catch {
    // Never break the pipeline
    return {
      sanitized: draft,
      metrics: {
        actual_word_count: 0,
        maxWords_expected: plan.maxWords,
        words_over_budget: 0,
        forbidden_phrase_hits: [],
        abstraction_marker_hits: [],
        length_compliant: true,
        drift_detected: false,
      },
    };
  }
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
  opts: {
    sesameUrl?: string;
    draftPolicy?: DraftPolicy;
  } = {}
): Promise<{ coreMessage: string; spokenText: string; displayText: string; draftMetrics: DraftMetrics }> {
  const { sesameUrl = 'http://maia-sesame-tts:8000', draftPolicy } = opts;

  // ── Step 1: Sanitize ─────────────────────────────────────────────────────
  // THE choke point. Forbidden phrases, abstraction markers, length clamp.
  // PFI re-authors here. One place. Always.
  const { sanitized, metrics } = sanitizeDraft(draft, plan, draftPolicy);

  if (metrics.drift_detected) {
    console.warn('[maia.finalize] drift detected', JSON.stringify({
      forbidden_phrase_hits: metrics.forbidden_phrase_hits,
      abstraction_marker_hits: metrics.abstraction_marker_hits,
      words_over_budget: metrics.words_over_budget,
      stance: plan.stance,
      element: plan.element,
    }));
  }

  // ── Step 2: Sesame CI shaping on sanitized text ──────────────────────────
  const displayText = sanitized;
  let spokenText = sanitized;
  let shaped = false;

  try {
    const response = await fetch(`${sesameUrl}/ci/shape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: sanitized,
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
      drift_detected: metrics.drift_detected,
      actual_words: metrics.actual_word_count,
      budget: metrics.maxWords_expected,
    }));
  } catch (err: any) {
    // Silent fallback: Sesame unavailable, spokenText equals displayText
    console.info('[tts.finalize]', JSON.stringify({
      stage: 'ci_shape_fallback',
      reason: err?.code ?? err?.message ?? 'unknown',
    }));
  }

  return { coreMessage: sanitized, spokenText, displayText, draftMetrics: metrics };
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
