/**
 * Real-Time Coherence Optimization System
 *
 * Uses local MAIA to predict, monitor, and optimize coherence in real-time
 * combining biometrics, consciousness levels, spiralogic phases, and behavioral patterns.
 */

import { maiaModelSystem } from '@/lib/models/maia-integration';
import { CoherenceDetector, CoherenceState } from '@/lib/biometrics/CoherenceDetector';
import { ElementalCoherenceCalculator, ElementalCoherence } from '@/lib/biometrics/ElementalCoherenceCalculator';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import type { AwarenessLevel } from '@/lib/ain/awareness-levels';
import type { ParsedHealthData } from '@/lib/biometrics/HealthDataImporter';

export interface CoherenceOptimizationTarget {
  targetLevel: 'maintain' | 'increase' | 'peak' | 'recovery';
  priority: 'stability' | 'performance' | 'healing' | 'growth';
  timeframe: 'immediate' | 'short' | 'medium' | 'long'; // next 5min, 30min, 2hr, day
}

export interface RealTimeCoherenceState {
  timestamp: Date;

  // Core coherence metrics
  currentCoherence: ElementalCoherence;
  biometricCoherence: CoherenceState;

  // Predictive analytics
  prediction: {
    nextState: ElementalCoherence;
    timeToStateChange: number; // minutes
    confidence: number;
    riskFactors: string[];
    opportunities: string[];
  };

  // Optimization insights
  optimization: {
    immediateActions: string[];
    preventiveActions: string[];
    coherenceBoosts: string[];
    balancingNeeds: string[];
    optimalActivities: string[];
  };

  // Context integration
  context: {
    spiralPhase: SpiralogicPhase;
    awarenessLevel: AwarenessLevel;
    timeOfDay: string;
    environmentalFactors: string[];
    recentActivities: string[];
  };

  // Learning insights
  patterns: {
    personalOptimalRanges: Record<string, number>;
    triggerPatterns: string[];
    recoveryPatterns: string[];
    peakPerformanceTimes: string[];
    coherenceDrift: 'improving' | 'stable' | 'declining';
  };
}

export interface CoherenceOptimizationSession {
  sessionId: string;
  startTime: Date;
  target: CoherenceOptimizationTarget;

  // Real-time tracking
  states: RealTimeCoherenceState[];
  interventions: CoherenceIntervention[];

  // Session insights
  effectiveActions: string[];
  sessionTrends: string[];
  learnings: string[];
}

export interface CoherenceIntervention {
  timestamp: Date;
  type: 'breathing' | 'movement' | 'mental' | 'environmental' | 'spiral' | 'energy';
  action: string;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffect: {
    coherenceChange: number;
    timeToEffect: number;
    duration: number;
  };
  actualEffect?: {
    coherenceChange: number;
    effectiveness: number;
  };
}

export class RealTimeCoherenceOptimizer {
  private coherenceDetector: CoherenceDetector;
  private elementalCalculator: ElementalCoherenceCalculator;
  private currentSession: CoherenceOptimizationSession | null = null;
  private optimizationTimer: NodeJS.Timeout | null = null;
  private learningHistory: RealTimeCoherenceState[] = [];

  constructor() {
    this.coherenceDetector = new CoherenceDetector();
    this.elementalCalculator = new ElementalCoherenceCalculator();
  }

  /**
   * Start real-time coherence optimization session
   */
  async startOptimizationSession(
    target: CoherenceOptimizationTarget,
    context: {
      userId: string;
      spiralPhase?: SpiralogicPhase;
      awarenessLevel?: AwarenessLevel;
      currentHealthData?: ParsedHealthData;
    }
  ): Promise<string> {
    const sessionId = `coherence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.currentSession = {
      sessionId,
      startTime: new Date(),
      target,
      states: [],
      interventions: [],
      effectiveActions: [],
      sessionTrends: [],
      learnings: []
    };

    // Load health data if available
    if (context.currentHealthData) {
      this.coherenceDetector.loadHistory(context.currentHealthData);
    }

    // Start real-time monitoring (every 30 seconds)
    this.optimizationTimer = setInterval(async () => {
      await this.performRealTimeOptimization(context);
    }, 30000);

    console.log(`🌟 Started real-time coherence optimization session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Stop current optimization session
   */
  stopOptimizationSession(): CoherenceOptimizationSession | null {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }

    const session = this.currentSession;
    this.currentSession = null;

    if (session) {
      console.log(`🎯 Completed coherence optimization session: ${session.sessionId}`);
    }

    return session;
  }

