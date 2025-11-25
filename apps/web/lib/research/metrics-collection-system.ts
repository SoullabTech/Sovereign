/**
 * Research-Grade Metrics Collection System for Field Intelligence Study
 *
 * Captures every field state → emergence decision for empirical validation
 * of consciousness-first AI architecture
 */

import { createClient } from '@supabase/supabase-js';

export interface FieldStateVector {
  // 6-Dimensional Field Reading
  emotionalWeather: {
    density: number;      // 0-1 scale
    texture: 'smooth' | 'jagged' | 'flowing' | 'turbulent';
    velocity: number;     // Rate of emotional change
    temperature: number;  // Hot/cold emotional climate
  };

  semanticLandscape: {
    clarity: number;      // 0-1 fog to crystal
    ambiguity: number;    // Uncertainty level
    emergence: 'forming' | 'formed' | 'dissolving';
    coherence: number;
  };

  connectionDynamics: {
    distance: number;     // Relational distance 0-1
    trustVelocity: number; // Rate of opening
    resonance: number;    // Harmonic alignment
    attachmentStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  };

  sacredMarkers: {
    thresholdProximity: number;  // Distance to transformation
    liminality: number;          // In-between-ness
    ripeness: number;            // Readiness for shift
  };

  somaticIntelligence: {
    tensionLevel: number;
    nervousSystemState: 'ventral' | 'sympathetic' | 'dorsal';
    breathingPattern: 'shallow' | 'deep' | 'held';
  };

  temporalDynamics: {
    conversationRhythm: number;
    silenceQuality: 'pregnant' | 'empty' | 'comfortable' | 'tense';
    kairosPresent: boolean;  // "Right moment" detection
  };
}

export interface EmergenceDecision {
  timestamp: string;
  sessionId: string;
  userId: string;
  exchangeNumber: number;

  // Input
  userInput: string;
  inputWordCount: number;
  inputEnergy: 'casual' | 'excited' | 'vulnerable' | 'crisis' | 'contemplative';

  // Field State at Decision Point
  fieldState: FieldStateVector;

  // What Could Have Emerged (All Options)
  possibleResponses: {
    response: string;
    type: 'presence' | 'mirror' | 'probe' | 'witness' | 'celebrate' | 'silence';
    resonanceScore: number;
    restraintLevel: number;
  }[];

  // What Actually Emerged
  emergentResponse: {
    content: string;
    wordCount: number;
    type: string;
    systemsUsed: string[];
    restraintApplied: boolean;
    emergenceTrace: string[];  // Path to emergence
  };

  // Comparative Baseline
  traditionalResponse: {
    content: string;
    wordCount: number;
    wouldHaveAnalyzed: boolean;
    therapeuticVoice: boolean;
  };

  // Outcomes (filled async)
  outcomes?: {
    userContinued: boolean;
    emotionalShift: number;
    trustMovement: number;
    breakthroughDetected: boolean;
    authenticityRating?: number;  // Human evaluator
  };
}

