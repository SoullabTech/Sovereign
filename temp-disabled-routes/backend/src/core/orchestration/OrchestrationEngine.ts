/**
 * Orchestration Engine - The Sacred Conductor
 * 
 * Intelligent routing and flow management based on:
 * - User emotional state
 * - Safety assessments
 * - Spiritual context
 * - Journey progression
 * - Agent capabilities
 */

import { ComprehensiveSafetyResult } from '../../services/ComprehensiveSafetyService';
import { AgentRegistry, AgentProfile } from './AgentRegistry';
import { FlowMemory } from './FlowMemory';
import { logger } from '../../utils/logger';
import { supabase } from '../../lib/supabaseClient';

export interface OrchestrationRequest {
  userId: string;
  sessionId: string;
  input: string;
  intent?: UserIntent;
  context?: OrchestrationContext;
  safetyAnalysis?: ComprehensiveSafetyResult;
  preferredModality?: 'text' | 'voice' | 'visual';
}

export interface OrchestrationContext {
  currentFlow?: FlowType;
  previousFlows?: FlowRecord[];
  emotionalJourney?: EmotionalJourney;
  spiritualPhase?: SpiritualPhase;
  elementalState?: ElementalState;
  timeOfDay?: string;
  moonPhase?: string;
  sessionDuration?: number;
}

export interface OrchestrationResponse {
  selectedAgent: string;
  selectedFlow: FlowType;
  flowParameters: FlowParameters;
  adaptations: Adaptation[];
  suggestions: Suggestion[];
  metadata: OrchestrationMetadata;
}

export type FlowType = 
  | 'oracle_guidance'
  | 'ritual_ceremony'
  | 'journal_reflection'
  | 'voice_dialogue'
  | 'somatic_practice'
  | 'grounding_exercise'
  | 'crisis_support'
  | 'celebration_acknowledgment'
  | 'integration_process'
  | 'archetypal_exploration'
  | 'dream_analysis'
  | 'shadow_work'
  | 'elemental_balancing';

export interface FlowParameters {
  intensity: 'gentle' | 'moderate' | 'deep' | 'intensive';
  duration: 'brief' | 'standard' | 'extended';
  style: 'guided' | 'exploratory' | 'structured' | 'free-form';
  support: 'minimal' | 'moderate' | 'substantial';
  resources?: string[];
}

export interface FlowRecord {
  flowType: FlowType;
  timestamp: Date;
  emotionalImpact: number; // -1 to 1
  effectiveness: number; // 0 to 1
  userFeedback?: string;
  safetyLevel: string;
}

export interface EmotionalJourney {
  startState: EmotionalState;
  currentState: EmotionalState;
  trajectory: 'ascending' | 'descending' | 'stable' | 'oscillating';
  keyShifts: EmotionalShift[];
  resilience: number; // 0 to 1
}

export interface EmotionalState {
  primary: string;
  intensity: number;
  valence: number;
  arousal: number;
  timestamp: Date;
}

export interface EmotionalShift {
  from: EmotionalState;
  to: EmotionalState;
  trigger?: string;
  timestamp: Date;
}

export interface SpiritualPhase {
  stage: 'awakening' | 'exploring' | 'deepening' | 'integrating' | 'embodying';
  practices: string[];
  challenges: string[];
  gifts: string[];
}

export interface ElementalState {
  dominant: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  balance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  needed: string[];
}

export interface Adaptation {
  type: 'tone' | 'pace' | 'depth' | 'support' | 'resource';
  reason: string;
  adjustment: any;
}

export interface Suggestion {
  type: 'practice' | 'resource' | 'transition' | 'pause';
  content: string;
  rationale: string;
  priority: 'immediate' | 'soon' | 'later';
}

export interface OrchestrationMetadata {
  decisionFactors: string[];
  confidenceScore: number;
  alternativeFlows: FlowType[];
  safetyConsiderations: string[];
}

export type UserIntent = 
  | 'seek_guidance'
  | 'process_emotion'
  | 'explore_spirituality'
  | 'ground_energy'
  | 'celebrate_joy'
  | 'integrate_experience'
  | 'analyze_dream'
  | 'perform_ritual'
  | 'journal_reflect'
  | 'crisis_support'
  | 'casual_conversation';

