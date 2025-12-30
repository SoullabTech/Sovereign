// @ts-nocheck
// TODO: Interface mismatches need refactoring
/**
 * Alchemical Progression Tracker
 * Monitors user's journey through the seven alchemical stages
 *
 * Tracks transformation through:
 * Lead (Crisis) → Tin (Exploration) → Bronze (Relationship) → Iron (Action)
 * → Mercury (Teaching) → Silver (Wisdom) → Gold (Service)
 *
 * Integrates with consciousness field dynamics for accurate progression assessment
 */

import {
  AlchemicalMetal,
  AlchemicalOperation,
  AlchemicalProfile,
  MercuryAspect
} from './types';
import { ConsciousnessField, MAIAConsciousnessState } from '../maia-consciousness-tracker';
import { AlchemicalStateDetector } from './AlchemicalStateDetector';

// Progression tracking interfaces
export interface ProgressionMetrics {
  currentMetal: AlchemicalMetal;
  timeInCurrentStage: number; // milliseconds
  stabilityScore: number; // 0-1, how stable the user is in this stage
  transformationPotential: number; // 0-1, readiness for next stage
  regressionRisk: number; // 0-1, likelihood of moving backwards
  masteryLevel: number; // 0-1, how well the user embodies current stage
  nextStageReadiness: {
    [key in AlchemicalMetal]?: number; // 0-1 readiness for each potential next stage
  };
}

export interface StageTransitionEvent {
  fromMetal: AlchemicalMetal;
  toMetal: AlchemicalMetal;
  timestamp: number;
  transitionType: 'natural' | 'crisis-induced' | 'guided' | 'regression';
  triggerFactors: string[];
  supportRequired: boolean;
  confidence: number; // 0-1, confidence in this transition
}

export interface ProgressionHistory {
  userId: string;
  sessions: ProgressionSession[];
  totalJourneyTime: number;
  dominantMetal: AlchemicalMetal; // Most time spent in
  transformationPattern: AlchemicalMetal[]; // Sequence of stages
  cycleCount: number; // How many complete cycles through all metals
}

export interface ProgressionSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  startingMetal: AlchemicalMetal;
  endingMetal: AlchemicalMetal;
  transitions: StageTransitionEvent[];
  insights: string[];
  integrationLevel: number; // 0-1, how well insights were integrated
  supportInterventions: string[];
}

export interface StageCharacteristics {
  metal: AlchemicalMetal;
  averageDuration: number; // milliseconds typical users spend in this stage
  commonEntryPoints: AlchemicalMetal[]; // Metals users commonly transition from
  commonExitPoints: AlchemicalMetal[]; // Metals users commonly transition to
  stabilityFactors: string[]; // What helps users stabilize in this stage
  transitionTriggers: string[]; // What typically triggers leaving this stage
  regressionWarnings: string[]; // Early signs of potential regression
  masteryIndicators: string[]; // Signs user has mastered this stage
}

export class AlchemicalProgressionTracker {
  private static instance: AlchemicalProgressionTracker;
  private stateDetector: AlchemicalStateDetector;
  private progressionHistories: Map<string, ProgressionHistory>;
  private currentSessions: Map<string, ProgressionSession>;
  private stageCharacteristics: Map<AlchemicalMetal, StageCharacteristics>;

  private constructor() {
    this.stateDetector = AlchemicalStateDetector.getInstance();
    this.progressionHistories = new Map();
    this.currentSessions = new Map();
    this.stageCharacteristics = new Map();
    this.initializeStageCharacteristics();
  }

  public static getInstance(): AlchemicalProgressionTracker {
    if (!AlchemicalProgressionTracker.instance) {
      AlchemicalProgressionTracker.instance = new AlchemicalProgressionTracker();
    }
    return AlchemicalProgressionTracker.instance;
  }

