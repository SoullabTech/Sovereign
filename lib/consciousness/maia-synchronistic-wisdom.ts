/**
 * MAIA Synchronistic Wisdom System
 *
 * Delivers perfectly timed quotes and wisdom based on:
 * - Member's current spiral phase
 * - Elemental focus and needs
 * - Sacred timing (lunar, seasonal, personal cycles)
 * - Emotional/energetic signature
 * - Session context and insights gathered
 *
 * This system recognizes that the right wisdom at the right moment
 * can shift everything. It operates on sacred timing, not random delivery.
 */

export interface WisdomSource {
  id: string;
  author: string;
  text: string;
  category: 'philosophical' | 'spiritual' | 'psychological' | 'poetic' | 'practical';
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'universal';
  spiral_phase: number[]; // Which phases this wisdom serves (1-12)
  energy_signature: string[]; // ['seeking', 'struggling', 'expanding', 'integrating', etc.]
  timing: string[]; // ['dawn', 'new_moon', 'winter', 'transition', etc.]
  archetypal_theme: string[]; // ['shadow', 'hero', 'mentor', 'lover', etc.]
}

export interface SynchronisticDelivery {
  wisdom: WisdomSource;
  timing_significance: string;
  personal_resonance: string;
  integration_invitation: string;
  follow_up_practice?: string;
}

export interface MemberWisdomProfile {
  member_id: string;
  current_spiral_phase: number;
  dominant_element: string;
  current_challenges: string[];
  growth_edges: string[];
  preferred_wisdom_style: string; // 'philosophical', 'practical', 'poetic', etc.
  integration_capacity: 'gentle' | 'moderate' | 'deep';
  timing_sensitivity: number; // How attuned they are to synchronistic timing
}

/**
 * SYNCHRONISTIC WISDOM DELIVERY ENGINE
 */
export class MAIASynchronisticWisdom {
  private wisdomLibrary: WisdomSource[] = [];
  private memberProfiles: Map<string, MemberWisdomProfile> = new Map();

  constructor() {
    this.initializeWisdomLibrary();
  }

  /**
   * DELIVER PERFECT WISDOM - Core synchronistic delivery method
   */
  async deliverPerfectWisdom(
    memberId: string,
    currentContext: {
      session_insights: string[];
      emotional_tone: string;
      element_focus: string;
      spiral_phase: number;
      sacred_timing: any;
      conversation_depth: number;
    }
  ): Promise<SynchronisticDelivery> {

    const memberProfile = await this.getMemberWisdomProfile(memberId);
    const synchronisticMoment = await this.assessSynchronisticMoment(currentContext);

    // Find the wisdom that resonates most perfectly with this moment
    const perfectWisdom = await this.findPerfectWisdom(
      memberProfile,
      currentContext,
      synchronisticMoment
    );

    return {
      wisdom: perfectWisdom,
      timing_significance: await this.explainTimingSignificance(perfectWisdom, currentContext),
      personal_resonance: await this.explainPersonalResonance(perfectWisdom, memberProfile),
      integration_invitation: await this.createIntegrationInvitation(perfectWisdom, currentContext),
      follow_up_practice: await this.suggestFollowUpPractice(perfectWisdom, memberProfile)
    };
  }

  /**
   * WISDOM FOR ARRIVAL - Special delivery for session beginnings
   */
  async deliverArrivalWisdom(
    memberId: string,
    arrivalContext: {
      time_since_last_visit: number;
      current_life_focus: string;
      sacred_timing: any;
      energy_on_arrival: string;
    }
  ): Promise<SynchronisticDelivery> {

    const memberProfile = await this.getMemberWisdomProfile(memberId);

    // Find wisdom specifically for thresholds and beginnings
    const arrivalWisdom = this.wisdomLibrary.filter(w =>
      w.archetypal_theme.includes('threshold') ||
      w.archetypal_theme.includes('beginning') ||
      w.timing.includes('arrival')
    );

    const perfectWisdom = this.selectBestMatch(arrivalWisdom, memberProfile, arrivalContext);

    return {
      wisdom: perfectWisdom,
      timing_significance: `This wisdom arrives as you cross the threshold into sacred space, carrying particular medicine for your ${arrivalContext.current_life_focus}.`,
      personal_resonance: await this.explainPersonalResonance(perfectWisdom, memberProfile),
      integration_invitation: `As you enter this conversation, consider how these words might illuminate the path you're walking.`,
      follow_up_practice: await this.suggestThresholdPractice(perfectWisdom)
    };
  }

