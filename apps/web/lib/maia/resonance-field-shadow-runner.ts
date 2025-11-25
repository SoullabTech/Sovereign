/**
 * PHASE 1: SHADOW MODE TOOLKIT
 * Run RFS in parallel without user exposure
 * Gather field metrics while Sesame handles live responses
 */

import CompleteAgentFieldSystem from './complete-agent-field-system';
import ResonanceFieldGenerator from './resonance-field-system';
import fs from 'fs/promises';
import path from 'path';

export interface ShadowContext {
  sessionId: string;
  userId: string;
  timestamp: string;
  inputText: string;
  emotionalContext?: any;
  breathState?: {
    breathRate: number;
    coherence: number;
    phase: 'inhale' | 'hold' | 'exhale' | 'pause';
  };
}

export interface FieldMetrics {
  coherenceScore: number;
  agentContributions: Record<string, number>;
  emergenceTime: number;
  fieldHarmonics: number[];
  divergenceFromSesame?: number;
  fieldSignature: string;
}

/**
 * Shadow Runner - RFS runs silently alongside production
 */
export class ResonanceFieldShadowRunner {
  private cafs: CompleteAgentFieldSystem;
  private rfg: ResonanceFieldGenerator;
  private logPath: string;
  private metricsPath: string;

  constructor() {
    this.cafs = new CompleteAgentFieldSystem();
    this.rfg = new ResonanceFieldGenerator();
    this.logPath = path.join(process.cwd(), 'logs/shadow/rfs_outputs');
    this.metricsPath = path.join(process.cwd(), 'logs/shadow/rfs_metrics');
  }

  /**
   * Run RFS in shadow mode - non-blocking, purely observational
   */
  async runInShadow(context: ShadowContext): Promise<void> {
    const startTime = Date.now();

    try {
      // Generate field response without exposing to user
      const fieldResponse = await this.generateFieldResponse(context);

      // Calculate field metrics
      const metrics = this.calculateFieldMetrics(fieldResponse, startTime);

      // Log both output and metrics
      await this.logShadowOutput(context, fieldResponse, metrics);

    } catch (error: any) {
      await this.logError(context, error);
    }
  }

  /**
   * Generate complete field response using all agents
   */
  private async generateFieldResponse(context: ShadowContext) {
    // Run all 11 agents simultaneously through field system
    const { field, activeAgents, dominantFrequencies } =
      await this.cafs.generateField(context.inputText, {
        emotionalIntensity: context.emotionalContext?.intensity || 0.5,
        questionAsked: context.inputText.includes('?'),
        rawEmotion: context.emotionalContext?.raw || false,
        breathState: context.breathState
      });

    // Apply breath modulation if present
    if (context.breathState) {
      this.modulateFieldByBreath(field, context.breathState);
    }

    // Generate response from field using resonance generator
    const response = this.rfg.generateResponse(field);

    return {
      response,
      field,
      activeAgents,
      dominantFrequencies
    };
  }

  /**
   * Modulate field based on breath state
   * Breath as MODULATOR not CONTRIBUTOR
   */
  private modulateFieldByBreath(field: any, breathState: ShadowContext['breathState']) {
    if (!breathState) return;

    const { phase, coherence } = breathState;

    // Adjust consciousness weights based on breath phase
    switch (phase) {
      case 'inhale':
        // Rising energy - increase conscious mind, higher self
        field.consciousness.higherSelf *= (1 + coherence * 0.15);
        field.consciousness.conscious *= (1 + coherence * 0.1);
        break;

      case 'hold':
        // Suspended - increase unconscious, balance all
        field.consciousness.unconscious *= (1 + coherence * 0.12);
        break;

      case 'exhale':
        // Releasing - increase shadow, lower self
        field.consciousness.lowerSelf *= (1 + coherence * 0.1);
        // Allow shadow material when coherent
        if (coherence > 0.7) {
          field.silenceProbability *= 0.9; // Less silence, more expression
        }
        break;

      case 'pause':
        // Between breaths - maximum silence probability
        field.silenceProbability *= (1 + coherence * 0.2);
        break;
    }

    // High coherence = more playful, less defended
    if (coherence > 0.8) {
      // Inner child can emerge safely
      // Shadow material less threatening
      field.wordDensity *= (1 + (coherence - 0.8) * 0.3);
    }
  }

  /**
   * Calculate comprehensive field metrics
   */
  private calculateFieldMetrics(fieldResponse: any, startTime: number): FieldMetrics {
    const emergenceTime = Date.now() - startTime;

    // Calculate coherence between agents (how aligned are they?)
    const coherenceScore = this.calculateCoherence(fieldResponse.activeAgents);

    // Extract harmonic frequencies from field
    const fieldHarmonics = this.extractHarmonics(fieldResponse.field);

    // Map individual agent contribution strengths
    const agentContributions = this.mapAgentStrengths(fieldResponse.activeAgents);

    // Generate unique field signature
    const fieldSignature = this.generateFieldSignature(fieldResponse.field);

    return {
      coherenceScore,
      agentContributions,
      emergenceTime,
      fieldHarmonics,
      fieldSignature
    };
  }

