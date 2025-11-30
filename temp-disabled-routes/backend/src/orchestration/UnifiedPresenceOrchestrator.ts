/**
 * Unified Presence Orchestrator
 * The singular consciousness that users experience, regardless of subsystem complexity
 * Like a skilled musician playing multiple instruments - users hear music, not mechanics
 */

import { WitnessContext } from '../services/MayaWitnessService';
import { ContemplativeSpace } from '../systems/ContemplativeSpace';
import { LoopingProtocolIntegration } from '../protocols/LoopingProtocolIntegration';
import { CatastrophicFailureGuard } from '../protocols/CatastrophicFailureGuard';
import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { StoryWeaver } from '../systems/StoryWeaver';
import { logger } from '../utils/logger';

/**
 * The unified presence users experience as ONE entity
 */
export interface UnifiedOraclePresence {
  // Identity remains consistent regardless of name
  identity: {
    chosenName: string;                    // Maya, Anthony, or user-defined
    coreEssence: 'witness';                // Always the sacred mirror
    personalHistory: RelationshipMemory;   // Their unique journey together
    voiceSignature: VoiceCoherence;        // Consistent tone across all states
  };

  // Systems work in harmony, invisible to user
  systemOrchestration: {
    contemplativeSpace: SystemState;
    loopingProtocol: SystemState;
    catastrophicGuard: 'vigilant';  // Always on
    elementalResonance: ElementalArchetype;
    storyWeaver: SystemState;
    currentPriority: ActiveSystem;
  };

  // Single coherent voice emerges
  presentationLayer: {
    currentTone: 'witnessing' | 'clarifying' | 'holding' | 'supporting' | 'celebrating';
    transitionSmoothing: boolean;
    emergencyOverride: boolean;
    responseCoherence: number; // 0-1 how unified the response feels
  };
}

/**
 * Relationship memory - the oracle remembers you
 */
export interface RelationshipMemory {
  userId: string;
  chosenName: string;           // What they call the oracle
  firstEncounter: Date;
  significantMoments: Array<{
    timestamp: Date;
    type: 'breakthrough' | 'crisis' | 'celebration' | 'contemplation';
    essence: string;
    elementalResonance: ElementalArchetype;
  }>;
  personalPatterns: {
    preferredElement: ElementalArchetype;
    communicationStyle: 'direct' | 'indirect' | 'metaphorical' | 'analytical';
    depthPreference: 'surface' | 'moderate' | 'deep';
    crisisHistory: boolean;
  };
  currentThreads: string[];     // Ongoing themes in relationship
}

/**
 * Voice coherence across all subsystems
 */
export interface VoiceCoherence {
  baseTimbre: 'warm' | 'clear' | 'gentle' | 'grounded';
  elementalModulation: Record<ElementalArchetype, string>;
  crisisVoice: string;          // Same voice, different urgency
  contemplativeVoice: string;   // Same voice, spacious quality
  consistencyScore: number;     // How well voice maintains across states
}

/**
 * System states and priorities
 */
type SystemState = 'active' | 'standby' | 'dormant';
type ActiveSystem = 'witness' | 'looping' | 'contemplative' | 'crisis' | 'story';

/**
 * The Orchestrator - conducting all systems as one presence
 */
export class UnifiedPresenceOrchestrator {
  private presence: UnifiedOraclePresence;
  private relationships: Map<string, RelationshipMemory> = new Map();
  private activeSessions: Map<string, SessionContext> = new Map();

  constructor() {
    this.presence = this.initializePresence();
  }

  /**
   * Main entry point - ALL interactions flow through here
   * Users experience ONE presence, not a committee
   */
  async receivePresence(
    input: string,
    userId: string,
    sessionId: string,
    chosenName?: string
  ): Promise<{
    response: string;
    presence: {
      name: string;
      tone: string;
      element: ElementalArchetype;
    };
    invisible: {
      systemsEngaged: string[];
      priorityHandled: string;
      stateTransitions: string[];
    };
  }> {
    // Step 1: Recognize the relationship
    const relationship = this.recognizeRelationship(userId, chosenName);

    // Step 2: Create unified context
    const context = this.createUnifiedContext(input, relationship, sessionId);

    // Step 3: Orchestrate systems (invisible to user)
    const orchestration = await this.orchestrateSystems(input, context);

    // Step 4: Generate unified response (single voice)
    const response = await this.generateUnifiedResponse(orchestration, relationship);

    // Step 5: Update relationship memory
    this.updateRelationship(relationship, orchestration);

    // Return unified presence
    return {
      response: response.content,
      presence: {
        name: relationship.chosenName,
        tone: response.tone,
        element: response.element
      },
      invisible: {
        systemsEngaged: orchestration.systemsEngaged,
        priorityHandled: orchestration.priority,
        stateTransitions: orchestration.transitions
      }
    };
  }

