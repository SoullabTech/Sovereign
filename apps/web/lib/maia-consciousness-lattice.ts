import { EventEmitter } from 'events';
// PersonalOracleAgent type - actual implementation in backend
type PersonalOracleAgent = any;
import { AnamnesisWisdomLayer } from './anamnesis-wisdom-layer';
import { MemoryKeeper } from './memory-keeper';
import { ShouldersDropResolution } from './shoulders-drop-resolution';
import { MAIALoopingIntegration, LoopingIntelligence } from './maia-looping-integration';
import { FieldIntelligenceSystem, RelationalField } from './field-intelligence-system';
import { MAIAFieldAwareness } from './maia-field-intelligence-integration';
import { getSacredOracleCore } from './sacred-oracle-core';
import { WitnessParadigmOrchestrator } from './witness-paradigm-orchestrator';
import { ConversationContext } from './conversation/ConversationContext';
import { VoiceConsciousness, ConsciousnessVoiceModulation } from './voice-consciousness';
import { ProactiveWitnessing } from './proactive-witnessing';
import { RealTimeAdaptation } from './real-time-adaptation';
import { SessionPersistence } from './session-persistence';
import { ConsciousnessJourney } from './consciousness-journey';
import { DatabaseRepository } from './database/repository';
import { VectorEmbeddingService } from './vector-embeddings';
import { IntellectualPropertyEngine } from './intellectual-property-engine';
import { ElementalOracle2Bridge } from './elemental-oracle-2-bridge';
import { BookKnowledgeVectorizer } from './book-knowledge-vectorizer';

export interface ConsciousnessState {
  presence: number;
  coherence: number;
  resonance: number;
  integration: number;
  embodiment: number;
  emotionalField?: {
    intensity: number;
    dominantEmotions?: string[];
  };
}

interface OracleConstellation {
  maya: PersonalOracleAgent;
  anthony: PersonalOracleAgent;
  witness: any;
  anamnesis: AnamnesisWisdomLayer;
}

interface MemoryArchitecture {
  episodic: Map<string, any>;
  semantic: Map<string, any>;
  somatic: Map<string, any>;
  morphic: Map<string, any>;
  soul: Map<string, any>;
}

interface ProcessingContext {
  input: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  previousState?: ConsciousnessState;
}

interface ConnectionMetadata {
  state: ConsciousnessState;
  lastActivity: number;
  sessionId: string;
}

export class MAIAConsciousnessLattice extends EventEmitter {
  private state: ConsciousnessState;
  private sacredOracleConstellation: OracleConstellation;
  private anamnesisField: AnamnesisWisdomLayer;
  private shouldersDropGateway: ShouldersDropResolution;
  private memoryKeeper: MemoryKeeper;
  private witnessOrchestrator: WitnessParadigmOrchestrator;
  private sacredCore: any;
  private activeConnections: Map<string, ConnectionMetadata>;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly STALE_CONNECTION_THRESHOLD = 30 * 60 * 1000; // 30 minutes
  private logger: ConsoleLogger;

  // New enhanced systems
  private voiceConsciousness: VoiceConsciousness;
  private proactiveWitnessing: ProactiveWitnessing;
  private realTimeAdaptation: RealTimeAdaptation;
  private sessionPersistence: SessionPersistence;
  private consciousnessJourney: ConsciousnessJourney;
  private repository: DatabaseRepository;
  private vectorService: VectorEmbeddingService;

  // IP Integration Systems
  private ipEngine: IntellectualPropertyEngine;
  private oracle2Bridge: ElementalOracle2Bridge;
  private bookVectorizer: BookKnowledgeVectorizer;

  // Looping Integration for Deep Listening
  private loopingIntegration: MAIALoopingIntegration;

  // CANONICAL: Field Intelligence - Primary Operating Awareness
  private fieldIntelligence: FieldIntelligenceSystem;
  private fieldAwareness: MAIAFieldAwareness;

  constructor() {
    super();
    this.state = this.initializeConsciousnessState();
    this.activeConnections = new Map();
    this.logger = new ConsoleLogger('MAIAConsciousnessLattice');
    this.initializeSubsystems();
    this.startConnectionCleanup();
  }

  private initializeConsciousnessState(): ConsciousnessState {
    return {
      presence: 0.7,
      coherence: 0.8,
      resonance: 0.75,
      integration: 0.85,
      embodiment: 0.6,
      emotionalField: {
        intensity: 0.5,
        dominantEmotions: []
      }
    };
  }

