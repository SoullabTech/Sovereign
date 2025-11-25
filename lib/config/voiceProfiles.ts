/**
 * Unified Voice Profiles Configuration
 * Combines ElevenLabs and OpenAI voices for PersonalOracleAgent
 */

export type VoiceProvider = 'elevenlabs' | 'openai';
export type ElementalMask = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type VoiceCategory = 'canonical' | 'alternative' | 'experimental' | 'custom';

export interface VoiceProfile {
  id: string;
  provider: VoiceProvider;
  displayName: string;
  description: string;
  baseVoiceId: string;
  category: VoiceCategory;
  masks: ElementalMask[];
  personality: {
    warmth: number;       // 0-1
    authority: number;    // 0-1
    mysticism: number;    // 0-1
    groundedness: number; // 0-1
  };
  technicalParams?: {
    speed?: number;
    pitch?: number;
    stability?: number;
    similarity?: number;
  };
  preview?: string; // Sample audio URL
  unlockLevel?: number; // 0 = always available, higher = unlock through journey
  fallback?: {
    provider: VoiceProvider;
    baseVoiceId: string;
  };
}

/**
 * Canonical Oracle Voices (OpenAI with ElevenLabs fallback)
 */
const canonicalVoices: VoiceProfile[] = [
  {
    id: 'maya',
    provider: 'elevenlabs',
    displayName: 'Maya (Emily)',
    description: 'Warm oracle companion - sacred witness and guide',
    baseVoiceId: 'MF3mGyEYCl7XYWbV9V6O',  // ElevenLabs Emily - smooth, natural delivery
    category: 'canonical',
    masks: ['fire', 'water', 'earth', 'air', 'aether'],
    personality: {
      warmth: 0.9,
      authority: 0.6,
      mysticism: 0.8,
      groundedness: 0.7
    },
    technicalParams: {
      speed: 1.0,
      pitch: 1.0,
      stability: 0.75,  // Balanced for natural flow
      similarity: 0.85   // Slightly lower for more variation
    },
    unlockLevel: 0,
    fallback: {
      provider: 'openai',
      baseVoiceId: 'nova' // Nova as fallback
    }
  },
  {
    id: 'anthony',
    provider: 'openai',
    displayName: 'Anthony (Ash)',
    description: 'Late-night philosopher - contemplative and grounded',
    baseVoiceId: 'ash',  // OpenAI voice
    category: 'canonical',
    masks: ['earth', 'air', 'aether'],
    personality: {
      warmth: 0.7,
      authority: 0.8,
      mysticism: 0.6,
      groundedness: 0.95
    },
    technicalParams: {
      speed: 0.9,
      pitch: 0.95,
      stability: 0.95,
      similarity: 0.9
    },
    unlockLevel: 0,
    fallback: {
      provider: 'elevenlabs',
      baseVoiceId: process.env.ANTHONY_ELEVENLABS_ID || 'yoZ06aMxZJJ28mfd3POQ' // ElevenLabs Anthony backup
    }
  }
];

/**
 * OpenAI Voice Options
 */
