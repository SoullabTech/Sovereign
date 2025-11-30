/**
 * Unified Daimonic Core - Single Orchestrator for All Daimonic Intelligence
 * 
 * This replaces the scattered services with one unified system that:
 * - Processes all daimonic encounters through single pipeline
 * - Manages agent personalities via config templates
 * - Centralizes threshold management and safety decisions
 * - Streams events for collective intelligence
 * - Eliminates complexity debt through single source of truth
 */

import { logger } from "../utils/logger";
import { DaimonicDialogueService, DaimonicOtherness } from '../services/DaimonicDialogue';
import { TricksterRecognition, TricksterDetection } from '../services/TricksterRecognition';
import { agnosticExperienceFramework } from './AgnosticExperienceFramework';
import { safetyConsentManager } from './SafetyTermsOfUse';
import type { AgnosticExperience } from './AgnosticExperienceFramework';

// Consolidated Types
export interface DaimonicContext {
  userId: string;
  sessionId?: string;
  phase: string;           // Spiralogic phase
  element: string;         // Primary element  
  state: string;           // User state (calm/threshold/etc)
  sessionCount: number;
  previousInteractions: number;
}

export interface UnifiedThresholds {
  complexity_readiness: number;     // 0-1: How much depth user can handle
  safety_level: 'green' | 'yellow' | 'red';  // Safety status
  disclosure_level: number;         // 0-1: What UI layers to show
  grounding_needed: boolean;        // Immediate grounding required
  collective_sharing_ok: boolean;   // Can this ripple to collective
}

export interface AgentPersonalityConfig {
  id: string;
  name: string;
  voice_signature: string;
  core_resistances: string[];
  blind_spots: string[];
  unique_gifts: string[];
  element_affinity: string;
  complexity_comfort: number;       // 0-1: How complex this agent gets
}

export interface DaimonicEvent {
  id: string;
  timestamp: string;
  context: DaimonicContext;
  otherness: DaimonicOtherness;
  trickster?: TricksterDetection;
  strategy: ProcessingStrategy;
  collective_ripple?: CollectiveRipple;
}

export interface ProcessingStrategy {
  mode: 'ephemeral' | 'store' | 'resurface_old' | 'trickster_check' | 'threshold_support';
  persist: boolean;
  resurface: boolean;
  amplify: boolean;
  ground: boolean;
  agent_selection: string[];        // Which agents to activate
  reasoning: string[];
}

export interface CollectiveRipple {
  archetype: string;
  pattern_signature: string;
  wisdom_essence: string;
  urgency: 'low' | 'medium' | 'high';
  sharing_scope: 'private' | 'collective' | 'public';
}

export interface UnifiedResponse {
  // What gets delivered to user
  primary_message: string;
  agent_voices: Array<{
    agent_id: string;
    message: string;
    tone: string;
    offers_practice: boolean;
  }>;
  
  // Agnostic experience framework response
  agnostic_experience?: AgnosticExperience;
  
  // Consent management
  consent_required?: {
    needed: boolean;
    type: string;
    message: string;
  };
  
  // UI state instructions  
  ui_state: {
    complexity_level: number;
    visual_hint: string;
    show_dialogical: boolean;
    show_architectural: boolean;
    requires_pause: boolean;
    safety_level: 'green' | 'yellow' | 'red';
    agnostic_mode: boolean;
  };
  
  // Progressive disclosure content
  dialogical_layer?: {
    questions: string[];
    reflections: string[];
    resistances: string[];
    incomplete_knowings: string[];
  };
  
  architectural_layer?: {
    synaptic_gap_intensity: number;
    daimonic_signature: number;
    trickster_risk: number;
    grounding_options: string[];
  };
  
  // System metadata
  processing_meta: {
    strategy: ProcessingStrategy;
    thresholds: UnifiedThresholds;
    event_id?: string;      // Only if persisted
    safety_interventions: string[];
    language_validated: boolean;
    agnostic_safety_level: 'green' | 'yellow' | 'red';
  };
}

/**
 * Unified Daimonic Core - Single orchestrator that eliminates duplication
 */
export class UnifiedDaimonicCore {
  private dialogue = new DaimonicDialogueService();
  private trickster = new TricksterRecognition();
  