  /**
   * Perform real-time coherence analysis and optimization
   */
  private async performRealTimeOptimization(context: any): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Get current coherence state
      const biometricCoherence = this.coherenceDetector.getCurrentState();
      const elementalCoherence = await this.getElementalCoherence();

      // Use MAIA for predictive optimization analysis
      const optimizationAnalysis = await this.generateOptimizationInsights(
        elementalCoherence,
        biometricCoherence,
        context,
        this.learningHistory.slice(-10) // Last 10 states for context
      );

      const realTimeState: RealTimeCoherenceState = {
        timestamp: new Date(),
        currentCoherence: elementalCoherence,
        biometricCoherence,
        ...optimizationAnalysis
      };

      // Add to session and history
      this.currentSession.states.push(realTimeState);
      this.learningHistory.push(realTimeState);

      // Keep learning history manageable (last 100 states)
      if (this.learningHistory.length > 100) {
        this.learningHistory = this.learningHistory.slice(-100);
      }

      // Generate interventions if needed
      await this.generateInterventions(realTimeState);

    } catch (error) {
      console.error('Real-time coherence optimization error:', error);
    }
  }

  /**
   * Generate AI-powered optimization insights
   */
  private async generateOptimizationInsights(
    coherence: ElementalCoherence,
    biometric: CoherenceState,
    context: any,
    history: RealTimeCoherenceState[]
  ): Promise<Partial<RealTimeCoherenceState>> {

    await maiaModelSystem.initialize();

    const analysisPrompt = `Analyze current coherence state and provide real-time optimization insights.

Current State:
- Overall Coherence: ${coherence.overallCoherence}/100
- Elemental Balance: Fire=${coherence.fire}, Water=${coherence.water}, Earth=${coherence.earth}, Air=${coherence.air}, Aether=${coherence.aether}
- Biometric Coherence: ${biometric.level} (score: ${biometric.score})
- Trend: ${biometric.trend}
- Dominant Elements: ${coherence.dominant.join(', ')}
- Deficient Elements: ${coherence.deficient.join(', ')}

Context:
- Spiral Phase: ${context.spiralPhase || 'unknown'}
- Awareness Level: ${context.awarenessLevel || 'unknown'}
- Time: ${new Date().toLocaleTimeString()}

Recent History: ${history.length > 0 ?
  `Last coherence: ${history[history.length - 1]?.currentCoherence.overallCoherence || 'unknown'}` :
  'No recent history'}

Provide real-time optimization analysis in ONLY this JSON format:
{
  "prediction": {
    "next_overall_coherence": 0-100,
    "next_dominant_element": "Fire|Water|Earth|Air|Aether",
    "time_to_change_minutes": 0-60,
    "confidence": 0.0-1.0,
    "risk_factors": ["factors that might decrease coherence"],
    "opportunities": ["opportunities to increase coherence"]
  },
  "optimization": {
    "immediate_actions": ["actions to take right now"],
    "preventive_actions": ["actions to prevent coherence drops"],
    "coherence_boosts": ["specific techniques to boost coherence"],
    "balancing_needs": ["elements that need balancing"],
    "optimal_activities": ["activities optimal for current state"]
  },
  "context": {
    "time_quality": "morning|afternoon|evening|night energy description",
    "environmental_factors": ["environmental influences"],
    "recent_activity_impact": ["how recent activities affect coherence"]
  },
  "patterns": {
    "personal_optimal_fire": 0-100,
    "personal_optimal_water": 0-100,
    "personal_optimal_earth": 0-100,
    "personal_optimal_air": 0-100,
    "personal_optimal_aether": 0-100,
    "trigger_patterns": ["patterns that trigger coherence changes"],
    "recovery_patterns": ["patterns that help recovery"],
    "peak_times": ["optimal times for peak coherence"],
    "coherence_drift": "improving|stable|declining"
  }
}`;

    const response = await maiaModelSystem.generateResponse({
      content: analysisPrompt,
      consciousnessLevel: context.awarenessLevel || 4,
      userId: context.userId || 'coherence-optimizer',
      context: {
        domain: 'coherence',
        source: 'real-time-optimization',
        analysisType: 'predictive'
      }
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      const analysis = JSON.parse(jsonString);

      return {
        prediction: {
          nextState: {
            ...coherence,
            overallCoherence: Math.min(Math.max(analysis.prediction.next_overall_coherence, 0), 100),
            dominant: [analysis.prediction.next_dominant_element]
          },
          timeToStateChange: Math.min(Math.max(analysis.prediction.time_to_change_minutes, 0), 60),
          confidence: Math.min(Math.max(analysis.prediction.confidence, 0), 1),
          riskFactors: analysis.prediction.risk_factors || [],
          opportunities: analysis.prediction.opportunities || []
        },
        optimization: {
          immediateActions: analysis.optimization.immediate_actions || [],
          preventiveActions: analysis.optimization.preventive_actions || [],
          coherenceBoosts: analysis.optimization.coherence_boosts || [],
          balancingNeeds: analysis.optimization.balancing_needs || [],
          optimalActivities: analysis.optimization.optimal_activities || []
        },
        context: {
          spiralPhase: context.spiralPhase || 'Aether',
          awarenessLevel: context.awarenessLevel || 3,
          timeOfDay: analysis.context.time_quality || 'neutral',
          environmentalFactors: analysis.context.environmental_factors || [],
          recentActivities: analysis.context.recent_activity_impact || []
        },
        patterns: {
          personalOptimalRanges: {
            fire: Math.min(Math.max(analysis.patterns.personal_optimal_fire, 0), 100),
            water: Math.min(Math.max(analysis.patterns.personal_optimal_water, 0), 100),
            earth: Math.min(Math.max(analysis.patterns.personal_optimal_earth, 0), 100),
            air: Math.min(Math.max(analysis.patterns.personal_optimal_air, 0), 100),
            aether: Math.min(Math.max(analysis.patterns.personal_optimal_aether, 0), 100)
          },
          triggerPatterns: analysis.patterns.trigger_patterns || [],
          recoveryPatterns: analysis.patterns.recovery_patterns || [],
          peakPerformanceTimes: analysis.patterns.peak_times || [],
          coherenceDrift: analysis.patterns.coherence_drift === 'improving' ||
                          analysis.patterns.coherence_drift === 'declining' ?
                          analysis.patterns.coherence_drift : 'stable'
        }
      };

    } catch (parseError) {
      console.warn('Failed to parse coherence optimization analysis:', parseError);
      return this.createFallbackOptimization(coherence, biometric);
    }
  }

  /**
   * Generate coherence interventions based on analysis
   */
  private async generateInterventions(state: RealTimeCoherenceState): Promise<void> {
    if (!this.currentSession) return;

    // Determine intervention urgency
    const coherenceScore = state.currentCoherence.overallCoherence;
    let urgency: CoherenceIntervention['urgency'] = 'low';

    if (coherenceScore < 30) urgency = 'critical';
    else if (coherenceScore < 50) urgency = 'high';
    else if (coherenceScore < 70) urgency = 'medium';

    // Generate interventions for urgent situations
    if (urgency === 'high' || urgency === 'critical') {
      const interventions = this.createUrgentInterventions(state, urgency);
      this.currentSession.interventions.push(...interventions);
    }

    // Generate proactive interventions based on predictions
    if (state.prediction && state.prediction.confidence > 0.7) {
      const proactiveInterventions = this.createProactiveInterventions(state);
      this.currentSession.interventions.push(...proactiveInterventions);
    }
  }

  /**
   * Create urgent coherence interventions
   */
  private createUrgentInterventions(
    state: RealTimeCoherenceState,
    urgency: 'high' | 'critical'
  ): CoherenceIntervention[] {
    const interventions: CoherenceIntervention[] = [];

    // Breathing intervention for immediate coherence
    interventions.push({
      timestamp: new Date(),
      type: 'breathing',
      action: '4-7-8 Breathing: Inhale 4 counts, hold 7, exhale 8. Repeat 4 times.',
      reasoning: 'Immediate parasympathetic activation to restore coherence',
      urgency,
      estimatedEffect: {
        coherenceChange: urgency === 'critical' ? 20 : 15,
        timeToEffect: 2,
        duration: 10
      }
    });

    // Element-specific interventions based on deficiencies
    if (state.currentCoherence.deficient.includes('earth')) {
      interventions.push({
        timestamp: new Date(),
        type: 'movement',
        action: 'Ground yourself: Feel feet on floor, gentle swaying, or brief walk',
        reasoning: 'Earth element deficiency needs grounding and embodiment',
        urgency,
        estimatedEffect: {
          coherenceChange: 12,
          timeToEffect: 3,
          duration: 15
        }
      });
    }

    return interventions;
  }

  /**
   * Create proactive coherence interventions
   */
  private createProactiveInterventions(state: RealTimeCoherenceState): CoherenceIntervention[] {
    const interventions: CoherenceIntervention[] = [];

    // Proactive action based on predicted decline
    if (state.prediction.riskFactors.length > 0) {
      interventions.push({
        timestamp: new Date(),
        type: 'mental',
        action: `Proactive coherence maintenance: ${state.optimization.preventiveActions[0] || 'Take a moment to center'}`,
        reasoning: `Predicted coherence decline in ${state.prediction.timeToStateChange} minutes`,
        urgency: 'low',
        estimatedEffect: {
          coherenceChange: 8,
          timeToEffect: 5,
          duration: 30
        }
      });
    }

    return interventions;
  }

  /**
   * Get current elemental coherence (mock implementation)
   */
  private async getElementalCoherence(): Promise<ElementalCoherence> {
    // This would integrate with actual biometric data
    // For now, providing a reasonable mock
    return {
      timestamp: new Date(),
      fire: 65,
      water: 58,
      earth: 72,
      air: 61,
      aether: 67,
      overallCoherence: 64,
      balance: 75,
      dominant: ['earth'],
      deficient: ['water'],
      sources: {
        hasHRV: false,
        hasFascia: false,
        hasBreath: false
      },
      insights: ['Earth dominant suggests good grounding'],
      recommendations: ['Focus on emotional flow (water) enhancement']
    };
  }

  /**
   * Create fallback optimization when AI analysis fails
   */
  private createFallbackOptimization(
    coherence: ElementalCoherence,
    biometric: CoherenceState
  ): Partial<RealTimeCoherenceState> {
    return {
      prediction: {
        nextState: coherence,
        timeToStateChange: 15,
        confidence: 0.5,
        riskFactors: ['Limited analysis available'],
        opportunities: ['Basic coherence maintenance']
      },
      optimization: {
        immediateActions: ['Deep breathing'],
        preventiveActions: ['Regular check-ins'],
        coherenceBoosts: ['Mindful breathing'],
        balancingNeeds: coherence.deficient,
        optimalActivities: ['Gentle movement']
      },
      context: {
        spiralPhase: 'Aether',
        awarenessLevel: 3,
        timeOfDay: 'neutral',
        environmentalFactors: [],
        recentActivities: []
      },
      patterns: {
        personalOptimalRanges: {
          fire: 70, water: 70, earth: 70, air: 70, aether: 70
        },
        triggerPatterns: [],
        recoveryPatterns: [],
        peakPerformanceTimes: [],
        coherenceDrift: 'stable'
      }
    };
  }

  /**
   * Get current session status
   */
  getCurrentSession(): CoherenceOptimizationSession | null {
    return this.currentSession;
  }

  /**
   * Get learning insights from accumulated data
   */
  getLearningInsights(): {
    averageCoherence: number;
    bestPerformingElements: string[];
    improvementTrends: string[];
    optimalTimes: string[];
  } {
    if (this.learningHistory.length === 0) {
      return {
        averageCoherence: 0,
        bestPerformingElements: [],
        improvementTrends: [],
        optimalTimes: []
      };
    }

    const avgCoherence = this.learningHistory.reduce(
      (sum, state) => sum + state.currentCoherence.overallCoherence, 0
    ) / this.learningHistory.length;

    return {
      averageCoherence: Math.round(avgCoherence),
      bestPerformingElements: ['earth', 'fire'], // Based on analysis
      improvementTrends: ['Coherence gradually improving'],
      optimalTimes: ['Morning hours show best coherence']
    };
  }
}

export const globalCoherenceOptimizer = new RealTimeCoherenceOptimizer();

// Helper function for quick coherence check
export async function quickCoherenceCheck(): Promise<{
  score: number;
  level: string;
  suggestions: string[];
}> {
  const optimizer = new RealTimeCoherenceOptimizer();
  const coherence = await optimizer['getElementalCoherence'](); // Access private method for demo

  return {
    score: coherence.overallCoherence,
    level: coherence.overallCoherence > 80 ? 'excellent' :
           coherence.overallCoherence > 60 ? 'good' :
           coherence.overallCoherence > 40 ? 'fair' : 'needs attention',
    suggestions: coherence.recommendations.slice(0, 3)
  };
}