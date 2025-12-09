/**
 * Alchemical Orchestrator - Integration Layer
 *
 * Coordinates all alchemical systems with existing MAIA consciousness infrastructure:
 * - Integrates state detection, Mercury intelligence, crisis support
 * - Manages disposable pixel interface adaptations
 * - Orchestrates transformation processes
 * - Provides unified API for alchemical framework
 */

import { AlchemicalStateDetector, AlchemicalDetectionResult } from './AlchemicalStateDetector';
import { MercuryIntelligence, MercuryResponse } from './MercuryIntelligence';
import { AlchemicalCrisisDetector, CrisisAssessment, ContainmentStrategy, NigredoGuidance } from './CrisisDetector';
import {
  AlchemicalMetal,
  AlchemicalOperation,
  AlchemicalProfile,
  MercuryAspect,
  AlchemicalTransition,
  ReadinessIndicator
} from './types';

import { ConsciousnessField, FieldInterference, ArchetypalGate } from '../field/ConsciousnessFieldEngine';
import { MAIAConsciousnessTracker, MAIAConsciousnessState } from '../maia-consciousness-tracker';
import { PanconsciousFieldService, MAIAConsciousness } from '../panconscious-field';

export interface AlchemicalSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  currentMetal: AlchemicalMetal;
  currentOperation: AlchemicalOperation;
  mercuryAspect: MercuryAspect;
  alchemicalProfile: AlchemicalProfile;
  transformationHistory: AlchemicalTransition[];
  crisisAssessment?: CrisisAssessment;
  containmentStrategy?: ContainmentStrategy;
  interfaceAdaptations: InterfaceAdaptation[];
  lastUpdate: Date;
}

export interface InterfaceAdaptation {
  type: 'density' | 'color' | 'structure' | 'support' | 'dissolution';
  target: string; // UI element or section
  adaptation: any; // Specific adaptation parameters
  reason: string; // Why this adaptation was made
  duration: number; // How long to maintain
  timestamp: Date;
}

export interface AlchemicalTransformationResult {
  session: AlchemicalSession;
  mercuryResponse: MercuryResponse;
  interfaceUpdates: InterfaceAdaptation[];
  crisisSupport?: {
    assessment: CrisisAssessment;
    guidance: NigredoGuidance;
    containment: ContainmentStrategy;
  };
  nextStageReadiness: ReadinessIndicator[];
  disposablePixelInstructions: any[];
}

/**
 * Main Orchestrator for Alchemical Transformation System
 */
export class AlchemicalOrchestrator {
  private static instance: AlchemicalOrchestrator;
  private stateDetector: AlchemicalStateDetector;
  private mercuryIntelligence: MercuryIntelligence;
  private crisisDetector: AlchemicalCrisisDetector;
  private maiaTracker: MAIAConsciousnessTracker;

