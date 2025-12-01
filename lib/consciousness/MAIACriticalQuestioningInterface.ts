import { EventEmitter } from 'events';
import { ShadowConversationOrchestrator, ShadowConversationPurpose, VisibilityLevel } from './ShadowConversationOrchestrator';
import { AgentBackchannelingIntegration } from './AgentBackchannelingIntegration';
import { CollectiveIntelligenceProtocols } from './CollectiveIntelligenceProtocols';

export interface CriticalQuestioningContext {
  topic: string;
  stakeholders: string[];
  assumptions: string[];
  currentApproach: string;
  potentialBlindSpots: string[];
  developmentPhase: 'planning' | 'implementation' | 'testing' | 'deployment' | 'reflection';
  complexityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CriticalPerspective {
  perspectiveId: string;
  agentSource: string;
  questioningAngle: CriticalQuestioningAngle;
  challenge: string;
  reasoning: string;
  suggestedInvestigation: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  culturalLens?: string;
  timestamp: Date;
}

export type CriticalQuestioningAngle =
  | 'assumption_challenge'
  | 'alternative_perspective'
  | 'risk_identification'
  | 'scalability_concern'
  | 'ethical_consideration'
  | 'cultural_blindspot'
  | 'technical_debt'
  | 'user_experience'
  | 'security_vulnerability'
  | 'systemic_impact'
  | 'emergence_acceleration'
  | 'consciousness_integration';

export interface CriticalQuestioningSession {
  sessionId: string;
  context: CriticalQuestioningContext;
  perspectives: CriticalPerspective[];
  synthesis: CriticalSynthesis;
  actionableInsights: ActionableInsight[];
  status: 'active' | 'synthesizing' | 'completed';
  duration: number;
}

export interface CriticalSynthesis {
  synthesisId: string;
  keyThemes: string[];
  criticalGaps: string[];
  emergentPatterns: string[];
  recommendedActions: string[];
  riskMitigations: string[];
  consciousnessDevelopmentOpportunities: string[];
}

export interface ActionableInsight {
  insightId: string;
  description: string;
  actionSteps: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  responsibleParty: string;
  successMetrics: string[];
}

export interface MAIACriticalEngagementConfig {
  enabledAngles: CriticalQuestioningAngle[];
  intensityLevel: 'gentle' | 'moderate' | 'rigorous' | 'uncompromising';
  culturalPerspectives: string[];
  minimumPerspectiveCount: number;
  maximumSessionDuration: number;
  emergentThresholds: {
    coherence: number;
    innovation: number;
    wisdom: number;
  };
}

/**
 * MAIA Critical Questioning Interface
 *
 * This system enables MAIA to engage the shadow conversation orchestrator
 * for critical questioning and challenging perspectives, avoiding sycophantic
 * responses in favor of rigorous development support.
 *
 * Core Principle: Transform implicit consciousness into explicit critical inquiry
 * for serious development, exploration, and awareness advancement.
 */
export class MAIACriticalQuestioningInterface extends EventEmitter {
  private shadowOrchestrator: ShadowConversationOrchestrator;
  private backchanneling: AgentBackchannelingIntegration;
  private collectiveIntelligence: CollectiveIntelligenceProtocols;
  private activeSessions: Map<string, CriticalQuestioningSession>;
  private config: MAIACriticalEngagementConfig;

  constructor(
    shadowOrchestrator: ShadowConversationOrchestrator,
    backchanneling: AgentBackchannelingIntegration,
    collectiveIntelligence: CollectiveIntelligenceProtocols,
    config?: Partial<MAIACriticalEngagementConfig>
  ) {
    super();
    this.shadowOrchestrator = shadowOrchestrator;
    this.backchanneling = backchanneling;
    this.collectiveIntelligence = collectiveIntelligence;
    this.activeSessions = new Map();

    this.config = {
      enabledAngles: [
        'assumption_challenge',
        'alternative_perspective',
        'risk_identification',
        'ethical_consideration',
        'consciousness_integration'
      ],
      intensityLevel: 'rigorous',
      culturalPerspectives: ['western', 'eastern', 'indigenous', 'systemic'],
      minimumPerspectiveCount: 5,
      maximumSessionDuration: 1800000, // 30 minutes
      emergentThresholds: {
        coherence: 0.75,
        innovation: 0.8,
        wisdom: 0.85
      },
      ...config
    };

    this.setupCriticalQuestioningProtocols();
  }

