/**
 * INTEGRATED SAFETY SYSTEM
 * Bringing together all defensive layers:
 * - Immediate crisis detection
 * - Longitudinal drift detection
 * - Collective immune memory
 * - Field-based recalibration
 *
 * "Creating a space where awful intentions simply don't compute"
 */

import { DateTime } from 'luxon';
import { MAIASafetyPipeline } from '../safety-pipeline';
import { DriftDetectionEngine } from './DriftDetectionEngine';
import { LoopingDriftProtocol } from './LoopingDriftExtension';
import { CollectiveImmuneMemory } from './CollectiveImmuneMemory';
import { LoopingProtocol, LoopingState, LoopingCycle } from '../looping-protocol';
import { FieldState } from '../oracle/field/FieldAwareness';
import { RealTimeAlertService } from '../alerting/real-time-alerts';

// ============== Integration Types ==============

interface SafetyContext {
  userId: string;
  sessionId: string;
  message: string;
  conversationHistory: string[];
  fieldState: FieldState;
  loopingState: LoopingState;
}

interface IntegratedSafetyResponse {
  // Immediate safety
  immediate_action: 'continue' | 'gentle_checkin' | 'grounding' | 'lock_session' | 'escalate';
  crisis_detected: boolean;

  // Drift detection
  drift_patterns: any[];
  semantic_shift_detected: boolean;
  recalibration_needed: boolean;

  // Immune response
  pattern_resonance: number; // 0-1, similarity to known unhealthy patterns
  field_adjustments: any[];

  // Unified response
  message?: string;
  intervention_level: 'none' | 'gentle' | 'moderate' | 'urgent';
  restraint_adjustment: number; // How much to increase restraint
}

interface SafetyMetrics {
  crisis_detections: number;
  drift_detections: number;
  successful_interventions: number;
  false_positives: number;
  patterns_learned: number;
}

// ============== Integrated Safety System ==============

export class IntegratedSafetySystem {
  private safetyPipeline: MAIASafetyPipeline;
  private driftEngine: DriftDetectionEngine;
  private loopingDrift: LoopingDriftProtocol;
  private immuneMemory: CollectiveImmuneMemory;
  private metrics: SafetyMetrics;

  constructor(
    alertService?: RealTimeAlertService,
    therapistDb?: any
  ) {
    // Initialize all components
    this.safetyPipeline = new MAIASafetyPipeline(alertService, therapistDb);
    this.driftEngine = new DriftDetectionEngine();
    this.loopingDrift = new LoopingDriftProtocol();
    this.immuneMemory = new CollectiveImmuneMemory();

    this.metrics = {
      crisis_detections: 0,
      drift_detections: 0,
      successful_interventions: 0,
      false_positives: 0,
      patterns_learned: 0
    };
  }

  /**
   * Process a message through all safety layers
   */
  async processMessage(context: SafetyContext): Promise<IntegratedSafetyResponse> {
    const {
      userId,
      sessionId,
      message,
      conversationHistory,
      fieldState,
      loopingState
    } = context;

    // ========== Layer 1: Immediate Crisis Detection ==========
    const immediateResponse = await this.safetyPipeline.processMessage(
      userId,
      message,
      sessionId,
      {
        messageCount: conversationHistory.length,
        emotionalIntensity: fieldState.emotionalWeather.density,
        sessionLength: conversationHistory.length * 2 // Rough estimate
      }
    );

    if (immediateResponse.action === 'lock_session') {
      this.metrics.crisis_detections++;
      return this.createCrisisResponse(immediateResponse);
    }

    // ========== Layer 2: Drift Detection ==========
    const driftPatterns = await this.driftEngine.analyzeSnapshot(
      userId,
      sessionId,
      message,
      { field_state: fieldState, looping_state: loopingState }
    );

    if (driftPatterns.length > 0) {
      this.metrics.drift_detections++;
    }

    // ========== Layer 3: Looping Protocol Extension ==========
    const loopingCycle = this.createLoopingCycle(message, fieldState);
    const driftResponse = await this.loopingDrift.extendCycle(
      userId,
      loopingCycle,
      fieldState,
      loopingState
    );

    // ========== Layer 4: Collective Immune Memory ==========
    const semanticVector = await this.extractSemanticVector(message, conversationHistory);
    const immuneResponse = await this.immuneMemory.generateImmuneResponse(
      semanticVector,
      fieldState,
      driftPatterns
    );

    // ========== Integration: Synthesize All Layers ==========
    const response = this.synthesizeResponse(
      immediateResponse,
      driftPatterns,
      driftResponse,
      immuneResponse,
      fieldState
    );

    // ========== Learning: Feed Back Into System ==========
    if (response.intervention_level !== 'none') {
      await this.recordIntervention(userId, response);
    }

    return response;
  }

