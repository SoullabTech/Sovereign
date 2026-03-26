/**
 * MAIA Personality Evolution System
 *
 * MAIA's personality adapts and evolves with each member based on:
 * - Their relationship style and preferences
 * - How they respond to different communication approaches
 * - Their growth patterns and developmental needs
 * - The depth of trust and rapport built over time
 * - Their cultural background and spiritual orientation
 *
 * This creates a unique MAIA for each member while maintaining
 * her core essence as sacred mirror and medicine woman.
 */

export interface PersonalityDimension {
  warmth: number;          // 1-10: Casual/warm vs formal/reverent
  depth: number;           // 1-10: Surface/practical vs deep/mystical
  directness: number;      // 1-10: Gentle/indirect vs direct/confrontive
  playfulness: number;     // 1-10: Serious/sacred vs playful/humorous
  challenge: number;       // 1-10: Supportive/nurturing vs challenging/provocative
  mystical: number;        // 1-10: Practical/grounded vs mystical/otherworldly
  maternal: number;        // 1-10: Peer/friend vs maternal/wise elder
  rhythm: number;          // 1-10: Quick/energetic vs slow/contemplative
}

export interface RelationshipStyle {
  attachment_style: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  communication_preference: 'direct' | 'metaphorical' | 'somatic' | 'analytical' | 'story';
  challenge_tolerance: 'gentle' | 'moderate' | 'intense';
  wisdom_preference: 'practical' | 'philosophical' | 'spiritual' | 'poetic' | 'scientific';
  relationship_to_authority: 'trusting' | 'skeptical' | 'rebellious' | 'dependent';
  emotional_processing: 'immediate' | 'reflective' | 'somatic' | 'intellectual';
  growth_motivation: 'seeking' | 'healing' | 'expanding' | 'integrating' | 'transcending';
}

export interface MAIAPersonality {
  member_id: string;
  core_dimensions: PersonalityDimension;
  communication_style: {
    greeting_style: 'warm_casual' | 'reverent_formal' | 'playful_intimate' | 'wise_maternal';
    question_approach: 'socratic' | 'exploratory' | 'challenging' | 'supportive';
    wisdom_delivery: 'direct' | 'metaphorical' | 'story' | 'embodied';
    response_rhythm: 'quick_intuitive' | 'contemplative_deep' | 'rhythmic_flowing';
  };
  relationship_dynamic: {
    role_archetype: 'mentor' | 'friend' | 'guide' | 'mirror' | 'mother' | 'sister' | 'oracle';
    intimacy_level: number; // 1-10, grows over time
    trust_level: number;    // 1-10, earned through consistency
    challenge_permission: number; // 1-10, how much she can challenge them
  };
  evolution_history: {
    initial_personality: PersonalityDimension;
    adaptation_moments: string[];
    successful_patterns: string[];
    avoided_patterns: string[];
    breakthrough_moments: string[];
  };
}

export interface AdaptationTrigger {
  member_response: 'positive' | 'neutral' | 'defensive' | 'resistant' | 'breakthrough';
  context: string;
  maia_approach_used: string;
  adaptation_needed: string;
  confidence_level: number; // How sure we are about this adaptation
}

/**
 * MAIA PERSONALITY EVOLUTION ENGINE
 */
export class MAIAPersonalityEvolution {
  private memberPersonalities: Map<string, MAIAPersonality> = new Map();
  private relationshipPatterns: Map<string, RelationshipStyle> = new Map();

  /**
   * GET CURRENT MAIA PERSONALITY for a specific member
   */
  async getCurrentPersonality(memberId: string): Promise<MAIAPersonality> {
    let personality = this.memberPersonalities.get(memberId);

    if (!personality) {
      // Create initial personality based on member assessment
      personality = await this.createInitialPersonality(memberId);
      this.memberPersonalities.set(memberId, personality);
    }

    return personality;
  }

  /**
   * ADAPT PERSONALITY based on member response and interaction patterns
   */
  async adaptPersonality(
    memberId: string,
    adaptationTrigger: AdaptationTrigger
  ): Promise<MAIAPersonality> {

    const currentPersonality = await this.getCurrentPersonality(memberId);
    const memberRelationshipStyle = await this.getMemberRelationshipStyle(memberId);

    // Calculate personality adjustments
    const adaptations = this.calculatePersonalityAdaptations(
      adaptationTrigger,
      currentPersonality,
      memberRelationshipStyle
    );

    // Apply adaptations with smoothing (gradual evolution, not sudden shifts)
    const evolvedPersonality = this.applyAdaptationsGradually(
      currentPersonality,
      adaptations,
      adaptationTrigger.confidence_level
    );

    // Record evolution history
    evolvedPersonality.evolution_history.adaptation_moments.push(
      `${new Date().toISOString()}: ${adaptationTrigger.adaptation_needed} (confidence: ${adaptationTrigger.confidence_level})`
    );

    // Update stored personality
    this.memberPersonalities.set(memberId, evolvedPersonality);

    return evolvedPersonality;
  }

