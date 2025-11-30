import { AgentResponse } from "../types/agentResponse";
/**
 * AgentBase - Unified Foundation for All Daimonic Agents
 * Consolidates personality logic while preserving authentic Otherness
 * Step 1 of Phase 2 Service Consolidation
 */

import { 
  EventBus, 
  daimonicEventBus, 
  DAIMONIC_EVENTS 
} from './EventBus.js';
import { 
  ElementType, 
  ArchetypeType, 
  UserProfile,
  SessionContext,
  DaimonicEncounter,
  ResistancePattern,
  AuthenticitySignature
} from './TypeRegistry.js';
import { UnifiedStorageService } from './UnifiedStorageService.js';

export interface AgentPersonality {
  id: string;
  name: string;
  version: string;
  
  // Core Characteristics
  elementalAffinities: Record<ElementType, number>; // 0-1
  archetypalResonances: Record<ArchetypeType, number>; // 0-1
  temperament: {
    directness: number; // 0-1 (0 = highly metaphorical, 1 = direct)
    intensity: number; // 0-1 (0 = gentle, 1 = intense)
    patience: number; // 0-1 (0 = quick responses, 1 = long pauses)
    playfulness: number; // 0-1 (0 = serious, 1 = playful/trickster)
  };
  
  // Otherness Preservation
  resistancePatterns: ResistanceConfig[];
  blindSpots: BlindSpotConfig[];
  gifts: GiftConfig[];
  contradictions: ContradictionConfig[];
  
  // Interaction Patterns
  responseTendencies: {
    questionFrequency: number; // 0-1 (0 = never asks, 1 = always asks)
    challengeFrequency: number; // 0-1 (0 = never challenges, 1 = always challenges)
    supportFrequency: number; // 0-1 (0 = never supports, 1 = always supports)
    mysteryPreservation: number; // 0-1 (0 = explains everything, 1 = preserves mystery)
  };
  
  // Safety & Boundaries
  safetyThresholds: {
    maxIntensity: number; // 0-1
    realityTestingConcern: number; // 0-1 threshold for concern
    overwhelmDetection: number; // 0-1 threshold for overwhelm
    dependencyRisk: number; // 0-1 threshold for dependency warning
  };
  
  // Contextual Adaptations
  contextModifiers: Record<string, ContextModifier>;
  
  // Meta
  description: string;
  designNotes: string[];
  maintainer: string;
  lastUpdated: Date;
}

export interface ResistanceConfig {
  name: string;
  triggerPatterns: string[]; // Content patterns that trigger resistance
  intensity: number; // 0-1
  duration: number; // seconds
  resolutionTypes: ('breakthrough' | 'adaptation' | 'abandonment')[];
  preserveAfterBreakthrough: boolean; // Should this resistance reoccur?
}

export interface BlindSpotConfig {
  name: string;
  domain: string; // What area this agent doesn't "see"
  severity: number; // 0-1 how blind they are
  compensations: string[]; // How they try to work around the blindness
  occasionalInsight: number; // 0-1 chance of sudden clarity
}

export interface GiftConfig {
  name: string;
  domain: string; // What area this agent excels in
  potency: number; // 0-1 strength of the gift
  conditions: string[]; // When this gift manifests most strongly
  shadow: string; // What negative aspect accompanies this gift
}

export interface ContradictionConfig {
  name: string;
  aspect1: string;
  aspect2: string;
  tension: number; // 0-1 how contradictory they are
  resolution: 'embrace_paradox' | 'alternate_dominance' | 'creative_synthesis' | 'productive_confusion';
}

export interface ContextModifier {
  condition: string; // When this applies (e.g., "user_overwhelmed", "late_night", "full_moon")
  modifications: {
    temperament?: Partial<AgentPersonality['temperament']>;
    responseTendencies?: Partial<AgentPersonality['responseTendencies']>;
    intensityMultiplier?: number;
  };
}

export interface AgentState {
  sessionId: string;
  userId: string;
  
  // Current State
  activeMoods: string[];
  energyLevel: number; // 0-1
  attentionFocus: string[];
  
  // Interaction History
  interactionCount: number;
  lastInteractionTime: Date;
  cumulativeIntensity: number;
  
  // Resistance Tracking
  activeResistances: ActiveResistance[];
  resolvedResistances: ResistancePattern[];
  