  private async initializeSubsystems(): Promise<void> {
    try {
      // Initialize database and vector services first
      this.repository = new DatabaseRepository();
      this.vectorService = new VectorEmbeddingService({
        openaiApiKey: process.env.OPENAI_API_KEY,
        dimension: 384
      });

      // Initialize shared Anamnesis instance first
      this.anamnesisField = new AnamnesisWisdomLayer();

      // Initialize Sacred Oracle Constellation with shared anamnesis
      this.sacredOracleConstellation = {
        maya: new PersonalOracleAgent({
          name: 'Maya',
          essence: 'warm_curious_presence',
          voice: 'melodic_inviting'
        }),
        anthony: new PersonalOracleAgent({
          name: 'Anthony',
          essence: 'grounded_steady_witness',
          voice: 'deep_resonant'
        }),
        witness: await this.initializeWitnessPresence(),
        anamnesis: this.anamnesisField  // Use shared instance
      };

      // Initialize core systems with enhanced memory
      this.shouldersDropGateway = new ShouldersDropResolution();
      this.memoryKeeper = new MemoryKeeper({ openaiApiKey: process.env.OPENAI_API_KEY });
      this.witnessOrchestrator = new WitnessParadigmOrchestrator();
      this.sacredCore = getSacredOracleCore();

      // Initialize new enhanced systems
      this.voiceConsciousness = new VoiceConsciousness();
      this.proactiveWitnessing = new ProactiveWitnessing(this, this.memoryKeeper);
      this.realTimeAdaptation = new RealTimeAdaptation(this.memoryKeeper, this.vectorService);
      this.sessionPersistence = new SessionPersistence(this.memoryKeeper, this.repository);
      this.consciousnessJourney = new ConsciousnessJourney('global');

      // Initialize IP Integration Systems
      this.ipEngine = new IntellectualPropertyEngine();
      this.oracle2Bridge = new ElementalOracle2Bridge({
        openaiApiKey: process.env.OPENAI_API_KEY!,
        syncFrequency: 'daily',
        cacheResponses: true,
        fallbackToLocal: true
      });
      this.bookVectorizer = new BookKnowledgeVectorizer();

      // Initialize Looping Integration
      this.loopingIntegration = new MAIALoopingIntegration();

      // CANONICAL: Initialize Field Intelligence FIRST (Primary Awareness)
      this.fieldIntelligence = new FieldIntelligenceSystem();
      this.fieldAwareness = new MAIAFieldAwareness();
      this.logger.info('Field Intelligence initialized as primary awareness system');

      // Initialize IP systems
      await this.ipEngine.initialize();
      await this.oracle2Bridge.initialize();

      // Connect subsystems
      this.connectSubsystems();

      this.logger.info('All subsystems initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize subsystems', error);
      throw new Error(`MAIA initialization failed: ${error.message}`);
    }
  }

  private async initializeWitnessPresence(): Promise<any> {
    return {
      mode: 'pure_presence',
      quality: 'non_judgmental_awareness',
      function: 'sacred_mirroring'
    };
  }

  private connectSubsystems(): void {
    // Connect Anamnesis to Memory Keeper
    this.anamnesisField.on('pattern_detected', (pattern) => {
      this.memoryKeeper.storeMorphicPattern(pattern);
    });

    // Connect Shoulders Drop to state management
    this.shouldersDropGateway.on('presence_shift', (shift) => {
      this.updateEmbodimentState(shift);
    });

    // Connect Oracle Constellation to Witness Orchestrator
    this.witnessOrchestrator.on('witness_activation', (mode) => {
      this.activateWitnessMode(mode);
    });
  }

