import React from 'react';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import type { Element, Mood, EnergyState } from '@/lib/types/oracle';
import { supabase } from '@/lib/supabaseClient';

// Reflection types
export interface Reflection {
  id: string;
  userId: string;
  date: Date;
  type: 'daily' | 'weekly' | 'milestone';
  content: string;
  mood: Mood;
  energy: EnergyState;
  element: Element;
  insights: string[];
  gratitudes: string[];
  challenges: string[];
  breakthroughs: string[];
  elementalBalance: Record<Element, number>; // 0-100 for each element
  metadata?: {
    ritualCount?: number;
    oracleReadings?: number;
    conversationCount?: number;
    voiceMinutes?: number;
  };
}

export interface WeeklyReplay {
  weekStartDate: Date;
  weekEndDate: Date;
  reflections: Reflection[];
  journey: {
    dominantElement: Element;
    elementalShifts: Array<{date: Date; from: Element; to: Element}>;
    moodProgression: Array<{date: Date; mood: Mood}>;
    energyFlow: Array<{date: Date; energy: EnergyState}>;
  };
  insights: {
    topThemes: string[];
    recurringPatterns: string[];
    breakthroughMoments: string[];
    growthAreas: string[];
  };
  statistics: {
    totalReflections: number;
    averageMoodScore: number;
    elementalBalance: Record<Element, number>;
    consistencyScore: number; // 0-100
    transformationScore: number; // 0-100
  };
  mayaObservations: string[];
  suggestedFocus: string;
}

export interface ReflectionPattern {
  pattern: string;
  frequency: number;
  significance: 'high' | 'medium' | 'low';
  element: Element;
}

export class ReflectionReplayEngine {
  constructor(private agent: PersonalOracleAgent) {}
  
  // Generate weekly replay
  async generateWeeklyReplay(weekOffset: number = 0): Promise<WeeklyReplay> {
    const profile = this.agent.getUserProfile();
    const now = new Date();
    
    // Calculate week boundaries
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (weekOffset * 7));
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    
    // Fetch reflections for the week
    const reflections = await this.fetchReflections(
      profile.userId,
      weekStart,
      weekEnd
    );
    
    // Analyze journey
    const journey = this.analyzeJourney(reflections);
    
    // Extract insights
    const insights = this.extractInsights(reflections);
    
    // Calculate statistics
    const statistics = this.calculateStatistics(reflections);
    
    // Generate Maya's observations
    const mayaObservations = this.generateMayaObservations(
      reflections,
      journey,
      insights,
      statistics
    );
    
    // Suggest focus for next week
    const suggestedFocus = this.generateSuggestedFocus(
      insights,
      statistics,
      profile
    );
    