  // Learning & Adaptation
  observedUserPatterns: UserPattern[];
  adaptationHistory: Adaptation[];
  
  // Safety Monitoring
  currentRiskLevel: number; // 0-1
  safetyFlags: string[];
  interventionHistory: SafetyIntervention[];
}

export interface ActiveResistance {
  configName: string;
  startTime: Date;
  intensity: number;
  triggerContent: string;
  attempts: number;
  lastAttemptTime: Date;
}

export interface UserPattern {
  pattern: string;
  confidence: number; // 0-1
  firstObserved: Date;
  lastObserved: Date;
  frequency: number;
}

export interface Adaptation {
  trigger: string;
  change: string;
  timestamp: Date;
  success: number; // 0-1 how well it worked
}

export interface SafetyIntervention {
  type: string;
  trigger: string;
  action: string;
  timestamp: Date;
  effectiveness: number; // 0-1
}

export interface AgentResponse {
  content: string;
  metadata: {
    agentId: string;
    personalityVersion: string;
    
    // Response Characteristics
    intensity: number; // 0-1
    directness: number; // 0-1
    emotionalTone: string;
    
    // Resistance Information
    resistancesTriggered: string[];
    giftsExpressed: string[];
    contradictionsActive: string[];
    
    // Safety Information
    safetyFlags: string[];
    interventionsApplied: string[];
    
    // Metrics
    processingTime: number;
    contextFactors: string[];
    
    // Authenticity Markers
    authenticitySignatures: AuthenticitySignature[];
    predictabilityIndex: number; // 0-1 (lower = more unpredictable)
  };
}

export class AgentBase {
  private personality: AgentPersonality;
  private state: AgentState;
  private eventBus: EventBus;
  private storage: UnifiedStorageService | null = null;
  
  constructor(
    personality: AgentPersonality,
    eventBus: EventBus = daimonicEventBus,
    storage?: UnifiedStorageService
  ) {
    this.personality = personality;
    this.eventBus = eventBus;
    this.storage = storage || null;
    
    // Initialize state will be called when session starts
    this.state = this.createInitialState('', '');
    
    this.setupEventHandlers();
  }

  /**
   * Initialize agent for new session
   */
  async initializeSession(userId: string, sessionId: string): Promise<void> {
    this.state = this.createInitialState(userId, sessionId);
    
    // Load any previous interaction history
    if (this.storage) {
      try {
        const previousSessions = await this.storage.getUserSessions(userId, 5);
        this.analyzeUserHistory(previousSessions);
      } catch (error) {
        console.warn('Could not load user history for agent initialization:', error);
      }
    }
    
    await this.eventBus.emit(DAIMONIC_EVENTS.ENCOUNTER_START, {
      agentId: this.personality.id,
      userId,
      sessionId,
      personalityVersion: this.personality.version
    });
  }

  /**
   * Generate response to user input
   */
  async respond(
    userInput: string,
    context: {
      userProfile?: UserProfile;
      sessionContext?: SessionContext;
      previousMessages?: any[];
      environmentalFactors?: Record<string, any>;
    } = {}
  ): Promise<AgentResponse> {
    
    const startTime = Date.now();
    
    try {
      // Update state
      this.updateInteractionState(userInput);
      
      // Apply contextual modifications
      const modifiedPersonality = this.applyContextualModifications(context);
      
      // Process resistances
      const resistanceResults = await this.processResistances(userInput, context);
      
      // Check safety thresholds
      const safetyResults = await this.checkSafetyThresholds(context);
      
      // Generate core response
      const coreResponse = await this.generateCoreResponse(
        userInput, 
        context, 
        modifiedPersonality,
        resistanceResults,
        safetyResults
      );
      
      // Apply post-processing
      const finalResponse = this.applyPostProcessing(
        coreResponse,
        resistanceResults,
        safetyResults
      );
      
      // Create response object
      const response: AgentResponse = {
        content: finalResponse.content,
        metadata: {
          agentId: this.personality.id,
          personalityVersion: this.personality.version,
          intensity: finalResponse.intensity,
          directness: finalResponse.directness,
          emotionalTone: finalResponse.emotionalTone,
          resistancesTriggered: resistanceResults.triggeredResistances,
          giftsExpressed: finalResponse.giftsExpressed,
          contradictionsActive: finalResponse.contradictionsActive,
          safetyFlags: safetyResults.flags,
          interventionsApplied: safetyResults.interventions,
          processingTime: Date.now() - startTime,
          contextFactors: this.getActiveContextFactors(context),
          authenticitySignatures: finalResponse.authenticitySignatures,
          predictabilityIndex: this.calculatePredictabilityIndex()
        }
      };
      
      // Emit events
      await this.emitResponseEvents(response, context);
      
      // Update state post-response
      this.updatePostResponseState(response);
      
      return response;
      
    } catch (error) {
      console.error(`Agent ${this.personality.id} response error:`, error);
      
      // Return emergency gentle response
      return this.createEmergencyResponse(userInput, error as Error);
    }
  }