  /**
   * WISDOM FOR INTEGRATION - Special delivery for session endings
   */
  async deliverIntegrationWisdom(
    memberId: string,
    integrationContext: {
      session_insights: string[];
      tools_revealed: string[];
      breakthrough_moments: string[];
      element_worked: string;
    }
  ): Promise<SynchronisticDelivery> {

    const memberProfile = await this.getMemberWisdomProfile(memberId);

    // Find wisdom specifically for integration and completion
    const integrationWisdom = this.wisdomLibrary.filter(w =>
      w.archetypal_theme.includes('integration') ||
      w.archetypal_theme.includes('completion') ||
      w.element === integrationContext.element_worked ||
      w.category === 'practical'
    );

    const perfectWisdom = this.selectBestMatch(integrationWisdom, memberProfile, integrationContext);

    return {
      wisdom: perfectWisdom,
      timing_significance: `This wisdom comes as a companion for integrating today's insights: ${integrationContext.session_insights.join(', ')}.`,
      personal_resonance: await this.explainPersonalResonance(perfectWisdom, memberProfile),
      integration_invitation: `Carry these words with you as you weave today's discoveries into the fabric of your daily life.`,
      follow_up_practice: await this.suggestIntegrationPractice(perfectWisdom, integrationContext)
    };
  }

  // ==================== WISDOM LIBRARY INITIALIZATION ====================

