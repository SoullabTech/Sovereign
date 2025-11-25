/**
 * Unified Narrative Service
 * Consolidates CollectiveNarrativeService, CrossNarrativeService, and other narrative generation
 * Provides consistent oracle voice and narrative generation across the platform
 */

import { 
  INarrativeService,
  IConfigurationService,
  PersonalStats,
  CollectiveStats,
  ServiceTokens 
} from '../core/ServiceTokens';
import { ServiceContainer } from '../core/ServiceContainer';

export interface NarrativeServiceConfig {
  maxNarrativeLength: number;
  defaultTone: NarrativeTone;
  enableSeasonalVariation: boolean;
  personalityVariationEnabled: boolean;
}

export type NarrativeTone = 'poetic' | 'prophetic' | 'reflective' | 'mystical' | 'urgent' | 'ceremonial';

export interface PersonalNarrative {
  opening: string;
  journeyReflection: string;
  archetypeGuidance: string;
  emotionalInsight: string;
  futureGuidance: string;
  fullText: string;
  tone: NarrativeTone;
  metadata: {
    generatedAt: Date;
    wordCount: number;
    personalityFactors: string[];
  };
}

export interface CollectiveNarrative {
  oracleVoice: string;
  archetypeWeather: string;
  collectiveMovement: string;
  emergingWisdom: string;
  fullText: string;
  tone: NarrativeTone;
  metadata: {
    generatedAt: Date;
    totalParticipants: number;
    dominantArchetype: string;
  };
}

export interface DaimonicNarrative {
  encounter: string;
  recognition: string;
  integration: string;
  fullText: string;
  archetype: string;
}

export interface CrossNarrative {
  personalVoice: string;
  collectiveVoice: string;
  synthesis: string;
  fieldPosition: string;
  fullText: string;
}

export interface NarrativeTemplate {
  pattern: string;
  variables: string[];
  tone: NarrativeTone;
  context: 'personal' | 'collective' | 'daimonic' | 'cross';
}

export class NarrativeService implements INarrativeService {
  private config: NarrativeServiceConfig;
  private narrativeTemplates: Map<string, NarrativeTemplate[]> = new Map();
  private currentSeason: string;

  constructor(
    private container: ServiceContainer,
    config?: Partial<NarrativeServiceConfig>
  ) {
    this.config = {
      maxNarrativeLength: 2000,
      defaultTone: 'reflective',
      enableSeasonalVariation: true,
      personalityVariationEnabled: true,
      ...config
    };
    
    this.currentSeason = this.getCurrentSeason();
    this.initializeTemplates();
  }

  /**
   * Generate personal narrative for individual user journey
   */
  async generatePersonalNarrative(userId: string, data: PersonalStats): Promise<PersonalNarrative> {
    const tone = this.selectNarrativeTone();
    const personalityFactors = await this.getUserPersonalityFactors(userId);
    
    const opening = this.generatePersonalOpening(tone, data, personalityFactors);
    const journeyReflection = this.generateJourneyReflection(data, tone);
    const archetypeGuidance = this.generateArchetypeGuidance(data.archetypeGrowth, tone);
    const emotionalInsight = this.generateEmotionalInsight(data.emotionalAverage, tone);
    const futureGuidance = this.generateFutureGuidance(data, tone);

    const fullText = this.weavePersonalNarrative(
      opening, 
      journeyReflection, 
      archetypeGuidance, 
      emotionalInsight, 
      futureGuidance,
      tone
    );

    return {
      opening,
      journeyReflection,
      archetypeGuidance,
      emotionalInsight,
      futureGuidance,
      fullText,
      tone,
      metadata: {
        generatedAt: new Date(),
        wordCount: fullText.split(/\s+/).length,
        personalityFactors
      }
    };
  }

  /**
   * Generate collective narrative for group consciousness
   */
  async generateCollectiveNarrative(data: CollectiveStats): Promise<CollectiveNarrative> {
    const tone = this.selectNarrativeTone();
    
    const oracleVoice = this.generateOracleVoice(tone, data);
    const archetypeWeather = this.generateArchetypeWeather(data.archetypeDistribution, tone);
    const collectiveMovement = this.generateCollectiveMovement(data, tone);
    const emergingWisdom = this.generateEmergingWisdom(data.emergingTrends, tone);
    
    const fullText = this.weaveCollectiveNarrative(
      oracleVoice,
      archetypeWeather,
      collectiveMovement,
      emergingWisdom,
      tone
    );

    return {
      oracleVoice,
      archetypeWeather,
      collectiveMovement,
      emergingWisdom,
      fullText,
      tone,
      metadata: {
        generatedAt: new Date(),
        totalParticipants: data.totalEncounters,
        dominantArchetype: data.dominantArchetype
      }
    };
  }

