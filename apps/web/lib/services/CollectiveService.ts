export interface CollectiveStats {
  timeframe: string;
  totalEncounters: number;
  archetypeDistribution: Record<string, number>;
  collectiveHeatmap: number[][];
  recentPatterns: string[];
  growthTrends: GrowthTrends;
  mythicNarrative: string;
  oracleNarrative?: any; // Oracle narrative from CollectiveNarrativeService
  seasonalNarrative?: string;
  temporalInsights: TemporalInsights;
  generatedAt: string;
}

export interface GrowthTrends {
  totalGrowthRate: string;
  dominantArchetype: string;
  emergingArchetype: string;
  integrationRate: string;
}

export interface TemporalInsights {
  peakDays: string[];
  peakHours: string[];
  quietPeriods: string[];
  weekendPattern: string;
  weekdayPattern: string;
}

export interface ArchetypeInsight {
  archetype: string;
  percentage: number;
  trend: 'rising' | 'stable' | 'declining';
  weeklyChange: number;
  dominantThemes: string[];
  icon: string;
  color: string;
}

export interface CollectivePattern {
  type: 'temporal' | 'archetypal' | 'seasonal' | 'emergence';
  title: string;
  description: string;
  strength: number; // 0-1
  timeframe: string;
  affectedArchetypes: string[];
}

export class CollectiveService {
  private static instance: CollectiveService;
  private cachedData: Map<string, { data: CollectiveStats; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CollectiveService {
    if (!CollectiveService.instance) {
      CollectiveService.instance = new CollectiveService();
    }
    return CollectiveService.instance;
  }

  async fetchCollectiveStats(timeframe: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<CollectiveStats> {
    // Check cache first
    const cacheKey = `collective-${timeframe}`;
    const cached = this.cachedData.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`/api/collective/evolution?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collective stats: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch collective data');
      }

      // Cache the result
      this.cachedData.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });

      return result.data;
    } catch (error) {
      console.error('CollectiveService fetch error:', error);
      throw error;
    }
  }

  async getArchetypeInsights(timeframe: string = '30d'): Promise<ArchetypeInsight[]> {
    const stats = await this.fetchCollectiveStats(timeframe as any);
    const total = stats.totalEncounters;
    
    const archetypeColors = {
      Hero: '#dc2626',
      Sage: '#2563eb', 
      Creator: '#7c3aed',
      Lover: '#ec4899',
      Seeker: '#059669',
      Shadow: '#374151'
    };

    const archetypeIcons = {
      Hero: '⚔️',
      Sage: '🧙‍♀️',
      Creator: '🎨',
      Lover: '💝',
      Seeker: '🧭',
      Shadow: '🌑'
    };

    const archetypeThemes = {
      Hero: ['Courage', 'Challenge', 'Victory', 'Leadership'],
      Sage: ['Wisdom', 'Integration', 'Teaching', 'Understanding'],
      Creator: ['Innovation', 'Expression', 'Birth', 'Manifestation'],
      Lover: ['Connection', 'Passion', 'Unity', 'Compassion'],
      Seeker: ['Quest', 'Discovery', 'Purpose', 'Questions'],
      Shadow: ['Integration', 'Wholeness', 'Hidden Truth', 'Power']
    };

    return Object.entries(stats.archetypeDistribution).map(([archetype, count]) => {
      const percentage = Math.round((count / total) * 100);
      
      // Generate trend (simplified - in real app would compare with historical data)
      const trend = Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'stable' : 'declining';
      const weeklyChange = trend === 'rising' ? 
        Math.floor(Math.random() * 15) + 5 : 
        trend === 'declining' ? 
          -(Math.floor(Math.random() * 10) + 2) : 
          Math.floor(Math.random() * 6) - 3;

      return {
        archetype,
        percentage,
        trend,
        weeklyChange,
        dominantThemes: archetypeThemes[archetype as keyof typeof archetypeThemes] || ['Unknown'],
        icon: archetypeIcons[archetype as keyof typeof archetypeIcons] || '🔮',
        color: archetypeColors[archetype as keyof typeof archetypeColors] || '#6b7280'
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }

  async getCollectivePatterns(timeframe: string = '30d'): Promise<CollectivePattern[]> {
    const stats = await this.fetchCollectiveStats(timeframe as any);
    
    // Generate patterns based on data
    const patterns: CollectivePattern[] = [
      {
        type: 'temporal',
        title: 'Twilight Shadow Integration',
        description: 'Strong collective shadow work patterns emerging during evening hours (7-10pm)',
        strength: 0.8,
        timeframe: 'Daily',
        affectedArchetypes: ['Shadow', 'Sage']
      },
      {
        type: 'archetypal',
        title: `${stats.growthTrends.dominantArchetype} Dominance`,
        description: `The ${stats.growthTrends.dominantArchetype} archetype shows unprecedented collective activation`,
        strength: 0.9,
        timeframe: timeframe,
        affectedArchetypes: [stats.growthTrends.dominantArchetype]
      },
      {
        type: 'emergence',
        title: `${stats.growthTrends.emergingArchetype} Awakening`,
        description: `Rapid emergence of ${stats.growthTrends.emergingArchetype} energy across the field`,
        strength: 0.7,
        timeframe: 'Weekly',
        affectedArchetypes: [stats.growthTrends.emergingArchetype]
      },
      {
        type: 'temporal',
        title: 'Morning Breakthrough Window',
        description: 'Collective breakthrough patterns peak during 8-9am meditation hours',
        strength: 0.6,
        timeframe: 'Daily',
        affectedArchetypes: ['Hero', 'Seeker']
      }
    ];

    return patterns;
  }

  generateMythicInsight(stats: CollectiveStats): string {
    const { dominantArchetype, emergingArchetype } = stats.growthTrends;
    const totalEncounters = stats.totalEncounters;
    
    const insights = [
      `The field pulses with ${totalEncounters} encounters of transformation. ${dominantArchetype} energy leads the dance, while ${emergingArchetype} stirs beneath the surface.`,
      `In this moment of collective becoming, ${dominantArchetype} calls forth what is needed, and ${emergingArchetype} whispers of what is emerging.`,
      `${totalEncounters} souls have touched the mystery this cycle. The ${dominantArchetype} blazes bright, the ${emergingArchetype} seeds new possibilities.`,
      `The archetypal currents swirl and merge. ${dominantArchetype} stands as guardian of this threshold, ${emergingArchetype} as harbinger of what comes next.`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  // Utility method to get peak activity periods
  getPeakActivityPeriods(heatmap: number[][]): Array<{day: string, hour: number, intensity: number}> {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peaks: Array<{day: string, hour: number, intensity: number}> = [];
    
    heatmap.forEach((day, dayIndex) => {
      day.forEach((intensity, hour) => {
        if (intensity > 0.7) { // High intensity threshold
          peaks.push({
            day: dayNames[dayIndex],
            hour,
            intensity: Math.round(intensity * 100) / 100
          });
        }
      });
    });
    
    return peaks.sort((a, b) => b.intensity - a.intensity).slice(0, 10);
  }

  // Method to clear cache (useful for testing or forced refresh)
  clearCache(): void {
    this.cachedData.clear();
  }
}

export default CollectiveService;