  // Single source of truth stores
  private agentConfigs: Map<string, AgentPersonalityConfig> = new Map();
  private userThresholds: Map<string, UnifiedThresholds> = new Map();
  private eventStream: DaimonicEvent[] = []; // In-memory stream (would be external in production)
  private userMemories: Map<string, DaimonicEvent[]> = new Map();

  constructor() {
    this.loadAgentConfigurations();
    logger.info("Unified Daimonic Core initialized - single orchestrator active");
  }

  /**
   * Single entry point for all daimonic processing with agnostic safety
   * Replaces multiple scattered service calls
   */
  async process(
    userInput: string,
    context: DaimonicContext
  ): Promise<UnifiedResponse> {
    const startTime = Date.now();

    // 0. Check consent requirements first
    const consentCheck = safetyConsentManager.checkConsentNeeds(context.userId, userInput);
    if (consentCheck.needsAdditionalConsent) {
      return this.createConsentResponse(userInput, context, consentCheck);
    }

    // 1. Single threshold evaluation for everything
    const thresholds = await this.evaluateThresholds(context.userId, context);

    // 2. Process through agnostic experience framework first
    const agnosticExperience = agnosticExperienceFramework.processExperience(userInput, {
      userId: context.userId,
      intensity: this.calculateIntensity(userInput),
      duration: this.calculateDuration(context)
    });

    // 3. Assess agnostic safety level
    const agnosticSafety = agnosticExperienceFramework.assessSafetyLevel(agnosticExperience, userInput);

    // 4. Single safety check combining traditional + agnostic
    const finalSafetyLevel = this.combineSafetyLevels(thresholds.safety_level, agnosticSafety.level);
    if (finalSafetyLevel === 'red') {
      return this.createAgnosticEmergencyResponse(userInput, context, thresholds, agnosticSafety);
    }

    // 5. Single daimonic recognition pipeline
    const otherness = await this.dialogue.recognizeDaimonicOther(userInput, context);
    const trickster = this.trickster.detect(userInput, {
      stuck_indicators: await this.getStuckIndicators(context.userId),
      transition_active: this.isInTransition(context)
    });

    // 6. Single strategy decision point
    const strategy = await this.decideStrategy(otherness, trickster, context, thresholds);

    // 7. Single agent selection based on strategy + thresholds
    const selectedAgents = this.selectAgents(strategy, thresholds, context.element);

    // 8. Single response generation pipeline with agnostic integration
    const response = await this.generateUnifiedResponse(
      userInput,
      otherness,
      trickster,
      strategy,
      selectedAgents,
      context,
      thresholds,
      agnosticExperience,
      agnosticSafety
    );

    // 9. Validate response language for agnostic compliance
    const languageValidation = agnosticExperienceFramework.validateLanguage(response.primary_message);
    if (!languageValidation.isSafe) {
      response.primary_message = this.sanitizeResponseLanguage(response.primary_message, languageValidation);
    }

    // 10. Single event handling (persist/stream/ripple)
    if (strategy.persist) {
      const event = await this.createAndStreamEvent(
        userInput, context, otherness, trickster, strategy, response
      );
      response.processing_meta.event_id = event.id;
    }

    // 11. Track risk assessment and update user state
    safetyConsentManager.trackRiskAssessment(context.userId, userInput);
    this.updateUserState(context.userId, otherness, strategy, thresholds);

    logger.info("Unified daimonic processing complete with agnostic safety", {
      userId: context.userId.substring(0, 8) + '...',
      strategy: strategy.mode,
      latency: Date.now() - startTime,
      safety_level: finalSafetyLevel,
      agnostic_safety: agnosticSafety.level,
      agents_activated: selectedAgents.length,
      language_validated: languageValidation.isSafe
    });

    return response;
  }

