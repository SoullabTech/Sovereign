/**
 * 🧭 Archetype Router
 *
 * Routes user input to appropriate elemental archetype
 * Integrates with Spiralogic constellation for multi-agent intelligence
 */

import { ElementalAgentPrompts, VoiceStyleMap, PacingMap, type Archetype } from '@/lib/prompts/elementalAgents';

/**
 * Choose appropriate archetype based on user text
 * Uses pattern matching and emotional tone detection
 */
export function chooseArchetype(text: string): Archetype {
  const t = text.toLowerCase();

  // Water - Emotional processing, vulnerability, shadow work
  if (/feel|sad|overwhelmed|grief|heart|emotional|cry|hurt|lonely|scared/.test(t)) {
    return "Water";
  }

  // Earth - Structure, ritual, grounding, practical support
  if (/discipline|structure|daily|practice|routine|habit|ritual|grounded|embodied/.test(t)) {
    return "Earth";
  }

  // Fire - Vision, passion, action, motivation
  if (/vision|possibility|passion|create|dream|goal|excite|inspire|start/.test(t)) {
    return "Fire";
  }

  // Air - Mental patterns, perspective, reframing, strategy
  if (/stuck|perspective|logic|thoughts|overthink|why|strategy|reframe|pattern/.test(t)) {
    return "Air";
  }

  // Aether - Integration, synthesis, metacognition, soul-level
  return "Aether";
}

/**
 * Get archetype-specific prompt for LLM
 */
export function getArchetypePrompt(text: string): { prompt: string; archetype: Archetype } {
  const archetype = chooseArchetype(text);
  const promptFn = ElementalAgentPrompts[archetype];
  const prompt = promptFn(text);

  return { prompt, archetype };
}

/**
 * Get voice style for TTS synthesis
 */
export function getVoiceStyle(archetype: Archetype): string {
  return VoiceStyleMap[archetype];
}

/**
 * Get pacing for voice synthesis
 */
export function getPacing(archetype: Archetype): "fast" | "moderate" | "slow" | "thoughtful" {
  return PacingMap[archetype];
}

/**
 * Complete archetypal routing with all metadata
 */
export function routeToArchetype(text: string): {
  archetype: Archetype;
  prompt: string;
  voiceStyle: string;
  pacing: "fast" | "moderate" | "slow" | "thoughtful";
} {
  const archetype = chooseArchetype(text);
  const prompt = ElementalAgentPrompts[archetype](text);
  const voiceStyle = VoiceStyleMap[archetype];
  const pacing = PacingMap[archetype];

  return {
    archetype,
    prompt,
    voiceStyle,
    pacing
  };
}
