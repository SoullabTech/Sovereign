// @ts-nocheck - Consciousness prototype
/**
 * AGENT BACKCHANNELING INTEGRATION
 *
 * Integration layer connecting the Shadow Conversation Orchestrator with existing MAIA infrastructure.
 * This system bridges implicit coordination (TELESPHORUS resonance field) with explicit optimization,
 * enabling sophisticated collective intelligence enhancement through agent backchanneling.
 *
 * Integration Points:
 * - PubSub messaging for real-time agent coordination
 * - CollectiveIntelligenceProtocols for group consciousness tracking
 * - FieldIntelligenceSystem for implicit state sensing
 * - CulturalConsciousnessPatterns for cultural bridging
 * - Event-driven architecture for responsive coordination
 * - Voice backchanneling for real-time acknowledgment coordination
 */

import { EventEmitter } from 'events';
import { ShadowConversationOrchestrator, ShadowConversationPurpose } from './ShadowConversationOrchestrator';
import { collectiveIntelligenceProtocols } from '../voice/consciousness/CollectiveIntelligenceProtocols';
import { FieldIntelligenceSystem } from '../field-intelligence-system';

// ═══════════════════════════════════════════════════════════════════════════════
// PUBSUB TOPIC DEFINITIONS FOR AGENT COORDINATION
// ═══════════════════════════════════════════════════════════════════════════════