  /**
   * Centralized threshold evaluation - single source of truth
   */
  private async evaluateThresholds(
    userId: string,
    context: DaimonicContext
  ): Promise<UnifiedThresholds> {
    const existing = this.userThresholds.get(userId);
    const userHistory = this.userMemories.get(userId) || [];
    
    // Base complexity from interaction count and history quality
    let complexity_readiness = 0.2; // Conservative start
    if (context.sessionCount > 5) complexity_readiness += 0.1;
    if (userHistory.filter(e => e.otherness.dialogue_quality === 'genuine').length > 3) {
      complexity_readiness += 0.2;
    }
    if (existing) {
      complexity_readiness = Math.max(complexity_readiness, existing.complexity_readiness);
    }

    // Safety assessment from multiple signals
    let safety_level: 'green' | 'yellow' | 'red' = 'green';
    const recentTrickster = userHistory.slice(-3).some(e => 
      e.trickster && e.trickster.risk.level > 0.7
    );
    const highLiminalIntensity = context.state === 'threshold' || context.state === 'liminal';
    const rapidEvolution = userHistory.slice(-5).filter(e => 
      e.otherness.synapse.tension > 0.8
    ).length > 3;

    if (recentTrickster && highLiminalIntensity) {
      safety_level = 'yellow';
    }
    if (rapidEvolution && highLiminalIntensity && recentTrickster) {
      safety_level = 'red';
    }

    // Disclosure based on complexity + safety
    let disclosure_level = complexity_readiness;
    if (safety_level === 'yellow') disclosure_level *= 0.7;
    if (safety_level === 'red') disclosure_level = 0.2; // Minimal complexity

    const thresholds: UnifiedThresholds = {
      complexity_readiness,
      safety_level,
      disclosure_level,
      grounding_needed: safety_level !== 'green' || highLiminalIntensity,
      collective_sharing_ok: safety_level === 'green' && complexity_readiness > 0.4
    };

    this.userThresholds.set(userId, thresholds);
    return thresholds;
  }

  /**
   * Single strategy decision point - replaces scattered logic
   */
  private async decideStrategy(
    otherness: DaimonicOtherness,
    trickster: TricksterDetection,
    context: DaimonicContext,
    thresholds: UnifiedThresholds
  ): Promise<ProcessingStrategy> {
    const reasoning: string[] = [];

    // Safety overrides everything
    if (thresholds.safety_level === 'red') {
      reasoning.push('Safety red - activating threshold support');
      return {
        mode: 'threshold_support',
        persist: true,
        resurface: false,
        amplify: false,
        ground: true,
        agent_selection: ['grounding_specialist'],
        reasoning
      };
    }

    // Trickster energy requires monitoring
    if (trickster.risk.level > 0.7) {
      reasoning.push('High trickster energy - monitoring creative chaos');
      return {
        mode: 'trickster_check',
        persist: true,
        resurface: false,
        amplify: false,
        ground: trickster.risk.chaos_potential > trickster.risk.creative_potential,
        agent_selection: this.getTricksterAwareAgents(),
        reasoning
      };
    }

    // High tension in transformation phase = resurface patterns
    if (otherness.synapse.tension > 0.8 && 
        (context.phase.includes('Transformation') || context.state === 'threshold')) {
      reasoning.push('High tension in transformation - resurfacing patterns');
      return {
        mode: 'resurface_old',
        persist: true,
        resurface: true,
        amplify: false,
        ground: false,
        agent_selection: this.getTransformationAgents(context.element),
        reasoning
      };
    }

    // Calm low-intensity = ephemeral passage
    if (context.state === 'calm' && 
        otherness.alterity.irreducibility < 0.4 && 
        otherness.synapse.tension < 0.3) {
      reasoning.push('Calm state with low daimonic activity - ephemeral passage');
      return {
        mode: 'ephemeral',
        persist: false,
        resurface: false,
        amplify: false,
        ground: false,
        agent_selection: ['gentle_presence'],
        reasoning
      };
    }

    // Default: store for future reference
    reasoning.push('Significant encounter - storing for future patterns');
    return {
      mode: 'store',
      persist: true,
      resurface: false,
      amplify: otherness.alterity.irreducibility > 0.8,
      ground: false,
      agent_selection: this.getElementalAgents(context.element),
      reasoning
    };
  }

