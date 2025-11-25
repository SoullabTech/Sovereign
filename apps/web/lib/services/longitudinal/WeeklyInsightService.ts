import { supabase } from "@/lib/supabase/client";
import {
  WeeklyInsight,
  ElementalDistribution,
  FacetTransition,
  ShadowPattern,
  NarrativeArc,
  Practice,
  CollectiveTheme,
  SpiralPath
} from "@/lib/spiralogic/types/LongitudinalTypes";

/**
 * WeeklyInsightService - Phase 2 Feature
 * Generates weekly psychological and symbolic insights from user journey data
 */
export class WeeklyInsightService {
  private readonly MINIMUM_ENTRIES_FOR_INSIGHT = 3;

  /**
   * Generate a weekly insight for a user
   * @param userId - The user to generate insights for
   * @returns WeeklyInsight or null if insufficient data
   */
  async generateWeeklyInsight(userId: string): Promise<WeeklyInsight | null> {
    // Phase 1: Return null (feature disabled)
    if (!process.env.NEXT_PUBLIC_ENABLE_WEEKLY_INSIGHTS) {
      return null;
    }

    try {
      // Get the date range for the past week
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      // Fetch conversation snapshots for the week
      const { data: snapshots, error } = await supabase
        .from("conversation_snapshots")
        .select("*")
        .eq("user_id", userId)
        .gte("snapshot_date", startDate.toISOString())
        .lte("snapshot_date", endDate.toISOString())
        .order("snapshot_date", { ascending: true });

      if (error) {
        console.error("Error fetching snapshots:", error);
        return null;
      }

      // Check if we have enough data
      if (!snapshots || snapshots.length < this.MINIMUM_ENTRIES_FOR_INSIGHT) {
        return this.generateEmptyInsight(userId, startDate, endDate);
      }

      // Generate insight components
      const elementalBalance = this.calculateElementalBalance(snapshots);
      const facetProgression = this.detectFacetTransitions(snapshots);
      const shadowPatterns = this.identifyShadowPatterns(snapshots);
      const growthArc = this.determineGrowthArc(snapshots);
      const spiralPath = this.generateSpiralPath(snapshots);
      const theme = this.synthesizeWeeklyTheme(elementalBalance, facetProgression);
      const practice = this.suggestIntegrationPractice(elementalBalance, growthArc);
      const collectiveResonance = await this.getCollectiveResonance(elementalBalance);

      const insight: WeeklyInsight = {
        id: crypto.randomUUID(),
        userId,
        period: { start: startDate, end: endDate },
        theme,
        spiralJourney: spiralPath,
        elementalBalance,
        facetProgression,
        shadowWork: shadowPatterns,
        growthArc,
        collectiveResonance,
        integrationPractice: practice,
        rawSummary: this.generateNarrativeSummary(theme, elementalBalance, growthArc)
      };

      // Store the insight
      await this.storeInsight(insight);

      return insight;
    } catch (error) {
      console.error("Error generating weekly insight:", error);
      return null;
    }
  }