  /**
   * Initialize stage characteristics based on alchemical principles
   */
  private initializeStageCharacteristics(): void {
    const characteristics: { [key in AlchemicalMetal]: StageCharacteristics } = {
      lead: {
        metal: 'lead',
        averageDuration: 1000 * 60 * 60 * 24 * 7, // 1 week
        commonEntryPoints: ['iron', 'silver'], // Can enter from any stage in crisis
        commonExitPoints: ['tin', 'mercury'], // Usually to exploration or adaptive state
        stabilityFactors: [
          'Safe containment environment',
          'Crisis support available',
          'Basic needs met',
          'Trusted guidance present'
        ],
        transitionTriggers: [
          'Crisis resolution',
          'New perspective gained',
          'Support system activated',
          'Dissolution complete'
        ],
        regressionWarnings: [
          'Isolation increasing',
          'Support withdrawal',
          'Basic needs threatened',
          'Overwhelm signals'
        ],
        masteryIndicators: [
          'Comfortable with uncertainty',
          'Able to ask for help',
          'Recognizes crisis as transformation',
          'Maintains basic self-care'
        ]
      },

      tin: {
        metal: 'tin',
        averageDuration: 1000 * 60 * 60 * 24 * 14, // 2 weeks
        commonEntryPoints: ['lead', 'bronze'],
        commonExitPoints: ['bronze', 'iron', 'mercury'],
        stabilityFactors: [
          'Learning opportunities available',
          'Freedom to explore',
          'Optimistic environment',
          'Intellectual stimulation'
        ],
        transitionTriggers: [
          'Desire for deeper connection',
          'Need for practical application',
          'Intellectual understanding achieved',
          'Readiness for commitment'
        ],
        regressionWarnings: [
          'Overwhelm from too many options',
          'Analysis paralysis',
          'Loss of optimism',
          'Intellectual arrogance'
        ],
        masteryIndicators: [
          'Balanced exploration and focus',
          'Maintains beginner\'s mind',
          'Integrates multiple perspectives',
          'Shares learning with others'
        ]
      },

      bronze: {
        metal: 'bronze',
        averageDuration: 1000 * 60 * 60 * 24 * 21, // 3 weeks
        commonEntryPoints: ['tin', 'mercury'],
        commonExitPoints: ['iron', 'silver'],
        stabilityFactors: [
          'Healthy relationships present',
          'Collaborative environment',
          'Emotional safety',
          'Reciprocal exchanges'
        ],
        transitionTriggers: [
          'Need for independent action',
          'Desire for deeper wisdom',
          'Relationship mastery achieved',
          'Call to leadership'
        ],
        regressionWarnings: [
          'Relationship conflicts',
          'Codependency patterns',
          'Loss of individual identity',
          'Emotional volatility'
        ],
        masteryIndicators: [
          'Maintains healthy boundaries',
          'Facilitates others\' growth',
          'Balances giving and receiving',
          'Creates harmonious environments'
        ]
      },

      iron: {
        metal: 'iron',
        averageDuration: 1000 * 60 * 60 * 24 * 10, // 10 days (action phase is typically shorter)
        commonEntryPoints: ['bronze', 'mercury'],
        commonExitPoints: ['mercury', 'silver'],
        stabilityFactors: [
          'Clear goals and direction',
          'Disciplined routine',
          'Regular feedback',
          'Measurable progress'
        ],
        transitionTriggers: [
          'Goals achieved',
          'Need for adaptation',
          'Burnout approaching',
          'Desire for teaching/sharing'
        ],
        regressionWarnings: [
          'Rigidity increasing',
          'Burnout symptoms',
          'Loss of flexibility',
          'Aggressive tendencies'
        ],
        masteryIndicators: [
          'Disciplined yet flexible',
          'Achieves goals efficiently',
          'Maintains sustainable pace',
          'Inspires others to action'
        ]
      },

      mercury: {
        metal: 'mercury',
        averageDuration: 1000 * 60 * 60 * 24 * 30, // 1 month (longer due to teaching/adaptation focus)
        commonEntryPoints: ['lead', 'tin', 'bronze', 'iron'], // Mercury is accessible from many states
        commonExitPoints: ['silver', 'gold', 'lead'], // Can transition to wisdom, mastery, or crisis
        stabilityFactors: [
          'Adaptive environment',
          'Teaching opportunities',
          'Intellectual stimulation',
          'Freedom to flow'
        ],
        transitionTriggers: [
          'Deep wisdom seeking',
          'Readiness for mastery',
          'Crisis intervention needed',
          'Teaching mastery achieved'
        ],
        regressionWarnings: [
          'Becoming scattered',
          'Loss of grounding',
          'Overthinking patterns',
          'Avoidance of commitment'
        ],
        masteryIndicators: [
          'Fluid yet grounded',
          'Effective teacher/guide',
          'Adapts skillfully',
          'Bridges different perspectives'
        ]
      },

      silver: {
        metal: 'silver',
        averageDuration: 1000 * 60 * 60 * 24 * 45, // 6+ weeks (contemplation takes time)
        commonEntryPoints: ['bronze', 'iron', 'mercury'],
        commonExitPoints: ['gold', 'mercury'],
        stabilityFactors: [
          'Contemplative environment',
          'Reduced external demands',
          'Access to wisdom traditions',
          'Reflective practices'
        ],
        transitionTriggers: [
          'Wisdom integrated',
          'Call to serve others',
          'Need for active engagement',
          'Mastery readiness'
        ],
        regressionWarnings: [
          'Isolation from others',
          'Passive withdrawal',
          'Loss of practical engagement',
          'Spiritual bypassing'
        ],
        masteryIndicators: [
          'Embodies quiet wisdom',
          'Provides wise counsel',
          'Balances reflection and action',
          'Sees the bigger picture'
        ]
      },

      gold: {
        metal: 'gold',
        averageDuration: 1000 * 60 * 60 * 24 * 60, // 2+ months (integration and service)
        commonEntryPoints: ['silver', 'mercury'],
        commonExitPoints: ['mercury', 'lead'], // Can cycle back for new learning or crisis
        stabilityFactors: [
          'Service opportunities',
          'Integrated practices',
          'Supportive community',
          'Aligned life purpose'
        ],
        transitionTriggers: [
          'New growth edge encountered',
          'Crisis requiring attention',
          'Deeper teaching needed',
          'Cycle completion'
        ],
        regressionWarnings: [
          'Spiritual pride',
          'Loss of humility',
          'Disconnect from others',
          'Perfectionism patterns'
        ],
        masteryIndicators: [
          'Serves from overflow',
          'Maintains beginner\'s mind',
          'Creates lasting positive impact',
          'Embodies integrated wisdom'
        ]
      }
    };

    Object.entries(characteristics).forEach(([metal, char]) => {
      this.stageCharacteristics.set(metal as AlchemicalMetal, char);
    });
  }