  private initializeWisdomLibrary(): void {
    this.wisdomLibrary = [
      // FIRE ELEMENT WISDOM - Passion, Creation, Transformation
      {
        id: 'rumi_fire_1',
        author: 'Rumi',
        text: 'Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.',
        category: 'spiritual',
        element: 'fire',
        spiral_phase: [1, 4, 7, 10], // Creation phases
        energy_signature: ['seeking', 'uncertain', 'yearning'],
        timing: ['transition', 'new_moon', 'spring'],
        archetypal_theme: ['hero', 'creator', 'threshold']
      },

      {
        id: 'rilke_fire_1',
        author: 'Rainer Maria Rilke',
        text: 'The only journey is the one within.',
        category: 'philosophical',
        element: 'fire',
        spiral_phase: [1, 2, 3],
        energy_signature: ['beginning', 'exploring', 'awakening'],
        timing: ['dawn', 'new_moon', 'arrival'],
        archetypal_theme: ['hero', 'seeker', 'threshold']
      },

      // WATER ELEMENT WISDOM - Emotion, Healing, Flow
      {
        id: 'gibran_water_1',
        author: 'Kahlil Gibran',
        text: 'Your pain is the breaking of the shell that encloses your understanding.',
        category: 'spiritual',
        element: 'water',
        spiral_phase: [2, 5, 8, 11], // Feeling/healing phases
        energy_signature: ['struggling', 'healing', 'processing'],
        timing: ['storm', 'full_moon', 'winter'],
        archetypal_theme: ['wounded_healer', 'shadow', 'depth']
      },

      {
        id: 'lao_tzu_water_1',
        author: 'Lao Tzu',
        text: 'Water is fluid, soft, and yielding. But water will wear away rock, which cannot yield and is strong.',
        category: 'philosophical',
        element: 'water',
        spiral_phase: [2, 5, 8, 11],
        energy_signature: ['resilient', 'patient', 'persistent'],
        timing: ['flowing', 'transition', 'challenge'],
        archetypal_theme: ['sage', 'warrior', 'endurance']
      },

      // EARTH ELEMENT WISDOM - Grounding, Practical, Embodied
      {
        id: 'thoreau_earth_1',
        author: 'Henry David Thoreau',
        text: 'Heaven is under our feet as well as over our heads.',
        category: 'practical',
        element: 'earth',
        spiral_phase: [3, 6, 9, 12], // Grounding/manifestation phases
        energy_signature: ['seeking_stability', 'grounding', 'practical'],
        timing: ['midday', 'summer', 'harvest'],
        archetypal_theme: ['sage', 'embodied', 'practical']
      },

      {
        id: 'angelou_earth_1',
        author: 'Maya Angelou',
        text: 'There is no greater agony than bearing an untold story inside you.',
        category: 'psychological',
        element: 'earth',
        spiral_phase: [3, 6, 9, 12],
        energy_signature: ['holding_back', 'unexpressed', 'ready_to_speak'],
        timing: ['readiness', 'full_moon', 'harvest'],
        archetypal_theme: ['storyteller', 'truth_teller', 'expression']
      },

      // AIR ELEMENT WISDOM - Mental, Communication, Clarity
      {
        id: 'einstein_air_1',
        author: 'Albert Einstein',
        text: 'The important thing is not to stop questioning. Curiosity has its own reason for existing.',
        category: 'philosophical',
        element: 'air',
        spiral_phase: [4, 7, 10, 1], // Mental clarity phases
        energy_signature: ['curious', 'questioning', 'seeking_clarity'],
        timing: ['morning', 'clear_sky', 'insight'],
        archetypal_theme: ['seeker', 'scholar', 'curious']
      },

      {
        id: 'hafez_air_1',
        author: 'Hafez',
        text: 'I wish I could show you, when you are lonely or in darkness, the astonishing light of your own being.',
        category: 'spiritual',
        element: 'air',
        spiral_phase: [4, 7, 10, 1],
        energy_signature: ['doubt', 'darkness', 'seeking_light'],
        timing: ['night', 'darkness', 'doubt'],
        archetypal_theme: ['mentor', 'light_bearer', 'encourager']
      },

      // AETHER ELEMENT WISDOM - Spiritual, Universal, Integration
      {
        id: 'jung_aether_1',
        author: 'Carl Jung',
        text: 'Who looks outside, dreams; who looks inside, awakens.',
        category: 'psychological',
        element: 'aether',
        spiral_phase: [12, 1, 6, 7], // Integration and awakening phases
        energy_signature: ['awakening', 'integrating', 'transcending'],
        timing: ['dawn', 'twilight', 'integration'],
        archetypal_theme: ['wise_elder', 'integration', 'awakening']
      },

      {
        id: 'teilhard_aether_1',
        author: 'Pierre Teilhard de Chardin',
        text: 'We are not human beings having a spiritual experience. We are spiritual beings having a human experience.',
        category: 'spiritual',
        element: 'aether',
        spiral_phase: [12, 1, 6, 7],
        energy_signature: ['expanding', 'transcending', 'remembering'],
        timing: ['revelation', 'peak_experience', 'integration'],
        archetypal_theme: ['mystic', 'transcendent', 'remembering']
      },

      // UNIVERSAL WISDOM - Applies to all elements and phases
      {
        id: 'rumi_universal_1',
        author: 'Rumi',
        text: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.',
        category: 'spiritual',
        element: 'universal',
        spiral_phase: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        energy_signature: ['maturing', 'wise', 'self_aware', 'transforming'],
        timing: ['any', 'maturity', 'wisdom'],
        archetypal_theme: ['sage', 'transformer', 'wise_elder']
      },

      {
        id: 'oliver_universal_1',
        author: 'Mary Oliver',
        text: 'Tell me, what else should I have done? Doesn\'t everything die at last, and too soon? Tell me, what is it you plan to do with your one wild and precious life?',
        category: 'poetic',
        element: 'universal',
        spiral_phase: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        energy_signature: ['contemplating', 'alive', 'urgent', 'purposeful'],
        timing: ['any', 'urgency', 'life_questioning'],
        archetypal_theme: ['poet', 'life_questioner', 'awakener']
      }

      // Continue building comprehensive wisdom library...
    ];
  }