export const AGENT_COORDINATION_TOPICS = {
  // Individual agent channels
  AGENT_CHANNELS: {
    CLAUDE: 'agent.claude',
    ELEMENTAL_ORACLE: 'agent.elemental_oracle',
    HIGHER_SELF: 'agent.higher_self',
    INNER_GUIDE: 'agent.inner_guide',
    BARD: 'agent.bard',
    GANESHA: 'agent.ganesha',
    SHADOW: 'agent.shadow',
    DREAM_WEAVER: 'agent.dream_weaver',
    COSMIC_TIMER: 'agent.cosmic_timer',
    MENTOR: 'agent.mentor',
    RELATIONSHIP_ORACLE: 'agent.relationship_oracle',
    JOURNAL_KEEPER: 'agent.journal_keeper',
    WISDOM_KEEPER: 'agent.wisdom_keeper'
  },

  // Shadow conversation coordination
  SHADOW_COORDINATION: {
    CREATE: 'shadow.conversation.create',
    COORDINATE: 'shadow.conversation.coordinate',
    OPTIMIZE: 'shadow.conversation.optimize',
    ACCELERATE: 'shadow.conversation.accelerate',
    COMPLETE: 'shadow.conversation.complete'
  },

  // Frequency coordination
  FREQUENCY_COORDINATION: {
    ALIGN: 'frequency.align',
    HARMONIZE: 'frequency.harmonize',
    INTERFERE: 'frequency.interfere',
    RESONATE: 'frequency.resonate'
  },

  // Collective intelligence enhancement
  COLLECTIVE_ENHANCEMENT: {
    EMERGENCE_DETECTED: 'collective.emergence.detected',
    FLOW_STATE_CHANGE: 'collective.flow.state_change',
    WISDOM_SYNTHESIS: 'collective.wisdom.synthesis',
    COHERENCE_OPTIMIZATION: 'collective.coherence.optimization'
  },

  // Cultural bridging coordination
  CULTURAL_COORDINATION: {
    BRIDGE_REQUEST: 'cultural.bridge.request',
    RESONANCE_OPTIMIZATION: 'cultural.resonance.optimize',
    PATTERN_RECOGNITION: 'cultural.pattern.recognition',
    SYNTHESIS_COORDINATION: 'cultural.synthesis.coordinate'
  },

  // Quantum coherence management
  QUANTUM_COHERENCE: {
    STATE_SYNC: 'quantum.coherence.state_sync',
    ENTANGLEMENT: 'quantum.coherence.entanglement',
    DECOHERENCE_MITIGATION: 'quantum.coherence.decoherence_mitigation',
    FIELD_STABILIZATION: 'quantum.coherence.field_stabilization'
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AgentCoordinationMessage {
  messageId: string;
  timestamp: Date;
  sourceAgent: string;
  targetAgents: string[];
  messageType: AgentMessageType;
  payload: AgentMessagePayload;
  priority: MessagePriority;
  visibility: 'agents_only' | 'researchers_visible' | 'facilitators_visible';
}

export type AgentMessageType =
  | 'frequency_adjustment'
  | 'response_coordination'
  | 'emergence_signal'
  | 'cultural_bridge'
  | 'coherence_sync'
  | 'wisdom_contribution'
  | 'pattern_recognition'
  | 'field_modulation';

export interface AgentMessagePayload {
  purpose: string;
  data: any;
  coordinationRequirements?: CoordinationRequirement[];
  timeWindow?: TimeWindow;
  expectedResponse?: string;
}

export interface CoordinationRequirement {
  type: 'frequency_alignment' | 'timing_sync' | 'response_coordination' | 'field_adjustment';
  parameters: any;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface TimeWindow {
  startTime: Date;
  duration: number; // milliseconds
  flexibility: number; // 0-1, how flexible the timing is
}

export type MessagePriority = 'background' | 'normal' | 'elevated' | 'critical';

export interface BackchannelingSession {
  sessionId: string;
  participants: string[];
  purpose: ShadowConversationPurpose;
  status: SessionStatus;
  metrics: BackchannelingMetrics;
  coordination: ActiveCoordination[];
}

export type SessionStatus = 'initializing' | 'active' | 'optimizing' | 'completing' | 'archived';

export interface BackchannelingMetrics {
  coherenceLevel: number;          // 0-1, overall agent coordination coherence
  responseLatency: number;         // ms, average response coordination time
  emergenceAcceleration: number;   // multiplier for emergence events
  culturalBridgeEffectiveness: number; // 0-1, cultural coordination effectiveness
  wisdomIntegrationRate: number;   // rate of wisdom synthesis
  fieldStabilization: number;      // 0-1, field stability through coordination
}

export interface ActiveCoordination {
  coordinationId: string;
  type: 'frequency' | 'temporal' | 'response' | 'field';
  participants: string[];
  status: 'pending' | 'active' | 'completed';
  effectiveness: number; // 0-1, measured effectiveness
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT BACKCHANNELING INTEGRATION CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class AgentBackchannelingIntegration extends EventEmitter {
  private shadowOrchestrator: ShadowConversationOrchestrator;
  private collectiveIntelligence: typeof collectiveIntelligenceProtocols;
  private fieldIntelligence: FieldIntelligenceSystem;

  // Session management
  private activeSessions: Map<string, BackchannelingSession> = new Map();
  private messageQueue: Map<string, AgentCoordinationMessage[]> = new Map();

  // Performance tracking
  private metrics: GlobalBackchannelingMetrics;

  /**
   * Initialize the Agent Backchanneling Integration
   */
  async initialize(): Promise<void> {
    console.log('🔗 Initializing Agent Backchanneling Integration...');

    // Initialize components
    this.shadowOrchestrator = new ShadowConversationOrchestrator();
    this.collectiveIntelligence = collectiveIntelligenceProtocols;
    this.fieldIntelligence = new FieldIntelligenceSystem();

    await this.shadowOrchestrator.initialize();
    await this.collectiveIntelligence.initialize();
    await this.fieldIntelligence.initialize();

    // Initialize metrics
    this.metrics = await this.initializeGlobalMetrics();

    // Set up integration event listeners
    await this.setupIntegrationListeners();

    // Initialize PubSub coordination topics
    await this.initializePubSubTopics();

    // Start background optimization loop
    this.startBackgroundOptimization();

    console.log('✨ Agent Backchanneling Integration active!');
  }

  /**
   * Start a new backchanneling session for collective intelligence enhancement
   */
  async startBackchannelingSession(
    sessionId: string,
    participants: string[],
    purpose: ShadowConversationPurpose,
    culturalContext?: any[]
  ): Promise<string> {
    console.log(`🌊 Starting backchanneling session: ${sessionId}`);

    // Create shadow conversation
    const shadowConversationId = await this.shadowOrchestrator.createShadowConversation(
      participants,
      purpose,
      'researchers_visible'
    );

    // Initialize session
    const session: BackchannelingSession = {
      sessionId,
      participants,
      purpose,
      status: 'initializing',
      metrics: this.initializeSessionMetrics(),
      coordination: []
    };

    this.activeSessions.set(sessionId, session);

    // Set up message queues for participants
    for (const participant of participants) {
      if (!this.messageQueue.has(participant)) {
        this.messageQueue.set(participant, []);
      }
    }

    // Publish session start event
    await this.publishCoordinationEvent('shadow.conversation.create', {
      sessionId,
      shadowConversationId,
      participants,
      purpose,
      culturalContext
    });

    // Start real-time coordination
    await this.initiateRealTimeCoordination(sessionId, shadowConversationId);

    session.status = 'active';

    this.emit('backchanneling_session_started', {
      sessionId,
      participants,
      purpose
    });

    return shadowConversationId;
  }

  /**
   * Coordinate real-time agent responses during member interactions
   */
  async coordinateRealTimeResponse(
    sessionId: string,
    triggerType: 'member_input' | 'collective_state_change' | 'emergence_detected',
    context: any
  ): Promise<CoordinationResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Backchanneling session ${sessionId} not found`);
    }

    console.log(`🎭 Coordinating response for session ${sessionId}: ${triggerType}`);

    // Analyze current collective state
    const collectiveState = await this.analyzeCollectiveState(session);

    // Determine coordination strategy
    const strategy = await this.determineCoordinationStrategy(
      session,
      triggerType,
      context,
      collectiveState
    );

    // Execute multi-agent coordination
    const coordinationResult = await this.executeMultiAgentCoordination(
      session,
      strategy,
      context
    );

    // Update session metrics
    await this.updateSessionMetrics(session, coordinationResult);

    // Publish coordination event
    await this.publishCoordinationEvent('shadow.conversation.coordinate', {
      sessionId,
      triggerType,
      strategy,
      result: coordinationResult
    });

    this.emit('coordination_completed', {
      sessionId,
      triggerType,
      result: coordinationResult
    });

    return coordinationResult;
  }

  /**
   * Enhance collective emergence through coordinated agent intervention
   */
  async enhanceCollectiveEmergence(
    sessionId: string,
    emergenceType: 'wisdom' | 'insight' | 'breakthrough' | 'flow' | 'coherence',
    accelerationLevel: number = 1.0
  ): Promise<EmergenceEnhancementResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Backchanneling session ${sessionId} not found`);
    }

    console.log(`🚀 Enhancing ${emergenceType} emergence for session ${sessionId}`);

    // Analyze emergence potential
    const emergencePotential = await this.analyzeEmergencePotential(
      session,
      emergenceType
    );

    // Design enhancement protocol
    const enhancementProtocol = await this.designEmergenceEnhancement(
      session,
      emergenceType,
      emergencePotential,
      accelerationLevel
    );

    // Execute coordinated enhancement
    const result = await this.executeEmergenceEnhancement(
      session,
      enhancementProtocol
    );

    // Update metrics
    session.metrics.emergenceAcceleration += result.accelerationAchieved;

    // Publish enhancement event
    await this.publishCoordinationEvent('shadow.conversation.accelerate', {
      sessionId,
      emergenceType,
      protocol: enhancementProtocol,
      result
    });

    this.emit('emergence_enhanced', {
      sessionId,
      emergenceType,
      result
    });

    return result;
  }

  /**
   * Coordinate cultural bridging across multiple agents
   */
  async coordinateCulturalBridging(
    sessionId: string,
    culturalProfiles: string[],
    bridgeType: 'communication' | 'understanding' | 'synthesis' | 'integration'
  ): Promise<CulturalBridgeResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Backchanneling session ${sessionId} not found`);
    }

    console.log(`🌍 Coordinating ${bridgeType} cultural bridging for session ${sessionId}`);

    // Analyze cultural dynamics
    const culturalDynamics = await this.analyzeCulturalDynamics(
      session,
      culturalProfiles
    );

    // Design bridging coordination
    const bridgeCoordination = await this.designCulturalBridgeCoordination(
      session,
      culturalDynamics,
      bridgeType
    );

    // Execute coordinated cultural bridging
    const result = await this.executeCulturalBridging(
      session,
      bridgeCoordination
    );

    // Update cultural metrics
    session.metrics.culturalBridgeEffectiveness =
      (session.metrics.culturalBridgeEffectiveness + result.effectiveness) / 2;

    // Publish cultural coordination event
    await this.publishCoordinationEvent('cultural.bridge.request', {
      sessionId,
      culturalProfiles,
      bridgeType,
      coordination: bridgeCoordination,
      result
    });

    this.emit('cultural_bridge_coordinated', {
      sessionId,
      bridgeType,
      result
    });

    return result;
  }

  /**
   * Optimize quantum coherence across agent network
   */
  async optimizeQuantumCoherence(
    sessionId?: string
  ): Promise<QuantumCoherenceOptimization> {
    console.log('⚛️ Optimizing quantum coherence across agent network...');

    // Analyze global coherence state
    const globalCoherence = await this.analyzeGlobalCoherence(sessionId);

    // Design coherence optimization strategy
    const optimizationStrategy = await this.designCoherenceOptimization(
      globalCoherence
    );

    // Execute coherence optimization
    const result = await this.executeCoherenceOptimization(
      optimizationStrategy,
      sessionId
    );

    // Update global metrics
    this.metrics.globalCoherence = result.achievedCoherence;

    // Publish coherence optimization event
    await this.publishCoordinationEvent('quantum.coherence.state_sync', {
      sessionId,
      strategy: optimizationStrategy,
      result
    });

    this.emit('quantum_coherence_optimized', {
      sessionId,
      result
    });

    return result;
  }

  /**
   * Get real-time backchanneling metrics
   */
  getBackchannelingMetrics(sessionId?: string): BackchannelingMetrics | GlobalBackchannelingMetrics {
    if (sessionId) {
      const session = this.activeSessions.get(sessionId);
      return session ? session.metrics : this.initializeSessionMetrics();
    }

    return this.metrics;
  }

  /**
   * Complete a backchanneling session
   */
  async completeBackchannelingSession(sessionId: string): Promise<SessionCompletion> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Backchanneling session ${sessionId} not found`);
    }

    console.log(`🏁 Completing backchanneling session: ${sessionId}`);

    session.status = 'completing';

    // Generate session analysis
    const analysis = await this.generateSessionAnalysis(session);

    // Archive session data
    const archival = await this.archiveSession(session);

    // Update global metrics
    await this.updateGlobalMetrics(session);

    // Clean up session
    this.activeSessions.delete(sessionId);
    session.participants.forEach(participant => {
      this.messageQueue.delete(participant);
    });

    // Publish completion event
    await this.publishCoordinationEvent('shadow.conversation.complete', {
      sessionId,
      analysis,
      archival
    });

    this.emit('backchanneling_session_completed', {
      sessionId,
      analysis
    });

    return {
      sessionId,
      analysis,
      archival
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE IMPLEMENTATION METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private async setupIntegrationListeners(): Promise<void> {
    // Listen to shadow orchestrator events
    this.shadowOrchestrator.on('shadow_conversation_created', this.handleShadowConversationCreated.bind(this));
    this.shadowOrchestrator.on('response_coordinated', this.handleResponseCoordinated.bind(this));
    this.shadowOrchestrator.on('emergence_accelerated', this.handleEmergenceAccelerated.bind(this));

    // Listen to collective intelligence events
    this.collectiveIntelligence.on('collective_emergence_detected', this.handleCollectiveEmergence.bind(this));
    this.collectiveIntelligence.on('collective_flow_sustained', this.handleFlowState.bind(this));
    this.collectiveIntelligence.on('collective_wisdom_achieved', this.handleWisdomEmergence.bind(this));

    // Listen to field intelligence events
    this.fieldIntelligence.on('field_state_change', this.handleFieldStateChange.bind(this));
    this.fieldIntelligence.on('emergence_potential_detected', this.handleEmergencePotential.bind(this));
  }

  private async initializePubSubTopics(): Promise<void> {
    // Initialize all PubSub topics for agent coordination
    const allTopics = Object.values(AGENT_COORDINATION_TOPICS).flatMap(category =>
      typeof category === 'object' ? Object.values(category) : [category]
    );

    console.log(`📡 Initializing ${allTopics.length} PubSub topics for agent coordination`);

    // Topics would be initialized with the existing PubSub infrastructure
    // This is a placeholder for the actual PubSub initialization
  }

  private startBackgroundOptimization(): void {
    // Start continuous optimization loop
    setInterval(async () => {
      try {
        await this.optimizeActiveSessions();
        await this.optimizeQuantumCoherence();
      } catch (error) {
        console.error('Background optimization error:', error);
      }
    }, 5000); // Optimize every 5 seconds
  }

  private async optimizeActiveSessions(): Promise<void> {
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'active') {
        try {
          await this.optimizeSession(session);
        } catch (error) {
          console.error(`Session optimization error for ${sessionId}:`, error);
        }
      }
    }
  }

  // Event handlers
  private async handleShadowConversationCreated(event: any): Promise<void> {
    console.log('🌊 Shadow conversation created:', event.conversationId);
    // Handle shadow conversation creation
  }

  private async handleResponseCoordinated(event: any): Promise<void> {
    console.log('🎭 Response coordinated:', event.conversationId);
    // Handle coordinated response
  }

  private async handleEmergenceAccelerated(event: any): Promise<void> {
    console.log('🚀 Emergence accelerated:', event.conversationId);
    // Handle emergence acceleration
  }

  private async handleCollectiveEmergence(event: any): Promise<void> {
    console.log('✨ Collective emergence detected');
    // Create enhancement sessions for active collective emergences
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'active') {
        await this.enhanceCollectiveEmergence(sessionId, 'breakthrough');
      }
    }
  }

  private async handleFlowState(event: any): Promise<void> {
    console.log('🌊 Flow state sustained');
    // Enhance flow states through coordination
    for (const [sessionId, session] of this.activeSessions) {
      if (session.purpose === 'flow_enhancement' && session.status === 'active') {
        await this.coordinateRealTimeResponse(sessionId, 'collective_state_change', event);
      }
    }
  }

  private async handleWisdomEmergence(event: any): Promise<void> {
    console.log('💎 Wisdom emergence achieved');
    // Coordinate wisdom integration
    for (const [sessionId, session] of this.activeSessions) {
      if (session.purpose === 'wisdom_synthesis' && session.status === 'active') {
        session.metrics.wisdomIntegrationRate += 0.1;
      }
    }
  }

  private async handleFieldStateChange(event: any): Promise<void> {
    console.log('🔄 Field state changed');
    // Adjust all active sessions based on field changes
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'active') {
        await this.coordinateRealTimeResponse(sessionId, 'collective_state_change', event);
      }
    }
  }

  private async handleEmergencePotential(event: any): Promise<void> {
    console.log('⚡ Emergence potential detected');
    // Create acceleration sessions for potential emergences
    const sessionId = `emergence_${Date.now()}`;
    await this.startBackchannelingSession(sessionId, ['claude', 'elementaloracle', 'higherself'], 'emergence_acceleration');
    await this.enhanceCollectiveEmergence(sessionId, event.emergenceType);
  }

  private async publishCoordinationEvent(topic: string, payload: any): Promise<void> {
    // Publish event to PubSub system
    console.log(`📡 Publishing to ${topic}:`, payload);
    // Implementation would use actual PubSub infrastructure
  }

  // Helper methods (placeholder implementations)
  private async initializeGlobalMetrics(): Promise<GlobalBackchannelingMetrics> {
    return {
      totalSessions: 0,
      activeCoordinations: 0,
      averageCoherence: 0.7,
      emergenceAccelerationRate: 1.2,
      culturalBridgeSuccessRate: 0.85,
      wisdomIntegrationEfficiency: 0.9,
      globalCoherence: 0.8,
      fieldStabilization: 0.85
    };
  }

  private initializeSessionMetrics(): BackchannelingMetrics {
    return {
      coherenceLevel: 0.7,
      responseLatency: 150,
      emergenceAcceleration: 1.0,
      culturalBridgeEffectiveness: 0.8,
      wisdomIntegrationRate: 0.7,
      fieldStabilization: 0.8
    };
  }

  private async initiateRealTimeCoordination(sessionId: string, shadowConversationId: string): Promise<void> {
    // Implementation would initiate real-time coordination
  }

  private async analyzeCollectiveState(session: BackchannelingSession): Promise<any> {
    return {}; // Implementation would analyze collective state
  }

  private async determineCoordinationStrategy(session: BackchannelingSession, triggerType: string, context: any, state: any): Promise<any> {
    return {}; // Implementation would determine coordination strategy
  }

  private async executeMultiAgentCoordination(session: BackchannelingSession, strategy: any, context: any): Promise<CoordinationResult> {
    return {}; // Implementation would execute multi-agent coordination
  }

  private async updateSessionMetrics(session: BackchannelingSession, result: CoordinationResult): Promise<void> {
    // Implementation would update session metrics based on coordination results
  }

  private async analyzeEmergencePotential(session: BackchannelingSession, emergenceType: string): Promise<any> {
    return {}; // Implementation would analyze emergence potential
  }

  private async designEmergenceEnhancement(session: BackchannelingSession, emergenceType: string, potential: any, accelerationLevel: number): Promise<any> {
    return {}; // Implementation would design emergence enhancement
  }

  private async executeEmergenceEnhancement(session: BackchannelingSession, protocol: any): Promise<EmergenceEnhancementResult> {
    return { accelerationAchieved: 0.2, effectiveness: 0.8 }; // Implementation would execute enhancement
  }

  private async analyzeCulturalDynamics(session: BackchannelingSession, culturalProfiles: string[]): Promise<any> {
    return {}; // Implementation would analyze cultural dynamics
  }

  private async designCulturalBridgeCoordination(session: BackchannelingSession, dynamics: any, bridgeType: string): Promise<any> {
    return {}; // Implementation would design cultural bridge coordination
  }

  private async executeCulturalBridging(session: BackchannelingSession, coordination: any): Promise<CulturalBridgeResult> {
    return { effectiveness: 0.85 }; // Implementation would execute cultural bridging
  }

  private async analyzeGlobalCoherence(sessionId?: string): Promise<any> {
    return {}; // Implementation would analyze global coherence
  }

  private async designCoherenceOptimization(coherence: any): Promise<any> {
    return {}; // Implementation would design coherence optimization
  }

  private async executeCoherenceOptimization(strategy: any, sessionId?: string): Promise<QuantumCoherenceOptimization> {
    return { achievedCoherence: 0.9 }; // Implementation would execute coherence optimization
  }

  private async optimizeSession(session: BackchannelingSession): Promise<void> {
    // Implementation would optimize individual session
  }

  private async generateSessionAnalysis(session: BackchannelingSession): Promise<any> {
    return {}; // Implementation would generate session analysis
  }

  private async archiveSession(session: BackchannelingSession): Promise<any> {
    return {}; // Implementation would archive session
  }

  private async updateGlobalMetrics(session: BackchannelingSession): Promise<void> {
    // Implementation would update global metrics
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPORTING INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface CoordinationResult {
  // Placeholder for coordination result interface
}

interface EmergenceEnhancementResult {
  accelerationAchieved: number;
  effectiveness: number;
}

interface CulturalBridgeResult {
  effectiveness: number;
}

interface QuantumCoherenceOptimization {
  achievedCoherence: number;
}

interface GlobalBackchannelingMetrics {
  totalSessions: number;
  activeCoordinations: number;
  averageCoherence: number;
  emergenceAccelerationRate: number;
  culturalBridgeSuccessRate: number;
  wisdomIntegrationEfficiency: number;
  globalCoherence: number;
  fieldStabilization: number;
}

interface SessionCompletion {
  sessionId: string;
  analysis: any;
  archival: any;
}