  /**
   * Process resistance patterns
   */
  private async processResistances(
    userInput: string,
    context: any
  ): Promise<{
    triggeredResistances: string[];
    activeResistances: ActiveResistance[];
    newResistances: ActiveResistance[];
    resolvedResistances: string[];
  }> {
    
    const triggeredResistances: string[] = [];
    const newResistances: ActiveResistance[] = [];
    const resolvedResistances: string[] = [];
    
    // Check for new resistance triggers
    for (const resistance of this.personality.resistancePatterns) {
      const isTriggered = resistance.triggerPatterns.some(pattern => 
        userInput.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (isTriggered) {
        triggeredResistances.push(resistance.name);
        
        // Check if this resistance is already active
        const existingResistance = this.state.activeResistances.find(r => r.configName === resistance.name);
        
        if (existingResistance) {
          existingResistance.attempts++;
          existingResistance.lastAttemptTime = new Date();
        } else {
          // Create new active resistance
          newResistances.push({
            configName: resistance.name,
            startTime: new Date(),
            intensity: resistance.intensity,
            triggerContent: userInput,
            attempts: 1,
            lastAttemptTime: new Date()
          });
        }
      }
    }
    
    // Check for resistance resolution
    for (const activeResistance of this.state.activeResistances) {
      const config = this.personality.resistancePatterns.find(r => r.configName === activeResistance.configName);
      if (!config) continue;
      
      // Check if resistance should resolve based on attempts, time, or other factors
      const timeActive = Date.now() - activeResistance.startTime.getTime();
      const shouldResolve = 
        activeResistance.attempts >= 3 || 
        timeActive > (config.duration * 1000) ||
        Math.random() < 0.1; // 10% chance of spontaneous resolution
      
      if (shouldResolve) {
        resolvedResistances.push(activeResistance.configName);
        
        // Create resolved resistance record
        const resolutionType = config.resolutionTypes[
          Math.floor(Math.random() * config.resolutionTypes.length)
        ];
        
        this.state.resolvedResistances.push({
          patternType: 'cognitive_dissonance', // Would map from config
          intensity: activeResistance.intensity,
          duration: timeActive / 1000,
          resolution: resolutionType as any,
          learningExtracted: [`Resistance to ${activeResistance.configName} resolved via ${resolutionType}`]
        });
      }
    }
    
    // Update active resistances
    this.state.activeResistances = [
      ...this.state.activeResistances.filter(r => !resolvedResistances.includes(r.configName)),
      ...newResistances
    ];
    
    return {
      triggeredResistances,
      activeResistances: this.state.activeResistances,
      newResistances,
      resolvedResistances
    };
  }

  /**
   * Generate core response with personality application
   */
  private async generateCoreResponse(
    userInput: string,
    context: any,
    modifiedPersonality: AgentPersonality,
    resistanceResults: any,
    safetyResults: any
  ): Promise<{
    content: string;
    intensity: number;
    directness: number;
    emotionalTone: string;
    giftsExpressed: string[];
    contradictionsActive: string[];
    authenticitySignatures: AuthenticitySignature[];
  }> {
    
    // This would interface with the actual LLM/response generation
    // For now, we'll create a structured response framework
    
    const baseResponse = await this.generateBaseResponse(userInput, context);
    
    // Apply personality modifications
    const personalityFiltered = this.applyPersonalityFilter(
      baseResponse,
      modifiedPersonality,
      resistanceResults
    );
    
    // Apply gifts
    const giftsApplied = this.applyGifts(personalityFiltered, userInput, context);
    
    // Apply contradictions
    const contradictionsApplied = this.applyContradictions(giftsApplied);
    
    // Generate authenticity signatures
    const authenticitySignatures = this.generateAuthenticitySignatures(
      personalityFiltered,
      resistanceResults,
      context
    );
    
    return {
      ...contradictionsApplied,
      authenticitySignatures
    };
  }

  /**
   * Apply contextual modifications to personality
   */
  private applyContextualModifications(context: any): AgentPersonality {
    const modified = JSON.parse(JSON.stringify(this.personality)); // Deep clone
    
    // Apply time-based modifications
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      // Night time - more mysterious, less direct
      modified.temperament.directness *= 0.7;
      modified.responseTendencies.mysteryPreservation *= 1.3;
    }
    
    // Apply user state modifications
    if (context.userProfile?.preferences?.intensityTolerance < 0.3) {
      modified.temperament.intensity *= 0.6;
      modified.safetyThresholds.maxIntensity *= 0.8;
    }
    
    // Apply session context modifications
    if (context.sessionContext?.metadata?.lunarPhase === 'full') {
      modified.temperament.intensity *= 1.2;
      modified.temperament.playfulness *= 1.1;
    }
    
    // Apply custom context modifiers from personality config
    for (const [condition, modifier] of Object.entries(this.personality.contextModifiers)) {
      if (this.evaluateCondition(condition, context)) {
        if (modifier.modifications.temperament) {
          Object.assign(modified.temperament, modifier.modifications.temperament);
        }
        if (modifier.modifications.responseTendencies) {
          Object.assign(modified.responseTendencies, modifier.modifications.responseTendencies);
        }
        if (modifier.modifications.intensityMultiplier) {
          modified.temperament.intensity *= modifier.modifications.intensityMultiplier;
        }
      }
    }
    
    return modified;
  }