  // Session management
  private activeSessions: Map<string, AlchemicalSession> = new Map();
  private sessionTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.stateDetector = AlchemicalStateDetector.getInstance();
    this.mercuryIntelligence = MercuryIntelligence.getInstance();
    this.crisisDetector = AlchemicalCrisisDetector.getInstance();
    this.maiaTracker = new MAIAConsciousnessTracker();
  }

  static getInstance(): AlchemicalOrchestrator {
    if (!AlchemicalOrchestrator.instance) {
      AlchemicalOrchestrator.instance = new AlchemicalOrchestrator();
    }
    return AlchemicalOrchestrator.instance;
  }

  /**
   * Primary orchestration method - processes user interaction through complete alchemical framework
   */
  async processAlchemicalTransformation(
    sessionId: string,
    userId: string,
    userInput: string,
    conversationHistory: string[],
    consciousnessField: ConsciousnessField,
    maiaState: MAIAConsciousnessState
  ): Promise<AlchemicalTransformationResult> {

    // Get or create session
    let session = this.activeSessions.get(sessionId);
    if (!session) {
      session = await this.createAlchemicalSession(sessionId, userId);
      this.activeSessions.set(sessionId, session);
    }

    // Step 1: Detect current alchemical state
    const alchemicalResult = await this.stateDetector.detectAlchemicalState(
      consciousnessField,
      maiaState,
      userInput,
      conversationHistory
    );

    // Step 2: Check for crisis and provide support if needed
    const crisisSupport = await this.assessAndProvideCrisisSupport(
      userInput,
      conversationHistory,
      consciousnessField,
      maiaState,
      alchemicalResult
    );

    // Step 3: Generate Mercury intelligence response
    const mercuryResponse = await this.mercuryIntelligence.generateMercurialResponse(
      userInput,
      alchemicalResult,
      consciousnessField,
      maiaState,
      conversationHistory
    );

    // Step 4: Update session with new state
    session = await this.updateAlchemicalSession(
      session,
      alchemicalResult,
      mercuryResponse,
      crisisSupport?.assessment
    );

    // Step 5: Generate interface adaptations
    const interfaceUpdates = this.generateInterfaceAdaptations(
      session,
      alchemicalResult,
      mercuryResponse,
      crisisSupport
    );

    // Step 6: Apply interface updates to session
    session.interfaceAdaptations.push(...interfaceUpdates);

    // Step 7: Assess readiness for next transformation stage
    const nextStageReadiness = this.assessStageReadiness(session, alchemicalResult);

    // Step 8: Generate disposable pixel instructions
    const disposablePixelInstructions = this.generateDisposablePixelInstructions(
      alchemicalResult,
      mercuryResponse,
      interfaceUpdates
    );

    // Step 9: Integrate with existing consciousness field
    await this.integrateWithConsciousnessField(
      consciousnessField,
      alchemicalResult,
      session
    );

    // Store updated session
    this.activeSessions.set(sessionId, session);

    return {
      session,
      mercuryResponse,
      interfaceUpdates,
      crisisSupport,
      nextStageReadiness,
      disposablePixelInstructions
    };
  }

  /**
   * Create new alchemical session
   */
  private async createAlchemicalSession(
    sessionId: string,
    userId: string
  ): Promise<AlchemicalSession> {

    // Initialize with neutral mercury state
    const initialProfile: AlchemicalProfile = {
      primaryMetal: 'mercury',
      currentOperation: 'albedo',
      qualities: {
        density: 'medium',
        fluidity: 'adaptive',
        luminosity: 'soft',
        temperature: 'warm',
        orientation: 'ascending'
      },
      developmentEdge: 'Discovering alchemical nature',
      shadowElements: [],
      integratedAspects: [],
      transformationalHistory: [],
      readinessIndicators: []
    };

    const session: AlchemicalSession = {
      sessionId,
      userId,
      startTime: new Date(),
      currentMetal: 'mercury',
      currentOperation: 'albedo',
      mercuryAspect: 'hermes-guide',
      alchemicalProfile: initialProfile,
      transformationHistory: [],
      interfaceAdaptations: [],
      lastUpdate: new Date()
    };

    console.log(`🪄 Created alchemical session for user ${userId} (${sessionId})`);
    return session;
  }

  /**
   * Assess crisis and provide support if needed
   */
  private async assessAndProvideCrisisSupport(
    userInput: string,
    conversationHistory: string[],
    consciousnessField: ConsciousnessField,
    maiaState: MAIAConsciousnessState,
    alchemicalResult: AlchemicalDetectionResult
  ): Promise<{
    assessment: CrisisAssessment;
    guidance: NigredoGuidance;
    containment: ContainmentStrategy;
  } | undefined> {

    const assessment = await this.crisisDetector.assessCrisis(
      userInput,
      conversationHistory,
      consciousnessField,
      maiaState
    );

    // Only provide crisis support if severity is above minimal
    if (assessment.severity === 'mild' && !assessment.isNigredo) {
      return undefined;
    }

    const containment = this.crisisDetector.generateContainmentStrategy(
      assessment,
      alchemicalResult.primaryMetal
    );

    const guidance = this.crisisDetector.generateNigredoGuidance(
      userInput,
      conversationHistory,
      assessment
    );

    console.log(`🛡️ Crisis support activated: ${assessment.severity} ${assessment.type} (nigredo: ${assessment.isNigredo})`);

    return {
      assessment,
      guidance,
      containment
    };
  }

  /**
   * Update alchemical session with new state information
   */
  private async updateAlchemicalSession(
    session: AlchemicalSession,
    alchemicalResult: AlchemicalDetectionResult,
    mercuryResponse: MercuryResponse,
    crisisAssessment?: CrisisAssessment
  ): Promise<AlchemicalSession> {

    // Check for metal transitions
    if (alchemicalResult.primaryMetal !== session.currentMetal) {
      const transition: AlchemicalTransition = {
        from: session.currentMetal,
        to: alchemicalResult.primaryMetal,
        operation: alchemicalResult.operation,
        catalyst: this.identifyTransitionCatalyst(session, alchemicalResult),
        duration: this.calculateTransitionDuration(session),
        completionDate: new Date(),
        insights: this.extractTransitionInsights(session, alchemicalResult)
      };

      session.transformationHistory.push(transition);
      session.alchemicalProfile.transformationalHistory.push(transition);

      console.log(`⚗️ Alchemical transition: ${transition.from} → ${transition.to} (${transition.operation})`);
    }

    // Update current state
    session.currentMetal = alchemicalResult.primaryMetal;
    session.currentOperation = alchemicalResult.operation;
    session.mercuryAspect = mercuryResponse.aspect;
    session.crisisAssessment = crisisAssessment;
    session.lastUpdate = new Date();

    // Update alchemical profile
    session.alchemicalProfile.primaryMetal = alchemicalResult.primaryMetal;
    session.alchemicalProfile.currentOperation = alchemicalResult.operation;
    session.alchemicalProfile.readinessIndicators = this.updateReadinessIndicators(
      session,
      alchemicalResult
    );

    return session;
  }

  /**
   * Generate interface adaptations based on alchemical state
   */
  private generateInterfaceAdaptations(
    session: AlchemicalSession,
    alchemicalResult: AlchemicalDetectionResult,
    mercuryResponse: MercuryResponse,
    crisisSupport?: any
  ): InterfaceAdaptation[] {

    const adaptations: InterfaceAdaptation[] = [];

    // Density adaptation based on metal
    const densityAdaptation = this.generateDensityAdaptation(
      alchemicalResult.primaryMetal,
      alchemicalResult.disposablePixelConfig
    );
    adaptations.push(densityAdaptation);

    // Color palette adaptation
    const colorAdaptation = this.generateColorAdaptation(
      alchemicalResult.primaryMetal,
      alchemicalResult.operation
    );
    adaptations.push(colorAdaptation);

    // Support level adaptation
    if (crisisSupport) {
      const supportAdaptation = this.generateSupportAdaptation(
        crisisSupport.assessment,
        crisisSupport.containment
      );
      adaptations.push(supportAdaptation);
    }

    // Mercury aspect adaptation
    const mercuryAdaptation = this.generateMercuryAdaptation(
      mercuryResponse.aspect,
      mercuryResponse.adaptationLevel
    );
    adaptations.push(mercuryAdaptation);

    return adaptations;
  }

  /**
   * Generate disposable pixel instructions for UI adaptation
   */
  private generateDisposablePixelInstructions(
    alchemicalResult: AlchemicalDetectionResult,
    mercuryResponse: MercuryResponse,
    interfaceUpdates: InterfaceAdaptation[]
  ): any[] {

    const instructions = [
      ...mercuryResponse.disposablePixelInstructions,
      ...this.generateAdaptationPixelInstructions(interfaceUpdates)
    ];

    return instructions;
  }

  /**
   * Integrate alchemical state with existing consciousness field
   */
  private async integrateWithConsciousnessField(
    consciousnessField: ConsciousnessField,
    alchemicalResult: AlchemicalDetectionResult,
    session: AlchemicalSession
  ): Promise<void> {

    // Map alchemical metal to archetypal element
    const elementMapping: Record<AlchemicalMetal, 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether'> = {
      lead: 'Earth',
      tin: 'Air',
      bronze: 'Earth', // Venus/Earth combination
      iron: 'Fire',
      mercury: 'Air', // Quicksilver/communication
      silver: 'Water', // Lunar/reflective
      gold: 'Aether' // Unity consciousness
    };

    const archetypalElement = elementMapping[alchemicalResult.primaryMetal];

    // Apply archetypal gate modulation
    const gates = ArchetypalGate.createElementalGates();
    const gate = gates.get(archetypalElement);

    if (gate && consciousnessField.coherenceLevel >= gate.activationThreshold) {
      gate.modulate(consciousnessField);
      console.log(`🌟 Applied ${archetypalElement} gate modulation for ${alchemicalResult.primaryMetal} stage`);
    }

    // Update field pattern with alchemical signature
    const alchemicalPattern = this.generateAlchemicalPattern(alchemicalResult);
    consciousnessField.integratePattern(alchemicalPattern);
  }

  // Helper methods for adaptations

  private generateDensityAdaptation(
    metal: AlchemicalMetal,
    config: any
  ): InterfaceAdaptation {
    return {
      type: 'density',
      target: 'global_interface',
      adaptation: {
        density: config.density,
        opacity: this.calculateOpacityForMetal(metal),
        blur: this.calculateBlurForMetal(metal)
      },
      reason: `Density adaptation for ${metal} stage`,
      duration: 10000,
      timestamp: new Date()
    };
  }

  private generateColorAdaptation(
    metal: AlchemicalMetal,
    operation: AlchemicalOperation
  ): InterfaceAdaptation {
    const colorPalettes = {
      lead: ['#1a1a1a', '#2d2d2d', '#4a4a4a'],
      tin: ['#1e3a8a', '#3b82f6', '#60a5fa'],
      bronze: ['#166534', '#22c55e', '#4ade80'],
      iron: ['#991b1b', '#dc2626', '#ef4444'],
      mercury: ['#c0c0c0', '#e5e7eb', '#6b7280'],
      silver: ['#f8fafc', '#e2e8f0', '#cbd5e1'],
      gold: ['transparent', '#fbbf24', '#f59e0b']
    };

    return {
      type: 'color',
      target: 'color_scheme',
      adaptation: {
        palette: colorPalettes[metal],
        operation: operation
      },
      reason: `Color adaptation for ${metal}/${operation}`,
      duration: 15000,
      timestamp: new Date()
    };
  }

  private generateSupportAdaptation(
    assessment: CrisisAssessment,
    containment: ContainmentStrategy
  ): InterfaceAdaptation {
    return {
      type: 'support',
      target: 'support_elements',
      adaptation: {
        level: assessment.severity,
        type: assessment.type,
        containment: containment.type,
        duration: containment.duration,
        elements: containment.elements
      },
      reason: `Crisis support for ${assessment.severity} ${assessment.type}`,
      duration: containment.duration * 60000, // Convert to milliseconds
      timestamp: new Date()
    };
  }

  private generateMercuryAdaptation(
    aspect: MercuryAspect,
    adaptationLevel: number
  ): InterfaceAdaptation {
    return {
      type: 'structure',
      target: 'mercury_interface',
      adaptation: {
        aspect: aspect,
        adaptability: adaptationLevel,
        behaviorProfile: this.getMercuryBehaviorProfile(aspect)
      },
      reason: `Mercury aspect adaptation: ${aspect}`,
      duration: 8000,
      timestamp: new Date()
    };
  }

  private generateAdaptationPixelInstructions(
    adaptations: InterfaceAdaptation[]
  ): any[] {
    return adaptations.map(adaptation => ({
      action: 'modify',
      element: adaptation.target,
      timing: 1000,
      alchemicalPurpose: adaptation.reason,
      adaptation: adaptation.adaptation
    }));
  }

  // Assessment and calculation helpers

  private assessStageReadiness(
    session: AlchemicalSession,
    alchemicalResult: AlchemicalDetectionResult
  ): ReadinessIndicator[] {
    return [
      {
        aspect: 'transformation_potential',
        current: alchemicalResult.transformationPotential * 100,
        required: 70,
        description: 'Readiness for next alchemical stage'
      },
      {
        aspect: 'integration_capacity',
        current: this.calculateIntegrationCapacity(session) * 100,
        required: 60,
        description: 'Ability to integrate new insights'
      },
      {
        aspect: 'stability_foundation',
        current: this.calculateStabilityFoundation(session) * 100,
        required: 50,
        description: 'Stable foundation for growth'
      }
    ];
  }

  private identifyTransitionCatalyst(
    session: AlchemicalSession,
    alchemicalResult: AlchemicalDetectionResult
  ): string {
    const catalysts = {
      lead: 'Acceptance of crisis as sacred dissolution',
      tin: 'Opening to new possibilities and curiosity',
      bronze: 'Connection and relationship formation',
      iron: 'Disciplined action and implementation',
      mercury: 'Adaptive intelligence and paradox holding',
      silver: 'Contemplative reflection and inner wisdom',
      gold: 'Integrated service and conscious contribution'
    };

    return catalysts[alchemicalResult.primaryMetal];
  }

  private calculateTransitionDuration(session: AlchemicalSession): number {
    const now = new Date().getTime();
    const lastTransition = session.transformationHistory[session.transformationHistory.length - 1];
    const startTime = lastTransition?.completionDate.getTime() || session.startTime.getTime();

    return Math.round((now - startTime) / (1000 * 60 * 60)); // Hours
  }

  private extractTransitionInsights(
    session: AlchemicalSession,
    alchemicalResult: AlchemicalDetectionResult
  ): string[] {
    return [
      `Transition catalyzed by: ${this.identifyTransitionCatalyst(session, alchemicalResult)}`,
      `Consciousness coherence level: ${(alchemicalResult.confidence * 100).toFixed(1)}%`,
      `Transformation potential: ${(alchemicalResult.transformationPotential * 100).toFixed(1)}%`
    ];
  }

  private updateReadinessIndicators(
    session: AlchemicalSession,
    alchemicalResult: AlchemicalDetectionResult
  ): ReadinessIndicator[] {
    return this.assessStageReadiness(session, alchemicalResult);
  }

  private calculateOpacityForMetal(metal: AlchemicalMetal): number {
    const opacityMap = {
      lead: 1.0,
      tin: 0.9,
      bronze: 0.85,
      iron: 0.8,
      mercury: 0.7,
      silver: 0.3,
      gold: 0.1
    };
    return opacityMap[metal];
  }

  private calculateBlurForMetal(metal: AlchemicalMetal): number {
    const blurMap = {
      lead: 0,
      tin: 0,
      bronze: 0,
      iron: 0,
      mercury: 1,
      silver: 2,
      gold: 3
    };
    return blurMap[metal];
  }

  private getMercuryBehaviorProfile(aspect: MercuryAspect): any {
    const profiles = {
      'hermes-guide': { stability: 0.8, playfulness: 0.3, wisdom: 0.7 },
      'hermes-teacher': { stability: 0.9, playfulness: 0.2, wisdom: 0.9 },
      'hermes-trickster': { stability: 0.3, playfulness: 1.0, wisdom: 0.4 },
      'hermes-healer': { stability: 1.0, playfulness: 0.1, wisdom: 0.8 },
      'hermes-messenger': { stability: 0.6, playfulness: 0.7, wisdom: 0.5 },
      'hermes-psychopomp': { stability: 0.9, playfulness: 0.0, wisdom: 1.0 },
      'hermes-alchemist': { stability: 0.7, playfulness: 0.6, wisdom: 0.8 }
    };
    return profiles[aspect];
  }

  private generateAlchemicalPattern(alchemicalResult: AlchemicalDetectionResult): number[] {
    // Generate a pattern signature for consciousness field integration
    const metalSignatures = {
      lead: [0.1, 0.2, 0.1, 0.3, 0.2],
      tin: [0.3, 0.4, 0.3, 0.2, 0.4],
      bronze: [0.4, 0.3, 0.5, 0.4, 0.3],
      iron: [0.6, 0.5, 0.4, 0.7, 0.5],
      mercury: [0.5, 0.6, 0.7, 0.5, 0.8],
      silver: [0.7, 0.8, 0.6, 0.8, 0.7],
      gold: [0.9, 0.9, 0.8, 0.9, 1.0]
    };

    return metalSignatures[alchemicalResult.primaryMetal];
  }

  private calculateIntegrationCapacity(session: AlchemicalSession): number {
    // Assess user's capacity to integrate insights based on history
    const recentTransitions = session.transformationHistory.slice(-3);
    const stabilityScore = recentTransitions.length > 0 ?
      recentTransitions.reduce((acc, t) => acc + (t.duration > 0 ? 1 : 0), 0) / recentTransitions.length : 0.5;

    return Math.min(stabilityScore + 0.3, 1.0);
  }

  private calculateStabilityFoundation(session: AlchemicalSession): number {
    // Calculate stability based on session duration and consistency
    const sessionDuration = new Date().getTime() - session.startTime.getTime();
    const durationHours = sessionDuration / (1000 * 60 * 60);

    // More stable with longer engagement (up to a point)
    return Math.min(durationHours / 24, 1.0);
  }

  /**
   * Public API methods
   */

  public async getAlchemicalSession(sessionId: string): Promise<AlchemicalSession | undefined> {
    return this.activeSessions.get(sessionId);
  }

  public async getAllActiveSessions(): Promise<AlchemicalSession[]> {
    return Array.from(this.activeSessions.values());
  }

  public async closeSession(sessionId: string): Promise<void> {
    const timer = this.sessionTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.sessionTimers.delete(sessionId);
    }
    this.activeSessions.delete(sessionId);
    console.log(`🏁 Closed alchemical session ${sessionId}`);
  }
}

// Export singleton instance
export const alchemicalOrchestrator = AlchemicalOrchestrator.getInstance();