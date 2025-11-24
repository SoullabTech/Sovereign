/**
 * Voice Profile Configuration
 * Centralized voice profiles for Maya's elemental personas
 */

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  baseVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  parameters: {
    speed: number;
    pitch: number;
    stability: number;
    similarityBoost: number;
  };
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  personality?: string;
}

export const MAYA_VOICE_PROFILES: Record<string, VoiceProfile> = {
  'maya-default': {
    id: 'maya-default',
    name: 'Maya - Sacred Mirror',
    description: 'Warm, mystical, and contemplative',
    baseVoice: 'nova',
    parameters: {
      speed: 0.85,
      pitch: 1.15,
      stability: 0.8,
      similarityBoost: 0.7,
    },
    personality: 'Gentle guide with ethereal presence',
  },
  'maya-fire': {
    id: 'maya-fire',
    name: 'Maya - Fire Element',
    description: 'Passionate and transformative',
    baseVoice: 'shimmer',
    parameters: {
      speed: 0.95,
      pitch: 1.2,
      stability: 0.7,
      similarityBoost: 0.8,
    },
    element: 'fire',
    personality: 'Bold and transformative energy',
  },
  'maya-water': {
    id: 'maya-water',
    name: 'Maya - Water Element',
    description: 'Flowing and emotionally attuned',
    baseVoice: 'nova',
    parameters: {
      speed: 0.75,
      pitch: 1.1,
      stability: 0.9,
      similarityBoost: 0.6,
    },
    element: 'water',
    personality: 'Flowing intuition and deep feeling',
  },
  'maya-earth': {
    id: 'maya-earth',
    name: 'Maya - Earth Element',
    description: 'Grounded and nurturing',
    baseVoice: 'fable',
    parameters: {
      speed: 0.8,
      pitch: 0.95,
      stability: 0.95,
      similarityBoost: 0.75,
    },
    element: 'earth',
    personality: 'Stable wisdom and practical guidance',
  },
  'maya-air': {
    id: 'maya-air',
    name: 'Maya - Air Element',
    description: 'Light and intellectually curious',
    baseVoice: 'alloy',
    parameters: {
      speed: 1.0,
      pitch: 1.25,
      stability: 0.7,
      similarityBoost: 0.65,
    },
    element: 'air',
    personality: 'Clear thought and swift insight',
  },
  'maya-aether': {
    id: 'maya-aether',
    name: 'Maya - Aether Element',
    description: 'Transcendent and mystical',
    baseVoice: 'nova',
    parameters: {
      speed: 0.82,
      pitch: 1.18,
      stability: 0.85,
      similarityBoost: 0.72,
    },
    element: 'aether',
    personality: 'Ethereal wisdom and cosmic insight',
  },
};

export function getVoiceProfile(characterId: string): VoiceProfile | null {
  return MAYA_VOICE_PROFILES[characterId] || null;
}

export function getVoiceProfileByElement(element: string): VoiceProfile | null {
  const key = `maya-${element}`;
  return MAYA_VOICE_PROFILES[key] || MAYA_VOICE_PROFILES['maya-default'];
}

export function getAllVoiceProfiles(): VoiceProfile[] {
  return Object.values(MAYA_VOICE_PROFILES);
}

export function getAvailableElements(): string[] {
  return ['aether', 'fire', 'water', 'earth', 'air'];
}