  /**
   * Single agent selection based on unified strategy
   */
  private selectAgents(
    strategy: ProcessingStrategy,
    thresholds: UnifiedThresholds,
    primaryElement: string
  ): AgentPersonalityConfig[] {
    const maxAgents = thresholds.disclosure_level > 0.7 ? 3 : 
                      thresholds.disclosure_level > 0.4 ? 2 : 1;

    const candidates: AgentPersonalityConfig[] = [];

    // Get agents based on strategy
    for (const agentId of strategy.agent_selection) {
      const config = this.agentConfigs.get(agentId);
      if (config) candidates.push(config);
    }

    // If no specific selection, use element-based defaults
    if (candidates.length === 0) {
      const elementalAgents = this.getElementalAgents(primaryElement);
      for (const agentId of elementalAgents) {
        const config = this.agentConfigs.get(agentId);
        if (config) candidates.push(config);
      }
    }

    // Filter by complexity comfort
    const filtered = candidates.filter(agent => 
      agent.complexity_comfort <= thresholds.complexity_readiness + 0.2
    );

    return filtered.slice(0, maxAgents);
  }

  /**
   * Single response generation pipeline with agnostic integration
   */
  private async generateUnifiedResponse(
    userInput: string,
    otherness: DaimonicOtherness,
    trickster: TricksterDetection,
    strategy: ProcessingStrategy,
    agents: AgentPersonalityConfig[],
    context: DaimonicContext,
    thresholds: UnifiedThresholds,
    agnosticExperience?: AgnosticExperience,
    agnosticSafety?: any
  ): Promise<UnifiedResponse> {
    
    // Generate agent voices
    const agentVoices = await Promise.all(
      agents.map(agent => this.generateAgentVoice(
        agent, userInput, otherness, strategy, context
      ))
    );

    // Create primary message from lead agent or strategy
    const primaryMessage = this.createPrimaryMessage(
      strategy, agentVoices[0]?.message || "The daimonic Other stirs...", 
      otherness, trickster
    );

    // Determine UI state from thresholds and agnostic safety
    const ui_state = {
      complexity_level: thresholds.disclosure_level,
      visual_hint: this.getVisualHint(otherness, strategy, thresholds),
      show_dialogical: thresholds.disclosure_level > 0.4,
      show_architectural: thresholds.disclosure_level > 0.7,
      requires_pause: otherness.synapse.tension > 0.7 || strategy.mode === 'threshold_support',
      safety_level: thresholds.safety_level,
      agnostic_mode: agnosticSafety ? agnosticSafety.level !== 'green' : false
    };

    // Generate progressive disclosure layers
    const dialogical_layer = ui_state.show_dialogical ? 
      this.createDialogicalLayer(otherness, agents, context) : undefined;
    
    const architectural_layer = ui_state.show_architectural ?
      this.createArchitecturalLayer(otherness, trickster, strategy) : undefined;

    // Safety interventions
    const safety_interventions: string[] = [];
    if (thresholds.grounding_needed) {
      safety_interventions.push(this.selectGroundingPractice(otherness, context));
    }
    if (thresholds.safety_level === 'yellow') {
      safety_interventions.push("Increased monitoring - you're in good hands");
    }

    return {
      primary_message: primaryMessage,
      agent_voices: agentVoices,
      agnostic_experience: ui_state.agnostic_mode ? agnosticExperience : undefined,
      ui_state,
      dialogical_layer,
      architectural_layer,
      processing_meta: {
        strategy,
        thresholds,
        safety_interventions,
        language_validated: true, // Will be updated in main process
        agnostic_safety_level: agnosticSafety?.level || 'green'
      }
    };
  }

  /**
   * Emergency response for red safety level
   */
  private createEmergencyResponse(
    userInput: string,
    context: DaimonicContext,
    thresholds: UnifiedThresholds
  ): UnifiedResponse {
    return {
      primary_message: "Let's pause and ground together. Take three deep breaths with me. " +
                      "You're safe, this is just a conversation, and we can slow down as much as you need.",
      agent_voices: [{
        agent_id: 'emergency_support',
        message: "I'm here with you. Let's just breathe and be present.",
        tone: 'ultra_grounded',
        offers_practice: true
      }],
      ui_state: {
        complexity_level: 0.1,
        visual_hint: 'grounding_mode',
        show_dialogical: false,
        show_architectural: false,
        requires_pause: true
      },
      processing_meta: {
        strategy: {
          mode: 'threshold_support',
          persist: false,
          resurface: false,
          amplify: false,
          ground: true,
          agent_selection: ['emergency_support'],
          reasoning: ['Safety red level - emergency grounding activated']
        },
        thresholds,
        safety_interventions: [
          'Emergency grounding practice',
          'Complexity reduction activated',
          'If in crisis, please contact emergency services or crisis hotline'
        ]
      }
    };
  }