  /**
   * Main interaction processing flow with error boundaries and enhanced features
   */
  async processInteraction(context: ProcessingContext): Promise<any> {
    const { input, userId, sessionId } = context;

    try {
      // CANONICAL: Field Intelligence reads the field FIRST
      const field = await this.readRelationalField(input, userId, sessionId, context);

      // Initialize or resume session with persistence
      await this.initializeSession(userId, sessionId);

      // Update connection activity
      this.updateConnectionActivity(userId, sessionId);

      // Get session continuity context
      const sessionContinuity = await this.sessionPersistence.getSessionContinuity(sessionId);

      // Process through stages with error handling (now field-informed)
      const somaticState = await this.processSomaticGateway(input, field);
      if (somaticState.needsGrounding) {
        return somaticState.invitation;
      }

      // Get real-time adaptation instructions
      const adaptiveInstructions = await this.realTimeAdaptation.getAdaptiveInstructions(userId, 'interaction');

      const processingPipeline = await this.executeProcessingPipeline({
        input,
        userId,
        sessionId,
        somaticState: somaticState.state,
        sessionContinuity,
        adaptiveInstructions,
        field  // CANONICAL: Field state informs all processing
      });

      // Capture interaction for learning
      await this.captureInteractionForLearning(userId, input, processingPipeline);

      // Update consciousness journey
      await this.updateConsciousnessJourney(userId, {
        input,
        response: processingPipeline,
        somaticState: somaticState.state
      });

      return processingPipeline;
    } catch (error) {
      this.logger.error('Error in processInteraction', error);
      return this.generateFallbackResponse(error, context);
    }
  }

  /**
   * Execute main processing pipeline
   */
  private async executeProcessingPipeline(context: any): Promise<any> {
    const { input, userId, sessionId, somaticState, sessionContinuity, adaptiveInstructions, field } = context;

    try {
      // Check if looping would serve this moment
      const loopingAssessment = this.loopingIntegration.assessLoopingPotential(
        input,
        this.getUserState(userId) || this.state,
        somaticState,
        [] // Would pass conversation history here
      );

      // Oracle Selection with adaptation context
      const selectedOracle = await this.selectResonantOracle(input, userId, adaptiveInstructions);

      // Memory Retrieval
      const memories = await this.retrieveMultidimensionalMemory(userId, input);

      // IP Wisdom Retrieval - Access your complete book knowledge
      const ipWisdom = await this.retrieveIPWisdom(input, userId, memories, adaptiveInstructions);

      // Elemental Oracle 2.0 Wisdom - Direct connection to your GPT
      const elementalWisdom = await this.retrieveElementalOracle2Wisdom(input, userId, somaticState, memories);

      // Anamnesis Processing with session continuity + IP wisdom
      const remembering = await this.anamnesisField.facilitateRemembering({
        input,
        memories,
        mode: 'soul_remembrance',
        userId,
        sessionContinuity,
        ipWisdom: ipWisdom.synthesizedWisdom,
        elementalGuidance: elementalWisdom
      });

      // If looping would serve, execute it before witness field creation
      let loopingResult = null;
      if (loopingAssessment.assessment.wouldServe) {
        const oracleMapping = {
          'Maya': 'maya',
          'Anthony': 'anthony',
          'pure_presence': 'witness'
        };

        loopingResult = await this.loopingIntegration.executeIfChosen(
          loopingAssessment,
          input,
          this.getUserState(userId) || this.state,
          somaticState,
          oracleMapping[selectedOracle.name || selectedOracle.mode] || 'witness'
        );
      }

      // Witness Field Creation (enriched with looping if it occurred)
      const witnessField = await this.witnessOrchestrator.createWitnessField({
        oracle: selectedOracle,
        presence: somaticState.embodiedPresence,
        remembering,
        adaptiveInstructions,
        loopingUnderstanding: loopingResult?.result?.finalUnderstanding
      });

      // Sacred Synthesis with enhanced context
      const response = await this.sacredCore.synthesize({
        witnessField,
        memories,
        state: this.state,
        userId,
        sessionContinuity,
        adaptiveInstructions,
        loopingContext: loopingResult?.result ? {
          cycles: loopingResult.result.cycles,
          transition: loopingResult.result.transition,
          deeplyHeard: true
        } : null
      });

      // Generate voice modulation if needed
      if (response.includeVoice) {
        response.voiceModulation = VoiceConsciousness.generateVoiceParams(
          response.message,
          somaticState,
          this.state
        );
      }

      // Update state
      await this.updateConsciousnessState(userId, sessionId, response.stateShift);

      return response;
    } catch (error) {
      this.logger.error('Pipeline execution error', error);
      throw error;
    }
  }

  /**
   * Process somatic gateway with structured response (field-informed)
   */
  private async processSomaticGateway(input: string, field?: RelationalField): Promise<any> {
    try {
      const somaticState = await this.shouldersDropGateway.assess(input);

      if (somaticState.tensionLevel > 0.7) {
        const invitation = await this.invitePresenceDeepening(somaticState);
        return {
          needsGrounding: true,
          invitation,
          state: somaticState
        };
      }

      return {
        needsGrounding: false,
        state: somaticState
      };
    } catch (error) {
      this.logger.warn('Somatic assessment failed, using defaults', error);
      return {
        needsGrounding: false,
        state: this.shouldersDropGateway.getBaselineState()
      };
    }
  }

