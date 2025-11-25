/**
 * PERSONALIZED FRAMEWORK RESONANCE LEARNING
 *
 * Learns which frameworks resonate most with each individual
 * and adapts recommendations based on what actually works
 *
 * LEARNING PRINCIPLES:
 * - Track framework usage → outcome correlations
 * - Some people respond better to somatic work (body-first)
 * - Others resonate with cognitive approaches (mind-first)
 * - Some need systemic work (constellation, family)
 * - Track what ACTUALLY helps vs what theory says
 *
 * ADAPTATION:
 * - High resonance frameworks → Prioritize in recommendations
 * - Low resonance frameworks → De-emphasize or reframe
 * - Combination effectiveness → Which pairs/triads work together
 * - Optimal sequencing → Body before mind? System before parts?
 *
 * CLINICAL VALUE:
 * - Personalized precision (not one-size-fits-all)
 * - Faster progress (focus on what works)
 * - Reduced resistance (work with natural resonance)
 * - Practitioner efficiency (know what to emphasize)
 * - Client engagement (feels personally attuned)
 */

import type { ExtractionResult } from './SymbolExtractionEngine';
import type { TransformationSignature } from './CrossFrameworkSynergyEngine';
import type { JourneyProgression } from './UserJourneyTracker';

// ============================================================================
// INTERFACES
// ============================================================================

export type FrameworkName =
  | 'Jung' | 'McGilchrist' | 'IFS'
  | 'Polyvagal' | 'Levine' | 'Gestalt'
  | 'Levin' | 'Constellation'
  | 'Alchemy' | 'ACT' | 'CBT' | 'Schema Therapy';

export type InterventionOutcome = 'significant-improvement' | 'moderate-improvement' | 'slight-improvement' | 'no-change' | 'worse';

export interface FrameworkUsageRecord {
  sessionId: string;
  timestamp: Date;
  framework: FrameworkName;
  interventionType: string; // e.g., "co-regulation", "parts work", "grounding"
  contextualState: string; // State when intervention applied (e.g., "freeze", "hyperarousal")
  outcome?: InterventionOutcome; // Marked in follow-up session
  coherenceChange?: number; // Change in coherence after intervention
}

export interface FrameworkEffectiveness {
  framework: FrameworkName;

  // Overall metrics
  usageCount: number;
  resonanceScore: number; // 0-1, learned effectiveness
  confidence: number; // 0-1, how confident we are in the score

  // Outcome tracking
  outcomes: {
    'significant-improvement': number;
    'moderate-improvement': number;
    'slight-improvement': number;
    'no-change': number;
    'worse': number;
  };

  // Context-specific effectiveness
  effectiveFor: string[]; // States/contexts where this framework works well
  ineffectiveFor: string[]; // States/contexts where this framework doesn't work

  // Temporal patterns
  averageCoherenceChange: number; // Average change when this framework used
  lastUsed?: Date;
  recentTrend: 'improving' | 'stable' | 'declining'; // Is effectiveness getting better or worse?
}

export interface FrameworkCombination {
  frameworks: FrameworkName[];
  usageCount: number;
  averageOutcome: number; // 0-1, averaged effectiveness
  synergy: 'high' | 'moderate' | 'low'; // Do these frameworks work well together?
}

export interface ResonanceProfile {
  userId: string;

  // Framework effectiveness rankings
  frameworkEffectiveness: FrameworkEffectiveness[];
  topFrameworks: FrameworkName[]; // Top 3-5 most effective
  leastEffectiveFrameworks: FrameworkName[]; // Bottom 3 least effective

  // Learning insights
  preferredModality: 'somatic' | 'cognitive' | 'systemic' | 'mixed';
  optimalEntry: 'body-first' | 'mind-first' | 'system-first' | 'parts-first';
  pacing: 'slow' | 'moderate' | 'fast'; // How fast can they move?

  // Combination effectiveness
  effectiveCombinations: FrameworkCombination[];

  // Recommendations
  prioritizedFrameworks: FrameworkName[]; // Ordered by effectiveness
  adaptiveStrategy: string; // Overall therapeutic strategy based on learning

