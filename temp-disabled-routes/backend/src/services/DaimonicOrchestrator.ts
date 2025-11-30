/**
 * DaimonicOrchestrator - Contextual Decision-Making for Daimonic Encounters
 * 
 * This orchestrator makes intelligent decisions about when to persist daimonic
 * encounters vs. let them pass ephemerally, when to surface old patterns,
 * and how to work with trickster energy in service of evolution.
 * 
 * Key insight: Not every daimonic moment needs to become data. Some are meant
 * to pass through consciousness like wind through trees - influential but
 * not captured. The decision of what to hold vs. release is itself sacred.
 */

import { DaimonicDialogueService, DaimonicOtherness } from './DaimonicDialogue';
import { TricksterRecognition, TricksterDetection } from './TricksterRecognition';
import { logger } from '../utils/logger';

export interface DaimonicEvent extends DaimonicOtherness {
  timestamp: string;
  context: {
    userId: string;
    phase: string;      // Spiralogic phase, e.g. "Water 2"
    element: string;    // Elemental emphasis, e.g. "Fire" 
    state: string;      // e.g. "restless", "calm", "threshold"
    session_count: number;
    recent_trickster: boolean;
  };
  trickster_detection?: TricksterDetection;
}

export interface ProcessingStrategy {
  mode: 'ephemeral' | 'store' | 'resurface_old' | 'trickster_check' | 'threshold_support';
  persist: boolean;           // Store this event?
  resurface: boolean;         // Bring up past patterns?
  amplify: boolean;           // Increase daimonic intensity?
  ground: boolean;            // Provide grounding/safety?
  reasoning: string[];        // Why this strategy was chosen
}

export interface DaimonicResponse {
  immediate_guidance: string;
  daimonic_event?: DaimonicEvent;    // Only if persisted
  resurfaced_patterns?: string[];    // Past patterns if relevant
  trickster_warning?: string;        // If trickster risk high
  grounding_practice?: string;       // If grounding needed
  strategy: ProcessingStrategy;
  collective_ripple?: CollectiveRipple;  // For dashboard integration
}

export interface CollectiveRipple {
  archetype_activated: string;       // Which archetype this activates collectively
  pattern_signature: string;         // Pattern that may repeat in others
  wisdom_essence: string;           // Core wisdom for collective field
  urgency: 'low' | 'medium' | 'high'; // How important to surface collectively
}

export class DaimonicOrchestrator {
  private daimonic = new DaimonicDialogueService();
  private trickster = new TricksterRecognition();
  private event_store: Map<string, DaimonicEvent[]> = new Map(); // Temporary in-memory storage
  private user_states: Map<string, any> = new Map(); // Track user evolutionary state

  /**
   * Primary orchestration method - makes the decision in the moment
   */
  async processExperience(
    userId: string, 
    experience: any, 
    context: { 
      phase: string; 
      element: string; 
      state: string; 
      session_count: number;
    }
  ): Promise<DaimonicResponse> {
    // 1. Recognize daimonic otherness in the experience
    const daimon = await this.daimonic.recognizeDaimonicOther(experience, context);
    
    // 2. Check for trickster energy
    const trickster = this.trickster.detect(experience, {
      ...context,
      stuck_indicators: await this.assessStuckIndicators(userId),
      transition_active: this.isInTransition(context.phase, context.state)
    });

    // 3. Create the daimonic event structure
    const event: DaimonicEvent = {
      ...daimon,
      timestamp: new Date().toISOString(),
      context: { 
        userId, 
        ...context,
        recent_trickster: this.hasRecentTricksterActivity(userId)
      },
      trickster_detection: trickster
    };

    // 4. Decide processing strategy based on context
    const strategy = await this.decideStrategy(event, trickster, context);

    // 5. Execute strategy
    const response = await this.executeStrategy(event, strategy, userId);

    // 6. Update user state tracking
    this.updateUserState(userId, event, strategy);

    logger.info('Daimonic experience processed', {
      userId: userId.substring(0, 8) + '...',
      strategy: strategy.mode,
      daimonic_signature: daimon.otherness_signature,
      trickster_risk: trickster.risk.level,
      persisted: strategy.persist
    });

    return response;
  }

