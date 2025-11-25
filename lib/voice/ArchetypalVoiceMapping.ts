/**
 * 🎙️ Archetypal Voice Mapping
 *
 * Maps 5 elemental archetypes to OpenAI TTS voices
 * Hybrid system: Auto-flow with Settings override
 *
 * Design: Voice becomes part of archetypal presence
 */

import type { Archetype } from './conversation/AffectDetector';

export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

/**
 * Archetype → OpenAI Voice Mapping
 * Each archetype has a distinct vocal signature
 */
export const ARCHETYPE_VOICE_MAP: Record<Archetype, OpenAIVoice> = {
  Fire: 'nova',       // 🔥 Upbeat, energetic (bright catalyst)
  Water: 'shimmer',   // 💧 Warm, empathetic (gentle container)
  Earth: 'alloy',     // 🌍 Neutral, balanced (grounded anchor)
  Air: 'fable',       // 🌬️ British, expressive (clear witness)
  Aether: 'shimmer'   // 🌌 Warm, spacious (default MAIA)
};

/**
 * Voice characteristics for UI display
 */
export const VOICE_CHARACTERISTICS: Record<OpenAIVoice, {
  name: string;
  description: string;
  archetype?: Archetype;
  emoji: string;
}> = {
  shimmer: {
    name: 'Shimmer',
    description: 'Warm, empathetic (Water/Aether)',
    archetype: 'Water',
    emoji: '💧'
  },
  nova: {
    name: 'Nova',
    description: 'Upbeat, energetic (Fire)',
    archetype: 'Fire',
    emoji: '🔥'
  },
  alloy: {
    name: 'Alloy',
    description: 'Neutral, balanced (Earth)',
    archetype: 'Earth',
    emoji: '🌍'
  },
  fable: {
    name: 'Fable',
    description: 'Expressive, articulate (Air)',
    archetype: 'Air',
    emoji: '🌬️'
  },
  echo: {
    name: 'Echo',
    description: 'Clear, professional',
    emoji: '🎙️'
  },
  onyx: {
    name: 'Onyx',
    description: 'Deep, authoritative',
    emoji: '🗣️'
  }
};

/**
 * Get OpenAI voice for archetype
 * Used in auto-flow mode
 */
export function getVoiceForArchetype(archetype: Archetype): OpenAIVoice {
  return ARCHETYPE_VOICE_MAP[archetype] || 'shimmer';
}

/**
 * Get archetype that best matches voice
 * Used when user manually selects voice
 */
export function getArchetypeForVoice(voice: OpenAIVoice): Archetype | null {
  const voiceChar = VOICE_CHARACTERISTICS[voice];
  return voiceChar.archetype || null;
}

/**
 * Voice preference settings
 */
export interface VoicePreference {
  mode: 'auto' | 'manual';     // Auto-flow or user-selected
  manualVoice?: OpenAIVoice;   // If manual, which voice
  enableTransitions: boolean;   // Should voice change with archetype?
}

/**
 * Default voice preference (auto-flow with shimmer)
 */
export const DEFAULT_VOICE_PREFERENCE: VoicePreference = {
  mode: 'auto',
  manualVoice: 'shimmer',
  enableTransitions: true
};

/**
 * Resolve voice based on preference and current archetype
 * This is the core hybrid logic
 */
export function resolveVoice(
  archetype: Archetype,
  preference: VoicePreference
): OpenAIVoice {
  // Manual mode: user has pinned a voice
  if (preference.mode === 'manual' && preference.manualVoice) {
    return preference.manualVoice;
  }

  // Auto mode with transitions disabled: use default
  if (preference.mode === 'auto' && !preference.enableTransitions) {
    return 'shimmer';
  }

  // Auto mode with transitions: map archetype to voice
  return getVoiceForArchetype(archetype);
}

/**
 * Get voice display info for UI
 */
export function getVoiceDisplayInfo(voice: OpenAIVoice): {
  name: string;
  emoji: string;
  description: string;
} {
  const char = VOICE_CHARACTERISTICS[voice];
  return {
    name: char.name,
    emoji: char.emoji,
    description: char.description
  };
}

/**
 * Get all available voices for dropdown
 */
export function getAllVoices(): Array<{
  voice: OpenAIVoice;
  name: string;
  description: string;
  emoji: string;
  archetype?: Archetype;
}> {
  return Object.entries(VOICE_CHARACTERISTICS).map(([voice, char]) => ({
    voice: voice as OpenAIVoice,
    name: char.name,
    description: char.description,
    emoji: char.emoji,
    archetype: char.archetype
  }));
}

/**
 * Get archetypal voices only (for simplified UI)
 */
export function getArchetypalVoices(): Array<{
  archetype: Archetype;
  voice: OpenAIVoice;
  name: string;
  emoji: string;
}> {
  return [
    { archetype: 'Water', voice: 'shimmer', name: 'Water (nurturing)', emoji: '💧' },
    { archetype: 'Fire', voice: 'nova', name: 'Fire (energetic)', emoji: '🔥' },
    { archetype: 'Earth', voice: 'alloy', name: 'Earth (grounded)', emoji: '🌍' },
    { archetype: 'Air', voice: 'fable', name: 'Air (clear)', emoji: '🌬️' },
    { archetype: 'Aether', voice: 'shimmer', name: 'Aether (spacious)', emoji: '🌌' }
  ];
}

/**
 * Format voice for TTS API call
 */
export function formatVoiceForAPI(voice: OpenAIVoice): {
  voice: OpenAIVoice;
  speed: number;  // Adjust speed based on archetype
} {
  // Default speed variations by voice/archetype
  const speedMap: Record<OpenAIVoice, number> = {
    nova: 1.05,      // Fire: slightly faster
    shimmer: 1.0,    // Water/Aether: normal
    alloy: 0.98,     // Earth: slightly slower
    fable: 1.02,     // Air: slightly faster
    echo: 1.0,       // Neutral
    onyx: 0.95       // Deep: slower
  };

  return {
    voice,
    speed: speedMap[voice] || 1.0
  };
}

/**
 * Should voice transition be announced?
 * Returns transition message if archetype/voice changes significantly
 */
export function getVoiceTransitionMessage(
  fromArchetype: Archetype,
  toArchetype: Archetype,
  preference: VoicePreference
): string | null {
  // Only announce if transitions are enabled and voice will change
  if (!preference.enableTransitions) return null;
  if (preference.mode === 'manual') return null;

  const fromVoice = getVoiceForArchetype(fromArchetype);
  const toVoice = getVoiceForArchetype(toArchetype);

  if (fromVoice === toVoice) return null;

  // Return subtle transition message
  const transitionMessages: Record<string, string> = {
    'Water_Fire': '[energy rising]',
    'Fire_Water': '[softening]',
    'Earth_Air': '[lifting]',
    'Air_Earth': '[grounding]',
    'Aether_Water': '[deepening]',
    'Water_Aether': '[expanding]'
  };

  const key = `${fromArchetype}_${toArchetype}`;
  return transitionMessages[key] || null;
}