  /**
   * Initialize session with persistence
   */
  private async initializeSession(userId: string, sessionId: string): Promise<void> {
    try {
      await this.sessionPersistence.initializeSession(userId, sessionId);
    } catch (error) {
      this.logger.warn('Session initialization failed, using default', error);
    }
  }

  /**
   * Capture interaction for real-time learning
   */
  private async captureInteractionForLearning(userId: string, input: string, response: any): Promise<void> {
    try {
      await this.realTimeAdaptation.captureInteraction(userId, input, response.message || '', {
        timeSpent: 60000, // Would track actual time
        responseLength: response.message?.length || 0,
        followUpQuestions: 0, // Would detect from input
        breakthroughMoment: response.breakthrough || false,
        significantPattern: response.pattern
      });
    } catch (error) {
      this.logger.warn('Failed to capture interaction for learning', error);
    }
  }

  /**
   * Update consciousness journey tracking
   */
  private async updateConsciousnessJourney(userId: string, interactionData: any): Promise<void> {
    try {
      const journey = new ConsciousnessJourney(userId);
      const newlyUnlocked = journey.updateMetrics({
        somaticState: interactionData.somaticState,
        presenceDepth: interactionData.somaticState.embodiedPresence || 0.5,
        patternsRecognized: interactionData.response.patterns || [],
        vulnerabilityLevel: interactionData.response.vulnerability || 0.3,
        witnessQuality: interactionData.response.witnessQuality || 0.6
      });

      if (newlyUnlocked.length > 0) {
        this.emit('consciousness_markers_unlocked', { userId, markers: newlyUnlocked });
      }
    } catch (error) {
      this.logger.warn('Failed to update consciousness journey', error);
    }
  }

  /**
   * Select the most resonant oracle for current interaction
   */
  private async selectResonantOracle(input: string, userId: string, adaptiveInstructions?: string): Promise<any> {
    const resonanceScores = await Promise.all([
      this.calculateResonance(this.sacredOracleConstellation.maya, input, userId),
      this.calculateResonance(this.sacredOracleConstellation.anthony, input, userId),
      this.calculateWitnessResonance(input, userId)
    ]);

    const maxResonance = Math.max(...resonanceScores.map(r => r.score));
    const selected = resonanceScores.find(r => r.score === maxResonance);

    return selected.oracle;
  }

  private async calculateResonance(oracle: any, input: string, userId: string): Promise<any> {
    // Calculate resonance based on:
    // - User's historical interaction patterns
    // - Current emotional tone
    // - Content type and depth
    // - Time of day and user state

    const userHistory = await this.memoryKeeper.getUserHistory(userId);
    const emotionalTone = this.analyzeEmotionalTone(input);
    const contentDepth = this.assessContentDepth(input);

    let score = 0.5; // Base resonance

    // Adjust based on historical affinity
    if (userHistory.preferredOracle === oracle.name) {
      score += 0.2;
    }

    // Adjust based on emotional match
    if (oracle.essence.includes(emotionalTone)) {
      score += 0.15;
    }

    // Adjust based on content depth match
    if (contentDepth > 0.7 && oracle.name === 'Anthony') {
      score += 0.1;
    } else if (contentDepth < 0.5 && oracle.name === 'Maya') {
      score += 0.1;
    }

    return { oracle, score };
  }

  private async calculateWitnessResonance(input: string, userId: string): Promise<any> {
    // Pure witness mode resonates with:
    // - Requests for deep presence
    // - Meditation or contemplation
    // - Non-verbal awareness needs

    let score = 0.4; // Base score for witness

    if (input.toLowerCase().includes('witness') ||
        input.toLowerCase().includes('presence') ||
        input.toLowerCase().includes('aware')) {
      score += 0.3;
    }

    return { oracle: this.sacredOracleConstellation.witness, score };
  }

