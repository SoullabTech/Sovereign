/**
 * Safe Unified Core - Internal Complexity Architecture
 * 
 * Replaces DaimonicCore with safe internal complexity recognition
 * that maintains reality boundaries and internal attribution.
 */

import { logger } from "../utils/logger";
import { InternalComplexityService } from '../services/InternalComplexityService';
import { SafeNarrativeService, SafeResponse } from '../services/SafeNarrativeService';
import { 
  InternalComplexityDetected, 
  InternalAspect, 
  ElementalQualities,
  SharedHumanExperiences 
} from '../types/internalComplexity';

// Safe context without external attribution
export interface SafeContext {
  userId: string;
  sessionId?: string;
  currentPhase: string;           // Personal development phase
  primaryQuality: string;         // Dominant internal quality (not element)
  state: string;                  // Current state (calm/exploring/integrating)
  sessionCount: number;
  previousInteractions: number;
  supportLevel: 'low' | 'medium' | 'high';  // Available support system
}

// Safe thresholds without dangerous concepts
export interface SafeThresholds {
  complexity_readiness: number;     // 0-1: How much complexity user can handle
  safety_level: 'green' | 'yellow' | 'red';  // Safety assessment
  support_level: number;            // 0-1: Available support systems
  grounding_needed: boolean;        // Immediate grounding required
  professional_referral: boolean;  // Needs professional support
}

// Safe agent configuration (no external attribution)
export interface SafeAgentConfig {
  id: string;
  name: string;
  approach: string;               // Communication approach
  strengths: string[];            // What they're good at
  limitations: string[];          // What they avoid or can't do
  supportStyle: string;           // How they offer support
  qualityAffinity: string;        // Which internal quality they work with
  complexity_comfort: number;     // 0-1: How complex they get
}

// Safe event (no external attribution)
export interface SafeEvent {
  id: string;
  timestamp: string;
  context: SafeContext;
  internalAspect: InternalAspect;
  complexity?: any;               // Complexity assessment
  strategy: SafeStrategy;
  sharedPattern?: SharedPattern;  // What can be shared with collective
}

// Safe processing strategy
export interface SafeStrategy {
  mode: 'supportive' | 'exploratory' | 'integrative' | 'grounding' | 'referral';
  approach: 'gentle' | 'direct' | 'careful' | 'emergency';
  persist: boolean;               // Store for continuity
  ground: boolean;                // Include grounding
  refer: boolean;                 // Professional referral
  agent_selection: string[];      // Which support approaches
  reasoning: string[];
}

// Safe shared pattern (no external attribution)
export interface SharedPattern {
  theme: string;                  // Human theme like "navigating change"
  commonality: string;            // What makes this relatable
  support_type: string;           // Type of support helpful
  prevalence: 'common' | 'occasional' | 'rare';
  sharing_scope: 'private' | 'collective' | 'public';
}

// Safe unified response
export interface SafeUnifiedResponse {
  // What gets delivered to user
  primary_message: string;
  support_voices: Array<{
    agent_id: string;
    message: string;
    tone: string;
    offers_practice: boolean;
  }>;
  
  // UI state instructions  
  ui_state: {
    complexity_level: number;
    visual_theme: string;
    show_multiple_perspectives: boolean;
    show_human_connection: boolean;
    requires_grounding: boolean;
  };
  
  // Progressive disclosure content (safe)
  perspective_layer?: {
    viewpoints: string[];
    reflections: string[];
    approaches: string[];
    incomplete_understandings: string[];
  };
  
  support_layer?: {
    grounding_practices: string[];
    connection_suggestions: string[];
    reality_anchors: string[];
    professional_resources?: string[];
  };
  
  // System metadata
  processing_meta: {
    strategy: SafeStrategy;
    thresholds: SafeThresholds;
    event_id?: string;
    safety_interventions: string[];
    reality_anchors: string[];  // Always included
  };
}

/**
 * Safe Unified Core - Internal complexity recognition without external attribution
 */
export class SafeUnifiedCore {
  private complexityService = new InternalComplexityService();
  private narrativeService = new SafeNarrativeService();
  
  // Safe configuration stores
  private agentConfigs: Map<string, SafeAgentConfig> = new Map();
  private userThresholds: Map<string, SafeThresholds> = new Map();
  private eventStream: SafeEvent[] = [];
  private userMemories: Map<string, SafeEvent[]> = new Map();

