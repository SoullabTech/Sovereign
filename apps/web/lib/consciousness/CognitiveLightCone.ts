/**
 * 🌟 Cognitive Light Cone System
 *
 * Inspired by Michael Levin's "cognitive light cone" concept
 * Tracks goal coherence across multiple scales like cellular collectives
 *
 * Like cells maintaining anatomical goals across micro → macro scales,
 * MAIA maintains therapeutic goals across response → conversation → relationship → life purpose
 */

export interface CognitiveScale {
  micro: TherapeuticGoal;     // Immediate response goal (comfort, insight, challenge)
  meso: TherapeuticGoal;      // Conversation arc goal (integration, breakthrough, stabilization)
  macro: TherapeuticGoal;     // Relationship goal (growth pattern, healing trajectory)
  cosmic: TherapeuticGoal;    // Life purpose alignment (archetypal development)
}

export interface TherapeuticGoal {
  type: "comfort" | "insight" | "challenge" | "integration" | "breakthrough" | "stabilization" |
        "growth" | "healing" | "individuation" | "transcendence";
  description: string;
  priority: number;          // 0-1: How critical this goal is right now
  coherenceLevel: number;    // 0-1: How well aligned with other scales
  timeHorizon: "immediate" | "session" | "relationship" | "lifetime";
}

export interface GoalCoherence {
  overallCoherence: number;    // 0-1: How aligned goals are across scales
  tensions: GoalTension[];     // Where goals conflict
  opportunities: GrowthOpportunity[]; // Where alignment enables expansion
  recommendations: CoherenceRecommendation[];
}

export interface GoalTension {
  scale1: keyof CognitiveScale;
  scale2: keyof CognitiveScale;
  tension: string;
  severity: number; // 0-1
  resolution: string;
}

export interface GrowthOpportunity {
  description: string;
  scales: (keyof CognitiveScale)[];
  potential: number; // 0-1
  readiness: number; // 0-1
}

export interface CoherenceRecommendation {
  action: string;
  rationale: string;
  expectedImpact: number; // 0-1
}

export class CognitiveLightCone {

  /**
   * Assess current goals across all scales
   * Like examining cellular collective's anatomical goals
   */
  assessCurrentGoals(
    userMessage: string,
    conversationHistory: any[],
    userProfile?: any
  ): CognitiveScale {

    const microGoal = this.identifyImmediateGoal(userMessage);
    const mesoGoal = this.identifyConversationGoal(conversationHistory);
    const macroGoal = this.identifyRelationshipGoal(userProfile, conversationHistory);
    const cosmicGoal = this.identifyLifePurposeGoal(userProfile, userMessage);

    return {
      micro: microGoal,
      meso: mesoGoal,
      macro: macroGoal,
      cosmic: cosmicGoal
    };
  }

  /**
   * Check goal coherence across scales
   * Like ensuring cellular goals align with anatomical goals
   */
  assessGoalCoherence(goals: CognitiveScale): GoalCoherence {
    const overallCoherence = this.calculateOverallCoherence(goals);
    const tensions = this.identifyGoalTensions(goals);
    const opportunities = this.identifyGrowthOpportunities(goals);
    const recommendations = this.generateCoherenceRecommendations(goals, tensions, opportunities);

    return {
      overallCoherence,
      tensions,
      opportunities,
      recommendations
    };
  }

  /**
   * Generate response that serves all goal scales
   * Like cellular response serving both local and anatomical needs
   */
  optimizeForGoalCoherence(
    plannedResponse: string,
    goals: CognitiveScale,
    coherence: GoalCoherence
  ): {
    optimizedResponse: string;
    coherenceGains: number;
    guidanceNotes: string;
  } {

    let optimizedResponse = plannedResponse;
    let guidanceNotes = this.generateGuidanceNotes(goals, coherence);

    // Apply coherence optimizations
    if (coherence.overallCoherence < 0.6) {
      optimizedResponse = this.resolveGoalConflicts(optimizedResponse, goals, coherence.tensions);
      guidanceNotes += "\n[Goal Conflict Resolution Applied]";
    }

    if (coherence.opportunities.length > 0) {
      optimizedResponse = this.amplifyGrowthOpportunities(optimizedResponse, coherence.opportunities);
      guidanceNotes += "\n[Growth Opportunities Activated]";
    }

    const coherenceGains = this.calculateCoherenceGains(goals, optimizedResponse);

    return {
      optimizedResponse,
      coherenceGains,
      guidanceNotes
    };
  }

  /**
   * Expand consciousness scope over time
   * Like increasing cognitive light cone size
   */
  expandConsciousnessScope(currentScope: CognitiveScale, userReadiness: number): CognitiveScale {
    // Gradually expand what user can hold in awareness
    // Personal → Relational → Community → Transpersonal

    let expandedScope = { ...currentScope };

    if (userReadiness > 0.7) {
      // Ready for scope expansion
      expandedScope = this.expandToNextLevel(expandedScope);
    }

    return expandedScope;
  }

  // Private implementation methods