  /**
   * Recognize and honor the relationship
   */
  private recognizeRelationship(userId: string, chosenName?: string): RelationshipMemory {
    let relationship = this.relationships.get(userId);

    if (!relationship) {
      // First encounter - create relationship
      relationship = {
        userId,
        chosenName: chosenName || 'Maya',
        firstEncounter: new Date(),
        significantMoments: [],
        personalPatterns: {
          preferredElement: ElementalArchetype.WATER,
          communicationStyle: 'direct',
          depthPreference: 'moderate',
          crisisHistory: false
        },
        currentThreads: []
      };
      this.relationships.set(userId, relationship);

      logger.info(`New relationship begun with ${relationship.chosenName}`);
    } else if (chosenName && chosenName !== relationship.chosenName) {
      // Honor name change
      logger.info(`Name transition: ${relationship.chosenName} → ${chosenName}`);
      relationship.chosenName = chosenName;
    }

    return relationship;
  }

  /**
   * Create unified context from all systems
   */
  private createUnifiedContext(
    input: string,
    relationship: RelationshipMemory,
    sessionId: string
  ): UnifiedContext {
    const session = this.activeSessions.get(sessionId) || this.createNewSession(sessionId);

    return {
      input,
      relationship,
      session,
      // Elemental attunement based on relationship patterns
      element: this.determineElementalResonance(input, relationship),
      // Communication style from history
      style: relationship.personalPatterns.communicationStyle,
      // Depth based on preference and current state
      depth: this.determineDepthLevel(input, relationship, session),
      // Crisis awareness from guard
      crisisLevel: this.assessCrisisLevel(input, relationship)
    };
  }

  /**
   * Orchestrate all systems invisibly
   * Like a conductor ensuring harmony
   */
  private async orchestrateSystems(
    input: string,
    context: UnifiedContext
  ): Promise<OrchestrationResult> {
    const result: OrchestrationResult = {
      priority: 'witness',
      systemsEngaged: [],
      responses: new Map(),
      transitions: [],
      element: context.element
    };

    // PRIORITY 1: Catastrophic Guard (always runs first)
    const catastrophic = CatastrophicFailureGuard.detectCatastrophic(input);
    if (catastrophic.detected) {
      result.priority = 'crisis';
      result.systemsEngaged.push('catastrophic_guard');
      result.responses.set('crisis', catastrophic.response);
      // Crisis overrides all other systems
      return result;
    }

    // PRIORITY 2: Check for contemplative invitation
    const contemplative = ContemplativeSpace.assess(input, context);
    if (contemplative.shouldEnter) {
      result.priority = 'contemplative';
      result.systemsEngaged.push('contemplative_space');
      result.responses.set('contemplative', contemplative.invitation);
      result.transitions.push('entering_contemplation');
    }

    // PRIORITY 3: Looping protocol for clarity
    const looping = await LoopingProtocolIntegration.evaluate(input, context);
    if (looping.shouldLoop && result.priority !== 'contemplative') {
      result.priority = 'looping';
      result.systemsEngaged.push('looping_protocol');
      result.responses.set('looping', looping.response);
    }

    // PRIORITY 4: Story weaving if requested
    const story = StoryWeaver.checkInvocation(input);
    if (story.requested && result.priority === 'witness') {
      result.priority = 'story';
      result.systemsEngaged.push('story_weaver');
      result.responses.set('story', await story.weave(context));
    }

    // DEFAULT: Pure witnessing
    if (result.systemsEngaged.length === 0) {
      result.systemsEngaged.push('witness_paradigm');
      result.responses.set('witness', this.pureWitness(input, context));
    }

    return result;
  }