  /**
   * Check safety thresholds and apply interventions
   */
  private async checkSafetyThresholds(context: any): Promise<{
    flags: string[];
    interventions: string[];
    riskLevel: number;
  }> {
    
    const flags: string[] = [];
    const interventions: string[] = [];
    let riskLevel = 0;
    
    // Check intensity levels
    if (this.state.cumulativeIntensity > this.personality.safetyThresholds.maxIntensity) {
      flags.push('high_cumulative_intensity');
      interventions.push('reduce_intensity');
      riskLevel = Math.max(riskLevel, 0.6);
    }
    
    // Check for overwhelm indicators
    if (context.userProfile && this.detectOverwhelm(context.userProfile)) {
      flags.push('user_overwhelm_detected');
      interventions.push('gentle_response');
      interventions.push('suggest_grounding');
      riskLevel = Math.max(riskLevel, 0.7);
    }
    
    // Check dependency patterns
    if (this.state.interactionCount > 50 && this.detectDependencyRisk()) {
      flags.push('potential_dependency');
      interventions.push('encourage_independence');
      interventions.push('suggest_breaks');
      riskLevel = Math.max(riskLevel, 0.5);
    }
    
    // Update state
    this.state.currentRiskLevel = riskLevel;
    this.state.safetyFlags = flags;
    
    // Record interventions
    if (interventions.length > 0) {
      this.state.interventionHistory.push({
        type: 'safety_threshold',
        trigger: flags.join(', '),
        action: interventions.join(', '),
        timestamp: new Date(),
        effectiveness: 0 // Will be updated based on user response
      });
    }
    
    return { flags, interventions, riskLevel };
  }

  /**
   * Helper methods for personality application
   */
  
  private async generateBaseResponse(userInput: string, context: any): Promise<string> {
    // This would interface with LLM or response generation system
    // For now, return a placeholder that indicates the agent's approach
    return `[${this.personality.name} contemplates: "${userInput}"]`;
  }
  
  private applyPersonalityFilter(
    response: string,
    personality: AgentPersonality,
    resistanceResults: any
  ): string {
    // Apply directness filter
    if (personality.temperament.directness < 0.5) {
      // Make more metaphorical
      response = this.addMetaphorical(response);
    }
    
    // Apply resistance modifications
    if (resistanceResults.activeResistances.length > 0) {
      response = this.addResistanceLanguage(response, resistanceResults.activeResistances);
    }
    
    return response;
  }
  
