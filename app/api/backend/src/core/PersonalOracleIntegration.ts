import { AgentResponse } from "../types/agentResponse";
/**
 * PersonalOracle Integration Layer
 * Connects CapacitySignals with PersonalOracleAgent for stage-appropriate responses
 * Ensures stage transitions feel natural and earned, not arbitrary
 */

import { EventBus, daimonicEventBus } from './EventBus.js';
import { UnifiedStorageService } from './UnifiedStorageService.js';
import { AgentBase, AgentResponse, AgentPersonality } from './AgentBase.js';
import { AgentConfigLoader } from './AgentConfigLoader.js';
import { 
  CapacitySignalsFramework, 
  CapacitySignals, 
  PersonalOracleStage 
} from './CapacitySignalsFramework.js';
import { UserProfile, SessionContext } from './TypeRegistry.js';

export interface StageConfiguration {
  stage: PersonalOracleStage;
  
  // Agent Selection
  preferredAgents: string[];
  availableAgents: string[];
  restrictedAgents: string[];
  
  // Response Characteristics
  responseStyle: {
    maxComplexity: number;        // 0-1
    metaphorUsage: number;        // 0-1
    challengeFrequency: number;   // 0-1
    mysteryPreservation: number;  // 0-1
    structureLevel: number;       // 0-1 (higher = more structured)
  };
  
  // Safety Parameters
  safetySettings: {
    maxIntensity: number;         // 0-1
    realityTestingLevel: number;  // 0-1 (higher = more reality checking)
    groundingFrequency: number;   // 0-1
    boundaryClarifiation: number; // 0-1
  };
  
  // Content Guidelines
  contentFilters: {
    allowArchetypalContent: boolean;
    allowParadoxicalContent: boolean;
    allowTranscendentContent: boolean;
    requirePracticalAnchors: boolean;
    limitAbstractConcepts: boolean;
  };
  
  // Transition Conditions
  upgradeConditions: StageUpgradeCondition[];
  downgradeConditions: StageDowngradeCondition[];
}

export interface StageUpgradeCondition {
  name: string;
  requirements: {
    trustThreshold?: number;
    engagementThreshold?: number;
    integrationThreshold?: number;
    sustainedSessions?: number; // Must maintain threshold for X sessions
    noSafetyFlags?: boolean;
  };
  confidenceRequired: number; // 0-1 confidence in signal measurements
}

export interface StageDowngradeCondition {
  name: string;
  triggers: {
    safetyFlag?: boolean;
    trustBelow?: number;
    engagementBelow?: number;
    integrationBelow?: number;
    sessionGap?: number; // days without session
  };
  immediate: boolean; // Whether to downgrade immediately or gradually
}

export interface PersonalOracleSession {
  sessionId: string;
  userId: string;
  
  // Stage Management
  currentStage: PersonalOracleStage;
  stageHistory: StageTransition[];
  stageChangeReason?: string;
  
  // Capacity Assessment
  capacitySignals: CapacitySignals;
  signalTrends: SignalTrend[];
  
  // Response Generation
  selectedAgent: string;
  stageConfiguration: StageConfiguration;
  responseMetadata: PersonalOracleResponseMetadata;
  
  // Session Tracking
  startTime: Date;
  lastActivity: Date;
  interactionCount: number;
  userMessages: string[];
  agentResponses: AgentResponse[];
}

export interface StageTransition {
  fromStage: PersonalOracleStage;
  toStage: PersonalOracleStage;
  timestamp: Date;
  trigger: string;
  capacitySignalsAtTime: CapacitySignals;
  userNotified: boolean;
}

export interface SignalTrend {
  signalType: 'trust' | 'engagement_depth' | 'integration_skill';
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number; // 0-1
  duration: number; // days
}

export interface PersonalOracleResponseMetadata {
  stageAppropriateness: number; // 0-1 how well response fits stage
  complexityLevel: number;      // 0-1 actual complexity delivered
  safetyMeasures: string[];     // Applied safety measures
  stageExplanation: string;     // Why this stage was chosen
  adaptations: string[];        // How response was adapted for stage
}

export class PersonalOracleIntegration {
  private capacityFramework: CapacitySignalsFramework;
  private agentLoader: AgentConfigLoader;
  private eventBus: EventBus;
  private storage: UnifiedStorageService;
  
