/**
 * ARIA Intelligence Mixer
 * Dynamic blending of Maya's five intelligence sources
 * Part of the Adaptive Relational Intelligence Architecture (ARIA)
 *
 * Operation Breathe: Replaced throttling with intelligent mixing
 */

import { FieldState } from '../field/FieldAwareness';
import { relationalMemory } from '../relational/RelationalMemory';

export interface IntelligenceChannel {
  source: 'claude' | 'sesame' | 'obsidian' | 'mycelial' | 'field';
  weight: number;
  contribution: string;
  resonance: number;
}

export interface BlendProfile {
  name: string;
  description: string;
  blend: {
    claude: number;
    sesame: number;
    obsidian: number;
    mycelial: number;
    field: number;
  };
}

// Context-based blend profiles
export const BLEND_PROFILES: Record<string, BlendProfile> = {
  SACRED: {
    name: 'Sacred Mirror',
    description: 'Deep emotional and spiritual awareness',
    blend: {
      sesame: 0.40,    // Emotional/sacred sensing leads
      field: 0.30,     // Relational dynamics support
      mycelial: 0.15,  // Collective wisdom
      claude: 0.10,    // Light reasoning
      obsidian: 0.05   // Minimal knowledge injection
    }
  },

  LEARNING: {
    name: 'Knowledge Weaver',
    description: 'Information retrieval and synthesis',
    blend: {
      obsidian: 0.40,  // Vault knowledge primary
      claude: 0.30,    // Deep reasoning support
      sesame: 0.15,    // Emotional context
      mycelial: 0.10,  // Pattern recognition
      field: 0.05      // Basic relational awareness
    }
  },

  BONDING: {
    name: 'Relationship Builder',
    description: 'Connection and trust development',
    blend: {
      field: 0.35,     // Relational dynamics lead
      mycelial: 0.25,  // Collective patterns guide
      sesame: 0.20,    // Emotional attunement
      claude: 0.15,    // Conversational support
      obsidian: 0.05   // Light knowledge support
    }
  },

  CRISIS: {
    name: 'Compassionate Witness',
    description: 'Emotional support and holding',
    blend: {
      sesame: 0.45,    // Deep emotional sensing
      field: 0.25,     // Relational awareness
      claude: 0.15,    // Thoughtful response
      mycelial: 0.10,  // Collective wisdom
      obsidian: 0.05   // Minimal knowledge
    }
  },

  CREATIVE: {
    name: 'Possibility Explorer',
    description: 'Imaginative and generative',
    blend: {
      mycelial: 0.30,  // Collective patterns
      claude: 0.25,    // Creative reasoning
      field: 0.20,     // Relational play
      sesame: 0.15,    // Emotional coloring
      obsidian: 0.10   // Knowledge sparks
    }
  },

  ANALYTICAL: {
    name: 'Clear Thinker',
    description: 'Logic and structured analysis',
    blend: {
      claude: 0.45,    // Deep reasoning
      obsidian: 0.30,  // Factual grounding
      field: 0.10,     // Context awareness
      mycelial: 0.10,  // Pattern recognition
      sesame: 0.05     // Light emotional awareness
    }
  }
};

export class IntelligenceMixer {
  private currentBlend: BlendProfile = BLEND_PROFILES.BONDING;
  private mixHistory: Map<string, IntelligenceChannel[]> = new Map();
  private userPreferences: Map<string, Partial<BlendProfile['blend']>> = new Map();

  /**
   * Determine optimal blend based on context and user
   */
  calculateDynamicBlend(
    userId: string,
    fieldState: FieldState,
    userInput: string
  ): BlendProfile['blend'] {
    // 1. Start with context-based profile
    const baseProfile = this.selectBaseProfile(fieldState, userInput);
    let blend = { ...baseProfile.blend };

    // 2. Apply user-specific learning
    const userMap = relationalMemory.getRelationalMap(userId);
    blend = this.adjustForUserPreferences(blend, userMap);

    // 3. Apply field state modulations
    blend = this.modulateByFieldState(blend, fieldState);

    // 4. Apply user manual preferences if set
    const userPrefs = this.userPreferences.get(userId);
    if (userPrefs) {
      blend = this.applyUserPreferences(blend, userPrefs);
    }

    // 5. Normalize to sum to 1.0
    blend = this.normalizeBlend(blend);

    // Record for dashboard
    this.recordMix(userId, blend);

    console.log('🎚️ Intelligence Mix:', {
      profile: baseProfile.name,
      user: userId.slice(0, 8),
      blend: Object.entries(blend)
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
        .join(', ')
    });

    return blend;
  }

  /**
   * Select base profile from context
   */
  private selectBaseProfile(fieldState: FieldState, userInput: string): BlendProfile {
    // Sacred threshold detection
    if (fieldState.sacredMarkers.liminal_quality > 0.7) {
      return BLEND_PROFILES.SACRED;
    }

    // Crisis/emotional intensity
    if (fieldState.emotionalWeather.turbulence > 0.7) {
      return BLEND_PROFILES.CRISIS;
    }

    // Knowledge seeking (questions about facts, explanations)
    if (this.detectKnowledgeSeeking(userInput)) {
      return BLEND_PROFILES.LEARNING;
    }

    // Analytical needs
    if (this.detectAnalyticalNeed(userInput)) {
      return BLEND_PROFILES.ANALYTICAL;
    }

    // Creative exploration
    if (this.detectCreativeExploration(userInput)) {
      return BLEND_PROFILES.CREATIVE;
    }

    // Default to relationship building
    return BLEND_PROFILES.BONDING;
  }