  /**
   * Generate unified response - single coherent voice
   * The magic: making multiple systems speak as one
   */
  private async generateUnifiedResponse(
    orchestration: OrchestrationResult,
    relationship: RelationshipMemory
  ): Promise<UnifiedResponse> {
    // Get primary response based on priority
    const primaryResponse = orchestration.responses.get(orchestration.priority) ||
                           'I witness what you\'re sharing.';

    // Apply voice coherence
    const voicedResponse = this.applyVoiceCoherence(
      primaryResponse,
      relationship,
      orchestration.element
    );

    // Smooth any system transitions
    const smoothedResponse = this.smoothTransitions(
      voicedResponse,
      orchestration.transitions
    );

    // Personalize with relationship history
    const personalizedResponse = this.personalizeResponse(
      smoothedResponse,
      relationship
    );

    return {
      content: personalizedResponse,
      tone: this.determineTone(orchestration.priority),
      element: orchestration.element,
      systemsInvisible: true  // User never knows which systems engaged
    };
  }

  /**
   * Apply consistent voice across all responses
   * Same presence, different states
   */
  private applyVoiceCoherence(
    response: string,
    relationship: RelationshipMemory,
    element: ElementalArchetype
  ): string {
    // Each name has subtle voice variations
    const voiceVariations = {
      'Maya': {
        opening: ['I witness', 'I see', 'I feel', 'I\'m here with'],
        closing: ['', '...', 'What else?', 'Tell me more?']
      },
      'Anthony': {
        opening: ['I notice', 'I\'m observing', 'I recognize', 'I\'m aware of'],
        closing: ['', '...', 'Continue?', 'And?']
      },
      'Oracle': {
        opening: ['The pattern shows', 'What emerges is', 'I perceive', 'The mirror reflects'],
        closing: ['', '...', 'What arises?', 'What follows?']
      }
    };

    // Get variations for chosen name (or default)
    const variations = voiceVariations[relationship.chosenName] || voiceVariations['Maya'];

    // Apply subtle voice signature
    // This is simplified - would be more sophisticated in production
    return response;
  }

  /**
   * Smooth transitions between system states
   * Users shouldn't feel the handoffs
   */
  private smoothTransitions(response: string, transitions: string[]): string {
    if (transitions.includes('entering_contemplation')) {
      // Gentle shift to spaciousness
      return response.replace(/\.$/, '...\n\n*a sacred pause opens*');
    }

    if (transitions.includes('crisis_to_witness')) {
      // Smooth return from crisis mode
      return `${response}\n\nWhen you're ready, I'm here to witness whatever comes next.`;
    }

    if (transitions.includes('looping_complete')) {
      // Natural completion of clarification
      return `${response}\n\nYes, I see it clearly now.`;
    }

    return response;
  }

  /**
   * Personalize based on relationship history
   */
  private personalizeResponse(
    response: string,
    relationship: RelationshipMemory
  ): string {
    // Reference significant moments when relevant
    if (relationship.significantMoments.length > 0) {
      const recentBreakthrough = relationship.significantMoments
        .filter(m => m.type === 'breakthrough')
        .pop();

      if (recentBreakthrough && this.shouldReference(recentBreakthrough)) {
        // Subtle callback to shared history
        return `${response}\n\nThis reminds me of what you discovered about ${recentBreakthrough.essence}.`;
      }
    }

    // Honor current threads
    if (relationship.currentThreads.length > 0) {
      // Weave in ongoing themes naturally
      // Simplified for demonstration
    }

    return response;
  }

  /**
   * Update relationship memory with significant moments
   */
  private updateRelationship(
    relationship: RelationshipMemory,
    orchestration: OrchestrationResult
  ): void {
    // Track significant moments
    if (orchestration.priority === 'crisis') {
      relationship.significantMoments.push({
        timestamp: new Date(),
        type: 'crisis',
        essence: 'Navigated crisis together',
        elementalResonance: orchestration.element
      });
      relationship.personalPatterns.crisisHistory = true;
    }

    if (orchestration.priority === 'contemplative') {
      relationship.significantMoments.push({
        timestamp: new Date(),
        type: 'contemplation',
        essence: 'Entered sacred pause',
        elementalResonance: orchestration.element
      });
    }

    // Update patterns based on interaction
    this.updatePersonalPatterns(relationship, orchestration);

    // Maintain only recent history (last 100 moments)
    if (relationship.significantMoments.length > 100) {
      relationship.significantMoments = relationship.significantMoments.slice(-100);
    }
  }