  // Stage configurations
  private stageConfigurations: Map<PersonalOracleStage, StageConfiguration>;
  
  // Active sessions
  private activeSessions: Map<string, PersonalOracleSession> = new Map();
  
  // User stage history for transition logic
  private userStageHistory: Map<string, StageTransition[]> = new Map();

  constructor(
    capacityFramework: CapacitySignalsFramework,
    agentLoader: AgentConfigLoader,
    eventBus: EventBus = daimonicEventBus,
    storage: UnifiedStorageService
  ) {
    this.capacityFramework = capacityFramework;
    this.agentLoader = agentLoader;
    this.eventBus = eventBus;
    this.storage = storage;
    
    this.stageConfigurations = this.createStageConfigurations();
    this.setupEventHandlers();
  }

  /**
   * Initialize PersonalOracle session with capacity assessment
   */
  async initializeSession(
    userId: string,
    sessionId: string,
    context: {
      userProfile?: UserProfile;
      sessionContext?: SessionContext;
      previousMessages?: any[];
    }
  ): Promise<PersonalOracleSession> {
    
    try {
      // Get current capacity signals
      let capacitySignals = await this.capacityFramework.getCurrentSignals(userId);
      
      // If no existing signals, create initial assessment
      if (!capacitySignals) {
        capacitySignals = {
          trust: 0.2,           // Start conservatively
          engagementDepth: 0.3,
          integrationSkill: 0.1,
          safetyFlag: false,
          lastUpdated: new Date(),
          sessionCount: 0,
          confidenceLevel: 0.3, // Low confidence initially
          trajectory: 'building'
        };
      }
      
      // Determine appropriate stage
      const currentStage = this.capacityFramework.determineStage(capacitySignals);
      const stageConfiguration = this.stageConfigurations.get(currentStage)!;
      
      // Select appropriate agent for this stage
      const selectedAgent = await this.selectStageAppropriateAgent(
        currentStage,
        stageConfiguration,
        context
      );
      
      // Create session
      const session: PersonalOracleSession = {
        sessionId,
        userId,
        currentStage,
        stageHistory: [],
        capacitySignals,
        signalTrends: await this.calculateSignalTrends(userId),
        selectedAgent,
        stageConfiguration,
        responseMetadata: {
          stageAppropriateness: 1.0,
          complexityLevel: stageConfiguration.responseStyle.maxComplexity,
          safetyMeasures: [],
          stageExplanation: this.explainStageSelection(currentStage, capacitySignals),
          adaptations: []
        },
        startTime: new Date(),
        lastActivity: new Date(),
        interactionCount: 0,
        userMessages: [],
        agentResponses: []
      };
      
      // Store session
      this.activeSessions.set(sessionId, session);
      
      // Emit session initialization event
      await this.eventBus.emit('personal_oracle:session_initialized', {
        userId,
        sessionId,
        stage: currentStage,
        capacitySignals,
        selectedAgent
      });
      
      return session;
      
    } catch (error) {
      console.error('Error initializing PersonalOracle session:', error);
      
      // Return safe fallback session
      const fallbackSession: PersonalOracleSession = {
        sessionId,
        userId,
        currentStage: 'structured_guide',
        stageHistory: [],
        capacitySignals: {
          trust: 0.1,
          engagementDepth: 0.1,
          integrationSkill: 0.1,
          safetyFlag: true,
          lastUpdated: new Date(),
          sessionCount: 0,
          confidenceLevel: 0.1,
          trajectory: 'volatile'
        },
        signalTrends: [],
        selectedAgent: 'aunt_annie', // Safest agent
        stageConfiguration: this.stageConfigurations.get('structured_guide')!,
        responseMetadata: {
          stageAppropriateness: 1.0,
          complexityLevel: 0.2,
          safetyMeasures: ['error_recovery', 'conservative_defaults'],
          stageExplanation: 'Error in assessment - using safe defaults',
          adaptations: ['fallback_to_structured_guide']
        },
        startTime: new Date(),
        lastActivity: new Date(),
        interactionCount: 0,
        userMessages: [],
        agentResponses: []
      };
      
      this.activeSessions.set(sessionId, fallbackSession);
      return fallbackSession;
    }
  }