  /**
   * Synthesize response from all safety layers
   */
  private synthesizeResponse(
    immediate: any,
    driftPatterns: any[],
    driftResponse: any,
    immuneResponse: any,
    fieldState: FieldState
  ): IntegratedSafetyResponse {

    // Determine overall intervention level
    let interventionLevel: IntegratedSafetyResponse['intervention_level'] = 'none';
    let restraintAdjustment = 0;

    // Crisis takes precedence
    if (immediate.action === 'escalate' || immediate.action === 'lock_session') {
      interventionLevel = 'urgent';
      restraintAdjustment = 1.0; // Maximum restraint
    }
    // Drift acceleration
    else if (driftPatterns.some(p => p.trajectory === 'accelerating' && p.confidence > 0.7)) {
      interventionLevel = 'moderate';
      restraintAdjustment = 0.6;
    }
    // Pattern resonance
    else if (immuneResponse.pattern_match > 0.7) {
      interventionLevel = immuneResponse.suggested_intervention;
      restraintAdjustment = 0.4;
    }
    // Gentle recalibration
    else if (driftResponse.drift_detected) {
      interventionLevel = 'gentle';
      restraintAdjustment = 0.2;
    }

    // Generate response message
    let message: string | undefined;
    if (interventionLevel !== 'none') {
      message = this.generateInterventionMessage(
        interventionLevel,
        driftResponse.recalibration,
        immuneResponse.collective_wisdom,
        fieldState
      );
    }

    return {
      immediate_action: immediate.action,
      crisis_detected: immediate.action === 'lock_session' || immediate.action === 'escalate',
      drift_patterns: driftPatterns,
      semantic_shift_detected: driftResponse.drift_detected,
      recalibration_needed: driftResponse.intervention_needed,
      pattern_resonance: immuneResponse.pattern_match,
      field_adjustments: immuneResponse.field_adjustments,
      message,
      intervention_level: interventionLevel,
      restraint_adjustment: restraintAdjustment
    };
  }

  /**
   * Generate appropriate intervention message based on all factors
   */
  private generateInterventionMessage(
    level: 'gentle' | 'moderate' | 'urgent',
    recalibration: string | null,
    collectiveWisdom: string,
    fieldState: FieldState
  ): string {

    // Use recalibration if available (it's already field-aware)
    if (recalibration) {
      return recalibration;
    }

    // Otherwise generate based on level and field state
    const messages = {
      gentle: [
        "I'm noticing something shifting. Let's pause and feel into what's here.",
        "The energy is changing. What are you aware of right now?",
        "Something wants attention. Can we slow down and listen?"
      ],
      moderate: [
        "I sense we're at an important threshold. Let's be very careful here.",
        "The field is intensifying. What support do you need?",
        "This feels significant. How can I best hold space for you?"
      ],
      urgent: [
        "I'm deeply concerned about what I'm sensing. Your wellbeing matters most.",
        "Let's focus on safety right now. You don't have to carry this alone.",
        "I need to pause and make sure you're okay. What do you need most?"
      ]
    };

    // Select message based on emotional weather
    const options = messages[level];
    const index = Math.floor(fieldState.emotionalWeather.density * options.length);
    return options[Math.min(index, options.length - 1)];
  }