  // Meta-learning
  totalSessions: number;
  learningConfidence: number; // 0-1, overall confidence in profile
  lastUpdated: Date;
}

export interface AdaptiveRecommendation {
  framework: FrameworkName;
  priority: 'high' | 'moderate' | 'low';
  reasoning: string;
  specificInterventions: string[];
  expectedEffectiveness: number; // 0-1, predicted effectiveness
  basedOn: string; // What learning informed this?
}

export interface PersonalizedPrescription {
  profile: ResonanceProfile;
  recommendations: AdaptiveRecommendation[];
  learningInsights: string[];
  adaptations: string[]; // How we're adapting based on learning
  nextSteps: string[];
}

// ============================================================================
// FRAMEWORK RESONANCE LEARNING ENGINE
// ============================================================================

class FrameworkResonanceLearningEngine {
  private profiles: Map<string, ResonanceProfile> = new Map();
  private usageHistory: Map<string, FrameworkUsageRecord[]> = new Map();

  /**
   * Initialize or get resonance profile for user
   */
  getProfile(userId: string): ResonanceProfile {
    let profile = this.profiles.get(userId);

    if (!profile) {
      profile = this.initializeProfile(userId);
      this.profiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Record framework usage
   */
  recordUsage(
    userId: string,
    sessionId: string,
    framework: FrameworkName,
    interventionType: string,
    contextualState: string
  ): void {
    const record: FrameworkUsageRecord = {
      sessionId,
      timestamp: new Date(),
      framework,
      interventionType,
      contextualState
    };

    const history = this.usageHistory.get(userId) || [];
    history.push(record);
    this.usageHistory.set(userId, history);
  }

  /**
   * Update outcome for previous session intervention
   */
  updateOutcome(
    userId: string,
    sessionId: string,
    outcome: InterventionOutcome,
    coherenceChange?: number
  ): void {
    const history = this.usageHistory.get(userId);
    if (!history) return;

    // Find records from that session and update
    history
      .filter(r => r.sessionId === sessionId)
      .forEach(record => {
        record.outcome = outcome;
        record.coherenceChange = coherenceChange;
      });

    // Trigger learning update
    this.updateLearning(userId);
  }

  /**
   * Learn from journey progression
   * (Automatically called when journey updates)
   */
  learnFromJourney(userId: string, journey: JourneyProgression): void {
    const profile = this.getProfile(userId);

    // Analyze which frameworks were present in improving vs declining periods
    if (journey.totalSnapshots < 3) return; // Not enough data

    // Look at coherence changes between sessions
    for (let i = 1; i < journey.snapshots.length; i++) {
      const prev = journey.snapshots[i - 1];
      const current = journey.snapshots[i];
      const coherenceChange = current.coherence - prev.coherence;

      // Infer which frameworks were emphasized based on extraction
      const frameworks = this.inferActiveFrameworks(current.extraction);

      // Record implied effectiveness
      frameworks.forEach(framework => {
        const outcome = this.coherenceChangeToOutcome(coherenceChange);
        this.recordImpliedEffectiveness(userId, framework, outcome, coherenceChange);
      });
    }

    // Update learning
    this.updateLearning(userId);
  }

  /**
   * Generate personalized prescription
   */
  generatePersonalizedPrescription(
    userId: string,
    currentExtraction: ExtractionResult,
    currentSignature?: TransformationSignature,
    journey?: JourneyProgression
  ): PersonalizedPrescription {
    // Get or update profile
    const profile = this.getProfile(userId);

    if (journey) {
      this.learnFromJourney(userId, journey);
    }

    // Generate adaptive recommendations
    const recommendations = this.generateAdaptiveRecommendations(
      profile,
      currentExtraction,
      currentSignature
    );

    // Generate learning insights
    const learningInsights = this.generateLearningInsights(profile);

    // Generate adaptations
    const adaptations = this.generateAdaptations(profile);

    // Generate next steps
    const nextSteps = this.generateNextSteps(profile, currentExtraction);

    return {
      profile,
      recommendations,
      learningInsights,
      adaptations,
      nextSteps
    };
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Initialize new profile
   */
  private initializeProfile(userId: string): ResonanceProfile {
    const allFrameworks: FrameworkName[] = [
      'Jung', 'McGilchrist', 'IFS',
      'Polyvagal', 'Levine', 'Gestalt',
      'Levin', 'Constellation',
      'Alchemy', 'ACT', 'CBT', 'Schema Therapy'
    ];

    const frameworkEffectiveness: FrameworkEffectiveness[] = allFrameworks.map(framework => ({
      framework,
      usageCount: 0,
      resonanceScore: 0.5, // Start neutral
      confidence: 0.0, // No data yet
      outcomes: {
        'significant-improvement': 0,
        'moderate-improvement': 0,
        'slight-improvement': 0,
        'no-change': 0,
        'worse': 0
      },
      effectiveFor: [],
      ineffectiveFor: [],
      averageCoherenceChange: 0,
      recentTrend: 'stable'
    }));

    return {
      userId,
      frameworkEffectiveness,
      topFrameworks: [],
      leastEffectiveFrameworks: [],
      preferredModality: 'mixed',
      optimalEntry: 'body-first', // Default to body-first (somatic)
      pacing: 'moderate',
      effectiveCombinations: [],
      prioritizedFrameworks: [],
      adaptiveStrategy: 'Establishing baseline - gathering initial data',
      totalSessions: 0,
      learningConfidence: 0.0,
      lastUpdated: new Date()
    };
  }

  /**
   * Update learning from accumulated data
   */
  private updateLearning(userId: string): void {
    const profile = this.getProfile(userId);
    const history = this.usageHistory.get(userId) || [];

    if (history.length === 0) return;

    // Update each framework's effectiveness
    profile.frameworkEffectiveness.forEach(fe => {
      const frameworkRecords = history.filter(r => r.framework === fe.framework);

      if (frameworkRecords.length === 0) return;

      fe.usageCount = frameworkRecords.length;

      // Calculate outcomes
      const recordsWithOutcome = frameworkRecords.filter(r => r.outcome);
      recordsWithOutcome.forEach(r => {
        if (r.outcome) {
          fe.outcomes[r.outcome]++;
        }
      });

      // Calculate resonance score (weighted by outcome quality)
      const weights = {
        'significant-improvement': 1.0,
        'moderate-improvement': 0.7,
        'slight-improvement': 0.4,
        'no-change': 0.2,
        'worse': 0.0
      };

      const totalWeighted = Object.entries(fe.outcomes).reduce((sum, [outcome, count]) => {
        return sum + (weights[outcome as InterventionOutcome] * count);
      }, 0);

      const totalOutcomes = recordsWithOutcome.length;
      fe.resonanceScore = totalOutcomes > 0 ? totalWeighted / totalOutcomes : 0.5;

      // Confidence based on sample size
      fe.confidence = Math.min(totalOutcomes / 10, 1.0); // Max confidence at 10+ samples

      // Average coherence change
      const recordsWithCoherence = frameworkRecords.filter(r => r.coherenceChange !== undefined);
      if (recordsWithCoherence.length > 0) {
        fe.averageCoherenceChange = recordsWithCoherence.reduce(
          (sum, r) => sum + (r.coherenceChange || 0), 0
        ) / recordsWithCoherence.length;
      }

      // Determine trend (recent effectiveness vs overall)
      const recentRecords = frameworkRecords.slice(-3).filter(r => r.outcome);
      if (recentRecords.length >= 2) {
        const recentScore = recentRecords.reduce((sum, r) => {
          return sum + (r.outcome ? weights[r.outcome] : 0);
        }, 0) / recentRecords.length;

        if (recentScore > fe.resonanceScore + 0.1) fe.recentTrend = 'improving';
        else if (recentScore < fe.resonanceScore - 0.1) fe.recentTrend = 'declining';
        else fe.recentTrend = 'stable';
      }
    });

    // Rank frameworks
    const ranked = [...profile.frameworkEffectiveness]
      .filter(fe => fe.usageCount > 0)
      .sort((a, b) => b.resonanceScore - a.resonanceScore);

    profile.topFrameworks = ranked.slice(0, 5).map(fe => fe.framework);
    profile.leastEffectiveFrameworks = ranked.slice(-3).map(fe => fe.framework);

    // Determine preferred modality
    profile.preferredModality = this.determinePreferredModality(profile);

    // Determine optimal entry point
    profile.optimalEntry = this.determineOptimalEntry(profile);

    // Update prioritized list
    profile.prioritizedFrameworks = ranked.map(fe => fe.framework);

    // Update learning confidence
    const totalUsages = history.length;
    profile.learningConfidence = Math.min(totalUsages / 20, 1.0); // Max at 20+ interventions

    // Update totals
    profile.totalSessions = new Set(history.map(r => r.sessionId)).size;
    profile.lastUpdated = new Date();

    // Update adaptive strategy
    profile.adaptiveStrategy = this.generateAdaptiveStrategy(profile);

    // Save updated profile
    this.profiles.set(userId, profile);
  }

  /**
   * Infer which frameworks were active in extraction
   */
  private inferActiveFrameworks(extraction: ExtractionResult): FrameworkName[] {
    const frameworks: FrameworkName[] = [];

    if (extraction.somaticState?.detected) frameworks.push('Levine');
    if (extraction.polyvagalState) frameworks.push('Polyvagal');
    if (extraction.ifsParts?.detected) frameworks.push('IFS');
    if (extraction.gestaltState?.contactDisturbances) frameworks.push('Gestalt');
    if (extraction.constellationState?.detected) frameworks.push('Constellation');
    if (extraction.alchemicalStage) frameworks.push('Alchemy');
    if (extraction.actState?.experientialAvoidance.detected) frameworks.push('ACT');
    if (extraction.cbtState?.cognitiveDistortions) frameworks.push('CBT');
    if (extraction.jungState?.archetypalPatterns.detected) frameworks.push('Jung');
    if (extraction.hemisphereBias) frameworks.push('McGilchrist');

    return frameworks;
  }

  /**
   * Convert coherence change to outcome category
   */
  private coherenceChangeToOutcome(change: number): InterventionOutcome {
    if (change > 0.15) return 'significant-improvement';
    if (change > 0.08) return 'moderate-improvement';
    if (change > 0.03) return 'slight-improvement';
    if (change > -0.03) return 'no-change';
    return 'worse';
  }

  /**
   * Record implied effectiveness (from journey analysis)
   */
  private recordImpliedEffectiveness(
    userId: string,
    framework: FrameworkName,
    outcome: InterventionOutcome,
    coherenceChange: number
  ): void {
    const history = this.usageHistory.get(userId) || [];

    // Create implied usage record
    const record: FrameworkUsageRecord = {
      sessionId: `implied-${Date.now()}`,
      timestamp: new Date(),
      framework,
      interventionType: 'inferred-from-journey',
      contextualState: 'mixed',
      outcome,
      coherenceChange
    };

    history.push(record);
    this.usageHistory.set(userId, history);
  }

  /**
   * Determine preferred modality from effectiveness
   */
  private determinePreferredModality(profile: ResonanceProfile): 'somatic' | 'cognitive' | 'systemic' | 'mixed' {
    const somaticFrameworks = ['Levine', 'Polyvagal', 'Gestalt'];
    const cognitiveFrameworks = ['CBT', 'ACT', 'Schema Therapy', 'McGilchrist'];
    const systemicFrameworks = ['Constellation', 'Levin'];

    const somaticScore = this.getAverageResonance(profile, somaticFrameworks as FrameworkName[]);
    const cognitiveScore = this.getAverageResonance(profile, cognitiveFrameworks as FrameworkName[]);
    const systemicScore = this.getAverageResonance(profile, systemicFrameworks as FrameworkName[]);

    const max = Math.max(somaticScore, cognitiveScore, systemicScore);

    if (max < 0.6 || Math.abs(somaticScore - cognitiveScore) < 0.15) return 'mixed';
    if (max === somaticScore) return 'somatic';
    if (max === cognitiveScore) return 'cognitive';
    return 'systemic';
  }

  /**
   * Determine optimal entry point
   */
  private determineOptimalEntry(profile: ResonanceProfile): 'body-first' | 'mind-first' | 'system-first' | 'parts-first' {
    const topFramework = profile.topFrameworks[0];

    if (['Levine', 'Polyvagal'].includes(topFramework)) return 'body-first';
    if (['CBT', 'ACT', 'McGilchrist'].includes(topFramework)) return 'mind-first';
    if (['Constellation', 'Levin'].includes(topFramework)) return 'system-first';
    if (topFramework === 'IFS') return 'parts-first';

    return 'body-first'; // Default
  }

  /**
   * Get average resonance for framework set
   */
  private getAverageResonance(profile: ResonanceProfile, frameworks: FrameworkName[]): number {
    const scores = frameworks
      .map(f => profile.frameworkEffectiveness.find(fe => fe.framework === f))
      .filter(fe => fe && fe.usageCount > 0)
      .map(fe => fe!.resonanceScore);

    if (scores.length === 0) return 0.5;
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }

  /**
   * Generate adaptive strategy description
   */
  private generateAdaptiveStrategy(profile: ResonanceProfile): string {
    if (profile.learningConfidence < 0.3) {
      return 'Early learning phase - establishing baseline effectiveness for each framework';
    }

    const top = profile.topFrameworks[0];
    const modality = profile.preferredModality;

    return `Personalized approach: ${modality} emphasis, entering through ${profile.optimalEntry.replace('-', ' ')}. ${top} shows highest effectiveness (${(profile.frameworkEffectiveness.find(f => f.framework === top)?.resonanceScore || 0.5) * 100}% resonance).`;
  }

  /**
   * Generate adaptive recommendations
   */
  private generateAdaptiveRecommendations(
    profile: ResonanceProfile,
    extraction: ExtractionResult,
    signature?: TransformationSignature
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    // Prioritize top 3 frameworks
    profile.topFrameworks.slice(0, 3).forEach((framework, index) => {
      const effectiveness = profile.frameworkEffectiveness.find(fe => fe.framework === framework);
      if (!effectiveness) return;

      const priority = index === 0 ? 'high' : index === 1 ? 'moderate' : 'low';

      recommendations.push({
        framework,
        priority,
        reasoning: `${framework} shows ${(effectiveness.resonanceScore * 100).toFixed(0)}% effectiveness for this client (${effectiveness.usageCount} sessions tracked, ${(effectiveness.confidence * 100).toFixed(0)}% confidence)`,
        specificInterventions: this.getFrameworkInterventions(framework, extraction),
        expectedEffectiveness: effectiveness.resonanceScore,
        basedOn: `Learned from ${effectiveness.usageCount} previous sessions`
      });
    });

    // Add emerging framework if showing improvement trend
    const emerging = profile.frameworkEffectiveness.find(
      fe => fe.recentTrend === 'improving' && fe.usageCount >= 2
    );

    if (emerging && !profile.topFrameworks.includes(emerging.framework)) {
      recommendations.push({
        framework: emerging.framework,
        priority: 'moderate',
        reasoning: `${emerging.framework} showing improving trend - worth exploring further`,
        specificInterventions: this.getFrameworkInterventions(emerging.framework, extraction),
        expectedEffectiveness: emerging.resonanceScore + 0.15, // Boost for trend
        basedOn: 'Recent improvement trend detected'
      });
    }

    return recommendations;
  }

  /**
   * Get framework-specific interventions
   */
  private getFrameworkInterventions(framework: FrameworkName, extraction: ExtractionResult): string[] {
    const interventionMap: Record<FrameworkName, string[]> = {
      'Levine': ['Titration', 'Pendulation', 'Orientation', 'Discharge incomplete responses'],
      'Polyvagal': ['Co-regulation', 'Ventral tone building', 'Safety establishment', 'Social engagement'],
      'IFS': ['Parts mapping', 'Unblending', 'Self-led work', 'Exile unburdening'],
      'Gestalt': ['Awareness practice', 'Contact boundary work', 'Experiment design', 'Completion'],
      'Constellation': ['Family system mapping', 'Excluded member acknowledgment', 'Entanglement release'],
      'Alchemy': ['Shadow integration', 'Nigredo witnessing', 'Rubedo emergence work'],
      'ACT': ['Defusion practices', 'Values clarification', 'Committed action', 'Acceptance work'],
      'CBT': ['Thought record', 'Behavioral activation', 'Cognitive restructuring'],
      'Jung': ['Dream work', 'Active imagination', 'Archetypal exploration'],
      'McGilchrist': ['Hemisphere integration', 'Right-brain activation', 'Whole-brain awareness'],
      'Levin': ['Bioelectric field work', 'Morphogenetic pattern recognition'],
      'Schema Therapy': ['Mode work', 'Limited reparenting', 'Schema identification']
    };

    return interventionMap[framework] || ['Framework-specific work'];
  }

  /**
   * Generate learning insights
   */
  private generateLearningInsights(profile: ResonanceProfile): string[] {
    const insights: string[] = [];

    if (profile.learningConfidence < 0.3) {
      insights.push('Still in early learning phase - gathering more data to refine recommendations');
      return insights;
    }

    // Top framework insight
    const top = profile.frameworkEffectiveness.find(fe => fe.framework === profile.topFrameworks[0]);
    if (top) {
      insights.push(`${top.framework} consistently most effective (${(top.resonanceScore * 100).toFixed(0)}% resonance across ${top.usageCount} sessions)`);
    }

    // Modality preference
    insights.push(`Responds best to ${profile.preferredModality} approaches`);

    // Entry point
    insights.push(`Optimal therapeutic entry: ${profile.optimalEntry.replace('-', ' ')}`);

    // Trending frameworks
    const improving = profile.frameworkEffectiveness.filter(fe => fe.recentTrend === 'improving' && fe.usageCount >= 2);
    if (improving.length > 0) {
      insights.push(`Growing effectiveness: ${improving.map(fe => fe.framework).join(', ')}`);
    }

    // Low effectiveness warning
    if (profile.leastEffectiveFrameworks.length > 0) {
      const least = profile.frameworkEffectiveness.find(fe => fe.framework === profile.leastEffectiveFrameworks[0]);
      if (least && least.usageCount >= 3 && least.resonanceScore < 0.4) {
        insights.push(`${least.framework} showing limited effectiveness - consider alternative approaches`);
      }
    }

    return insights;
  }

  /**
   * Generate adaptations
   */
  private generateAdaptations(profile: ResonanceProfile): string[] {
    const adaptations: string[] = [];

    if (profile.learningConfidence < 0.3) {
      adaptations.push('Using standard best-practice approach while learning individual patterns');
      return adaptations;
    }

    // Emphasize what works
    adaptations.push(`Emphasizing ${profile.topFrameworks.slice(0, 2).join(' and ')} based on proven effectiveness`);

    // De-emphasize what doesn't
    const ineffective = profile.frameworkEffectiveness.find(
      fe => fe.usageCount >= 3 && fe.resonanceScore < 0.3
    );
    if (ineffective) {
      adaptations.push(`De-emphasizing ${ineffective.framework} - showing limited resonance`);
    }

    // Pacing adaptation
    if (profile.pacing === 'slow') {
      adaptations.push('Using slower pacing with extra titration based on observed sensitivity');
    }

    return adaptations;
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(profile: ResonanceProfile, extraction: ExtractionResult): string[] {
    const steps: string[] = [];

    // Based on top framework
    const top = profile.topFrameworks[0];

    steps.push(`Continue with ${top}-centered approach (proven effective)`);

    // Explore emerging
    const emerging = profile.frameworkEffectiveness.find(
      fe => fe.recentTrend === 'improving' && !profile.topFrameworks.includes(fe.framework)
    );
    if (emerging) {
      steps.push(`Explore ${emerging.framework} more deeply (showing promise)`);
    }

    // Integration
    if (profile.learningConfidence > 0.6 && profile.topFrameworks.length >= 3) {
      steps.push(`Integrate ${profile.topFrameworks[0]} and ${profile.topFrameworks[1]} for synergistic effect`);
    }

    return steps;
  }
}

// Export singleton instance
export const frameworkResonanceLearning = new FrameworkResonanceLearningEngine();
