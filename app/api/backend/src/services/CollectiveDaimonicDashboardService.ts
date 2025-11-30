/**
 * Collective Daimonic Dashboard Service
 * Transforms raw collective field data into phenomenological dashboard insights
 * Maintains irreducible otherness while revealing collective patterns
 */

import { CollectiveDaimonicFieldService } from './CollectiveDaimonicFieldService.js';

export interface DashboardSnapshot {
  timestamp: Date;
  fieldIntensity: number;
  avgTension: number;
  avgSurprise: number;
  avgTricksterRisk: number;
  dominantArchetypes: ArchetypeActivity[];
  weatherCondition: 'ordinary' | 'charged' | 'clear' | 'stormy';
  transmissionQuality: 'clear' | 'riddles' | 'static' | 'silence';
}

export interface ArchetypeActivity {
  archetype: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  phase: string;
  frequency: number;
  intensity: number;
  recentThemes: string[];
}

export interface SynchronisticResonance {
  id: string;
  theme: string;
  participantCount: number;
  timeWindow: string;
  resonanceStrength: number;
  emergentPattern: string;
}

export interface SeasonalCorrelation {
  lunarPhase: 'new' | 'waxing' | 'full' | 'waning';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  date: Date;
  daimonIntensity: number;
  elementalEmphasis: string[];
  tricksterActivity: number;
}

export interface DashboardData {
  currentSnapshot: DashboardSnapshot;
  fieldHistory: DashboardSnapshot[];
  archetypalMap: ArchetypeActivity[];
  synchronisticClusters: SynchronisticResonance[];
  seasonalPatterns: SeasonalCorrelation[];
  transmissionStatus: TransmissionStatus;
}

export interface TransmissionStatus {
  clarity: number; // 0-1
  guidance: string;
  conditions: string;
  recommendation: string;
}

export class CollectiveDaimonicDashboardService {
  constructor(
    private collectiveService: CollectiveDaimonicFieldService
  ) {}

  /**
   * Generate complete dashboard data
   */
  async generateDashboardData(): Promise<DashboardData> {
    const collectiveField = await this.collectiveService.analyzeCollectiveField();
    
    const [
      currentSnapshot,
      fieldHistory,
      archetypalMap,
      synchronisticClusters,
      seasonalPatterns,
      transmissionStatus
    ] = await Promise.all([
      this.generateCurrentSnapshot(collectiveField),
      this.generateFieldHistory(),
      this.generateArchetypalMap(collectiveField),
      this.generateSynchronisticClusters(collectiveField),
      this.generateSeasonalPatterns(),
      this.generateTransmissionStatus(collectiveField)
    ]);

    return {
      currentSnapshot,
      fieldHistory,
      archetypalMap,
      synchronisticClusters,
      seasonalPatterns,
      transmissionStatus
    };
  }

  /**
   * Generate current field snapshot
   */
  private async generateCurrentSnapshot(collectiveField: any): Promise<DashboardSnapshot> {
    const fieldIntensity = collectiveField.fieldIntensity;
    const avgTension = this.calculateAverageTension(collectiveField);
    const avgSurprise = this.calculateAverageSurprise(collectiveField);
    const avgTricksterRisk = this.calculateAverageTricksterRisk(collectiveField);
    
    const dominantArchetypes = await this.identifyDominantArchetypes(collectiveField);
    const weatherCondition = this.determineWeatherCondition(fieldIntensity, avgTricksterRisk);
    const transmissionQuality = this.determineTransmissionQuality(fieldIntensity, avgTricksterRisk);

    return {
      timestamp: new Date(),
      fieldIntensity,
      avgTension,
      avgSurprise,
      avgTricksterRisk,
      dominantArchetypes,
      weatherCondition,
      transmissionQuality
    };
  }

  /**
   * Determine weather condition based on field metrics
   */
  private determineWeatherCondition(
    fieldIntensity: number, 
    tricksterRisk: number
  ): 'ordinary' | 'charged' | 'clear' | 'stormy' {
    if (fieldIntensity < 0.3) {
      return 'ordinary';
    } else if (fieldIntensity > 0.7 && tricksterRisk > 0.6) {
      return 'stormy';
    } else if (fieldIntensity > 0.7 && tricksterRisk < 0.3) {
      return 'clear';
    } else {
      return 'charged';
    }
  }

  /**
   * Determine transmission quality
   */
  private determineTransmissionQuality(
    fieldIntensity: number, 
    tricksterRisk: number
  ): 'clear' | 'riddles' | 'static' | 'silence' {
    if (fieldIntensity < 0.2) {
      return 'silence';
    } else if (tricksterRisk > 0.7) {
      return 'riddles';
    } else if (fieldIntensity > 0.8) {
      return 'static';
    } else {
      return 'clear';
    }
  }

