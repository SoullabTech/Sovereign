/**
 * Flow Memory System - Learning and Adaptation
 * Tracks flow effectiveness and user patterns to optimize future orchestration
 */

import { FlowType, FlowRecord } from './OrchestrationEngine';
import { supabase } from '../../lib/supabaseClient';
import { logger } from '../../utils/logger';

export interface FlowPattern {
  userId: string;
  patternType: PatternType;
  flows: FlowType[];
  frequency: number;
  effectiveness: number;
  emotionalImpact: number;
  lastSeen: Date;
  metadata?: any;
}

export type PatternType = 
  | 'escalation'      // Flows that increase intensity
  | 'deescalation'    // Flows that calm and ground
  | 'exploration'     // Flows for deep work
  | 'integration'     // Flows for processing
  | 'celebration'     // Flows for positive states
  | 'crisis'          // Crisis intervention patterns
  | 'daily_rhythm'    // Regular daily patterns
  | 'lunar_cycle'     // Moon phase patterns
  | 'seasonal';       // Seasonal patterns

export interface UserFlowProfile {
  userId: string;
  preferredFlows: FlowPreference[];
  avoidFlows: FlowType[];
  effectivePatterns: FlowPattern[];
  currentPhase: UserPhase;
  flowHistory: FlowRecord[];
  adaptations: FlowAdaptation[];
  insights: FlowInsight[];
}

export interface FlowPreference {
  flowType: FlowType;
  preferenceScore: number; // -1 to 1
  effectiveness: number; // 0 to 1
  frequency: number;
  conditions?: {
    timeOfDay?: string[];
    emotionalStates?: string[];
    moonPhases?: string[];
  };
}

export interface UserPhase {
  current: 'exploring' | 'deepening' | 'integrating' | 'transforming' | 'stabilizing';
  startDate: Date;
  keyThemes: string[];
  recommendedFlows: FlowType[];
}

export interface FlowAdaptation {
  timestamp: Date;
  adaptation: string;
  reason: string;
  effectiveness?: number;
}

export interface FlowInsight {
  type: 'pattern' | 'breakthrough' | 'resistance' | 'growth' | 'warning';
  content: string;
  confidence: number;
  timestamp: Date;
  relatedFlows: FlowType[];
}

export interface FlowEffectiveness {
  flowType: FlowType;
  context: FlowContext;
  outcomes: FlowOutcome[];
  overallScore: number;
}

export interface FlowContext {
  emotionalStateBefore: any;
  emotionalStateAfter: any;
  timeOfDay: string;
  sessionDuration: number;
  previousFlow?: FlowType;
  moonPhase?: string;
  elementalBalance?: any;
}

export interface FlowOutcome {
  metric: 'emotional_shift' | 'grounding' | 'insight' | 'integration' | 'satisfaction';
  value: number; // -1 to 1
  confidence: number;
}

export class FlowMemory {
  private userProfiles: Map<string, UserFlowProfile>;
  private flowPatterns: Map<string, FlowPattern[]>;
  private learningRate: number = 0.1; // How quickly we adapt
  
  constructor() {
    this.userProfiles = new Map();
    this.flowPatterns = new Map();
    this.loadPersistedData();
  }

  /**
   * Record a flow interaction
   */
  async recordFlow(
    userId: string,
    flowRecord: FlowRecord
  ): Promise<void> {
    try {
      // Get or create user profile
      let profile = this.userProfiles.get(userId);
      if (!profile) {
        profile = await this.createUserProfile(userId);
      }

      // Add to flow history
      profile.flowHistory.push(flowRecord);
      
      // Keep only last 100 flows
      if (profile.flowHistory.length > 100) {
        profile.flowHistory = profile.flowHistory.slice(-100);
      }

      // Update preferences
      await this.updateFlowPreferences(profile, flowRecord);
      
      // Detect patterns
      const patterns = await this.detectPatterns(profile);
      profile.effectivePatterns = patterns;
      
      // Generate insights
      const insights = await this.generateInsights(profile, flowRecord);
      profile.insights.push(...insights);
      
      // Update user phase if needed
      const newPhase = this.assessUserPhase(profile);
      if (newPhase !== profile.currentPhase.current) {
        profile.currentPhase = {
          current: newPhase,
          startDate: new Date(),
          keyThemes: this.identifyKeyThemes(profile),
          recommendedFlows: this.getPhaseRecommendations(newPhase)
        };
      }

      // Save profile
      this.userProfiles.set(userId, profile);
      
      // Persist to database
      await this.persistProfile(profile);
      
      logger.info('Flow recorded', {
        userId,
        flowType: flowRecord.flowType,
        effectiveness: flowRecord.effectiveness
      });
      
    } catch (error) {
      logger.error('Error recording flow:', error);
    }
  }

