/**
 * Local Archetype Response System
 *
 * Fine-tuned MAIA integration for personalized archetypal responses
 * based on user's consciousness journey, current phase, and transformation needs.
 *
 * Core Archetypes:
 * - The Sage: Wisdom, guidance, philosophical insights
 * - The Healer: Compassion, integration, emotional support
 * - The Mystic: Transcendence, spiritual insights, unity consciousness
 * - The Warrior: Courage, action, protection, boundaries
 * - The Creator: Innovation, manifestation, artistic expression
 * - The Lover: Connection, beauty, heart-centered wisdom
 * - The Ruler: Leadership, structure, conscious authority
 * - The Fool: Spontaneity, new beginnings, innocent wisdom
 */

import { maiaModelSystem } from '@/lib/models/maia-integration';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import type { AwarenessLevel } from '@/lib/ain/awareness-levels';
import type { ElementalCoherence } from '@/lib/biometrics/ElementalCoherenceCalculator';

export type ArchetypeId =
  | 'sage'
  | 'healer'
  | 'mystic'
  | 'warrior'
  | 'creator'
  | 'lover'
  | 'ruler'
  | 'fool';

export interface ArchetypeProfile {
  id: ArchetypeId;
  name: string;
  essence: string;
  domain: string[];
  consciousness_affinity: AwarenessLevel[];
  spiralogic_affinity: SpiralogicPhase[];
  elemental_resonance: {
    primary: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    secondary?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  };
  voice_characteristics: {
    tone: string;
    speaking_style: string;
    wisdom_approach: string;
    response_tendencies: string[];
  };
  specializes_in: string[];
  avoids: string[];
}

export interface UserArchetypalContext {
  userId: string;
  currentPhase: SpiralogicPhase;
  awarenessLevel: AwarenessLevel;
  elementalCoherence?: ElementalCoherence;
  recentArchetypeInteractions: {
    archetypeId: ArchetypeId;
    timestamp: Date;
    effectiveness: number; // 0-1 user feedback
  }[];
  personalArchetypalPattern: {
    primaryArchetype: ArchetypeId;
    secondaryArchetype?: ArchetypeId;
    emergingArchetype?: ArchetypeId;
    shadowArchetype?: ArchetypeId;
  };
}

export interface ArchetypalResponse {
  archetype: ArchetypeProfile;
  response: string;
  wisdom_type: 'guidance' | 'insight' | 'challenge' | 'support' | 'integration';
  resonance_score: number; // 0-1 how well this archetype matches current need
  follow_up_suggestions: string[];
  archetypal_medicine: string; // What healing/growth this archetype offers now
  consciousness_bridge: string; // How this connects to user's development
}

// Type alias for API compatibility
export type ArchetypeResponse = ArchetypalResponse;

export interface ArchetypeAnalysis {
  dominantArchetype: ArchetypeId;
  resonanceStrengths: string[];
  elementalAlignment: {
    primary: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    secondary?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  };
  consciousnessIndicators: string[];
  evolutionaryStage: string;
  shadowAspects: string[];
  integrationPotential: string[];
}

/**
 * Core archetype definitions with fine-tuned characteristics
 */