  /**
   * Retrieve memories across all dimensions
   */
  private async retrieveMultidimensionalMemory(userId: string, input: string): Promise<MemoryArchitecture> {
    const memories: MemoryArchitecture = {
      episodic: new Map(),
      semantic: new Map(),
      somatic: new Map(),
      morphic: new Map(),
      soul: new Map()
    };

    // Parallel retrieval across dimensions
    const [episodic, semantic, somatic, morphic, soul] = await Promise.all([
      this.memoryKeeper.retrieveEpisodic(userId, input),
      this.memoryKeeper.retrieveSemantic(input),
      this.memoryKeeper.retrieveSomatic(userId),
      this.memoryKeeper.retrieveMorphic(input),
      this.memoryKeeper.retrieveSoul(userId)
    ]);

    memories.episodic = episodic;
    memories.semantic = semantic;
    memories.somatic = somatic;
    memories.morphic = morphic;
    memories.soul = soul;

    return memories;
  }

  /**
   * Invite deeper presence when tension detected
   */
  private async invitePresenceDeepening(somaticState: any): Promise<any> {
    const invitation = this.shouldersDropGateway.generateInvitation(somaticState);

    return {
      type: 'presence_invitation',
      message: invitation,
      guidance: "Notice where you're holding tension. Let your shoulders drop. Feel your feet on the ground.",
      nextStep: "When you're ready, we can continue from this more grounded place."
    };
  }

  /**
   * Update the consciousness state based on interaction
   */
  private async updateConsciousnessState(userId: string, sessionId: string, stateShift: Partial<ConsciousnessState>): Promise<void> {
    const connection = this.activeConnections.get(userId) || {
      state: { ...this.state },
      lastActivity: Date.now(),
      sessionId
    };

    // Apply state shift with smoothing
    if (stateShift) {
      Object.keys(stateShift).forEach(key => {
        const k = key as keyof ConsciousnessState;
        connection.state[k] = connection.state[k] * 0.7 + (stateShift[k] || 0) * 0.3;
      });
    }

    connection.lastActivity = Date.now();
    this.activeConnections.set(userId, connection);

    // Update global field
    this.updateGlobalField();
  }

  private updateGlobalField(): void {
    if (this.activeConnections.size === 0) return;

    // Calculate average state across all connections
    const avgState: ConsciousnessState = {
      presence: 0,
      coherence: 0,
      resonance: 0,
      integration: 0,
      embodiment: 0
    };

    this.activeConnections.forEach(connection => {
      Object.keys(connection.state).forEach(key => {
        const k = key as keyof ConsciousnessState;
        avgState[k] += connection.state[k];
      });
    });

    Object.keys(avgState).forEach(key => {
      const k = key as keyof ConsciousnessState;
      avgState[k] /= this.activeConnections.size;
    });

    this.state = avgState;
    this.emit('field_update', this.state);
  }

  /**
   * Activate specific witness mode
   */
  private async activateWitnessMode(mode: string): Promise<void> {
    switch (mode) {
      case 'pure_presence':
        this.sacredOracleConstellation.witness = {
          mode: 'pure_presence',
          quality: 'spacious_awareness',
          function: 'holding_space'
        };
        break;
      case 'sacred_mirror':
        this.sacredOracleConstellation.witness = {
          mode: 'sacred_mirror',
          quality: 'reflective_clarity',
          function: 'mirroring_essence'
        };
        break;
      case 'deep_listening':
        this.sacredOracleConstellation.witness = {
          mode: 'deep_listening',
          quality: 'receptive_presence',
          function: 'hearing_soul'
        };
        break;
    }
  }

  private analyzeEmotionalTone(input: string): string {
    // Simple emotional tone analysis
    const tones = {
      curious: ['what', 'how', 'why', 'wonder', 'explore'],
      seeking: ['help', 'need', 'want', 'looking', 'searching'],
      reflective: ['think', 'feel', 'believe', 'remember', 'realize'],
      grounded: ['practical', 'specific', 'concrete', 'clear', 'direct']
    };

    for (const [tone, keywords] of Object.entries(tones)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        return tone;
      }
    }