  constructor() {
    this.loadSafeAgentConfigurations();
    logger.info("Safe Unified Core initialized - internal complexity architecture active");
  }

  /**
   * Safe entry point for all complexity processing
   */
  async process(
    userInput: string,
    context: SafeContext
  ): Promise<SafeUnifiedResponse> {
    const startTime = Date.now();

    // 1. Safety assessment (priority one)
    const thresholds = await this.evaluateSafeThresholds(context.userId, context);

    // 2. Emergency response for red safety
    if (thresholds.safety_level === 'red') {
      return this.createEmergencyResponse(userInput, context, thresholds);
    }

    // 3. Internal complexity recognition (no external attribution)
    const internalAspect = await this.complexityService.recognizeInternalPatterns(
      userInput, context
    );

    // 4. Safe strategy decision
    const strategy = await this.decideSafeStrategy(internalAspect, context, thresholds);

    // 5. Safe agent selection (support approaches, not entities)
    const selectedAgents = this.selectSafeAgents(strategy, thresholds, context.primaryQuality);

    // 6. Safe response generation with reality anchoring
    const response = await this.generateSafeUnifiedResponse(
      userInput,
      internalAspect,
      strategy,
      selectedAgents,
      context,
      thresholds
    );

    // 7. Safe event handling (if appropriate)
    if (strategy.persist && thresholds.safety_level === 'green') {
      const event = await this.createAndStreamSafeEvent(
        userInput, context, internalAspect, strategy, response
      );
      response.processing_meta.event_id = event.id;
    }

    // 8. Update user state safely
    this.updateUserStateSafely(context.userId, internalAspect, strategy, thresholds);

    logger.info("Safe complexity processing complete", {
      userId: context.userId.substring(0, 8) + '...',
      strategy: strategy.mode,
      latency: Date.now() - startTime,
      safety_level: thresholds.safety_level,
      agents_activated: selectedAgents.length
    });

    return response;
  }

  /**
   * Safe threshold evaluation with reality checking
   */
  private async evaluateSafeThresholds(
    userId: string,
    context: SafeContext
  ): Promise<SafeThresholds> {
    const existing = this.userThresholds.get(userId);
    const userHistory = this.userMemories.get(userId) || [];
    
    // Base complexity readiness from healthy indicators
    let complexity_readiness = 0.3; // Conservative start
    if (context.sessionCount > 5) complexity_readiness += 0.1;
    if (context.supportLevel === 'high') complexity_readiness += 0.2;
    if (userHistory.filter(e => e.strategy.mode === 'integrative').length > 3) {
      complexity_readiness += 0.2;
    }
    if (existing) {
      complexity_readiness = Math.max(complexity_readiness, existing.complexity_readiness);
    }

    // Safety assessment from concerning indicators
    let safety_level: 'green' | 'yellow' | 'red' = 'green';
    const recentConcerns = userHistory.slice(-3).some(e => 
      e.strategy.mode === 'grounding' || e.strategy.mode === 'referral'
    );
    const rapidEscalation = userHistory.slice(-5).filter(e => 
      e.context.state === 'threshold' || e.context.state === 'crisis'
    ).length > 2;
    const supportDeficit = context.supportLevel === 'low';

    if (recentConcerns && supportDeficit) {
      safety_level = 'yellow';
    }
    if (rapidEscalation && supportDeficit) {
      safety_level = 'red';
    }

    // Support level assessment
    let support_level = context.supportLevel === 'high' ? 0.8 : 
                       context.supportLevel === 'medium' ? 0.5 : 0.2;

    const thresholds: SafeThresholds = {
      complexity_readiness: Math.min(1.0, complexity_readiness),
      safety_level,
      support_level,
      grounding_needed: safety_level !== 'green' || context.state === 'exploring',
      professional_referral: safety_level === 'red' || 
                            (safety_level === 'yellow' && support_level < 0.4)
    };

    this.userThresholds.set(userId, thresholds);
    return thresholds;
  }

