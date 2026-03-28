/**
 * Agent Tone Map — context-aware style preset resolution.
 *
 * Maps (agent, element, emotional state, interaction state) → StylePreset.
 * Same MAIA identity, different delivery weights.
 *
 * Resolution order:
 *   1. Emotional override (grief, panic, etc.) — highest priority
 *   2. Interaction state (interrupted, "just tell me", looping)
 *   3. Agent/element default
 *
 * See: docs/maia-voice-spec-v1.md § Agent to Style Mapping
 */

import type { Element } from '@/lib/types/voiceIntent';
import type { StylePreset } from './stylePresets';

// ── Agent → Default Preset ───────────────────────────────────────────────────

const AGENT_PRESET: Record<string, StylePreset> = {
  main:    'grounded_reflective',
  guide:   'quiet_containing',
  shadow:  'shadow_depth',
  mentor:  'mentor_firm',
  fire:    'clear_direct',
  water:   'quiet_containing',
  earth:   'grounded_reflective',
  air:     'clear_direct',
  aether:  'ritual_spacious',
  oracle:  'grounded_reflective',
  scribe:  'clear_direct',
};

// ── Element → Default Preset (fallback when no agent specified) ──────────────

const ELEMENT_PRESET: Record<Element, StylePreset> = {
  fire:   'clear_direct',
  water:  'quiet_containing',
  earth:  'grounded_reflective',
  air:    'clear_direct',
  aether: 'ritual_spacious',
};

// ── Emotional State → Override Preset ────────────────────────────────────────

const EMOTION_OVERRIDE: Record<string, StylePreset> = {
  grief:       'shadow_depth',
  sadness:     'shadow_depth',
  loss:        'shadow_depth',
  panic:       'quiet_containing',
  activation:  'quiet_containing',
  overwhelm:   'quiet_containing',
  fear:        'quiet_containing',
  anxiety:     'quiet_containing',
  confusion:   'clear_direct',
  stuck:       'clear_direct',
  reflection:  'grounded_reflective',
  journaling:  'grounded_reflective',
  ceremony:    'ritual_spacious',
  ritual:      'ritual_spacious',
  meditation:  'ritual_spacious',
  threshold:   'ritual_spacious',
};

// ── Resolution ───────────────────────────────────────────────────────────────

export interface ToneContext {
  /** Agent role (main, guide, shadow, mentor, fire, water, earth, air, aether) */
  agent?: string;
  /** Spiralogic element from Conductor */
  element?: Element;
  /** Detected emotional tone (grief, panic, confusion, etc.) */
  emotionalTone?: string;
  /** First response in this session? */
  isFirstResponse?: boolean;
  /** Was the previous turn interrupted / barged-in? */
  isAfterInterruption?: boolean;
  /** Did the user explicitly ask for directness? ("just tell me", "be direct") */
  userAskedForDirectness?: boolean;
  /** Is the user looping on the same pattern? */
  isRepeatedLooping?: boolean;
}

/**
 * Resolve the style preset for this turn.
 *
 * Priority:
 *   1. User asked for directness → clear_direct
 *   2. After interruption → clear_direct (shorter re-entry)
 *   3. Repeated looping → mentor_firm
 *   4. Emotional state override
 *   5. Agent default
 *   6. Element default
 *   7. grounded_reflective (universal fallback)
 */
export function resolveStylePreset(ctx: ToneContext): StylePreset {
  // Interaction state overrides (explicit user signals)
  if (ctx.userAskedForDirectness) return 'clear_direct';
  if (ctx.isAfterInterruption) return 'clear_direct';
  if (ctx.isRepeatedLooping) return 'mentor_firm';

  // Emotional state override
  if (ctx.emotionalTone) {
    const emotionPreset = EMOTION_OVERRIDE[ctx.emotionalTone.toLowerCase()];
    if (emotionPreset) return emotionPreset;
  }

  // Agent default
  if (ctx.agent) {
    const agentPreset = AGENT_PRESET[ctx.agent.toLowerCase()];
    if (agentPreset) return agentPreset;
  }

  // Element default
  if (ctx.element) {
    return ELEMENT_PRESET[ctx.element] || 'grounded_reflective';
  }

  return 'grounded_reflective';
}