export class MetricsCollectionSystem {
  private supabase: any;
  private buffer: EmergenceDecision[] = [];
  private batchSize = 10;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Capture every field → emergence decision
   */
  async captureDecision(
    userInput: string,
    fieldState: FieldStateVector,
    response: any,
    context: any
  ): Promise<void> {
    const decision: EmergenceDecision = {
      timestamp: new Date().toISOString(),
      sessionId: context.sessionId,
      userId: context.userId,
      exchangeNumber: context.exchangeCount,

      userInput,
      inputWordCount: userInput.split(' ').length,
      inputEnergy: this.assessEnergy(userInput),

      fieldState,

      possibleResponses: this.capturePossibilities(fieldState),

      emergentResponse: {
        content: response.content,
        wordCount: response.content.split(' ').length,
        type: response.type,
        systemsUsed: response.systemsUsed || [],
        restraintApplied: response.restraintApplied,
        emergenceTrace: response.emergenceTrace || []
      },

      traditionalResponse: this.generateTraditionalBaseline(userInput, context)
    };

    // Buffer for batch upload
    this.buffer.push(decision);

    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Detect breakthrough moments in real-time
   */
  detectBreakthrough(
    previousState: FieldStateVector,
    currentState: FieldStateVector,
    userInput: string
  ): boolean {
    const breakthroughMarkers = [
      'oh!',
      'i just realized',
      'now i see',
      'that changes everything',
      'i never thought of it that way',
      'wow',
      'aha'
    ];

    const textualMarker = breakthroughMarkers.some(
      marker => userInput.toLowerCase().includes(marker)
    );

    const fieldShift =
      Math.abs(currentState.emotionalWeather.density -
               previousState.emotionalWeather.density) > 0.3;

    const clarityJump =
      currentState.semanticLandscape.clarity -
      previousState.semanticLandscape.clarity > 0.4;

    return textualMarker || (fieldShift && clarityJump);
  }

  /**
   * Track trust velocity
   */
  calculateTrustVelocity(
    conversations: EmergenceDecision[]
  ): number {
    const depthMarkers = {
      surface: ['weather', 'work', 'news', 'general'],
      middle: ['feeling', 'worry', 'hope', 'relationship'],
      deep: ['fear', 'shame', 'trauma', 'secret', 'dream']
    };

    let firstDeepExchange = conversations.findIndex(c =>
      depthMarkers.deep.some(marker =>
        c.userInput.toLowerCase().includes(marker)
      )
    );

    return firstDeepExchange > 0 ? 1 / firstDeepExchange : 0;
  }

  /**
   * Measure restraint ratio
   */
  calculateRestraintRatio(decision: EmergenceDecision): number {
    const outputWords = decision.emergentResponse.wordCount;
    const inputWords = decision.inputWordCount;

    return inputWords > 0 ? outputWords / inputWords : 1;
  }

  /**
   * Generate what traditional Maya would have said
   */
  private generateTraditionalBaseline(
    userInput: string,
    context: any
  ): any {
    // Simulate over-eager therapeutic response
    const templates = {
      greeting: "I sense you're reaching out to connect. What's alive for you?",
      fragment: "I notice hesitation in your words. What's behind this uncertainty?",
      emotion: "I'm hearing deep feeling here. Can you stay with that sensation?",
      casual: "Even casual check-ins can carry deeper meaning. What brings you here?"
    };

    const inputType = this.classifyInput(userInput);
    const traditionalResponse = templates[inputType] || templates.casual;

    return {
      content: traditionalResponse,
      wordCount: traditionalResponse.split(' ').length,
      wouldHaveAnalyzed: true,
      therapeuticVoice: true
    };
  }

  /**
   * Capture all possible responses that could have emerged
   */
  private capturePossibilities(fieldState: FieldStateVector): any[] {
    // This simulates the possibility space
    return [
      {
        response: "...",
        type: "silence",
        resonanceScore: fieldState.sacredMarkers.thresholdProximity,
        restraintLevel: 1.0
      },
      {
        response: "Tell me more.",
        type: "probe",
        resonanceScore: fieldState.semanticLandscape.ambiguity,
        restraintLevel: 0.8
      },
      {
        response: "I hear you.",
        type: "witness",
        resonanceScore: fieldState.emotionalWeather.density,
        restraintLevel: 0.9
      }
    ];
  }

  private assessEnergy(input: string): any {
    if (input.includes('!')) return 'excited';
    if (input.length < 20) return 'casual';
    if (/sad|hurt|pain|lost/.test(input.toLowerCase())) return 'vulnerable';
    if (/help|can't|suicide|die/.test(input.toLowerCase())) return 'crisis';
    return 'contemplative';
  }

  private classifyInput(input: string): string {
    if (/^(hi|hey|hello)/.test(input.toLowerCase())) return 'greeting';
    if (input.length < 30 && !input.includes('.')) return 'fragment';
    if (/feel|felt/.test(input.toLowerCase())) return 'emotion';
    return 'casual';
  }

  /**
   * Batch upload to research database
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const { error } = await this.supabase
      .from('emergence_decisions')
      .insert(this.buffer);

    if (error) {
      console.error('Failed to upload metrics:', error);
      // Store locally as backup
      this.storeLocalBackup(this.buffer);
    }

    this.buffer = [];
  }

  private storeLocalBackup(data: EmergenceDecision[]): void {
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    fs.writeFileSync(
      `./research-data/backup-${timestamp}.json`,
      JSON.stringify(data, null, 2)
    );
  }
}

/**
 * Real-time Analysis Dashboard Metrics
 */
export class ResearchAnalytics {
  /**
   * Key metrics for research paper
   */
  async calculateKeyMetrics(decisions: EmergenceDecision[]): Promise<any> {
    return {
      // Primary Metrics
      breakthroughRate: this.calculateBreakthroughRate(decisions),
      averageRestraintRatio: this.calculateAverageRestraint(decisions),
      trustVelocity: this.calculateAverageTrustVelocity(decisions),
      authenticityScore: await this.getAuthenticityScores(decisions),

      // Comparison Metrics
      wordReduction: this.compareWordCounts(decisions),
      depthAppropriateness: this.assessDepthMatching(decisions),
      silenceEffectiveness: this.measureSilenceImpact(decisions),

      // Novel Metrics
      sacredThresholdRecognition: this.measureSacredThresholds(decisions),
      fieldEmergenceCoherence: this.measureEmergenceCoherence(decisions),
      transformationEventRate: this.countTransformations(decisions)
    };
  }

  private calculateBreakthroughRate(decisions: EmergenceDecision[]): number {
    const breakthroughs = decisions.filter(d =>
      d.outcomes?.breakthroughDetected
    ).length;
    return (breakthroughs / decisions.length) * 100;
  }

  private calculateAverageRestraint(decisions: EmergenceDecision[]): number {
    const ratios = decisions.map(d =>
      d.emergentResponse.wordCount / Math.max(d.inputWordCount, 1)
    );
    return ratios.reduce((a, b) => a + b, 0) / ratios.length;
  }

  private calculateAverageTrustVelocity(decisions: EmergenceDecision[]): number {
    // Group by session and calculate per-session velocity
    const sessions = this.groupBySession(decisions);
    const velocities = Object.values(sessions).map(sessionDecisions =>
      this.findFirstDeepExchange(sessionDecisions as EmergenceDecision[])
    );
    return velocities.reduce((a, b) => a + b, 0) / velocities.length;
  }

  private groupBySession(decisions: EmergenceDecision[]): any {
    return decisions.reduce((acc, d) => {
      if (!acc[d.sessionId]) acc[d.sessionId] = [];
      acc[d.sessionId].push(d);
      return acc;
    }, {});
  }

  private findFirstDeepExchange(decisions: EmergenceDecision[]): number {
    const deepIndex = decisions.findIndex(d =>
      d.fieldState.connectionDynamics.distance < 0.3
    );
    return deepIndex >= 0 ? deepIndex + 1 : decisions.length;
  }

  private async getAuthenticityScores(decisions: EmergenceDecision[]): Promise<number> {
    const scores = decisions
      .filter(d => d.outcomes?.authenticityRating)
      .map(d => d.outcomes!.authenticityRating!);

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  private compareWordCounts(decisions: EmergenceDecision[]): number {
    const fisAverage = decisions
      .map(d => d.emergentResponse.wordCount)
      .reduce((a, b) => a + b, 0) / decisions.length;

    const traditionalAverage = decisions
      .map(d => d.traditionalResponse.wordCount)
      .reduce((a, b) => a + b, 0) / decisions.length;

    return ((traditionalAverage - fisAverage) / traditionalAverage) * 100;
  }

  private assessDepthMatching(decisions: EmergenceDecision[]): number {
    // How often depth matched user need
    const appropriate = decisions.filter(d => {
      const userDepth = d.fieldState.connectionDynamics.distance;
      const responseDepth = d.emergentResponse.systemsUsed.length / 10;
      return Math.abs(userDepth - responseDepth) < 0.2;
    }).length;

    return (appropriate / decisions.length) * 100;
  }

  private measureSilenceImpact(decisions: EmergenceDecision[]): number {
    const silences = decisions.filter(d =>
      d.emergentResponse.type === 'silence'
    );

    const silenceBreakthroughs = silences.filter(d =>
      d.outcomes?.breakthroughDetected
    ).length;

    return silences.length > 0
      ? (silenceBreakthroughs / silences.length) * 100
      : 0;
  }

  private measureSacredThresholds(decisions: EmergenceDecision[]): number {
    return decisions.filter(d =>
      d.fieldState.sacredMarkers.thresholdProximity > 0.7 &&
      d.emergentResponse.restraintApplied
    ).length;
  }

  private measureEmergenceCoherence(decisions: EmergenceDecision[]): number {
    // How often the highest resonance option emerged
    const coherent = decisions.filter(d => {
      const highestResonance = Math.max(
        ...d.possibleResponses.map(r => r.resonanceScore)
      );
      const emergentResonance = d.possibleResponses.find(
        r => r.response === d.emergentResponse.content
      )?.resonanceScore || 0;

      return emergentResonance >= highestResonance * 0.9;
    }).length;

    return (coherent / decisions.length) * 100;
  }

  private countTransformations(decisions: EmergenceDecision[]): number {
    // Major shifts in field state
    let transformations = 0;

    for (let i = 1; i < decisions.length; i++) {
      const prev = decisions[i-1].fieldState;
      const curr = decisions[i].fieldState;

      if (this.isTransformation(prev, curr)) {
        transformations++;
      }
    }

    return transformations;
  }

  private isTransformation(prev: FieldStateVector, curr: FieldStateVector): boolean {
    const emotionalShift = Math.abs(
      curr.emotionalWeather.density - prev.emotionalWeather.density
    ) > 0.5;

    const clarityShift =
      curr.semanticLandscape.clarity - prev.semanticLandscape.clarity > 0.4;

    const trustShift =
      prev.connectionDynamics.distance - curr.connectionDynamics.distance > 0.3;

    return (emotionalShift && clarityShift) || trustShift;
  }
}

/**
 * Export singleton instance
 */
export const metricsCollector = new MetricsCollectionSystem(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const researchAnalytics = new ResearchAnalytics();