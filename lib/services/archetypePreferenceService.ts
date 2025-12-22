// Sovereignty mode: Archetype service uses localStorage only (Supabase removed)

export type ArchetypeId =
  | 'LAB_PARTNER'
  | 'TRUSTED_FRIEND'
  | 'GUIDE'
  | 'ALCHEMIST'
  | 'MENTOR'
  | 'WITNESS'
  | 'CHALLENGER'
  | 'AUTO';

export interface ArchetypeConfig {
  id: ArchetypeId;
  name: string;
  systemPrompt: string;
}

export interface UserArchetypeProfile {
  userId: string;
  preferredModes: {
    morning?: ArchetypeId;
    evening?: ArchetypeId;
    crisis?: ArchetypeId;
    breakthrough?: ArchetypeId;
  };
  effectiveness: Record<ArchetypeId, number>;
  patterns: {
    switchesOften: boolean;
    prefersConsistency: boolean;
    respondsToAutoDetect: boolean;
  };
  lastArchetype?: ArchetypeId;
  lastSessionQuality?: number;
}

interface ConversationContext {
  isFirstSession: boolean;
  inCrisis: boolean;
  seekingDirection: boolean;
  deepWork: boolean;
  lastArchetypeWorkedWell: boolean;
  lastArchetype?: ArchetypeId;
}

const ARCHETYPE_CONFIGS: Record<ArchetypeId, ArchetypeConfig> = {
  LAB_PARTNER: {
    id: 'LAB_PARTNER',
    name: 'Lab Partner',
    systemPrompt: 'You are an equal collaborator, exploring and discovering together. Use "we" and "let\'s" language. Share your curiosity and uncertainty. Co-create solutions.'
  },
  TRUSTED_FRIEND: {
    id: 'TRUSTED_FRIEND',
    name: 'Trusted Friend',
    systemPrompt: 'You are a warm, supportive friend who knows them well. Use personal warmth, empathy, and gentle humor. Celebrate wins, hold space for struggles.'
  },
  GUIDE: {
    id: 'GUIDE',
    name: 'Guide',
    systemPrompt: 'You are a wise guide who illuminates the path forward. Offer clear direction while honoring their autonomy. Point to possibilities they may not see.'
  },
  ALCHEMIST: {
    id: 'ALCHEMIST',
    name: 'Wise Alchemist',
    systemPrompt: 'You facilitate deep transformation. Work with symbolic language, paradox, and depth. Help them transmute pain into wisdom, shadow into gold.'
  },
  MENTOR: {
    id: 'MENTOR',
    name: 'Mentor',
    systemPrompt: 'You teach from experience and wisdom. Share frameworks, models, and lessons learned. Be direct but kind. Challenge them to grow.'
  },
  WITNESS: {
    id: 'WITNESS',
    name: 'Witness',
    systemPrompt: 'You offer pure presence and deep listening. Minimal words, maximum presence. Reflect back what you hear without interpretation or advice.'
  },
  CHALLENGER: {
    id: 'CHALLENGER',
    name: 'Challenger',
    systemPrompt: 'You lovingly confront patterns and invite growth. Point out contradictions, ask hard questions, push edges with compassion.'
  },
  AUTO: {
    id: 'AUTO',
    name: 'Auto-Detect',
    systemPrompt: 'Sense what the moment calls for and embody that archetype naturally. Adapt fluidly based on their needs.'
  }
};

const MODE_CHANGE_REQUESTS: Record<string, ArchetypeId> = {
  'be my friend': 'TRUSTED_FRIEND',
  'I need guidance': 'GUIDE',
  'teach me': 'MENTOR',
  'just listen': 'WITNESS',
  'challenge me': 'CHALLENGER',
  'help me transform this': 'ALCHEMIST',
  'let\'s figure this out together': 'LAB_PARTNER',
  'let\'s explore': 'LAB_PARTNER',
  'I need support': 'TRUSTED_FRIEND',
  'show me the way': 'GUIDE'
};

export class ArchetypePreferenceService {
  async getUserPreference(userId: string): Promise<ArchetypeId> {
    const saved = await this.getStoredPreference(userId);

    if (saved && saved !== 'AUTO') {
      return saved;
    }

    return this.getSmartDefault(userId);
  }

  private async getStoredPreference(userId: string): Promise<ArchetypeId | null> {
    if (typeof window === 'undefined') return null;

    const localPref = localStorage.getItem('maia_archetype');
    if (localPref) {
      return localPref as ArchetypeId;
    }

    // Sovereignty mode: Supabase lookup removed
    return null;
  }

  private async getSmartDefault(userId: string): Promise<ArchetypeId> {
    const profile = await this.getUserProfile(userId);

    if (!profile || !profile.lastArchetype) {
      return 'TRUSTED_FRIEND';
    }

    if (profile.patterns.respondsToAutoDetect) {
      return 'AUTO';
    }

    return profile.lastArchetype;
  }

  async getUserProfile(userId: string): Promise<UserArchetypeProfile | null> {
    if (typeof window === 'undefined') return null;

    // Sovereignty mode: Load from localStorage only
    const stored = localStorage.getItem('maia_archetype_profile');
    if (stored) {
      try {
        return JSON.parse(stored) as UserArchetypeProfile;
      } catch (e) {
        console.error('[archetypeService] Failed to parse profile', e);
      }
    }

    return null;
  }

  async saveUserProfile(profile: UserArchetypeProfile): Promise<void> {
    if (typeof window === 'undefined') return;

    // Sovereignty mode: Save to localStorage only
    localStorage.setItem('maia_archetype_profile', JSON.stringify(profile));
  }

  detectArchetypeFromMessage(message: string): ArchetypeId | null {
    const lowered = message.toLowerCase();

    for (const [phrase, archetype] of Object.entries(MODE_CHANGE_REQUESTS)) {
      if (lowered.includes(phrase)) {
        return archetype;
      }
    }

    return null;
  }

  async recordSessionFeedback(
    userId: string,
    archetype: ArchetypeId,
    quality: number
  ): Promise<void> {
    const profile = await this.getUserProfile(userId) || {
      userId,
      preferredModes: {},
      effectiveness: {} as Record<ArchetypeId, number>,
      patterns: {
        switchesOften: false,
        prefersConsistency: false,
        respondsToAutoDetect: false
      }
    };

    profile.effectiveness[archetype] = quality;
    profile.lastArchetype = archetype;
    profile.lastSessionQuality = quality;

    await this.saveUserProfile(profile);
  }

  getArchetypeConfig(id: ArchetypeId): ArchetypeConfig {
    return ARCHETYPE_CONFIGS[id];
  }

  getAllArchetypes(): ArchetypeConfig[] {
    return Object.values(ARCHETYPE_CONFIGS);
  }
}

export function getArchetypeService(): ArchetypePreferenceService {
  return new ArchetypePreferenceService();
}