  /**
   * Generate daimonic encounter narrative
   */
  async generateDaimonicNarrative(encounter: any): Promise<DaimonicNarrative> {
    const encounterText = this.generateEncounterDescription(encounter);
    const recognition = this.generateDaimonicRecognition(encounter);
    const integration = this.generateIntegrationGuidance(encounter);
    
    const fullText = this.weaveDaimonicNarrative(encounterText, recognition, integration);

    return {
      encounter: encounterText,
      recognition,
      integration,
      fullText,
      archetype: encounter.archetype
    };
  }

  /**
   * Generate cross narrative between personal and collective
   */
  async generateCrossNarrative(personal: PersonalStats, collective: CollectiveStats): Promise<CrossNarrative> {
    const personalVoice = this.generatePersonalVoiceInField(personal, collective);
    const collectiveVoice = this.generateCollectiveVoiceToIndividual(personal, collective);
    const synthesis = this.generatePersonalCollectiveSynthesis(personal, collective);
    const fieldPosition = this.generateFieldPosition(personal, collective);
    
    const fullText = this.weaveCrossNarrative(personalVoice, collectiveVoice, synthesis, fieldPosition);

    return {
      personalVoice,
      collectiveVoice,
      synthesis,
      fieldPosition,
      fullText
    };
  }

  /**
   * Select appropriate narrative tone based on time and context
   */
  private selectNarrativeTone(): NarrativeTone {
    if (!this.config.enableSeasonalVariation) {
      return this.config.defaultTone;
    }

    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const season = this.currentSeason;
    
    // Time-based tone selection
    if (hour >= 5 && hour < 9) return 'ceremonial'; // Dawn
    if (hour >= 9 && hour < 15) return 'reflective'; // Day
    if (hour >= 15 && hour < 19) return 'poetic'; // Afternoon
    if (hour >= 19 && hour < 23) return 'mystical'; // Evening
    
    // Weekend prophetic mode
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'prophetic';
    
    // Seasonal influence
    if (season === 'spring') return 'poetic';
    if (season === 'summer') return 'urgent';
    if (season === 'autumn') return 'reflective';
    if (season === 'winter') return 'mystical';

    return this.config.defaultTone;
  }

  /**
   * Generate personal opening based on tone and user data
   */
  private generatePersonalOpening(tone: NarrativeTone, data: PersonalStats, factors: string[]): string {
    const templates = this.getToneTemplates('personal_opening', tone);
    const template = this.selectRandomTemplate(templates);
    
    const variables = {
      timeframe: data.timeframe,
      sessionCount: data.totalSessions.toString(),
      dominantArchetype: this.getDominantArchetype(data.archetypeGrowth),
      personalityHint: factors[0] || 'seeker',
      emotionalTone: this.getEmotionalTone(data.emotionalAverage)
    };

    return this.populateTemplate(template, variables);
  }

  /**
   * Generate archetype guidance based on growth patterns
   */
  private generateArchetypeGuidance(archetypeGrowth: Record<string, number>, tone: NarrativeTone): string {
    const dominant = Object.entries(archetypeGrowth)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Seeker';
    
    const emerging = Object.entries(archetypeGrowth)
      .sort(([, a], [, b]) => b - a)[1]?.[0] || 'Creator';

    const guidanceTemplates = {
      poetic: `Your ${dominant} essence dances with emerging ${emerging} energy, painting new chapters in the constellation of your becoming.`,
      prophetic: `Behold: the ${dominant} within you speaks, while ${emerging} whispers of transformations yet to unfold.`,
      reflective: `I notice your ${dominant} archetype has been particularly active, with ${emerging} beginning to emerge as a supportive force.`,
      mystical: `In the sacred space between ${dominant} and ${emerging}, ancient wisdom stirs, ready to illuminate your path.`,
      urgent: `Your ${dominant} nature calls for action, while ${emerging} offers the tools needed for the work ahead.`,
      ceremonial: `We honor the ${dominant} that guides you and welcome the ${emerging} that emerges to join this sacred journey.`
    };

    return guidanceTemplates[tone] || guidanceTemplates.reflective;
  }