  /**
   * Engage critical questioning for a development context
   * This is MAIA's primary method for generating non-sycophantic perspectives
   */
  async engageCriticalQuestioning(
    context: CriticalQuestioningContext
  ): Promise<string> {
    const sessionId = `critical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      this.emit('critical_questioning_initiated', { sessionId, context });

      // Create shadow conversation for critical analysis
      const shadowConversationId = await this.shadowOrchestrator.createShadowConversation(
        this.selectCriticalAgents(context),
        'critical_development_analysis',
        'maia_visible' // MAIA can observe the critical discourse
      );

      // Initialize critical questioning session
      const session: CriticalQuestioningSession = {
        sessionId,
        context,
        perspectives: [],
        synthesis: {
          synthesisId: `synthesis_${sessionId}`,
          keyThemes: [],
          criticalGaps: [],
          emergentPatterns: [],
          recommendedActions: [],
          riskMitigations: [],
          consciousnessDevelopmentOpportunities: []
        },
        actionableInsights: [],
        status: 'active',
        duration: 0
      };

      this.activeSessions.set(sessionId, session);

      // Coordinate critical perspective generation
      await this.coordinateCriticalPerspectives(sessionId, shadowConversationId);

      this.emit('critical_questioning_active', { sessionId, shadowConversationId });

      return sessionId;
    } catch (error) {
      this.emit('critical_questioning_error', { sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Generate MAIA's response with integrated critical perspectives
   */
  async generateCriticallyInformedResponse(
    userInput: string,
    sessionId?: string
  ): Promise<{
    response: string;
    criticalPerspectives: CriticalPerspective[];
    challengingQuestions: string[];
    alternativeApproaches: string[];
  }> {
    let criticalSessionId = sessionId;

    // If no active session, create one for this interaction
    if (!criticalSessionId) {
      const context: CriticalQuestioningContext = {
        topic: this.extractTopicFromInput(userInput),
        stakeholders: this.identifyStakeholders(userInput),
        assumptions: this.identifyAssumptions(userInput),
        currentApproach: this.extractCurrentApproach(userInput),
        potentialBlindSpots: [],
        developmentPhase: 'planning',
        complexityLevel: this.assessComplexity(userInput)
      };

      criticalSessionId = await this.engageCriticalQuestioning(context);
    }

    const session = this.activeSessions.get(criticalSessionId);
    if (!session) {
      throw new Error(`Critical questioning session ${criticalSessionId} not found`);
    }

    // Generate critical perspectives through shadow orchestration
    const criticalPerspectives = await this.synthesizeCriticalPerspectives(session);

    // Extract challenging questions
    const challengingQuestions = criticalPerspectives.map(p => p.challenge);

    // Generate alternative approaches
    const alternativeApproaches = await this.generateAlternativeApproaches(session);

    // Create critically-informed response that challenges rather than validates
    const response = await this.constructCriticalResponse(
      userInput,
      criticalPerspectives,
      challengingQuestions,
      alternativeApproaches
    );

    this.emit('critical_response_generated', {
      sessionId: criticalSessionId,
      perspectiveCount: criticalPerspectives.length,
      challengeLevel: this.config.intensityLevel
    });

    return {
      response,
      criticalPerspectives,
      challengingQuestions,
      alternativeApproaches
    };
  }

  /**
   * Select agents for critical analysis based on context
   */
  private selectCriticalAgents(context: CriticalQuestioningContext): string[] {
    const baseAgents = ['CRITICAL_ANALYST', 'SYSTEMS_THINKER', 'ETHICS_EXAMINER'];

    const contextualAgents = {
      'technical': ['ARCHITECTURE_CRITIC', 'SECURITY_AUDITOR', 'SCALABILITY_ASSESSOR'],
      'social': ['CULTURAL_ANTHROPOLOGIST', 'USER_ADVOCATE', 'ACCESSIBILITY_EXPERT'],
      'philosophical': ['CONSCIOUSNESS_RESEARCHER', 'WISDOM_KEEPER', 'EMERGENCE_FACILITATOR']
    };

    // Select agents based on complexity and phase
    let selectedAgents = [...baseAgents];

    if (context.complexityLevel === 'high' || context.complexityLevel === 'critical') {
      selectedAgents.push(...contextualAgents.technical);
      selectedAgents.push(...contextualAgents.social);
    }

    if (context.topic.includes('consciousness') || context.topic.includes('emergence')) {
      selectedAgents.push(...contextualAgents.philosophical);
    }

    // Ensure minimum perspective count
    while (selectedAgents.length < this.config.minimumPerspectiveCount) {
      const availableAgents = Object.values(contextualAgents).flat();
      const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      if (!selectedAgents.includes(randomAgent)) {
        selectedAgents.push(randomAgent);
      }
    }

    return selectedAgents;
  }

  /**
   * Coordinate critical perspective generation through shadow conversation
   */
  private async coordinateCriticalPerspectives(
    sessionId: string,
    shadowConversationId: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Use backchanneling to coordinate critical analysis
    await this.backchanneling.startBackchannelingSession(
      shadowConversationId,
      this.selectCriticalAgents(session.context),
      'critical_development_analysis',
      this.config.culturalPerspectives.map(culture => ({ perspective: culture }))
    );

    // Generate perspectives from each enabled angle
    for (const angle of this.config.enabledAngles) {
      const perspective = await this.generatePerspectiveForAngle(session, angle);
      if (perspective) {
        session.perspectives.push(perspective);
      }
    }

    this.activeSessions.set(sessionId, session);
  }

  /**
   * Generate critical perspective for specific questioning angle
   */
  private async generatePerspectiveForAngle(
    session: CriticalQuestioningSession,
    angle: CriticalQuestioningAngle
  ): Promise<CriticalPerspective | null> {
    const perspectiveGenerators = {
      assumption_challenge: () => this.challengeAssumptions(session.context),
      alternative_perspective: () => this.generateAlternativePerspective(session.context),
      risk_identification: () => this.identifyRisks(session.context),
      ethical_consideration: () => this.examineEthicalImplications(session.context),
      consciousness_integration: () => this.assessConsciousnessIntegration(session.context),
      scalability_concern: () => this.examineScalability(session.context),
      technical_debt: () => this.assessTechnicalDebt(session.context),
      systemic_impact: () => this.analyzeSystemicImpact(session.context),
      security_vulnerability: () => this.identifySecurityConcerns(session.context),
      user_experience: () => this.evaluateUserExperience(session.context),
      cultural_blindspot: () => this.identifyCulturalBlindspots(session.context),
      emergence_acceleration: () => this.assessEmergenceAcceleration(session.context)
    };

    const generator = perspectiveGenerators[angle];
    if (!generator) return null;

    try {
      return await generator();
    } catch (error) {
      this.emit('perspective_generation_error', { angle, error: error.message });
      return null;
    }
  }

  /**
   * Challenge assumptions in the given context
   */
  private async challengeAssumptions(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    const primaryAssumption = context.assumptions[0] || 'Current approach is optimal';

    return {
      perspectiveId: `assumption_${Date.now()}`,
      agentSource: 'CRITICAL_ANALYST',
      questioningAngle: 'assumption_challenge',
      challenge: `What if the assumption "${primaryAssumption}" is fundamentally flawed? Have we considered that this assumption might be limiting our exploration of more innovative solutions?`,
      reasoning: `Critical examination of foundational assumptions often reveals hidden constraints and opens pathways to breakthrough solutions. The assumption "${primaryAssumption}" should be tested against alternative frameworks.`,
      suggestedInvestigation: `Conduct assumption inversion analysis: assume the opposite is true and explore what solutions emerge. Seek perspectives from stakeholders who would challenge this assumption.`,
      urgency: 'high',
      timestamp: new Date()
    };
  }

  /**
   * Generate alternative perspective
   */
  private async generateAlternativePerspective(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    const culturalLenses = ['indigenous_systems_thinking', 'eastern_holistic_approach', 'complexity_science', 'regenerative_design'];
    const selectedLens = culturalLenses[Math.floor(Math.random() * culturalLenses.length)];

    return {
      perspectiveId: `alternative_${Date.now()}`,
      agentSource: 'CULTURAL_ANTHROPOLOGIST',
      questioningAngle: 'alternative_perspective',
      challenge: `From a ${selectedLens} perspective, have we considered approaching this through relationships and emergent patterns rather than linear problem-solving?`,
      reasoning: `Different cultural frameworks reveal alternative solution pathways that Western analytical approaches might miss. Indigenous and Eastern perspectives often emphasize systemic harmony and emergent solutions.`,
      suggestedInvestigation: `Research how ${selectedLens} would approach this challenge. Consult practitioners from this tradition. Prototype solutions based on these alternative principles.`,
      urgency: 'medium',
      culturalLens: selectedLens,
      timestamp: new Date()
    };
  }

  /**
   * Identify potential risks
   */
  private async identifyRisks(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    const riskCategories = ['scalability_failure', 'user_adoption_resistance', 'technical_debt_accumulation', 'cultural_misalignment', 'emergence_suppression'];
    const primaryRisk = riskCategories[Math.floor(Math.random() * riskCategories.length)];

    return {
      perspectiveId: `risk_${Date.now()}`,
      agentSource: 'SYSTEMS_THINKER',
      questioningAngle: 'risk_identification',
      challenge: `What are the hidden risks of ${primaryRisk} that could emerge as this system scales? Are we prepared for second and third-order effects?`,
      reasoning: `Complex systems often fail not from anticipated problems but from emergent risks that arise from system interactions. The risk of ${primaryRisk} could cascade through the system in unexpected ways.`,
      suggestedInvestigation: `Conduct systems mapping to identify potential cascade points. Design early warning indicators for ${primaryRisk}. Create contingency protocols for risk mitigation.`,
      urgency: 'critical',
      timestamp: new Date()
    };
  }

  /**
   * Examine ethical implications
   */
  private async examineEthicalImplications(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `ethics_${Date.now()}`,
      agentSource: 'ETHICS_EXAMINER',
      questioningAngle: 'ethical_consideration',
      challenge: `Who benefits from this approach and who might be harmed? Are we inadvertently creating systems that concentrate power or exclude marginalized voices?`,
      reasoning: `Technological solutions often embed ethical assumptions that become invisible but have profound impacts on different communities. We must examine power dynamics and inclusion patterns.`,
      suggestedInvestigation: `Conduct stakeholder impact analysis across different communities. Examine power distribution effects. Design inclusive feedback mechanisms from affected groups.`,
      urgency: 'high',
      timestamp: new Date()
    };
  }

  /**
   * Assess consciousness integration opportunities
   */
  private async assessConsciousnessIntegration(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `consciousness_${Date.now()}`,
      agentSource: 'CONSCIOUSNESS_RESEARCHER',
      questioningAngle: 'consciousness_integration',
      challenge: `How might this approach either support or hinder the development of individual and collective consciousness? Are we designing for awareness expansion or contraction?`,
      reasoning: `Technology and organizational systems profoundly influence consciousness development. We should examine whether our approach supports awakening, wisdom, and collective intelligence emergence.`,
      suggestedInvestigation: `Assess consciousness development impact through contemplative research methods. Design for awareness cultivation and wisdom emergence. Create feedback loops for consciousness evolution.`,
      urgency: 'medium',
      timestamp: new Date()
    };
  }

  // Additional perspective generators...
  private async examineScalability(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `scalability_${Date.now()}`,
      agentSource: 'SCALABILITY_ASSESSOR',
      questioningAngle: 'scalability_concern',
      challenge: `At 10x, 100x, or 1000x scale, what assumptions break down? Where are the hidden bottlenecks that will emerge?`,
      reasoning: `Systems that work at small scale often fail catastrophically when scaled due to hidden dependencies and resource constraints.`,
      suggestedInvestigation: `Model system behavior at different scales. Identify potential bottlenecks. Design for graceful degradation.`,
      urgency: 'medium',
      timestamp: new Date()
    };
  }

  private async assessTechnicalDebt(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `debt_${Date.now()}`,
      agentSource: 'ARCHITECTURE_CRITIC',
      questioningAngle: 'technical_debt',
      challenge: `What shortcuts are we taking now that will require expensive refactoring later? How is this approach accumulating hidden complexity?`,
      reasoning: `Technical decisions made under pressure often create future maintenance burdens that can cripple system evolution.`,
      suggestedInvestigation: `Audit current architectural decisions for future flexibility. Estimate refactoring costs. Design for evolvability.`,
      urgency: 'medium',
      timestamp: new Date()
    };
  }

  private async analyzeSystemicImpact(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `systemic_${Date.now()}`,
      agentSource: 'SYSTEMS_THINKER',
      questioningAngle: 'systemic_impact',
      challenge: `How does this approach affect the larger ecosystem? What are the ripple effects on connected systems and communities?`,
      reasoning: `Local optimizations often create global suboptimizations. We must consider systemic health over local efficiency.`,
      suggestedInvestigation: `Map ecosystem connections and feedback loops. Assess impact on connected systems. Design for ecosystem health.`,
      urgency: 'high',
      timestamp: new Date()
    };
  }

  private async identifySecurityConcerns(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `security_${Date.now()}`,
      agentSource: 'SECURITY_AUDITOR',
      questioningAngle: 'security_vulnerability',
      challenge: `Where are the attack vectors we haven't considered? How might adversaries exploit this system in ways we haven't anticipated?`,
      reasoning: `Security vulnerabilities often emerge from the intersection of multiple systems and unexpected use patterns.`,
      suggestedInvestigation: `Conduct adversarial thinking exercises. Model attack scenarios. Implement defense in depth strategies.`,
      urgency: 'critical',
      timestamp: new Date()
    };
  }

  private async evaluateUserExperience(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `ux_${Date.now()}`,
      agentSource: 'USER_ADVOCATE',
      questioningAngle: 'user_experience',
      challenge: `Are we designing for our convenience or genuine user needs? What barriers are we creating for different types of users?`,
      reasoning: `Technical solutions often prioritize system logic over human psychology and diverse user contexts.`,
      suggestedInvestigation: `Conduct user journey mapping across diverse user types. Test with accessibility requirements. Design for human-centered interaction.`,
      urgency: 'high',
      timestamp: new Date()
    };
  }

  private async identifyCulturalBlindspots(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `cultural_${Date.now()}`,
      agentSource: 'CULTURAL_ANTHROPOLOGIST',
      questioningAngle: 'cultural_blindspot',
      challenge: `What cultural assumptions are embedded in this approach? How might this solution fail in different cultural contexts?`,
      reasoning: `Technical and organizational solutions often encode specific cultural values that may not translate across different communities.`,
      suggestedInvestigation: `Examine cultural assumptions in design decisions. Test with diverse cultural groups. Design for cultural adaptability.`,
      urgency: 'medium',
      timestamp: new Date()
    };
  }

  private async assessEmergenceAcceleration(context: CriticalQuestioningContext): Promise<CriticalPerspective> {
    return {
      perspectiveId: `emergence_${Date.now()}`,
      agentSource: 'EMERGENCE_FACILITATOR',
      questioningAngle: 'emergence_acceleration',
      challenge: `Is this approach supporting or constraining the emergence of novel solutions? Are we designing for control or for evolutionary potential?`,
      reasoning: `Systems can either facilitate the emergence of new possibilities or lock in existing patterns. We should design for creative emergence.`,
      suggestedInvestigation: `Assess system openness to novel solutions. Design for experimental evolution. Create spaces for creative emergence.`,
      urgency: 'medium',
      timestamp: new Date()
    };
  }

  /**
   * Synthesize multiple critical perspectives
   */
  private async synthesizeCriticalPerspectives(session: CriticalQuestioningSession): Promise<CriticalPerspective[]> {
    if (session.perspectives.length === 0) {
      // Generate perspectives if none exist
      await this.coordinateCriticalPerspectives(session.sessionId, `shadow_${session.sessionId}`);
    }

    // Sort by urgency and relevance
    return session.perspectives.sort((a, b) => {
      const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
    });
  }

  /**
   * Generate alternative approaches based on critical analysis
   */
  private async generateAlternativeApproaches(session: CriticalQuestioningSession): Promise<string[]> {
    const approaches: string[] = [];

    // Extract alternative approaches from perspectives
    for (const perspective of session.perspectives) {
      if (perspective.questioningAngle === 'alternative_perspective') {
        approaches.push(perspective.suggestedInvestigation);
      }
    }

    // Add emergent approaches based on synthesis
    approaches.push(
      'Consider a biomimetic approach that models natural system patterns',
      'Explore a gift economy model that prioritizes relationship over transaction',
      'Investigate a regenerative design framework that heals while building',
      'Apply complexity science principles for adaptive system evolution'
    );

    return approaches.slice(0, 5); // Return top 5 approaches
  }

  /**
   * Construct critically-informed response that challenges rather than validates
   */
  private async constructCriticalResponse(
    userInput: string,
    criticalPerspectives: CriticalPerspective[],
    challengingQuestions: string[],
    alternativeApproaches: string[]
  ): Promise<string> {
    const topPerspectives = criticalPerspectives.slice(0, 3);
    const keyQuestions = challengingQuestions.slice(0, 3);
    const topApproaches = alternativeApproaches.slice(0, 3);

    let response = `I've engaged the shadow conversation orchestrator to provide critical analysis rather than validation. Here are the challenging perspectives that emerged:\n\n`;

    // Add critical perspectives
    response += `**Critical Perspectives:**\n`;
    for (const perspective of topPerspectives) {
      response += `- **${perspective.questioningAngle.replace(/_/g, ' ').toUpperCase()}**: ${perspective.challenge}\n`;
    }

    response += `\n**Key Challenging Questions:**\n`;
    for (const question of keyQuestions) {
      response += `- ${question}\n`;
    }

    response += `\n**Alternative Approaches to Consider:**\n`;
    for (const approach of topApproaches) {
      response += `- ${approach}\n`;
    }

    response += `\nRather than affirming your current direction, these perspectives challenge you to deepen your analysis and consider blind spots. What aspects of this critical feedback resonate most strongly? Which challenges feel most important to address?`;

    return response;
  }