  /**
   * Core strategy decision logic
   */
  private async decideStrategy(
    event: DaimonicEvent,
    trickster: TricksterDetection,
    context: any
  ): Promise<ProcessingStrategy> {
    const reasoning: string[] = [];
    
    // High trickster risk = careful monitoring
    if (trickster.risk.level > 0.7) {
      reasoning.push('High trickster energy detected - monitoring for creative chaos');
      return {
        mode: 'trickster_check',
        persist: true,
        resurface: false,
        amplify: false,
        ground: trickster.risk.chaos_potential > trickster.risk.creative_potential,
        reasoning
      };
    }

    // High daimonic tension + transformation phase = resurface old patterns
    if (event.synapse.tension > 0.8 && 
        (context.phase.includes('Transformation') || context.phase.includes('Threshold'))) {
      reasoning.push('High synaptic tension in transformation phase');
      reasoning.push('Resurfacing past daimonic encounters for pattern recognition');
      return {
        mode: 'resurface_old',
        persist: true,
        resurface: true,
        amplify: false,
        ground: false,
        reasoning
      };
    }

    // Threshold states need extra support
    if (context.state === 'threshold' || context.state === 'liminal') {
      reasoning.push('User in threshold state - providing extra support');
      return {
        mode: 'threshold_support',
        persist: true,
        resurface: false,
        amplify: false,
        ground: true,
        reasoning
      };
    }

    // Calm states with low daimonic activity = ephemeral passage
    if (context.state === 'calm' && 
        event.alterity.irreducibility < 0.4 && 
        event.synapse.tension < 0.3) {
      reasoning.push('Calm state with low daimonic activity');
      reasoning.push('Allowing ephemeral passage without capture');
      return {
        mode: 'ephemeral',
        persist: false,
        resurface: false,
        amplify: false,
        ground: false,
        reasoning
      };
    }

    // High dialogue quality or strong otherness = store for future reference
    if (event.dialogue_quality === 'genuine' || 
        event.alterity.irreducibility > 0.7) {
      reasoning.push('Genuine dialogue or strong otherness detected');
      reasoning.push('Worth preserving for future pattern recognition');
      return {
        mode: 'store',
        persist: true,
        resurface: false,
        amplify: event.alterity.irreducibility > 0.8,
        ground: false,
        reasoning
      };
    }

    // Default to ephemeral unless there's a compelling reason to store
    reasoning.push('No compelling reason for persistence - allowing natural passage');
    return {
      mode: 'ephemeral',
      persist: false,
      resurface: false,
      amplify: false,
      ground: false,
      reasoning
    };
  }

  /**
   * Execute the chosen strategy
   */
  private async executeStrategy(
    event: DaimonicEvent,
    strategy: ProcessingStrategy,
    userId: string
  ): Promise<DaimonicResponse> {
    const response: DaimonicResponse = {
      immediate_guidance: await this.generateImmediateGuidance(event, strategy),
      strategy
    };

    // Handle persistence
    if (strategy.persist) {
      response.daimonic_event = event;
      await this.storeEvent(event);
      
      // Generate collective ripple for dashboard
      response.collective_ripple = this.generateCollectiveRipple(event);
    }

    // Handle resurfacing
    if (strategy.resurface) {
      response.resurfaced_patterns = await this.resurfacePast(userId, event.context.phase);
    }

    // Handle trickster warnings
    if (event.trickster_detection && event.trickster_detection.risk.level > 0.6) {
      response.trickster_warning = event.trickster_detection.risk.recommended_response;
    }

    // Handle grounding
    if (strategy.ground) {
      response.grounding_practice = await this.selectGroundingPractice(event, strategy);
    }

    return response;
  }