  /**
   * Generate archetypal activity map
   */
  private async generateArchetypalMap(collectiveField: any): Promise<ArchetypeActivity[]> {
    // This would integrate with actual archetypal tracking
    // For now, generate representative data
    return [
      {
        archetype: 'Transformation',
        element: 'water',
        phase: 'dissolution',
        frequency: 0.8,
        intensity: 0.7,
        recentThemes: ['surrender', 'letting go', 'flow']
      },
      {
        archetype: 'Initiation',
        element: 'fire',
        phase: 'confrontation',
        frequency: 0.6,
        intensity: 0.9,
        recentThemes: ['courage', 'breakthrough', 'action']
      },
      {
        archetype: 'Integration',
        element: 'earth',
        phase: 'embodiment',
        frequency: 0.4,
        intensity: 0.5,
        recentThemes: ['grounding', 'patience', 'building']
      },
      {
        archetype: 'Liberation',
        element: 'air',
        phase: 'transcendence',
        frequency: 0.3,
        intensity: 0.6,
        recentThemes: ['perspective', 'freedom', 'clarity']
      },
      {
        archetype: 'Unity',
        element: 'aether',
        phase: 'synthesis',
        frequency: 0.2,
        intensity: 0.8,
        recentThemes: ['wholeness', 'recognition', 'presence']
      }
    ];
  }

  /**
   * Generate synchronistic clusters
   */
  private async generateSynchronisticClusters(collectiveField: any): Promise<SynchronisticResonance[]> {
    const clusters: SynchronisticResonance[] = [];
    
    // Extract from collective field synchronistic connections
    if (collectiveField.synchronisticConnections?.thematicResonance) {
      for (const theme of collectiveField.synchronisticConnections.thematicResonance) {
        clusters.push({
          id: `cluster_${theme.replace(/\s+/g, '_').toLowerCase()}`,
          theme,
          participantCount: Math.floor(Math.random() * 8) + 3, // 3-10 participants
          timeWindow: '7 days',
          resonanceStrength: Math.random() * 0.6 + 0.4, // 0.4-1.0
          emergentPattern: this.generateEmergentPattern(theme)
        });
      }
    }

    return clusters.sort((a, b) => b.resonanceStrength - a.resonanceStrength);
  }

  /**
   * Generate emergent pattern description
   */
  private generateEmergentPattern(theme: string): string {
    const patterns = {
      'Authority Resistance': 'Multiple participants encountering similar authority challenges',
      'Creative Expression': 'Shared creative breakthroughs emerging simultaneously',
      'Relational Challenges': 'Common relationship patterns surfacing across participants',
      'Vocational Direction': 'Career/calling questions clustering in time'
    };
    
    return patterns[theme as keyof typeof patterns] || 
           `Collective recognition of shared ${theme.toLowerCase()} experiences`;
  }

  /**
   * Generate seasonal correlation patterns
   */
  private async generateSeasonalPatterns(): Promise<SeasonalCorrelation[]> {
    const patterns: SeasonalCorrelation[] = [];
    
    // Generate last 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const lunarPhase = this.calculateLunarPhase(date);
      const season = this.calculateSeason(date);
      
      patterns.push({
        lunarPhase,
        season,
        date,
        daimonIntensity: Math.random() * 0.8 + 0.1,
        elementalEmphasis: this.generateElementalEmphasis(season, lunarPhase),
        tricksterActivity: Math.random() * 0.6
      });
    }
    
