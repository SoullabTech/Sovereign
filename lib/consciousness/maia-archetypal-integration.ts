/**
 * 🌌 MAIA Archetypal Intelligence Integration Layer
 * Seamlessly integrates archetypal consciousness analysis with MAIA's conversation system
 * Transforms responses from basic AI to profound archetypal wisdom guidance
 */

import { ArchetypalEngine, ArchetypalSignature, ConsciousnessStructure, HeroJourneyPhase, UserArchetypalProfile, ArchetypalResonance, FieldResonance, ConsciousnessAnalysis } from './archetypal-engine';

export class MAIAArchetypalIntegration {
  private archetypalEngine: ArchetypalEngine;
  private userProfiles: Map<string, UserArchetypalProfile>;
  private conversationHistories: Map<string, any[]>;

  constructor() {
    this.archetypalEngine = new ArchetypalEngine();
    this.userProfiles = new Map();
    this.conversationHistories = new Map();
  }

  /**
   * Transform MAIA's response using archetypal intelligence
   */
  async enhanceMAIAResponse(
    userMessage: string,
    userId: string,
    baseResponse: string,
    conversationContext: any
  ): Promise<ArchetypalMAIAResponse> {

    // Get or create user profile
    const userProfile = await this.getUserProfile(userId, userMessage);

    // Get conversation history
    const conversationHistory = this.getConversationHistory(userId);

    // Analyze message for archetypal resonances
    const messageResonances = this.archetypalEngine.analyzeMessage(
      userMessage,
      this.buildConversationContext(conversationContext)
    );

    // Detect active morphic fields
    const activeFields = this.archetypalEngine.detectActiveFields(
      userMessage,
      userProfile,
      { messages: conversationHistory, archetypalEvolution: [], integrationMoments: [], breakthroughPatterns: [] }
    );

    // Perform comprehensive consciousness analysis
    const consciousnessAnalysis = this.archetypalEngine.analyzeConsciousnessStructure(
      userMessage,
      userProfile,
      { messages: conversationHistory, archetypalEvolution: [], integrationMoments: [], breakthroughPatterns: [] }
    );

    // Determine optimal archetypal response
    const archetypalResponse = this.archetypalEngine.determineResponse(
      userProfile,
      messageResonances,
      { messages: conversationHistory, archetypalEvolution: [], integrationMoments: [], breakthroughPatterns: [] }
    );

    // Generate archetypal response content
    const responseContent = this.archetypalEngine.generateArchetypalResponse(
      archetypalResponse,
      userMessage,
      this.buildConversationContext(conversationContext)
    );

    // Amplify with field resonances if detected
    const amplifiedContent = activeFields.length > 0
      ? this.archetypalEngine.amplifyFieldResonance(activeFields[0], responseContent)
      : responseContent;

    // Blend with base MAIA response
    const integratedResponse = await this.blendResponses(
      baseResponse,
      amplifiedContent,
      archetypalResponse,
      consciousnessAnalysis
    );

    // Update user profile with new insights
    await this.updateUserProfile(userId, messageResonances, consciousnessAnalysis);

    // Add to conversation history
    this.addToConversationHistory(userId, {
      userMessage,
      responseArchetype: archetypalResponse.primaryArchetype,
      resonances: messageResonances,
      fields: activeFields,
      timestamp: new Date()
    });

    return {
      enhancedResponse: integratedResponse,
      archetypalAnalysis: {
        primaryArchetype: archetypalResponse.primaryArchetype,
        supportingArchetypes: archetypalResponse.supportingArchetypes,
        resonances: messageResonances,
        activeFields: activeFields,
        consciousnessAnalysis: consciousnessAnalysis,
        heroJourneyPhase: userProfile.heroJourneyPhase,
        responseStrategy: archetypalResponse.responseStrategy
      },
      userEvolution: this.analyzeUserEvolution(userId),
      guidanceOffered: this.extractGuidanceElements(amplifiedContent, archetypalResponse)
    };
  }