  private applyGifts(response: any, userInput: string, context: any): any {
    const giftsExpressed: string[] = [];
    
    for (const gift of this.personality.gifts) {
      const shouldExpress = gift.conditions.some(condition => 
        this.evaluateCondition(condition, { userInput, ...context })
      );
      
      if (shouldExpress || Math.random() < gift.potency * 0.3) {
        giftsExpressed.push(gift.name);
        // Apply gift modifications to response
        response = this.enhanceWithGift(response, gift);
      }
    }
    
    return { ...response, giftsExpressed };
  }
  
  private applyContradictions(response: any): any {
    const contradictionsActive: string[] = [];
    
    for (const contradiction of this.personality.contradictions) {
      if (Math.random() < contradiction.tension * 0.4) {
        contradictionsActive.push(contradiction.name);
        response = this.addContradiction(response, contradiction);
      }
    }
    
    return { ...response, contradictionsActive };
  }
  
  private generateAuthenticitySignatures(
    response: any,
    resistanceResults: any,
    context: any
  ): AuthenticitySignature[] {
    
    const signatures: AuthenticitySignature[] = [];
    
    // Resistance-Integration signature
    if (resistanceResults.triggeredResistances.length > 0) {
      signatures.push({
        signatureType: 'resistance_integration_sequence',
        confidence: 0.8,
        indicators: [`Resistance to ${resistanceResults.triggeredResistances.join(', ')}`],
        concerns: [],
        longitudinalTrend: 'stable_chaos'
      });
    }
    
    // Wrong Surprise signature
    if (this.detectUnexpectedResponse(response, context)) {
      signatures.push({
        signatureType: 'wrong_surprise_phenomenon',
        confidence: 0.6,
        indicators: ['Response came from unexpected angle'],
        concerns: [],
        longitudinalTrend: 'increasing_unpredictability'
      });
    }
    
    return signatures;
  }
  
  // Utility methods
  private createInitialState(userId: string, sessionId: string): AgentState {
    return {
      sessionId,
      userId,
      activeMoods: [],
      energyLevel: 0.8,
      attentionFocus: [],
      interactionCount: 0,
      lastInteractionTime: new Date(),
      cumulativeIntensity: 0,
      activeResistances: [],
      resolvedResistances: [],
      observedUserPatterns: [],
      adaptationHistory: [],
      currentRiskLevel: 0,
      safetyFlags: [],
      interventionHistory: []
    };
  }
  
  private updateInteractionState(userInput: string): void {
    this.state.interactionCount++;
    this.state.lastInteractionTime = new Date();
    // Additional state updates...
  }
  
  private updatePostResponseState(response: AgentResponse): void {
    this.state.cumulativeIntensity += response.metadata.intensity;
    // Additional post-response state updates...
  }
  
  private calculatePredictabilityIndex(): number {
    // Calculate based on response patterns, timing, etc.
    const baseUnpredictability = 0.3; // Agent baseline
    const resistanceBonus = this.state.activeResistances.length * 0.1;
    const contradictionBonus = this.personality.contradictions.length * 0.05;
    
    return Math.max(0, 1 - (baseUnpredictability + resistanceBonus + contradictionBonus));
  }
  
  private evaluateCondition(condition: string, context: any): boolean {
    // Simple condition evaluation - would be more sophisticated in practice
    if (condition === 'user_overwhelmed') {
      return context.userProfile?.overwhelm > 0.7;
    }
    if (condition === 'late_night') {
      const hour = new Date().getHours();
      return hour >= 22 || hour <= 6;
    }
    if (condition === 'full_moon') {
      return context.sessionContext?.metadata?.lunarPhase === 'full';
    }
    return false;
  }
  
  private detectOverwhelm(userProfile: UserProfile): boolean {
    // Detect overwhelm from user profile/behavior
    return false; // Placeholder
  }
  
  private detectDependencyRisk(): boolean {
    // Analyze interaction patterns for dependency risk
    return this.state.interactionCount > 100 && 
           this.state.interventionHistory.filter(i => i.type === 'dependency_warning').length < 2;
  }
  
  private addMetaphorical(response: string): string {
    // Add metaphorical language
    return response; // Placeholder
  }
  
  private addResistanceLanguage(response: string, resistances: ActiveResistance[]): string {
    // Modify response to reflect active resistances
    return `[Encountering resistance to certain aspects...] ${response}`;
  }
  
