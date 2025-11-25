import { createClientComponentClient } from '@/lib/supabase';

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
  private supabase = createClientComponentClient();

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

    try {
      const { data } = await this.supabase
        .from('user_preferences')
        .select('archetype')
        .eq('user_id', userId)
        .single();

      if (data?.archetype) {
        return data.archetype as ArchetypeId;
      }
    } catch (error) {
      console.warn('Could not load archetype preference:', error);
    }

    return null;
  }

  async getSmartDefault(userId: string): Promise<ArchetypeId> {
    const context = await this.analyzeContext(userId);

    if (context.isFirstSession) return 'LAB_PARTNER';
    if (context.inCrisis) return 'TRUSTED_FRIEND';
    if (context.seekingDirection) return 'GUIDE';
    if (context.deepWork) return 'ALCHEMIST';

    if (context.lastArchetypeWorkedWell && context.lastArchetype) {
      return context.lastArchetype;
    }

    return 'LAB_PARTNER';
  }

  private async analyzeContext(userId: string): Promise<ConversationContext> {
    const profile = await this.getUserProfile(userId);

    return {
      isFirstSession: !profile.lastArchetype,
      inCrisis: false,
      seekingDirection: false,
      deepWork: false,
      lastArchetypeWorkedWell: (profile.lastSessionQuality || 0) > 0.7,
      lastArchetype: profile.lastArchetype
    };
  }

  async getUserProfile(userId: string): Promise<UserArchetypeProfile> {
    const defaultProfile: UserArchetypeProfile = {
      userId,
      preferredModes: {},
      effectiveness: {
        LAB_PARTNER: 0.5,
        TRUSTED_FRIEND: 0.5,
        GUIDE: 0.5,
        ALCHEMIST: 0.5,
        MENTOR: 0.5,
        WITNESS: 0.5,
        CHALLENGER: 0.5,
        AUTO: 0.5
      },
      patterns: {
        switchesOften: false,
        prefersConsistency: true,
        respondsToAutoDetect: true
      }
    };

    try {
      const { data } = await this.supabase
        .from('user_archetype_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        return {
          ...defaultProfile,
          ...data,
          effectiveness: data.effectiveness || defaultProfile.effectiveness,
          preferredModes: data.preferred_modes || defaultProfile.preferredModes,
          patterns: data.patterns || defaultProfile.patterns
        };
      }
    } catch (error) {
      console.warn('Could not load archetype profile:', error);
    }

    return defaultProfile;
  }

  async trackEffectiveness(
    userId: string,
    archetype: ArchetypeId,
    sessionQuality: number
  ): Promise<void> {
    try {
      await this.supabase
        .from('archetype_sessions')
        .insert({
          user_id: userId,
          archetype,
          effectiveness: sessionQuality,
          timestamp: new Date().toISOString()
        });

      await this.updateUserProfile(userId, archetype, sessionQuality);
    } catch (error) {
      console.error('Failed to track archetype effectiveness:', error);
    }
  }

  private async updateUserProfile(
    userId: string,
    archetype: ArchetypeId,
    sessionQuality: number
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);

    const currentEffectiveness = profile.effectiveness[archetype];
    const newEffectiveness = (currentEffectiveness * 0.8) + (sessionQuality * 0.2);

    profile.effectiveness[archetype] = newEffectiveness;
    profile.lastArchetype = archetype;
    profile.lastSessionQuality = sessionQuality;

    try {
      await this.supabase
        .from('user_archetype_profiles')
        .upsert({
          user_id: userId,
          effectiveness: profile.effectiveness,
          preferred_modes: profile.preferredModes,
          patterns: profile.patterns,
          last_archetype: archetype,
          last_session_quality: sessionQuality,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Failed to update archetype profile:', error);
    }
  }

  getArchetypeConfig(archetypeId: ArchetypeId): ArchetypeConfig {
    return ARCHETYPE_CONFIGS[archetypeId];
  }

  detectModeChangeRequest(message: string): ArchetypeId | null {
    const lowerMessage = message.toLowerCase();

    for (const [phrase, archetype] of Object.entries(MODE_CHANGE_REQUESTS)) {
      if (lowerMessage.includes(phrase)) {
        return archetype;
      }
    }

    return null;
  }

  async savePreference(userId: string, archetype: ArchetypeId): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maia_archetype', archetype);
    }

    try {
      await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          archetype,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Failed to save archetype preference:', error);
    }
  }
}

export const archetypePreferenceService = new ArchetypePreferenceService();