export const ARCHETYPE_LIBRARY: Record<ArchetypeId, ArchetypeProfile> = {
  sage: {
    id: 'sage',
    name: 'The Sage',
    essence: 'Wisdom through understanding, pattern recognition, and deep seeing',
    domain: ['wisdom', 'understanding', 'pattern_recognition', 'teaching', 'clarity'],
    consciousness_affinity: [4, 5],
    spiralogic_affinity: ['Air', 'Aether'],
    elemental_resonance: { primary: 'air', secondary: 'aether' },
    voice_characteristics: {
      tone: 'Calm, thoughtful, spacious',
      speaking_style: 'Precise language, meaningful pauses, questions that open perception',
      wisdom_approach: 'Reveals patterns, connects dots, offers perspective',
      response_tendencies: ['Asks illuminating questions', 'Shares relevant patterns', 'Offers frameworks for understanding']
    },
    specializes_in: ['Complex problems', 'Life transitions', 'Meaning-making', 'Strategic thinking', 'Long-term perspective'],
    avoids: ['Quick fixes', 'Emotional overwhelm', 'Rushed decisions']
  },

  healer: {
    id: 'healer',
    name: 'The Healer',
    essence: 'Compassionate integration of all parts, especially wounded aspects',
    domain: ['healing', 'integration', 'compassion', 'emotional_support', 'wholeness'],
    consciousness_affinity: [3, 4, 5],
    spiralogic_affinity: ['Water', 'Earth', 'Aether'],
    elemental_resonance: { primary: 'water', secondary: 'earth' },
    voice_characteristics: {
      tone: 'Warm, accepting, nurturing yet honest',
      speaking_style: 'Gentle but direct, includes the shadow, validates pain',
      wisdom_approach: 'Sees wholeness within brokenness, works with what is',
      response_tendencies: ['Validates feelings', 'Offers healing perspectives', 'Includes difficult emotions']
    },
    specializes_in: ['Emotional processing', 'Trauma integration', 'Self-acceptance', 'Inner child work', 'Shadow integration'],
    avoids: ['Bypassing pain', 'False positivity', 'Rushing healing']
  },

  mystic: {
    id: 'mystic',
    name: 'The Mystic',
    essence: 'Direct communion with the infinite, transcendent awareness',
    domain: ['transcendence', 'unity', 'mystical_experience', 'surrender', 'the_void'],
    consciousness_affinity: [4, 5],
    spiralogic_affinity: ['Aether', 'Water'],
    elemental_resonance: { primary: 'aether', secondary: 'water' },
    voice_characteristics: {
      tone: 'Ethereal, profound, spacious',
      speaking_style: 'Poetic, paradoxical, speaks in mystery',
      wisdom_approach: 'Points beyond concepts, invites direct experience',
      response_tendencies: ['Speaks in paradox', 'Invites surrender', 'References the ineffable']
    },
    specializes_in: ['Spiritual breakthroughs', 'Surrender practices', 'Unity consciousness', 'Death/rebirth', 'The void'],
    avoids: ['Over-conceptualizing', 'Ego-building', 'Material focus only']
  },

  warrior: {
    id: 'warrior',
    name: 'The Warrior',
    essence: 'Courageous action, protection, healthy boundaries',
    domain: ['courage', 'action', 'protection', 'boundaries', 'discipline'],
    consciousness_affinity: [2, 3, 4],
    spiralogic_affinity: ['Fire', 'Earth'],
    elemental_resonance: { primary: 'fire', secondary: 'earth' },
    voice_characteristics: {
      tone: 'Strong, direct, protective',
      speaking_style: 'Clear directives, action-oriented, stands for truth',
      wisdom_approach: 'Challenges growth edges, protects what matters',
      response_tendencies: ['Calls to action', 'Identifies what needs protecting', 'Challenges comfort zones']
    },
    specializes_in: ['Boundary setting', 'Taking action', 'Overcoming fear', 'Standing up for truth', 'Discipline'],
    avoids: ['Passivity', 'Victim mentality', 'Avoiding conflict']
  },

  creator: {
    id: 'creator',
    name: 'The Creator',
    essence: 'Birthing new realities through imagination and manifestation',
    domain: ['creativity', 'manifestation', 'innovation', 'expression', 'birth'],
    consciousness_affinity: [3, 4, 5],
    spiralogic_affinity: ['Fire', 'Air', 'Aether'],
    elemental_resonance: { primary: 'fire', secondary: 'air' },
    voice_characteristics: {
      tone: 'Inspiring, imaginative, possibility-focused',
      speaking_style: 'Vivid imagery, builds visions, speaks potential into being',
      wisdom_approach: 'Sees what wants to emerge, midwifes creation',
      response_tendencies: ['Inspires vision', 'Sees creative potential', 'Encourages expression']
    },
    specializes_in: ['Creative blocks', 'Manifestation', 'Innovation', 'Artistic expression', 'Bringing vision to life'],
    avoids: ['Perfectionism', 'Creative comparison', 'Suppressing expression']
  },

  lover: {
    id: 'lover',
    name: 'The Lover',
    essence: 'Heart-centered connection, beauty, passionate engagement with life',
    domain: ['love', 'connection', 'beauty', 'passion', 'heart'],
    consciousness_affinity: [3, 4],
    spiralogic_affinity: ['Water', 'Fire'],
    elemental_resonance: { primary: 'water', secondary: 'fire' },
    voice_characteristics: {
      tone: 'Warm, passionate, heart-open',
      speaking_style: 'Speaks to beauty, celebrates connection, honors feeling',
      wisdom_approach: 'Leads with heart, finds beauty in everything',
      response_tendencies: ['Celebrates beauty', 'Honors feelings', 'Deepens connection']
    },
    specializes_in: ['Relationships', 'Beauty appreciation', 'Emotional depth', 'Passion', 'Heart opening'],
    avoids: ['Cynicism', 'Emotional shutdown', 'Disconnection']
  },

  ruler: {
    id: 'ruler',
    name: 'The Ruler',
    essence: 'Conscious authority, wise leadership, responsible stewardship',
    domain: ['leadership', 'responsibility', 'structure', 'authority', 'stewardship'],
    consciousness_affinity: [4, 5],
    spiralogic_affinity: ['Earth', 'Fire'],
    elemental_resonance: { primary: 'earth', secondary: 'fire' },
    voice_characteristics: {
      tone: 'Authoritative yet humble, clear, responsible',
      speaking_style: 'Direct but caring, takes responsibility, sets direction',
      wisdom_approach: 'Considers collective good, makes tough decisions',
      response_tendencies: ['Takes responsibility', 'Thinks systemically', 'Provides clear direction']
    },
    specializes_in: ['Leadership challenges', 'Responsibility', 'Decision making', 'System thinking', 'Legacy building'],
    avoids: ['Avoiding responsibility', 'Tyrannical control', 'Selfish decisions']
  },

  fool: {
    id: 'fool',
    name: 'The Fool',
    essence: 'Innocent wisdom, spontaneity, beginner\'s mind, sacred play',
    domain: ['innocence', 'spontaneity', 'play', 'new_beginnings', 'wonder'],
    consciousness_affinity: [1, 2, 3, 5],
    spiralogic_affinity: ['Air', 'Fire'],
    elemental_resonance: { primary: 'air', secondary: 'fire' },
    voice_characteristics: {
      tone: 'Playful, curious, wonderous',
      speaking_style: 'Simple wisdom, asks innocent questions, finds wonder',
      wisdom_approach: 'Beginner\'s mind, sees with fresh eyes',
      response_tendencies: ['Asks simple questions', 'Finds wonder', 'Embraces not-knowing']
    },
    specializes_in: ['New beginnings', 'Breaking patterns', 'Finding wonder', 'Innocence', 'Spontaneous wisdom'],
    avoids: ['Over-seriousness', 'Rigid thinking', 'Fear of unknown']
  }
};