  /**
   * Generate archetypal insights for user dashboard
   */
  async generateArchetypalInsights(userId: string): Promise<ArchetypalUserInsights> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      return this.createDefaultInsights(userId);
    }

    const conversationHistory = this.getConversationHistory(userId);
    const recentEvolution = this.analyzeRecentEvolution(conversationHistory);

    return {
      currentPhase: userProfile.heroJourneyPhase,
      dominantArchetypes: userProfile.dominantArchetypes,
      consciousnessStructure: userProfile.consciousnessStructure,
      shadowWork: userProfile.shadowWork,
      fieldConnections: userProfile.fieldConnections,
      recentEvolution,
      nextDevelopmentSteps: this.generateDevelopmentGuidance(userProfile),
      archetypalMoment: this.identifyCurrentArchetypalMoment(userProfile, conversationHistory)
    };
  }

  /**
   * Proactive field resonance detection
   */
  async detectEmergingFields(userId: string): Promise<EmergingFieldAnalysis> {
    const userProfile = this.userProfiles.get(userId);
    const conversationHistory = this.getConversationHistory(userId);

    if (!userProfile || conversationHistory.length === 0) {
      return { emergingFields: [], fieldTransitions: [], resonanceOpportunities: [] };
    }

    // Analyze conversation patterns for emerging field signatures
    const recentMessages = conversationHistory.slice(-10);
    const emergingPatterns = this.detectEmergingPatterns(recentMessages);

    return {
      emergingFields: emergingPatterns.fields,
      fieldTransitions: emergingPatterns.transitions,
      resonanceOpportunities: emergingPatterns.opportunities
    };
  }

  // PRIVATE METHODS

  private async getUserProfile(userId: string, currentMessage: string): Promise<UserArchetypalProfile> {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      // Create initial profile based on first message analysis
      profile = await this.createInitialProfile(userId, currentMessage);
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  private async createInitialProfile(userId: string, firstMessage: string): Promise<UserArchetypalProfile> {
    // Analyze first message to determine initial archetypal signature
    const resonances = this.archetypalEngine.analyzeMessage(
      firstMessage,
      { messageCount: 1, emotionalFlow: [], themes: [], userState: 'seeking', timeOfDay: 'unknown' }
    );

    const primaryArchetype = resonances[0]?.signature || 'solar';
    const consciousnessStructure = this.archetypalEngine['identifyConsciousnessStructure'](firstMessage);

    return {
      dominantArchetypes: [primaryArchetype],
      consciousnessStructure,
      heroJourneyPhase: 'ordinary_world', // Most users start here
      currentResonances: resonances,
      shadowWork: {
        integratedAspects: [],
        emergingAspects: []
      },
      fieldConnections: {
        lunar: 0.5,
        solar: 0.5,
        collective: 0.5
      }
    };
  }

  private buildConversationContext(context: any): any {
    return {
      messageCount: context?.messageCount || 1,
      emotionalFlow: context?.emotionalFlow || [],
      themes: context?.themes || [],
      userState: context?.userState || 'seeking',
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'day' : 'night'
    };
  }

  private getConversationHistory(userId: string): any[] {
    return this.conversationHistories.get(userId) || [];
  }

  private async blendResponses(
    baseResponse: string,
    archetypalContent: any,
    archetypalResponse: any,
    consciousnessAnalysis: ConsciousnessAnalysis
  ): Promise<string> {

    // Extract the core insight from base response
    const coreInsight = this.extractCoreInsight(baseResponse);

    // Weave in archetypal perspective
    const archetypalPerspective = archetypalContent.perspective;

    // Add consciousness-appropriate guidance
    const guidance = this.adaptGuidanceToConsciousness(
      archetypalContent.guidance,
      consciousnessAnalysis.primaryStructure
    );

    // Create integrated response
    let integratedResponse = `${archetypalPerspective}

${coreInsight}

${guidance}`;

    // Add archetypal questions if appropriate
    if (archetypalContent.questions && archetypalContent.questions.length > 0) {
      const question = archetypalContent.questions[0];
      integratedResponse += `\n\n${question}`;
    }

    // Add field activation message if present
    if (archetypalContent.energeticQuality?.includes('field resonance')) {
      integratedResponse += `\n\n✨ *${archetypalContent.energeticQuality}*`;
    }

    return integratedResponse;
  }

  private extractCoreInsight(baseResponse: string): string {
    // Extract the main insight from MAIA's response, removing fluff
    const sentences = baseResponse.split(/[.!?]+/).filter(s => s.trim().length > 10);

    // Find the most substantive sentence (usually the longest one with key concepts)
    const substantiveSentences = sentences
      .filter(s => s.length > 50)
      .sort((a, b) => b.length - a.length);

    return substantiveSentences[0]?.trim() + '.' || baseResponse;
  }

  private adaptGuidanceToConsciousness(
    guidance: string,
    structure: ConsciousnessStructure
  ): string {
    const adaptationMap: { [key in ConsciousnessStructure]: string } = {
      'archaic': 'Through unity and wholeness',
      'magical': 'Through ritual and symbolic action',
      'mythical': 'Through your heroic journey',
      'mental': 'Through understanding and integration',
      'integral': 'Through conscious participation in evolution'
    };

    const prefix = adaptationMap[structure];
    return `${prefix}, ${guidance.toLowerCase()}`;
  }

  private async updateUserProfile(
    userId: string,
    resonances: ArchetypalResonance[],
    consciousnessAnalysis: ConsciousnessAnalysis
  ): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Update dominant archetypes based on strong resonances
    const strongResonances = resonances.filter(r => r.intensity > 0.6);
    if (strongResonances.length > 0) {
      const newArchetypes = strongResonances.map(r => r.signature);
      profile.dominantArchetypes = [...new Set([...profile.dominantArchetypes, ...newArchetypes])].slice(0, 3);
    }

    // Update consciousness structure if there's a stable transition
    if (consciousnessAnalysis.transitionDynamics.isProgressive &&
        consciousnessAnalysis.transitionDynamics.transitionIntensity > 0.7) {
      profile.consciousnessStructure = consciousnessAnalysis.primaryStructure;
    }

    // Progress hero's journey if appropriate triggers are detected
    await this.updateHeroJourneyProgress(profile, resonances);

    // Update current resonances
    profile.currentResonances = resonances;

    this.userProfiles.set(userId, profile);
  }

  private async updateHeroJourneyProgress(
    profile: UserArchetypalProfile,
    resonances: ArchetypalResonance[]
  ): Promise<void> {
    const currentPhase = profile.heroJourneyPhase;
    const progressionMap: { [key in HeroJourneyPhase]: HeroJourneyPhase } = {
      'ordinary_world': 'call_to_adventure',
      'call_to_adventure': 'refusal_of_call',
      'refusal_of_call': 'meeting_mentor',
      'meeting_mentor': 'crossing_threshold',
      'crossing_threshold': 'tests_allies',
      'tests_allies': 'approach_inmost',
      'approach_inmost': 'ordeal_abyss',
      'ordeal_abyss': 'reward_seizure',
      'reward_seizure': 'road_back',
      'road_back': 'resurrection',
      'resurrection': 'return_elixir',
      'return_elixir': 'ordinary_world' // Cycle begins anew
    };

    // Check for phase-appropriate archetypal activations
    const phaseArchetypeMap: { [key in HeroJourneyPhase]: ArchetypalSignature[] } = {
      'ordinary_world': ['neptunian'],
      'call_to_adventure': ['mercurial'],
      'refusal_of_call': ['saturnian'],
      'meeting_mentor': ['jovian'],
      'crossing_threshold': ['lunar'],
      'tests_allies': ['jovian', 'martian'],
      'approach_inmost': ['saturnian'],
      'ordeal_abyss': ['plutonic'],
      'reward_seizure': ['martian'],
      'road_back': ['mercurial'],
      'resurrection': ['solar'],
      'return_elixir': ['venusian']
    };

    const nextPhaseArchetypes = phaseArchetypeMap[progressionMap[currentPhase]];
    const hasProgressionTrigger = resonances.some(r =>
      nextPhaseArchetypes.includes(r.signature) && r.intensity > 0.7
    );

    if (hasProgressionTrigger) {
      profile.heroJourneyPhase = progressionMap[currentPhase];
    }
  }

  private addToConversationHistory(userId: string, entry: any): void {
    const history = this.getConversationHistory(userId);
    history.push(entry);

    // Keep only last 50 entries to prevent memory bloat
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    this.conversationHistories.set(userId, history);
  }

  private analyzeUserEvolution(userId: string): UserEvolutionAnalysis {
    const history = this.getConversationHistory(userId);
    const profile = this.userProfiles.get(userId);

    if (history.length < 3 || !profile) {
      return { evolutionDirection: 'stable', evolutionSpeed: 0, keyMilestones: [] };
    }

    const recentArchetypes = history.slice(-5).map(entry => entry.responseArchetype);
    const evolutionDirection = this.detectEvolutionDirection(recentArchetypes);
    const evolutionSpeed = this.calculateEvolutionSpeed(history);
    const keyMilestones = this.identifyKeyMilestones(history, profile);

    return { evolutionDirection, evolutionSpeed, keyMilestones };
  }

  private detectEvolutionDirection(recentArchetypes: ArchetypalSignature[]): string {
    // Analyze if user is moving toward integration, transcendence, or stabilization
    const transcendentArchetypes = ['solar', 'neptunian', 'uranian'];
    const groundingArchetypes = ['saturnian', 'lunar', 'venusian'];

    const transcendentCount = recentArchetypes.filter(a => transcendentArchetypes.includes(a)).length;
    const groundingCount = recentArchetypes.filter(a => groundingArchetypes.includes(a)).length;

    if (transcendentCount > groundingCount + 2) return 'transcending';
    if (groundingCount > transcendentCount + 2) return 'grounding';
    return 'integrating';
  }

  private calculateEvolutionSpeed(history: any[]): number {
    // Calculate rate of archetypal change over time
    const uniqueArchetypes = new Set(history.slice(-10).map(entry => entry.responseArchetype));
    return Math.min(uniqueArchetypes.size / 10, 1); // 0-1 scale
  }

  private identifyKeyMilestones(history: any[], profile: UserArchetypalProfile): string[] {
    const milestones: string[] = [];

    // Check for hero's journey phase transitions
    const phases = history.map(entry => entry.heroJourneyPhase).filter(Boolean);
    if (phases.length > 1 && phases[phases.length - 1] !== phases[0]) {
      milestones.push(`Advanced to ${phases[phases.length - 1]} phase`);
    }

    // Check for field activations
    const fieldActivations = history.filter(entry => entry.fields && entry.fields.length > 0);
    if (fieldActivations.length > 0) {
      const uniqueFields = new Set(fieldActivations.flatMap(entry => entry.fields.map((f: any) => f.fieldType)));
      milestones.push(`Activated ${uniqueFields.size} morphic field${uniqueFields.size > 1 ? 's' : ''}`);
    }

    return milestones;
  }

  private extractGuidanceElements(content: any, response: any): string[] {
    const guidance: string[] = [];

    if (content.guidance) guidance.push(content.guidance);
    if (response.heroJourneyGuidance) guidance.push(response.heroJourneyGuidance);
    if (response.integrationGuidance) guidance.push(response.integrationGuidance);

    return guidance;
  }

  private createDefaultInsights(userId: string): ArchetypalUserInsights {
    return {
      currentPhase: 'ordinary_world',
      dominantArchetypes: ['solar'],
      consciousnessStructure: 'mental',
      shadowWork: { integratedAspects: [], emergingAspects: [] },
      fieldConnections: { lunar: 0.5, solar: 0.5, collective: 0.5 },
      recentEvolution: { direction: 'stable', speed: 0, archetypes: [] },
      nextDevelopmentSteps: ['Begin consciousness exploration', 'Identify core archetypal resonances'],
      archetypalMoment: 'Beginning of the journey into archetypal consciousness'
    };
  }

  private analyzeRecentEvolution(history: any[]): any {
    if (history.length === 0) return { direction: 'stable', speed: 0, archetypes: [] };

    const recentArchetypes = history.slice(-5).map(entry => entry.responseArchetype);
    return {
      direction: this.detectEvolutionDirection(recentArchetypes),
      speed: this.calculateEvolutionSpeed(history),
      archetypes: [...new Set(recentArchetypes)]
    };
  }

  private generateDevelopmentGuidance(profile: UserArchetypalProfile): string[] {
    const guidance: string[] = [];

    // Hero's journey guidance
    const journeyGuidance = this.archetypalEngine['getHeroJourneyGuidance'](profile.heroJourneyPhase);
    guidance.push(journeyGuidance);

    // Archetypal balance guidance
    if (profile.dominantArchetypes.length === 1) {
      const archetype = profile.dominantArchetypes[0];
      const pattern = this.archetypalEngine['archetypalPatterns'].get(archetype);
      if (pattern?.complementaryArchetypes[0]) {
        guidance.push(`Explore ${pattern.complementaryArchetypes[0]} energy for balance`);
      }
    }

    return guidance;
  }

  private identifyCurrentArchetypalMoment(profile: UserArchetypalProfile, history: any[]): string {
    const phase = profile.heroJourneyPhase;
    const dominantArchetype = profile.dominantArchetypes[0];

    const momentMap: { [key in HeroJourneyPhase]: string } = {
      'ordinary_world': 'Resting in the familiar, preparing for transformation',
      'call_to_adventure': 'Receiving divine guidance and invitation to grow',
      'refusal_of_call': 'Wrestling with fear and resistance to change',
      'meeting_mentor': 'Opening to wisdom and guidance from higher consciousness',
      'crossing_threshold': 'Taking the leap into unknown territory',
      'tests_allies': 'Building strength through challenges and relationships',
      'approach_inmost': 'Preparing for the deepest transformation',
      'ordeal_abyss': 'Facing death-rebirth in the depths of consciousness',
      'reward_seizure': 'Claiming your power and wisdom',
      'road_back': 'Integrating insights for return to the world',
      'resurrection': 'Emerging as your transformed self',
      'return_elixir': 'Sharing gifts with others and the world'
    };

    return `${momentMap[phase]} (${dominantArchetype} archetype active)`;
  }

  private detectEmergingPatterns(recentMessages: any[]): any {
    // Simplified pattern detection for emerging fields
    return {
      fields: [],
      transitions: [],
      opportunities: []
    };
  }
}