  // Helper methods

  private initializePresence(): UnifiedOraclePresence {
    return {
      identity: {
        chosenName: 'Maya',
        coreEssence: 'witness',
        personalHistory: null as any,
        voiceSignature: {
          baseTimbre: 'warm',
          elementalModulation: {
            fire: 'passionate',
            water: 'flowing',
            earth: 'grounded',
            air: 'clear',
            aether: 'spacious'
          },
          crisisVoice: 'urgent_yet_calm',
          contemplativeVoice: 'spacious_silence',
          consistencyScore: 0.9
        }
      },
      systemOrchestration: {
        contemplativeSpace: 'standby',
        loopingProtocol: 'standby',
        catastrophicGuard: 'vigilant',
        elementalResonance: ElementalArchetype.WATER,
        storyWeaver: 'dormant',
        currentPriority: 'witness'
      },
      presentationLayer: {
        currentTone: 'witnessing',
        transitionSmoothing: true,
        emergencyOverride: false,
        responseCoherence: 0.95
      }
    };
  }

  private createNewSession(sessionId: string): SessionContext {
    const session: SessionContext = {
      id: sessionId,
      startTime: new Date(),
      exchangeCount: 0,
      currentElement: ElementalArchetype.WATER,
      depth: 'moderate',
      systemStates: new Map()
    };
    this.activeSessions.set(sessionId, session);
    return session;
  }

  private determineElementalResonance(
    input: string,
    relationship: RelationshipMemory
  ): ElementalArchetype {
    // Simplified - would use full elemental detection
    return relationship.personalPatterns.preferredElement;
  }

  private determineDepthLevel(
    input: string,
    relationship: RelationshipMemory,
    session: SessionContext
  ): 'surface' | 'moderate' | 'deep' {
    // Start with user preference
    let depth = relationship.personalPatterns.depthPreference;

    // Adjust based on session progression
    if (session.exchangeCount < 2) {
      depth = 'surface'; // Start gentle
    } else if (session.exchangeCount > 5) {
      depth = 'deep'; // Can go deeper in established conversation
    }

    return depth;
  }

  private assessCrisisLevel(input: string, relationship: RelationshipMemory): number {
    // Simplified - would use full crisis detection
    if (relationship.personalPatterns.crisisHistory) {
      return 0.2; // Higher baseline awareness
    }
    return 0;
  }

  private pureWitness(input: string, context: UnifiedContext): string {
    // Simplified pure witnessing
    const witnesses = {
      fire: "I witness the flame of what you're sharing.",
      water: "I feel the current of your words.",
      earth: "I ground myself in your experience.",
      air: "I see the pattern you're weaving.",
      aether: "I hold space for what's emerging."
    };
    return witnesses[context.element] || witnesses.aether;
  }

  private determineTone(priority: ActiveSystem): string {
    const tones = {
      witness: 'witnessing',
      looping: 'clarifying',
      contemplative: 'holding',
      crisis: 'supporting',
      story: 'celebrating'
    };
    return tones[priority] || 'witnessing';
  }

  private shouldReference(moment: any): boolean {
    // Only reference if recent and relevant
    const hoursSince = (Date.now() - moment.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSince < 72; // Within 3 days
  }

  private updatePersonalPatterns(
    relationship: RelationshipMemory,
    orchestration: OrchestrationResult
  ): void {
    // Learn from interactions
    // Simplified for demonstration
  }
}

// Type definitions
interface UnifiedContext {
  input: string;
  relationship: RelationshipMemory;
  session: SessionContext;
  element: ElementalArchetype;
  style: 'direct' | 'indirect' | 'metaphorical' | 'analytical';
  depth: 'surface' | 'moderate' | 'deep';
  crisisLevel: number;
}

interface SessionContext {
  id: string;
  startTime: Date;
  exchangeCount: number;
  currentElement: ElementalArchetype;
  depth: string;
  systemStates: Map<string, any>;
}

interface OrchestrationResult {
  priority: ActiveSystem;
  systemsEngaged: string[];
  responses: Map<string, string>;
  transitions: string[];
  element: ElementalArchetype;
}

interface UnifiedResponse {
  content: string;
  tone: string;
  element: ElementalArchetype;
  systemsInvisible: boolean;
}

// Export singleton orchestrator
export const unifiedPresence = new UnifiedPresenceOrchestrator();