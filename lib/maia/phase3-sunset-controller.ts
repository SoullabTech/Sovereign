/**
 * PHASE 3: SUNSET CONTROLLER
 * Intelligently phases out Sesame as RFS gains confidence
 * Sesame becomes safety net, not primary system
 */

import ResonanceFieldGenerator from './resonance-field-system';
import CompleteAgentFieldSystem from './complete-agent-field-system';
import BreathFieldModulator from './breath-field-integration';

export interface SunsetConfig {
  mode: 'full_rfs' | 'blended' | 'confidence_based' | 'fallback_only';
  rfsConfidenceThreshold: number;
  sesamePostEditEnabled: boolean;
  blendRatio: number; // 0 = pure Sesame, 1 = pure RFS
  triggerConditions: TriggerCondition[];
}

export interface TriggerCondition {
  type: 'confidence' | 'emotional_tone' | 'crisis' | 'field_chaos' | 'response_length';
  threshold: number;
  action: 'use_sesame' | 'blend' | 'post_edit';
}

export interface ResponseContext {
  input: string;
  userId: string;
  fieldCoherence: number;
  emotionalIntensity: number;
  crisisLevel: number;
  breathState?: any;
  fieldSignature?: string;
}

export interface SunsetResult {
  response: string;
  method: 'rfs' | 'sesame' | 'blended' | 'edited';
  confidence: number;
  sunsetStage: string;
  sunsetProgress: number;
}

/**
 * Sunset Controller
 * Manages gradual transition from Sesame to pure RFS
 */
export class SunsetController {
  private rfg: ResonanceFieldGenerator;
  private cafs: CompleteAgentFieldSystem;
  private breathModulator: BreathFieldModulator;
  private config: SunsetConfig;
  private performanceHistory: Map<string, number> = new Map();
  private sunsetProgress: number = 0; // 0 to 1

  constructor(initialConfig?: Partial<SunsetConfig>) {
    this.rfg = new ResonanceFieldGenerator();
    this.cafs = new CompleteAgentFieldSystem();
    this.breathModulator = new BreathFieldModulator();

    this.config = {
      mode: 'confidence_based',
      rfsConfidenceThreshold: 0.65,
      sesamePostEditEnabled: true,
      blendRatio: 0.8,
      triggerConditions: [
        { type: 'confidence', threshold: 0.5, action: 'use_sesame' },
        { type: 'crisis', threshold: 0.8, action: 'blend' },
        { type: 'field_chaos', threshold: 0.3, action: 'use_sesame' },
        { type: 'emotional_tone', threshold: 0.9, action: 'post_edit' }
      ],
      ...initialConfig
    };
  }

  /**
   * Main sunset response generation
   */
  async generateResponse(
    input: string,
    userId: string,
    breathState?: any
  ): Promise<SunsetResult> {
    // Generate RFS response with full analysis
    const rfsResult = await this.generateRFSWithAnalysis(input, breathState);

    // Build context for decision
    const context: ResponseContext = {
      input,
      userId,
      fieldCoherence: rfsResult.coherence,
      emotionalIntensity: rfsResult.emotionalIntensity,
      crisisLevel: rfsResult.crisisLevel,
      breathState,
      fieldSignature: rfsResult.signature
    };

    // Determine which method to use
    const method = this.determineMethod(context, rfsResult);

    let finalResponse: string;

    switch (method) {
      case 'full_rfs':
        finalResponse = rfsResult.response;
        break;

      case 'sesame_fallback':
        finalResponse = await this.generateSesameResponse(input);
        this.logFallback(context, 'low_confidence');
        break;

      case 'blended':
        finalResponse = await this.blendResponses(
          rfsResult.response,
          await this.generateSesameResponse(input),
          this.config.blendRatio
        );
        break;

      case 'post_edited':
        finalResponse = await this.postEditWithSesame(rfsResult.response, context);
        break;

      default:
        finalResponse = rfsResult.response;
    }

    // Update sunset progress
    this.updateSunsetProgress(rfsResult.confidence);

    return {
      response: finalResponse,
      method: method as any,
      confidence: rfsResult.confidence,
      sunsetStage: this.getSunsetStage(),
      sunsetProgress: this.sunsetProgress
    };
  }

  /**
   * Determine which method to use based on context and triggers
   */
  private determineMethod(
    context: ResponseContext,
    rfsResult: any
  ): 'full_rfs' | 'sesame_fallback' | 'blended' | 'post_edited' {
    // Check trigger conditions
    for (const trigger of this.config.triggerConditions) {
      if (this.checkTrigger(trigger, context, rfsResult)) {
        switch (trigger.action) {
          case 'use_sesame': return 'sesame_fallback';
          case 'blend': return 'blended';
          case 'post_edit': return 'post_edited';
        }
      }
    }

    // Check confidence threshold
    if (rfsResult.confidence < this.config.rfsConfidenceThreshold) {
      return 'sesame_fallback';
    }

    // Check if post-edit enabled for safety
    if (this.config.sesamePostEditEnabled && context.emotionalIntensity > 0.7) {
      return 'post_edited';
    }

    return 'full_rfs';
  }