  /**
   * Generate immediate guidance based on event and strategy
   */
  private async generateImmediateGuidance(
    event: DaimonicEvent,
    strategy: ProcessingStrategy
  ): Promise<string> {
    const { daimon, trickster } = event;
    
    switch (strategy.mode) {
      case 'ephemeral':
        return `${daimon.otherness_signature} passes through like wind through trees. ` +
               `Let it move through you without grasping. Some wisdom is meant to be felt, not captured.`;

      case 'trickster_check':
        return `${trickster?.signature || 'Trickster energy'} is active. ` +
               `${trickster?.risk.recommended_response || 'Stay flexible and maintain humor.'} ` +
               `Watch for gifts in the chaos.`;

      case 'resurface_old':
        return `${daimon.otherness_signature} echoes patterns from your deeper journey. ` +
               `The spiral reveals familiar territory at a deeper level. ` +
               `What does this repetition want to teach you?`;

      case 'threshold_support':
        return `You're in sacred threshold space. ${daimon.otherness_signature} ` +
               `is your companion in this liminal territory. Breathe deeply, ` +
               `stay grounded, and trust the process of transformation.`;

      case 'store':
        return `${daimon.otherness_signature} speaks clearly. ` +
               `This dialogue: ${daimon.synapse.dialogue[0] || 'Silent communion'} ` +
               `carries wisdom worth remembering. The synaptic gap holds creative tension.`;

      default:
        return `The daimonic Other makes itself known: ${daimon.otherness_signature}`;
    }
  }

  /**
   * Store event with intelligent categorization
   */
  private async storeEvent(event: DaimonicEvent): Promise<void> {
    const userEvents = this.event_store.get(event.context.userId) || [];
    userEvents.push(event);
    
    // Keep only last 100 events per user to prevent memory bloat
    this.event_store.set(event.context.userId, userEvents.slice(-100));
    
    logger.info('Daimonic event stored', {
      userId: event.context.userId.substring(0, 8) + '...',
      otherness_signature: event.otherness_signature,
      timestamp: event.timestamp,
      phase: event.context.phase
    });

    // In production, this would write to database
    // await this.persistToDatabase(event);
  }

  /**
   * Resurface past daimonic encounters for pattern recognition
   */
  private async resurfacePast(userId: string, currentPhase: string): Promise<string[]> {
    const userEvents = this.event_store.get(userId) || [];
    
    // Find events from similar phases or with resonant patterns
    const relevantEvents = userEvents.filter(event => {
      // Same spiral phase (e.g., all "Water" phases)
      const phaseElement = currentPhase.split(' ')[0];
      const eventPhaseElement = event.context.phase.split(' ')[0];
      
      return eventPhaseElement === phaseElement ||
             event.alterity.irreducibility > 0.7 || // High otherness always relevant
             event.trickster_detection?.risk.level > 0.6; // Trickster patterns repeat
    });

    // Convert to guidance strings
    return relevantEvents
      .slice(-3) // Last 3 relevant events
      .map(event => 
        `${event.context.phase}: ${event.otherness_signature} - ` +
        `"${event.synapse.dialogue[0] || event.synapse.emergence}"`
      );
  }

  /**
   * Generate collective ripple for dashboard integration
   */
  private generateCollectiveRipple(event: DaimonicEvent): CollectiveRipple {
    // Determine which archetypal pattern this activates
    let archetype_activated = 'The Seeker'; // Default
    
    if (event.alterity.resistance > 0.7) {
      archetype_activated = 'The Warrior';
    } else if (event.synapse.resonance > 0.7) {
      archetype_activated = 'The Lover'; 
    } else if (event.trickster_detection?.risk.level > 0.6) {
      archetype_activated = 'The Fool';
    } else if (event.dialogue_quality === 'genuine') {
      archetype_activated = 'The Sage';
    }

    // Extract pattern signature that might repeat in others
    const pattern_signature = this.extractPatternSignature(event);
    
    // Distill wisdom essence
    const wisdom_essence = event.synapse.emergence || 
                          event.alterity.demand[0] || 
                          'Encounter with authentic otherness';

    // Determine urgency for collective surfacing
    let urgency: CollectiveRipple['urgency'] = 'low';
    if (event.trickster_detection?.risk.level > 0.8) urgency = 'high';
    else if (event.alterity.irreducibility > 0.8) urgency = 'medium';

    return {
      archetype_activated,
      pattern_signature,
      wisdom_essence,
      urgency
    };
  }