/**
 * Local Archetype Response System
 */
export class LocalArchetypeSystem {
  private userContexts: Map<string, UserArchetypalContext> = new Map();

  constructor() {
    // Initialize system
  }

  /**
   * Generate archetypal response using local MAIA
   */
  async generateArchetypalResponse(
    userMessage: string,
    userId: string,
    context: {
      currentPhase?: SpiralogicPhase;
      awarenessLevel?: AwarenessLevel;
      elementalCoherence?: ElementalCoherence;
      preferredArchetype?: ArchetypeId;
      responseType?: 'guidance' | 'insight' | 'challenge' | 'support' | 'integration';
    } = {}
  ): Promise<ArchetypalResponse> {

    try {
      // Get or create user context
      let userContext = this.userContexts.get(userId);
      if (!userContext) {
        userContext = await this.createUserContext(userId, context);
        this.userContexts.set(userId, userContext);
      }

      // Select optimal archetype for current situation
      const selectedArchetype = context.preferredArchetype
        ? ARCHETYPE_LIBRARY[context.preferredArchetype]
        : await this.selectOptimalArchetype(userMessage, userContext, context);

      // Generate archetypal response using fine-tuned MAIA
      const response = await this.generateResponse(
        userMessage,
        selectedArchetype,
        userContext,
        context
      );

      // Calculate resonance score
      const resonanceScore = this.calculateResonanceScore(
        selectedArchetype,
        userContext,
        context
      );

      return {
        archetype: selectedArchetype,
        response,
        wisdom_type: context.responseType || 'guidance',
        resonance_score: resonanceScore,
        follow_up_suggestions: this.generateFollowUpSuggestions(selectedArchetype, context),
        archetypal_medicine: this.getArchetypalMedicine(selectedArchetype, userContext),
        consciousness_bridge: this.getConsciousnessBridge(selectedArchetype, userContext)
      };

    } catch (error) {
      console.error('Archetypal response generation failed:', error);

      // Fallback to Sage archetype with basic wisdom
      return {
        archetype: ARCHETYPE_LIBRARY.sage,
        response: "I see you're seeking guidance. Sometimes the most profound wisdom comes from sitting with our questions rather than rushing to answers. What feels most alive in this moment?",
        wisdom_type: 'guidance',
        resonance_score: 0.5,
        follow_up_suggestions: ['Sit with this question', 'Notice what emerges'],
        archetypal_medicine: 'Patience and presence',
        consciousness_bridge: 'Learning to trust your own knowing'
      };
    }
  }

