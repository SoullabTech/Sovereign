import { AgentResponse } from "../types/agentResponse";
/**
 * Agent Configuration Loader
 * Manages personality configs and orchestrates agent choreography
 * Step 1 of Phase 2 Service Consolidation
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { EventBus, daimonicEventBus, DAIMONIC_EVENTS } from './EventBus.js';
import { AgentPersonality, AgentBase, AgentResponse } from './AgentBase.js';
import { UnifiedStorageService } from './UnifiedStorageService.js';

export interface AgentChoreography {
  id: string;
  name: string;
  description: string;
  
  // Diversity enforcement
  diversityRules: DiversityRule[];
  conflictInjection: ConflictInjectionRule[];
  
  // Response coordination
  responseOrchestration: ResponseOrchestration;
  
  // Learning and adaptation
  adaptationRules: AdaptationRule[];
}

export interface DiversityRule {
  name: string;
  trigger: DiversityTrigger;
  action: DiversityAction;
  cooldownPeriod: number; // seconds
  priority: number;
}

export interface DiversityTrigger {
  type: 'agreement_threshold' | 'similarity_score' | 'predictability_index' | 'response_pattern';
  threshold: number;
  windowSize: number; // number of responses to analyze
  conditions?: string[];
}

export interface DiversityAction {
  type: 'inject_friction' | 'activate_resistance' | 'invoke_contradiction' | 'introduce_wildcard';
  targetSelection: 'random_agent' | 'most_agreeable' | 'least_active' | 'specific_agent';
  intensity: number; // 0-1
  parameters: Record<string, any>;
}

export interface ConflictInjectionRule {
  name: string;
  frequency: number; // 0-1 probability per interaction
  conditions: string[];
  conflictTypes: ConflictType[];
  resolutionStrategy: 'let_play_out' | 'guide_synthesis' | 'preserve_tension';
}

export type ConflictType = 
  | 'elemental_opposition'
  | 'archetypal_tension'
  | 'temperament_clash'
  | 'gift_shadow_collision'
  | 'philosophical_disagreement'
  | 'approach_contradiction';

export interface ResponseOrchestration {
  selectionStrategy: AgentSelectionStrategy;
  responseCoordination: ResponseCoordination;
  qualityAssurance: QualityAssurance;
}

export interface AgentSelectionStrategy {
  primary: 'user_preference' | 'context_optimal' | 'diversity_weighted' | 'random' | 'round_robin';
  fallback: string[];
  weights: {
    userAlignment: number; // 0-1
    contextFit: number; // 0-1
    diversityBonus: number; // 0-1
    recentActivityPenalty: number; // 0-1
  };
}

export interface ResponseCoordination {
  allowSimultaneous: boolean;
  maxSimultaneousAgents: number;
  sequencing: 'parallel' | 'sequential' | 'hybrid';
  crossTalk: {
    enabled: boolean;
    probability: number; // 0-1
    maxExchanges: number;
  };
}

export interface QualityAssurance {
  authenticityChecks: string[];
  safetyValidation: string[];
  coherenceRequirements: string[];
  rejectionCriteria: string[];
}

export interface AdaptationRule {
  name: string;
  trigger: AdaptationTrigger;
  action: AdaptationAction;
  learningRate: number; // 0-1
  persistence: 'session' | 'user' | 'global';
}

export interface AdaptationTrigger {
  type: 'user_feedback' | 'effectiveness_metric' | 'pattern_detection' | 'time_based';
  conditions: string[];
  threshold?: number;
}

export interface AdaptationAction {
  type: 'adjust_weights' | 'modify_personality' | 'update_choreography' | 'learn_pattern';
  scope: 'single_agent' | 'agent_group' | 'choreography_system';
  parameters: Record<string, any>;
}

export class AgentConfigLoader {
  private personalities: Map<string, AgentPersonality> = new Map();
  private agents: Map<string, AgentBase> = new Map();
  private choreography: AgentChoreography;
  private eventBus: EventBus;
  private storage: UnifiedStorageService | null = null;
  
  // Choreography state
  private recentResponses: Array<{
    agentId: string;
    response: AgentResponse;
    timestamp: Date;
    userId: string;
  }> = [];
  
  private diversityMetrics: {
    agreementScore: number; // 0-1
    diversityIndex: number; // 0-1
    conflictLevel: number; // 0-1
    lastDiversityAction: Date | null;
  } = {
    agreementScore: 0.5,
    diversityIndex: 0.5,
    conflictLevel: 0.2,
    lastDiversityAction: null
  };

  constructor(
    configPath: string,
    eventBus: EventBus = daimonicEventBus,
    storage?: UnifiedStorageService
  ) {
    this.eventBus = eventBus;
    this.storage = storage || null;
    
    // Load default choreography
    this.choreography = this.loadDefaultChoreography();
    
    // Load personality configurations
    this.loadPersonalities(configPath);
    
    // Initialize agents
    this.initializeAgents();
    
    // Setup event handlers
    this.setupChoreographyHandlers();
  }

  /**
   * Load personality configurations from files
   */
  private loadPersonalities(configPath: string): void {
    const personalityFiles = [
      'aunt-annie.json',
      'emily.json', 
      'matrix-oracle.json'
      // Add more personality files as needed
    ];

    for (const file of personalityFiles) {
      try {
        const filePath = join(configPath, file);
        const configData = readFileSync(filePath, 'utf-8');
        const personality: AgentPersonality = JSON.parse(configData);
        
        // Validate personality configuration
        this.validatePersonality(personality);
        
        this.personalities.set(personality.id, personality);
        
        this.eventBus.emit('agent:personality_loaded', {
          personalityId: personality.id,
          name: personality.name,
          version: personality.version
        });
        
      } catch (error) {
        console.error(`Failed to load personality from ${file}:`, error);
      }
    }
  }

  /**
   * Initialize agent instances from personalities
   */
  private initializeAgents(): void {
    for (const [id, personality] of this.personalities) {
      try {
        const agent = new AgentBase(personality, this.eventBus, this.storage || undefined);
        this.agents.set(id, agent);
        
        this.eventBus.emit('agent:initialized', {
          agentId: id,
          personalityVersion: personality.version
        });
        
      } catch (error) {
        console.error(`Failed to initialize agent ${id}:`, error);
      }
    }
  }

  /**
   * Select optimal agent for response
   */
  async selectAgent(
    userInput: string,
    context: {
      userId: string;
      sessionId: string;
      userProfile?: any;
      sessionContext?: any;
      previousMessages?: any[];
    }
  ): Promise<string> {
    
    const strategy = this.choreography.responseOrchestration.selectionStrategy;
    const candidates = Array.from(this.agents.keys());
    
    // Calculate scores for each agent
    const scores: Record<string, number> = {};
    
    for (const agentId of candidates) {
      const agent = this.agents.get(agentId)!;
      const personality = agent.getPersonality();
      
      let score = 0;
      
      // User alignment score
      if (context.userProfile?.preferences?.elementalAffinities) {
        const userAffinities = context.userProfile.preferences.elementalAffinities;
        const alignmentScore = this.calculateElementalAlignment(
          personality.elementalAffinities,
          userAffinities
        );
        score += alignmentScore * strategy.weights.userAlignment;
      }
      
      // Context fit score
      const contextScore = this.calculateContextFit(personality, userInput, context);
      score += contextScore * strategy.weights.contextFit;
      
      // Diversity bonus
      const diversityBonus = this.calculateDiversityBonus(agentId);
      score += diversityBonus * strategy.weights.diversityBonus;
      
      // Recent activity penalty
      const activityPenalty = this.calculateActivityPenalty(agentId);
      score -= activityPenalty * strategy.weights.recentActivityPenalty;
      
      scores[agentId] = Math.max(0, Math.min(1, score));
    }
    
    // Apply selection strategy
    switch (strategy.primary) {
      case 'user_preference':
        return this.selectByUserPreference(scores, context);
        
      case 'context_optimal':
        return this.selectByHighestScore(scores);
        
      case 'diversity_weighted':
        return this.selectByDiversityWeighting(scores);
        
      case 'random':
        return this.selectRandomly(candidates);
        
      case 'round_robin':
        return this.selectRoundRobin(candidates);
        
      default:
        return this.selectByHighestScore(scores);
    }
  }

  /**
   * Generate orchestrated response
   */
  async generateResponse(
    userInput: string,
    context: {
      userId: string;
      sessionId: string;
      userProfile?: any;
      sessionContext?: any;
      previousMessages?: any[];
    }
  ): Promise<{
    response: AgentResponse;
    orchestrationMetadata: {
      selectedAgent: string;
      alternativeCandidates: string[];
      diversityMetrics: typeof this.diversityMetrics;
      choreographyActions: string[];
    };
  }> {
    
    const selectedAgentId = await this.selectAgent(userInput, context);
    const selectedAgent = this.agents.get(selectedAgentId)!;
    
    // Initialize agent session if needed
    await selectedAgent.initializeSession(context.userId, context.sessionId);
    
    // Generate response
    const response = await selectedAgent.respond(userInput, context);
    
    // Record response for choreography analysis
    this.recentResponses.push({
      agentId: selectedAgentId,
      response,
      timestamp: new Date(),
      userId: context.userId
    });
    
    // Trim old responses (keep last 20)
    if (this.recentResponses.length > 20) {
      this.recentResponses = this.recentResponses.slice(-20);
    }
    
    // Update choreography metrics
    this.updateChoreographyMetrics();
    
    // Apply choreography rules
    const choreographyActions = await this.applyChoreographyRules(
      response, 
      context, 
      selectedAgentId
    );
    
    // Get alternative candidates for metadata
    const allScores = await this.calculateAllAgentScores(userInput, context);
    const alternativeCandidates = Object.keys(allScores)
      .filter(id => id !== selectedAgentId)
      .sort((a, b) => allScores[b] - allScores[a])
      .slice(0, 3);
    
    return {
      response,
      orchestrationMetadata: {
        selectedAgent: selectedAgentId,
        alternativeCandidates,
        diversityMetrics: { ...this.diversityMetrics },
        choreographyActions
      }
    };
  }

  /**
   * Apply choreography rules for diversity and conflict
   */
  private async applyChoreographyRules(
    response: AgentResponse,
    context: any,
    selectedAgentId: string
  ): Promise<string[]> {
    
    const actions: string[] = [];
    
    // Check diversity rules
    for (const rule of this.choreography.diversityRules) {
      const shouldApply = this.evaluateDiversityTrigger(rule.trigger);
      const cooledDown = this.isDiversityActionCooledDown(rule);
      
      if (shouldApply && cooledDown) {
        await this.executeDiversityAction(rule.action, selectedAgentId);
        actions.push(`Applied diversity rule: ${rule.name}`);
        
        // Record action timestamp
        this.diversityMetrics.lastDiversityAction = new Date();
      }
    }
    
    // Check conflict injection rules
    for (const rule of this.choreography.conflictInjection) {
      if (Math.random() < rule.frequency) {
        const conditionsMet = rule.conditions.every(condition => 
          this.evaluateChoreographyCondition(condition, context, response)
        );
        
        if (conditionsMet) {
          await this.injectConflict(rule, selectedAgentId);
          actions.push(`Injected conflict: ${rule.name}`);
        }
      }
    }
    
    return actions;
  }

  /**
   * Update choreography metrics based on recent responses
   */
  private updateChoreographyMetrics(): void {
    if (this.recentResponses.length < 2) return;
    
    const recent = this.recentResponses.slice(-5); // Last 5 responses
    
    // Calculate agreement score
    const agreementScores: number[] = [];
    for (let i = 1; i < recent.length; i++) {
      const similarity = this.calculateResponseSimilarity(recent[i-1], recent[i]);
      agreementScores.push(similarity);
    }
    
    this.diversityMetrics.agreementScore = agreementScores.length > 0
      ? agreementScores.reduce((sum, score) => sum + score, 0) / agreementScores.length
      : 0.5;
    
    // Calculate diversity index
    const uniqueAgents = new Set(recent.map(r => r.agentId));
    this.diversityMetrics.diversityIndex = uniqueAgents.size / Math.max(recent.length, 1);
    
    // Update conflict level
    const conflictIndicators = recent.filter(r => 
      r.response.metadata.resistancesTriggered.length > 0 ||
      r.response.metadata.contradictionsActive.length > 0
    );
    
    this.diversityMetrics.conflictLevel = conflictIndicators.length / Math.max(recent.length, 1);
  }

  /**
   * Helper methods for choreography
   */
  
  private evaluateDiversityTrigger(trigger: DiversityTrigger): boolean {
    const recentResponses = this.recentResponses.slice(-trigger.windowSize);
    if (recentResponses.length < trigger.windowSize) return false;
    
    switch (trigger.type) {
      case 'agreement_threshold':
        return this.diversityMetrics.agreementScore > trigger.threshold;
        
      case 'similarity_score':
        // Calculate average similarity in window
        const similarities: number[] = [];
        for (let i = 1; i < recentResponses.length; i++) {
          similarities.push(this.calculateResponseSimilarity(recentResponses[i-1], recentResponses[i]));
        }
        const avgSimilarity = similarities.reduce((sum, s) => sum + s, 0) / similarities.length;
        return avgSimilarity > trigger.threshold;
        
      case 'predictability_index':
        const avgPredictability = recentResponses
          .reduce((sum, r) => sum + r.response.metadata.predictabilityIndex, 0) / recentResponses.length;
        return avgPredictability > trigger.threshold;
        
      case 'response_pattern':
        // Check for repetitive patterns
        const patterns = recentResponses.map(r => this.extractResponsePattern(r));
        const uniquePatterns = new Set(patterns);
        return (uniquePatterns.size / patterns.length) < trigger.threshold;
        
      default:
        return false;
    }
  }

  private async executeDiversityAction(action: DiversityAction, currentAgentId: string): Promise<void> {
    let targetAgentId: string;
    
    // Select target agent
    switch (action.targetSelection) {
      case 'random_agent':
        targetAgentId = this.selectRandomAgent();
        break;
      case 'most_agreeable':
        targetAgentId = this.selectMostAgreeableAgent();
        break;
      case 'least_active':
        targetAgentId = this.selectLeastActiveAgent();
        break;
      case 'specific_agent':
        targetAgentId = action.parameters.agentId || currentAgentId;
        break;
      default:
        targetAgentId = currentAgentId;
    }
    
    // Execute action
    switch (action.type) {
      case 'inject_friction':
        await this.eventBus.emit('orchestrator:friction_injection', {
          targetAgentId,
          frictionType: action.parameters.type || 'general',
          intensity: action.intensity
        });
        break;
        
      case 'activate_resistance':
        await this.eventBus.emit('orchestrator:activate_resistance', {
          targetAgentId,
          resistanceType: action.parameters.resistanceType || 'random',
          intensity: action.intensity
        });
        break;
        
      case 'invoke_contradiction':
        await this.eventBus.emit('orchestrator:invoke_contradiction', {
          targetAgentId,
          contradictionType: action.parameters.contradictionType || 'random',
          intensity: action.intensity
        });
        break;
        
      case 'introduce_wildcard':
        await this.eventBus.emit('orchestrator:introduce_wildcard', {
          targetAgentId,
          wildcardType: action.parameters.wildcardType || 'random',
          intensity: action.intensity
        });
        break;
    }
  }

  private async injectConflict(rule: ConflictInjectionRule, primaryAgentId: string): Promise<void> {
    const conflictType = rule.conflictTypes[Math.floor(Math.random() * rule.conflictTypes.length)];
    
    // Find appropriate conflicting agent
    const conflictingAgentId = this.findConflictingAgent(primaryAgentId, conflictType);
    
    await this.eventBus.emit('orchestrator:conflict_injection', {
      primaryAgentId,
      conflictingAgentId,
      conflictType,
      resolutionStrategy: rule.resolutionStrategy
    });
  }

  private findConflictingAgent(primaryAgentId: string, conflictType: ConflictType): string {
    const primaryPersonality = this.personalities.get(primaryAgentId)!;
    const candidates = Array.from(this.personalities.entries())
      .filter(([id]) => id !== primaryAgentId);
    
    // Find agent with maximum conflict potential
    let bestCandidate = candidates[0][0];
    let maxConflictScore = 0;
    
    for (const [id, personality] of candidates) {
      const conflictScore = this.calculateConflictScore(primaryPersonality, personality, conflictType);
      if (conflictScore > maxConflictScore) {
        maxConflictScore = conflictScore;
        bestCandidate = id;
      }
    }
    
    return bestCandidate;
  }

  private calculateConflictScore(
    personality1: AgentPersonality, 
    personality2: AgentPersonality, 
    conflictType: ConflictType
  ): number {
    
    switch (conflictType) {
      case 'elemental_opposition':
        // Fire vs Water, Earth vs Air, etc.
        const elements = ['fire', 'water', 'earth', 'air'] as const;
        const oppositions = { fire: 'water', water: 'fire', earth: 'air', air: 'earth' };
        let oppositionScore = 0;
        
        for (const element of elements) {
          const opposite = oppositions[element];
          oppositionScore += personality1.elementalAffinities[element] * personality2.elementalAffinities[opposite];
        }
        
        return oppositionScore;
        
      case 'temperament_clash':
        // High directness vs low directness, etc.
        return Math.abs(personality1.temperament.directness - personality2.temperament.directness) +
               Math.abs(personality1.temperament.intensity - personality2.temperament.intensity);
        
      case 'archetypal_tension':
        // Shadow vs Light archetypes, etc.
        const tensionPairs = [
          ['Shadow', 'Unity'],
          ['Trickster', 'Wise_Old_One'],
          ['Hero', 'Mother']
        ];
        
        let tensionScore = 0;
        for (const [arch1, arch2] of tensionPairs) {
          tensionScore += personality1.archetypalResonances[arch1 as keyof typeof personality1.archetypalResonances] * 
                         personality2.archetypalResonances[arch2 as keyof typeof personality2.archetypalResonances];
        }
        
        return tensionScore;
        
      default:
        return Math.random() * 0.5; // Random conflict potential
    }
  }

  /**
   * Utility methods
   */
  
  private validatePersonality(personality: AgentPersonality): void {
    if (!personality.id || !personality.name || !personality.version) {
      throw new Error('Personality missing required fields');
    }
    
    // Add more validation as needed
  }

  private loadDefaultChoreography(): AgentChoreography {
    return {
      id: 'default_choreography',
      name: 'Default Agent Choreography',
      description: 'Standard choreography for preserving diversity and authentic otherness',
      
      diversityRules: [
        {
          name: 'high_agreement_friction',
          trigger: {
            type: 'agreement_threshold',
            threshold: 0.8,
            windowSize: 3
          },
          action: {
            type: 'inject_friction',
            targetSelection: 'most_agreeable',
            intensity: 0.6,
            parameters: { type: 'contrarian' }
          },
          cooldownPeriod: 300, // 5 minutes
          priority: 1
        },
        
        {
          name: 'predictability_wildcard',
          trigger: {
            type: 'predictability_index',
            threshold: 0.7,
            windowSize: 4
          },
          action: {
            type: 'introduce_wildcard',
            targetSelection: 'random_agent',
            intensity: 0.8,
            parameters: { wildcardType: 'unexpected_angle' }
          },
          cooldownPeriod: 600, // 10 minutes
          priority: 2
        }
      ],
      
      conflictInjection: [
        {
          name: 'elemental_tension',
          frequency: 0.15,
          conditions: ['low_conflict_level', 'multiple_agents_available'],
          conflictTypes: ['elemental_opposition', 'temperament_clash'],
          resolutionStrategy: 'let_play_out'
        }
      ],
      
      responseOrchestration: {
        selectionStrategy: {
          primary: 'context_optimal',
          fallback: ['diversity_weighted', 'random'],
          weights: {
            userAlignment: 0.3,
            contextFit: 0.4,
            diversityBonus: 0.2,
            recentActivityPenalty: 0.1
          }
        },
        responseCoordination: {
          allowSimultaneous: false,
          maxSimultaneousAgents: 1,
          sequencing: 'sequential',
          crossTalk: {
            enabled: true,
            probability: 0.1,
            maxExchanges: 2
          }
        },
        qualityAssurance: {
          authenticityChecks: ['resistance_presence', 'unpredictability_score'],
          safetyValidation: ['intensity_threshold', 'reality_testing'],
          coherenceRequirements: ['response_relevance', 'personality_consistency'],
          rejectionCriteria: ['safety_violation', 'complete_incoherence']
        }
      },
      
      adaptationRules: []
    };
  }

  private setupChoreographyHandlers(): void {
    // Handle diversity metric updates
    this.eventBus.subscribe('agent:response_generated', () => {
      this.updateChoreographyMetrics();
    });
    
    // Handle choreography configuration updates
    this.eventBus.subscribe('choreography:update_configuration', (event) => {
      this.updateChoreography(event.data);
    });
  }

  private updateChoreography(updates: Partial<AgentChoreography>): void {
    Object.assign(this.choreography, updates);
    
    this.eventBus.emit('choreography:configuration_updated', {
      choreographyId: this.choreography.id,
      timestamp: new Date()
    });
  }

  // Additional helper methods would go here...
  private calculateElementalAlignment(affinities1: any, affinities2: any): number { return 0.5; }
  private calculateContextFit(personality: AgentPersonality, input: string, context: any): number { return 0.5; }
  private calculateDiversityBonus(agentId: string): number { return 0.3; }
  private calculateActivityPenalty(agentId: string): number { return 0.2; }
  private selectByUserPreference(scores: Record<string, number>, context: any): string { return Object.keys(scores)[0]; }
  private selectByHighestScore(scores: Record<string, number>): string { return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b); }
  private selectByDiversityWeighting(scores: Record<string, number>): string { return Object.keys(scores)[0]; }
  private selectRandomly(candidates: string[]): string { return candidates[Math.floor(Math.random() * candidates.length)]; }
  private selectRoundRobin(candidates: string[]): string { return candidates[0]; }
  private calculateAllAgentScores(input: string, context: any): Promise<Record<string, number>> { return Promise.resolve({}); }
  private calculateResponseSimilarity(response1: any, response2: any): number { return 0.5; }
  private extractResponsePattern(response: any): string { return 'pattern'; }
  private selectRandomAgent(): string { return Array.from(this.agents.keys())[0]; }
  private selectMostAgreeableAgent(): string { return Array.from(this.agents.keys())[0]; }
  private selectLeastActiveAgent(): string { return Array.from(this.agents.keys())[0]; }
  private isDiversityActionCooledDown(rule: DiversityRule): boolean { return true; }
  private evaluateChoreographyCondition(condition: string, context: any, response: AgentResponse): boolean { return true; }

  /**
   * Public interface
   */
  
  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }
  
  getAgentPersonality(agentId: string): AgentPersonality | null {
    return this.personalities.get(agentId) || null;
  }
  
  getChoreographyMetrics(): typeof this.diversityMetrics {
    return { ...this.diversityMetrics };
  }
  
  updateAgentPersonality(agentId: string, updates: Partial<AgentPersonality>): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    agent.updatePersonality(updates);
    return true;
  }
}