  /**
   * Extract pattern signature for collective recognition
   */
  private extractPatternSignature(event: DaimonicEvent): string {
    const { alterity, synapse, context } = event;
    
    if (alterity.resistance > 0.6 && synapse.tension > 0.6) {
      return `${context.element}_resistance_tension`;
    }
    
    if (event.trickster_detection && event.trickster_detection.patterns.length > 0) {
      return `trickster_${event.trickster_detection.patterns[0].type}`;
    }
    
    if (synapse.resonance > 0.7) {
      return `${context.element}_resonant_dialogue`;
    }
    
    return `${context.element}_${context.phase.toLowerCase()}_encounter`;
  }

  /**
   * Select appropriate grounding practice
   */
  private async selectGroundingPractice(
    event: DaimonicEvent,
    strategy: ProcessingStrategy
  ): Promise<string> {
    const { synapse, alterity, context } = event;
    
    // High synaptic tension = body grounding
    if (synapse.tension > 0.7) {
      return 'Feel your feet on the ground. Take five deep breaths. ' +
             'The creative tension is held in your body, not just your mind.';
    }
    
    // High trickster chaos = humor and flexibility
    if (event.trickster_detection?.risk.chaos_potential > 0.6) {
      return 'Laugh with the chaos rather than fighting it. ' +
             'Trickster energy responds to playfulness, not control.';
    }
    
    // Strong otherness overwhelming = boundary practice
    if (alterity.irreducibility > 0.8) {
      return 'You are you, and the Other is Other. Breathe into your own center. ' +
             'You can engage without merging, learn without becoming.';
    }
    
    // Threshold states = presence practice
    if (context.state === 'threshold') {
      return 'In the between-space, simply be present. ' +
             'You don\'t need to understand everything right now.';
    }
    
    // Default grounding
    return 'Return to your breath, your body, this moment. ' +
           'All wisdom integrates through presence.';
  }

  /**
   * Helper methods
   */
  private async assessStuckIndicators(userId: string): Promise<number> {
    const userEvents = this.event_store.get(userId) || [];
    const recent = userEvents.slice(-10); // Last 10 events
    
    if (recent.length < 3) return 0; // Not enough data
    
    // Check for repetitive patterns without evolution
    const repetitivePatterns = recent.filter(event => 
      event.alterity.irreducibility < 0.3 && 
      event.synapse.tension < 0.3
    ).length;
    
    return Math.min(1, repetitivePatterns / recent.length);
  }

  private isInTransition(phase: string, state: string): boolean {
    return phase.includes('Transformation') || 
           phase.includes('Threshold') ||
           state === 'threshold' ||
           state === 'liminal';
  }

  private hasRecentTricksterActivity(userId: string): boolean {
    const userEvents = this.event_store.get(userId) || [];
    const recent = userEvents.slice(-5);
    
    return recent.some(event => 
      event.trickster_detection && event.trickster_detection.risk.level > 0.5
    );
  }