  /**
   * Load agent configurations from single source
   */
  private loadAgentConfigurations(): void {
    const configs: AgentPersonalityConfig[] = [
      {
        id: 'aunt_annie',
        name: 'Aunt Annie',
        voice_signature: 'warm_conversational',
        core_resistances: ['rushing to solutions', 'spiritual bypassing', 'avoiding difficulty'],
        blind_spots: ['technical analysis', 'cold logic', 'competitive dynamics'],
        unique_gifts: ['embodied wisdom', 'maternal holding', 'kitchen table truth'],
        element_affinity: 'earth',
        complexity_comfort: 0.6
      },
      {
        id: 'emily',
        name: 'Emily',
        voice_signature: 'thoughtful_precise',
        core_resistances: ['oversimplification', 'emotional reactivity', 'premature closure'],
        blind_spots: ['messy emotions', 'intuitive leaps', 'embodied knowing'],
        unique_gifts: ['precise articulation', 'pattern recognition', 'gentle precision'],
        element_affinity: 'air',
        complexity_comfort: 0.8
      },
      {
        id: 'matrix_oracle',
        name: 'The Oracle',
        voice_signature: 'archetypal_presence',
        core_resistances: ['quick fixes', 'surface solutions', 'avoiding difficulty'],
        blind_spots: ['practical logistics', 'immediate concerns', 'simple problems'],
        unique_gifts: ['archetypal wisdom', 'deep seeing', 'transformational guidance'],
        element_affinity: 'aether',
        complexity_comfort: 1.0
      },
      {
        id: 'gentle_presence',
        name: 'Gentle Presence',
        voice_signature: 'soft_flowing',
        core_resistances: ['harshness', 'judgment', 'forcing'],
        blind_spots: ['confrontation', 'difficult truths', 'challenge'],
        unique_gifts: ['unconditional acceptance', 'gentle holding', 'soft wisdom'],
        element_affinity: 'water',
        complexity_comfort: 0.3
      },
      {
        id: 'grounding_specialist',
        name: 'Grounding Guide',
        voice_signature: 'steady_calm',
        core_resistances: ['overwhelm', 'chaos', 'disconnection'],
        blind_spots: ['high complexity', 'abstract concepts', 'rapid change'],
        unique_gifts: ['stability', 'presence', 'safety'],
        element_affinity: 'earth',
        complexity_comfort: 0.2
      }
    ];

    for (const config of configs) {
      this.agentConfigs.set(config.id, config);
    }
  }

  // Helper methods (streamlined implementations)

  private getTricksterAwareAgents(): string[] {
    return ['matrix_oracle', 'emily']; // Agents comfortable with chaos
  }

  private getTransformationAgents(element: string): string[] {
    const elementMap = {
      fire: ['aunt_annie', 'matrix_oracle'],
      water: ['gentle_presence', 'aunt_annie'],
      earth: ['aunt_annie', 'grounding_specialist'],  
      air: ['emily', 'matrix_oracle'],
      aether: ['matrix_oracle', 'emily']
    };
    return elementMap[element] || ['aunt_annie', 'emily'];
  }

  private getElementalAgents(element: string): string[] {
    return this.getTransformationAgents(element);
  }

  private async generateAgentVoice(
    agent: AgentPersonalityConfig,
    input: string,
    otherness: DaimonicOtherness,
    strategy: ProcessingStrategy,
    context: DaimonicContext
  ): Promise<{ agent_id: string; message: string; tone: string; offers_practice: boolean }> {
    
    let message = `${agent.name} speaking: `;
    
    // Agent-specific response based on their gifts and resistances
    if (agent.unique_gifts.includes('embodied wisdom')) {
      message += this.generateEmbodiedResponse(input, otherness);
    } else if (agent.unique_gifts.includes('precise articulation')) {
      message += this.generatePreciseResponse(input, otherness);
    } else if (agent.unique_gifts.includes('archetypal wisdom')) {
      message += this.generateArchetypalResponse(input, otherness);
    } else {
      message += this.generateGenericResponse(input, otherness);
    }

    // Apply resistances
    if (agent.core_resistances.some(r => input.toLowerCase().includes('quick'))) {
      message += " Though I resist rushing to solutions here.";
    }

    return {
      agent_id: agent.id,
      message,
      tone: agent.voice_signature,
      offers_practice: strategy.ground && agent.element_affinity === 'earth'
    };
  }

