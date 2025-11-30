/**
 * SHIFt Inference Service
 * 
 * Main orchestrator for the implicit SHIFt inference engine.
 * Coordinates feature extraction, scoring, blending, and persistence.
 */

import { 
  SHIFtProfile,
  SHIFtIngestRequest,
  SHIFtComputeRequest,
  SHIFtProfileResponse,
  ExplicitScore,
  SuggestedPractice,
  SPIRALOGIC_FACETS,
  SHIFtEvent
} from '../types/shift';
import { SHIFtFeatureExtractor } from './SHIFtFeatureExtractor';
import { SHIFtScoringEngine } from './SHIFtScoringEngine';
import { SHIFtNarrativeService } from './SHIFtNarrativeService';
import { logger } from '../utils/logger';
import { ainEventEmitter } from '../core/events/EventEmitter';

export class SHIFtInferenceService {
  private readonly featureExtractor: SHIFtFeatureExtractor;
  private readonly scoringEngine: SHIFtScoringEngine;
  private readonly narrativeService: SHIFtNarrativeService;
  
  // In production, these would be database queries
  private userProfiles: Map<string, SHIFtProfile> = new Map();
  private userFeatureHistory: Map<string, any[]> = new Map();
  private explicitScores: Map<string, ExplicitScore[]> = new Map();

  constructor() {
    this.featureExtractor = new SHIFtFeatureExtractor();
    this.scoringEngine = new SHIFtScoringEngine();
    this.narrativeService = SHIFtNarrativeService.getInstance();
  }

  /**
   * Ingest new session data and update profile
   */
  async ingest(request: SHIFtIngestRequest): Promise<void> {
    try {
      // Extract features
      const features = await this.featureExtractor.extractFeatures(
        request.text || '',
        request.events || [],
        request.metrics
      );

      // Store in history
      const history = this.userFeatureHistory.get(request.userId) || [];
      history.push({
        sessionId: request.sessionId,
        timestamp: new Date(),
        features
      });
      
      // Keep rolling window (28 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 28);
      const recentHistory = history.filter(h => 
        h.timestamp > cutoffDate
      );
      this.userFeatureHistory.set(request.userId, recentHistory);

      // Update profile
      await this.updateProfile(request.userId);

      logger.debug('SHIFt ingestion complete', {
        userId: request.userId,
        sessionId: request.sessionId,
        featureCount: Object.keys(features.conversational).length
      });

    } catch (error) {
      logger.error('Error ingesting SHIFt data:', error);
      throw error;
    }
  }

  /**
   * Compute SHIFt profile
   */
  async compute(request: SHIFtComputeRequest): Promise<SHIFtProfile> {
    const { userId, windowDays = 28, includeExplicit = true } = request;

    // Get feature history
    const history = this.userFeatureHistory.get(userId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);
    const recentHistory = history.filter(h => h.timestamp > cutoffDate);

    if (recentHistory.length === 0) {
      // Return default profile
      return this.createDefaultProfile(userId);
    }

    // Aggregate features with exponential moving average
    const aggregatedFeatures = this.aggregateFeatures(recentHistory);

    // Score facets
    const implicitScores = this.scoringEngine.scoreFacets(aggregatedFeatures);

    // Blend with explicit if available
    let facetScores = implicitScores;
    if (includeExplicit) {
      const userExplicitScores = this.explicitScores.get(userId) || [];
      facetScores = this.blendWithExplicit(implicitScores, userExplicitScores);
    }

    // Calculate elemental profile
    const elements = this.scoringEngine.calculateElementalProfile(facetScores);

    // Infer phase
    const phase = this.scoringEngine.inferPhase(facetScores);

    // Generate narrative
    const narrative = this.generateNarrative(elements, facetScores, phase, userId);

    // Suggest practice
    const practice = this.suggestPractice(facetScores);

    // Detect alerts
    const previousProfile = this.userProfiles.get(userId);
    const alerts = previousProfile 
      ? this.scoringEngine.detectAlerts(facetScores, previousProfile.facets.reduce((acc, f) => {
          acc[f.code] = f;
          return acc;
        }, {} as Record<string, any>))
      : [];

    // Calculate confidence and freshness
    const confidence = this.calculateOverallConfidence(facetScores);
    const freshness = this.calculateFreshness(recentHistory);

    const profile: SHIFtProfile = {
      userId,
      elements,
      facets: Object.values(facetScores),
      phase,
      confidence,
      lastUpdated: new Date(),
      freshness,
      narrative,
      practice,
      alerts: alerts.length > 0 ? alerts : undefined
    };

    // Store profile
    this.userProfiles.set(userId, profile);

    // Emit events for significant changes
    if (previousProfile) {
      this.emitChangeEvents(userId, profile, previousProfile);
    }

    return profile;
  }