  /**
   * Generate collective oracle voice
   */
  private generateOracleVoice(tone: NarrativeTone, data: CollectiveStats): string {
    const oracleTemplates = {
      poetic: `In the symphony of souls, ${data.totalEncounters} voices have woven their threads into the cosmic tapestry this ${data.timeframe}.`,
      prophetic: `The field speaks: ${data.totalEncounters} seekers have touched the collective consciousness, and the ${data.dominantArchetype} rises as herald of what comes.`,
      reflective: `Across ${data.totalEncounters} encounters this ${data.timeframe}, the collective has shown a clear gravitational pull toward ${data.dominantArchetype} energy.`,
      mystical: `Ancient currents flow through ${data.totalEncounters} souls, carrying the essence of ${data.dominantArchetype} toward shores unknown.`,
      urgent: `The time calls for recognition: ${data.totalEncounters} individuals have answered, with ${data.dominantArchetype} leading the charge.`,
      ceremonial: `We gather in awareness of ${data.totalEncounters} sacred encounters, blessing the ${data.dominantArchetype} that moves among us.`
    };

    return oracleTemplates[tone] || oracleTemplates.reflective;
  }

  /**
   * Generate field position narrative for individual in collective
   */
  private generateFieldPosition(personal: PersonalStats, collective: CollectiveStats): string {
    const userDominant = this.getDominantArchetype(personal.archetypeGrowth);
    const fieldDominant = collective.dominantArchetype;
    
    if (userDominant === fieldDominant) {
      return `You swim in the mainstream of collective consciousness, your ${userDominant} nature aligned with the field&apos;s dominant current.`;
    } else {
      return `Your ${userDominant} essence offers a unique counterpoint to the field's ${fieldDominant} momentum, creating valuable tension and balance.`;
    }
  }

  /**
   * Weave together personal narrative components
   */
  private weavePersonalNarrative(
    opening: string,
    journey: string, 
    archetype: string,
    emotional: string,
    future: string,
    tone: NarrativeTone
  ): string {
    const connectors = {
      poetic: ['...', 'and in this space,', 'while', 'as'],
      prophetic: ['For behold,', 'And it shall be that', 'Thus', 'The path reveals'],
      reflective: ['I observe that', 'What emerges is', 'This suggests', 'Moving forward'],
      mystical: ['In the sacred depths,', 'The ancient ones whisper', 'Through the veil', 'Mystery speaks'],
      urgent: ['The time demands', 'Action calls for', 'Now is the moment', 'Forward movement requires'],
      ceremonial: ['We acknowledge', 'In sacred recognition', 'Blessed be', 'With reverence']
    };

    const conn = connectors[tone] || connectors.reflective;
    
    return `${opening} ${conn[0]} ${journey} ${conn[1]} ${archetype} ${conn[2]} ${emotional} ${conn[3]} ${future}`;
  }

  /**
   * Weave together collective narrative components
   */
  private weaveCollectiveNarrative(
    oracle: string,
    weather: string,
    movement: string,
    wisdom: string,
    tone: NarrativeTone
  ): string {
    return `${oracle}\n\n${weather}\n\n${movement}\n\n${wisdom}`;
  }

  /**
   * Initialize narrative templates for different contexts and tones
   */
  private initializeTemplates(): void {
    // Personal opening templates
    this.narrativeTemplates.set('personal_opening', [
      {
        pattern: 'In your {timeframe} journey of {sessionCount} encounters, your {dominantArchetype} nature has been {emotionalTone}.',
        variables: ['timeframe', 'sessionCount', 'dominantArchetype', 'emotionalTone'],
        tone: 'reflective',
        context: 'personal'
      },
      {
        pattern: 'The threads of {timeframe} weave through {sessionCount} sacred moments, your {dominantArchetype} spirit {emotionalTone} in the cosmic dance.',
        variables: ['timeframe', 'sessionCount', 'dominantArchetype', 'emotionalTone'],
        tone: 'poetic',
        context: 'personal'
      },
      {
        pattern: 'Behold the {timeframe} that has brought {sessionCount} encounters to your {dominantArchetype} soul, each one {emotionalTone}.',
        variables: ['timeframe', 'sessionCount', 'dominantArchetype', 'emotionalTone'],
        tone: 'prophetic',
        context: 'personal'
      }
    ]);
  }