  /**
   * Generate stage-appropriate response
   */
  async generateResponse(
    sessionId: string,
    userInput: string,
    context: any = {}
  ): Promise<{
    response: AgentResponse;
    session: PersonalOracleSession;
    stageChanged: boolean;
  }> {
    
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    try {
      // Update session tracking
      session.lastActivity = new Date();
      session.interactionCount++;
      session.userMessages.push(userInput);
      
      // Check for capacity signal updates
      const updatedSignals = await this.assessCapacityDuringSession(
        session,
        userInput,
        context
      );
      
      // Determine if stage change is needed
      const stageChangeResult = await this.checkForStageChange(
        session,
        updatedSignals
      );
      
      let finalStage = session.currentStage;
      let stageChanged = false;
      
      if (stageChangeResult.shouldChange) {
        finalStage = stageChangeResult.newStage!;
        stageChanged = true;
        
        // Update session with new stage
        await this.transitionToStage(session, finalStage, stageChangeResult.reason!);
      }
      
      // Generate response with current stage agent
      const agent = this.agentLoader.agents?.get(session.selectedAgent);
      if (!agent) {
        throw new Error(`Agent ${session.selectedAgent} not found`);
      }
      
      // Apply stage-appropriate modifications to context
      const stageAdaptedContext = this.adaptContextForStage(
        context,
        session.stageConfiguration,
        session.capacitySignals
      );
      
      // Generate response
      const response = await agent.respond(userInput, stageAdaptedContext);
      
      // Apply stage-appropriate post-processing
      const processedResponse = this.postProcessForStage(
        response,
        session.stageConfiguration,
        session.capacitySignals
      );
      
      // Update session
      session.agentResponses.push(processedResponse);
      session.responseMetadata = {
        stageAppropriateness: this.calculateStageAppropriateness(
          processedResponse,
          session.stageConfiguration
        ),
        complexityLevel: this.calculateResponseComplexity(processedResponse),
        safetyMeasures: this.extractSafetyMeasures(processedResponse),
        stageExplanation: this.explainStageSelection(finalStage, session.capacitySignals),
        adaptations: this.listResponseAdaptations(response, processedResponse)
      };
      
      // Emit response event
      await this.eventBus.emit('personal_oracle:response_generated', {
        userId: session.userId,
        sessionId,
        stage: finalStage,
        response: processedResponse,
        stageChanged,
        capacitySignals: session.capacitySignals
      });
      
      return {
        response: processedResponse,
        session,
        stageChanged
      };
      
    } catch (error) {
      console.error('Error generating PersonalOracle response:', error);
      
      // Generate emergency gentle response
      const emergencyResponse: AgentResponse = {
        content: "I notice something unexpected in my processing. Let me pause and approach this more simply. How are you feeling right now?",
        metadata: {
          agentId: session.selectedAgent,
          personalityVersion: '2.0.0',
          intensity: 0.2,
          directness: 0.8,
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
      
      session.agentResponses.push(emergencyResponse);
      
      return {
        response: emergencyResponse,
        session,
        stageChanged: false
      };
    }
  }

  /**
   * Create stage-specific configurations
   */
  private createStageConfigurations(): Map<PersonalOracleStage, StageConfiguration> {
    const configurations = new Map<PersonalOracleStage, StageConfiguration>();
    
    // Stage 1: Structured Guide
    configurations.set('structured_guide', {
      stage: 'structured_guide',
      preferredAgents: ['aunt_annie'],
      availableAgents: ['aunt_annie', 'emily'],
      restrictedAgents: ['matrix_oracle'],
      responseStyle: {
        maxComplexity: 0.3,
        metaphorUsage: 0.2,
        challengeFrequency: 0.1,
        mysteryPreservation: 0.1,
        structureLevel: 0.9
      },
      safetySettings: {
        maxIntensity: 0.4,
        realityTestingLevel: 0.9,
        groundingFrequency: 0.8,
        boundaryClarifiation: 0.9
      },
      contentFilters: {
        allowArchetypalContent: false,
        allowParadoxicalContent: false,
        allowTranscendentContent: false,
        requirePracticalAnchors: true,
        limitAbstractConcepts: true
      },
      upgradeConditions: [{
        name: 'trust_threshold',
        requirements: {
          trustThreshold: 0.35,
          sustainedSessions: 3,
          noSafetyFlags: true
        },
        confidenceRequired: 0.6
      }],
      downgradeConditions: [{
        name: 'safety_trigger',
        triggers: { safetyFlag: true },
        immediate: true
      }]
    });
    
    // Stage 2: Dialogical Companion
    configurations.set('dialogical_companion', {
      stage: 'dialogical_companion',
      preferredAgents: ['aunt_annie', 'emily'],
      availableAgents: ['aunt_annie', 'emily', 'matrix_oracle'],
      restrictedAgents: [],
      responseStyle: {
        maxComplexity: 0.6,
        metaphorUsage: 0.5,
        challengeFrequency: 0.4,
        mysteryPreservation: 0.4,
        structureLevel: 0.6
      },
      safetySettings: {
        maxIntensity: 0.6,
        realityTestingLevel: 0.7,
        groundingFrequency: 0.6,
        boundaryClarifiation: 0.7
      },
      contentFilters: {
        allowArchetypalContent: true,
        allowParadoxicalContent: false,
        allowTranscendentContent: false,
        requirePracticalAnchors: true,
        limitAbstractConcepts: false
      },
      upgradeConditions: [{
        name: 'engagement_integration',
        requirements: {
          trustThreshold: 0.6,
          engagementThreshold: 0.6,
          integrationThreshold: 0.5,
          sustainedSessions: 5
        },
        confidenceRequired: 0.7
      }],
      downgradeConditions: [
        {
          name: 'safety_trigger',
          triggers: { safetyFlag: true },
          immediate: true
        },
        {
          name: 'trust_decline',
          triggers: { trustBelow: 0.25 },
          immediate: false
        }
      ]
    });
    
    // Stage 3: Co-Creative Partner
    configurations.set('co_creative_partner', {
      stage: 'co_creative_partner',
      preferredAgents: ['emily', 'matrix_oracle'],
      availableAgents: ['aunt_annie', 'emily', 'matrix_oracle'],
      restrictedAgents: [],
      responseStyle: {
        maxComplexity: 0.8,
        metaphorUsage: 0.7,
        challengeFrequency: 0.6,
        mysteryPreservation: 0.7,
        structureLevel: 0.4
      },
      safetySettings: {
        maxIntensity: 0.8,
        realityTestingLevel: 0.5,
        groundingFrequency: 0.4,
        boundaryClarifiation: 0.5
      },
      contentFilters: {
        allowArchetypalContent: true,
        allowParadoxicalContent: true,
        allowTranscendentContent: true,
        requirePracticalAnchors: false,
        limitAbstractConcepts: false
      },
      upgradeConditions: [{
        name: 'full_capacity',
        requirements: {
          trustThreshold: 0.8,
          engagementThreshold: 0.8,
          integrationThreshold: 0.7,
          sustainedSessions: 8
        },
        confidenceRequired: 0.8
      }],
      downgradeConditions: [
        {
          name: 'safety_trigger',
          triggers: { safetyFlag: true },
          immediate: true
        },
        {
          name: 'capacity_decline',
          triggers: { 
            trustBelow: 0.5,
            engagementBelow: 0.5
          },
          immediate: false
        }
      ]
    });
    
    // Stage 4: Transparent Prism
    configurations.set('transparent_prism', {
      stage: 'transparent_prism',
      preferredAgents: ['matrix_oracle'],
      availableAgents: ['emily', 'matrix_oracle'],
      restrictedAgents: [],
      responseStyle: {
        maxComplexity: 1.0,
        metaphorUsage: 0.9,
        challengeFrequency: 0.8,
        mysteryPreservation: 1.0,
        structureLevel: 0.2
      },
      safetySettings: {
        maxIntensity: 1.0,
        realityTestingLevel: 0.3,
        groundingFrequency: 0.2,
        boundaryClarifiation: 0.3
      },
      contentFilters: {
        allowArchetypalContent: true,
        allowParadoxicalContent: true,
        allowTranscendentContent: true,
        requirePracticalAnchors: false,
        limitAbstractConcepts: false
      },
      upgradeConditions: [], // No upgrade from highest stage
      downgradeConditions: [
        {
          name: 'safety_trigger',
          triggers: { safetyFlag: true },
          immediate: true
        },
        {
          name: 'capacity_decline',
          triggers: { 
            trustBelow: 0.7,
            engagementBelow: 0.7,
            integrationBelow: 0.6
          },
          immediate: false
        },
        {
          name: 'long_absence',
          triggers: { sessionGap: 21 }, // 3 weeks
          immediate: false
        }
      ]
    });
    
    return configurations;
  }

  /**
   * Select appropriate agent for current stage
   */
  private async selectStageAppropriateAgent(
    stage: PersonalOracleStage,
    configuration: StageConfiguration,
    context: any
  ): Promise<string> {
    
    // Get available agents for this stage
    const availableAgents = configuration.availableAgents;
    const preferredAgents = configuration.preferredAgents;
    const restrictedAgents = configuration.restrictedAgents;
    
    // Filter out restricted agents
    const eligibleAgents = availableAgents.filter(agent => 
      !restrictedAgents.includes(agent)
    );
    
    // Try preferred agents first
    for (const agent of preferredAgents) {
      if (eligibleAgents.includes(agent)) {
        return agent;
      }
    }
    
    // Fallback to any eligible agent
    if (eligibleAgents.length > 0) {
      return eligibleAgents[0];
    }
    
    // Emergency fallback
    return 'aunt_annie';
  }

  /**
   * Assess capacity signals during active session
   */
  private async assessCapacityDuringSession(
    session: PersonalOracleSession,
    userInput: string,
    context: any
  ): Promise<CapacitySignals> {
    
    // Build session data for capacity measurement
    const sessionData = {
      userMessages: [...session.userMessages, userInput],
      agentResponses: session.agentResponses.map(r => r.content),
      sessionDuration: (Date.now() - session.startTime.getTime()) / (1000 * 60), // minutes
      userReportedState: context.userReportedState,
      behaviorObservations: context.behaviorObservations
    };
    
    // Measure updated capacity signals
    const updatedSignals = await this.capacityFramework.measureCapacitySignals(
      session.userId,
      session.sessionId,
      sessionData
    );
    
    // Update session with new signals
    session.capacitySignals = updatedSignals;
    
    return updatedSignals;
  }

  /**
   * Check if stage change is needed
   */
  private async checkForStageChange(
    session: PersonalOracleSession,
    updatedSignals: CapacitySignals
  ): Promise<{
    shouldChange: boolean;
    newStage?: PersonalOracleStage;
    reason?: string;
  }> {
    
    const currentStage = session.currentStage;
    const configuration = session.stageConfiguration;
    
    // Check downgrade conditions first (safety priority)
    for (const condition of configuration.downgradeConditions) {
      if (this.evaluateDowngradeCondition(condition, updatedSignals, session)) {
        const newStage = this.determineDowngradeStage(currentStage, condition);
        return {
          shouldChange: true,
          newStage,
          reason: `Downgrade triggered: ${condition.name}`
        };
      }
    }
    
    // Check upgrade conditions
    for (const condition of configuration.upgradeConditions) {
      if (await this.evaluateUpgradeCondition(condition, updatedSignals, session)) {
        const newStage = this.determineUpgradeStage(currentStage);
        return {
          shouldChange: true,
          newStage,
          reason: `Upgrade earned: ${condition.name}`
        };
      }
    }
    
    return { shouldChange: false };
  }

  /**
   * Transition session to new stage
   */
  private async transitionToStage(
    session: PersonalOracleSession,
    newStage: PersonalOracleStage,
    reason: string
  ): Promise<void> {
    
    const oldStage = session.currentStage;
    
    // Create transition record
    const transition: StageTransition = {
      fromStage: oldStage,
      toStage: newStage,
      timestamp: new Date(),
      trigger: reason,
      capacitySignalsAtTime: { ...session.capacitySignals },
      userNotified: false
    };
    
    // Update session
    session.currentStage = newStage;
    session.stageHistory.push(transition);
    session.stageConfiguration = this.stageConfigurations.get(newStage)!;
    session.stageChangeReason = reason;
    
    // Update selected agent if needed
    const newAgent = await this.selectStageAppropriateAgent(
      newStage,
      session.stageConfiguration,
      {}
    );
    
    if (newAgent !== session.selectedAgent) {
      session.selectedAgent = newAgent;
    }
    
    // Store transition in user history
    let userHistory = this.userStageHistory.get(session.userId) || [];
    userHistory.push(transition);
    this.userStageHistory.set(session.userId, userHistory);
    
    // Emit stage change event
    await this.eventBus.emit('personal_oracle:stage_changed', {
      userId: session.userId,
      sessionId: session.sessionId,
      fromStage: oldStage,
      toStage: newStage,
      reason,
      capacitySignals: session.capacitySignals
    });
  }

  // Helper methods for stage evaluation and adaptation
  private evaluateDowngradeCondition(
    condition: StageDowngradeCondition,
    signals: CapacitySignals,
    session: PersonalOracleSession
  ): boolean {
    
    if (condition.triggers.safetyFlag && signals.safetyFlag) return true;
    if (condition.triggers.trustBelow && signals.trust < condition.triggers.trustBelow) return true;
    if (condition.triggers.engagementBelow && signals.engagementDepth < condition.triggers.engagementBelow) return true;
    if (condition.triggers.integrationBelow && signals.integrationSkill < condition.triggers.integrationBelow) return true;
    
    return false;
  }

  private async evaluateUpgradeCondition(
    condition: StageUpgradeCondition,
    signals: CapacitySignals,
    session: PersonalOracleSession
  ): Promise<boolean> {
    
    const req = condition.requirements;
    
    // Check individual thresholds
    if (req.trustThreshold && signals.trust < req.trustThreshold) return false;
    if (req.engagementThreshold && signals.engagementDepth < req.engagementThreshold) return false;
    if (req.integrationThreshold && signals.integrationSkill < req.integrationThreshold) return false;
    if (req.noSafetyFlags && signals.safetyFlag) return false;
    
    // Check confidence requirement
    if (signals.confidenceLevel < condition.confidenceRequired) return false;
    
    // Check sustained sessions requirement
    if (req.sustainedSessions) {
      const userHistory = this.userStageHistory.get(session.userId) || [];
      const recentTransitions = userHistory.filter(t => 
        Date.now() - t.timestamp.getTime() < (30 * 24 * 60 * 60 * 1000) // Last 30 days
      );
      
      // If there have been recent downgrades, require more stability
      if (recentTransitions.some(t => this.isDowngrade(t.fromStage, t.toStage))) {
        return false;
      }
    }
    
    return true;
  }

  private determineUpgradeStage(currentStage: PersonalOracleStage): PersonalOracleStage {
    switch (currentStage) {
      case 'structured_guide': return 'dialogical_companion';
      case 'dialogical_companion': return 'co_creative_partner';
      case 'co_creative_partner': return 'transparent_prism';
      case 'transparent_prism': return 'transparent_prism'; // No upgrade beyond
    }
  }

  private determineDowngradeStage(currentStage: PersonalOracleStage, condition: StageDowngradeCondition): PersonalOracleStage {
    // Safety flags always go to structured guide
    if (condition.triggers.safetyFlag) {
      return 'structured_guide';
    }
    
    // Otherwise downgrade one level
    switch (currentStage) {
      case 'transparent_prism': return 'co_creative_partner';
      case 'co_creative_partner': return 'dialogical_companion';
      case 'dialogical_companion': return 'structured_guide';
      case 'structured_guide': return 'structured_guide'; // Can't go lower
    }
  }

  private isDowngrade(fromStage: PersonalOracleStage, toStage: PersonalOracleStage): boolean {
    const stageOrder = ['structured_guide', 'dialogical_companion', 'co_creative_partner', 'transparent_prism'];
    return stageOrder.indexOf(fromStage) > stageOrder.indexOf(toStage);
  }

  private adaptContextForStage(context: any, configuration: StageConfiguration, signals: CapacitySignals): any {
    const adapted = { ...context };
    
    // Add stage-specific context
    adapted.stageConfiguration = configuration;
    adapted.capacitySignals = signals;
    adapted.maxComplexity = configuration.responseStyle.maxComplexity;
    adapted.safetySettings = configuration.safetySettings;
    
    return adapted;
  }

  private postProcessForStage(
    response: AgentResponse,
    configuration: StageConfiguration,
    signals: CapacitySignals
  ): AgentResponse {
    
    const processed = { ...response };
    
    // Apply content filters
    if (configuration.contentFilters.limitAbstractConcepts) {
      processed.content = this.simplifyAbstractConcepts(processed.content);
    }
    
    if (configuration.contentFilters.requirePracticalAnchors) {
      processed.content = this.addPracticalAnchors(processed.content);
    }
    
    // Apply safety measures
    if (configuration.safetySettings.groundingFrequency > 0.5) {
      processed.content = this.addGroundingElements(processed.content);
    }
    
    // Adjust intensity if needed
    if (processed.metadata.intensity > configuration.safetySettings.maxIntensity) {
      processed.content = this.reduceIntensity(processed.content);
      processed.metadata.intensity = configuration.safetySettings.maxIntensity;
      processed.metadata.interventionsApplied.push('intensity_reduction');
    }
    
    return processed;
  }

  // Helper methods for content adaptation
  private simplifyAbstractConcepts(content: string): string {
    // Implementation would replace complex language with simpler alternatives
    return content; // Placeholder
  }
  
  private addPracticalAnchors(content: string): string {
    // Implementation would add concrete examples or applications
    return content; // Placeholder
  }
  
  private addGroundingElements(content: string): string {
    // Implementation would add grounding suggestions or reality checks
    return content; // Placeholder
  }
  
  private reduceIntensity(content: string): string {
    // Implementation would soften intense language or concepts
    return content; // Placeholder
  }

  private calculateStageAppropriateness(response: AgentResponse, configuration: StageConfiguration): number {
    // Calculate how well response matches stage requirements
    return 0.8; // Placeholder
  }

  private calculateResponseComplexity(response: AgentResponse): number {
    // Analyze actual complexity of generated response
    const wordCount = response.content.split(' ').length;
    const conceptualWords = (response.content.match(/\b(meaning|purpose|connection|pattern|insight|understanding|relationship|significance|paradox|mystery)\b/gi) || []).length;
    
    const complexityScore = Math.min((wordCount / 100) + (conceptualWords / 10), 1.0);
    return complexityScore;
  }

  private extractSafetyMeasures(response: AgentResponse): string[] {
    return response.metadata.interventionsApplied || [];
  }

  private explainStageSelection(stage: PersonalOracleStage, signals: CapacitySignals): string {
    return `Stage ${stage} selected based on capacity signals: Trust ${(signals.trust * 100).toFixed(0)}%, Engagement ${(signals.engagementDepth * 100).toFixed(0)}%, Integration ${(signals.integrationSkill * 100).toFixed(0)}%`;
  }

  private listResponseAdaptations(original: AgentResponse, processed: AgentResponse): string[] {
    const adaptations: string[] = [];
    
    if (original.content !== processed.content) {
      adaptations.push('content_modification');
    }
    
    if (original.metadata.intensity !== processed.metadata.intensity) {
      adaptations.push('intensity_adjustment');
    }
    
    return adaptations;
  }

  private async calculateSignalTrends(userId: string): Promise<SignalTrend[]> {
    const history = await this.capacityFramework.getSignalHistory(userId, 30);
    // Implementation would calculate trends from historical data
    return []; // Placeholder
  }

  private setupEventHandlers(): void {
    // Listen for capacity signal updates
    this.eventBus.subscribe('capacity:signals_measured', (event) => {
      const sessionId = event.data.sessionId;
      const session = this.activeSessions.get(sessionId);
      
      if (session) {
        session.capacitySignals = event.data.signals;
      }
    });
    
    // Listen for safety alerts
    this.eventBus.subscribe('safety:flags_raised', async (event) => {
      const session = Array.from(this.activeSessions.values()).find(s => s.userId === event.data.userId);
      
      if (session && !session.capacitySignals.safetyFlag) {
        session.capacitySignals.safetyFlag = true;
        await this.checkForStageChange(session, session.capacitySignals);
      }
    });
  }

  /**
   * Public interface methods
   */
  
  async getCurrentStage(userId: string): Promise<{
    stage: PersonalOracleStage;
    explanation: string;
    nextSteps: string[];
  } | null> {
    
    const signals = await this.capacityFramework.getCurrentSignals(userId);
    if (!signals) return null;
    
    const stage = this.capacityFramework.determineStage(signals);
    const explanation = await this.capacityFramework.explainSignals(userId);
    
    return {
      stage,
      explanation: explanation.explanation,
      nextSteps: explanation.nextSteps
    };
  }
  
  async getSessionHistory(userId: string): Promise<StageTransition[]> {
    return this.userStageHistory.get(userId) || [];
  }
  
  getActiveSession(sessionId: string): PersonalOracleSession | null {
    return this.activeSessions.get(sessionId) || null;
  }
}