  /**
   * Get profile in API response format
   */
  async getProfile(userId: string): Promise<SHIFtProfileResponse> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile || this.isStale(profile)) {
      // Recompute if missing or stale
      profile = await this.compute({ userId });
    }

    return {
      elements: profile.elements,
      facets: profile.facets.map(f => ({
        code: f.code,
        label: SPIRALOGIC_FACETS[f.code].phenomenologicalLabel,
        score: f.score,
        confidence: f.confidence,
        delta7d: f.delta7d
      })),
      phase: {
        primary: profile.phase.primary,
        primaryConfidence: profile.phase.primaryConfidence,
        secondary: profile.phase.secondary,
        secondaryConfidence: profile.phase.secondaryConfidence
      },
      narrative: profile.narrative,
      practice: profile.practice ? {
        title: profile.practice.title,
        steps: profile.practice.steps
      } : undefined,
      alerts: profile.alerts?.map(a => ({
        code: a.code,
        message: a.message
      }))
    };
  }

  /**
   * Store explicit survey scores
   */
  async storeExplicitScores(userId: string, scores: ExplicitScore[]): Promise<void> {
    this.explicitScores.set(userId, scores);
    
    // Trigger profile update
    await this.updateProfile(userId);
  }

  // Private helper methods

  private async updateProfile(userId: string): Promise<void> {
    await this.compute({ userId });
  }

  private createDefaultProfile(userId: string): SHIFtProfile {
    const defaultScore = 50;
    const defaultFacets = Object.keys(SPIRALOGIC_FACETS).map(code => ({
      code,
      score: defaultScore,
      confidence: 0.3,
      delta7d: 0,
      evidenceWeights: {},
      source: 'implicit' as const
    }));

    return {
      userId,
      elements: {
        fire: defaultScore,
        earth: defaultScore,
        water: defaultScore,
        air: defaultScore,
        aether: defaultScore,
        confidence: 0.3
      },
      facets: defaultFacets,
      phase: {
        primary: 'initiation',
        primaryConfidence: 0.3,
        secondary: 'grounding',
        secondaryConfidence: 0.2,
        logits: {
          initiation: 0.3,
          grounding: 0.2,
          collaboration: 0.2,
          transformation: 0.15,
          completion: 0.15
        }
      },
      confidence: 0.3,
      lastUpdated: new Date(),
      freshness: 0,
      narrative: "Just beginning to understand your journey. Keep engaging to reveal deeper patterns."
    };
  }

  private aggregateFeatures(history: any[]): any {
    // Exponential moving average with time decay
    const alpha = 0.3;
    const halfLifeDays = 14;
    
    let aggregated: any = null;
    const now = new Date();

    history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    history.forEach(entry => {
      const daysSince = (now.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const decay = Math.exp(-daysSince / halfLifeDays);
      const weight = alpha * decay;

      if (!aggregated) {
        aggregated = JSON.parse(JSON.stringify(entry.features));
      } else {
        // Weighted average for numeric fields
        this.mergeFeatures(aggregated, entry.features, weight);
      }
    });

    return aggregated || {};
  }

  private mergeFeatures(target: any, source: any, weight: number): void {
    // Merge conversational signals
    Object.keys(source.conversational).forEach(key => {
      if (typeof source.conversational[key] === 'number') {
        target.conversational[key] = target.conversational[key] * (1 - weight) + 
                                     source.conversational[key] * weight;
      } else if (typeof source.conversational[key] === 'boolean') {
        // For booleans, use most recent if weight > 0.5
        if (weight > 0.5) {
          target.conversational[key] = source.conversational[key];
        }
      }
    });

    // Similar for behavioral and content quality
    this.mergeNumericFields(target.behavioral, source.behavioral, weight);
    this.mergeNumericFields(target.contentQuality, source.contentQuality, weight);
  }

  private mergeNumericFields(target: any, source: any, weight: number): void {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'number') {
        target[key] = target[key] * (1 - weight) + source[key] * weight;
      }
    });
  }

  private blendWithExplicit(
    implicit: Record<string, any>,
    explicit: ExplicitScore[]
  ): Record<string, any> {
    const blended = { ...implicit };
    
    explicit.forEach(exp => {
      if (blended[exp.facetCode]) {
        blended[exp.facetCode] = this.scoringEngine.blendScores(
          blended[exp.facetCode],
          exp
        );
      }
    });

    return blended;
  }

  private generateNarrative(
    elements: any,
    facets: Record<string, any>,
    phase: any,
    userId: string
  ): string {
    try {
      // Create a temporary profile object for narrative generation
      const profile: SHIFtProfile = {
        userId,
        elements,
        facets: Object.entries(facets).map(([code, data]: [string, any]) => ({
          code,
          score: data.score,
          confidence: data.confidence,
          delta7d: data.delta7d || 0,
          evidenceWeights: data.evidenceWeights || {},
          source: data.source || 'implicit'
        })),
        phase,
        confidence: this.calculateOverallConfidence(facets),
        lastUpdated: new Date(),
        freshness: 1,
        narrative: ''
      };

      // Use the new narrative service
      const narrativeResult = this.narrativeService.generateIndividual(profile, 'medium');
      
      // Combine the narrative segments into a single string
      const { opening, insights, closing } = narrativeResult.narrative;
      const insightText = insights
        .filter(i => i.level !== 'balanced') // Focus on notable elements
        .map(i => i.narrative)
        .join(' ');
      
      return `${opening} ${insightText} ${closing}`;
    } catch (error) {
      logger.error('Error generating narrative with new service', { error });
      // Fallback to simple narrative
      return this.generateSimpleNarrative(elements, phase);
    }
  }

  private generateSimpleNarrative(elements: any, phase: any): string {
    const dominantElement = this.getDominantElement(elements);
    return `Your ${dominantElement} energy is prominent today. You're in a phase of ${phase.primary}.`;
  }

  private suggestPractice(facets: Record<string, any>): SuggestedPractice | undefined {
    // Find facets needing support
    const needsSupport = Object.values(facets)
      .filter((f: any) => f.score < 50)
      .sort((a: any, b: any) => a.score - b.score);

    if (needsSupport.length === 0) {
      return undefined;
    }

    const targetFacet = needsSupport[0] as any;
    
    // Map facet to practice
    const practices: Record<string, SuggestedPractice> = {
      'E2_Grounding': {
        title: 'Morning Anchor Practice',
        description: 'A simple 5-minute grounding routine',
        steps: [
          'Upon waking, place both feet on the floor',
          'Take three deep breaths, feeling your connection to earth',
          'Name one thing you\'re grateful for',
          'Set one simple intention for the day'
        ],
        targetFacets: ['E2_Grounding'],
        durationMinutes: 5
      },
      'F2_Courage': {
        title: 'Truth Naming Practice',
        description: 'Gently acknowledge what needs to be spoken',
        steps: [
          'Find a quiet moment alone',
          'Ask yourself: "What am I not saying?"',
          'Speak one true sentence aloud, even if just to yourself',
          'Notice any relief or clarity that follows'
        ],
        targetFacets: ['F2_Courage'],
        durationMinutes: 10
      },
      'W2_Belonging': {
        title: 'Connection Ritual',
        description: 'Strengthen your sense of belonging',
        steps: [
          'Reach out to one person who matters to you',
          'Share something genuine - a gratitude, concern, or joy',
          'Ask how they are and listen fully',
          'Notice the feeling of connection'
        ],
        targetFacets: ['W2_Belonging'],
        durationMinutes: 15
      }
    };

    return practices[targetFacet.code] || {
      title: 'Presence Practice',
      description: 'Return to simple awareness',
      steps: [
        'Pause whatever you\'re doing',
        'Take three conscious breaths',
        'Notice five things you can sense right now',
        'Return to your activity with fresh attention'
      ],
      targetFacets: [targetFacet.code],
      durationMinutes: 3
    };
  }

  private calculateOverallConfidence(facetScores: Record<string, any>): number {
    const confidences = Object.values(facetScores).map((f: any) => f.confidence);
    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }

  private calculateFreshness(history: any[]): number {
    if (history.length === 0) return 0;
    
    const mostRecent = Math.max(...history.map(h => h.timestamp.getTime()));
    const daysSince = (Date.now() - mostRecent) / (1000 * 60 * 60 * 24);
    
    // Decay freshness over 7 days
    return Math.max(0, 1 - (daysSince / 7));
  }

  private isStale(profile: SHIFtProfile): boolean {
    const hoursSince = (Date.now() - profile.lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursSince > 24; // Consider stale after 24 hours
  }

  private emitChangeEvents(
    userId: string,
    newProfile: SHIFtProfile,
    oldProfile: SHIFtProfile
  ): void {
    // Check for significant facet changes
    newProfile.facets.forEach(newFacet => {
      const oldFacet = oldProfile.facets.find(f => f.code === newFacet.code);
      if (oldFacet && Math.abs(newFacet.score - oldFacet.score) > 10) {
        const event: SHIFtEvent = {
          type: 'shift.facet.updated',
          userId,
          facet: newFacet.code,
          score: newFacet.score,
          confidence: newFacet.confidence,
          previousScore: oldFacet.score
        };
        ainEventEmitter.emitSystemEvent(event as any);
      }
    });

    // Check for phase change
    if (newProfile.phase.primary !== oldProfile.phase.primary) {
      const event: SHIFtEvent = {
        type: 'shift.phase.changed',
        userId,
        from: oldProfile.phase.primary,
        to: newProfile.phase.primary,
        confidence: newProfile.phase.primaryConfidence
      };
      ainEventEmitter.emit(event as any);
    }

    // Emit alerts
    newProfile.alerts?.forEach(alert => {
      const event: SHIFtEvent = {
        type: 'shift.alert.triggered',
        userId,
        alert
      };
      ainEventEmitter.emit(event as any);
    });
  }

  // Narrative helpers

  private getDominantElement(elements: any): string {
    return Object.entries(elements)
      .filter(([key]) => key !== 'confidence')
      .reduce((max, [key, value]) => 
        (value as number) > elements[max] ? key : max, 'fire');
  }

  private getWeakestElement(elements: any): string {
    return Object.entries(elements)
      .filter(([key]) => key !== 'confidence')
      .reduce((min, [key, value]) => 
        (value as number) < elements[min] ? key : min, 'fire');
  }

  private isBalanced(elements: any): boolean {
    const values = Object.entries(elements)
      .filter(([key]) => key !== 'confidence')
      .map(([, value]) => value as number);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return max - min < 20;
  }

  private getPhaseDescription(phase: string): string {
    const descriptions: Record<string, string> = {
      initiation: 'beginning a new cycle of growth',
      grounding: 'establishing roots and stability',
      collaboration: 'opening to connection and co-creation',
      transformation: 'in deep metamorphosis',
      completion: 'integrating wisdom and preparing for what\'s next'
    };
    return descriptions[phase] || phase;
  }

  private getLowestFacet(facets: Record<string, any>): any {
    return Object.values(facets).reduce((lowest: any, facet: any) => 
      !lowest || facet.score < lowest.score ? facet : lowest
    );
  }

  private getFacetGuidance(facetCode: string): string {
    const guidance: Record<string, string> = {
      'F1_Meaning': 'Consider what truly matters to you right now. ',
      'F2_Courage': 'There may be a truth waiting to be spoken. ',
      'E1_Coherence': 'Look for how your current path connects to your larger journey. ',
      'E2_Grounding': 'Simple daily practices could bring more stability. ',
      'W1_Attunement': 'Make space to feel what moves through you. ',
      'W2_Belonging': 'Connection with others may need tending. ',
      'A1_Reflection': 'Stepping back to observe could bring clarity. ',
      'A2_Adaptability': 'Consider if old patterns still serve you. ',
      'AE1_Values': 'Reconnect with what you hold most sacred. ',
      'AE2_Fulfillment': 'Notice what already feels complete. ',
      'C1_Integration': 'Practice bringing insights into daily life. ',
      'C2_Integrity': 'Align your words with your actions. '
    };
    return guidance[facetCode] || '';
  }
}