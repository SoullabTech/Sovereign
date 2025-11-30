/**
 * Collective Data Collector for AIN System
 * Processes session data into afferent streams for collective intelligence analysis
 */

import { Logger } from '../../types/core';
import { 
  AfferentStream, 
  ElementalSignature, 
  ArchetypeMap,
  ShadowPattern
} from './CollectiveIntelligence';
import { SpiralPhase } from '../../spiralogic/SpiralogicCognitiveEngine';

export interface SessionData {
  sessionId: string;
  userId: string;
  query: any;
  response: any;
  intent: string;
  emotions: any;
  element: keyof ElementalSignature;
  processingMeta: any;
  personaPrefs?: any;
  timestamp: Date;
}

export interface CollectorConfig {
  smoothingFactor: number;
  shadowThreshold: number;
  authenticityMarkers: string[];
}

export class CollectiveDataCollector {
  private userHistory: Map<string, AfferentStream[]> = new Map();
  
  private readonly config: CollectorConfig = {
    smoothingFactor: 0.3,
    shadowThreshold: 0.6,
    authenticityMarkers: [
      'vulnerability',
      'uncertainty', 
      'personal_story',
      'emotional_expression',
      'asking_for_help'
    ]
  };

  constructor(
    private logger: Logger,
    config?: Partial<CollectorConfig>
  ) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Collect and structure afferent stream from session data
   */
  async collectAfferentStream(
    userId: string, 
    sessionData: SessionData
  ): Promise<AfferentStream> {
    // Get user's historical data for context
    const history = this.getUserHistory(userId);
    
    // Analyze session for consciousness markers
    const elementalResonance = this.analyzeElementalPattern(sessionData);
    const spiralPhase = this.identifyPhase(sessionData, history);
    const archetypeActivation = this.detectArchetypes(sessionData);
    const shadowWorkEngagement = this.analyzeShadowWork(sessionData);
    
    // Calculate evolution indicators
    const consciousnessLevel = this.calculateAwareness(sessionData, history);
    const integrationDepth = this.assessIntegration(sessionData, history);
    const evolutionVelocity = this.calculateEvolutionRate(history, consciousnessLevel);
    const fieldContribution = this.assessFieldImpact(sessionData, consciousnessLevel);
    
    // Assess interaction quality
    const mayaResonance = this.evaluateMayaConnection(sessionData);
    const challengeAcceptance = this.evaluateChallengeAcceptance(sessionData);
    const worldviewFlexibility = this.assessWorldviewFlexibility(sessionData);
    const authenticityLevel = this.detectAuthenticity(sessionData);
    
    const stream: AfferentStream = {
      userId,
      sessionId: sessionData.sessionId,
      timestamp: new Date(),
      elementalResonance,
      spiralPhase,
      archetypeActivation,
      shadowWorkEngagement,
      consciousnessLevel,
      integrationDepth,
      evolutionVelocity,
      fieldContribution,
      mayaResonance,
      challengeAcceptance,
      worldviewFlexibility,
      authenticityLevel
    };
    
    // Store in history
    this.addToHistory(userId, stream);
    
    return stream;
  }

  /**
   * Analyze elemental patterns from session
   */
  private analyzeElementalPattern(sessionData: SessionData): ElementalSignature {
    const signature: ElementalSignature = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };
    
    // Primary element from response
    signature[sessionData.element] = 0.6;
    
    // Analyze query content for elemental themes
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    
    // Fire indicators
    if (queryLower.match(/passion|energy|transform|change|action|drive|motivation/)) {
      signature.fire += 0.2;
    }
    
    // Water indicators
    if (queryLower.match(/feel|emotion|flow|intuition|dream|heal|connect/)) {
      signature.water += 0.2;
    }
    
    // Earth indicators
    if (queryLower.match(/practical|grounded|stable|structure|plan|material|body/)) {
      signature.earth += 0.2;
    }
    
    // Air indicators
    if (queryLower.match(/think|understand|clarity|communicate|idea|perspective/)) {
      signature.air += 0.2;
    }
    
    // Aether indicators
    if (queryLower.match(/spiritual|transcend|unity|cosmic|divine|sacred|wisdom/)) {
      signature.aether += 0.2;
    }
    