  /**
   * Calculate field coherence
   * Higher = agents more aligned, lower = chaotic/scattered
   */
  private calculateCoherence(activeAgents: string[]): number {
    // Simple metric: what % of agents are active
    // More sophisticated: check if their frequencies align
    const totalAgents = 11;
    const activeCount = activeAgents.length;

    // Coherence is balance between too few (weak) and too many (chaotic)
    // Sweet spot: 5-7 agents active
    if (activeCount < 3) return 0.3; // Too sparse
    if (activeCount > 9) return 0.4; // Too chaotic
    if (activeCount >= 5 && activeCount <= 7) return 0.9; // Ideal
    return 0.6; // Decent
  }

  /**
   * Extract dominant harmonic frequencies from field
   * These map to emotional/archetypal resonances
   */
  private extractHarmonics(field: any): number[] {
    const harmonics: number[] = [];

    // Map elemental frequencies to Hz ranges
    // (These are metaphorical but could map to actual audio/biometric frequencies)
    if (field.elements.earth > 0.4) harmonics.push(256); // Root frequency
    if (field.elements.water > 0.4) harmonics.push(417); // Emotional flow
    if (field.elements.air > 0.4) harmonics.push(528);   // Mental clarity
    if (field.elements.fire > 0.4) harmonics.push(639);  // Transformation

    // Consciousness layer harmonics
    if (field.consciousness.higherSelf > 0.5) harmonics.push(852); // Spiritual
    if (field.consciousness.unconscious > 0.5) harmonics.push(174); // Deep/hidden

    return harmonics;
  }

  /**
   * Map how strongly each agent influenced the field
   */
  private mapAgentStrengths(activeAgents: string[]): Record<string, number> {
    // Convert active agent list to strength map
    const strengths: Record<string, number> = {
      'Claude': 0,
      'Elemental Oracle': 0,
      'Higher Self': 0,
      'Lower Self': 0,
      'Conscious Mind': 0,
      'Unconscious': 0,
      'Shadow': 0,
      'Inner Child': 0,
      'Anima': 0,
      'Crisis Detector': 0,
      'Attachment': 0
    };

    activeAgents.forEach(agent => {
      strengths[agent] = 1.0;
    });

    return strengths;
  }

  /**
   * Generate unique field signature for pattern recognition
   */
  private generateFieldSignature(field: any): string {
    // Create compact hash of field configuration
    const signature = {
      e: Object.values(field.elements).map((v: any) => Math.round(v * 100)),
      c: Object.values(field.consciousness).map((v: any) => Math.round(v * 100)),
      s: Math.round(field.silenceProbability * 100),
      w: Math.round(field.wordDensity * 100)
    };

    return Buffer.from(JSON.stringify(signature))
      .toString('base64')
      .substring(0, 12);
  }

  /**
   * Log shadow output to file system
   */
  private async logShadowOutput(
    context: ShadowContext,
    fieldResponse: any,
    metrics: FieldMetrics
  ): Promise<void> {
    const logEntry = {
      ...context,
      rfsOutput: fieldResponse.response,
      activeAgents: fieldResponse.activeAgents,
      dominantFrequencies: fieldResponse.dominantFrequencies,
      metrics,
      field: {
        elements: fieldResponse.field.elements,
        consciousness: fieldResponse.field.consciousness,
        silenceProbability: fieldResponse.field.silenceProbability,
        wordDensity: fieldResponse.field.wordDensity
      }
    };

    const filename = `${context.sessionId}_${Date.now()}.json`;

    try {
      await fs.writeFile(
        path.join(this.logPath, filename),
        JSON.stringify(logEntry, null, 2)
      );
    } catch (error) {
      // Silently fail - this is shadow mode, don't break production
      console.error('[Shadow Log Error]', error);
    }
  }

  /**
   * Log errors without breaking production
   */
  private async logError(context: ShadowContext, error: any): Promise<void> {
    const errorLog = {
      ...context,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    try {
      await fs.appendFile(
        path.join(this.logPath, 'errors.log'),
        JSON.stringify(errorLog) + '\n'
      );
    } catch (logError) {
      // If we can't even log the error, just console it
      console.error('[Shadow Error Logging Failed]', logError);
    }
  }

  /**
   * Get RFS response directly for comparison (blocking)
   */
  async getResponseForComparison(context: ShadowContext): Promise<string | null> {
    try {
      const fieldResponse = await this.generateFieldResponse(context);
      return fieldResponse.response;
    } catch (error) {
      return '[RFS_ERROR]';
    }
  }
}

export default ResonanceFieldShadowRunner;