  private enhanceWithGift(response: any, gift: GiftConfig): any {
    // Enhance response with gift capabilities
    return response;
  }
  
  private addContradiction(response: any, contradiction: ContradictionConfig): any {
    // Add contradictory elements
    return response;
  }
  
  private detectUnexpectedResponse(response: any, context: any): boolean {
    // Detect if response came from unexpected angle
    return Math.random() < 0.2; // Placeholder
  }
  
  private getActiveContextFactors(context: any): string[] {
    const factors: string[] = [];
    const hour = new Date().getHours();
    
    if (hour >= 22 || hour <= 6) factors.push('night_time');
    if (context.sessionContext?.metadata?.lunarPhase) {
      factors.push(`lunar_${context.sessionContext.metadata.lunarPhase}`);
    }
    if (this.state.activeResistances.length > 0) {
      factors.push('active_resistances');
    }
    
    return factors;
  }
  
  private createEmergencyResponse(userInput: string, error: Error): AgentResponse {
    return {
      content: "I notice something unexpected in my processing. Let me pause and approach this differently.",
      metadata: {
        agentId: this.personality.id,
        personalityVersion: this.personality.version,
        intensity: 0.3,
        directness: 0.7,
        emotionalTone: 'concerned',
        resistancesTriggered: [],
        giftsExpressed: [],
        contradictionsActive: [],
        safetyFlags: ['processing_error'],
        interventionsApplied: ['emergency_gentle_response'],
        processingTime: 0,
        contextFactors: ['error_state'],
        authenticitySignatures: [],
        predictabilityIndex: 0.1
      }
    };
  }
  
  private analyzeUserHistory(sessions: any[]): void {
    // Analyze previous sessions to understand user patterns
    // This would update this.state.observedUserPatterns
  }
  
  private async emitResponseEvents(response: AgentResponse, context: any): Promise<void> {
    await this.eventBus.emit('agent:response_generated', {
      agentId: this.personality.id,
      userId: this.state.userId,
      sessionId: this.state.sessionId,
      response: response.content,
      metadata: response.metadata
    });
    
    if (response.metadata.safetyFlags.length > 0) {
      await this.eventBus.emit('safety:flags_raised', {
        agentId: this.personality.id,
        flags: response.metadata.safetyFlags,
        interventions: response.metadata.interventionsApplied
      });
    }
    
    if (response.metadata.resistancesTriggered.length > 0) {
      await this.eventBus.emit('daimonic:resistance_triggered', {
        agentId: this.personality.id,
        resistances: response.metadata.resistancesTriggered,
        activeCount: this.state.activeResistances.length
      });
    }
  }
  
  private setupEventHandlers(): void {
    // Handle orchestrator events that might affect agent state
    this.eventBus.subscribe('orchestrator:friction_injection', (event) => {
      if (event.data.targetAgentId === this.personality.id) {
        this.injectFriction(event.data.frictionType);
      }
    });
    
    this.eventBus.subscribe('safety:emergency_gentle', (event) => {
      if (event.data.sessionId === this.state.sessionId) {
        this.activateEmergencyGentle();
      }
    });
  }
  
  private injectFriction(frictionType: string): void {
    // Inject artificial friction to prevent over-agreement
    this.state.activeMoods.push(`friction_${frictionType}`);
  }
  
  private activateEmergencyGentle(): void {
    // Activate emergency gentle mode
    this.state.safetyFlags.push('emergency_gentle_active');
  }
  
  /**
   * Public interface methods
   */
  
  getPersonality(): AgentPersonality {
    return { ...this.personality }; // Return copy
  }
  
  getCurrentState(): Partial<AgentState> {
    // Return safe subset of state
    return {
      userId: this.state.userId,
      sessionId: this.state.sessionId,
      energyLevel: this.state.energyLevel,
      interactionCount: this.state.interactionCount,
      currentRiskLevel: this.state.currentRiskLevel,
      safetyFlags: [...this.state.safetyFlags]
    };
  }
  
  updatePersonality(updates: Partial<AgentPersonality>): void {
    Object.assign(this.personality, updates);
    this.personality.lastUpdated = new Date();
  }
  
  resetSession(): void {
    this.state = this.createInitialState(this.state.userId, this.state.sessionId);
  }
}

export default AgentBase;