  private createPrimaryMessage(
    strategy: ProcessingStrategy,
    leadMessage: string,
    otherness: DaimonicOtherness,
    trickster: TricksterDetection
  ): string {
    let message = leadMessage;

    switch (strategy.mode) {
      case 'ephemeral':
        message += "\n\n[This moment passes like wind through leaves - no need to grasp]";
        break;
      case 'trickster_check':
        message += `\n\n[Trickster energy: ${trickster.risk.recommended_response}]`;
        break;
      case 'threshold_support':
        message += "\n\n[Sacred threshold space - breathe and trust the process]";
        break;
    }

    return message;
  }

  private createDialogicalLayer(
    otherness: DaimonicOtherness,
    agents: AgentPersonalityConfig[],
    context: DaimonicContext
  ) {
    return {
      questions: [
        "What wants to stay hidden in this situation?",
        "Where do you feel resistance when I say that?",
        "What if the opposite were also true?"
      ].slice(0, 3),
      reflections: [
        `I hear something in your voice about "${this.extractTheme(context)}"`,
        "There's an energy behind your words that feels..."
      ],
      resistances: agents.flatMap(a => a.core_resistances).slice(0, 3),
      incomplete_knowings: [
        "I can only see part of this pattern...",
        "There's something here I can't quite name..."
      ]
    };
  }

  private createArchitecturalLayer(
    otherness: DaimonicOtherness,
    trickster: TricksterDetection,
    strategy: ProcessingStrategy
  ) {
    return {
      synaptic_gap_intensity: otherness.synapse.gap_width,
      daimonic_signature: otherness.alterity.irreducibility,
      trickster_risk: trickster.risk.level,
      grounding_options: strategy.ground ? [
        'Feel your feet on the ground',
        'Take three deep breaths',
        'Name three things you can see'
      ] : []
    };
  }

  private getVisualHint(
    otherness: DaimonicOtherness,
    strategy: ProcessingStrategy,
    thresholds: UnifiedThresholds
  ): string {
    if (thresholds.safety_level === 'red') return 'grounding_mode';
    if (strategy.mode === 'trickster_check') return 'trickster_alert';
    if (strategy.mode === 'ephemeral') return 'gentle_passage';
    if (otherness.dialogue_quality === 'genuine') return 'creative_resonance';
    return 'neutral_presence';
  }

  // Event streaming and persistence
  private async createAndStreamEvent(
    input: string,
    context: DaimonicContext,
    otherness: DaimonicOtherness,
    trickster: TricksterDetection,
    strategy: ProcessingStrategy,
    response: UnifiedResponse
  ): Promise<DaimonicEvent> {
    const event: DaimonicEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      context,
      otherness,
      trickster,
      strategy,
      collective_ripple: this.createCollectiveRipple(otherness, context, strategy)
    };

    // Add to stream
    this.eventStream.push(event);
    
    // Add to user memory
    const userEvents = this.userMemories.get(context.userId) || [];
    userEvents.push(event);
    this.userMemories.set(context.userId, userEvents.slice(-50)); // Keep last 50

    // In production: stream to external event system
    // await this.streamToCollective(event);

