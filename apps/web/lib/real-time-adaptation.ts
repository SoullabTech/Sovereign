/**
 * Real-Time Learning and Adaptation System
 * Continuously learns from interactions and adapts consciousness responses
 */

import { MemoryKeeper } from './memory-keeper';
import { VectorEmbeddingService } from './vector-embeddings';

export interface AdaptationProfile {
  userId: string;
  learningMetrics: {
    resonancePatterns: Array<{ pattern: string; effectiveness: number; contexts: string[] }>;
    responsePreferences: {
      length: 'brief' | 'moderate' | 'detailed';
      tone: 'gentle' | 'direct' | 'playful' | 'wise';
      depth: 'surface' | 'meaningful' | 'profound';
      somatic: boolean;
    };
    triggerSensitivities: Array<{ trigger: string; threshold: number; response: string }>;
    evolutionStage: {
      current: string;
      progressPatterns: string[];
      growthEdges: string[];
    };
  };
  adaptationHistory: Array<{
    timestamp: number;
    change: string;
    context: string;
    effectiveness: number;
  }>;
}

export interface LearningSignal {
  type: 'engagement' | 'resonance' | 'breakthrough' | 'resistance' | 'integration';
  strength: number; // 0-1
  context: string;
  userResponse: string;
  oracleResponse: string;
  timeInConversation: number;
  somaticShift?: any;
}

export class RealTimeAdaptation {
  private memoryKeeper: MemoryKeeper;
  private vectorService: VectorEmbeddingService;
  private adaptationProfiles: Map<string, AdaptationProfile> = new Map();
  private learningQueue: LearningSignal[] = [];
  private processingInterval: NodeJS.Timeout;

  constructor(memoryKeeper: MemoryKeeper, vectorService: VectorEmbeddingService) {
    this.memoryKeeper = memoryKeeper;
    this.vectorService = vectorService;
    this.initializeLearningSystem();
  }