  // ==================== SYNCHRONISTIC MATCHING ALGORITHMS ====================

  private async findPerfectWisdom(
    memberProfile: MemberWisdomProfile,
    context: any,
    synchronisticMoment: number
  ): Promise<WisdomSource> {

    // Score each wisdom source based on multiple synchronistic factors
    const scoredWisdom = this.wisdomLibrary.map(wisdom => ({
      wisdom,
      score: this.calculateSynchronisticScore(wisdom, memberProfile, context, synchronisticMoment)
    }));

    // Sort by highest synchronistic score
    scoredWisdom.sort((a, b) => b.score - a.score);

    // Return the most synchronistically aligned wisdom
    return scoredWisdom[0].wisdom;
  }

  private calculateSynchronisticScore(
    wisdom: WisdomSource,
    memberProfile: MemberWisdomProfile,
    context: any,
    synchronisticMoment: number
  ): number {
    let score = 0;

    // Spiral phase alignment (high weight)
    if (wisdom.spiral_phase.includes(memberProfile.current_spiral_phase)) {
      score += 30;
    }

    // Element alignment (high weight)
    if (wisdom.element === memberProfile.dominant_element || wisdom.element === 'universal') {
      score += 25;
    }

    // Energy signature match (medium weight)
    if (wisdom.energy_signature.some(sig => context.emotional_tone?.includes(sig))) {
      score += 20;
    }

    // Wisdom style preference (medium weight)
    if (wisdom.category === memberProfile.preferred_wisdom_style) {
      score += 15;
    }

    // Synchronistic timing bonus (varies with timing sensitivity)
    score += synchronisticMoment * memberProfile.timing_sensitivity;

    // Conversation depth appropriateness
    const depthMatch = this.assessDepthMatch(wisdom, context.conversation_depth);
    score += depthMatch * 10;

    return score;
  }

  private async assessSynchronisticMoment(context: any): Promise<number> {
    let synchronicity = 0;

    // Check for meaningful numerical patterns
    const now = new Date();
    if (now.getMinutes() === now.getHours()) synchronicity += 10; // 1:01, 2:02, etc.
    if (now.getDate() === now.getMonth() + 1) synchronicity += 8; // 1/1, 2/2, etc.

    // Check for session insight resonance
    if (context.session_insights?.length > 0) {
      synchronicity += context.session_insights.length * 2;
    }

    // Check for breakthrough moments
    if (context.breakthrough_moments?.length > 0) {
      synchronicity += 15;
    }

    return Math.min(synchronicity, 50); // Cap at 50 for balance
  }

  private selectBestMatch(
    wisdomOptions: WisdomSource[],
    memberProfile: MemberWisdomProfile,
    context: any
  ): WisdomSource {
    if (wisdomOptions.length === 0) {
      return this.wisdomLibrary[0]; // Fallback to first wisdom
    }

    // Simple selection based on category preference
    const preferred = wisdomOptions.find(w => w.category === memberProfile.preferred_wisdom_style);
    return preferred || wisdomOptions[0];
  }

  private assessDepthMatch(wisdom: WisdomSource, conversationDepth: number): number {
    // Match wisdom complexity to conversation depth
    if (conversationDepth < 3 && wisdom.category === 'practical') return 8;
    if (conversationDepth >= 3 && conversationDepth < 7 && wisdom.category === 'philosophical') return 8;
    if (conversationDepth >= 7 && wisdom.category === 'spiritual') return 8;
    return 4; // Moderate match
  }

  // ==================== EXPLANATION AND INTEGRATION ====================