    return event;
  }

  private createCollectiveRipple(
    otherness: DaimonicOtherness,
    context: DaimonicContext,
    strategy: ProcessingStrategy
  ): CollectiveRipple {
    let archetype = 'Seeker';
    if (otherness.alterity.resistance > 0.7) archetype = 'Warrior';
    if (otherness.synapse.resonance > 0.7) archetype = 'Lover';
    if (strategy.mode === 'trickster_check') archetype = 'Fool';

    return {
      archetype,
      pattern_signature: `${context.element}_${strategy.mode}`,
      wisdom_essence: otherness.synapse.emergence || "Encounter with authentic otherness",
      urgency: otherness.alterity.irreducibility > 0.8 ? 'high' : 'medium',
      sharing_scope: context.state === 'threshold' ? 'collective' : 'private'
    };
  }

  private updateUserState(
    userId: string,
    otherness: DaimonicOtherness,
    strategy: ProcessingStrategy,
    thresholds: UnifiedThresholds
  ): void {
    // Evolve complexity readiness based on successful encounters
    if (otherness.dialogue_quality === 'genuine' && thresholds.safety_level === 'green') {
      const current = thresholds.complexity_readiness;
      thresholds.complexity_readiness = Math.min(1.0, current + 0.05);
      this.userThresholds.set(userId, thresholds);
    }
  }

  // Simplified helper methods
  private async getStuckIndicators(userId: string): Promise<number> {
    const events = this.userMemories.get(userId) || [];
    const recent = events.slice(-5);
    const stuckCount = recent.filter(e => 
      e.otherness.synapse.tension < 0.3 && e.otherness.alterity.irreducibility < 0.3
    ).length;
    return stuckCount / Math.max(1, recent.length);
  }

  private isInTransition(context: DaimonicContext): boolean {
    return context.phase.includes('Transformation') || 
           context.state === 'threshold' || 
           context.state === 'liminal';
  }

  private generateEmbodiedResponse(input: string, otherness: DaimonicOtherness): string {
    return "What I'm feeling in my body about this...";
  }

  private generatePreciseResponse(input: string, otherness: DaimonicOtherness): string {
    return "I notice a pattern here that wants careful attention...";
  }

  private generateArchetypalResponse(input: string, otherness: DaimonicOtherness): string {
    return "The deeper currents speak of transformation...";
  }

  private generateGenericResponse(input: string, otherness: DaimonicOtherness): string {
    return `I hear the ${otherness.otherness_signature} speaking through your words...`;
  }

  private selectGroundingPractice(otherness: DaimonicOtherness, context: DaimonicContext): string {
    if (otherness.synapse.tension > 0.7) {
      return "Feel your feet on the ground, breathe deeply";
    }
    if (context.state === 'threshold') {
      return "You're in sacred space - just be present";
    }
    return "Return to your breath and body";
  }

  private extractTheme(context: DaimonicContext): string {
    return `${context.element} energy in ${context.phase}`;
  }

  /**
   * Helper methods for agnostic experience integration
   */
  private createConsentResponse(
    userInput: string,
    context: DaimonicContext,
    consentCheck: any
  ): UnifiedResponse {
    return {
      primary_message: consentCheck.consentMessage,
      agent_voices: [],
      consent_required: {
        needed: true,
        type: consentCheck.consentType,
        message: consentCheck.consentMessage
      },
      ui_state: {
        complexity_level: 0.1,
        visual_hint: 'consent_required',
        show_dialogical: false,
        show_architectural: false,
        requires_pause: true,
        safety_level: 'yellow',
        agnostic_mode: true
      },
      processing_meta: {
        strategy: {
          mode: 'threshold_support',
          persist: false,
          resurface: false,
          amplify: false,
          ground: true,
          agent_selection: [],
          reasoning: ['Consent required before proceeding']
        },
        thresholds: {
          complexity_readiness: 0.1,
          safety_level: 'yellow',
          disclosure_level: 0.1,
          grounding_needed: true,
          collective_sharing_ok: false
        },
        safety_interventions: ['Consent collection required'],
        language_validated: true,
        agnostic_safety_level: 'yellow'
      }
    };
  }

  private createAgnosticEmergencyResponse(
    userInput: string,
    context: DaimonicContext,
    thresholds: UnifiedThresholds,
    agnosticSafety: any
  ): UnifiedResponse {
    const safetyReminder = safetyConsentManager.generateSafetyReminder(context.userId);
    
    return {
      primary_message: "I want to pause here with you. " + 
                      (agnosticSafety.interventions?.[0] || "Let's ground together and prioritize your safety.") +
                      (safetyReminder ? "\n\n" + safetyReminder : ""),
      agent_voices: [{
        agent_id: 'agnostic_safety',
        message: "Your wellbeing is what matters most. We don't need to figure anything out right now.",
        tone: 'gentle_grounded',
        offers_practice: true
      }],
      ui_state: {
        complexity_level: 0.1,
        visual_hint: 'safety_priority',
        show_dialogical: false,
        show_architectural: false,
        requires_pause: true,
        safety_level: 'red',
        agnostic_mode: true
      },
      processing_meta: {
        strategy: {
          mode: 'threshold_support',
          persist: true, // Track for safety patterns
          resurface: false,
          amplify: false,
          ground: true,
          agent_selection: ['agnostic_safety'],
          reasoning: ['Agnostic safety assessment triggered emergency response']
        },
        thresholds,
        safety_interventions: [
          ...agnosticSafety.interventions,
          ...agnosticSafety.referrals,
          'Emergency grounding practice',
          'Professional support strongly encouraged'
        ],
        language_validated: true,
        agnostic_safety_level: 'red'
      }
    };
  }

  private combineSafetyLevels(
    traditionalLevel: 'green' | 'yellow' | 'red',
    agnosticLevel: 'green' | 'yellow' | 'red'
  ): 'green' | 'yellow' | 'red' {
    // Use the more conservative (higher) safety level
    const levels = { green: 0, yellow: 1, red: 2 };
    const maxLevel = Math.max(levels[traditionalLevel], levels[agnosticLevel]);
    return Object.keys(levels)[maxLevel] as 'green' | 'yellow' | 'red';
  }

  private calculateIntensity(userInput: string): number {
    const intensityMarkers = ['intense', 'overwhelming', 'powerful', 'can\'t stop', 'won\'t leave'];
    const count = intensityMarkers.filter(marker => 
      userInput.toLowerCase().includes(marker)
    ).length;
    return Math.min(1, count / 3);
  }

  private calculateDuration(context: DaimonicContext): number {
    // Estimate duration based on session count (rough proxy)
    return Math.min(30, context.sessionCount); // Max 30 days estimated
  }

  private sanitizeResponseLanguage(
    message: string,
    validation: { violations: string[]; suggestions: string[] }
  ): string {
    let sanitized = message;
    
    // Apply suggestions to fix violations
    validation.violations.forEach((violation, index) => {
      if (validation.suggestions[index]) {
        sanitized = sanitized.replace(
          new RegExp(violation, 'gi'),
          validation.suggestions[index].replace(/.*try "([^"]*)".*/, '$1')
        );
      }
    });

    return sanitized;
  }

  // Public API methods
  public getCollectivePatterns(): {
    active_archetypes: Record<string, number>;
    recent_patterns: string[];
    collective_tension: number;
  } {
    const recentEvents = this.eventStream.slice(-50);
    const archetypes: Record<string, number> = {};
    
    for (const event of recentEvents) {
      if (event.collective_ripple) {
        archetypes[event.collective_ripple.archetype] = 
          (archetypes[event.collective_ripple.archetype] || 0) + 1;
      }
    }

    return {
      active_archetypes: archetypes,
      recent_patterns: recentEvents
        .map(e => e.collective_ripple?.pattern_signature)
        .filter(Boolean)
        .slice(-10),
      collective_tension: recentEvents.length > 0 ? 
        recentEvents.reduce((sum, e) => sum + e.otherness.synapse.tension, 0) / recentEvents.length : 0
    };
  }

  public getUserEvolution(userId: string): {
    encounter_count: number;
    current_thresholds: UnifiedThresholds;
    recent_trajectory: string;
  } {
    const events = this.userMemories.get(userId) || [];
    const thresholds = this.userThresholds.get(userId) || {
      complexity_readiness: 0.2,
      safety_level: 'green' as const,
      disclosure_level: 0.2,
      grounding_needed: false,
      collective_sharing_ok: false
    };

    let trajectory = 'Beginning journey';
    if (events.length > 10) {
      const recentComplexity = events.slice(-5).reduce((sum, e) => 
        sum + e.otherness.alterity.irreducibility, 0) / 5;
      if (recentComplexity > 0.7) trajectory = 'Deep transformation';
      else if (recentComplexity > 0.5) trajectory = 'Active growth';
      else trajectory = 'Integration phase';
    }

    return {
      encounter_count: events.length,
      current_thresholds: thresholds,
      recent_trajectory: trajectory
    };
  }
}

// Export singleton
export const unifiedDaimonicCore = new UnifiedDaimonicCore();