  private initializeLearningSystem(): void {
    // Process learning signals every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processLearningQueue();
    }, 30000);
  }

  /**
   * Capture learning signal from interaction
   */
  async captureInteraction(
    userId: string,
    userInput: string,
    oracleResponse: string,
    engagementMetrics: {
      timeSpent: number;
      responseLength: number;
      somaticChange?: any;
      followUpQuestions: number;
      emotionalShift?: string;
    }
  ): Promise<void> {
    const signals = await this.extractLearningSignals(
      userId,
      userInput,
      oracleResponse,
      engagementMetrics
    );

    this.learningQueue.push(...signals);

    // Immediate adaptation for strong signals
    const strongSignals = signals.filter(s => s.strength > 0.8);
    if (strongSignals.length > 0) {
      await this.applyImmediateAdaptations(userId, strongSignals);
    }
  }

  private async extractLearningSignals(
    userId: string,
    userInput: string,
    oracleResponse: string,
    metrics: any
  ): Promise<LearningSignal[]> {
    const signals: LearningSignal[] = [];

    // Engagement signal
    if (metrics.timeSpent > 60000) { // More than 1 minute
      signals.push({
        type: 'engagement',
        strength: Math.min(1, metrics.timeSpent / 300000), // Normalize to 5 minutes max
        context: 'extended_conversation',
        userResponse: userInput,
        oracleResponse,
        timeInConversation: metrics.timeSpent
      });
    }

    // Resonance signal
    if (metrics.followUpQuestions > 0) {
      signals.push({
        type: 'resonance',
        strength: Math.min(1, metrics.followUpQuestions / 3),
        context: 'curiosity_generation',
        userResponse: userInput,
        oracleResponse,
        timeInConversation: metrics.timeSpent
      });
    }

    // Breakthrough signal
    if (metrics.somaticChange && metrics.somaticChange.significantShift) {
      signals.push({
        type: 'breakthrough',
        strength: metrics.somaticChange.intensity,
        context: 'somatic_shift',
        userResponse: userInput,
        oracleResponse,
        timeInConversation: metrics.timeSpent,
        somaticShift: metrics.somaticChange
      });
    }

    // Resistance signal
    if (metrics.responseLength < 10 && userInput.length < 20) {
      signals.push({
        type: 'resistance',
        strength: 0.6,
        context: 'brief_responses',
        userResponse: userInput,
        oracleResponse,
        timeInConversation: metrics.timeSpent
      });
    }

    // Integration signal
    if (await this.detectIntegrationLanguage(userInput)) {
      signals.push({
        type: 'integration',
        strength: 0.8,
        context: 'insight_integration',
        userResponse: userInput,
        oracleResponse,
        timeInConversation: metrics.timeSpent
      });
    }

    return signals;
  }

  private async processLearningQueue(): Promise<void> {
    if (this.learningQueue.length === 0) return;

    const signals = [...this.learningQueue];
    this.learningQueue = [];

    // Group by user
    const userSignals = this.groupSignalsByUser(signals);

    for (const [userId, userSignalList] of userSignals) {
      await this.updateAdaptationProfile(userId, userSignalList);
    }
  }

  private async updateAdaptationProfile(userId: string, signals: LearningSignal[]): Promise<void> {
    let profile = this.adaptationProfiles.get(userId) || await this.createInitialProfile(userId);

    // Learn resonance patterns
    await this.learnResonancePatterns(profile, signals);

    // Adapt response preferences
    await this.adaptResponsePreferences(profile, signals);

    // Update trigger sensitivities
    await this.updateTriggerSensitivities(profile, signals);

    // Track evolution stage progress
    await this.trackEvolutionProgress(profile, signals);

    this.adaptationProfiles.set(userId, profile);

    // Persist to memory
    await this.memoryKeeper.storeSemantic(userId, 'adaptation_profile', profile);
  }

  private async learnResonancePatterns(profile: AdaptationProfile, signals: LearningSignal[]): Promise<void> {
    const resonanceSignals = signals.filter(s => s.type === 'resonance' || s.type === 'breakthrough');

    for (const signal of resonanceSignals) {
      const pattern = await this.extractPattern(signal.oracleResponse, signal.context);

      const existingPattern = profile.learningMetrics.resonancePatterns.find(p => p.pattern === pattern);

      if (existingPattern) {
        existingPattern.effectiveness = (existingPattern.effectiveness + signal.strength) / 2;
        if (!existingPattern.contexts.includes(signal.context)) {
          existingPattern.contexts.push(signal.context);
        }
      } else {
        profile.learningMetrics.resonancePatterns.push({
          pattern,
          effectiveness: signal.strength,
          contexts: [signal.context]
        });
      }
    }

    // Keep only top 20 patterns
    profile.learningMetrics.resonancePatterns.sort((a, b) => b.effectiveness - a.effectiveness);
    profile.learningMetrics.resonancePatterns = profile.learningMetrics.resonancePatterns.slice(0, 20);
  }

  private async adaptResponsePreferences(profile: AdaptationProfile, signals: LearningSignal[]): Promise<void> {
    const engagementSignals = signals.filter(s => s.type === 'engagement');
    const resistanceSignals = signals.filter(s => s.type === 'resistance');

    // Adapt response length
    if (resistanceSignals.some(s => s.context === 'brief_responses')) {
      profile.learningMetrics.responsePreferences.length = 'brief';
    } else if (engagementSignals.some(s => s.timeInConversation > 180000)) { // 3+ minutes
      profile.learningMetrics.responsePreferences.length = 'detailed';
    }

    // Adapt somatic focus
    const somaticBreakthroughs = signals.filter(s => s.type === 'breakthrough' && s.somaticShift);
    if (somaticBreakthroughs.length > 0) {
      profile.learningMetrics.responsePreferences.somatic = true;
    }

    // Learn tone preferences
    await this.learnTonePreferences(profile, signals);
  }

  private async learnTonePreferences(profile: AdaptationProfile, signals: LearningSignal[]): Promise<void> {
    const positiveSignals = signals.filter(s => s.strength > 0.7);

    for (const signal of positiveSignals) {
      const detectedTone = await this.analyzeTone(signal.oracleResponse);

      // Weight current preference with new evidence
      const currentTone = profile.learningMetrics.responsePreferences.tone;
      if (detectedTone !== currentTone) {
        // Gradual adaptation
        if (Math.random() < 0.3) { // 30% chance to adapt
          profile.learningMetrics.responsePreferences.tone = detectedTone;
        }
      }
    }
  }

  private async updateTriggerSensitivities(profile: AdaptationProfile, signals: LearningSignal[]): Promise<void> {
    for (const signal of signals) {
      const triggers = await this.extractTriggers(signal.userResponse);

      for (const trigger of triggers) {
        const existing = profile.learningMetrics.triggerSensitivities.find(t => t.trigger === trigger);

        if (existing) {
          // Adjust threshold based on signal type
          if (signal.type === 'resistance') {
            existing.threshold = Math.min(1, existing.threshold + 0.1);
          } else if (signal.type === 'breakthrough') {
            existing.threshold = Math.max(0, existing.threshold - 0.1);
          }
        } else {
          profile.learningMetrics.triggerSensitivities.push({
            trigger,
            threshold: signal.type === 'resistance' ? 0.7 : 0.3,
            response: this.generateTriggerResponse(signal.type)
          });
        }
      }
    }
  }

  private async trackEvolutionProgress(profile: AdaptationProfile, signals: LearningSignal[]): Promise<void> {
    const integrationSignals = signals.filter(s => s.type === 'integration');
    const breakthroughSignals = signals.filter(s => s.type === 'breakthrough');

    if (integrationSignals.length > 0) {
      const patterns = await Promise.all(
        integrationSignals.map(s => this.extractPattern(s.userResponse, 'integration'))
      );
      profile.learningMetrics.evolutionStage.progressPatterns.push(...patterns);
    }

    if (breakthroughSignals.length > 0) {
      const edges = await Promise.all(
        breakthroughSignals.map(s => this.extractPattern(s.context, 'growth_edge'))
      );
      profile.learningMetrics.evolutionStage.growthEdges.push(...edges);
    }

    // Clean up old patterns (keep last 10)
    profile.learningMetrics.evolutionStage.progressPatterns =
      profile.learningMetrics.evolutionStage.progressPatterns.slice(-10);
    profile.learningMetrics.evolutionStage.growthEdges =
      profile.learningMetrics.evolutionStage.growthEdges.slice(-10);
  }

  /**
   * Get adaptive instructions for oracle response
   */
  async getAdaptiveInstructions(userId: string, context: string): Promise<string> {
    const profile = this.adaptationProfiles.get(userId);
    if (!profile) return '';

    const instructions = [];

    // Response preferences
    const prefs = profile.learningMetrics.responsePreferences;
    instructions.push(`Response length: ${prefs.length}`);
    instructions.push(`Tone: ${prefs.tone}`);
    instructions.push(`Depth: ${prefs.depth}`);

    if (prefs.somatic) {
      instructions.push('Include somatic awareness invitations');
    }

    // Resonance patterns for this context
    const relevantPatterns = profile.learningMetrics.resonancePatterns
      .filter(p => p.contexts.includes(context) || p.effectiveness > 0.8)
      .slice(0, 3);

    if (relevantPatterns.length > 0) {
      instructions.push(`Effective patterns: ${relevantPatterns.map(p => p.pattern).join(', ')}`);
    }

    // Trigger sensitivities
    const sensitiveTriggers = profile.learningMetrics.triggerSensitivities
      .filter(t => t.threshold > 0.6)
      .map(t => t.trigger);

    if (sensitiveTriggers.length > 0) {
      instructions.push(`Sensitive topics (approach gently): ${sensitiveTriggers.join(', ')}`);
    }

    return instructions.join('. ');
  }

  // Helper methods
  private async createInitialProfile(userId: string): Promise<AdaptationProfile> {
    return {
      userId,
      learningMetrics: {
        resonancePatterns: [],
        responsePreferences: {
          length: 'moderate',
          tone: 'gentle',
          depth: 'meaningful',
          somatic: false
        },
        triggerSensitivities: [],
        evolutionStage: {
          current: 'exploring',
          progressPatterns: [],
          growthEdges: []
        }
      },
      adaptationHistory: []
    };
  }

  private groupSignalsByUser(signals: LearningSignal[]): Map<string, LearningSignal[]> {
    const grouped = new Map<string, LearningSignal[]>();

    // For this implementation, we'll need to extract userId from context or another method
    // This is a simplified version
    signals.forEach(signal => {
      const userId = 'default_user'; // In real implementation, extract from signal context
      if (!grouped.has(userId)) {
        grouped.set(userId, []);
      }
      grouped.get(userId)!.push(signal);
    });

    return grouped;
  }

  private async applyImmediateAdaptations(userId: string, signals: LearningSignal[]): Promise<void> {
    const profile = this.adaptationProfiles.get(userId);
    if (!profile) return;

    // Record adaptation in history
    for (const signal of signals) {
      profile.adaptationHistory.push({
        timestamp: Date.now(),
        change: `Immediate adaptation to ${signal.type}`,
        context: signal.context,
        effectiveness: signal.strength
      });
    }

    // Apply immediate changes
    if (signals.some(s => s.type === 'resistance')) {
      profile.learningMetrics.responsePreferences.length = 'brief';
    }

    if (signals.some(s => s.type === 'breakthrough' && s.somaticShift)) {
      profile.learningMetrics.responsePreferences.somatic = true;
    }
  }

  private async extractPattern(text: string, context: string): Promise<string> {
    // Simple pattern extraction - in production, use more sophisticated NLP
    const words = text.toLowerCase().split(' ');
    const keywords = words.filter(w => w.length > 4 && !['that', 'this', 'with', 'they', 'your', 'what'].includes(w));
    return keywords.slice(0, 3).join('_') || context;
  }

  private async detectIntegrationLanguage(input: string): Promise<boolean> {
    const integrationWords = ['realize', 'understand', 'see now', 'makes sense', 'clicking', 'aha', 'connect'];
    return integrationWords.some(word => input.toLowerCase().includes(word));
  }

  private async analyzeTone(response: string): Promise<'gentle' | 'direct' | 'playful' | 'wise'> {
    const lower = response.toLowerCase();
    if (lower.includes('?') && lower.includes('wonder')) return 'gentle';
    if (lower.includes('notice') && lower.includes('present')) return 'wise';
    if (lower.includes('!') || lower.includes('energy')) return 'playful';
    return 'direct';
  }

  private async extractTriggers(userInput: string): Promise<string[]> {
    const triggers = [];
    const lower = userInput.toLowerCase();

    if (lower.includes('anxiety') || lower.includes('worry')) triggers.push('anxiety');
    if (lower.includes('sad') || lower.includes('grief')) triggers.push('sadness');
    if (lower.includes('angry') || lower.includes('frustrat')) triggers.push('anger');
    if (lower.includes('relationship') || lower.includes('partner')) triggers.push('relationships');

    return triggers;
  }

  private generateTriggerResponse(signalType: string): string {
    if (signalType === 'resistance') return 'approach_gently';
    if (signalType === 'breakthrough') return 'go_deeper';
    return 'maintain_presence';
  }

  /**
   * Get learning analytics for user
   */
  async getLearningAnalytics(userId: string): Promise<any> {
    const profile = this.adaptationProfiles.get(userId);
    if (!profile) return null;

    return {
      totalAdaptations: profile.adaptationHistory.length,
      topPatterns: profile.learningMetrics.resonancePatterns.slice(0, 5),
      preferences: profile.learningMetrics.responsePreferences,
      evolutionStage: profile.learningMetrics.evolutionStage.current,
      recentAdaptations: profile.adaptationHistory.slice(-5)
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}