  /**
   * Get historical insights for a user
   */
  async getInsightHistory(userId: string, limit = 12): Promise<WeeklyInsight[]> {
    if (!process.env.NEXT_PUBLIC_ENABLE_WEEKLY_INSIGHTS) {
      return [];
    }

    const { data, error } = await supabase
      .from("weekly_insights")
      .select("*")
      .eq("user_id", userId)
      .order("week_start", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching insight history:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Calculate elemental distribution from snapshots
   */
  private calculateElementalBalance(snapshots: any[]): ElementalDistribution {
    const counts = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const total = snapshots.length;

    snapshots.forEach(snapshot => {
      const element = snapshot.dominant_element?.toLowerCase();
      if (element && element in counts) {
        counts[element as keyof typeof counts]++;
      }
    });

    // Convert to percentages
    return Object.keys(counts).reduce((acc, key) => {
      acc[key as keyof ElementalDistribution] = Math.round((counts[key as keyof typeof counts] / total) * 100);
      return acc;
    }, {} as ElementalDistribution);
  }

  /**
   * Detect facet transitions between snapshots
   */
  private detectFacetTransitions(snapshots: any[]): FacetTransition[] {
    const transitions: FacetTransition[] = [];

    for (let i = 1; i < snapshots.length; i++) {
      const prevFacets = snapshots[i - 1].active_facets || [];
      const currFacets = snapshots[i].active_facets || [];

      // Find the primary transition
      if (prevFacets[0] && currFacets[0] && prevFacets[0] !== currFacets[0]) {
        transitions.push({
          from: prevFacets[0],
          to: currFacets[0],
          timestamp: new Date(snapshots[i].snapshot_date),
          significance: this.calculateTransitionSignificance(prevFacets[0], currFacets[0])
        });
      }
    }

    return transitions;
  }

  /**
   * Identify shadow patterns from the week
   */
  private identifyShadowPatterns(snapshots: any[]): ShadowPattern[] {
    const shadowThemes = new Map<string, ShadowPattern>();

    snapshots.forEach(snapshot => {
      const symbols = snapshot.symbols_present || [];
      symbols.forEach((symbol: string) => {
        if (this.isShadowSymbol(symbol)) {
          const existing = shadowThemes.get(symbol);
          if (existing) {
            existing.frequency++;
            existing.lastOccurrence = new Date(snapshot.snapshot_date);
          } else {
            shadowThemes.set(symbol, {
              theme: symbol,
              frequency: 1,
              lastOccurrence: new Date(snapshot.snapshot_date),
              context: [snapshot.dominant_element || "unknown"]
            });
          }
        }
      });
    });

    return Array.from(shadowThemes.values());
  }

  /**
   * Determine the growth arc for the week
   */
  private determineGrowthArc(snapshots: any[]): NarrativeArc {
    if (snapshots.length < 2) {
      return {
        type: "emergence",
        narrative: "Beginning to explore",
        keyMoments: []
      };
    }

    const firstElement = snapshots[0].dominant_element;
    const lastElement = snapshots[snapshots.length - 1].dominant_element;
    const emotionalProgression = snapshots.map(s => s.emotional_tone || 0);

    // Simple pattern detection
    if (firstElement === "water" && lastElement === "fire") {
      return {
        type: "transformation",
        narrative: "Moving from introspection to action",
        keyMoments: snapshots.map(s => new Date(s.snapshot_date))
      };
    } else if (this.isIntegrationPattern(emotionalProgression)) {
      return {
        type: "integration",
        narrative: "Bringing shadow into light",
        keyMoments: this.findKeyMoments(snapshots)
      };
    }

    return {
      type: "emergence",
      narrative: `Exploring the transition from ${firstElement} to ${lastElement}`,
      keyMoments: this.findKeyMoments(snapshots)
    };
  }

  /**
   * Generate spiral path visualization data
   */
  private generateSpiralPath(snapshots: any[]): SpiralPath {
    const points = snapshots.map((snapshot, index) => {
      const angle = (index / snapshots.length) * Math.PI * 2;
      const radius = 50 + index * 10;
      return {
        date: new Date(snapshot.snapshot_date),
        element: snapshot.dominant_element || "unknown",
        intensity: Math.abs(snapshot.emotional_tone || 0.5),
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
    });

    return { points };
  }

  /**
   * Synthesize the weekly theme
   */
  private synthesizeWeeklyTheme(
    elemental: ElementalDistribution,
    transitions: FacetTransition[]
  ): string {
    const dominantElement = Object.entries(elemental)
      .sort(([, a], [, b]) => b - a)[0][0];

    if (transitions.length > 3) {
      return `A week of dynamic transformation through ${dominantElement}`;
    } else if (transitions.length > 0) {
      return `Deepening into ${dominantElement} wisdom`;
    }

    return `Exploring the depths of ${dominantElement}`;
  }

  /**
   * Suggest an integration practice
   */
  private suggestIntegrationPractice(
    elemental: ElementalDistribution,
    growthArc: NarrativeArc
  ): Practice {
    const dominantElement = Object.entries(elemental)
      .sort(([, a], [, b]) => b - a)[0][0];

    const practices: Record<string, Practice> = {
      fire: {
        title: "Creative Expression Practice",
        description: "Channel your fire energy through spontaneous creative expression",
        element: "fire",
        duration: "15 minutes"
      },
      water: {
        title: "Emotional Flow Meditation",
        description: "Sit with your emotions, letting them flow without judgment",
        element: "water",
        duration: "20 minutes"
      },
      earth: {
        title: "Grounding Ritual",
        description: "Connect with the earth through mindful walking or gardening",
        element: "earth",
        duration: "30 minutes"
      },
      air: {
        title: "Breathwork Journey",
        description: "Use conscious breathing to clarify your thoughts",
        element: "air",
        duration: "10 minutes"
      },
      aether: {
        title: "Sacred Pause",
        description: "Create space for mystery and the unknown",
        element: "aether",
        duration: "Variable"
      }
    };

    return practices[dominantElement] || practices.aether;
  }

  /**
   * Get collective resonance patterns (privacy-preserved)
   */
  private async getCollectiveResonance(
    elemental: ElementalDistribution
  ): Promise<CollectiveTheme | undefined> {
    // Phase 2: Query aggregated anonymous patterns
    // For now, return a placeholder
    return {
      pattern: "Many are navigating water phases this week",
      prevalence: 32,
      anonymous: true
    };
  }

  /**
   * Generate empty insight for insufficient data
   */
  private generateEmptyInsight(
    userId: string,
    startDate: Date,
    endDate: Date
  ): WeeklyInsight {
    return {
      id: crypto.randomUUID(),
      userId,
      period: { start: startDate, end: endDate },
      theme: "Awaiting more entries",
      spiralJourney: { points: [] },
      elementalBalance: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
      facetProgression: [],
      shadowWork: [],
      growthArc: {
        type: "emergence",
        narrative: "Your journey awaits",
        keyMoments: []
      },
      integrationPractice: {
        title: "Begin Your Journey",
        description: "Start with a simple reflection on your current state",
        element: "aether",
        duration: "5 minutes"
      },
      rawSummary: "Need at least 3 entries this week to generate insights"
    };
  }

  /**
   * Store insight in database
   */
  private async storeInsight(insight: WeeklyInsight): Promise<void> {
    const { error } = await supabase.from("weekly_insights").insert({
      user_id: insight.userId,
      week_start: insight.period.start,
      week_end: insight.period.end,
      theme: insight.theme,
      elemental_distribution: insight.elementalBalance,
      facet_progression: insight.facetProgression,
      shadow_patterns: insight.shadowWork,
      growth_arc: insight.growthArc.narrative,
      collective_resonance: insight.collectiveResonance,
      integration_practice: insight.integrationPractice,
      raw_summary: insight.rawSummary
    });

    if (error) {
      console.error("Error storing insight:", error);
    }
  }

  // Helper methods
  private calculateTransitionSignificance(from: string, to: string): number {
    // Simplified significance calculation
    return from !== to ? 0.5 + Math.random() * 0.5 : 0.1;
  }

  private isShadowSymbol(symbol: string): boolean {
    const shadowKeywords = ["shadow", "dark", "hidden", "fear", "shame", "guilt"];
    return shadowKeywords.some(keyword => symbol.toLowerCase().includes(keyword));
  }

  private isIntegrationPattern(tones: number[]): boolean {
    if (tones.length < 3) return false;
    // Check if emotional tone is stabilizing (decreasing variance)
    const variance = tones.reduce((acc, tone, i) => {
      if (i === 0) return acc;
      return acc + Math.abs(tone - tones[i - 1]);
    }, 0);
    return variance < tones.length * 0.2;
  }

  private findKeyMoments(snapshots: any[]): Date[] {
    // Find moments of significant emotional or elemental shift
    const moments: Date[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const toneDiff = Math.abs(
        (snapshots[i].emotional_tone || 0) -
        (snapshots[i - 1].emotional_tone || 0)
      );
      if (toneDiff > 0.5) {
        moments.push(new Date(snapshots[i].snapshot_date));
      }
    }
    return moments;
  }

  private generateNarrativeSummary(
    theme: string,
    elemental: ElementalDistribution,
    growthArc: NarrativeArc
  ): string {
    return `${theme}. ${growthArc.narrative}. The elements dance in their unique proportions.`;
  }
}

// Export singleton instance
export const weeklyInsightService = new WeeklyInsightService();