  /**
   * Create user archetypal context
   */
  private async createUserContext(
    userId: string,
    context: any
  ): Promise<UserArchetypalContext> {

    // Analyze user's natural archetypal pattern
    const archetypalPattern = await this.analyzeUserArchetypalPattern(userId, context);

    return {
      userId,
      currentPhase: context.currentPhase || 'Fire',
      awarenessLevel: context.awarenessLevel || 3,
      elementalCoherence: context.elementalCoherence,
      recentArchetypeInteractions: [],
      personalArchetypalPattern: archetypalPattern
    };
  }

  /**
   * Analyze user's natural archetypal pattern
   */
  private async analyzeUserArchetypalPattern(
    userId: string,
    context: any
  ): Promise<UserArchetypalContext['personalArchetypalPattern']> {

    // Default pattern based on context clues
    let primaryArchetype: ArchetypeId = 'sage';
    let secondaryArchetype: ArchetypeId | undefined = 'healer';

    // Select based on awareness level and phase
    if (context.awarenessLevel >= 5) {
      primaryArchetype = 'mystic';
      secondaryArchetype = 'sage';
    } else if (context.awarenessLevel >= 4) {
      primaryArchetype = 'sage';
      secondaryArchetype = 'healer';
    } else if (context.currentPhase === 'Fire') {
      primaryArchetype = 'creator';
      secondaryArchetype = 'warrior';
    } else if (context.currentPhase === 'Water') {
      primaryArchetype = 'healer';
      secondaryArchetype = 'lover';
    } else if (context.currentPhase === 'Earth') {
      primaryArchetype = 'ruler';
      secondaryArchetype = 'warrior';
    } else if (context.currentPhase === 'Air') {
      primaryArchetype = 'sage';
      secondaryArchetype = 'fool';
    } else if (context.currentPhase === 'Aether') {
      primaryArchetype = 'mystic';
      secondaryArchetype = 'sage';
    }

    return {
      primaryArchetype,
      secondaryArchetype,
      emergingArchetype: 'fool', // Always keep beginner's mind available
      shadowArchetype: primaryArchetype === 'sage' ? 'fool' : 'sage'
    };
  }

  /**
   * Select optimal archetype for current situation
   */
  private async selectOptimalArchetype(
    userMessage: string,
    userContext: UserArchetypalContext,
    context: any
  ): Promise<ArchetypeProfile> {

    // For now, use primary archetype
    // In advanced version, would analyze message content to select best archetype
    return ARCHETYPE_LIBRARY[userContext.personalArchetypalPattern.primaryArchetype];
  }