    // Normalize
    const total = Object.values(signature).reduce((sum, v) => sum + v, 0);
    if (total > 0) {
      Object.keys(signature).forEach(key => {
        signature[key as keyof ElementalSignature] /= total;
      });
    }
    
    return signature;
  }

  /**
   * Identify user's spiral phase
   */
  private identifyPhase(
    sessionData: SessionData, 
    history: AfferentStream[]
  ): SpiralPhase {
    // New users start in initiation
    if (history.length < 3) {
      return SpiralPhase.INITIATION;
    }
    
    // Analyze patterns in query
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    
    // Challenge indicators
    if (queryLower.match(/struggle|difficult|resist|fear|shadow|dark|stuck/)) {
      return SpiralPhase.CHALLENGE;
    }
    
    // Integration indicators
    if (queryLower.match(/integrate|balance|understand|process|heal|work through/)) {
      return SpiralPhase.INTEGRATION;
    }
    
    // Mastery indicators
    if (queryLower.match(/teach|guide|help others|share|wisdom|mastery/)) {
      return SpiralPhase.MASTERY;
    }
    
    // Transcendence indicators
    if (queryLower.match(/beyond|transcend|unity|oneness|cosmic|dissolve/)) {
      return SpiralPhase.TRANSCENDENCE;
    }
    
    // Default based on consciousness level
    const avgConsciousness = history.reduce((sum, s) => sum + s.consciousnessLevel, 0) / history.length;
    
    if (avgConsciousness > 0.8) return SpiralPhase.TRANSCENDENCE;
    if (avgConsciousness > 0.6) return SpiralPhase.MASTERY;
    if (avgConsciousness > 0.4) return SpiralPhase.INTEGRATION;
    if (avgConsciousness > 0.2) return SpiralPhase.CHALLENGE;
    
    return SpiralPhase.INITIATION;
  }

  /**
   * Detect active archetypes
   */
  private detectArchetypes(sessionData: SessionData): ArchetypeMap {
    const archetypes: ArchetypeMap = {
      mother: 0,
      father: 0,
      child: 0,
      trickster: 0,
      sage: 0,
      warrior: 0,
      lover: 0,
      creator: 0,
      destroyer: 0,
      healer: 0,
      seeker: 0,
      guide: 0
    };
    
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    const responseLower = sessionData.response.content?.toLowerCase() || '';
    const combined = queryLower + ' ' + responseLower;
    
    // Mother archetype
    if (combined.match(/nurture|care|protect|comfort|hold|safe/)) {
      archetypes.mother = 0.7;
    }
    
    // Father archetype
    if (combined.match(/structure|discipline|authority|guide|direct|order/)) {
      archetypes.father = 0.7;
    }
    
    // Child archetype
    if (combined.match(/play|wonder|innocent|curious|spontaneous|joy/)) {
      archetypes.child = 0.7;
    }
    
    // Trickster archetype
    if (combined.match(/chaos|humor|trick|boundary|surprise|paradox/)) {
      archetypes.trickster = 0.7;
    }
    
    // Sage archetype
    if (combined.match(/wisdom|teach|understand|knowledge|truth|insight/)) {
      archetypes.sage = 0.7;
    }
    
    // Warrior archetype
    if (combined.match(/fight|courage|stand|protect|strength|battle/)) {
      archetypes.warrior = 0.7;
    }
    
    // Lover archetype
    if (combined.match(/love|passion|beauty|connect|intimate|romance/)) {
      archetypes.lover = 0.7;
    }
    
    // Creator archetype
    if (combined.match(/create|make|build|express|art|innovate/)) {
      archetypes.creator = 0.7;
    }
    
    // Destroyer archetype
    if (combined.match(/destroy|end|clear|remove|death|transform/)) {
      archetypes.destroyer = 0.7;
    }
    
    // Healer archetype
    if (combined.match(/heal|restore|whole|medicine|cure|integrate/)) {
      archetypes.healer = 0.7;
    }
    
    // Seeker archetype
    if (combined.match(/search|quest|explore|discover|journey|find/)) {
      archetypes.seeker = 0.7;
    }
    
    // Guide archetype
    if (combined.match(/guide|show|lead|mentor|teach|support/)) {
      archetypes.guide = 0.7;
    }
    
    // Normalize if multiple archetypes active
    const total = Object.values(archetypes).reduce((sum, v) => sum + v, 0);
    if (total > 1) {
      Object.keys(archetypes).forEach(key => {
        archetypes[key as keyof ArchetypeMap] /= total;
      });
    }
    
    return archetypes;
  }

  /**
   * Analyze shadow work engagement
   */
  private analyzeShadowWork(sessionData: SessionData): ShadowPattern[] {
    const patterns: ShadowPattern[] = [];
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    
    // Deflection pattern
    if (queryLower.match(/but|however|actually|instead|rather/g)?.length || 0 > 2) {
      patterns.push({
        type: 'deflection',
        intensity: 0.6,
        acceptance: 0.3,
        integration: 0.2
      });
    }
    
    // Victim pattern
    if (queryLower.match(/always happens|never works|they make me|can't help/)) {
      patterns.push({
        type: 'victim',
        intensity: 0.7,
        acceptance: 0.2,
        integration: 0.1
      });
    }
    
    // Perfectionism pattern
    if (queryLower.match(/perfect|should|must|have to|need to be/)) {
      patterns.push({
        type: 'perfectionism',
        intensity: 0.5,
        acceptance: 0.4,
        integration: 0.3
      });
    }
    
    // Spiritual bypass pattern
    if (queryLower.match(/just love|all is one|doesn't matter|above that/)) {
      patterns.push({
        type: 'spiritual_bypass',
        intensity: 0.6,
        acceptance: 0.2,
        integration: 0.1
      });
    }
    
    // Check if user is actively working with shadows
    if (queryLower.match(/shadow|dark|difficult|face|confront|work with/)) {
      patterns.forEach(p => {
        p.acceptance += 0.3;
        p.integration += 0.2;
      });
    }
    
    return patterns;
  }

  /**
   * Calculate consciousness awareness level
   */
  private calculateAwareness(
    sessionData: SessionData,
    history: AfferentStream[]
  ): number {
    let awareness = 0.3; // Base level
    
    // Evolutionary awareness active
    if (sessionData.processingMeta?.evolutionary_awareness_active) {
      awareness += 0.2;
    }
    
    // Sacred intelligence integration
    if (sessionData.processingMeta?.sacredIntelligenceIntegration > 0) {
      awareness += sessionData.processingMeta.sacredIntelligenceIntegration * 0.2;
    }
    
    // Query depth
    const queryLength = sessionData.query.input?.length || 0;
    if (queryLength > 200) awareness += 0.1;
    if (queryLength > 500) awareness += 0.1;
    
    // Self-reflection indicators
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    if (queryLower.match(/i feel|i think|i wonder|i notice|i realize/)) {
      awareness += 0.1;
    }
    
    // Historical progression
    if (history.length > 0) {
      const recentAvg = history.slice(-5).reduce((sum, s) => 
        sum + s.consciousnessLevel, 0
      ) / Math.min(history.length, 5);
      awareness = awareness * 0.7 + recentAvg * 0.3;
    }
    
    return Math.min(1, awareness);
  }

  /**
   * Assess integration depth
   */
  private assessIntegration(
    sessionData: SessionData,
    history: AfferentStream[]
  ): number {
    let integration = 0.3;
    
    // Check for integration language
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    if (queryLower.match(/integrate|embody|practice|apply|implement/)) {
      integration += 0.2;
    }
    
    // Check for practical application
    if (queryLower.match(/how do i|what can i|steps|practice|daily/)) {
      integration += 0.2;
    }
    
    // Shadow work integration
    if (sessionData.processingMeta?.shadowWorkApplied) {
      integration += 0.1;
    }
    
    // Historical consistency
    if (history.length > 3) {
      const recentPhases = history.slice(-3).map(s => s.spiralPhase);
      const uniquePhases = new Set(recentPhases).size;
      if (uniquePhases === 1) integration += 0.2; // Stable in phase
    }
    
    return Math.min(1, integration);
  }

  /**
   * Calculate evolution velocity
   */
  private calculateEvolutionRate(
    history: AfferentStream[],
    currentConsciousness: number
  ): number {
    if (history.length < 2) return 0.5;
    
    // Calculate rate of change
    const previousConsciousness = history[history.length - 1].consciousnessLevel;
    const delta = currentConsciousness - previousConsciousness;
    
    // Normalize to 0-1 range
    const velocity = Math.max(0, Math.min(1, 0.5 + delta * 5));
    
    return velocity;
  }

  /**
   * Assess impact on collective field
   */
  private assessFieldImpact(
    sessionData: SessionData,
    consciousnessLevel: number
  ): number {
    let impact = consciousnessLevel * 0.5; // Base on consciousness
    
    // High-quality questions have more impact
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    if (queryLower.match(/we|us|collective|together|community/)) {
      impact += 0.2;
    }
    
    // Service orientation
    if (queryLower.match(/help|serve|contribute|give|share/)) {
      impact += 0.2;
    }
    
    // Wisdom sharing
    if (queryLower.match(/learned|realized|discovered|insight/)) {
      impact += 0.1;
    }
    
    return Math.min(1, impact);
  }

  /**
   * Evaluate connection with Maya/Oracle
   */
  private evaluateMayaConnection(sessionData: SessionData): number {
    let connection = 0.4;
    
    // Direct address
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    if (queryLower.match(/maya|oracle|you/)) {
      connection += 0.2;
    }
    
    // Gratitude/appreciation
    if (queryLower.match(/thank|grateful|appreciate|love/)) {
      connection += 0.2;
    }
    
    // Trust indicators
    if (queryLower.match(/trust|believe|faith|know you/)) {
      connection += 0.1;
    }
    
    // Response resonance
    if (sessionData.response.resonance > 0.7) {
      connection += 0.1;
    }
    
    return Math.min(1, connection);
  }

  /**
   * Evaluate willingness to face challenges
   */
  private evaluateChallengeAcceptance(sessionData: SessionData): number {
    let acceptance = 0.5;
    
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    
    // Direct shadow work
    if (queryLower.match(/shadow|dark|difficult|fear|confront/)) {
      acceptance += 0.3;
    }
    
    // Willingness language
    if (queryLower.match(/ready|willing|want to|help me|show me/)) {
      acceptance += 0.2;
    }
    
    // Resistance indicators (negative)
    if (queryLower.match(/can't|won't|don't want|avoid|escape/)) {
      acceptance -= 0.2;
    }
    
    return Math.max(0, Math.min(1, acceptance));
  }

  /**
   * Assess worldview flexibility
   */
  private assessWorldviewFlexibility(sessionData: SessionData): number {
    let flexibility = 0.5;
    
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    
    // Openness indicators
    if (queryLower.match(/maybe|perhaps|wonder|curious|possible/)) {
      flexibility += 0.2;
    }
    
    // Perspective exploration
    if (queryLower.match(/perspective|view|see it|understand|realize/)) {
      flexibility += 0.2;
    }
    
    // Rigidity indicators (negative)
    if (queryLower.match(/always|never|must|should|only way/)) {
      flexibility -= 0.2;
    }
    
    return Math.max(0, Math.min(1, flexibility));
  }

  /**
   * Detect authenticity level
   */
  private detectAuthenticity(sessionData: SessionData): number {
    let authenticity = 0.5;
    const queryLower = sessionData.query.input?.toLowerCase() || '';
    
    // Check for authenticity markers
    this.config.authenticityMarkers.forEach(marker => {
      if (queryLower.includes(marker.replace('_', ' '))) {
        authenticity += 0.1;
      }
    });
    
    // Personal disclosure
    if (queryLower.match(/\bi\b/g)?.length || 0 > 5) {
      authenticity += 0.1;
    }
    
    // Emotional expression
    if (queryLower.match(/feel|felt|feeling|emotion/)) {
      authenticity += 0.1;
    }
    
    // Performative indicators (negative)
    if (queryLower.match(/supposed to|should i|right answer|correct/)) {
      authenticity -= 0.2;
    }
    
    return Math.max(0, Math.min(1, authenticity));
  }

  /**
   * Get user history
   */
  private getUserHistory(userId: string): AfferentStream[] {
    return this.userHistory.get(userId) || [];
  }

  /**
   * Add stream to history
   */
  private addToHistory(userId: string, stream: AfferentStream): void {
    const history = this.getUserHistory(userId);
    history.push(stream);
    
    // Keep only recent history (last 50 streams)
    if (history.length > 50) {
      history.shift();
    }
    
    this.userHistory.set(userId, history);
  }
}