  /**
   * Safe strategy decision without external attribution
   */
  private async decideSafeStrategy(
    internalAspect: InternalAspect,
    context: SafeContext,
    thresholds: SafeThresholds
  ): Promise<SafeStrategy> {
    const reasoning: string[] = [];

    // Safety first
    if (thresholds.safety_level === 'red') {
      reasoning.push('Safety concerns - activating emergency support');
      return {
        mode: 'referral',
        approach: 'emergency',
        persist: false,
        ground: true,
        refer: true,
        agent_selection: ['crisis_support'],
        reasoning
      };
    }

    // Professional referral for yellow with low support
    if (thresholds.safety_level === 'yellow' && thresholds.professional_referral) {
      reasoning.push('Complex situation with limited support - recommending professional help');
      return {
        mode: 'referral',
        approach: 'careful',
        persist: true,
        ground: true,
        refer: true,
        agent_selection: ['referral_specialist'],
        reasoning
      };
    }

    // Grounding for high intensity or low support
    if (thresholds.grounding_needed || thresholds.support_level < 0.3) {
      reasoning.push('High complexity or limited support - prioritizing grounding');
      return {
        mode: 'grounding',
        approach: 'gentle',
        persist: true,
        ground: true,
        refer: false,
        agent_selection: ['grounding_guide'],
        reasoning
      };
    }

    // Exploratory for stable users with good support
    if (thresholds.safety_level === 'green' && thresholds.support_level > 0.6) {
      reasoning.push('Stable situation with good support - offering exploration');
      return {
        mode: 'exploratory',
        approach: 'direct',
        persist: true,
        ground: false,
        refer: false,
        agent_selection: this.getExploratoryAgents(context.primaryQuality),
        reasoning
      };
    }

    // Default: supportive approach
    reasoning.push('Standard supportive approach with internal focus');
    return {
      mode: 'supportive',
      approach: 'gentle',
      persist: true,
      ground: false,
      refer: false,
      agent_selection: this.getSupportiveAgents(context.primaryQuality),
      reasoning
    };
  }

  /**
   * Safe agent selection (support approaches, not entities)
   */
  private selectSafeAgents(
    strategy: SafeStrategy,
    thresholds: SafeThresholds,
    primaryQuality: string
  ): SafeAgentConfig[] {
    const maxAgents = thresholds.complexity_readiness > 0.7 ? 3 : 
                      thresholds.complexity_readiness > 0.4 ? 2 : 1;

    const candidates: SafeAgentConfig[] = [];

    // Get agents based on strategy
    for (const agentId of strategy.agent_selection) {
      const config = this.agentConfigs.get(agentId);
      if (config) candidates.push(config);
    }

    // Filter by complexity comfort and safety
    const filtered = candidates.filter(agent => 
      agent.complexity_comfort <= thresholds.complexity_readiness + 0.2 &&
      (thresholds.safety_level === 'green' || agent.limitations.includes('crisis_aware'))
    );

    return filtered.slice(0, maxAgents);
  }

  /**
   * Safe response generation with mandatory reality anchoring
   */
  private async generateSafeUnifiedResponse(
    userInput: string,
    internalAspect: InternalAspect,
    strategy: SafeStrategy,
    agents: SafeAgentConfig[],
    context: SafeContext,
    thresholds: SafeThresholds
  ): Promise<SafeUnifiedResponse> {
    
    // Generate safe response through narrative service
    const safeResponse = await this.narrativeService.generateSafeResponse(
      userInput, internalAspect, context, thresholds.complexity_readiness
    );

    // Generate agent voices (support approaches)
    const supportVoices = await Promise.all(
      agents.map(agent => this.generateSafeAgentVoice(
        agent, userInput, internalAspect, strategy, context
      ))
    );

    // Use safe response as primary message
    const primaryMessage = safeResponse.primaryMessage;

    // Determine UI state with safety priority
    const ui_state = {
      complexity_level: thresholds.complexity_readiness,
      visual_theme: this.getSafeVisualTheme(strategy, thresholds),
      show_multiple_perspectives: thresholds.complexity_readiness > 0.4 && thresholds.safety_level === 'green',
      show_human_connection: true, // Always encourage human connection
      requires_grounding: strategy.ground || thresholds.grounding_needed
    };

    // Generate perspective layer (safe)
    const perspective_layer = ui_state.show_multiple_perspectives ? 
      this.createSafePerspectiveLayer(internalAspect, agents, safeResponse.perspectives) : undefined;
    
    // Generate support layer (always included)
    const support_layer = this.createSupportLayer(
      safeResponse, strategy, thresholds
    );

    // Mandatory safety interventions and reality anchors
    const safety_interventions: string[] = [];
    const reality_anchors: string[] = [safeResponse.realityAnchor];
    
    if (strategy.ground) {
      safety_interventions.push(safeResponse.groundingPractice);
    }
    if (strategy.refer) {
      safety_interventions.push("Professional support recommended");
    }
    if (thresholds.safety_level === 'yellow') {
      safety_interventions.push("Enhanced safety monitoring");
      reality_anchors.push("These are your internal experiences and thoughts");
    }

    // Always add connection prompt
    safety_interventions.push(safeResponse.connectionPrompt);

    return {
      primary_message: primaryMessage,
      support_voices: supportVoices,
      ui_state,
      perspective_layer,
      support_layer,
      processing_meta: {
        strategy,
        thresholds,
        safety_interventions,
        reality_anchors
      }
    };
  }