  /**
   * Get flow recommendations based on current state
   */
  async getFlowRecommendations(
    userId: string,
    currentState: {
      emotional?: any;
      spiritual?: any;
      timeOfDay?: string;
      recentFlows?: FlowType[];
    }
  ): Promise<{
    recommended: FlowType[];
    avoid: FlowType[];
    rationale: string[];
  }> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return this.getDefaultRecommendations();
    }

    const recommendations: FlowType[] = [];
    const avoid: FlowType[] = [];
    const rationale: string[] = [];

    // Check for repetitive patterns
    if (currentState.recentFlows) {
      const lastFlow = currentState.recentFlows[currentState.recentFlows.length - 1];
      const repetitions = currentState.recentFlows.filter(f => f === lastFlow).length;
      
      if (repetitions >= 3) {
        avoid.push(lastFlow);
        rationale.push(`Avoiding ${lastFlow} to prevent pattern lock`);
        
        // Recommend complementary flows
        const complementary = this.getComplementaryFlows(lastFlow);
        recommendations.push(...complementary);
        rationale.push(`Suggesting complementary flows for variety`);
      }
    }

    // Time-based recommendations
    if (currentState.timeOfDay) {
      const timeFlows = this.getTimeAppropriateFlows(
        currentState.timeOfDay,
        profile
      );
      recommendations.push(...timeFlows.recommended);
      avoid.push(...timeFlows.avoid);
      
      if (timeFlows.recommended.length > 0) {
        rationale.push(`Time-appropriate flows for ${currentState.timeOfDay}`);
      }
    }

    // Emotional state recommendations
    if (currentState.emotional) {
      const emotionalFlows = this.getEmotionallyAppropriateFlows(
        currentState.emotional,
        profile
      );
      recommendations.push(...emotionalFlows.recommended);
      avoid.push(...emotionalFlows.avoid);
      
      if (emotionalFlows.rationale) {
        rationale.push(emotionalFlows.rationale);
      }
    }

    // Phase-based recommendations
    recommendations.push(...profile.currentPhase.recommendedFlows);
    rationale.push(`Aligned with ${profile.currentPhase.current} phase`);

    // Learn from effective patterns
    const effectiveFlows = profile.effectivePatterns
      .filter(p => p.effectiveness > 0.7)
      .flatMap(p => p.flows);
    recommendations.push(...effectiveFlows);
    
    if (effectiveFlows.length > 0) {
      rationale.push('Based on your effective patterns');
    }

    // Remove duplicates and conflicts
    const uniqueRecommended = [...new Set(recommendations)]
      .filter(f => !avoid.includes(f));
    const uniqueAvoid = [...new Set(avoid)];

    return {
      recommended: uniqueRecommended.slice(0, 5), // Top 5
      avoid: uniqueAvoid,
      rationale
    };
  }

  /**
   * Analyze flow effectiveness
   */
  async analyzeFlowEffectiveness(
    userId: string,
    flowType: FlowType,
    context: FlowContext
  ): Promise<FlowEffectiveness> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return this.getDefaultEffectiveness(flowType);
    }

    // Get historical data for this flow
    const historicalFlows = profile.flowHistory.filter(
      f => f.flowType === flowType
    );

    const outcomes: FlowOutcome[] = [];

    // Calculate emotional shift
    if (context.emotionalStateBefore && context.emotionalStateAfter) {
      const emotionalShift = this.calculateEmotionalShift(
        context.emotionalStateBefore,
        context.emotionalStateAfter
      );
      outcomes.push({
        metric: 'emotional_shift',
        value: emotionalShift,
        confidence: 0.8
      });
    }

    // Calculate grounding effect
    const groundingEffect = this.assessGroundingEffect(context);
    outcomes.push({
      metric: 'grounding',
      value: groundingEffect,
      confidence: 0.7
    });

    // Historical effectiveness
    const historicalEffectiveness = historicalFlows.length > 0
      ? historicalFlows.reduce((sum, f) => sum + f.effectiveness, 0) / historicalFlows.length
      : 0.5;

    // Overall score
    const overallScore = outcomes.length > 0
      ? outcomes.reduce((sum, o) => sum + o.value * o.confidence, 0) / 
        outcomes.reduce((sum, o) => sum + o.confidence, 0)
      : historicalEffectiveness;

    return {
      flowType,
      context,
      outcomes,
      overallScore
    };
  }

  /**
   * Detect patterns in user flow history
   */
  private async detectPatterns(profile: UserFlowProfile): Promise<FlowPattern[]> {
    const patterns: FlowPattern[] = [];
    const history = profile.flowHistory;

    if (history.length < 5) {
      return patterns; // Not enough data
    }

    // Detect escalation patterns
    const escalationSequences = this.findSequences(
      history,
      (flows) => this.isEscalatingSequence(flows)
    );
    
    if (escalationSequences.length > 0) {
      patterns.push({
        userId: profile.userId,
        patternType: 'escalation',
        flows: escalationSequences[0],
        frequency: escalationSequences.length,
        effectiveness: this.calculateSequenceEffectiveness(escalationSequences[0], history),
        emotionalImpact: 0.7,
        lastSeen: new Date()
      });
    }

    // Detect deescalation patterns
    const deescalationSequences = this.findSequences(
      history,
      (flows) => this.isDeescalatingSequence(flows)
    );
    
    if (deescalationSequences.length > 0) {
      patterns.push({
        userId: profile.userId,
        patternType: 'deescalation',
        flows: deescalationSequences[0],
        frequency: deescalationSequences.length,
        effectiveness: this.calculateSequenceEffectiveness(deescalationSequences[0], history),
        emotionalImpact: -0.5,
        lastSeen: new Date()
      });
    }

    // Detect daily rhythms
    const dailyPattern = this.detectDailyRhythm(history);
    if (dailyPattern) {
      patterns.push(dailyPattern);
    }

    // Detect crisis patterns
    const crisisPattern = this.detectCrisisPattern(history);
    if (crisisPattern) {
      patterns.push(crisisPattern);
    }

    return patterns;
  }

  /**
   * Generate insights from flow patterns
   */
  private async generateInsights(
    profile: UserFlowProfile,
    latestFlow: FlowRecord
  ): Promise<FlowInsight[]> {
    const insights: FlowInsight[] = [];

    // Check for breakthrough moments
    if (latestFlow.effectiveness > 0.9 && latestFlow.emotionalImpact > 0.5) {
      insights.push({
        type: 'breakthrough',
        content: `The ${latestFlow.flowType} flow created a significant positive shift`,
        confidence: 0.8,
        timestamp: new Date(),
        relatedFlows: [latestFlow.flowType]
      });
    }

    // Check for resistance patterns
    const similarFlows = profile.flowHistory.filter(
      f => f.flowType === latestFlow.flowType
    );
    
    if (similarFlows.length > 3) {
      const avgEffectiveness = similarFlows.reduce((sum, f) => 
        sum + f.effectiveness, 0) / similarFlows.length;
      
      if (avgEffectiveness < 0.3) {
        insights.push({
          type: 'resistance',
          content: `${latestFlow.flowType} consistently shows low effectiveness - consider alternatives`,
          confidence: 0.7,
          timestamp: new Date(),
          relatedFlows: [latestFlow.flowType]
        });
      }
    }

    // Check for growth patterns
    const recentFlows = profile.flowHistory.slice(-10);
    const growthTrend = this.detectGrowthTrend(recentFlows);
    
    if (growthTrend > 0.3) {
      insights.push({
        type: 'growth',
        content: 'Your recent journey shows consistent growth and integration',
        confidence: 0.75,
        timestamp: new Date(),
        relatedFlows: recentFlows.map(f => f.flowType)
      });
    }

    // Check for warning signs
    const warningSign = this.detectWarningPatterns(profile);
    if (warningSign) {
      insights.push(warningSign);
    }

    return insights;
  }

  /**
   * Update flow preferences based on experience
   */
  private async updateFlowPreferences(
    profile: UserFlowProfile,
    flowRecord: FlowRecord
  ): Promise<void> {
    let preference = profile.preferredFlows.find(
      p => p.flowType === flowRecord.flowType
    );

    if (!preference) {
      preference = {
        flowType: flowRecord.flowType,
        preferenceScore: 0,
        effectiveness: flowRecord.effectiveness,
        frequency: 1,
        conditions: {}
      };
      profile.preferredFlows.push(preference);
    } else {
      // Update with exponential moving average
      preference.effectiveness = 
        preference.effectiveness * (1 - this.learningRate) + 
        flowRecord.effectiveness * this.learningRate;
      
      preference.frequency++;
      
      // Update preference score based on effectiveness and emotional impact
      const impactFactor = flowRecord.emotionalImpact > 0 ? 1.2 : 0.8;
      preference.preferenceScore = 
        preference.preferenceScore * (1 - this.learningRate) + 
        (flowRecord.effectiveness * impactFactor) * this.learningRate;
    }

    // Update conditions
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 17 ? 'afternoon' : 'evening';
    
    if (!preference.conditions!.timeOfDay) {
      preference.conditions!.timeOfDay = [];
    }
    
    if (flowRecord.effectiveness > 0.7) {
      if (!preference.conditions!.timeOfDay.includes(timeOfDay)) {
        preference.conditions!.timeOfDay.push(timeOfDay);
      }
    }

    // Identify flows to avoid
    if (preference.effectiveness < 0.3 && preference.frequency > 3) {
      if (!profile.avoidFlows.includes(flowRecord.flowType)) {
        profile.avoidFlows.push(flowRecord.flowType);
      }
    }
  }

  /**
   * Assess current user phase
   */
  private assessUserPhase(profile: UserFlowProfile): UserPhase['current'] {
    const recentFlows = profile.flowHistory.slice(-20);
    
    if (recentFlows.length < 5) {
      return 'exploring';
    }

    const flowTypes = new Set(recentFlows.map(f => f.flowType));
    const diversity = flowTypes.size / recentFlows.length;
    const avgEffectiveness = recentFlows.reduce((sum, f) => 
      sum + f.effectiveness, 0) / recentFlows.length;
    const hasDeepWork = recentFlows.some(f => 
      ['shadow_work', 'archetypal_exploration'].includes(f.flowType)
    );
    const hasIntegration = recentFlows.some(f => 
      f.flowType === 'integration_process'
    );

    // Determine phase
    if (diversity > 0.7) {
      return 'exploring';
    } else if (hasDeepWork && avgEffectiveness > 0.6) {
      return 'deepening';
    } else if (hasIntegration && avgEffectiveness > 0.7) {
      return 'integrating';
    } else if (avgEffectiveness > 0.8 && diversity < 0.3) {
      return 'transforming';
    } else {
      return 'stabilizing';
    }
  }

  /**
   * Get complementary flows
   */
  private getComplementaryFlows(flowType: FlowType): FlowType[] {
    const complementaryMap: Record<FlowType, FlowType[]> = {
      'shadow_work': ['grounding_exercise', 'integration_process'],
      'archetypal_exploration': ['journal_reflection', 'grounding_exercise'],
      'crisis_support': ['somatic_practice', 'grounding_exercise'],
      'celebration_acknowledgment': ['ritual_ceremony', 'oracle_guidance'],
      'grounding_exercise': ['journal_reflection', 'somatic_practice'],
      'journal_reflection': ['oracle_guidance', 'integration_process'],
      'oracle_guidance': ['journal_reflection', 'ritual_ceremony'],
      'ritual_ceremony': ['integration_process', 'celebration_acknowledgment'],
      'somatic_practice': ['grounding_exercise', 'journal_reflection'],
      'integration_process': ['oracle_guidance', 'celebration_acknowledgment'],
      'dream_analysis': ['journal_reflection', 'archetypal_exploration'],
      'elemental_balancing': ['grounding_exercise', 'ritual_ceremony'],
      'voice_dialogue': ['journal_reflection', 'oracle_guidance']
    };

    return complementaryMap[flowType] || ['oracle_guidance'];
  }

  /**
   * Helper methods
   */

  private async createUserProfile(userId: string): Promise<UserFlowProfile> {
    const profile: UserFlowProfile = {
      userId,
      preferredFlows: [],
      avoidFlows: [],
      effectivePatterns: [],
      currentPhase: {
        current: 'exploring',
        startDate: new Date(),
        keyThemes: [],
        recommendedFlows: ['oracle_guidance', 'journal_reflection']
      },
      flowHistory: [],
      adaptations: [],
      insights: []
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  private findSequences(
    history: FlowRecord[],
    predicate: (flows: FlowType[]) => boolean
  ): FlowType[][] {
    const sequences: FlowType[][] = [];
    
    for (let i = 0; i < history.length - 2; i++) {
      const sequence = history.slice(i, i + 3).map(f => f.flowType);
      if (predicate(sequence)) {
        sequences.push(sequence);
      }
    }
    
    return sequences;
  }

  private isEscalatingSequence(flows: FlowType[]): boolean {
    const intensityMap: Record<FlowType, number> = {
      'grounding_exercise': 1,
      'journal_reflection': 2,
      'oracle_guidance': 3,
      'ritual_ceremony': 4,
      'archetypal_exploration': 5,
      'shadow_work': 6,
      'crisis_support': 0,
      'somatic_practice': 1,
      'celebration_acknowledgment': 3,
      'integration_process': 3,
      'dream_analysis': 4,
      'elemental_balancing': 2,
      'voice_dialogue': 2
    };

    const intensities = flows.map(f => intensityMap[f] || 3);
    return intensities.every((val, i) => i === 0 || val >= intensities[i - 1]);
  }

  private isDeescalatingSequence(flows: FlowType[]): boolean {
    const intensityMap: Record<FlowType, number> = {
      'grounding_exercise': 1,
      'journal_reflection': 2,
      'oracle_guidance': 3,
      'ritual_ceremony': 4,
      'archetypal_exploration': 5,
      'shadow_work': 6,
      'crisis_support': 0,
      'somatic_practice': 1,
      'celebration_acknowledgment': 3,
      'integration_process': 3,
      'dream_analysis': 4,
      'elemental_balancing': 2,
      'voice_dialogue': 2
    };

    const intensities = flows.map(f => intensityMap[f] || 3);
    return intensities.every((val, i) => i === 0 || val <= intensities[i - 1]);
  }

  private calculateSequenceEffectiveness(
    sequence: FlowType[],
    history: FlowRecord[]
  ): number {
    const relevantFlows = history.filter(f => sequence.includes(f.flowType));
    if (relevantFlows.length === 0) return 0.5;
    
    return relevantFlows.reduce((sum, f) => sum + f.effectiveness, 0) / relevantFlows.length;
  }

  private calculateEmotionalShift(before: any, after: any): number {
    // Simplified calculation - would be more complex in production
    const valenceShift = (after.valence || 0) - (before.valence || 0);
    const arousalShift = Math.abs((after.arousal || 0.5) - 0.5) - 
                         Math.abs((before.arousal || 0.5) - 0.5);
    
    return (valenceShift + arousalShift) / 2;
  }

  private assessGroundingEffect(context: FlowContext): number {
    // Check various grounding indicators
    let groundingScore = 0.5;
    
    if (context.emotionalStateAfter?.arousal < context.emotionalStateBefore?.arousal) {
      groundingScore += 0.2;
    }
    
    if (context.sessionDuration > 600000) { // Over 10 minutes
      groundingScore += 0.1;
    }
    
    return Math.min(1, groundingScore);
  }

  private detectDailyRhythm(history: FlowRecord[]): FlowPattern | null {
    // Group flows by hour of day
    const hourlyFlows: Record<number, FlowType[]> = {};
    
    for (const flow of history) {
      const hour = flow.timestamp.getHours();
      if (!hourlyFlows[hour]) hourlyFlows[hour] = [];
      hourlyFlows[hour].push(flow.flowType);
    }
    
    // Find most common pattern
    const morningFlows = Object.entries(hourlyFlows)
      .filter(([h]) => parseInt(h) >= 6 && parseInt(h) < 12)
      .flatMap(([_, flows]) => flows);
    
    if (morningFlows.length > 5) {
      const mostCommon = this.getMostCommonFlow(morningFlows);
      return {
        userId: history[0].flowType, // Simplified
        patternType: 'daily_rhythm',
        flows: [mostCommon],
        frequency: morningFlows.filter(f => f === mostCommon).length,
        effectiveness: 0.7,
        emotionalImpact: 0,
        lastSeen: new Date()
      };
    }
    
    return null;
  }

  private detectCrisisPattern(history: FlowRecord[]): FlowPattern | null {
    const crisisFlows = history.filter(f => f.flowType === 'crisis_support');
    
    if (crisisFlows.length >= 2) {
      // Find what typically follows crisis
      const postCrisisFlows: FlowType[] = [];
      
      for (let i = 0; i < history.length - 1; i++) {
        if (history[i].flowType === 'crisis_support') {
          postCrisisFlows.push(history[i + 1].flowType);
        }
      }
      
      return {
        userId: history[0].flowType, // Simplified
        patternType: 'crisis',
        flows: ['crisis_support', ...postCrisisFlows],
        frequency: crisisFlows.length,
        effectiveness: 0.8,
        emotionalImpact: -0.8,
        lastSeen: crisisFlows[crisisFlows.length - 1].timestamp
      };
    }
    
    return null;
  }

  private detectGrowthTrend(flows: FlowRecord[]): number {
    if (flows.length < 3) return 0;
    
    const effectivenessValues = flows.map(f => f.effectiveness);
    let trend = 0;
    
    for (let i = 1; i < effectivenessValues.length; i++) {
      trend += effectivenessValues[i] - effectivenessValues[i - 1];
    }
    
    return trend / (effectivenessValues.length - 1);
  }

  private detectWarningPatterns(profile: UserFlowProfile): FlowInsight | null {
    const recentFlows = profile.flowHistory.slice(-10);
    
    // Check for crisis escalation
    const crisisCount = recentFlows.filter(f => 
      f.flowType === 'crisis_support'
    ).length;
    
    if (crisisCount >= 3) {
      return {
        type: 'warning',
        content: 'Multiple crisis interventions detected - consider professional support',
        confidence: 0.9,
        timestamp: new Date(),
        relatedFlows: ['crisis_support']
      };
    }
    
    // Check for avoidance patterns
    const uniqueFlows = new Set(recentFlows.map(f => f.flowType));
    if (uniqueFlows.size === 1 && recentFlows.length >= 5) {
      return {
        type: 'warning',
        content: `Stuck in ${recentFlows[0].flowType} pattern - variety needed`,
        confidence: 0.7,
        timestamp: new Date(),
        relatedFlows: [recentFlows[0].flowType]
      };
    }
    
    return null;
  }

  private identifyKeyThemes(profile: UserFlowProfile): string[] {
    const themes: string[] = [];
    const recentFlows = profile.flowHistory.slice(-20);
    
    // Count flow types
    const flowCounts: Record<string, number> = {};
    for (const flow of recentFlows) {
      flowCounts[flow.flowType] = (flowCounts[flow.flowType] || 0) + 1;
    }
    
    // Map to themes
    if (flowCounts['shadow_work'] > 2) themes.push('shadow integration');
    if (flowCounts['archetypal_exploration'] > 2) themes.push('archetypal work');
    if (flowCounts['grounding_exercise'] > 5) themes.push('embodiment');
    if (flowCounts['journal_reflection'] > 5) themes.push('self-reflection');
    if (flowCounts['crisis_support'] > 1) themes.push('crisis navigation');
    
    return themes;
  }

  private getPhaseRecommendations(phase: UserPhase['current']): FlowType[] {
    const recommendations: Record<UserPhase['current'], FlowType[]> = {
      'exploring': ['oracle_guidance', 'journal_reflection', 'grounding_exercise'],
      'deepening': ['archetypal_exploration', 'shadow_work', 'dream_analysis'],
      'integrating': ['integration_process', 'journal_reflection', 'ritual_ceremony'],
      'transforming': ['ritual_ceremony', 'archetypal_exploration', 'celebration_acknowledgment'],
      'stabilizing': ['grounding_exercise', 'elemental_balancing', 'somatic_practice']
    };
    
    return recommendations[phase];
  }

  private getTimeAppropriateFlows(
    timeOfDay: string,
    profile: UserFlowProfile
  ): { recommended: FlowType[], avoid: FlowType[] } {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 9) { // Early morning
      return {
        recommended: ['grounding_exercise', 'ritual_ceremony', 'oracle_guidance'],
        avoid: ['shadow_work', 'crisis_support']
      };
    } else if (hour >= 9 && hour < 17) { // Day
      return {
        recommended: ['oracle_guidance', 'journal_reflection', 'archetypal_exploration'],
        avoid: []
      };
    } else if (hour >= 17 && hour < 21) { // Evening
      return {
        recommended: ['integration_process', 'journal_reflection', 'elemental_balancing'],
        avoid: ['shadow_work']
      };
    } else { // Night
      return {
        recommended: ['dream_analysis', 'somatic_practice', 'grounding_exercise'],
        avoid: ['shadow_work', 'archetypal_exploration']
      };
    }
  }

  private getEmotionallyAppropriateFlows(
    emotionalState: any,
    profile: UserFlowProfile
  ): { recommended: FlowType[], avoid: FlowType[], rationale?: string } {
    if (emotionalState.needsSupport) {
      return {
        recommended: ['grounding_exercise', 'somatic_practice', 'journal_reflection'],
        avoid: ['shadow_work', 'archetypal_exploration'],
        rationale: 'Prioritizing supportive and grounding flows'
      };
    }
    
    if (emotionalState.valence > 0.5) { // Positive state
      return {
        recommended: ['celebration_acknowledgment', 'ritual_ceremony', 'oracle_guidance'],
        avoid: ['crisis_support'],
        rationale: 'Amplifying positive energy'
      };
    }
    
    return {
      recommended: ['oracle_guidance', 'journal_reflection'],
      avoid: [],
      rationale: 'Balanced approach for neutral state'
    };
  }

  private getMostCommonFlow(flows: FlowType[]): FlowType {
    const counts: Record<string, number> = {};
    for (const flow of flows) {
      counts[flow] = (counts[flow] || 0) + 1;
    }
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0] as FlowType;
  }

  private getDefaultRecommendations(): {
    recommended: FlowType[];
    avoid: FlowType[];
    rationale: string[];
  } {
    return {
      recommended: ['oracle_guidance', 'journal_reflection', 'grounding_exercise'],
      avoid: ['shadow_work', 'crisis_support'],
      rationale: ['Default recommendations for new user']
    };
  }

  private getDefaultEffectiveness(flowType: FlowType): FlowEffectiveness {
    return {
      flowType,
      context: {
        emotionalStateBefore: {},
        emotionalStateAfter: {},
        timeOfDay: 'unknown',
        sessionDuration: 0
      },
      outcomes: [],
      overallScore: 0.5
    };
  }

  private async loadPersistedData(): Promise<void> {
    try {
      const { data } = await supabase
        .from('flow_memory')
        .select('*');
      
      if (data) {
        for (const record of data) {
          this.userProfiles.set(record.user_id, record.profile);
        }
      }
    } catch (error) {
      logger.error('Failed to load flow memory:', error);
    }
  }

  private async persistProfile(profile: UserFlowProfile): Promise<void> {
    try {
      await supabase
        .from('flow_memory')
        .upsert({
          user_id: profile.userId,
          profile: profile,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      logger.error('Failed to persist flow memory:', error);
    }
  }
}

// Export singleton instance
export const flowMemory = new FlowMemory();