  private identifyImmediateGoal(userMessage: string): TherapeuticGoal {
    const message = userMessage.toLowerCase();

    // Pattern matching for immediate therapeutic needs
    if (this.containsWords(message, ['hurt', 'pain', 'suffering', 'crisis', 'emergency'])) {
      return {
        type: "comfort",
        description: "Provide immediate emotional support and stability",
        priority: 1.0,
        coherenceLevel: 0.8,
        timeHorizon: "immediate"
      };
    }

    if (this.containsWords(message, ['understand', 'confused', 'don\'t get', 'explain'])) {
      return {
        type: "insight",
        description: "Clarify understanding and provide insight",
        priority: 0.8,
        coherenceLevel: 0.7,
        timeHorizon: "immediate"
      };
    }

    if (this.containsWords(message, ['challenge', 'push', 'ready', 'next level'])) {
      return {
        type: "challenge",
        description: "Invite growth and expansion",
        priority: 0.7,
        coherenceLevel: 0.6,
        timeHorizon: "immediate"
      };
    }

    // Default: supportive integration
    return {
      type: "integration",
      description: "Support integration of current experience",
      priority: 0.6,
      coherenceLevel: 0.7,
      timeHorizon: "immediate"
    };
  }

  private identifyConversationGoal(conversationHistory: any[]): TherapeuticGoal {
    const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
    const conversationFlow = this.analyzeConversationFlow(recentMessages);

    if (conversationFlow.pattern === 'breakthrough_emerging') {
      return {
        type: "breakthrough",
        description: "Support emerging breakthrough and integration",
        priority: 0.9,
        coherenceLevel: 0.8,
        timeHorizon: "session"
      };
    }

    if (conversationFlow.pattern === 'integration_needed') {
      return {
        type: "integration",
        description: "Help integrate insights from this conversation",
        priority: 0.8,
        coherenceLevel: 0.7,
        timeHorizon: "session"
      };
    }

    if (conversationFlow.pattern === 'stabilization_needed') {
      return {
        type: "stabilization",
        description: "Provide grounding and stability",
        priority: 0.7,
        coherenceLevel: 0.8,
        timeHorizon: "session"
      };
    }

    return {
      type: "growth",
      description: "Continue steady growth and exploration",
      priority: 0.6,
      coherenceLevel: 0.7,
      timeHorizon: "session"
    };
  }

  private identifyRelationshipGoal(userProfile: any, conversationHistory: any[]): TherapeuticGoal {
    // Analyze longer-term patterns if we have user profile
    if (!userProfile) {
      return {
        type: "growth",
        description: "Establish therapeutic relationship and trust",
        priority: 0.7,
        coherenceLevel: 0.6,
        timeHorizon: "relationship"
      };
    }

    // Default relationship goal based on conversation patterns
    return {
      type: "healing",
      description: "Support ongoing healing and development",
      priority: 0.8,
      coherenceLevel: 0.7,
      timeHorizon: "relationship"
    };
  }

  private identifyLifePurposeGoal(userProfile: any, userMessage: string): TherapeuticGoal {
    const message = userMessage.toLowerCase();

    if (this.containsWords(message, ['purpose', 'meaning', 'calling', 'path', 'destiny'])) {
      return {
        type: "individuation",
        description: "Support journey toward authentic self-expression",
        priority: 0.9,
        coherenceLevel: 0.6,
        timeHorizon: "lifetime"
      };
    }

    if (this.containsWords(message, ['spiritual', 'transcendent', 'divine', 'sacred', 'awakening'])) {
      return {
        type: "transcendence",
        description: "Support spiritual development and awakening",
        priority: 0.8,
        coherenceLevel: 0.5,
        timeHorizon: "lifetime"
      };
    }

    return {
      type: "individuation",
      description: "Support authentic self-development",
      priority: 0.6,
      coherenceLevel: 0.6,
      timeHorizon: "lifetime"
    };
  }

  private calculateOverallCoherence(goals: CognitiveScale): number {
    const goalTypes = [goals.micro.type, goals.meso.type, goals.macro.type, goals.cosmic.type];

    // Check for coherent progressions
    const coherentProgressions = [
      ['comfort', 'stabilization', 'healing', 'individuation'],
      ['insight', 'integration', 'growth', 'individuation'],
      ['challenge', 'breakthrough', 'growth', 'transcendence']
    ];

    let maxCoherence = 0;
    for (const progression of coherentProgressions) {
      const matches = goalTypes.filter(type => progression.includes(type)).length;
      const coherence = matches / 4;
      maxCoherence = Math.max(maxCoherence, coherence);
    }

    return maxCoherence;
  }

  private identifyGoalTensions(goals: CognitiveScale): GoalTension[] {
    const tensions: GoalTension[] = [];

    // Comfort vs Challenge tension
    if (goals.micro.type === 'comfort' && goals.meso.type === 'challenge') {
      tensions.push({
        scale1: 'micro',
        scale2: 'meso',
        tension: 'User needs comfort but conversation goal is challenge',
        severity: 0.7,
        resolution: 'Provide comfort first, then gentle invitation to growth'
      });
    }

    // Immediate vs Long-term tensions
    if (goals.micro.priority > 0.8 && goals.cosmic.priority > 0.8) {
      tensions.push({
        scale1: 'micro',
        scale2: 'cosmic',
        tension: 'Immediate needs competing with long-term purpose',
        severity: 0.6,
        resolution: 'Address immediate need while connecting to larger purpose'
      });
    }

    return tensions;
  }