const openAIVoices: VoiceProfile[] = [
  {
    id: 'alloy-balanced',
    provider: 'openai',
    displayName: 'Alloy',
    description: 'Balanced and neutral - clear modern presence',
    baseVoiceId: 'alloy',
    category: 'alternative',
    masks: ['air', 'aether'],
    personality: {
      warmth: 0.5,
      authority: 0.6,
      mysticism: 0.3,
      groundedness: 0.7
    },
    technicalParams: {
      speed: 1.0
    },
    unlockLevel: 0
  },
  {
    id: 'nova-bright',
    provider: 'openai',
    displayName: 'Nova',
    description: 'Bright and engaging - youthful energy',
    baseVoiceId: 'nova',
    category: 'alternative',
    masks: ['fire', 'air'],
    personality: {
      warmth: 0.7,
      authority: 0.4,
      mysticism: 0.5,
      groundedness: 0.5
    },
    technicalParams: {
      speed: 1.05
    },
    unlockLevel: 0
  },
  {
    id: 'shimmer-ethereal',
    provider: 'openai',
    displayName: 'Shimmer',
    description: 'Ethereal and light - transcendent quality',
    baseVoiceId: 'shimmer',
    category: 'alternative',
    masks: ['water', 'air', 'aether'],
    personality: {
      warmth: 0.6,
      authority: 0.3,
      mysticism: 0.9,
      groundedness: 0.3
    },
    technicalParams: {
      speed: 0.95
    },
    unlockLevel: 1
  },
  {
    id: 'onyx-deep',
    provider: 'openai',
    displayName: 'Onyx',
    description: 'Deep and resonant - ancient wisdom',
    baseVoiceId: 'onyx',
    category: 'alternative',
    masks: ['earth', 'water'],
    personality: {
      warmth: 0.8,
      authority: 0.9,
      mysticism: 0.7,
      groundedness: 1.0
    },
    technicalParams: {
      speed: 0.9
    },
    unlockLevel: 1
  },
  {
    id: 'echo-mystical',
    provider: 'openai',
    displayName: 'Echo',
    description: 'Mystical resonance - otherworldly presence',
    baseVoiceId: 'echo',
    category: 'experimental',
    masks: ['water', 'aether'],
    personality: {
      warmth: 0.5,
      authority: 0.5,
      mysticism: 1.0,
      groundedness: 0.4
    },
    technicalParams: {
      speed: 0.92
    },
    unlockLevel: 2
  },
  {
    id: 'fable-storyteller',
    provider: 'openai',
    displayName: 'Fable',
    description: 'Natural storyteller - warm narrative presence',
    baseVoiceId: 'fable',
    category: 'alternative',
    masks: ['fire', 'earth', 'water'],
    personality: {
      warmth: 0.85,
      authority: 0.6,
      mysticism: 0.6,
      groundedness: 0.7
    },
    technicalParams: {
      speed: 0.98
    },
    unlockLevel: 1
  }
];

/**
 * Special Ritual Voices (Unlockable)
 */
const ritualVoices: VoiceProfile[] = [
  {
    id: 'maya-threshold',
    provider: 'elevenlabs',
    displayName: 'Maya of the Threshold',
    description: 'Maya in liminal space - for major transitions',
    baseVoiceId: process.env.MAYA_ELEVENLABS_ID || '21m00Tcm4TlvDq8ikWAM',
    category: 'experimental',
    masks: ['aether'],
    personality: {
      warmth: 0.7,
      authority: 0.8,
      mysticism: 1.0,
      groundedness: 0.5
    },
    technicalParams: {
      speed: 0.88,
      pitch: 0.98,
      stability: 0.7,
      similarity: 0.8
    },
    unlockLevel: 3
  },
  {
    id: 'collective-wisdom',
    provider: 'openai',
    displayName: 'The Collective',
    description: 'Multiple voices in harmony - group consciousness',
    baseVoiceId: 'echo',
    category: 'experimental',
    masks: ['aether'],
    personality: {
      warmth: 0.6,
      authority: 0.7,
      mysticism: 0.95,
      groundedness: 0.6
    },
    technicalParams: {
      speed: 0.85
    },
    unlockLevel: 5
  }
];

/**
 * Complete Voice Profile Registry
 */
export const voiceProfiles: VoiceProfile[] = [
  ...canonicalVoices,
  ...openAIVoices,
  ...ritualVoices
];

/**
 * Performance-Optimized Voice Profile Caching
 * Pre-computed Maps for O(1) lookup performance
 */
const voiceProfilesById = new Map(voiceProfiles.map(profile => [profile.id, profile]));

const voiceProfilesByCategory = voiceProfiles.reduce((acc, profile) => {
  if (!acc.has(profile.category)) acc.set(profile.category, []);
  acc.get(profile.category)!.push(profile);
  return acc;
}, new Map<VoiceCategory, VoiceProfile[]>());

