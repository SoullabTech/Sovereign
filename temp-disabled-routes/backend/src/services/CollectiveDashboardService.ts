/**
 * Collective Dashboard Service
 * 
 * Production service that transforms Neural Reservoir data into human-friendly
 * dashboard responses. Integrates phenomenological language mapping with expert
 * mode support. Handles caching, error fallbacks, and Maya-style copy generation.
 */

import { CollectiveIntelligence } from "../ain/collective/CollectiveIntelligence";
import { LanguageMappingService } from "./LanguageMappingService";
import { logger } from "../utils/logger";
import {
  CollectiveSnapshot,
  PatternsResponse,
  TimingResponse,
  DashboardQueryParams,
  Theme,
  ShadowSignal,
  Pattern,
  TimingWindow,
  CoherenceScore,
  DashboardError,
  RawPatternData
} from "../types/collectiveDashboard";

export class CollectiveDashboardService {
  private static instance: CollectiveDashboardService;
  private collectiveIntelligence: CollectiveIntelligence;
  private cache: Map<string, { data: any; expires: number }> = new Map();

  constructor(collectiveIntelligence: CollectiveIntelligence) {
    this.collectiveIntelligence = collectiveIntelligence;
  }

  static getInstance(collectiveIntelligence: CollectiveIntelligence): CollectiveDashboardService {
    if (!CollectiveDashboardService.instance) {
      CollectiveDashboardService.instance = new CollectiveDashboardService(collectiveIntelligence);
    }
    return CollectiveDashboardService.instance;
  }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * GET /api/collective/snapshot - one-card overview
   */
  async getSnapshot(params: DashboardQueryParams = {}): Promise<CollectiveSnapshot> {
    const cacheKey = `snapshot:${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey, 60); // 60s cache
    if (cached) return cached;

    try {
      const expertMode = params.expert || false;
      const window = params.window || "7d";
      
      // Get current field state and patterns
      const fieldState = this.collectiveIntelligence.getFieldState();
      const activePatterns = this.collectiveIntelligence.getActivePatterns();
      const analytics = this.collectiveIntelligence.getAnalytics();

      // Handle low data edge case
      if (analytics.totalStreams < 10) {
        return this.generateLowDataFallback(window, expertMode);
      }

      // Calculate coherence with trend
      const coherence = this.calculateCoherenceScore(fieldState, analytics);
      
      // Extract and map patterns
      const rawPatterns = this.extractRawPatterns(activePatterns);
      const topThemes = this.mapTopThemes(rawPatterns, expertMode).slice(0, 5);
      const emerging = this.mapEmergingThemes(rawPatterns, expertMode).slice(0, 3);
      const shadowSignals = this.mapShadowSignals(rawPatterns, expertMode).slice(0, 3);
      
      // Generate timing hint
      const timingHint = this.generateTimingHint(rawPatterns, expertMode);

      const snapshot: CollectiveSnapshot = {
        generatedAt: new Date().toISOString(),
        window,
        coherence,
        topThemes,
        emerging,
        shadowSignals,
        timingHint
      };

      this.setCache(cacheKey, snapshot, 60);
      return snapshot;

    } catch (error) {
      logger.error("Error generating collective snapshot", { error, params });
      return this.generateErrorFallback(params.window || "7d", params.expert || false);
    }
  }

  /**
   * GET /api/collective/patterns - detected waves/heatmaps
   */
  async getPatterns(params: DashboardQueryParams = {}): Promise<PatternsResponse> {
    const cacheKey = `patterns:${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey, 300); // 5min cache
    if (cached) return cached;

    try {
      const expertMode = params.expert || false;
      const window = params.window || "7d";
      const limit = params.limit || 8;

      const activePatterns = this.collectiveIntelligence.getActivePatterns();
      const patterns = this.convertToPatternItems(activePatterns, expertMode)
        .slice(0, limit);

      const response: PatternsResponse = {
        generatedAt: new Date().toISOString(),
        window,
        items: patterns
      };

      this.setCache(cacheKey, response, 300);
      return response;

    } catch (error) {
      logger.error("Error generating patterns response", { error, params });
      return {
        generatedAt: new Date().toISOString(),
        window: params.window || "7d",
        items: []
      };
    }
  }