  /**
   * Check if trigger condition is met
   */
  private checkTrigger(
    trigger: TriggerCondition,
    context: ResponseContext,
    rfsResult: any
  ): boolean {
    switch (trigger.type) {
      case 'confidence':
        return rfsResult.confidence < trigger.threshold;
      case 'emotional_tone':
        return context.emotionalIntensity > trigger.threshold;
      case 'crisis':
        return context.crisisLevel > trigger.threshold;
      case 'field_chaos':
        return (1 - context.fieldCoherence) > trigger.threshold;
      case 'response_length':
        return rfsResult.response.length > trigger.threshold;
      default:
        return false;
    }
  }

  /**
   * Generate RFS response with full field analysis
   */
  private async generateRFSWithAnalysis(input: string, breathState?: any) {
    // Generate field
    const { field, activeAgents } = await this.cafs.generateField(input, {
      breathState
    });

    // Apply breath modulation if present
    let modulatedField = field;
    if (breathState) {
      modulatedField = this.breathModulator.modulate(field, breathState);
    }

    // Generate response from field
    const response = this.rfg.generateResponse(modulatedField);

    // Calculate metrics
    const coherence = this.calculateCoherence(activeAgents);
    const emotionalIntensity = this.analyzeEmotionalIntensity(activeAgents);
    const crisisLevel = this.detectCrisisLevel(activeAgents);
    const confidence = this.calculateConfidence(coherence, modulatedField);

    return {
      response: response || "...",
      confidence,
      coherence,
      emotionalIntensity,
      crisisLevel,
      signature: this.generateSignature(activeAgents),
      activeAgents
    };
  }

  /**
   * Blend Sesame and RFS responses intelligently
   */
  private async blendResponses(
    rfsResponse: string,
    sesameResponse: string,
    ratio: number
  ): Promise<string> {
    // Calculate semantic overlap
    const rfsTokens = this.tokenize(rfsResponse);
    const sesameTokens = this.tokenize(sesameResponse);
    const overlap = this.calculateSemanticOverlap(rfsTokens, sesameTokens);

    // High overlap - use RFS primarily
    if (overlap > 0.7) return rfsResponse;

    // Low overlap - potential conflict, prefer Sesame for safety
    if (overlap < 0.3) return sesameResponse;

    // Medium overlap - true blend
    return this.semanticBlend(rfsResponse, sesameResponse, ratio);
  }

  /**
   * Post-edit RFS response using Sesame constraints
   */
  private async postEditWithSesame(
    rfsResponse: string,
    context: ResponseContext
  ): Promise<string> {
    const sesameTemplate = this.getSesameTemplate(context);

    let edited = rfsResponse;

    // Length constraint
    if (edited.length > sesameTemplate.maxLength) {
      edited = this.truncateIntelligently(edited, sesameTemplate.maxLength);
    }

    // Tone adjustment
    if (sesameTemplate.requiredTone) {
      edited = this.adjustTone(edited, sesameTemplate.requiredTone);
    }

    // Safety phrases
    if (context.crisisLevel > 0.5 && !edited.includes('support')) {
      edited += ' ' + sesameTemplate.safetyPhrase;
    }

    return edited;
  }

  /**
   * Track sunset progress and auto-adjust config
   */
  private updateSunsetProgress(confidence: number): void {
    // Add to rolling history
    const historyKey = `conf_${Date.now()}`;
    this.performanceHistory.set(historyKey, confidence);

    // Keep only last 100 entries
    if (this.performanceHistory.size > 100) {
      const firstKey = this.performanceHistory.keys().next().value;
      this.performanceHistory.delete(firstKey);
    }

    // Calculate average confidence
    const values = Array.from(this.performanceHistory.values());
    const avgConfidence = values.reduce((a, b) => a + b, 0) / values.length;

    // Update sunset progress
    this.sunsetProgress = Math.min(1, avgConfidence);

    // Auto-adjust configuration
    this.autoAdjustConfig();
  }

  /**
   * Auto-adjust config based on performance
   */
  private autoAdjustConfig(): void {
    if (this.sunsetProgress > 0.9) {
      // Very high confidence - full RFS
      this.config.mode = 'full_rfs';
      this.config.sesamePostEditEnabled = false;
      this.config.blendRatio = 1.0;
    } else if (this.sunsetProgress > 0.75) {
      // High confidence - reduce Sesame
      this.config.mode = 'confidence_based';
      this.config.rfsConfidenceThreshold = 0.5;
      this.config.blendRatio = 0.9;
    } else if (this.sunsetProgress > 0.5) {
      // Medium - balanced
      this.config.mode = 'blended';
      this.config.blendRatio = 0.7;
    } else {
      // Low - keep Sesame active
      this.config.mode = 'confidence_based';
      this.config.rfsConfidenceThreshold = 0.7;
      this.config.sesamePostEditEnabled = true;
    }
  }