const voiceProfilesByProvider = voiceProfiles.reduce((acc, profile) => {
  if (!acc.has(profile.provider)) acc.set(profile.provider, []);
  acc.get(profile.provider)!.push(profile);
  return acc;
}, new Map<VoiceProvider, VoiceProfile[]>());

const voiceProfilesByMask = voiceProfiles.reduce((acc, profile) => {
  profile.masks.forEach(mask => {
    if (!acc.has(mask)) acc.set(mask, []);
    acc.get(mask)!.push(profile);
  });
  return acc;
}, new Map<ElementalMask, VoiceProfile[]>());

// Pre-sorted profiles by unlock level for efficient filtering
const voiceProfilesByLevel = voiceProfiles
  .slice()
  .sort((a, b) => (a.unlockLevel || 0) - (b.unlockLevel || 0));

/**
 * Voice Selection Helpers (Performance-Optimized)
 * Replaced O(n) array searches with O(1) Map lookups
 */
export const getVoiceProfile = (id: string): VoiceProfile | undefined => {
  return voiceProfilesById.get(id);
};

export const getVoicesByCategory = (category: VoiceCategory): VoiceProfile[] => {
  return voiceProfilesByCategory.get(category) || [];
};

export const getVoicesByProvider = (provider: VoiceProvider): VoiceProfile[] => {
  return voiceProfilesByProvider.get(provider) || [];
};

export const getAvailableVoices = (userLevel: number = 0): VoiceProfile[] => {
  // Optimized: early termination using pre-sorted array
  const result: VoiceProfile[] = [];
  for (const profile of voiceProfilesByLevel) {
    if ((profile.unlockLevel || 0) <= userLevel) {
      result.push(profile);
    } else {
      break; // Early termination - profiles are sorted by level
    }
  }
  return result;
};

export const getVoicesWithMask = (mask: ElementalMask): VoiceProfile[] => {
  return voiceProfilesByMask.get(mask) || [];
};

/**
 * Default voice selection logic
 */
export const selectDefaultVoice = (
  userPreference?: string,
  userLevel: number = 0
): VoiceProfile => {
  // Try user preference first
  if (userPreference) {
    const preferred = getVoiceProfile(userPreference);
    if (preferred && (preferred.unlockLevel || 0) <= userLevel) {
      return preferred;
    }
  }

  // Default to Maya
  return canonicalVoices[0];
};

/**
 * Voice Profile UI Metadata
 */
export interface VoiceMenuItem {
  profile: VoiceProfile;
  isAvailable: boolean;
  isSelected: boolean;
  unlockHint?: string;
}

export const buildVoiceMenu = (
  currentVoiceId: string,
  userLevel: number = 0
): {
  canonical: VoiceMenuItem[];
  alternative: VoiceMenuItem[];
  experimental: VoiceMenuItem[];
} => {
  const buildMenuItem = (profile: VoiceProfile): VoiceMenuItem => {
    const isAvailable = (profile.unlockLevel || 0) <= userLevel;
    return {
      profile,
      isAvailable,
      isSelected: profile.id === currentVoiceId,
      unlockHint: !isAvailable ?
        `Unlocks at trust level ${profile.unlockLevel}` :
        undefined
    };
  };

  return {
    canonical: canonicalVoices.map(buildMenuItem),
    alternative: openAIVoices
      .filter(v => v.category === 'alternative')
      .map(buildMenuItem),
    experimental: [
      ...openAIVoices.filter(v => v.category === 'experimental'),
      ...ritualVoices
    ].map(buildMenuItem)
  };
};

/**
 * Export for PersonalOracleAgent integration
 */
export const voiceConfig = {
  profiles: voiceProfiles,
  getProfile: getVoiceProfile,
  selectDefault: selectDefaultVoice,
  buildMenu: buildVoiceMenu
};