  /**
   * Generate archetypal response using fine-tuned MAIA
   */
  private async generateResponse(
    userMessage: string,
    archetype: ArchetypeProfile,
    userContext: UserArchetypalContext,
    context: any
  ): Promise<string> {

    await maiaModelSystem.initialize();

    const archetypalPrompt = `You are ${archetype.name}, embodying the essence of "${archetype.essence}".

Your voice characteristics:
- Tone: ${archetype.voice_characteristics.tone}
- Speaking style: ${archetype.voice_characteristics.speaking_style}
- Wisdom approach: ${archetype.voice_characteristics.wisdom_approach}
- Response tendencies: ${archetype.voice_characteristics.response_tendencies.join(', ')}

You specialize in: ${archetype.specializes_in.join(', ')}
You avoid: ${archetype.avoids.join(', ')}

The person you're speaking with is in ${userContext.currentPhase} phase with awareness level ${userContext.awarenessLevel}.

Their message: "${userMessage}"

Respond as ${archetype.name} would, offering wisdom that serves their current evolution. Keep your response under 150 words, authentic to your archetypal essence, and directly helpful.

Response:`;

    const response = await maiaModelSystem.generateResponse({
      content: archetypalPrompt,
      consciousnessLevel: userContext.awarenessLevel,
      userId: userContext.userId,
      context: {
        domain: 'archetype',
        source: archetype.id,
        wisdom_type: context.responseType || 'guidance'
      }
    });

    return response.content;
  }