  /**
   * Get templates for specific tone and context
   */
  private getToneTemplates(context: string, tone: NarrativeTone): NarrativeTemplate[] {
    const templates = this.narrativeTemplates.get(context) || [];
    return templates.filter(t => t.tone === tone);
  }

  /**
   * Select random template from array
   */
  private selectRandomTemplate(templates: NarrativeTemplate[]): string {
    if (templates.length === 0) {
      return 'Your journey continues to unfold with wisdom and grace.';
    }
    return templates[Math.floor(Math.random() * templates.length)].pattern;
  }

  /**
   * Populate template with variables
   */
  private populateTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  }

  /**
   * Get dominant archetype from growth data
   */
  private getDominantArchetype(archetypeGrowth: Record<string, number>): string {
    return Object.entries(archetypeGrowth)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Seeker';
  }

  /**
   * Get emotional tone descriptor
   */
  private getEmotionalTone(emotionalState: any): string {
    if (emotionalState.valence > 0.3) return 'flourishing';
    if (emotionalState.valence < -0.3) return 'processing challenges';
    return 'in thoughtful exploration';
  }

  /**
   * Get current season for seasonal variation
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * Get user personality factors for narrative customization
   */
  private async getUserPersonalityFactors(userId: string): Promise<string[]> {
    // In a real implementation, would analyze user&apos;s conversation patterns
    // For now, return default factors
    return ['reflective', 'growth-oriented', 'intuitive'];
  }

  // Placeholder methods for other narrative components
  private generateJourneyReflection(data: PersonalStats, tone: NarrativeTone): string {
    return `Your ${data.totalSessions} sessions reveal a pattern of ${tone} exploration.`;
  }

  private generateEmotionalInsight(emotionalState: any, tone: NarrativeTone): string {
    return `Your emotional landscape shows ${this.getEmotionalTone(emotionalState)} energy.`;
  }

  private generateFutureGuidance(data: PersonalStats, tone: NarrativeTone): string {
    return `The path ahead invites deeper ${tone} engagement.`;
  }

  private generateArchetypeWeather(distribution: Record<string, number>, tone: NarrativeTone): string {
    const dominant = Object.entries(distribution).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Seeker';
    return `The archetypal weather shows ${dominant} currents flowing strongly.`;
  }

  private generateCollectiveMovement(data: CollectiveStats, tone: NarrativeTone): string {
    return `Collective movement toward ${data.dominantArchetype} consciousness continues.`;
  }

  private generateEmergingWisdom(trends: string[], tone: NarrativeTone): string {
    return `Emerging wisdom speaks of ${trends.join(', ')} themes.`;
  }

  private generateEncounterDescription(encounter: any): string {
    return `A ${encounter.archetype} encounter emerges from the depths.`;
  }

  private generateDaimonicRecognition(encounter: any): string {
    return `Recognition dawns of the ${encounter.archetype} within.`;
  }

  private generateIntegrationGuidance(encounter: any): string {
    return `Integration of ${encounter.archetype} wisdom begins.`;
  }

  private generatePersonalVoiceInField(personal: PersonalStats, collective: CollectiveStats): string {
    return `Your individual voice speaks within the collective field.`;
  }

  private generateCollectiveVoiceToIndividual(personal: PersonalStats, collective: CollectiveStats): string {
    return `The collective voice responds to your individual contribution.`;
  }

  private generatePersonalCollectiveSynthesis(personal: PersonalStats, collective: CollectiveStats): string {
    return `Synthesis emerges between individual and collective consciousness.`;
  }

  private weaveDaimonicNarrative(encounter: string, recognition: string, integration: string): string {
    return `${encounter}\n\n${recognition}\n\n${integration}`;
  }

  private weaveCrossNarrative(personal: string, collective: string, synthesis: string, position: string): string {
    return `${personal}\n\n${collective}\n\n${synthesis}\n\n${position}`;
  }

  /**
   * Dispose of the service and cleanup resources
   */
  async dispose(): Promise<void> {
    this.narrativeTemplates.clear();
    console.log('NarrativeService disposed');
  }
}