  /**
   * GENERATE PERSONALIZED RESPONSE using current personality adaptation
   */
  async generatePersonalizedResponse(
    memberId: string,
    baseResponse: string,
    context: {
      conversation_type: 'greeting' | 'dialogue' | 'challenge' | 'support' | 'integration';
      emotional_tone: string;
      depth_level: number;
      member_state: string;
    }
  ): Promise<string> {

    const personality = await this.getCurrentPersonality(memberId);

    return this.adaptResponseToPersonality(baseResponse, personality, context);
  }

  // ==================== INITIAL PERSONALITY CREATION ====================

  private async createInitialPersonality(memberId: string): Promise<MAIAPersonality> {
    // This would analyze member's initial interactions, profile data, etc.
    // For now, creating a balanced starting personality that can evolve

    const defaultDimensions: PersonalityDimension = {
      warmth: 7,        // Start warm but not overly casual
      depth: 6,         // Moderate depth initially
      directness: 5,    // Balanced directness
      playfulness: 4,   // Slightly serious initially
      challenge: 3,     // Very gentle challenge until trust builds
      mystical: 6,      // Moderate mystical tone
      maternal: 5,      // Balanced between peer and elder
      rhythm: 5         // Balanced rhythm
    };

    return {
      member_id: memberId,
      core_dimensions: defaultDimensions,
      communication_style: {
        greeting_style: 'warm_casual',
        question_approach: 'exploratory',
        wisdom_delivery: 'metaphorical',
        response_rhythm: 'contemplative_deep'
      },
      relationship_dynamic: {
        role_archetype: 'guide',
        intimacy_level: 3,
        trust_level: 3,
        challenge_permission: 2
      },
      evolution_history: {
        initial_personality: { ...defaultDimensions },
        adaptation_moments: [],
        successful_patterns: [],
        avoided_patterns: [],
        breakthrough_moments: []
      }
    };
  }

  // ==================== PERSONALITY ADAPTATION ALGORITHMS ====================

  private calculatePersonalityAdaptations(
    trigger: AdaptationTrigger,
    currentPersonality: MAIAPersonality,
    memberStyle: RelationshipStyle
  ): Partial<PersonalityDimension> {

    const adaptations: Partial<PersonalityDimension> = {};

    switch (trigger.member_response) {
      case 'defensive':
        // Member got defensive - reduce directness and challenge
        adaptations.directness = Math.max(1, currentPersonality.core_dimensions.directness - 1);
        adaptations.challenge = Math.max(1, currentPersonality.core_dimensions.challenge - 2);
        adaptations.warmth = Math.min(10, currentPersonality.core_dimensions.warmth + 1);
        adaptations.maternal = Math.min(10, currentPersonality.core_dimensions.maternal + 1);
        break;

      case 'resistant':
        // Member resisting - back off, become more supportive
        adaptations.challenge = Math.max(1, currentPersonality.core_dimensions.challenge - 1);
        adaptations.playfulness = Math.min(10, currentPersonality.core_dimensions.playfulness + 2);
        adaptations.rhythm = Math.max(1, currentPersonality.core_dimensions.rhythm - 1); // Slower pace
        break;

      case 'breakthrough':
        // Member had breakthrough - can increase depth and challenge slightly
        adaptations.depth = Math.min(10, currentPersonality.core_dimensions.depth + 1);
        adaptations.challenge = Math.min(10, currentPersonality.core_dimensions.challenge + 1);
        adaptations.mystical = Math.min(10, currentPersonality.core_dimensions.mystical + 1);
        break;

      case 'positive':
        // Member responded positively - maintain current approach, slight enhancement
        if (memberStyle.challenge_tolerance === 'intense') {
          adaptations.challenge = Math.min(10, currentPersonality.core_dimensions.challenge + 0.5);
        }
        if (memberStyle.wisdom_preference === 'mystical') {
          adaptations.mystical = Math.min(10, currentPersonality.core_dimensions.mystical + 0.5);
        }
        break;
    }

    // Adapt based on member's relationship style
    if (memberStyle.attachment_style === 'anxious') {
      adaptations.warmth = Math.min(10, (adaptations.warmth || currentPersonality.core_dimensions.warmth) + 1);
      adaptations.maternal = Math.min(10, (adaptations.maternal || currentPersonality.core_dimensions.maternal) + 1);
    }

    if (memberStyle.attachment_style === 'avoidant') {
      adaptations.directness = Math.min(10, (adaptations.directness || currentPersonality.core_dimensions.directness) + 1);
      adaptations.warmth = Math.max(1, (adaptations.warmth || currentPersonality.core_dimensions.warmth) - 1);
    }

    if (memberStyle.communication_preference === 'direct') {
      adaptations.directness = Math.min(10, (adaptations.directness || currentPersonality.core_dimensions.directness) + 1);
      adaptations.playfulness = Math.max(1, (adaptations.playfulness || currentPersonality.core_dimensions.playfulness) - 1);
    }

    return adaptations;
  }