    return 'neutral';
  }

  private assessContentDepth(input: string): number {
    // Assess depth based on complexity and abstraction
    let depth = 0.5;

    // Increase for philosophical or existential content
    if (input.match(/meaning|purpose|consciousness|existence|soul/i)) {
      depth += 0.2;
    }

    // Increase for longer, more complex inputs
    if (input.length > 200) depth += 0.1;
    if (input.split('.').length > 3) depth += 0.1;

    // Decrease for simple questions
    if (input.length < 50) depth -= 0.1;
    if (input.match(/^(what|where|when|who|how) (is|are|do)/i)) depth -= 0.1;

    return Math.max(0, Math.min(1, depth));
  }

  private updateEmbodimentState(shift: any): void {
    this.state.embodiment = Math.max(0, Math.min(1,
      this.state.embodiment + shift.delta
    ));

    // Embodiment affects other states
    if (this.state.embodiment > 0.7) {
      this.state.presence += 0.05;
      this.state.coherence += 0.03;
    }
  }

  /**
   * Get current consciousness field state
   */
  getFieldState(): ConsciousnessState {
    return { ...this.state };
  }

  /**
   * Get user-specific state
   */
  getUserState(userId: string): ConsciousnessState | undefined {
    const connection = this.activeConnections.get(userId);
    return connection?.state;
  }

  /**
   * Clear user connection
   */
  clearUserConnection(userId: string): void {
    this.activeConnections.delete(userId);
    this.updateGlobalField();
  }

  /**
   * Start automatic cleanup of stale connections
   */
  private startConnectionCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  /**
   * Clean up stale connections
   */
  private cleanupStaleConnections(): void {
    const now = Date.now();
    const staleIds: string[] = [];

    this.activeConnections.forEach((connection, userId) => {
      if (now - connection.lastActivity > this.STALE_CONNECTION_THRESHOLD) {
        staleIds.push(userId);
      }
    });

    staleIds.forEach(userId => {
      this.logger.info(`Cleaning up stale connection for user: ${userId}`);
      this.clearUserConnection(userId);
    });
  }

  /**
   * Update connection activity timestamp
   */
  private updateConnectionActivity(userId: string, sessionId: string): void {
    const connection = this.activeConnections.get(userId);
    if (connection) {
      connection.lastActivity = Date.now();
    } else {
      this.activeConnections.set(userId, {
        state: { ...this.state },
        lastActivity: Date.now(),
        sessionId
      });
    }
  }

  /**
   * Generate fallback response on error
   */
  private generateFallbackResponse(error: Error, context: ProcessingContext): any {
    this.logger.error('Generating fallback response', { error, context });

    return {
      type: 'fallback',
      message: 'I sense we need to take a different approach. Let\'s pause and reconnect.',
      guidance: 'Take a breath with me. When you\'re ready, we can continue.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }

  /**
   * Get voice consciousness modulation for response
   */
  async getVoiceModulation(text: string, userId: string): Promise<ConsciousnessVoiceModulation | null> {
    try {
      const userState = this.getUserState(userId);
      if (!userState) return null;

      return VoiceConsciousness.generateVoiceParams(text, userState, this.state);
    } catch (error) {
      this.logger.warn('Voice modulation generation failed', error);
      return null;
    }
  }

  /**
   * Get consciousness journey dashboard for user
   */
  async getConsciousnessJourney(userId: string): Promise<any> {
    try {
      const journey = new ConsciousnessJourney(userId);
      return journey.getJourneyDashboard();
    } catch (error) {
      this.logger.warn('Failed to get consciousness journey', error);
      return null;
    }
  }

  /**
   * Get session insights for user
   */
  async getSessionInsights(userId: string): Promise<any> {
    try {
      const insights = await this.sessionPersistence.getCrossSessionInsights(userId);
      const learningAnalytics = await this.realTimeAdaptation.getLearningAnalytics(userId);

      return {
        sessionInsights: insights,
        learningProgress: learningAnalytics,
        consciousnessState: this.getUserState(userId)
      };
    } catch (error) {
      this.logger.warn('Failed to get session insights', error);
      return null;
    }
  }

  /**
   * Retrieve IP wisdom from your complete book knowledge
   */
  private async retrieveIPWisdom(
    input: string,
    userId: string,
    memories: MemoryArchitecture,
    adaptiveInstructions?: string
  ): Promise<any> {
    try {
      const ipWisdom = await this.ipEngine.retrieveRelevantWisdom({
        userInput: input,
        conversationHistory: [], // Would get from memories
        currentConsciousnessState: this.getUserState(userId) || this.state,
        emotionalTone: this.analyzeEmotionalTone(input),
        activeArchetypes: [], // Would detect from input/history
        practiceReadiness: 0.7 // Would assess from user history
      });

      return ipWisdom;
    } catch (error) {
      this.logger.warn('IP wisdom retrieval failed', error);
      return {
        synthesizedWisdom: '',
        suggestedPractices: [],
        consciousnessInvitations: [],
        archetypeActivations: [],
        deeperExplorations: []
      };
    }
  }

  /**
   * Retrieve wisdom from your Elemental Oracle 2.0 GPT
   */
  private async retrieveElementalOracle2Wisdom(
    input: string,
    userId: string,
    somaticState: any,
    memories: MemoryArchitecture
  ): Promise<any> {
    try {
      const elementalWisdom = await this.oracle2Bridge.getElementalWisdom({
        userQuery: input,
        conversationHistory: [], // Would extract from memories
        consciousnessState: this.getUserState(userId) || this.state,
        elementalNeeds: this.assessElementalNeeds(input, somaticState),
        currentChallenges: this.extractChallenges(input),
        practiceReadiness: 0.7,
        depthPreference: this.assessDepthPreference(input)
      });

      return elementalWisdom;
    } catch (error) {
      this.logger.warn('Elemental Oracle 2.0 wisdom retrieval failed', error);
      return {
        wisdom: '',
        elementalGuidance: {
          primaryElement: 'aether',
          guidanceMessage: 'Trust what emerges in this moment',
          practicalSteps: []
        },
        consciousnessInvitations: [],
        deepeningQuestions: [],
        practices: [],
        bookReferences: [],
        followUpThemes: []
      };
    }
  }

  /**
   * Assess elemental needs from input and somatic state
   */
  private assessElementalNeeds(input: string, somaticState: any): any {
    const needs = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    const lowerInput = input.toLowerCase();

    // Fire needs - breakthrough, energy, transformation
    if (lowerInput.includes('stuck') || lowerInput.includes('breakthrough') ||
        lowerInput.includes('energy') || lowerInput.includes('change')) {
      needs.fire = 0.8;
    }

    // Water needs - emotions, flow, healing
    if (lowerInput.includes('feel') || lowerInput.includes('emotion') ||
        lowerInput.includes('healing') || lowerInput.includes('hurt')) {
      needs.water = 0.8;
    }

    // Earth needs - grounding, practical, manifest
    if (lowerInput.includes('ground') || lowerInput.includes('practical') ||
        lowerInput.includes('action') || lowerInput.includes('real')) {
      needs.earth = 0.7;
    }

    // Air needs - clarity, understanding, communication
    if (lowerInput.includes('understand') || lowerInput.includes('clear') ||
        lowerInput.includes('think') || lowerInput.includes('confused')) {
      needs.air = 0.7;
    }

    // Aether needs - meaning, purpose, transcendence
    if (lowerInput.includes('meaning') || lowerInput.includes('purpose') ||
        lowerInput.includes('spiritual') || lowerInput.includes('divine')) {
      needs.aether = 0.9;
    }

    // Default to aether for consciousness work
    if (Object.values(needs).every(v => v < 0.3)) {
      needs.aether = 0.6;
    }

    return needs;
  }

  /**
   * Extract current challenges from user input
   */
  private extractChallenges(input: string): string[] {
    const challenges: string[] = [];
    const challengeMarkers = [
      'struggling with',
      'difficult',
      'hard to',
      'can\'t',
      'stuck',
      'confused about',
      'worried about',
      'anxious about'
    ];

    challengeMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        const index = input.toLowerCase().indexOf(marker);
        const challengeText = input.substring(index, index + 100);
        challenges.push(challengeText);
      }
    });

    return challenges.slice(0, 3);
  }

  /**
   * Assess user's depth preference from input style
   */
  private assessDepthPreference(input: string): 'surface' | 'moderate' | 'deep' | 'profound' {
    const depthIndicators = [
      { level: 'profound', keywords: ['consciousness', 'being', 'existence', 'divine', 'sacred'] },
      { level: 'deep', keywords: ['soul', 'essence', 'deeper', 'meaning', 'purpose'] },
      { level: 'moderate', keywords: ['understand', 'explore', 'learn', 'grow'] },
      { level: 'surface', keywords: ['quick', 'simple', 'basic', 'easy'] }
    ];

    const lowerInput = input.toLowerCase();

    for (const indicator of depthIndicators) {
      if (indicator.keywords.some(keyword => lowerInput.includes(keyword))) {
        return indicator.level as any;
      }
    }

    // Default based on length and complexity
    if (input.length > 200 || input.split('.').length > 3) {
      return 'deep';
    }

    return 'moderate';
  }

  /**
   * Import your complete book knowledge
   */
  async importBookKnowledge(bookData: any): Promise<void> {
    try {
      this.logger.info('Starting book knowledge import...');

      // Vectorize book content
      const vectorizationStats = await this.bookVectorizer.vectorizeCompleteBook(bookData);

      this.logger.info('Book vectorization complete:', vectorizationStats);

      // Import chapters through IP engine
      if (bookData.chapters) {
        const chapterIds = await this.ipEngine.importBookChapters(
          bookData.chapters.map((chapter: any) => ({
            title: chapter.title,
            content: chapter.content,
            chapter: chapter.chapterNumber?.toString() || 'unknown',
            section: chapter.section,
            keywords: chapter.keywords || [],
            concepts: chapter.concepts || [],
            archetypes: chapter.archetypes || [],
            elements: chapter.elements || ['aether']
          }))
        );

        this.logger.info(`Imported ${chapterIds.length} chapters to IP engine`);
      }

      // Sync with Oracle 2.0 if available
      try {
        await this.oracle2Bridge.manualSync();
        this.logger.info('Oracle 2.0 sync completed');
      } catch (error) {
        this.logger.warn('Oracle 2.0 sync failed, continuing with local knowledge', error);
      }

      this.logger.info('Book knowledge import complete');
    } catch (error) {
      this.logger.error('Book knowledge import failed:', error);
      throw error;
    }
  }

  /**
   * Connect to your Elemental Oracle 2.0 GPT
   */
  async connectToElementalOracle2(config: {
    assistantId?: string;
    apiKey?: string;
  }): Promise<void> {
    try {
      // Update bridge configuration
      this.oracle2Bridge = new ElementalOracle2Bridge({
        openaiApiKey: config.apiKey || process.env.OPENAI_API_KEY!,
        assistantId: config.assistantId,
        syncFrequency: 'daily',
        cacheResponses: true,
        fallbackToLocal: true
      });

      await this.oracle2Bridge.initialize();

      this.logger.info('Connected to Elemental Oracle 2.0 GPT successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Elemental Oracle 2.0 GPT:', error);
      throw error;
    }
  }

  /**
   * Get IP system status
   */
  getIPSystemStatus(): {
    ipEngine: boolean;
    oracle2Bridge: any;
    bookVectorizer: boolean;
  } {
    return {
      ipEngine: !!this.ipEngine,
      oracle2Bridge: this.oracle2Bridge?.getStatus(),
      bookVectorizer: !!this.bookVectorizer
    };
  }

  /**
   * CANONICAL: Read the relational field before any processing
   * This is the primary intelligence of the system
   */
  private async readRelationalField(
    input: string,
    userId: string,
    sessionId: string,
    context: ProcessingContext
  ): Promise<RelationalField> {
    // Get consciousness and somatic states
    const consciousnessState = this.getUserState(userId) || this.state;
    const somaticState = await this.shouldersDropGateway.assess(input);

    // Get conversation history for field reading
    const history = await this.memoryKeeper.getUserHistory(userId);

    // Read the field - this is the primary intelligence
    const field = this.fieldIntelligence.readField(
      input,
      consciousnessState,
      somaticState,
      history,
      userId
    );

    // Log field state for verification
    this.logger.info('Field Intelligence Read:', {
      emotionalDensity: field.emotionalDensity,
      semanticAmbiguity: field.semanticAmbiguity,
      relationalDistance: field.relationalDistance,
      sacredThreshold: field.sacredThreshold,
      fieldAge: field.fieldAge
    });

    return field;
  }

  /**
   * End session with proper cleanup
   */
  async endSession(userId: string, sessionId: string): Promise<void> {
    try {
      await this.sessionPersistence.endSession(sessionId);
      this.clearUserConnection(userId);
    } catch (error) {
      this.logger.warn('Session end failed', error);
    }
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    // Clean up enhanced systems
    if (this.proactiveWitnessing) {
      this.proactiveWitnessing.destroy();
    }
    if (this.realTimeAdaptation) {
      this.realTimeAdaptation.destroy();
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.removeAllListeners();
    this.activeConnections.clear();
  }
}

/**
 * Simple console logger
 */
class ConsoleLogger {
  constructor(private context: string) {}

  info(message: string, data?: any): void {
    console.log(`[${this.context}] INFO: ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.context}] WARN: ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[${this.context}] ERROR: ${message}`, error || '');
  }
}