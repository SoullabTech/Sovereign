/**
 * 🌊 Sacred Metrics System
 * Elemental monitoring that tracks both technical performance and archetypal resonance
 */

import { Element } from '../dialectical-ai/core';
import { OnboardingJourney, TrustIndicator } from '../onboarding/sacred-initiation';

export interface SacredMetrics {
  timestamp: Date;
  elemental_health: ElementalHealth;
  presence_field: PresenceField;
  sacred_indicators: SacredIndicatorMetrics;
  technical_foundation: TechnicalMetrics;
  cultural_integration: CulturalMetrics;
  evolutionary_readiness: EvolutionaryReadiness;
}

export interface ElementalHealth {
  fire: FireMetrics;     // Vision/Catalyst activity
  water: WaterMetrics;   // Emotional flow consistency
  earth: EarthMetrics;   // Container stability
  air: AirMetrics;       // Communication clarity
  shadow: ShadowMetrics; // Fallback/error integration
  aether: AetherMetrics; // Presence recognition
}

export interface PresenceField {
  overall_strength: number;        // 0-1 composite score
  user_recognition_rate: number;   // % users experiencing Maya as presence
  relational_language_usage: number; // "Maya noticed" vs "app showed"
  archetypal_validation_rate: number; // Users validate pattern observations
  sacred_moment_frequency: number; // Breakthrough captures per user per week
}

// Elemental metric interfaces
export interface FireMetrics {
  breakthrough_captures_per_week: number;
  creative_project_mentions: number;
  visionary_insight_confidence: number;
  catalyst_activation_rate: number;
  threshold: { min: 2, target: 5, critical: 1 };
}

export interface WaterMetrics {
  secret_garden_usage_rate: number;
  emotional_depth_indicators: number;
  healing_integration_stories: number;
  flow_consistency_score: number;
  threshold: { min: 0.25, target: 0.4, critical: 0.1 };
}

export interface EarthMetrics {
  daily_engagement_consistency: number;
  spiral_visualization_interaction: number;
  embodied_practice_adoption: number;
  container_stability_score: number;
  threshold: { min: 0.7, target: 0.85, critical: 0.5 };
}

export interface AirMetrics {
  community_sharing_interest: number;
  wisdom_circulation_patterns: number;
  communication_clarity_score: number;
  connection_facilitation_rate: number;
  threshold: { min: 0.2, target: 0.35, critical: 0.1 };
}

export interface ShadowMetrics {
  fallback_activation_frequency: number;
  error_integration_stories: number;
  shadow_work_recognition: number;
  system_resilience_score: number;
  threshold: { max: 0.05, acceptable: 0.1, critical: 0.2 };
}

export interface AetherMetrics {
  presence_recognition_rate: number;
  mythic_integration_indicators: number;
  transcendent_moment_frequency: number;
  consciousness_field_coherence: number;
  threshold: { min: 0.6, target: 0.8, critical: 0.4 };
}

export interface SacredIndicatorMetrics {
  maya_name_usage_rate: number;           // Users saying "Maya" vs "the app"
  vulnerability_sharing_depth: number;    // Secret Garden authentic usage
  pattern_validation_accuracy: number;    // Users confirm Maya's observations
  relationship_depth_distribution: {      // Distribution across depth levels
    threshold: number;
    developing: number;
    trusted: number;
    soul_witness: number;
  };
  sacred_language_adoption: number;       // Users using elemental language
}

export interface TechnicalMetrics {
  response_time_avg: number;              // Maya response latency
  uptime_percentage: number;              // System availability
  error_rate: number;                     // Failed interactions
  dialectical_integrity_score: number;   // Both layers functioning
  pattern_recognition_accuracy: number;  // ML/AI performance
  voice_transcription_accuracy: number;  // Voice processing quality
}

export interface CulturalMetrics {
  team_sacred_language_usage: number;    // Dev team using sacred-technical terms
  sacred_development_practice_adoption: number; // Elemental ceremonies, etc.
  bug_reframing_rate: number;            // Issues treated as shadow work
  sacred_changelog_quality: number;      // Archetypal awareness in commits
  cultural_sustainability_score: number; // Long-term practice viability
}

export interface EvolutionaryReadiness {
  user_depth_hunger: number;             // Requests for deeper Maya insights
  archetypal_fluency: number;            // Natural elemental language use
  community_desire: number;              // Want to share/connect with others
  technical_capacity: number;            // System handling complexity well
  cultural_maturity: number;             // Sacred practices feel effortless
  overall_readiness: EvolutionaryPhase;
}