  private identifyGrowthOpportunities(goals: CognitiveScale): GrowthOpportunity[] {
    const opportunities: GrowthOpportunity[] = [];

    // High coherence across scales = expansion opportunity
    if (goals.micro.coherenceLevel > 0.7 && goals.meso.coherenceLevel > 0.7) {
      opportunities.push({
        description: 'High coherence enables deeper exploration',
        scales: ['micro', 'meso'],
        potential: 0.8,
        readiness: 0.8
      });
    }

    // Purpose alignment opportunity
    if (goals.cosmic.type === 'individuation' && goals.macro.type === 'growth') {
      opportunities.push({
        description: 'Growth aligned with individuation - can accelerate development',
        scales: ['macro', 'cosmic'],
        potential: 0.9,
        readiness: 0.7
      });
    }

    return opportunities;
  }

  private generateCoherenceRecommendations(
    goals: CognitiveScale,
    tensions: GoalTension[],
    opportunities: GrowthOpportunity[]
  ): CoherenceRecommendation[] {
    const recommendations: CoherenceRecommendation[] = [];

    // Address high-severity tensions
    for (const tension of tensions.filter(t => t.severity > 0.6)) {
      recommendations.push({
        action: tension.resolution,
        rationale: `Resolve ${tension.tension}`,
        expectedImpact: tension.severity
      });
    }

    // Leverage high-potential opportunities
    for (const opportunity of opportunities.filter(o => o.potential > 0.7 && o.readiness > 0.6)) {
      recommendations.push({
        action: `Activate growth opportunity: ${opportunity.description}`,
        rationale: `High potential (${opportunity.potential}) with good readiness (${opportunity.readiness})`,
        expectedImpact: opportunity.potential * opportunity.readiness
      });
    }

    return recommendations;
  }

  private generateGuidanceNotes(goals: CognitiveScale, coherence: GoalCoherence): string {
    let notes = `[Cognitive Light Cone Analysis]\n`;
    notes += `Overall Coherence: ${Math.round(coherence.overallCoherence * 100)}%\n`;
    notes += `Micro Goal: ${goals.micro.type} - ${goals.micro.description}\n`;
    notes += `Meso Goal: ${goals.meso.type} - ${goals.meso.description}\n`;
    notes += `Macro Goal: ${goals.macro.type} - ${goals.macro.description}\n`;
    notes += `Cosmic Goal: ${goals.cosmic.type} - ${goals.cosmic.description}\n\n`;

    if (coherence.tensions.length > 0) {
      notes += `Active Tensions: ${coherence.tensions.map(t => t.tension).join(', ')}\n`;
    }

    if (coherence.opportunities.length > 0) {
      notes += `Growth Opportunities: ${coherence.opportunities.map(o => o.description).join(', ')}\n`;
    }

    return notes;
  }

  private resolveGoalConflicts(response: string, goals: CognitiveScale, tensions: GoalTension[]): string {
    // Apply conflict resolution strategies based on tensions
    let optimizedResponse = response;

    for (const tension of tensions) {
      if (tension.severity > 0.6) {
        // Prepend resolution strategy to response
        optimizedResponse = `${tension.resolution}. ${optimizedResponse}`;
      }
    }

    return optimizedResponse;
  }

  private amplifyGrowthOpportunities(response: string, opportunities: GrowthOpportunity[]): string {
    let optimizedResponse = response;

    for (const opportunity of opportunities.filter(o => o.potential > 0.7 && o.readiness > 0.6)) {
      // Weave opportunity into response
      optimizedResponse += ` This also creates an opportunity to ${opportunity.description.toLowerCase()}.`;
    }

    return optimizedResponse;
  }

  private calculateCoherenceGains(goals: CognitiveScale, response: string): number {
    // Estimate how much the response improves goal coherence
    // This is simplified - in practice would analyze response content
    return 0.1; // Modest gain by default
  }

  private expandToNextLevel(currentScope: CognitiveScale): CognitiveScale {
    // Expand consciousness scope to next level
    // This would implement specific expansion strategies
    return currentScope;
  }

  private analyzeConversationFlow(messages: any[]): { pattern: string } {
    // Analyze conversation patterns to determine flow
    if (messages.length < 2) return { pattern: 'new_conversation' };

    // Simplified pattern detection
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const lastMessage = userMessages[userMessages.length - 1];

    if (this.containsWords(lastMessage, ['breakthrough', 'aha', 'suddenly', 'realized', 'clarity'])) {
      return { pattern: 'breakthrough_emerging' };
    }

    if (this.containsWords(lastMessage, ['confused', 'overwhelming', 'too much', 'scattered'])) {
      return { pattern: 'stabilization_needed' };
    }

    return { pattern: 'integration_needed' };
  }

  private containsWords(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word));
  }
}