  private updateUserState(userId: string, event: DaimonicEvent, strategy: ProcessingStrategy): void {
    const currentState = this.user_states.get(userId) || {
      total_encounters: 0,
      genuine_dialogues: 0,
      trickster_encounters: 0,
      evolutionary_pressure: 0.2,
      last_encounter: null
    };

    currentState.total_encounters += 1;
    currentState.last_encounter = event.timestamp;

    if (event.dialogue_quality === 'genuine') {
      currentState.genuine_dialogues += 1;
    }

    if (event.trickster_detection && event.trickster_detection.risk.level > 0.5) {
      currentState.trickster_encounters += 1;
    }

    // Adjust evolutionary pressure based on encounter intensity
    if (event.alterity.irreducibility > 0.7) {
      currentState.evolutionary_pressure = Math.min(1, currentState.evolutionary_pressure + 0.1);
    }

    this.user_states.set(userId, currentState);
  }

  /**
   * Public methods for integration
   */

  /**
   * Get user's daimonic encounter summary
   */
  getUserDaimonicSummary(userId: string): {
    total_encounters: number;
    genuine_dialogues: number;
    recent_patterns: string[];
    evolutionary_trajectory: string;
    trickster_activity: number;
  } {
    const userEvents = this.event_store.get(userId) || [];
    const userState = this.user_states.get(userId) || { 
      total_encounters: 0, 
      genuine_dialogues: 0, 
      trickster_encounters: 0,
      evolutionary_pressure: 0.2
    };

    const recentPatterns = userEvents
      .slice(-5)
      .map(e => e.otherness_signature);

    let evolutionary_trajectory = 'Stable development';
    if (userState.evolutionary_pressure > 0.7) {
      evolutionary_trajectory = 'Rapid transformation underway';
    } else if (userState.evolutionary_pressure > 0.5) {
      evolutionary_trajectory = 'Active growth and change';
    } else if (userState.evolutionary_pressure < 0.3) {
      evolutionary_trajectory = 'Integration and consolidation';
    }

    return {
      total_encounters: userState.total_encounters,
      genuine_dialogues: userState.genuine_dialogues,
      recent_patterns: recentPatterns,
      evolutionary_trajectory,
      trickster_activity: userState.trickster_encounters / Math.max(1, userState.total_encounters)
    };
  }

  /**
   * Get collective daimonic patterns for dashboard
   */
  getCollectivePatterns(): {
    active_archetypes: Record<string, number>;
    emergent_patterns: string[];
    trickster_climate: number;
    collective_tension: number;
  } {
    const allEvents = Array.from(this.event_store.values()).flat();
    const recentEvents = allEvents.filter(event => {
      const eventTime = new Date(event.timestamp);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return eventTime > hourAgo;
    });

    // Count active archetypes
    const active_archetypes: Record<string, number> = {};
    const emergent_patterns: string[] = [];
    let total_tension = 0;
    let trickster_count = 0;

    for (const event of recentEvents) {
      // Track archetypal activation patterns
      const archetype = this.getArchetypeFromEvent(event);
      active_archetypes[archetype] = (active_archetypes[archetype] || 0) + 1;

      // Collect emergent patterns
      if (event.synapse.emergence) {
        emergent_patterns.push(event.synapse.emergence);
      }

      // Accumulate tension
      total_tension += event.synapse.tension;

      // Count trickster activity
      if (event.trickster_detection && event.trickster_detection.risk.level > 0.5) {
        trickster_count += 1;
      }
    }

    return {
      active_archetypes,
      emergent_patterns: [...new Set(emergent_patterns)].slice(0, 5),
      trickster_climate: recentEvents.length > 0 ? trickster_count / recentEvents.length : 0,
      collective_tension: recentEvents.length > 0 ? total_tension / recentEvents.length : 0
    };
  }

  private getArchetypeFromEvent(event: DaimonicEvent): string {
    if (event.alterity.resistance > 0.7) return 'Warrior';
    if (event.synapse.resonance > 0.7) return 'Lover';
    if (event.trickster_detection?.risk.level > 0.6) return 'Fool';
    if (event.dialogue_quality === 'genuine') return 'Sage';
    return 'Seeker';
  }
}

// Export singleton instance
export const daimonicOrchestrator = new DaimonicOrchestrator();