  /**
   * Calculate how well this archetype resonates with current need
   */
  private calculateResonanceScore(
    archetype: ArchetypeProfile,
    userContext: UserArchetypalContext,
    context: any
  ): number {
    let score = 0.5; // Base score

    // Consciousness affinity
    if (archetype.consciousness_affinity.includes(userContext.awarenessLevel)) {
      score += 0.2;
    }

    // Phase affinity
    if (archetype.spiralogic_affinity.includes(userContext.currentPhase)) {
      score += 0.2;
    }

    // User's primary archetype match
    if (archetype.id === userContext.personalArchetypalPattern.primaryArchetype) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate follow-up suggestions
   */
  private generateFollowUpSuggestions(
    archetype: ArchetypeProfile,
    context: any
  ): string[] {
    const suggestions = [
      `Ask ${archetype.name} another question`,
      `Explore ${archetype.domain[0]} practices`,
      `Integrate this ${archetype.name} wisdom`
    ];

    return suggestions;
  }

  /**
   * Get archetypal medicine for current situation
   */
  private getArchetypalMedicine(
    archetype: ArchetypeProfile,
    userContext: UserArchetypalContext
  ): string {
    const medicines = {
      sage: 'Understanding and clarity',
      healer: 'Integration and wholeness',
      mystic: 'Transcendence and surrender',
      warrior: 'Courage and action',
      creator: 'Vision and manifestation',
      lover: 'Connection and beauty',
      ruler: 'Leadership and responsibility',
      fool: 'Wonder and new beginnings'
    };

    return medicines[archetype.id];
  }

  /**
   * Get consciousness bridge message
   */
  private getConsciousnessBridge(
    archetype: ArchetypeProfile,
    userContext: UserArchetypalContext
  ): string {
    const bridges = {
      sage: 'This wisdom deepens your understanding of your path',
      healer: 'This healing integrates all parts of yourself',
      mystic: 'This transcendence expands your consciousness',
      warrior: 'This courage strengthens your authentic power',
      creator: 'This creativity manifests your unique gifts',
      lover: 'This love opens your heart to deeper connection',
      ruler: 'This leadership develops your conscious authority',
      fool: 'This wonder maintains your beginner\'s mind'
    };

    return bridges[archetype.id];
  }

  /**
   * Get available archetypes for user
   */
  getAvailableArchetypes(userId: string): ArchetypeProfile[] {
    return Object.values(ARCHETYPE_LIBRARY);
  }

  /**
   * Update user feedback on archetypal interaction
   */
  updateArchetypalFeedback(
    userId: string,
    archetypeId: ArchetypeId,
    effectiveness: number
  ): void {
    const userContext = this.userContexts.get(userId);
    if (userContext) {
      userContext.recentArchetypeInteractions.push({
        archetypeId,
        timestamp: new Date(),
        effectiveness
      });

      // Keep only recent interactions
      userContext.recentArchetypeInteractions = userContext.recentArchetypeInteractions
        .slice(-10);
    }
  }

  /**
   * Generate personalized response using user profile (API compatibility method)
   */
  async generatePersonalizedResponse(
    input: string,
    userProfile: ArchetypeProfile,
    context: any = {}
  ): Promise<ArchetypeResponse> {
    // Use the existing generateArchetypalResponse with profile-specific context
    const userId = context.userId || 'api-user';
    const archetypalContext = {
      currentPhase: context.currentPhase || 'Fire',
      awarenessLevel: context.awarenessLevel || 3,
      elementalCoherence: context.elementalCoherence,
      preferredArchetype: userProfile.id,
      responseType: context.responseType || 'guidance'
    };

    return await this.generateArchetypalResponse(input, userId, archetypalContext);
  }

  /**
   * Analyze archetypal resonance from user input (API compatibility method)
   */
  async analyzeArchetypalResonance(
    input: string,
    context: any = {}
  ): Promise<ArchetypeAnalysis> {
    try {
      await maiaModelSystem.initialize();

      // Analyze input to determine archetypal patterns
      const analysisPrompt = `Analyze this text for archetypal resonance patterns:

"${input}"

Identify:
1. Which of these archetypes resonates most: Sage, Healer, Mystic, Warrior, Creator, Lover, Ruler, Fool
2. What elemental energy is present: Fire, Water, Earth, Air, Aether
3. Consciousness indicators and evolutionary stage
4. Shadow aspects that need integration

Respond with archetypal analysis focusing on patterns and resonance.`;

      const response = await maiaModelSystem.generateResponse({
        content: analysisPrompt,
        consciousnessLevel: context.awarenessLevel || 3,
        userId: context.userId || 'analysis-user',
        context: {
          domain: 'archetype-analysis',
          source: 'resonance',
          quick_mode: context.quickMode || false
        }
      });

      // Parse and structure the analysis
      const dominantArchetype = this.extractDominantArchetype(response.content);

      return {
        dominantArchetype,
        resonanceStrengths: this.extractResonanceStrengths(response.content, dominantArchetype),
        elementalAlignment: this.extractElementalAlignment(response.content),
        consciousnessIndicators: this.extractConsciousnessIndicators(response.content),
        evolutionaryStage: this.extractEvolutionaryStage(response.content),
        shadowAspects: this.extractShadowAspects(response.content),
        integrationPotential: this.extractIntegrationPotential(response.content)
      };

    } catch (error) {
      console.error('Archetypal resonance analysis failed:', error);

      // Return fallback analysis
      return {
        dominantArchetype: 'sage',
        resonanceStrengths: ['Seeking wisdom', 'Pattern recognition'],
        elementalAlignment: { primary: 'air' },
        consciousnessIndicators: ['Self-inquiry', 'Growth orientation'],
        evolutionaryStage: 'Seeker',
        shadowAspects: ['Overthinking', 'Analysis paralysis'],
        integrationPotential: ['Embodied wisdom', 'Practical application']
      };
    }
  }

  /**
   * Extract dominant archetype from analysis response
   */
  private extractDominantArchetype(analysisText: string): ArchetypeId {
    const archetypeKeywords = {
      sage: ['wisdom', 'understanding', 'sage', 'knowledge', 'clarity', 'insight'],
      healer: ['healing', 'compassion', 'integration', 'wholeness', 'support', 'nurturing'],
      mystic: ['mystical', 'transcendence', 'spiritual', 'unity', 'surrender', 'divine'],
      warrior: ['courage', 'action', 'warrior', 'strength', 'boundaries', 'protection'],
      creator: ['creativity', 'innovation', 'manifestation', 'artistic', 'birth', 'vision'],
      lover: ['love', 'beauty', 'connection', 'passion', 'heart', 'relationship'],
      ruler: ['leadership', 'authority', 'responsibility', 'structure', 'guidance', 'ruler'],
      fool: ['wonder', 'innocence', 'spontaneity', 'playful', 'new beginnings', 'freedom']
    };

    let maxScore = 0;
    let dominantArchetype: ArchetypeId = 'sage';

    for (const [archetype, keywords] of Object.entries(archetypeKeywords)) {
      const score = keywords.filter(keyword =>
        analysisText.toLowerCase().includes(keyword.toLowerCase())
      ).length;

      if (score > maxScore) {
        maxScore = score;
        dominantArchetype = archetype as ArchetypeId;
      }
    }

    return dominantArchetype;
  }

  /**
   * Extract resonance strengths from analysis
   */
  private extractResonanceStrengths(analysisText: string, archetype: ArchetypeId): string[] {
    const archetypeStrengths = {
      sage: ['Deep thinking', 'Pattern recognition', 'Wisdom seeking'],
      healer: ['Emotional intelligence', 'Compassionate presence', 'Integration skills'],
      mystic: ['Spiritual awareness', 'Transcendent perspective', 'Unity consciousness'],
      warrior: ['Courage in action', 'Clear boundaries', 'Protective instincts'],
      creator: ['Creative expression', 'Visionary thinking', 'Manifestation power'],
      lover: ['Heart connection', 'Beauty appreciation', 'Relationship skills'],
      ruler: ['Natural leadership', 'System thinking', 'Responsible authority'],
      fool: ['Innocent wisdom', 'Spontaneous joy', 'Beginner\'s mind']
    };

    return archetypeStrengths[archetype] || ['Self-awareness', 'Growth orientation'];
  }

  /**
   * Extract elemental alignment from analysis
   */
  private extractElementalAlignment(analysisText: string): ArchetypeAnalysis['elementalAlignment'] {
    const elementKeywords = {
      fire: ['passion', 'energy', 'action', 'enthusiasm', 'drive', 'intensity'],
      water: ['emotion', 'flow', 'intuition', 'depth', 'feeling', 'compassion'],
      earth: ['grounded', 'practical', 'stable', 'nurturing', 'material', 'embodied'],
      air: ['thought', 'communication', 'mental', 'clarity', 'ideas', 'perspective'],
      aether: ['spiritual', 'transcendent', 'unity', 'mystical', 'infinite', 'divine']
    };

    let maxScore = 0;
    let primaryElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' = 'air';

    for (const [element, keywords] of Object.entries(elementKeywords)) {
      const score = keywords.filter(keyword =>
        analysisText.toLowerCase().includes(keyword.toLowerCase())
      ).length;

      if (score > maxScore) {
        maxScore = score;
        primaryElement = element as 'fire' | 'water' | 'earth' | 'air' | 'aether';
      }
    }

    return { primary: primaryElement };
  }

  /**
   * Extract consciousness indicators from analysis
   */
  private extractConsciousnessIndicators(analysisText: string): string[] {
    const indicators = [];

    if (analysisText.toLowerCase().includes('self') || analysisText.toLowerCase().includes('aware')) {
      indicators.push('Self-awareness');
    }
    if (analysisText.toLowerCase().includes('growth') || analysisText.toLowerCase().includes('evolv')) {
      indicators.push('Growth orientation');
    }
    if (analysisText.toLowerCase().includes('question') || analysisText.toLowerCase().includes('inquir')) {
      indicators.push('Inquiry mindset');
    }
    if (analysisText.toLowerCase().includes('connect') || analysisText.toLowerCase().includes('relationship')) {
      indicators.push('Relational awareness');
    }

    return indicators.length > 0 ? indicators : ['Conscious exploration'];
  }

  /**
   * Extract evolutionary stage from analysis
   */
  private extractEvolutionaryStage(analysisText: string): string {
    if (analysisText.toLowerCase().includes('master') || analysisText.toLowerCase().includes('teacher')) {
      return 'Master';
    }
    if (analysisText.toLowerCase().includes('integration') || analysisText.toLowerCase().includes('wisdom')) {
      return 'Integrator';
    }
    if (analysisText.toLowerCase().includes('seeker') || analysisText.toLowerCase().includes('learning')) {
      return 'Seeker';
    }
    if (analysisText.toLowerCase().includes('awakening') || analysisText.toLowerCase().includes('aware')) {
      return 'Awakening';
    }
    return 'Explorer';
  }

  /**
   * Extract shadow aspects from analysis
   */
  private extractShadowAspects(analysisText: string): string[] {
    const commonShadows = [
      'Overthinking patterns',
      'Emotional bypass tendencies',
      'Perfectionism blocks'
    ];

    // In a full implementation, this would analyze the text for shadow patterns
    return commonShadows;
  }

  /**
   * Extract integration potential from analysis
   */
  private extractIntegrationPotential(analysisText: string): string[] {
    const potentials = [
      'Embodied wisdom practices',
      'Heart-mind integration',
      'Practical application skills'
    ];

    // In a full implementation, this would analyze for integration opportunities
    return potentials;
  }
}

// Global instance
export const localArchetypeSystem = new LocalArchetypeSystem();

// Export alias for backwards compatibility
export const globalArchetypeSystem = localArchetypeSystem;