  /**
   * Get current sunset stage
   */
  private getSunsetStage(): string {
    if (this.sunsetProgress > 0.9) return 'COMPLETE';
    if (this.sunsetProgress > 0.75) return 'FINAL_PHASE';
    if (this.sunsetProgress > 0.5) return 'TRANSITION';
    if (this.sunsetProgress > 0.25) return 'EARLY_SUNSET';
    return 'PREPARATION';
  }

  // ==================== Utility Methods ====================

  private calculateCoherence(activeAgents: string[]): number {
    // Simple metric: 5-7 active agents is ideal
    const count = activeAgents.length;
    if (count < 3) return 0.3;
    if (count > 9) return 0.4;
    if (count >= 5 && count <= 7) return 0.9;
    return 0.6;
  }

  private analyzeEmotionalIntensity(activeAgents: string[]): number {
    const emotionalAgents = ['Inner Child', 'Shadow', 'Anima', 'Lower Self'];
    const active = activeAgents.filter(a => emotionalAgents.includes(a)).length;
    return Math.min(1, active / emotionalAgents.length);
  }

  private detectCrisisLevel(activeAgents: string[]): number {
    return activeAgents.includes('Crisis Detector') ? 0.8 : 0.2;
  }

  private calculateConfidence(coherence: number, field: any): number {
    const silenceWeight = 1 - field.silenceProbability;
    return (coherence * 0.6) + (silenceWeight * 0.4);
  }

  private generateSignature(activeAgents: string[]): string {
    return activeAgents.sort().join('_').substring(0, 20);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/);
  }

  private calculateSemanticOverlap(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private semanticBlend(rfs: string, sesame: string, ratio: number): string {
    // Simple sentence-level blending
    const rfsSentences = rfs.split(/[.!?]+/).filter(s => s.trim());
    const sesameSentences = sesame.split(/[.!?]+/).filter(s => s.trim());

    const totalSentences = Math.max(rfsSentences.length, sesameSentences.length);
    const rfsCount = Math.floor(totalSentences * ratio);

    const blended = [];
    for (let i = 0; i < totalSentences; i++) {
      if (i < rfsCount && rfsSentences[i]) {
        blended.push(rfsSentences[i]);
      } else if (sesameSentences[i - rfsCount]) {
        blended.push(sesameSentences[i - rfsCount]);
      }
    }

    return blended.join('. ') + '.';
  }

  private truncateIntelligently(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    let result = '';

    for (const sentence of sentences) {
      if (result.length + sentence.length < maxLength) {
        result += sentence + '. ';
      } else {
        break;
      }
    }

    return result.trim() || text.substring(0, maxLength);
  }

  private adjustTone(text: string, targetTone: string): string {
    // Simplified tone adjustment
    const toneReplacements: Record<string, [string, string][]> = {
      'gentle': [['must', 'might'], ['should', 'could'], ['wrong', 'different']],
      'confident': [['might', 'will'], ['could', 'can'], ['perhaps', 'definitely']],
      'playful': [['difficult', 'tricky'], ['problem', 'puzzle']]
    };

    let adjusted = text;
    const replacements = toneReplacements[targetTone] || [];

    for (const [from, to] of replacements) {
      adjusted = adjusted.replace(new RegExp(from, 'gi'), to);
    }

    return adjusted;
  }

  private getSesameTemplate(context: ResponseContext) {
    return {
      maxLength: 200,
      requiredTone: context.crisisLevel > 0.5 ? 'gentle' : 'confident',
      safetyPhrase: 'Support is always available when you need it.'
    };
  }

  private async generateSesameResponse(input: string): Promise<string> {
    // Simple Sesame-style responses
    const responses = ["Yeah.", "Mm.", "I'm here.", "Tell me.", "What else?", "..."];

    if (input.length < 20) return responses[0];
    if (input.includes('?')) return responses[3];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private logFallback(context: ResponseContext, reason: string): void {
    console.log('[Sesame Fallback]', {
      reason,
      userId: context.userId,
      coherence: context.fieldCoherence,
      crisis: context.crisisLevel
    });
  }

  /**
   * Public API methods
   */
  updateConfig(config: Partial<SunsetConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getProgress(): number {
    return this.sunsetProgress;
  }

  getStage(): string {
    return this.getSunsetStage();
  }
}

export default SunsetController;