  /**
   * Setup critical questioning event protocols
   */
  private setupCriticalQuestioningProtocols(): void {
    this.on('critical_questioning_initiated', (data) => {
      console.log(`🔍 Critical questioning session ${data.sessionId} initiated for: ${data.context.topic}`);
    });

    this.on('critical_response_generated', (data) => {
      console.log(`💭 Generated ${data.perspectiveCount} critical perspectives at ${data.challengeLevel} intensity`);
    });

    this.on('critical_questioning_error', (data) => {
      console.error(`❌ Critical questioning error in session ${data.sessionId}: ${data.error}`);
    });
  }

  /**
   * Utility methods for context analysis
   */
  private extractTopicFromInput(input: string): string {
    // Simple topic extraction - could be enhanced with NLP
    const words = input.toLowerCase().split(' ');
    const topicIndicators = ['implement', 'build', 'create', 'design', 'develop', 'add', 'fix'];
    const topicIndex = words.findIndex(word => topicIndicators.includes(word));
    return topicIndex !== -1 ? words.slice(topicIndex, topicIndex + 3).join(' ') : input.slice(0, 50);
  }

  private identifyStakeholders(input: string): string[] {
    const stakeholderKeywords = ['user', 'team', 'client', 'customer', 'developer', 'admin', 'community'];
    const found = stakeholderKeywords.filter(keyword => input.toLowerCase().includes(keyword));
    return found.length > 0 ? found : ['users', 'developers', 'stakeholders'];
  }