  /**
   * GET /api/collective/timing - near-term guidance
   */
  async getTiming(params: DashboardQueryParams = {}): Promise<TimingResponse> {
    const cacheKey = `timing:${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey, 300); // 5min cache
    if (cached) return cached;

    try {
      const expertMode = params.expert || false;
      const horizon = params.horizon || "7d";

      const fieldState = this.collectiveIntelligence.getFieldState();
      const activePatterns = this.collectiveIntelligence.getActivePatterns();
      
      const windows = this.generateTimingWindows(fieldState, activePatterns, horizon, expertMode);

      const response: TimingResponse = {
        generatedAt: new Date().toISOString(),
        horizon,
        windows
      };

      this.setCache(cacheKey, response, 300);
      return response;

    } catch (error) {
      logger.error("Error generating timing response", { error, params });
      return {
        generatedAt: new Date().toISOString(),
        horizon: params.horizon || "7d",
        windows: []
      };
    }
  }

  // ==========================================================================
  // PATTERN EXTRACTION & MAPPING
  // ==========================================================================

  private extractRawPatterns(patterns: any[]): RawPatternData {
    const raw: RawPatternData = {
      elementalWaves: [],
      archetypeShifts: [],
      shadowPatterns: [],
      consciousnessLeaps: [],
      integrationPhases: []
    };

    for (const pattern of patterns) {
      switch (pattern.type) {
        case 'elemental_wave':
          const element = this.extractElementFromPattern(pattern);
          if (element) {
            raw.elementalWaves.push({
              element,
              level: this.estimateElementalLevel(pattern.strength),
              strength: pattern.strength,
              participants: pattern.participants,
              confidence: pattern.confidence
            });
          }
          break;

        case 'archetypal_shift':
          const archetype = this.extractArchetypeFromPattern(pattern);
          if (archetype) {
            raw.archetypeShifts.push({
              archetype,
              strength: pattern.strength,
              participants: pattern.participants,
              confidence: pattern.confidence
            });
          }
          break;

        case 'shadow_surfacing':
          const shadowType = this.extractShadowTypeFromPattern(pattern);
          if (shadowType) {
            raw.shadowPatterns.push({
              type: shadowType as any,
              intensity: pattern.strength,
              acceptance: 0.5, // Default acceptance level
              participants: pattern.participants
            });
          }
          break;

        case 'consciousness_leap':
          raw.consciousnessLeaps.push({
            avgIncrease: pattern.strength,
            participants: pattern.participants,
            confidence: pattern.confidence
          });
          break;

        case 'integration_phase':
          raw.integrationPhases.push({
            avgIntegration: pattern.strength,
            stability: pattern.confidence,
            participants: pattern.participants,
            confidence: pattern.confidence
          });
          break;
      }
    }

    return raw;
  }

  private mapTopThemes(raw: RawPatternData, expertMode: boolean): Theme[] {
    const themes: Theme[] = [];

    // Map elemental waves to themes
    for (const wave of raw.elementalWaves) {
      const code = `${wave.element.charAt(0).toUpperCase() + wave.element.slice(1)}-${wave.level}`;
      themes.push(LanguageMappingService.mapToTheme(code, wave.confidence, expertMode));
    }

    // Map archetype shifts
    for (const shift of raw.archetypeShifts) {
      themes.push(LanguageMappingService.mapToTheme(shift.archetype, shift.confidence, expertMode));
    }

    // Sort by strength and return top themes
    return themes.sort((a, b) => b.strength - a.strength);
  }

  private mapEmergingThemes(raw: RawPatternData, expertMode: boolean): Theme[] {
    // Focus on medium-confidence patterns that are rising
    const emerging: Theme[] = [];

    for (const wave of raw.elementalWaves.filter(w => w.confidence > 0.5 && w.confidence < 0.8)) {
      const code = `${wave.element.charAt(0).toUpperCase() + wave.element.slice(1)}-${wave.level}`;
      emerging.push(LanguageMappingService.mapToTheme(code, wave.confidence, expertMode));
    }

    return emerging.sort((a, b) => b.strength - a.strength);
  }

  private mapShadowSignals(raw: RawPatternData, expertMode: boolean): ShadowSignal[] {
    return raw.shadowPatterns
      .filter(p => p.intensity > 0.3) // Only significant shadow patterns
      .map(p => LanguageMappingService.mapToShadowSignal(p.type, p.intensity, expertMode))
      .sort((a, b) => b.strength - a.strength);
  }

  private convertToPatternItems(patterns: any[], expertMode: boolean): Pattern[] {
    return patterns.map(p => ({
      id: p.id,
      type: this.mapPatternKind(p.type),
      description: this.generatePatternLabel(p, expertMode),
      strength: p.confidence,
      participantCount: p.participantCount || 0,
      window: '24h'
    }));
  }

  // ==========================================================================
  // COHERENCE & METRICS CALCULATION
  // ==========================================================================

  private calculateCoherenceScore(fieldState: any, analytics: any): CoherenceScore {
    const current = fieldState.coherenceScore;
    
    // Calculate trend (simplified - would use historical data in production)
    const delta = Math.floor(Math.random() * 10 - 5); // Mock delta for now
    const trend = delta > 2 ? "rising" : delta < -2 ? "softening" : "steady";

    return {
      value: Math.round(current),
      trend,
      delta
    };
  }

  // ==========================================================================
  // TIMING & GUIDANCE GENERATION
  // ==========================================================================

  private generateTimingHint(raw: RawPatternData, expertMode: boolean): any {
    const dominantElements = raw.elementalWaves
      .filter(w => w.strength > 0.6)
      .map(w => w.element)
      .slice(0, 2);

    if (dominantElements.length === 0) return undefined;

    const confidence = raw.elementalWaves[0]?.confidence || 0.5;
    const label = LanguageMappingService.generateTimingHint(dominantElements, confidence, expertMode);

    return {
      label,
      horizon: "days" as const,
      confidence
    };
  }

  private generateTimingWindows(fieldState: any, patterns: any[], horizon: string, expertMode: boolean): TimingWindow[] {
    const windows: TimingWindow[] = [];
    
    // Generate timing windows based on field coherence and active patterns
    if (fieldState.coherenceScore > 70) {
      const now = new Date();
      const opensAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const closesAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

      windows.push({
        id: "favorable_window_1",
        label: "favorable window for honest conversations",
        opensAt: opensAt.toISOString(),
        closesAt: closesAt.toISOString(),
        confidence: 0.75,
        suggestions: [
          "speak one difficult truth gently",
          "ask for what you actually need",
          "have the conversation you've been avoiding"
        ],
        ...(expertMode && { internal: { codes: ["high_coherence", "air_clarity"] } })
      });
    }

    return windows;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private extractElementFromPattern(pattern: any): "fire" | "water" | "earth" | "air" | "aether" | null {
    // Extract element from pattern ID or elemental signature
    const elements = ["fire", "water", "earth", "air", "aether"];
    for (const element of elements) {
      if (pattern.id?.includes(element) || pattern.elementalSignature?.[element] > 0.7) {
        return element as any;
      }
    }
    return null;
  }

  private extractArchetypeFromPattern(pattern: any): string | null {
    // Extract archetype from pattern ID
    const archetypes = ["mother", "father", "child", "trickster", "sage", "warrior", "lover", "creator", "destroyer", "healer", "seeker", "guide"];
    for (const archetype of archetypes) {
      if (pattern.id?.includes(archetype)) {
        return archetype;
      }
    }
    return null;
  }

  private extractShadowTypeFromPattern(pattern: any): string | null {
    const shadowTypes = ["deflection", "victim", "perfectionism", "spiritual_bypass", "intellectualization", "control"];
    for (const type of shadowTypes) {
      if (pattern.id?.includes(type)) {
        return type;
      }
    }
    return null;
  }

  private estimateElementalLevel(strength: number): number {
    if (strength > 0.8) return 3;
    if (strength > 0.6) return 2;
    return 1;
  }

  private mapPatternKind(type: string): "theme" | "archetype" | "shadow" | "elementalWave" {
    switch (type) {
      case 'elemental_wave': return 'elementalWave';
      case 'archetypal_shift': return 'archetype'; 
      case 'shadow_surfacing': return 'shadow';
      default: return 'theme';
    }
  }

  private generatePatternLabel(pattern: any, expertMode: boolean): string {
    // Use the pattern's likelyProgression or generate from type
    return pattern.likelyProgression || this.humanizePatternType(pattern.type);
  }

  private humanizePatternType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private calculateMomentum(pattern: any): "rising" | "stable" | "fading" {
    // Simplified momentum calculation - would use trend analysis in production
    if (pattern.confidence > 0.8) return "rising";
    if (pattern.confidence < 0.5) return "fading";
    return "stable";
  }

  // ==========================================================================
  // FALLBACK & ERROR HANDLING
  // ==========================================================================

  private generateLowDataFallback(window: string, expertMode: boolean): CollectiveSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      window: window as any,
      coherence: { value: 50, trend: "steady", delta: 0 },
      topThemes: [
        {
          id: "theme.gentle_beginning",
          label: "gentle rhythms / community forming",
          confidence: 0.6,
          ...(expertMode && { internal: { code: "low_data_default" } })
        }
      ],
      emerging: [],
      shadowSignals: [],
      timingHint: {
        label: "patient attention favors natural unfolding",
        horizon: "days",
        confidence: 0.5
      }
    };
  }

  private generateErrorFallback(window: string, expertMode: boolean): CollectiveSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      window: window as any,
      coherence: { value: 50, trend: "steady", delta: 0 },
      topThemes: [],
      emerging: [],
      shadowSignals: [],
      timingHint: {
        label: "systems are recalibrating - gentle patience",
        horizon: "hours",
        confidence: 0.3
      }
    };
  }

  // ==========================================================================
  // CACHING
  // ==========================================================================

  private getFromCache(key: string, maxAgeSeconds: number): any | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private setCache(key: string, data: any, ageSeconds: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ageSeconds * 1000)
    });
  }
}