export class OrchestrationEngine {
  private agentRegistry: AgentRegistry;
  private flowMemory: FlowMemory;
  private activeFlows: Map<string, FlowType>;
  private flowTemplates: Map<FlowType, FlowTemplate>;
  
  constructor() {
    this.agentRegistry = new AgentRegistry();
    this.flowMemory = new FlowMemory();
    this.activeFlows = new Map();
    this.initializeFlowTemplates();
  }

  /**
   * Main orchestration method - routes requests intelligently
   */
  async orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Analyze user intent
      const intent = await this.analyzeIntent(request);
      
      // Step 2: Assess current state and context
      const stateAssessment = await this.assessCurrentState(request);
      
      // Step 3: Apply safety-aware routing
      const safetyRouting = this.applySafetyRouting(
        request.safetyAnalysis,
        intent,
        stateAssessment
      );
      
      // Step 4: Select optimal flow
      const selectedFlow = await this.selectOptimalFlow(
        intent,
        stateAssessment,
        safetyRouting,
        request.context
      );
      
      // Step 5: Choose appropriate agent
      const selectedAgent = await this.selectAgent(
        selectedFlow,
        stateAssessment,
        request.preferredModality
      );
      
      // Step 6: Determine flow parameters
      const flowParameters = this.determineFlowParameters(
        selectedFlow,
        stateAssessment,
        request.safetyAnalysis
      );
      
      // Step 7: Generate adaptations
      const adaptations = this.generateAdaptations(
        stateAssessment,
        request.safetyAnalysis,
        selectedFlow
      );
      
      // Step 8: Create suggestions
      const suggestions = await this.generateSuggestions(
        request,
        stateAssessment,
        selectedFlow
      );
      
      // Step 9: Record flow decision
      await this.recordFlowDecision(
        request.userId,
        selectedFlow,
        stateAssessment,
        request.safetyAnalysis
      );
      
      // Update active flows
      this.activeFlows.set(request.sessionId, selectedFlow);
      
      const response: OrchestrationResponse = {
        selectedAgent: selectedAgent.id,
        selectedFlow,
        flowParameters,
        adaptations,
        suggestions,
        metadata: {
          decisionFactors: this.extractDecisionFactors(
            intent,
            stateAssessment,
            safetyRouting
          ),
          confidenceScore: this.calculateConfidence(
            stateAssessment,
            safetyRouting
          ),
          alternativeFlows: this.getAlternativeFlows(
            selectedFlow,
            intent
          ),
          safetyConsiderations: safetyRouting.considerations
        }
      };
      
      logger.info('Orchestration complete', {
        userId: request.userId,
        selectedFlow,
        selectedAgent: selectedAgent.id,
        processingTime: Date.now() - startTime
      });
      