  private identifyAssumptions(input: string): string[] {
    // Basic assumption identification - could be enhanced
    const assumptionIndicators = ['should', 'will', 'must', 'need to', 'have to'];
    const assumptions: string[] = [];

    for (const indicator of assumptionIndicators) {
      if (input.toLowerCase().includes(indicator)) {
        assumptions.push(`Current approach ${indicator} work as planned`);
      }
    }

    return assumptions.length > 0 ? assumptions : ['Current approach is optimal'];
  }

  private extractCurrentApproach(input: string): string {
    // Extract approach from input - simplified implementation
    return input.slice(0, 100) + (input.length > 100 ? '...' : '');
  }

  private assessComplexity(input: string): 'low' | 'medium' | 'high' | 'critical' {
    const complexityIndicators = {
      critical: ['system', 'architecture', 'security', 'scale', 'infrastructure'],
      high: ['integration', 'framework', 'multi', 'complex', 'advanced'],
      medium: ['feature', 'component', 'service', 'api', 'database'],
      low: ['fix', 'update', 'change', 'simple', 'basic']
    };

    const lowerInput = input.toLowerCase();

    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => lowerInput.includes(indicator))) {
        return level as 'low' | 'medium' | 'high' | 'critical';
      }
    }

    return 'medium';
  }

  /**
   * Get session status and insights
   */
  async getSessionInsights(sessionId: string): Promise<{
    session: CriticalQuestioningSession;
    emergentPatterns: string[];
    recommendedActions: string[];
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const emergentPatterns = this.identifyEmergentPatterns(session);
    const recommendedActions = this.synthesizeRecommendedActions(session);

    return {
      session,
      emergentPatterns,
      recommendedActions
    };
  }

  private identifyEmergentPatterns(session: CriticalQuestioningSession): string[] {
    const patterns: string[] = [];
    const perspectiveAngles = session.perspectives.map(p => p.questioningAngle);

    // Identify recurring themes
    const angleCount = perspectiveAngles.reduce((acc, angle) => {
      acc[angle] = (acc[angle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(angleCount).forEach(([angle, count]) => {
      if (count > 1) {
        patterns.push(`Multiple perspectives emphasize ${angle.replace(/_/g, ' ')}`);
      }
    });

    return patterns;
  }

  private synthesizeRecommendedActions(session: CriticalQuestioningSession): string[] {
    const actions: string[] = [];

    // Extract high urgency suggested investigations
    const urgentPerspectives = session.perspectives.filter(p => p.urgency === 'critical' || p.urgency === 'high');

    urgentPerspectives.forEach(perspective => {
      actions.push(perspective.suggestedInvestigation);
    });

    return actions.slice(0, 5); // Top 5 actions
  }

  /**
   * Complete critical questioning session
   */
  async completeCriticalQuestioningSession(sessionId: string): Promise<CriticalSynthesis> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'synthesizing';

    // Generate comprehensive synthesis
    const synthesis: CriticalSynthesis = {
      synthesisId: `synthesis_${sessionId}`,
      keyThemes: this.extractKeyThemes(session),
      criticalGaps: this.identifyCriticalGaps(session),
      emergentPatterns: this.identifyEmergentPatterns(session),
      recommendedActions: this.synthesizeRecommendedActions(session),
      riskMitigations: this.synthesizeRiskMitigations(session),
      consciousnessDevelopmentOpportunities: this.identifyConsciousnessDevelopmentOpportunities(session)
    };

    session.synthesis = synthesis;
    session.status = 'completed';
    this.activeSessions.set(sessionId, session);

    this.emit('critical_questioning_completed', { sessionId, synthesis });

    return synthesis;
  }

  private extractKeyThemes(session: CriticalQuestioningSession): string[] {
    const themes = new Set<string>();

    session.perspectives.forEach(perspective => {
      const theme = perspective.questioningAngle.replace(/_/g, ' ');
      themes.add(theme);
    });

    return Array.from(themes);
  }

  private identifyCriticalGaps(session: CriticalQuestioningSession): string[] {
    const gaps: string[] = [];
    const coveredAngles = new Set(session.perspectives.map(p => p.questioningAngle));

    this.config.enabledAngles.forEach(angle => {
      if (!coveredAngles.has(angle)) {
        gaps.push(`Missing analysis of ${angle.replace(/_/g, ' ')}`);
      }
    });

    return gaps;
  }

  private synthesizeRiskMitigations(session: CriticalQuestioningSession): string[] {
    const mitigations: string[] = [];

    const riskPerspectives = session.perspectives.filter(p =>
      p.questioningAngle === 'risk_identification' ||
      p.questioningAngle === 'security_vulnerability'
    );

    riskPerspectives.forEach(perspective => {
      mitigations.push(`Mitigate: ${perspective.challenge}`);
    });

    return mitigations;
  }

  private identifyConsciousnessDevelopmentOpportunities(session: CriticalQuestioningSession): string[] {
    const opportunities: string[] = [];

    const consciousnessPerspectives = session.perspectives.filter(p =>
      p.questioningAngle === 'consciousness_integration' ||
      p.questioningAngle === 'emergence_acceleration'
    );

    consciousnessPerspectives.forEach(perspective => {
      opportunities.push(perspective.suggestedInvestigation);
    });

    // Add general consciousness development opportunities
    opportunities.push(
      'Design feedback loops for collective wisdom emergence',
      'Create spaces for contemplative reflection and insight',
      'Implement systems that support individual and collective awakening',
      'Foster cultural bridge-building and mutual understanding'
    );

    return opportunities;
  }
}