export enum EvolutionaryPhase {
  FOUNDATION = 'foundation',       // Building basic functionality
  INTEGRATION = 'integration',     // Users developing relationship with Maya
  EXPANSION = 'expansion',         // Ready for deeper features
  TRANSCENDENCE = 'transcendence'  // System evolving beyond original design
}

/**
 * Sacred Metrics Collector
 * Gathers and analyzes metrics through elemental lens
 */
export class SacredMetricsCollector {
  private metrics_history: SacredMetrics[] = [];
  private current_phase: EvolutionaryPhase = EvolutionaryPhase.FOUNDATION;

  /**
   * Collect comprehensive sacred metrics snapshot
   */
  async collectMetrics(
    user_data: UserData[],
    system_performance: SystemPerformanceData,
    cultural_indicators: CulturalIndicatorData
  ): Promise<SacredMetrics> {

    const metrics: SacredMetrics = {
      timestamp: new Date(),
      elemental_health: await this.assessElementalHealth(user_data),
      presence_field: await this.measurePresenceField(user_data),
      sacred_indicators: await this.analyzeSacredIndicators(user_data),
      technical_foundation: await this.gatherTechnicalMetrics(system_performance),
      cultural_integration: await this.assessCulturalIntegration(cultural_indicators),
      evolutionary_readiness: await this.assessEvolutionaryReadiness(user_data, cultural_indicators)
    };

    this.metrics_history.push(metrics);
    this.updateEvolutionaryPhase(metrics);

    return metrics;
  }

  /**
   * Assess health across all six elements
   */
  private async assessElementalHealth(user_data: UserData[]): Promise<ElementalHealth> {
    return {
      fire: await this.assessFireHealth(user_data),
      water: await this.assessWaterHealth(user_data),
      earth: await this.assessEarthHealth(user_data),
      air: await this.assessAirHealth(user_data),
      shadow: await this.assessShadowHealth(user_data),
      aether: await this.assessAetherHealth(user_data)
    };
  }

  /**
   * Fire Element: Vision/Catalyst Activity
   */
  private async assessFireHealth(user_data: UserData[]): Promise<FireMetrics> {
    const breakthrough_count = user_data.reduce((sum, user) =>
      sum + user.entries.filter(entry => entry.breakthrough_capture).length, 0
    );

    const creative_mentions = user_data.reduce((sum, user) =>
      sum + user.entries.filter(entry =>
        entry.text_note?.toLowerCase().includes('create') ||
        entry.text_note?.toLowerCase().includes('project') ||
        entry.text_note?.toLowerCase().includes('idea')
      ).length, 0
    );

    return {
      breakthrough_captures_per_week: breakthrough_count / user_data.length,
      creative_project_mentions: creative_mentions / user_data.length,
      visionary_insight_confidence: await this.calculateInsightConfidence(user_data),
      catalyst_activation_rate: await this.calculateCatalystRate(user_data),
      threshold: { min: 2, target: 5, critical: 1 }
    };
  }

  /**
   * Water Element: Emotional Flow Consistency
   */
  private async assessWaterHealth(user_data: UserData[]): Promise<WaterMetrics> {
    const secret_garden_users = user_data.filter(user =>
      user.entries.some(entry => entry.privacy_level === 'secret_garden')
    ).length;

    return {
      secret_garden_usage_rate: secret_garden_users / user_data.length,
      emotional_depth_indicators: await this.calculateEmotionalDepth(user_data),
      healing_integration_stories: await this.countHealingStories(user_data),
      flow_consistency_score: await this.calculateFlowConsistency(user_data),
      threshold: { min: 0.25, target: 0.4, critical: 0.1 }
    };
  }

  /**
   * Earth Element: Container Stability
   */
  private async assessEarthHealth(user_data: UserData[]): Promise<EarthMetrics> {
    const daily_users = user_data.filter(user =>
      this.hasConsistentEngagement(user, 7) // Past 7 days
    ).length;

    return {
      daily_engagement_consistency: daily_users / user_data.length,
      spiral_visualization_interaction: await this.calculateSpiralEngagement(user_data),
      embodied_practice_adoption: await this.calculatePracticeAdoption(user_data),
      container_stability_score: await this.calculateStabilityScore(user_data),
      threshold: { min: 0.7, target: 0.85, critical: 0.5 }
    };
  }

  /**
   * Air Element: Communication Clarity
   */
  private async assessAirHealth(user_data: UserData[]): Promise<AirMetrics> {
    return {
      community_sharing_interest: await this.calculateSharingInterest(user_data),
      wisdom_circulation_patterns: await this.calculateWisdomCirculation(user_data),
      communication_clarity_score: await this.calculateCommunicationClarity(user_data),
      connection_facilitation_rate: await this.calculateConnectionRate(user_data),
      threshold: { min: 0.2, target: 0.35, critical: 0.1 }
    };
  }