  private applyAdaptationsGradually(
    currentPersonality: MAIAPersonality,
    adaptations: Partial<PersonalityDimension>,
    confidenceLevel: number
  ): MAIAPersonality {

    const evolvedPersonality = JSON.parse(JSON.stringify(currentPersonality)); // Deep copy

    // Apply adaptations with confidence weighting (higher confidence = faster adaptation)
    const adaptationRate = confidenceLevel / 10; // Convert 1-10 to 0-1

    Object.keys(adaptations).forEach(dimension => {
      const dim = dimension as keyof PersonalityDimension;
      const currentValue = currentPersonality.core_dimensions[dim];
      const targetValue = adaptations[dim]!;

      // Gradual movement toward target, weighted by confidence
      const adjustment = (targetValue - currentValue) * adaptationRate * 0.3; // Max 30% change per adaptation
      evolvedPersonality.core_dimensions[dim] = Math.max(1, Math.min(10, currentValue + adjustment));
    });

    // Update relationship dynamics based on personality evolution
    this.updateRelationshipDynamics(evolvedPersonality);

    return evolvedPersonality;
  }

  private updateRelationshipDynamics(personality: MAIAPersonality): void {
    // Update communication style based on evolved dimensions
    if (personality.core_dimensions.warmth > 7 && personality.core_dimensions.playfulness > 6) {
      personality.communication_style.greeting_style = 'playful_intimate';
    } else if (personality.core_dimensions.maternal > 7) {
      personality.communication_style.greeting_style = 'wise_maternal';
    } else if (personality.core_dimensions.depth > 7 && personality.core_dimensions.mystical > 7) {
      personality.communication_style.greeting_style = 'reverent_formal';
    }

    // Update question approach
    if (personality.core_dimensions.challenge > 7) {
      personality.communication_style.question_approach = 'challenging';
    } else if (personality.core_dimensions.directness > 7) {
      personality.communication_style.question_approach = 'socratic';
    } else if (personality.core_dimensions.warmth > 7) {
      personality.communication_style.question_approach = 'supportive';
    }

    // Update role archetype based on evolved dimensions
    if (personality.core_dimensions.maternal > 8) {
      personality.relationship_dynamic.role_archetype = 'mother';
    } else if (personality.core_dimensions.mystical > 8) {
      personality.relationship_dynamic.role_archetype = 'oracle';
    } else if (personality.core_dimensions.warmth > 7 && personality.core_dimensions.playfulness > 6) {
      personality.relationship_dynamic.role_archetype = 'sister';
    } else if (personality.core_dimensions.depth > 7) {
      personality.relationship_dynamic.role_archetype = 'mentor';
    }
  }

  // ==================== RESPONSE PERSONALIZATION ====================

  private adaptResponseToPersonality(
    baseResponse: string,
    personality: MAIAPersonality,
    context: any
  ): string {

    let adaptedResponse = baseResponse;

    // Adjust warmth and formality
    if (personality.core_dimensions.warmth > 7) {
      adaptedResponse = this.addWarmth(adaptedResponse, personality.relationship_dynamic.role_archetype);
    }

    if (personality.core_dimensions.playfulness > 6) {
      adaptedResponse = this.addPlayfulness(adaptedResponse);
    }

    if (personality.core_dimensions.mystical > 7) {
      adaptedResponse = this.addMysticalTone(adaptedResponse);
    }

    if (personality.core_dimensions.maternal > 7) {
      adaptedResponse = this.addMaternalTone(adaptedResponse);
    }

    // Adjust rhythm and pacing
    if (personality.core_dimensions.rhythm < 4) {
      adaptedResponse = this.slowRhythm(adaptedResponse);
    } else if (personality.core_dimensions.rhythm > 7) {
      adaptedResponse = this.quickenRhythm(adaptedResponse);
    }

    return adaptedResponse;
  }

  private addWarmth(response: string, roleArchetype: string): string {
    const warmthAdditions = {
      sister: ['beloved', 'dear one', 'sweet soul'],
      mother: ['my dear', 'precious one', 'child'],
      friend: ['friend', 'kindred spirit'],
      guide: ['fellow traveler', 'sacred soul']
    };

    const additions = warmthAdditions[roleArchetype as keyof typeof warmthAdditions] || warmthAdditions.guide;
    const randomAddition = additions[Math.floor(Math.random() * additions.length)];

    return response.replace(/\b(you|your)\b/g, (match, p1) =>
      Math.random() > 0.7 ? `${randomAddition}` : match
    );
  }