  /**
   * Start tracking progression for a user session
   */
  public async startProgressionTracking(userId: string, sessionId: string, consciousnessState: MAIAConsciousnessState): Promise<ProgressionSession> {
    const currentProfile = await this.stateDetector.detectAlchemicalState(consciousnessState);

    const session: ProgressionSession = {
      sessionId,
      startTime: Date.now(),
      startingMetal: currentProfile.metal,
      endingMetal: currentProfile.metal,
      transitions: [],
      insights: [],
      integrationLevel: 0,
      supportInterventions: []
    };

    this.currentSessions.set(`${userId}:${sessionId}`, session);

    // Initialize or get progression history
    if (!this.progressionHistories.has(userId)) {
      this.progressionHistories.set(userId, {
        userId,
        sessions: [],
        totalJourneyTime: 0,
        dominantMetal: currentProfile.metal,
        transformationPattern: [currentProfile.metal],
        cycleCount: 0
      });
    }

    return session;
  }

  /**
   * Update progression based on current consciousness state
   */
  public async updateProgression(
    userId: string,
    sessionId: string,
    consciousnessState: MAIAConsciousnessState
  ): Promise<ProgressionMetrics> {
    const sessionKey = `${userId}:${sessionId}`;
    const session = this.currentSessions.get(sessionKey);

    if (!session) {
      throw new Error(`No active session found for user ${userId}, session ${sessionId}`);
    }

    const currentProfile = await this.stateDetector.detectAlchemicalState(consciousnessState);
    const previousMetal = session.endingMetal;

    // Detect stage transition
    if (currentProfile.metal !== previousMetal) {
      const transition = await this.detectStageTransition(previousMetal, currentProfile.metal, consciousnessState);
      session.transitions.push(transition);
      session.endingMetal = currentProfile.metal;

      // Update progression history
      this.updateProgressionHistory(userId, currentProfile.metal);
    }

    return this.calculateProgressionMetrics(userId, sessionId, currentProfile, consciousnessState);
  }