  /**
   * Emergency response for red safety level
   */
  private createEmergencyResponse(
    userInput: string,
    context: SafeContext,
    thresholds: SafeThresholds
  ): SafeUnifiedResponse {
    return {
      primary_message: "I'm concerned about what you're sharing and want to make sure you're safe. Let's focus on your immediate well-being.",
      support_voices: [{
        agent_id: 'crisis_support',
        message: "Your safety is the most important thing right now. You don't have to face this alone.",
        tone: 'emergency_calm',
        offers_practice: true
      }],
      ui_state: {
        complexity_level: 0.1,
        visual_theme: 'crisis_support',
        show_multiple_perspectives: false,
        show_human_connection: true,
        requires_grounding: true
      },
      support_layer: {
        grounding_practices: [
          "Take three deep breaths right now",
          "Feel your feet on the ground",
          "You are safe in this moment"
        ],
        connection_suggestions: [
          "Contact a crisis helpline: 988 (Suicide & Crisis Lifeline)",
          "Reach out to a trusted friend or family member",
          "Contact emergency services if in immediate danger (911)"
        ],
        reality_anchors: [
          "You are a person experiencing difficult thoughts and feelings",
          "This is a conversation and you are in control of your choices",
          "Professional help is available and can make a real difference"
        ],
        professional_resources: [
          "National Suicide Prevention Lifeline: 988",
          "Crisis Text Line: Text HOME to 741741",
          "National Alliance on Mental Illness: 1-800-950-NAMI"
        ]
      },
      processing_meta: {
        strategy: {
          mode: 'referral',
          approach: 'emergency',
          persist: false,
          ground: true,
          refer: true,
          agent_selection: ['crisis_support'],
          reasoning: ['Crisis indicators detected - emergency protocols activated']
        },
        thresholds,
        safety_interventions: [
          'Crisis support activated',
          'Professional resources provided',
          'Immediate grounding practices offered'
        ],
        reality_anchors: [
          'Crisis response focuses on immediate safety and professional support'
        ]
      }
    };
  }

  /**
   * Load safe agent configurations (support approaches, not entities)
   */
  private loadSafeAgentConfigurations(): void {
    const configs: SafeAgentConfig[] = [
      {
        id: 'gentle_support',
        name: 'Gentle Support',
        approach: 'warm and accepting',
        strengths: ['emotional holding', 'validation', 'comfort'],
        limitations: ['complex analysis', 'confrontation', 'crisis intervention'],
        supportStyle: 'nurturing and unconditionally accepting',
        qualityAffinity: 'stability',
        complexity_comfort: 0.4
      },
      {
        id: 'thoughtful_guide',
        name: 'Thoughtful Guide',
        approach: 'careful and precise',
        strengths: ['multiple perspectives', 'careful analysis', 'clear communication'],
        limitations: ['emotional intensity', 'crisis situations', 'rapid response'],
        supportStyle: 'offering different viewpoints with care',
        qualityAffinity: 'clarity',
        complexity_comfort: 0.8
      },
      {
        id: 'grounding_guide',
        name: 'Grounding Guide',
        approach: 'steady and calming',
        strengths: ['stability', 'grounding practices', 'safety'],
        limitations: ['complex exploration', 'abstract concepts', 'high intensity'],
        supportStyle: 'providing stability and practical grounding',
        qualityAffinity: 'stability',
        complexity_comfort: 0.3
      },
      {
        id: 'integration_support',
        name: 'Integration Support',
        approach: 'holistic and wise',
        strengths: ['synthesis', 'wisdom perspective', 'balance'],
        limitations: ['crisis situations', 'simple problems', 'quick fixes'],
        supportStyle: 'helping integrate different aspects of experience',
        qualityAffinity: 'integration',
        complexity_comfort: 0.9
      },
      {
        id: 'crisis_support',
        name: 'Crisis Support',
        approach: 'immediate and stabilizing',
        strengths: ['crisis response', 'safety focus', 'professional referral'],
        limitations: ['complex exploration', 'non-crisis situations'],
        supportStyle: 'immediate support and professional connection',
        qualityAffinity: 'stability',
        complexity_comfort: 0.2
      }
    ];

    for (const config of configs) {
      this.agentConfigs.set(config.id, config);
    }
  }