    return {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      reflections,
      journey,
      insights,
      statistics,
      mayaObservations,
      suggestedFocus
    };
  }
  
  // Fetch reflections from database
  private async fetchReflections(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Reflection[]> {
    try {
      const { data } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (!data) return [];
      
      return data.map(d => ({
        id: d.id,
        userId: d.user_id,
        date: new Date(d.created_at),
        type: d.type || 'daily',
        content: d.content,
        mood: d.mood || 'neutral',
        energy: d.energy || 'emerging',
        element: d.element || 'aether',
        insights: d.insights || [],
        gratitudes: d.gratitudes || [],
        challenges: d.challenges || [],
        breakthroughs: d.breakthroughs || [],
        elementalBalance: d.elemental_balance || {
          air: 20, fire: 20, water: 20, earth: 20, aether: 20
        },
        metadata: d.metadata
      }));
    } catch (error) {
      console.error('Error fetching reflections:', error);
      return [];
    }
  }
  
  // Analyze the journey through the week
  private analyzeJourney(reflections: Reflection[]) {
    const elementCounts: Record<Element, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };
    
    const elementalShifts: Array<{date: Date; from: Element; to: Element}> = [];
    const moodProgression: Array<{date: Date; mood: Mood}> = [];
    const energyFlow: Array<{date: Date; energy: EnergyState}> = [];
    
    let previousElement: Element | null = null;
    
    reflections.forEach(reflection => {
      // Count elements
      elementCounts[reflection.element]++;
      
      // Track elemental shifts
      if (previousElement && previousElement !== reflection.element) {
        elementalShifts.push({
          date: reflection.date,
          from: previousElement,
          to: reflection.element
        });
      }
      previousElement = reflection.element;
      
      // Track mood progression
      moodProgression.push({
        date: reflection.date,
        mood: reflection.mood
      });
      
      // Track energy flow
      energyFlow.push({
        date: reflection.date,
        energy: reflection.energy
      });
    });
    
    // Determine dominant element
    const dominantElement = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as Element;
    
    return {
      dominantElement,
      elementalShifts,
      moodProgression,
      energyFlow
    };
  }
  
  // Extract key insights from reflections
  private extractInsights(reflections: Reflection[]) {
    const allInsights = reflections.flatMap(r => r.insights);
    const allChallenges = reflections.flatMap(r => r.challenges);
    const allBreakthroughs = reflections.flatMap(r => r.breakthroughs);
    
    // Find top themes using word frequency
    const topThemes = this.findTopThemes(
      [...allInsights, ...allChallenges, ...allBreakthroughs]
    );
    
    // Identify recurring patterns
    const recurringPatterns = this.findRecurringPatterns(reflections);
    
    // Highlight breakthrough moments
    const breakthroughMoments = allBreakthroughs.slice(0, 3);
    
    // Identify growth areas from challenges
    const growthAreas = this.identifyGrowthAreas(allChallenges);
    
    return {
      topThemes,
      recurringPatterns,
      breakthroughMoments,
      growthAreas
    };
  }
  
  // Find top themes from text
  private findTopThemes(texts: string[]): string[] {
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these', 'those']);
    
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
    });
    
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
  
  // Find recurring patterns
  private findRecurringPatterns(reflections: Reflection[]): string[] {
    const patterns: string[] = [];
    
    // Check for mood patterns
    const moodCounts: Record<Mood, number> = {} as any;
    reflections.forEach(r => {
      moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
    });
    
    const dominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (dominantMood && dominantMood[1] > reflections.length * 0.5) {
      patterns.push(`Consistent ${dominantMood[0]} state`);
    }
    
    // Check for energy patterns
    const energyShifts = reflections.map(r => r.energy);
    if (this.isProgressing(energyShifts)) {
      patterns.push('Progressive energy elevation');
    } else if (this.isOscillating(energyShifts)) {
      patterns.push('Oscillating energy patterns');
    }
    
    // Check for elemental patterns
    const elementShifts = reflections.map(r => r.element);
    const uniqueElements = new Set(elementShifts);
    if (uniqueElements.size === 1) {
      patterns.push(`Strong ${elementShifts[0]} dominance`);
    } else if (uniqueElements.size === 5) {
      patterns.push('Full elemental exploration');
    }
    
    return patterns;
  }
  
  // Check if energy is progressing
  private isProgressing(energies: EnergyState[]): boolean {
    const energyValues: Record<EnergyState, number> = {
      dense: 1,
      emerging: 2,
      radiant: 3
    };
    
    let increasing = true;
    for (let i = 1; i < energies.length; i++) {
      if (energyValues[energies[i]] < energyValues[energies[i - 1]]) {
        increasing = false;
        break;
      }
    }
    
    return increasing;
  }
  
  // Check if energy is oscillating
  private isOscillating(energies: EnergyState[]): boolean {
    let changes = 0;
    for (let i = 1; i < energies.length; i++) {
      if (energies[i] !== energies[i - 1]) {
        changes++;
      }
    }
    return changes > energies.length * 0.5;
  }
  
  // Identify growth areas from challenges
  private identifyGrowthAreas(challenges: string[]): string[] {
    const areas: string[] = [];
    
    const challengeText = challenges.join(' ').toLowerCase();
    
    if (challengeText.includes('focus') || challengeText.includes('distract')) {
      areas.push('Focus and concentration');
    }
    if (challengeText.includes('emotion') || challengeText.includes('feel')) {
      areas.push('Emotional regulation');
    }
    if (challengeText.includes('connect') || challengeText.includes('relation')) {
      areas.push('Relationship dynamics');
    }
    if (challengeText.includes('energy') || challengeText.includes('tired')) {
      areas.push('Energy management');
    }
    if (challengeText.includes('decision') || challengeText.includes('choice')) {
      areas.push('Decision clarity');
    }
    
    return areas.slice(0, 3);
  }
  
  // Calculate statistics
  private calculateStatistics(reflections: Reflection[]) {
    const totalReflections = reflections.length;
    
    // Calculate average mood score
    const moodScores: Record<Mood, number> = {
      radiant: 5,
      light: 4,
      neutral: 3,
      heavy: 2,
      dense: 1
    };
    
    const averageMoodScore = reflections.length > 0
      ? reflections.reduce((sum, r) => sum + (moodScores[r.mood] || 3), 0) / reflections.length
      : 3;
    
    // Calculate elemental balance
    const elementalBalance: Record<Element, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };
    
    reflections.forEach(r => {
      Object.entries(r.elementalBalance).forEach(([element, value]) => {
        elementalBalance[element as Element] += value;
      });
    });
    
    // Normalize elemental balance
    if (reflections.length > 0) {
      Object.keys(elementalBalance).forEach(element => {
        elementalBalance[element as Element] /= reflections.length;
      });
    }
    
    // Calculate consistency score (based on daily reflections)
    const consistencyScore = Math.min(100, (totalReflections / 7) * 100);
    
    // Calculate transformation score
    const breakthroughCount = reflections.reduce(
      (sum, r) => sum + r.breakthroughs.length,
      0
    );
    const transformationScore = Math.min(100, breakthroughCount * 20);
    
    return {
      totalReflections,
      averageMoodScore,
      elementalBalance,
      consistencyScore,
      transformationScore
    };
  }
  
  // Generate Maya's observations
  private generateMayaObservations(
    reflections: Reflection[],
    journey: any,
    insights: any,
    statistics: any
  ): string[] {
    const observations: string[] = [];
    const profile = this.agent.getUserProfile();
    
    // Observation about consistency
    if (statistics.consistencyScore > 80) {
      observations.push("Your dedication to daily reflection is creating powerful momentum.");
    } else if (statistics.consistencyScore < 40) {
      observations.push("More frequent reflections could deepen your self-awareness.");
    }
    
    // Observation about elemental journey
    if (journey.elementalShifts.length > 3) {
      observations.push("You're exploring multiple elemental energies - a sign of expansion.");
    } else if (journey.elementalShifts.length === 0) {
      observations.push(`You're deeply rooted in ${journey.dominantElement} energy this week.`);
    }
    
    // Observation about mood
    if (statistics.averageMoodScore > 3.5) {
      observations.push("Your overall energy is ascending. Keep nurturing what's working.");
    } else if (statistics.averageMoodScore < 2.5) {
      observations.push("This has been a dense week. Remember, density precedes breakthrough.");
    }
    
    // Observation about breakthroughs
    if (statistics.transformationScore > 60) {
      observations.push("Multiple breakthroughs this week - you're in a powerful transformation cycle.");
    }
    
    // Observation about patterns
    if (insights.recurringPatterns.length > 0) {
      observations.push(`I notice ${insights.recurringPatterns[0].toLowerCase()} - this pattern holds wisdom.`);
    }
    
    // Personalized observation based on trust level
    if (profile.trustLevel > 70) {
      observations.push("Our deepening connection is reflected in the richness of your reflections.");
    }
    
    return observations;
  }
  
  // Generate suggested focus for next week
  private generateSuggestedFocus(
    insights: any,
    statistics: any,
    profile: any
  ): string {
    // Based on growth areas
    if (insights.growthAreas.length > 0) {
      return `Focus on ${insights.growthAreas[0].toLowerCase()} through ${profile.element} practices`;
    }
    
    // Based on elemental imbalance
    const lowestElement = Object.entries(statistics.elementalBalance)
      .sort((a, b) => a[1] - b[1])[0][0] as Element;
    
    if (statistics.elementalBalance[lowestElement] < 10) {
      return `Explore ${lowestElement} energy to restore elemental balance`;
    }
    
    // Based on consistency
    if (statistics.consistencyScore < 50) {
      return "Establish a daily reflection practice, even if brief";
    }
    
    // Based on transformation score
    if (statistics.transformationScore < 30) {
      return "Seek opportunities for breakthrough - perhaps through ritual work";
    }
    
    // Default suggestion
    return "Continue your journey with curiosity and compassion";
  }
  
  // Create reflection
  async createReflection(
    content: string,
    type: 'daily' | 'weekly' | 'milestone' = 'daily'
  ): Promise<Reflection> {
    const profile = this.agent.getUserProfile();
    const state = this.agent.getState();
    
    // Parse content for insights, gratitudes, challenges, breakthroughs
    const insights = this.extractSection(content, ['insight', 'learned', 'realized']);
    const gratitudes = this.extractSection(content, ['grateful', 'thankful', 'appreciate']);
    const challenges = this.extractSection(content, ['challenge', 'difficult', 'struggle']);
    const breakthroughs = this.extractSection(content, ['breakthrough', 'transform', 'shift']);
    
    const reflection: Reflection = {
      id: `ref-${Date.now()}`,
      userId: profile.userId,
      date: new Date(),
      type,
      content,
      mood: this.inferMood(content),
      energy: profile.currentPhase as EnergyState,
      element: profile.element,
      insights,
      gratitudes,
      challenges,
      breakthroughs,
      elementalBalance: await this.calculateCurrentElementalBalance(profile.userId)
    };
    
    // Save to database
    try {
      await supabase
        .from('reflections')
        .insert({
          user_id: reflection.userId,
          type: reflection.type,
          content: reflection.content,
          mood: reflection.mood,
          energy: reflection.energy,
          element: reflection.element,
          insights: reflection.insights,
          gratitudes: reflection.gratitudes,
          challenges: reflection.challenges,
          breakthroughs: reflection.breakthroughs,
          elemental_balance: reflection.elementalBalance,
          created_at: reflection.date.toISOString()
        });
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
    
    return reflection;
  }
  
  // Extract sections from content
  private extractSection(content: string, keywords: string[]): string[] {
    const sentences = content.split(/[.!?]+/);
    const extracted: string[] = [];
    
    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();
      if (keywords.some(keyword => lower.includes(keyword))) {
        extracted.push(sentence.trim());
      }
    });
    
    return extracted;
  }
  
  // Infer mood from content
  private inferMood(content: string): Mood {
    const lower = content.toLowerCase();
    
    if (lower.includes('joy') || lower.includes('happy') || lower.includes('excited')) {
      return 'radiant';
    }
    if (lower.includes('good') || lower.includes('positive') || lower.includes('light')) {
      return 'light';
    }
    if (lower.includes('heavy') || lower.includes('difficult') || lower.includes('sad')) {
      return 'heavy';
    }
    if (lower.includes('stuck') || lower.includes('dense') || lower.includes('blocked')) {
      return 'dense';
    }
    
    return 'neutral';
  }
  
  // Calculate current elemental balance
  private async calculateCurrentElementalBalance(
    userId: string
  ): Promise<Record<Element, number>> {
    try {
      const { data } = await supabase
        .from('petal_interactions')
        .select('element')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      const counts: Record<Element, number> = {
        air: 0, fire: 0, water: 0, earth: 0, aether: 0
      };
      
      if (data) {
        data.forEach(interaction => {
          counts[interaction.element as Element]++;
        });
      }
      
      // Convert to percentages
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      Object.keys(counts).forEach(element => {
        counts[element as Element] = (counts[element as Element] / total) * 100;
      });
      
      return counts;
    } catch (error) {
      console.error('Error calculating elemental balance:', error);
      return { air: 20, fire: 20, water: 20, earth: 20, aether: 20 };
    }
  }
}

// React hook for components
export function useReflectionReplay(maya: PersonalOracleAgent | null) {
  const [engine, setEngine] = React.useState<ReflectionReplayEngine | null>(null);
  const [weeklyReplay, setWeeklyReplay] = React.useState<WeeklyReplay | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (maya) {
      setEngine(new ReflectionReplayEngine(maya));
    }
  }, [maya]);
  
  const generateReplay = React.useCallback(async (weekOffset: number = 0) => {
    if (!engine) return null;
    
    setLoading(true);
    const replay = await engine.generateWeeklyReplay(weekOffset);
    setWeeklyReplay(replay);
    setLoading(false);
    
    return replay;
  }, [engine]);
  
  const createReflection = React.useCallback(async (
    content: string,
    type: 'daily' | 'weekly' | 'milestone' = 'daily'
  ) => {
    if (!engine) return null;
    return engine.createReflection(content, type);
  }, [engine]);
  
  return { weeklyReplay, loading, generateReplay, createReflection };
}