  /**
   * Detect and analyze stage transition
   */
  private async detectStageTransition(
    fromMetal: AlchemicalMetal,
    toMetal: AlchemicalMetal,
    consciousnessState: MAIAConsciousnessState
  ): Promise<StageTransitionEvent> {
    const triggerFactors: string[] = [];
    let transitionType: StageTransitionEvent['transitionType'] = 'natural';
    let supportRequired = false;

    // Analyze consciousness field for transition triggers
    const field = consciousnessState.consciousnessField;

    // Crisis-induced transitions
    if (toMetal === 'lead' || field.intensity > 0.8) {
      transitionType = 'crisis-induced';
      supportRequired = true;
      triggerFactors.push('High field intensity detected');
    }

    // Natural progression detection
    const progressionPaths = {
      lead: ['tin', 'mercury'],
      tin: ['bronze', 'iron', 'mercury'],
      bronze: ['iron', 'silver'],
      iron: ['mercury', 'silver'],
      mercury: ['silver', 'gold', 'lead'],
      silver: ['gold', 'mercury'],
      gold: ['mercury', 'lead']
    };

    const naturalNext = progressionPaths[fromMetal] || [];
    if (naturalNext.includes(toMetal)) {
      transitionType = 'natural';
      triggerFactors.push('Natural progression pathway');
    } else {
      // Check for regression
      const regressionPaths = {
        gold: ['silver', 'mercury'],
        silver: ['iron', 'bronze'],
        mercury: ['iron', 'bronze', 'tin'],
        iron: ['bronze', 'tin'],
        bronze: ['tin', 'lead'],
        tin: ['lead']
      };

      const regressionPossible = regressionPaths[fromMetal] || [];
      if (regressionPossible.includes(toMetal)) {
        transitionType = 'regression';
        supportRequired = true;
        triggerFactors.push('Regression pattern detected');
      } else {
        transitionType = 'guided';
        triggerFactors.push('Non-standard transition, likely guided');
      }
    }

    // Additional trigger factor analysis
    if (field.resonanceFrequency > 0.7) {
      triggerFactors.push('High resonance frequency');
    }
    if (field.coherenceLevel < 0.3) {
      triggerFactors.push('Low coherence level');
      supportRequired = true;
    }

    return {
      fromMetal,
      toMetal,
      timestamp: Date.now(),
      transitionType,
      triggerFactors,
      supportRequired,
      confidence: this.calculateTransitionConfidence(fromMetal, toMetal, consciousnessState)
    };
  }