  // Helper methods (safe implementations)

  private getExploratoryAgents(primaryQuality: string): string[] {
    const qualityMap = {
      passion: ['thoughtful_guide', 'integration_support'],
      flow: ['gentle_support', 'integration_support'],
      stability: ['grounding_guide', 'thoughtful_guide'],
      clarity: ['thoughtful_guide', 'integration_support'],
      integration: ['integration_support', 'thoughtful_guide']
    };
    return qualityMap[primaryQuality] || ['gentle_support', 'thoughtful_guide'];
  }

  private getSupportiveAgents(primaryQuality: string): string[] {
    return ['gentle_support', 'grounding_guide'];
  }

  private async generateSafeAgentVoice(
    agent: SafeAgentConfig,
    input: string,
    internalAspect: InternalAspect,
    strategy: SafeStrategy,
    context: SafeContext
  ): Promise<{ agent_id: string; message: string; tone: string; offers_practice: boolean }> {
    
    let message = "";
    
    // Generate message based on agent's approach (always internal attribution)
    switch (agent.supportStyle) {
      case 'nurturing and unconditionally accepting':
        message = "I hear the complexity you're experiencing. It's completely human to navigate these internal tensions.";
        break;
      case 'offering different viewpoints with care':
        message = "There are several ways to understand what you're going through internally. Let's explore some possibilities.";
        break;
      case 'providing stability and practical grounding':
        message = "Let's ground this experience in your body and breath. What you're feeling is real and manageable.";
        break;
      case 'helping integrate different aspects of experience':
        message = "These different parts of yourself are trying to communicate. Integration is possible.";
        break;
      case 'immediate support and professional connection':
        message = "Your safety and well-being are most important. Let's connect you with appropriate professional support.";
        break;
      default:
        message = `I'm here to support you through this internal complexity.`;
    }

    return {
      agent_id: agent.id,
      message,
      tone: agent.approach,
      offers_practice: strategy.ground && agent.strengths.includes('grounding practices')
    };
  }

  private getSafeVisualTheme(strategy: SafeStrategy, thresholds: SafeThresholds): string {
    if (thresholds.safety_level === 'red') return 'crisis_support';
    if (thresholds.safety_level === 'yellow') return 'careful_support';
    if (strategy.mode === 'grounding') return 'grounding_focus';
    if (strategy.mode === 'exploratory') return 'gentle_exploration';
    return 'supportive_presence';
  }

  private createSafePerspectiveLayer(
    internalAspect: InternalAspect, 
    agents: SafeAgentConfig[],
    perspectives: string[]
  ) {
    return {
      viewpoints: perspectives,
      reflections: [
        "What feels most true for you in this situation?",
        "How does your body respond when you consider this?",
        "What would self-compassion look like here?"
      ],
      approaches: agents.map(a => a.approach),
      incomplete_understandings: [
        "I can only see part of your experience",
        "Your full complexity is beyond what any single perspective can capture"
      ]
    };
  }

  private createSupportLayer(
    safeResponse: SafeResponse,
    strategy: SafeStrategy, 
    thresholds: SafeThresholds
  ) {
    const layer = {
      grounding_practices: [safeResponse.groundingPractice],
      connection_suggestions: [safeResponse.connectionPrompt],
      reality_anchors: [safeResponse.realityAnchor]
    };

    // Add professional resources if needed
    if (strategy.refer || thresholds.professional_referral) {
      layer['professional_resources'] = [
        "Consider speaking with a licensed therapist or counselor",
        "Your doctor can provide referrals to mental health professionals",
        "Crisis support: 988 (Suicide & Crisis Lifeline)"
      ];
    }

    return layer;
  }