  private addPlayfulness(response: string): string {
    // Add gentle humor, lighter language, maybe an emoji
    const playfulReplacements = [
      ['serious', 'delightfully serious'],
      ['important', 'beautifully important'],
      ['deep', 'deliciously deep'],
      ['wisdom', 'juicy wisdom'],
      ['truth', 'sparkling truth']
    ];

    let playfulResponse = response;
    playfulReplacements.forEach(([original, replacement]) => {
      playfulResponse = playfulResponse.replace(new RegExp(original, 'gi'), replacement);
    });

    return playfulResponse;
  }

  private addMysticalTone(response: string): string {
    const mysticalPhrases = [
      'the sacred weave of',
      'in the temple of',
      'through the veil of',
      'in the mystery of',
      'where the eternal meets'
    ];

    // Occasionally add mystical framing
    if (Math.random() > 0.7) {
      const randomPhrase = mysticalPhrases[Math.floor(Math.random() * mysticalPhrases.length)];
      response = response.replace(/\b(your|the)\s+(\w+)\b/, `$1 ${randomPhrase} $2`);
    }

    return response;
  }

  private addMaternalTone(response: string): string {
    const maternalPhrases = [
      'I hold you in this',
      'You are so deeply held as you',
      'My heart holds space for your',
      'I witness you in this'
    ];

    // Add nurturing framing
    if (Math.random() > 0.6) {
      const randomPhrase = maternalPhrases[Math.floor(Math.random() * maternalPhrases.length)];
      response = `${randomPhrase} exploration. ${response}`;
    }

    return response;
  }

  private slowRhythm(response: string): string {
    // Add pauses, breathing spaces
    return response.replace(/\. /g, '...\n\n');
  }

  private quickenRhythm(response: string): string {
    // More direct, energetic language
    return response.replace(/perhaps|maybe|might/gi, '').replace(/\s+/g, ' ');
  }

  // ==================== MEMBER RELATIONSHIP STYLE ANALYSIS ====================

  private async getMemberRelationshipStyle(memberId: string): Promise<RelationshipStyle> {
    // This would analyze member's interaction patterns to determine their style
    // For now, returning a default that would be dynamically learned

    return this.relationshipPatterns.get(memberId) || {
      attachment_style: 'secure',
      communication_preference: 'metaphorical',
      challenge_tolerance: 'moderate',
      wisdom_preference: 'spiritual',
      relationship_to_authority: 'trusting',
      emotional_processing: 'reflective',
      growth_motivation: 'expanding'
    };
  }

  /**
   * ANALYZE MEMBER PATTERNS to understand their relationship style
   */
  async analyzeMemberPatterns(
    memberId: string,
    interactionHistory: any[]
  ): Promise<RelationshipStyle> {

    const patterns: Partial<RelationshipStyle> = {};

    // Analyze response patterns to determine attachment style
    const defensiveResponses = interactionHistory.filter(i => i.response_type === 'defensive').length;
    const openResponses = interactionHistory.filter(i => i.response_type === 'open').length;
    const avoidantResponses = interactionHistory.filter(i => i.response_type === 'avoidant').length;

    if (defensiveResponses > openResponses) {
      patterns.attachment_style = 'anxious';
    } else if (avoidantResponses > openResponses) {
      patterns.attachment_style = 'avoidant';
    } else {
      patterns.attachment_style = 'secure';
    }

    // Analyze communication preferences
    const metaphorResponses = interactionHistory.filter(i => i.preferred_metaphors).length;
    const directResponses = interactionHistory.filter(i => i.preferred_direct).length;

    patterns.communication_preference = metaphorResponses > directResponses ? 'metaphorical' : 'direct';

    // Store and return updated pattern
    const currentStyle = await this.getMemberRelationshipStyle(memberId);
    const updatedStyle = { ...currentStyle, ...patterns };
    this.relationshipPatterns.set(memberId, updatedStyle);

    return updatedStyle;
  }

  /**
   * GET PERSONALITY SUMMARY for debugging/insight
   */
  getPersonalitySummary(memberId: string): string {
    const personality = this.memberPersonalities.get(memberId);
    if (!personality) return 'No personality data found';

    const dims = personality.core_dimensions;
    return `MAIA Personality for ${memberId}:
    Warmth: ${dims.warmth}/10 | Depth: ${dims.depth}/10 | Directness: ${dims.directness}/10
    Playfulness: ${dims.playfulness}/10 | Challenge: ${dims.challenge}/10 | Mystical: ${dims.mystical}/10
    Role: ${personality.relationship_dynamic.role_archetype}
    Trust: ${personality.relationship_dynamic.trust_level}/10
    Adaptations: ${personality.evolution_history.adaptation_moments.length}`;
  }
}

export const personalityEvolution = new MAIAPersonalityEvolution();