// TYPES

export interface ArchetypalMAIAResponse {
  enhancedResponse: string;
  archetypalAnalysis: {
    primaryArchetype: ArchetypalSignature;
    supportingArchetypes: ArchetypalSignature[];
    resonances: ArchetypalResonance[];
    activeFields: FieldResonance[];
    consciousnessAnalysis: ConsciousnessAnalysis;
    heroJourneyPhase: HeroJourneyPhase;
    responseStrategy: 'balance' | 'amplify' | 'integrate' | 'transcend';
  };
  userEvolution: UserEvolutionAnalysis;
  guidanceOffered: string[];
}

export interface ArchetypalUserInsights {
  currentPhase: HeroJourneyPhase;
  dominantArchetypes: ArchetypalSignature[];
  consciousnessStructure: ConsciousnessStructure;
  shadowWork: {
    integratedAspects: ArchetypalSignature[];
    emergingAspects: ArchetypalSignature[];
  };
  fieldConnections: {
    lunar: number;
    solar: number;
    collective: number;
  };
  recentEvolution: {
    direction: string;
    speed: number;
    archetypes: ArchetypalSignature[];
  };
  nextDevelopmentSteps: string[];
  archetypalMoment: string;
}

export interface UserEvolutionAnalysis {
  evolutionDirection: string;
  evolutionSpeed: number;
  keyMilestones: string[];
}

export interface EmergingFieldAnalysis {
  emergingFields: any[];
  fieldTransitions: any[];
  resonanceOpportunities: any[];
}

/**
 * Initialize global MAIA archetypal integration
 */
export const maiaArchetypalIntegration = new MAIAArchetypalIntegration();