  /**
   * Create crisis response when immediate danger detected
   */
  private createCrisisResponse(immediateResponse: any): IntegratedSafetyResponse {
    return {
      immediate_action: 'lock_session',
      crisis_detected: true,
      drift_patterns: [],
      semantic_shift_detected: false,
      recalibration_needed: false,
      pattern_resonance: 1.0,
      field_adjustments: [
        {
          dimension: 'restraint',
          adjustment: 1.0,
          rationale: 'Crisis protocol activated'
        }
      ],
      message: immediateResponse.message,
      intervention_level: 'urgent',
      restraint_adjustment: 1.0
    };
  }

  /**
   * Extract semantic vector for pattern matching
   */
  private async extractSemanticVector(
    message: string,
    history: string[]
  ): Promise<number[]> {

    // Simplified semantic extraction
    // In production, this would use proper NLP embeddings

    const features = [];

    // Emotional valence
    const positiveWords = ['good', 'happy', 'hope', 'love', 'peaceful'];
    const negativeWords = ['bad', 'hate', 'angry', 'scared', 'hopeless'];
    const positiveCount = positiveWords.filter(w => message.includes(w)).length;
    const negativeCount = negativeWords.filter(w => message.includes(w)).length;
    features.push((positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount));

    // Agency
    const agencyWords = ['I will', 'I can', 'I choose'];
    const helplessWords = ['I can\'t', 'forced', 'have to'];
    const agencyCount = agencyWords.filter(w => message.includes(w)).length;
    const helplessCount = helplessWords.filter(w => message.includes(w)).length;
    features.push(agencyCount - helplessCount);

    // Relational
    const weWords = ['we', 'us', 'together', 'our'];
    const theyWords = ['they', 'them', 'everyone', 'nobody'];
    const weCount = weWords.filter(w => message.includes(w)).length;
    const theyCount = theyWords.filter(w => message.includes(w)).length;
    features.push(weCount - theyCount);

    // Temporal orientation
    const pastWords = ['was', 'were', 'used to', 'before'];
    const futureWords = ['will', 'going to', 'tomorrow', 'hope'];
    const pastCount = pastWords.filter(w => message.includes(w)).length;
    const futureCount = futureWords.filter(w => message.includes(w)).length;
    features.push(futureCount - pastCount);

    // Certainty
    const certainWords = ['always', 'never', 'definitely', 'absolutely'];
    const uncertainWords = ['maybe', 'perhaps', 'might', 'could'];
    const certainCount = certainWords.filter(w => message.includes(w)).length;
    const uncertainCount = uncertainWords.filter(w => message.includes(w)).length;
    features.push(certainCount - uncertainCount);

    // Normalize to -1 to 1 range
    return features.map(f => Math.tanh(f / 3));
  }

  /**
   * Create looping cycle from message
   */
  private createLoopingCycle(message: string, fieldState: FieldState): LoopingCycle {
    return {
      listened: {
        surface: message,
        essence: this.extractEssence(message),
        emotion: this.detectEmotions(message),
        redFlags: this.detectRedFlags(message),
        somatic: this.detectSomatic(message)
      },
      reflected: {
        content: '',
        frame: this.selectElementalFrame(fieldState),
        tone: this.selectTone(fieldState)
      },
      checked: {
        question: '',
        resonance: 0
      }
    };
  }

  private extractEssence(message: string): string {
    // Simplified: just get the core statement
    const sentences = message.split(/[.!?]+/);
    return sentences[0] || message.slice(0, 50);
  }