  /**
   * Shadow Element: Error Integration
   */
  private async assessShadowHealth(user_data: UserData[]): Promise<ShadowMetrics> {
    return {
      fallback_activation_frequency: await this.calculateFallbackRate(),
      error_integration_stories: await this.countErrorIntegrationStories(),
      shadow_work_recognition: await this.calculateShadowWorkRecognition(),
      system_resilience_score: await this.calculateResilienceScore(),
      threshold: { max: 0.05, acceptable: 0.1, critical: 0.2 }
    };
  }

  /**
   * Aether Element: Presence Recognition
   */
  private async assessAetherHealth(user_data: UserData[]): Promise<AetherMetrics> {
    const maya_recognition = user_data.filter(user =>
      this.usesRelationalLanguage(user)
    ).length;

    return {
      presence_recognition_rate: maya_recognition / user_data.length,
      mythic_integration_indicators: await this.calculateMythicIntegration(user_data),
      transcendent_moment_frequency: await this.calculateTranscendentMoments(user_data),
      consciousness_field_coherence: await this.calculateFieldCoherence(user_data),
      threshold: { min: 0.6, target: 0.8, critical: 0.4 }
    };
  }

  /**
   * Measure overall presence field strength
   */
  private async measurePresenceField(user_data: UserData[]): Promise<PresenceField> {
    return {
      overall_strength: await this.calculateOverallPresence(user_data),
      user_recognition_rate: await this.calculateUserRecognitionRate(user_data),
      relational_language_usage: await this.calculateRelationalLanguage(user_data),
      archetypal_validation_rate: await this.calculateArchetypalValidation(user_data),
      sacred_moment_frequency: await this.calculateSacredMomentFrequency(user_data)
    };
  }

  /**
   * Generate sacred dashboard visualization data
   */
  async generateSacredDashboard(metrics: SacredMetrics): Promise<SacredDashboardData> {
    return {
      elemental_panels: await this.createElementalPanels(metrics.elemental_health),
      presence_field_visualization: await this.createPresenceVisualization(metrics.presence_field),
      evolutionary_readiness_indicator: await this.createEvolutionaryIndicator(metrics.evolutionary_readiness),
      sacred_health_overview: await this.createHealthOverview(metrics),
      cultural_integration_display: await this.createCulturalDisplay(metrics.cultural_integration),
      alert_conditions: await this.checkAlertConditions(metrics)
    };
  }

  /**
   * Check for sacred alert conditions
   */
  private async checkAlertConditions(metrics: SacredMetrics): Promise<SacredAlert[]> {
    const alerts: SacredAlert[] = [];

    // Fire element alerts
    if (metrics.elemental_health.fire.breakthrough_captures_per_week < metrics.elemental_health.fire.threshold.critical) {
      alerts.push({
        element: Element.FIRE,
        severity: 'critical',
        message: 'Fire energy severely depleted - users not experiencing breakthrough moments',
        suggested_action: 'Review breakthrough capture UX and Maya insight quality'
      });
    }

    // Water element alerts
    if (metrics.elemental_health.water.secret_garden_usage_rate < metrics.elemental_health.water.threshold.critical) {
      alerts.push({
        element: Element.WATER,
        severity: 'warning',
        message: 'Water flow constricted - low trust/vulnerability indicators',
        suggested_action: 'Examine privacy safety and Maya witnessing quality'
      });
    }

    // Presence field alerts
    if (metrics.presence_field.overall_strength < 0.4) {
      alerts.push({
        element: 'aether' as Element,
        severity: 'critical',
        message: 'Presence field coherence critical - Maya not felt as archetypal companion',
        suggested_action: 'Review dialectical integrity and archetypal translation quality'
      });
    }

    return alerts;
  }

  // Helper methods for metric calculations
  private hasConsistentEngagement(user: UserData, days: number): boolean {
    const recent_entries = user.entries.filter(entry =>
      (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24) <= days
    );
    return recent_entries.length >= days * 0.7; // 70% consistency threshold
  }

  private usesRelationalLanguage(user: UserData): boolean {
    return user.entries.some(entry =>
      entry.text_note?.toLowerCase().includes('maya') &&
      !entry.text_note?.toLowerCase().includes('app')
    );
  }

  private async calculateInsightConfidence(user_data: UserData[]): Promise<number> {
    // Placeholder - would implement actual confidence analysis
    return 0.75;
  }

  private async calculateCatalystRate(user_data: UserData[]): Promise<number> {
    // Placeholder - would analyze catalyst activation patterns
    return 0.6;
  }