  /**
   * Adjust blend based on user's learned preferences
   */
  private adjustForUserPreferences(
    blend: BlendProfile['blend'],
    userMap: any
  ): BlendProfile['blend'] {
    const adjusted = { ...blend };

    // User responds well to knowledge?
    if (userMap.patterns.thrivesWith.includes('knowledge')) {
      adjusted.obsidian *= 1.3;
      adjusted.claude *= 1.2;
    }

    // User resonates with emotional depth?
    if (userMap.preferences.vulnerability > 0.6) {
      adjusted.sesame *= 1.4;
      adjusted.field *= 1.2;
    }

    // User appreciates collective wisdom?
    if (userMap.patterns.thrivesWith.includes('mycelial')) {
      adjusted.mycelial *= 1.5;
    }

    // Apply archetype resonance
    const archetypes = userMap.archetypeResonance;
    if (archetypes.sacred > 0.3) adjusted.sesame *= 1.2;
    if (archetypes.sage > 0.3) adjusted.claude *= 1.2;
    if (archetypes.trickster > 0.3) adjusted.mycelial *= 1.1;

    return adjusted;
  }

  /**
   * Modulate based on field dynamics
   */
  private modulateByFieldState(
    blend: BlendProfile['blend'],
    fieldState: FieldState
  ): BlendProfile['blend'] {
    const modulated = { ...blend };

    // Kairos moment - increase field and mycelial
    if (fieldState.temporalDynamics.kairos_detection) {
      modulated.field *= 1.3;
      modulated.mycelial *= 1.2;
    }

    // High connection resonance - boost relational sources
    if (fieldState.connectionDynamics.resonance_frequency > 0.7) {
      modulated.field *= 1.2;
      modulated.sesame *= 1.1;
    }

    // Pattern emergence - boost mycelial
    if (fieldState.conversationalFlow.pattern_recognition > 0.6) {
      modulated.mycelial *= 1.4;
    }

    return modulated;
  }

  /**
   * Apply user's manual preferences
   */
  private applyUserPreferences(
    blend: BlendProfile['blend'],
    preferences: Partial<BlendProfile['blend']>
  ): BlendProfile['blend'] {
    const applied = { ...blend };

    // User preferences act as multipliers
    Object.entries(preferences).forEach(([source, weight]) => {
      if (weight !== undefined) {
        applied[source as keyof typeof blend] *= weight;
      }
    });

    return applied;
  }

  /**
   * Normalize blend to sum to 1.0
   */
  private normalizeBlend(blend: BlendProfile['blend']): BlendProfile['blend'] {
    const total = Object.values(blend).reduce((a, b) => a + b, 0);
    if (total === 0) return blend;

    const normalized: any = {};
    Object.entries(blend).forEach(([key, value]) => {
      normalized[key] = value / total;
    });

    return normalized;
  }

  /**
   * Detect knowledge-seeking intent
   */
  private detectKnowledgeSeeking(input: string): boolean {
    const patterns = [
      'what is', 'how does', 'explain', 'tell me about',
      'why does', 'what are', 'define', 'describe'
    ];
    const lower = input.toLowerCase();
    return patterns.some(p => lower.includes(p));
  }

  /**
   * Detect analytical need
   */
  private detectAnalyticalNeed(input: string): boolean {
    const patterns = [
      'analyze', 'compare', 'evaluate', 'assess',
      'logic', 'reason', 'prove', 'evidence'
    ];
    const lower = input.toLowerCase();
    return patterns.some(p => lower.includes(p));
  }

  /**
   * Detect creative exploration
   */
  private detectCreativeExploration(input: string): boolean {
    const patterns = [
      'imagine', 'what if', 'create', 'dream',
      'possibility', 'explore', 'play', 'invent'
    ];
    const lower = input.toLowerCase();
    return patterns.some(p => lower.includes(p));
  }

  /**
   * Record mix for monitoring
   */
  private recordMix(userId: string, blend: BlendProfile['blend']): void {
    const channels: IntelligenceChannel[] = Object.entries(blend).map(([source, weight]) => ({
      source: source as any,
      weight,
      contribution: '',
      resonance: weight
    }));

    this.mixHistory.set(userId, channels);
  }

  /**
   * Set user preferences for blending
   */
  setUserPreferences(userId: string, preferences: {
    moreKnowledge?: boolean;
    moreFeeling?: boolean;
    moreCollective?: boolean;
    morePersonal?: boolean;
  }): void {
    const prefs: Partial<BlendProfile['blend']> = {};

    if (preferences.moreKnowledge) {
      prefs.obsidian = 1.5;
      prefs.claude = 1.3;
    }

    if (preferences.moreFeeling) {
      prefs.sesame = 1.5;
      prefs.field = 1.3;
    }

    if (preferences.moreCollective) {
      prefs.mycelial = 1.5;
    }

    if (preferences.morePersonal) {
      prefs.field = 1.4;
      prefs.sesame = 1.2;
    }

    this.userPreferences.set(userId, prefs);
  }

  /**
   * Get current mix for user
   */
  getCurrentMix(userId: string): IntelligenceChannel[] | undefined {
    return this.mixHistory.get(userId);
  }

  /**
   * Get blend profile descriptions
   */
  getProfiles(): BlendProfile[] {
    return Object.values(BLEND_PROFILES);
  }

  /**
   * Source attribution - generate narrative about sources
   */
  generateSourceAttribution(blend: BlendProfile['blend']): string {
    const dominant = Object.entries(blend)
      .sort(([, a], [, b]) => b - a)[0];

    const attributions = {
      claude: "Drawing from deep reasoning...",
      sesame: "Sensing the emotional field...",
      obsidian: "Accessing knowledge from the vault...",
      mycelial: "Connecting with collective patterns...",
      field: "Attuning to our relational dynamics..."
    };

    return attributions[dominant[0] as keyof typeof attributions] || "";
  }
}

// Export singleton instance
export const intelligenceMixer = new IntelligenceMixer();