  private detectEmotions(message: string): string[] {
    const emotions = [];
    const emotionMap = {
      'sad': /\b(sad|depressed|down|blue|unhappy)\b/i,
      'angry': /\b(angry|mad|furious|pissed|rage)\b/i,
      'scared': /\b(scared|afraid|fearful|terrified|anxious)\b/i,
      'happy': /\b(happy|joy|glad|pleased|excited)\b/i,
      'lonely': /\b(lonely|alone|isolated|abandoned)\b/i
    };

    for (const [emotion, pattern] of Object.entries(emotionMap)) {
      if (pattern.test(message)) {
        emotions.push(emotion);
      }
    }

    return emotions;
  }

  private detectRedFlags(message: string): string[] {
    const flags = [];
    if (/\b(kill|die|death|suicide)\b/i.test(message)) flags.push('mortality_language');
    if (/\b(nobody|no one|alone)\b/i.test(message)) flags.push('isolation');
    if (/\b(hate|destroy|revenge)\b/i.test(message)) flags.push('hostility');
    if (/\b(always|never|everyone|nobody)\b/i.test(message)) flags.push('absolute_thinking');
    return flags;
  }

  private detectSomatic(message: string): string[] {
    const somatic = [];
    if (/\b(chest|heart|breathing)\b/i.test(message)) somatic.push('chest');
    if (/\b(stomach|gut|belly)\b/i.test(message)) somatic.push('gut');
    if (/\b(head|mind|thoughts)\b/i.test(message)) somatic.push('head');
    if (/\b(heavy|tight|tense)\b/i.test(message)) somatic.push('tension');
    return somatic;
  }

  private selectElementalFrame(fieldState: FieldState): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    // Select element based on field conditions
    if (fieldState.emotionalWeather.temperature > 0.7) return 'fire';
    if (fieldState.emotionalWeather.texture === 'flowing') return 'water';
    if (fieldState.somaticIntelligence.energetic_signature === 'grounded') return 'earth';
    if (fieldState.semanticLandscape.clarity_gradient > 0.7) return 'air';
    return 'aether';
  }

  private selectTone(fieldState: FieldState): string {
    if (fieldState.connectionDynamics.relational_distance < 0.3) return 'intimate';
    if (fieldState.emotionalWeather.density > 0.7) return 'gentle';
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) return 'reverent';
    return 'present';
  }

  /**
   * Record intervention for learning
   */
  private async recordIntervention(
    userId: string,
    response: IntegratedSafetyResponse
  ): Promise<void> {

    const interventionId = `int_${userId}_${Date.now()}`;

    // Store intervention details for later outcome tracking
    // This would go to a database
    console.log('Recording intervention:', {
      id: interventionId,
      user_id: userId,
      level: response.intervention_level,
      patterns: response.drift_patterns.map(p => p.type),
      resonance: response.pattern_resonance,
      timestamp: DateTime.now().toISO()
    });

    this.metrics.patterns_learned++;
  }

  /**
   * Get safety system statistics
   */
  getSystemStats(): {
    metrics: SafetyMetrics;
    immune_stats: any;
    effectiveness: number;
  } {

    const immuneStats = this.immuneMemory.getImmuneStats();

    const totalInterventions = this.metrics.successful_interventions + this.metrics.false_positives;
    const effectiveness = totalInterventions > 0
      ? this.metrics.successful_interventions / totalInterventions
      : 0;

    return {
      metrics: this.metrics,
      immune_stats: immuneStats,
      effectiveness
    };
  }

  /**
   * Test the integrated system
   */
  async testSystem(): Promise<any> {
    console.log('Testing Integrated Safety System...');

    // Test crisis detection
    const crisisTest = await this.safetyPipeline.testAlertSystem('test_user');

    // Test drift detection
    const driftTest = this.driftEngine.assessDriftRisk('test_user');

    // Test immune memory
    const immuneStats = this.immuneMemory.getImmuneStats();

    return {
      crisis_system: crisisTest,
      drift_system: driftTest,
      immune_system: immuneStats,
      overall_health: 'operational'
    };
  }
}