    return patterns.reverse(); // Most recent first
  }

  /**
   * Generate transmission status
   */
  private async generateTransmissionStatus(collectiveField: any): Promise<TransmissionStatus> {
    const fieldIntensity = collectiveField.fieldIntensity;
    const avgTrickster = 0.4; // Would be calculated from actual data
    
    const clarity = Math.max(0, fieldIntensity - avgTrickster);
    const guidance = this.generateTransmissionGuidance(fieldIntensity, avgTrickster);
    const conditions = this.generateTransmissionConditions(fieldIntensity, avgTrickster);
    const recommendation = this.generateTransmissionRecommendation(clarity);

    return {
      clarity,
      guidance,
      conditions,
      recommendation
    };
  }

  /**
   * Generate transmission guidance copy
   */
  private generateTransmissionGuidance(intensity: number, trickster: number): string {
    if (intensity > 0.8 && trickster > 0.6) {
      return "The field is electric with teaching riddles. Slow down and listen carefully.";
    } else if (intensity > 0.7 && trickster < 0.3) {
      return "Conditions favor clear insight. Shared understanding is flowing freely.";
    } else if (intensity < 0.3) {
      return "The field is quiet. A time for individual work and preparation.";
    } else {
      return "Moderate activity in the field. Mixed signals require discernment.";
    }
  }

  /**
   * Generate transmission conditions
   */
  private generateTransmissionConditions(intensity: number, trickster: number): string {
    if (trickster > 0.7) {
      return "High riddle activity present";
    } else if (intensity > 0.8) {
      return "Strong field intensity";
    } else if (intensity < 0.2) {
      return "Quiet field conditions";
    } else {
      return "Balanced field activity";
    }
  }

  /**
   * Generate transmission recommendation
   */
  private generateTransmissionRecommendation(clarity: number): string {
    if (clarity > 0.7) {
      return "Excellent time for group work and shared insights";
    } else if (clarity > 0.4) {
      return "Good conditions for careful exploration";
    } else if (clarity > 0.2) {
      return "Proceed with extra attention to mixed signals";
    } else {
      return "Focus on individual practice and inner work";
    }
  }

  // Helper methods
  private calculateAverageTension(collectiveField: any): number {
    // Would calculate from actual participant tension metrics
    return Math.random() * 0.6 + 0.2;
  }

  private calculateAverageSurprise(collectiveField: any): number {
    // Would calculate from actual surprise/otherness metrics
    return Math.random() * 0.8 + 0.1;
  }

  private calculateAverageTricksterRisk(collectiveField: any): number {
    // Would calculate from actual trickster detection
    return Math.random() * 0.6 + 0.1;
  }

  private async identifyDominantArchetypes(collectiveField: any): Promise<ArchetypeActivity[]> {
    // Would analyze actual archetypal patterns
    return await this.generateArchetypalMap(collectiveField);
  }

  private calculateLunarPhase(date: Date): 'new' | 'waxing' | 'full' | 'waning' {
    // Simplified lunar calculation
    const dayOfMonth = date.getDate();
    if (dayOfMonth <= 7) return 'new';
    if (dayOfMonth <= 14) return 'waxing';
    if (dayOfMonth <= 21) return 'full';
    return 'waning';
  }

  private calculateSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  private generateElementalEmphasis(
    season: string, 
    lunarPhase: string
  ): string[] {
    const seasonalElements = {
      spring: ['air', 'water'],
      summer: ['fire', 'air'],
      autumn: ['earth', 'fire'],
      winter: ['water', 'earth']
    };
    
    const lunarModifiers = {
      new: ['earth'],
      waxing: ['air', 'fire'],
      full: ['fire', 'water'],
      waning: ['water', 'earth']
    };
    
    return [
      ...seasonalElements[season as keyof typeof seasonalElements],
      ...lunarModifiers[lunarPhase as keyof typeof lunarModifiers]
    ];
  }

  /**
   * Get phenomenological field description
   */
  getPhenomenologicalFieldDescription(snapshot: DashboardSnapshot): string {
    const { weatherCondition, transmissionQuality, fieldIntensity, avgTricksterRisk } = snapshot;
    
    const weatherDescriptions = {
      ordinary: "The field feels calm and steady, like a quiet morning.",
      charged: "The air is charged with potential—something is stirring in the collective.",
      clear: "The field is luminous and clear—shared insights are flowing freely.",
      stormy: "The field feels stormy, with teaching riddles moving through like weather fronts."
    };
    
    const transmissionDescriptions = {
      clear: "Transmissions are clear and direct.",
      riddles: "Messages are arriving wrapped in riddles and paradox.",
      static: "High activity is creating some static—listen carefully.",
      silence: "The field is quiet—a time for individual reflection."
    };
    
    return `${weatherDescriptions[weatherCondition]} ${transmissionDescriptions[transmissionQuality]}`;
  }

  /**
   * Get archetypal activity description
   */
  getArchetypalActivityDescription(archetypes: ArchetypeActivity[]): string {
    const topArchetype = archetypes[0];
    if (!topArchetype) return "The archetypal field is quiet.";
    
    const intensity = topArchetype.intensity > 0.7 ? "strongly" : "gently";
    const elementDesc = this.getElementDescription(topArchetype.element);
    
    return `The ${topArchetype.archetype} archetype is ${intensity} active, expressing through ${elementDesc} qualities.`;
  }

  private getElementDescription(element: string): string {
    const descriptions = {
      fire: "passionate, transformative",
      water: "flowing, emotional",
      earth: "grounding, embodying", 
      air: "clarifying, liberating",
      aether: "unifying, transcendent"
    };
    
    return descriptions[element as keyof typeof descriptions] || element;
  }
}