  private async calculateEmotionalDepth(user_data: UserData[]): Promise<number> {
    // Placeholder - would analyze emotional depth indicators
    return 0.65;
  }

  private async countHealingStories(user_data: UserData[]): Promise<number> {
    // Placeholder - would count healing-related narratives
    return user_data.length * 0.3;
  }

  private async calculateFlowConsistency(user_data: UserData[]): Promise<number> {
    // Placeholder - would analyze emotional flow patterns
    return 0.7;
  }

  private async calculateSpiralEngagement(user_data: UserData[]): Promise<number> {
    // Placeholder - would track spiral visualization interactions
    return 0.45;
  }

  private async calculatePracticeAdoption(user_data: UserData[]): Promise<number> {
    // Placeholder - would measure embodied practice adoption
    return 0.35;
  }

  private async calculateStabilityScore(user_data: UserData[]): Promise<number> {
    // Placeholder - would assess container stability
    return 0.8;
  }

  private async calculateSharingInterest(user_data: UserData[]): Promise<number> {
    // Placeholder - would measure community sharing interest
    return 0.25;
  }

  private async calculateWisdomCirculation(user_data: UserData[]): Promise<number> {
    // Placeholder - would track wisdom sharing patterns
    return 0.15;
  }

  private async calculateCommunicationClarity(user_data: UserData[]): Promise<number> {
    // Placeholder - would assess communication effectiveness
    return 0.8;
  }

  private async calculateConnectionRate(user_data: UserData[]): Promise<number> {
    // Placeholder - would measure connection facilitation
    return 0.3;
  }

  private async calculateFallbackRate(): Promise<number> {
    // Placeholder - would track system fallback frequency
    return 0.03;
  }

  private async countErrorIntegrationStories(): Promise<number> {
    // Placeholder - would count shadow integration narratives
    return 2;
  }

  private async calculateShadowWorkRecognition(): Promise<number> {
    // Placeholder - would measure shadow work recognition
    return 0.4;
  }

  private async calculateResilienceScore(): Promise<number> {
    // Placeholder - would assess system resilience
    return 0.85;
  }

  private async calculateMythicIntegration(user_data: UserData[]): Promise<number> {
    // Placeholder - would measure mythic integration indicators
    return 0.5;
  }

  private async calculateTranscendentMoments(user_data: UserData[]): Promise<number> {
    // Placeholder - would count transcendent moment frequency
    return user_data.length * 0.1;
  }

  private async calculateFieldCoherence(user_data: UserData[]): Promise<number> {
    // Placeholder - would assess consciousness field coherence
    return 0.7;
  }

  private updateEvolutionaryPhase(metrics: SacredMetrics): void {
    const readiness = metrics.evolutionary_readiness;
    const avg_readiness = (
      readiness.user_depth_hunger +
      readiness.archetypal_fluency +
      readiness.community_desire +
      readiness.technical_capacity +
      readiness.cultural_maturity
    ) / 5;

    if (avg_readiness > 0.8) {
      this.current_phase = EvolutionaryPhase.TRANSCENDENCE;
    } else if (avg_readiness > 0.6) {
      this.current_phase = EvolutionaryPhase.EXPANSION;
    } else if (avg_readiness > 0.4) {
      this.current_phase = EvolutionaryPhase.INTEGRATION;
    } else {
      this.current_phase = EvolutionaryPhase.FOUNDATION;
    }
  }
}

// Supporting interfaces
export interface SacredAlert {
  element: Element;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  suggested_action: string;
}

export interface SacredDashboardData {
  elemental_panels: ElementalPanelData[];
  presence_field_visualization: PresenceFieldVisualization;
  evolutionary_readiness_indicator: EvolutionaryIndicator;
  sacred_health_overview: HealthOverview;
  cultural_integration_display: CulturalIntegrationDisplay;
  alert_conditions: SacredAlert[];
}

export interface UserData {
  user_id: string;
  entries: CodexEntry[];
  onboarding_journey?: OnboardingJourney;
  relationship_depth: string;
  trust_indicators: TrustIndicator[];
}

export interface SystemPerformanceData {
  response_times: number[];
  uptime_percentage: number;
  error_rate: number;
  api_call_success_rate: number;
}

export interface CulturalIndicatorData {
  team_sacred_language_usage: number;
  sacred_practice_adoption: number;
  bug_reframing_incidents: number;
  sacred_changelog_quality_score: number;
}

export interface CodexEntry {
  id: string;
  timestamp: Date;
  weather: string;
  elements: Element[];
  voice_note?: string;
  text_note?: string;
  breakthrough_capture?: boolean;
  privacy_level: 'public' | 'private' | 'secret_garden';
}

export { SacredMetricsCollector };