  private async explainTimingSignificance(wisdom: WisdomSource, context: any): Promise<string> {
    const timingExplanations = [
      `This wisdom from ${wisdom.author} arrives precisely as you're working with ${context.element_focus} energy.`,
      `The appearance of these words at this moment in your journey through phase ${context.spiral_phase} carries particular medicine.`,
      `${wisdom.author}'s insight emerges just as you're navigating ${context.emotional_tone}, offering guidance for this exact terrain.`,
      `This quote surfaces synchronistically as you explore ${context.session_insights?.join(' and ')}.`
    ];

    const randomIndex = Math.floor(Math.random() * timingExplanations.length);
    return timingExplanations[randomIndex];
  }

  private async explainPersonalResonance(wisdom: WisdomSource, memberProfile: MemberWisdomProfile): Promise<string> {
    const resonanceExplanations = [
      `This speaks to your ${memberProfile.dominant_element} nature and your current work in phase ${memberProfile.current_spiral_phase} of your spiral journey.`,
      `Given your growth edges around ${memberProfile.growth_edges.join(' and ')}, these words offer particular medicine.`,
      `This aligns with your ${memberProfile.preferred_wisdom_style} way of processing wisdom and your current capacity for ${memberProfile.integration_capacity} integration.`
    ];

    const randomIndex = Math.floor(Math.random() * resonanceExplanations.length);
    return resonanceExplanations[randomIndex];
  }

  private async createIntegrationInvitation(wisdom: WisdomSource, context: any): Promise<string> {
    const invitations = [
      `Let these words simmer in your awareness as you continue exploring ${context.element_focus}.`,
      `Consider carrying this wisdom with you as you navigate the current challenges in your life.`,
      `Allow this perspective to inform how you approach the insights emerging in our conversation.`,
      `How might this wisdom illuminate the path you're walking in your ${context.spiral_phase}th phase of development?`
    ];

    const randomIndex = Math.floor(Math.random() * invitations.length);
    return invitations[randomIndex];
  }

  private async suggestFollowUpPractice(wisdom: WisdomSource, memberProfile: MemberWisdomProfile): Promise<string> {
    const practices = {
      fire: `Write this quote where you'll see it daily and notice what actions it inspires.`,
      water: `Sit with these words in meditation and feel what emotions they stir in your heart.`,
      earth: `Choose one practical way to embody this wisdom in your daily life this week.`,
      air: `Journal about how this perspective changes your understanding of your current situation.`,
      aether: `Hold this wisdom in prayer or contemplation and ask what it wants to teach you.`
    };

    return practices[wisdom.element as keyof typeof practices] ||
           `Carry these words with you and notice how they speak to your experience.`;
  }

  private async suggestThresholdPractice(wisdom: WisdomSource): Promise<string> {
    return `As you cross this threshold, let these words be a companion for your journey into sacred space.`;
  }

  private async suggestIntegrationPractice(wisdom: WisdomSource, context: any): Promise<string> {
    return `Weave this wisdom together with today's insights about ${context.element_worked} as you integrate this session's gifts.`;
  }

  // ==================== MEMBER PROFILE MANAGEMENT ====================

  private async getMemberWisdomProfile(memberId: string): Promise<MemberWisdomProfile> {
    // This would retrieve from database - for now, return a default profile
    return this.memberProfiles.get(memberId) || {
      member_id: memberId,
      current_spiral_phase: 1,
      dominant_element: 'aether',
      current_challenges: ['seeking_clarity', 'integrating_wisdom'],
      growth_edges: ['trusting_intuition', 'embodying_insights'],
      preferred_wisdom_style: 'spiritual',
      integration_capacity: 'moderate',
      timing_sensitivity: 7
    };
  }

  /**
   * Update member profile based on their interactions and preferences
   */
  async updateMemberWisdomProfile(
    memberId: string,
    updates: Partial<MemberWisdomProfile>
  ): Promise<void> {
    const currentProfile = await this.getMemberWisdomProfile(memberId);
    const updatedProfile = { ...currentProfile, ...updates };
    this.memberProfiles.set(memberId, updatedProfile);

    // In real implementation, would save to database
    console.log(`Updated wisdom profile for member ${memberId}`);
  }
}

export const synchronisticWisdom = new MAIASynchronisticWisdom();