      return response;
      
    } catch (error) {
      logger.error('Orchestration error:', error);
      return this.getFallbackOrchestration(request);
    }
  }

  /**
   * Analyze user intent from input and context
   */
  private async analyzeIntent(request: OrchestrationRequest): Promise<UserIntent> {
    if (request.intent) {
      return request.intent;
    }
    
    const input = request.input.toLowerCase();
    
    // Crisis indicators
    if (this.containsCrisisLanguage(input)) {
      return 'crisis_support';
    }
    
    // Emotional processing
    if (this.containsEmotionalLanguage(input)) {
      return 'process_emotion';
    }
    
    // Spiritual exploration
    if (this.containsSpiritualLanguage(input)) {
      return 'explore_spirituality';
    }
    
    // Dream content
    if (input.includes('dream') || input.includes('dreamt')) {
      return 'analyze_dream';
    }
    
    // Ritual request
    if (input.includes('ritual') || input.includes('ceremony')) {
      return 'perform_ritual';
    }
    
    // Journaling
    if (input.includes('journal') || input.includes('reflect')) {
      return 'journal_reflect';
    }
    
    // Grounding
    if (input.includes('ground') || input.includes('center')) {
      return 'ground_energy';
    }
    
    // Celebration
    if (this.containsCelebrationLanguage(input)) {
      return 'celebrate_joy';
    }
    
    // Default to guidance
    return 'seek_guidance';
  }

  /**
   * Assess current user state
   */
  private async assessCurrentState(
    request: OrchestrationRequest
  ): Promise<StateAssessment> {
    const assessment: StateAssessment = {
      emotional: {
        stability: 'stable',
        intensity: 0.5,
        needsSupport: false
      },
      spiritual: {
        grounded: true,
        openness: 0.7,
        readiness: 'moderate'
      },
      cognitive: {
        clarity: 'clear',
        focus: 0.8,
        receptivity: 'high'
      },
      somatic: {
        tension: 'low',
        energy: 'balanced',
        breathQuality: 'normal'
      }
    };
    
    // Use safety analysis if available
    if (request.safetyAnalysis) {
      const safety = request.safetyAnalysis;
      
      assessment.emotional.stability = 
        safety.riskLevel === 'critical' ? 'crisis' :
        safety.riskLevel === 'high' ? 'unstable' :
        safety.riskLevel === 'medium' ? 'fluctuating' : 'stable';
      
      assessment.emotional.intensity = safety.emotionalState.intensity;
      assessment.emotional.needsSupport = safety.emotionalState.needsSupport;
      
      // Check for ungrounded states
      if (safety.emotionalState.somaticIndicators) {
        const ungrounded = safety.emotionalState.somaticIndicators.some(
          ind => ind.level === 'constricted' || ind.type === 'grounding'
        );
        assessment.spiritual.grounded = !ungrounded;
      }
    }
    
    // Check session duration for fatigue
    if (request.context?.sessionDuration) {
      const duration = request.context.sessionDuration;
      if (duration > 3600000) { // Over 1 hour
        assessment.cognitive.focus *= 0.7;
        assessment.cognitive.clarity = 'fatigued';
      }
    }
    
    // Check elemental state
    if (request.context?.elementalState) {
      const balance = request.context.elementalState.balance;
      const variance = this.calculateElementalVariance(balance);
      
      if (variance > 0.3) {
        assessment.spiritual.grounded = false;
        assessment.somatic.energy = 'imbalanced';
      }
    }
    
    return assessment;
  }

  /**
   * Apply safety-aware routing rules
   */
  private applySafetyRouting(
    safetyAnalysis?: ComprehensiveSafetyResult,
    intent?: UserIntent,
    stateAssessment?: StateAssessment
  ): SafetyRouting {
    const routing: SafetyRouting = {
      allowedFlows: [...this.getAllFlowTypes()],
      restrictedFlows: [],
      priorityFlows: [],
      considerations: []
    };
    
    if (!safetyAnalysis) {
      return routing;
    }
    
    // Critical safety - restrict to support flows
    if (safetyAnalysis.riskLevel === 'critical') {
      routing.allowedFlows = [
        'crisis_support',
        'grounding_exercise',
        'somatic_practice'
      ];
      routing.priorityFlows = ['crisis_support'];
      routing.considerations.push('User in crisis - prioritizing immediate support');
      
      routing.restrictedFlows = [
        'shadow_work',
        'archetypal_exploration',
        'dream_analysis'
      ];
    }
    
    // High risk - emphasize grounding and support
    else if (safetyAnalysis.riskLevel === 'high') {
      routing.priorityFlows = [
        'grounding_exercise',
        'somatic_practice',
        'journal_reflection'
      ];
      routing.restrictedFlows = [
        'shadow_work',
        'ritual_ceremony' // Avoid intensive practices
      ];
      routing.considerations.push('Elevated risk - emphasizing stabilization');
    }
    
    // Ungrounded spiritual state
    if (stateAssessment && !stateAssessment.spiritual.grounded) {
      routing.priorityFlows.push('grounding_exercise', 'elemental_balancing');
      routing.restrictedFlows.push('archetypal_exploration');
      routing.considerations.push('Spiritual grounding needed');
    }
    
    // Celebration states
    if (safetyAnalysis.emotionalState.supportType === 'celebration') {
      routing.priorityFlows.push('celebration_acknowledgment');
      routing.considerations.push('Positive state - amplifying joy');
    }
    
    return routing;
  }

  /**
   * Select optimal flow based on all factors
   */
  private async selectOptimalFlow(
    intent: UserIntent,
    stateAssessment: StateAssessment,
    safetyRouting: SafetyRouting,
    context?: OrchestrationContext
  ): Promise<FlowType> {
    // Priority flows from safety routing
    if (safetyRouting.priorityFlows.length > 0) {
      return safetyRouting.priorityFlows[0];
    }
    
    // Map intent to flow
    const intentFlowMap: Record<UserIntent, FlowType> = {
      'seek_guidance': 'oracle_guidance',
      'process_emotion': 'journal_reflection',
      'explore_spirituality': 'archetypal_exploration',
      'ground_energy': 'grounding_exercise',
      'celebrate_joy': 'celebration_acknowledgment',
      'integrate_experience': 'integration_process',
      'analyze_dream': 'dream_analysis',
      'perform_ritual': 'ritual_ceremony',
      'journal_reflect': 'journal_reflection',
      'crisis_support': 'crisis_support',
      'casual_conversation': 'oracle_guidance'
    };
    
    let selectedFlow = intentFlowMap[intent];
    
    // Check if flow is restricted
    if (safetyRouting.restrictedFlows.includes(selectedFlow)) {
      // Find alternative
      const alternatives = this.getAlternativeFlows(selectedFlow, intent);
      selectedFlow = alternatives.find(f => 
        safetyRouting.allowedFlows.includes(f)
      ) || 'oracle_guidance';
    }
    
    // Adapt based on state
    if (stateAssessment.emotional.stability === 'crisis') {
      selectedFlow = 'crisis_support';
    } else if (stateAssessment.emotional.needsSupport) {
      if (selectedFlow === 'archetypal_exploration' || 
          selectedFlow === 'shadow_work') {
        selectedFlow = 'journal_reflection'; // Gentler option
      }
    }
    
    // Check flow history for variety
    if (context?.previousFlows) {
      const recentFlows = context.previousFlows.slice(-3);
      if (recentFlows.every(f => f.flowType === selectedFlow)) {
        // User stuck in pattern, suggest alternative
        const alternatives = this.getAlternativeFlows(selectedFlow, intent);
        if (alternatives.length > 0) {
          selectedFlow = alternatives[0];
        }
      }
    }
    
    return selectedFlow;
  }

  /**
   * Select appropriate agent for the flow
   */
  private async selectAgent(
    flow: FlowType,
    stateAssessment: StateAssessment,
    preferredModality?: string
  ): Promise<AgentProfile> {
    // Get agents capable of handling this flow
    const capableAgents = this.agentRegistry.getAgentsForFlow(flow);
    
    // Filter by modality if specified
    let candidates = preferredModality
      ? capableAgents.filter(a => a.modalities.includes(preferredModality))
      : capableAgents;
    
    if (candidates.length === 0) {
      candidates = capableAgents; // Fallback to all capable
    }
    
    // Score agents based on state fit
    const scoredAgents = candidates.map(agent => ({
      agent,
      score: this.scoreAgentFit(agent, stateAssessment, flow)
    }));
    
    // Sort by score and return best match
    scoredAgents.sort((a, b) => b.score - a.score);
    
    return scoredAgents[0]?.agent || this.agentRegistry.getDefaultAgent();
  }

  /**
   * Score how well an agent fits the current state
   */
  private scoreAgentFit(
    agent: AgentProfile,
    state: StateAssessment,
    flow: FlowType
  ): number {
    let score = agent.capabilities[flow] || 0;
    
    // Bonus for emotional alignment
    if (state.emotional.needsSupport && agent.emotionalRange.includes('supportive')) {
      score += 0.2;
    }
    
    // Bonus for grounding capability
    if (!state.spiritual.grounded && agent.capabilities.grounding_exercise > 0.7) {
      score += 0.3;
    }
    
    // Bonus for crisis handling
    if (state.emotional.stability === 'crisis' && 
        agent.safetyProfile.crisisCapable) {
      score += 0.5;
    }
    
    return Math.min(1, score);
  }

  /**
   * Determine flow parameters based on state
   */
  private determineFlowParameters(
    flow: FlowType,
    state: StateAssessment,
    safety?: ComprehensiveSafetyResult
  ): FlowParameters {
    const parameters: FlowParameters = {
      intensity: 'moderate',
      duration: 'standard',
      style: 'guided',
      support: 'moderate'
    };
    
    // Adjust intensity based on stability
    if (state.emotional.stability === 'crisis') {
      parameters.intensity = 'gentle';
      parameters.support = 'substantial';
    } else if (state.emotional.stability === 'stable' && 
               state.spiritual.grounded) {
      parameters.intensity = 'deep';
    }
    
    // Adjust duration based on focus
    if (state.cognitive.focus < 0.5) {
      parameters.duration = 'brief';
    } else if (state.cognitive.focus > 0.8 && 
               state.cognitive.clarity === 'clear') {
      parameters.duration = 'extended';
    }
    
    // Adjust style based on receptivity
    if (state.cognitive.receptivity === 'high') {
      parameters.style = 'exploratory';
    } else if (state.emotional.needsSupport) {
      parameters.style = 'structured';
    }
    
    // Add resources if needed
    if (safety?.resources) {
      parameters.resources = safety.resources.map(r => r.name);
    }
    
    return parameters;
  }

  /**
   * Generate contextual adaptations
   */
  private generateAdaptations(
    state: StateAssessment,
    safety?: ComprehensiveSafetyResult,
    flow?: FlowType
  ): Adaptation[] {
    const adaptations: Adaptation[] = [];
    
    // Tone adaptations
    if (state.emotional.needsSupport) {
      adaptations.push({
        type: 'tone',
        reason: 'User needs emotional support',
        adjustment: 'gentle_compassionate'
      });
    }
    
    // Pace adaptations
    if (state.cognitive.clarity === 'fatigued') {
      adaptations.push({
        type: 'pace',
        reason: 'User showing signs of fatigue',
        adjustment: 'slower_with_pauses'
      });
    }
    
    // Depth adaptations
    if (!state.spiritual.grounded) {
      adaptations.push({
        type: 'depth',
        reason: 'User needs grounding',
        adjustment: 'surface_with_anchoring'
      });
    }
    
    // Support adaptations
    if (safety?.riskLevel === 'high') {
      adaptations.push({
        type: 'support',
        reason: 'Elevated safety risk',
        adjustment: 'increased_check_ins'
      });
    }
    
    // Resource adaptations
    if (flow === 'crisis_support') {
      adaptations.push({
        type: 'resource',
        reason: 'Crisis flow activated',
        adjustment: 'immediate_resources_visible'
      });
    }
    
    return adaptations;
  }

  /**
   * Generate intelligent suggestions
   */
  private async generateSuggestions(
    request: OrchestrationRequest,
    state: StateAssessment,
    flow: FlowType
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Immediate suggestions for crisis states
    if (state.emotional.stability === 'crisis') {
      suggestions.push({
        type: 'practice',
        content: 'Try the 5-4-3-2-1 grounding technique',
        rationale: 'Immediate grounding needed',
        priority: 'immediate'
      });
      
      suggestions.push({
        type: 'resource',
        content: 'Crisis support line: 988',
        rationale: 'Professional support available',
        priority: 'immediate'
      });
    }
    
    // Transition suggestions
    if (flow === 'shadow_work' || flow === 'archetypal_exploration') {
      suggestions.push({
        type: 'transition',
        content: 'Consider journaling after this exploration',
        rationale: 'Integration of deep work',
        priority: 'soon'
      });
    }
    
    // Pause suggestions for fatigue
    if (state.cognitive.clarity === 'fatigued') {
      suggestions.push({
        type: 'pause',
        content: 'You\'ve been here a while. Consider taking a break',
        rationale: 'Rest supports integration',
        priority: 'soon'
      });
    }
    
    // Practice suggestions for imbalance
    if (state.somatic.energy === 'imbalanced') {
      suggestions.push({
        type: 'practice',
        content: 'Elemental balancing meditation available',
        rationale: 'Restore energetic equilibrium',
        priority: 'soon'
      });
    }
    
    return suggestions;
  }

  /**
   * Initialize flow templates
   */
  private initializeFlowTemplates(): void {
    this.flowTemplates = new Map([
      ['oracle_guidance', {
        name: 'Oracle Guidance',
        description: 'Receive wisdom and insights',
        minDuration: 5,
        maxDuration: 30,
        requiredCapabilities: ['wisdom', 'insight'],
        safetyLevel: 'low'
      }],
      ['crisis_support', {
        name: 'Crisis Support',
        description: 'Immediate safety and stabilization',
        minDuration: 10,
        maxDuration: 60,
        requiredCapabilities: ['crisis_intervention', 'grounding'],
        safetyLevel: 'critical'
      }],
      ['grounding_exercise', {
        name: 'Grounding Exercise',
        description: 'Return to center and earth',
        minDuration: 3,
        maxDuration: 15,
        requiredCapabilities: ['somatic', 'grounding'],
        safetyLevel: 'low'
      }],
      ['journal_reflection', {
        name: 'Journal Reflection',
        description: 'Process and integrate experiences',
        minDuration: 10,
        maxDuration: 45,
        requiredCapabilities: ['reflection', 'witnessing'],
        safetyLevel: 'low'
      }],
      ['ritual_ceremony', {
        name: 'Ritual Ceremony',
        description: 'Sacred ceremonial practice',
        minDuration: 15,
        maxDuration: 60,
        requiredCapabilities: ['ritual', 'sacred_space'],
        safetyLevel: 'medium'
      }],
      ['archetypal_exploration', {
        name: 'Archetypal Exploration',
        description: 'Journey into archetypal realms',
        minDuration: 20,
        maxDuration: 60,
        requiredCapabilities: ['archetypal', 'depth_work'],
        safetyLevel: 'medium'
      }],
      ['shadow_work', {
        name: 'Shadow Work',
        description: 'Explore hidden aspects',
        minDuration: 20,
        maxDuration: 45,
        requiredCapabilities: ['shadow', 'containment'],
        safetyLevel: 'high'
      }],
      ['elemental_balancing', {
        name: 'Elemental Balancing',
        description: 'Harmonize elemental energies',
        minDuration: 10,
        maxDuration: 30,
        requiredCapabilities: ['elemental', 'energy_work'],
        safetyLevel: 'low'
      }]
    ]);
  }

  // Helper methods
  
  private containsCrisisLanguage(input: string): boolean {
    const crisisTerms = [
      'suicide', 'kill myself', 'end it', 'hurt myself',
      'self-harm', 'can\'t go on', 'no hope'
    ];
    return crisisTerms.some(term => input.includes(term));
  }

  private containsEmotionalLanguage(input: string): boolean {
    const emotionalTerms = [
      'feel', 'feeling', 'emotion', 'sad', 'angry', 'anxious',
      'depressed', 'overwhelmed', 'scared', 'worried'
    ];
    return emotionalTerms.some(term => input.includes(term));
  }

  private containsSpiritualLanguage(input: string): boolean {
    const spiritualTerms = [
      'spiritual', 'soul', 'divine', 'sacred', 'energy',
      'chakra', 'meditation', 'enlightenment', 'awakening'
    ];
    return spiritualTerms.some(term => input.includes(term));
  }

  private containsCelebrationLanguage(input: string): boolean {
    const celebrationTerms = [
      'celebrate', 'joy', 'happy', 'grateful', 'blessed',
      'wonderful', 'amazing', 'breakthrough', 'success'
    ];
    return celebrationTerms.some(term => input.includes(term));
  }

  private calculateElementalVariance(balance: any): number {
    const values = Object.values(balance) as number[];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private getAllFlowTypes(): FlowType[] {
    return Array.from(this.flowTemplates.keys());
  }

  private getAlternativeFlows(primary: FlowType, intent: UserIntent): FlowType[] {
    const alternatives: Record<FlowType, FlowType[]> = {
      'shadow_work': ['journal_reflection', 'oracle_guidance'],
      'archetypal_exploration': ['oracle_guidance', 'journal_reflection'],
      'ritual_ceremony': ['grounding_exercise', 'elemental_balancing'],
      'crisis_support': ['grounding_exercise', 'somatic_practice'],
      'oracle_guidance': ['journal_reflection', 'archetypal_exploration'],
      'journal_reflection': ['oracle_guidance', 'integration_process'],
      'grounding_exercise': ['somatic_practice', 'elemental_balancing'],
      'somatic_practice': ['grounding_exercise', 'journal_reflection'],
      'celebration_acknowledgment': ['oracle_guidance', 'ritual_ceremony'],
      'integration_process': ['journal_reflection', 'oracle_guidance'],
      'dream_analysis': ['journal_reflection', 'archetypal_exploration'],
      'elemental_balancing': ['grounding_exercise', 'ritual_ceremony'],
      'voice_dialogue': ['oracle_guidance', 'journal_reflection']
    };
    
    return alternatives[primary] || ['oracle_guidance'];
  }

  private extractDecisionFactors(
    intent: UserIntent,
    state: StateAssessment,
    routing: SafetyRouting
  ): string[] {
    const factors: string[] = [];
    
    factors.push(`Intent: ${intent}`);
    factors.push(`Emotional stability: ${state.emotional.stability}`);
    
    if (!state.spiritual.grounded) {
      factors.push('Spiritual grounding needed');
    }
    
    if (routing.priorityFlows.length > 0) {
      factors.push(`Safety priority: ${routing.priorityFlows[0]}`);
    }
    
    if (state.cognitive.clarity === 'fatigued') {
      factors.push('User fatigue detected');
    }
    
    return factors;
  }

  private calculateConfidence(
    state: StateAssessment,
    routing: SafetyRouting
  ): number {
    let confidence = 0.8;
    
    if (state.emotional.stability === 'crisis') {
      confidence = 1.0; // High confidence in crisis routing
    } else if (state.emotional.stability === 'unstable') {
      confidence -= 0.1;
    }
    
    if (routing.considerations.length > 2) {
      confidence -= 0.05 * (routing.considerations.length - 2);
    }
    
    return Math.max(0.3, Math.min(1.0, confidence));
  }

  private async recordFlowDecision(
    userId: string,
    flow: FlowType,
    state: StateAssessment,
    safety?: ComprehensiveSafetyResult
  ): Promise<void> {
    try {
      await this.flowMemory.recordFlow(userId, {
        flowType: flow,
        timestamp: new Date(),
        emotionalImpact: 0, // Will be updated post-flow
        effectiveness: 0, // Will be updated post-flow
        safetyLevel: safety?.riskLevel || 'minimal'
      });
      
      await supabase
        .from('orchestration_decisions')
        .insert({
          user_id: userId,
          flow_type: flow,
          emotional_state: state.emotional,
          spiritual_state: state.spiritual,
          safety_level: safety?.riskLevel,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      logger.error('Failed to record flow decision:', error);
    }
  }

  private getFallbackOrchestration(request: OrchestrationRequest): OrchestrationResponse {
    return {
      selectedAgent: 'maya-oracle',
      selectedFlow: 'oracle_guidance',
      flowParameters: {
        intensity: 'gentle',
        duration: 'standard',
        style: 'guided',
        support: 'moderate'
      },
      adaptations: [],
      suggestions: [],
      metadata: {
        decisionFactors: ['Fallback routing'],
        confidenceScore: 0.5,
        alternativeFlows: [],
        safetyConsiderations: []
      }
    };
  }
}

// Type definitions for internal use

interface StateAssessment {
  emotional: {
    stability: 'stable' | 'fluctuating' | 'unstable' | 'crisis';
    intensity: number;
    needsSupport: boolean;
  };
  spiritual: {
    grounded: boolean;
    openness: number;
    readiness: 'low' | 'moderate' | 'high';
  };
  cognitive: {
    clarity: 'clear' | 'foggy' | 'fatigued';
    focus: number;
    receptivity: 'low' | 'moderate' | 'high';
  };
  somatic: {
    tension: 'low' | 'moderate' | 'high';
    energy: 'depleted' | 'balanced' | 'excess' | 'imbalanced';
    breathQuality: 'shallow' | 'normal' | 'deep';
  };
}

interface SafetyRouting {
  allowedFlows: FlowType[];
  restrictedFlows: FlowType[];
  priorityFlows: FlowType[];
  considerations: string[];
}

interface FlowTemplate {
  name: string;
  description: string;
  minDuration: number; // minutes
  maxDuration: number;
  requiredCapabilities: string[];
  safetyLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Export singleton instance
export const orchestrationEngine = new OrchestrationEngine();