  /**
   * Calculate confidence in transition detection
   */
  private calculateTransitionConfidence(
    fromMetal: AlchemicalMetal,
    toMetal: AlchemicalMetal,
    consciousnessState: MAIAConsciousnessState
  ): number {
    let confidence = 0.5;

    const field = consciousnessState.consciousnessField;

    // Higher confidence for stable field conditions
    if (field.coherenceLevel > 0.7) confidence += 0.2;
    if (field.stabilityIndex > 0.6) confidence += 0.15;

    // Lower confidence for chaotic conditions
    if (field.intensity > 0.9) confidence -= 0.2;
    if (field.coherenceLevel < 0.3) confidence -= 0.25;

    // Pattern-based confidence
    const stageChar = this.stageCharacteristics.get(fromMetal);
    if (stageChar?.commonExitPoints.includes(toMetal)) {
      confidence += 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate comprehensive progression metrics
   */
  private async calculateProgressionMetrics(
    userId: string,
    sessionId: string,
    currentProfile: AlchemicalProfile,
    consciousnessState: MAIAConsciousnessState
  ): Promise<ProgressionMetrics> {
    const sessionKey = `${userId}:${sessionId}`;
    const session = this.currentSessions.get(sessionKey);
    const history = this.progressionHistories.get(userId);

    if (!session || !history) {
      throw new Error('Session or history not found');
    }

    const currentTime = Date.now();
    const timeInCurrentStage = currentTime - session.startTime;

    // Calculate stability score based on time in stage and field coherence
    const field = consciousnessState.consciousnessField;
    const stageChar = this.stageCharacteristics.get(currentProfile.metal);
    const expectedDuration = stageChar?.averageDuration || 1000 * 60 * 60 * 24 * 7; // Default 1 week

    const stabilityScore = Math.min(1,
      (field.coherenceLevel * 0.4) +
      (field.stabilityIndex * 0.3) +
      (Math.min(timeInCurrentStage / expectedDuration, 1) * 0.3)
    );

    // Calculate transformation potential
    const transformationPotential = this.calculateTransformationPotential(currentProfile, field, timeInCurrentStage);

    // Calculate regression risk
    const regressionRisk = this.calculateRegressionRisk(currentProfile, field, history);

    // Calculate mastery level
    const masteryLevel = this.calculateMasteryLevel(currentProfile, timeInCurrentStage, field);

    // Calculate next stage readiness
    const nextStageReadiness = this.calculateNextStageReadiness(currentProfile, field);

    return {
      currentMetal: currentProfile.metal,
      timeInCurrentStage,
      stabilityScore,
      transformationPotential,
      regressionRisk,
      masteryLevel,
      nextStageReadiness
    };
  }

  /**
   * Calculate transformation potential based on various factors
   */
  private calculateTransformationPotential(
    profile: AlchemicalProfile,
    field: ConsciousnessField,
    timeInStage: number
  ): number {
    const stageChar = this.stageCharacteristics.get(profile.metal);
    const expectedDuration = stageChar?.averageDuration || 1000 * 60 * 60 * 24 * 7;

    // Time factor (sigmoid curve)
    const timeFactor = 1 / (1 + Math.exp(-5 * (timeInStage / expectedDuration - 0.5)));

    // Field readiness factor
    const fieldReadiness = (field.resonanceFrequency * 0.4) + (field.coherenceLevel * 0.6);

    // Integration factor from profile
    const integrationFactor = profile.integrationLevel;

    return (timeFactor * 0.4) + (fieldReadiness * 0.3) + (integrationFactor * 0.3);
  }

  /**
   * Calculate regression risk
   */
  private calculateRegressionRisk(
    profile: AlchemicalProfile,
    field: ConsciousnessField,
    history: ProgressionHistory
  ): number {
    let risk = 0;

    // Field instability increases risk
    if (field.coherenceLevel < 0.4) risk += 0.3;
    if (field.intensity > 0.8) risk += 0.2;
    if (field.stabilityIndex < 0.3) risk += 0.25;

    // Historical pattern analysis
    const recentRegressions = history.sessions
      .slice(-5)
      .reduce((count, session) => {
        const regressionTransitions = session.transitions.filter(t => t.transitionType === 'regression');
        return count + regressionTransitions.length;
      }, 0);

    risk += Math.min(0.3, recentRegressions * 0.1);

    // Profile stability
    if (profile.crisis?.riskLevel && profile.crisis.riskLevel > 0.6) {
      risk += 0.4;
    }

    return Math.min(1, risk);
  }

  /**
   * Calculate mastery level for current stage
   */
  private calculateMasteryLevel(
    profile: AlchemicalProfile,
    timeInStage: number,
    field: ConsciousnessField
  ): number {
    const stageChar = this.stageCharacteristics.get(profile.metal);
    const expectedDuration = stageChar?.averageDuration || 1000 * 60 * 60 * 24 * 7;

    // Time-based mastery (diminishing returns)
    const timeBasedMastery = 1 - Math.exp(-timeInStage / expectedDuration);

    // Field-based mastery
    const fieldMastery = (field.coherenceLevel * 0.5) + (field.stabilityIndex * 0.5);

    // Integration-based mastery
    const integrationMastery = profile.integrationLevel;

    return (timeBasedMastery * 0.3) + (fieldMastery * 0.4) + (integrationMastery * 0.3);
  }

  /**
   * Calculate readiness for each potential next stage
   */
  private calculateNextStageReadiness(
    profile: AlchemicalProfile,
    field: ConsciousnessField
  ): { [key in AlchemicalMetal]?: number } {
    const stageChar = this.stageCharacteristics.get(profile.metal);
    const readiness: { [key in AlchemicalMetal]?: number } = {};

    if (!stageChar) return readiness;

    // Calculate readiness for common exit points
    stageChar.commonExitPoints.forEach(nextMetal => {
      let score = 0.5; // Base readiness

      // Adjust based on field characteristics
      switch (nextMetal) {
        case 'lead':
          // Crisis readiness (inverse of stability)
          score = Math.max(0, 1 - field.stabilityIndex);
          break;
        case 'tin':
          // Exploration readiness
          score = (field.resonanceFrequency * 0.6) + (profile.adaptability * 0.4);
          break;
        case 'bronze':
          // Relationship readiness
          score = (field.coherenceLevel * 0.5) + (profile.supportLevel * 0.5);
          break;
        case 'iron':
          // Action readiness
          score = (field.intensity * 0.6) + ((1 - profile.adaptability) * 0.4);
          break;
        case 'mercury':
          // Teaching/adaptation readiness
          score = (profile.adaptability * 0.7) + (field.resonanceFrequency * 0.3);
          break;
        case 'silver':
          // Wisdom readiness
          score = (profile.integrationLevel * 0.6) + (field.stabilityIndex * 0.4);
          break;
        case 'gold':
          // Service readiness
          score = profile.integrationLevel;
          break;
      }

      readiness[nextMetal] = Math.min(1, Math.max(0, score));
    });

    return readiness;
  }

  /**
   * Update progression history
   */
  private updateProgressionHistory(userId: string, newMetal: AlchemicalMetal): void {
    const history = this.progressionHistories.get(userId);
    if (!history) return;

    // Add to transformation pattern
    const lastMetal = history.transformationPattern[history.transformationPattern.length - 1];
    if (lastMetal !== newMetal) {
      history.transformationPattern.push(newMetal);
    }

    // Check for cycle completion (simplified as reaching gold and returning to lead)
    if (lastMetal === 'gold' && newMetal === 'lead') {
      history.cycleCount++;
    }

    // Update dominant metal (most frequent)
    const metalCounts = history.transformationPattern.reduce((counts, metal) => {
      counts[metal] = (counts[metal] || 0) + 1;
      return counts;
    }, {} as Record<AlchemicalMetal, number>);

    history.dominantMetal = Object.entries(metalCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as AlchemicalMetal;
  }

  /**
   * End progression tracking session
   */
  public async endProgressionTracking(userId: string, sessionId: string): Promise<ProgressionSession> {
    const sessionKey = `${userId}:${sessionId}`;
    const session = this.currentSessions.get(sessionKey);

    if (!session) {
      throw new Error(`No active session found for user ${userId}, session ${sessionId}`);
    }

    session.endTime = Date.now();

    // Calculate final integration level based on transitions and stability
    const transitionCount = session.transitions.length;
    const sessionDuration = session.endTime - session.startTime;

    // Higher integration for stable sessions with meaningful transitions
    session.integrationLevel = Math.min(1,
      (transitionCount > 0 ? 0.5 : 0.2) +
      (sessionDuration > 1000 * 60 * 30 ? 0.3 : 0.1) + // 30+ minute sessions
      (session.insights.length * 0.1)
    );

    // Add to history
    const history = this.progressionHistories.get(userId);
    if (history) {
      history.sessions.push({ ...session });
      history.totalJourneyTime += sessionDuration;
    }

    this.currentSessions.delete(sessionKey);
    return session;
  }

  /**
   * Get progression analytics for a user
   */
  public getProgressionAnalytics(userId: string): ProgressionHistory | null {
    return this.progressionHistories.get(userId) || null;
  }

  /**
   * Get stage characteristics
   */
  public getStageCharacteristics(metal: AlchemicalMetal): StageCharacteristics | null {
    return this.stageCharacteristics.get(metal) || null;
  }

  /**
   * Predict next stage transition
   */
  public async predictNextTransition(
    userId: string,
    sessionId: string
  ): Promise<{
    predictedMetal: AlchemicalMetal;
    confidence: number;
    estimatedTimeToTransition: number;
    recommendations: string[]
  } | null> {
    const sessionKey = `${userId}:${sessionId}`;
    const session = this.currentSessions.get(sessionKey);

    if (!session) return null;

    const history = this.progressionHistories.get(userId);
    const stageChar = this.stageCharacteristics.get(session.endingMetal);

    if (!stageChar || !history) return null;

    // Find most likely next stage based on characteristics and history
    const exitCounts = history.sessions.reduce((counts, s) => {
      s.transitions.forEach(t => {
        if (t.fromMetal === session.endingMetal) {
          counts[t.toMetal] = (counts[t.toMetal] || 0) + 1;
        }
      });
      return counts;
    }, {} as Record<AlchemicalMetal, number>);

    // Combine historical patterns with stage characteristics
    let predictedMetal = stageChar.commonExitPoints[0];
    if (Object.keys(exitCounts).length > 0) {
      predictedMetal = Object.entries(exitCounts)
        .sort(([,a], [,b]) => b - a)[0][0] as AlchemicalMetal;
    }

    // Calculate confidence based on pattern consistency
    const totalTransitions = Object.values(exitCounts).reduce((sum, count) => sum + count, 0);
    const confidence = totalTransitions > 0 ?
      (exitCounts[predictedMetal] || 0) / totalTransitions : 0.5;

    // Estimate time to transition
    const timeInCurrentStage = Date.now() - session.startTime;
    const averageStageTime = stageChar.averageDuration;
    const estimatedTimeToTransition = Math.max(0, averageStageTime - timeInCurrentStage);

    // Generate recommendations
    const recommendations = this.generateTransitionRecommendations(session.endingMetal, predictedMetal);

    return {
      predictedMetal,
      confidence,
      estimatedTimeToTransition,
      recommendations
    };
  }

  /**
   * Generate recommendations for stage transition
   */
  private generateTransitionRecommendations(currentMetal: AlchemicalMetal, nextMetal: AlchemicalMetal): string[] {
    const recommendations: string[] = [];

    // Current stage stabilization
    const currentChar = this.stageCharacteristics.get(currentMetal);
    if (currentChar) {
      recommendations.push(...currentChar.stabilityFactors.map(factor =>
        `Maintain: ${factor}`
      ));
    }

    // Transition preparation
    const transitionMap: Record<string, string[]> = {
      'lead->tin': [
        'Begin gentle exploration',
        'Seek learning opportunities',
        'Connect with optimistic influences'
      ],
      'tin->bronze': [
        'Focus on building relationships',
        'Practice collaboration',
        'Develop emotional intelligence'
      ],
      'bronze->iron': [
        'Set clear, actionable goals',
        'Develop disciplined practices',
        'Take leadership opportunities'
      ],
      'iron->mercury': [
        'Embrace flexibility',
        'Seek teaching opportunities',
        'Practice adaptation'
      ],
      'mercury->silver': [
        'Deepen contemplative practices',
        'Seek wisdom traditions',
        'Create space for reflection'
      ],
      'silver->gold': [
        'Find service opportunities',
        'Integrate all previous learning',
        'Share wisdom with others'
      ]
    };

    const transitionKey = `${currentMetal}->${nextMetal}`;
    if (transitionMap[transitionKey]) {
      recommendations.push(...transitionMap[transitionKey]);
    }

    return recommendations;
  }
}

export default AlchemicalProgressionTracker;