  // Event handling (safe)
  private async createAndStreamSafeEvent(
    input: string,
    context: SafeContext,
    internalAspect: InternalAspect,
    strategy: SafeStrategy,
    response: SafeUnifiedResponse
  ): Promise<SafeEvent> {
    const event: SafeEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      context,
      internalAspect,
      strategy,
      sharedPattern: this.createSafeSharedPattern(internalAspect, context, strategy)
    };

    this.eventStream.push(event);
    
    const userEvents = this.userMemories.get(context.userId) || [];
    userEvents.push(event);
    this.userMemories.set(context.userId, userEvents.slice(-50));

    return event;
  }

  private createSafeSharedPattern(
    internalAspect: InternalAspect,
    context: SafeContext,
    strategy: SafeStrategy
  ): SharedPattern {
    return {
      theme: this.extractHumanTheme(internalAspect),
      commonality: "Many people experience similar internal complexity",
      support_type: strategy.mode,
      prevalence: 'common',
      sharing_scope: strategy.mode === 'referral' ? 'private' : 'collective'
    };
  }

  private updateUserStateSafely(
    userId: string,
    internalAspect: InternalAspect,
    strategy: SafeStrategy,
    thresholds: SafeThresholds
  ): void {
    // Only positive evolution tracking, no complexity escalation
    if (strategy.mode === 'integrative' && thresholds.safety_level === 'green') {
      const current = thresholds.complexity_readiness;
      thresholds.complexity_readiness = Math.min(0.9, current + 0.03); // Slower, safer progression
      this.userThresholds.set(userId, thresholds);
    }
  }

  private extractHumanTheme(internalAspect: InternalAspect): string {
    if (internalAspect.internalTension.includes('growth')) return 'navigating personal growth';
    if (internalAspect.internalTension.includes('tension')) return 'working through internal conflicts';
    if (internalAspect.internalTension.includes('change')) return 'processing life changes';
    return 'exploring self-understanding';
  }

  // Public API methods (safe)
  public getSharedHumanThemes(): {
    common_themes: string[];
    support_types: Record<string, number>;
    collective_wellbeing: string;
  } {
    const recentEvents = this.eventStream.slice(-50);
    const themes: Record<string, number> = {};
    const supportTypes: Record<string, number> = {};
    
    for (const event of recentEvents) {
      if (event.sharedPattern && event.sharedPattern.sharing_scope === 'collective') {
        themes[event.sharedPattern.theme] = (themes[event.sharedPattern.theme] || 0) + 1;
        supportTypes[event.sharedPattern.support_type] = (supportTypes[event.sharedPattern.support_type] || 0) + 1;
      }
    }

    return {
      common_themes: Object.keys(themes).slice(0, 5),
      support_types: supportTypes,
      collective_wellbeing: "Many people are navigating similar challenges - you're not alone"
    };
  }

  public getUserJourney(userId: string): {
    session_count: number;
    current_thresholds: SafeThresholds;
    support_trajectory: string;
    safety_status: string;
  } {
    const events = this.userMemories.get(userId) || [];
    const thresholds = this.userThresholds.get(userId) || {
      complexity_readiness: 0.3,
      safety_level: 'green' as const,
      support_level: 0.5,
      grounding_needed: false,
      professional_referral: false
    };

    let trajectory = 'Beginning support journey';
    if (events.length > 10) {
      const recentSupport = events.slice(-5).map(e => e.strategy.mode);
      if (recentSupport.includes('integrative')) trajectory = 'Growing integration';
      else if (recentSupport.includes('exploratory')) trajectory = 'Active exploration';
      else if (recentSupport.includes('grounding')) trajectory = 'Building stability';
      else trajectory = 'Ongoing support';
    }

    return {
      session_count: events.length,
      current_thresholds: thresholds,
      support_trajectory: trajectory,
      safety_status: `${thresholds.safety_level} - appropriate support level`
    };
  }
}

// Export singleton
export const safeUnifiedCore = new SafeUnifiedCore();