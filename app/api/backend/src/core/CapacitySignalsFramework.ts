/**
 * Capacity Signals Framework
 * Tracks user capacity to hold dialogue, ambiguity, and integration safely
 * Determines PersonalOracleAgent stage progression based on lived markers
 */

import { EventBus, daimonicEventBus } from './EventBus.js';
import { UnifiedStorageService } from './UnifiedStorageService.js';
import { 
  UserProfile, 
  SessionContext, 
  DaimonicEncounter,
  BaseEntity 
} from './TypeRegistry.js';

export interface CapacitySignals {
  trust: number;              // 0.0 → 1.0
  engagementDepth: number;    // 0.0 → 1.0
  integrationSkill: number;   // 0.0 → 1.0
  safetyFlag: boolean;        // true = fallback required
  
  // Metadata for transparency
  lastUpdated: Date;
  sessionCount: number;
  confidenceLevel: number;    // 0.0 → 1.0 how reliable these signals are
  trajectory: 'building' | 'stable' | 'declining' | 'volatile';
}

export interface CapacityMeasurement extends BaseEntity {
  userId: string;
  sessionId: string;
  signalType: 'trust' | 'engagement_depth' | 'integration_skill' | 'safety_check';
  
  // Raw behavioral indicators
  indicators: BehavioralIndicator[];
  
  // Derived values
  rawScore: number;           // 0.0 → 1.0 before normalization
  normalizedScore: number;    // 0.0 → 1.0 after user history normalization
  confidence: number;         // 0.0 → 1.0 how confident we are in this measurement
  
  // Context
  measurementContext: MeasurementContext;
  qualitativeNotes: string[];
}

export interface BehavioralIndicator {
  type: string;
  value: number | boolean | string;
  weight: number;             // 0.0 → 1.0 how important this indicator is
  source: 'observed' | 'self_reported' | 'inferred';
  confidence: number;         // 0.0 → 1.0 reliability of this indicator
  timestamp: Date;
  context?: string;
}

export interface MeasurementContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionLength: number;      // minutes
  userReportedEnergy: number; // 1-10 if available
  userReportedMood: string;   // if available
  environmentalFactors: string[];
  previousSessionGap: number; // days since last session
}

export interface TrustIndicators {
  // Session Frequency & Consistency
  sessionFrequency: number;           // sessions per week
  consistencyScore: number;           // regularity of timing
  totalSessionCount: number;
  longestStreak: number;              // consecutive days/weeks
  
  // Dialogue Continuity
  referencesToPastSessions: number;   // "Last time you said..."
  buildingOnPreviousInsights: number; // explicit connections
  memoryOfSharedContent: number;      // recalls shared metaphors/concepts
  
  // Comfort & Safety Expression
  explicitComfortStatements: number;  // "I feel safe exploring this"
  vulnerabilitySharing: number;       // personal disclosure depth
  requestsForDeepening: number;       // "Can we go deeper?"
  
  // Resistance Patterns (Inverse Indicators)
  avoidanceOfPastContent: number;     // changes subject when referenced
  surfaceLevelEngagement: number;     // keeps things light consistently
  trustWithdrawl: number;             // explicit statements of doubt
}

export interface EngagementDepthIndicators {
  // Question Tolerance
  comfortWithOpenEndedness: number;  // doesn't rush to closure
  followUpQuestionCount: number;      // asks their own questions
  timeSpentInReflection: number;      // pause time before responding
  
  // Ambiguity & Paradox Handling
  paradoxTolerance: number;           // doesn't need immediate resolution
  metaphorEngagement: number;         // works with symbolic content
  uncertaintyComfort: number;         // "I don't know" as doorway not wall
  
  // Conversational Richness
  responseLength: number;             // average word count
  conceptualDepth: number;            // abstract vs concrete language ratio
  emotionalRange: number;             // variety of emotional expression
  initiatedMetaphors: number;         // creates own symbolic language
  
  // Rushing vs Patience Indicators
  pushesForQuickAnswers: number;      // "Just tell me what to do"
  demandsForCertainty: number;        // "But which is really right?"
  embracesMystery: number;            // "That's interesting, tell me more"
}

export interface IntegrationSkillIndicators {
  // Carryover Actions
  reportedActionsTaken: number;       // "I tried journaling like you suggested"
  ritualOrPracticeAdoption: number;   // implements suggested practices
  conversationInitiation: number;     // brings insights to others
  
  // Embodied Integration
  somaticAwareness: number;           // notices body responses
  behavioralChanges: number;          // "I slowed down at work this week"
  habitsShifted: number;             // concrete lifestyle adjustments
  
  // Pattern Recognition
  patternSpottingAbility: number;     // "I notice this comes up a lot"
  transferAcrossDomains: number;      // applies insights to new areas
  personalSymbolicLanguage: number;   // develops own meaning-making system
  
  // Integration Challenges
  overwhelmFromInsights: number;      // "I don't know how to use all this"
  resistanceToApplication: number;    // understands but doesn't act
  forgettingBetweenSessions: number;  // no memory of insights or actions
}

export interface SafetyIndicators {
  // Overwhelm Patterns
  racingMeaningMaking: number;        // "Everything is connected!"
  grandiousityMarkers: number;        // inflated sense of specialness
  paranoidConnections: number;        // suspicious pattern-finding
  
  // Physical & Mental State
  sleepDeprivationReports: number;    // less than 5 hours consistently
  manicEnergyIndicators: number;      // pressured speech, racing thoughts
  dissociationMarkers: number;        // feeling unreal, detached
  
  // Emotional Regulation
  extremeEmotionalSwings: number;     // rapid high-low cycles
  expressingFearOfExperience: number; // "This is scary, I want to stop"
  lossOfRealityTesting: number;       // can't distinguish inner/outer
  
  // Support System
  socialIsolationIncreasing: number;  // cutting off from others
  neglectingBasicNeeds: number;       // not eating, hygiene, work
  riskBehaviors: number;             // acting on insights unsafely
}

export type PersonalOracleStage = 
  | 'structured_guide'      // Stage 1: Clear, practical, boundaried
  | 'dialogical_companion'  // Stage 2: Questioning, exploring, co-creating
  | 'co_creative_partner'   // Stage 3: Paradox, metaphor, emergence
  | 'transparent_prism';    // Stage 4: Full transparency, co-investigation

export class CapacitySignalsFramework {
  private eventBus: EventBus;
  private storage: UnifiedStorageService;
  
  // Signal history for trend analysis
  private signalHistory: Map<string, CapacityMeasurement[]> = new Map();
  
  // Baseline calibration per user
  private userBaselines: Map<string, UserBaseline> = new Map();

  constructor(
    eventBus: EventBus = daimonicEventBus,
    storage: UnifiedStorageService
  ) {
    this.eventBus = eventBus;
    this.storage = storage;
    
    this.setupEventHandlers();
  }

  /**
   * Measure all capacity signals for a user based on session data
   */
  async measureCapacitySignals(
    userId: string,
    sessionId: string,
    sessionData: {
      userMessages: string[];
      agentResponses: string[];
      sessionDuration: number;
      userReportedState?: any;
      behaviorObservations?: any;
    }
  ): Promise<CapacitySignals> {
    
    try {
      // Get user history for context
      const recentSessions = await this.storage.getUserSessions(userId, 10);
      const userHistory = await this.getUserMeasurementHistory(userId);
      
      // Measure each signal type
      const trustMeasurement = await this.measureTrust(userId, sessionId, sessionData, recentSessions);
      const engagementMeasurement = await this.measureEngagementDepth(userId, sessionId, sessionData);
      const integrationMeasurement = await this.measureIntegrationSkill(userId, sessionId, sessionData, userHistory);
      const safetyCheck = await this.assessSafety(userId, sessionId, sessionData);
      
      // Store measurements
      await this.storage.create(trustMeasurement);
      await this.storage.create(engagementMeasurement);
      await this.storage.create(integrationMeasurement);
      
      // Update signal history
      this.updateSignalHistory(userId, [trustMeasurement, engagementMeasurement, integrationMeasurement]);
      
      // Calculate composite signals
      const signals: CapacitySignals = {
        trust: trustMeasurement.normalizedScore,
        engagementDepth: engagementMeasurement.normalizedScore,
        integrationSkill: integrationMeasurement.normalizedScore,
        safetyFlag: safetyCheck.hasSafetyFlag,
        lastUpdated: new Date(),
        sessionCount: recentSessions.length,
        confidenceLevel: this.calculateOverallConfidence([trustMeasurement, engagementMeasurement, integrationMeasurement]),
        trajectory: this.calculateTrajectory(userId)
      };
      
      // Emit measurement event
      await this.eventBus.emit('capacity:signals_measured', {
        userId,
        sessionId,
        signals,
        measurements: {
          trust: trustMeasurement,
          engagement: engagementMeasurement,
          integration: integrationMeasurement,
          safety: safetyCheck
        }
      });
      
      return signals;
      
    } catch (error) {
      console.error('Error measuring capacity signals:', error);
      
      // Return safe defaults
      return {
        trust: 0.3,
        engagementDepth: 0.3,
        integrationSkill: 0.2,
        safetyFlag: true, // Conservative default
        lastUpdated: new Date(),
        sessionCount: 0,
        confidenceLevel: 0.1,
        trajectory: 'volatile'
      };
    }
  }

  /**
   * Determine appropriate PersonalOracle stage based on capacity signals
   */
  determineStage(signals: CapacitySignals): PersonalOracleStage {
    // Safety override - always fallback if safety flag is raised
    if (signals.safetyFlag || signals.trust < 0.3) {
      return 'structured_guide';
    }
    
    // Stage 4: Transparent Prism - highest capacity
    if (signals.trust >= 0.8 && 
        signals.engagementDepth >= 0.8 && 
        signals.integrationSkill >= 0.7 &&
        signals.confidenceLevel >= 0.7) {
      return 'transparent_prism';
    }
    
    // Stage 3: Co-Creative Partner - high capacity
    if (signals.trust >= 0.6 && 
        signals.engagementDepth >= 0.6 && 
        signals.integrationSkill >= 0.5) {
      return 'co_creative_partner';
    }
    
    // Stage 2: Dialogical Companion - moderate capacity
    if (signals.trust >= 0.3 && signals.engagementDepth >= 0.3) {
      return 'dialogical_companion';
    }
    
    // Stage 1: Structured Guide - building capacity
    return 'structured_guide';
  }

  /**
   * Measure Trust Signal
   */
  private async measureTrust(
    userId: string,
    sessionId: string,
    sessionData: any,
    recentSessions: SessionContext[]
  ): Promise<CapacityMeasurement> {
    
    const indicators: BehavioralIndicator[] = [];
    
    // Session Frequency & Consistency
    const sessionFreq = this.calculateSessionFrequency(recentSessions);
    indicators.push({
      type: 'session_frequency',
      value: sessionFreq,
      weight: 0.25,
      source: 'observed',
      confidence: 0.9,
      timestamp: new Date(),
      context: `${recentSessions.length} sessions analyzed`
    });
    
    // Dialogue Continuity - References to past sessions
    const pastReferences = this.detectPastSessionReferences(sessionData.userMessages);
    indicators.push({
      type: 'past_session_references',
      value: pastReferences,
      weight: 0.3,
      source: 'observed',
      confidence: 0.8,
      timestamp: new Date(),
      context: `Found ${pastReferences} references to previous sessions`
    });
    
    // Comfort & Safety Expression
    const comfortMarkers = this.detectComfortExpression(sessionData.userMessages);
    indicators.push({
      type: 'comfort_expression',
      value: comfortMarkers,
      weight: 0.25,
      source: 'observed',
      confidence: 0.7,
      timestamp: new Date(),
      context: `Detected comfort/safety language`
    });
    
    // Calculate raw score
    const rawScore = this.calculateRawScore(indicators);
    
    // Normalize based on user history
    const normalizedScore = await this.normalizeScore(userId, 'trust', rawScore);
    
    return {
      id: this.generateId(),
      userId,
      sessionId,
      signalType: 'trust',
      indicators,
      rawScore,
      normalizedScore,
      confidence: this.calculateIndicatorConfidence(indicators),
      measurementContext: this.createMeasurementContext(sessionData),
      qualitativeNotes: [
        `Session frequency: ${sessionFreq.toFixed(2)} per week`,
        `Past references: ${pastReferences} detected`,
        `Comfort markers: ${comfortMarkers} expressions`
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
  }

  /**
   * Measure Engagement Depth Signal
   */
  private async measureEngagementDepth(
    userId: string,
    sessionId: string,
    sessionData: any
  ): Promise<CapacityMeasurement> {
    
    const indicators: BehavioralIndicator[] = [];
    
    // Question Tolerance - doesn't rush to closure
    const openEndedComfort = this.assessOpenEndedComfort(sessionData.userMessages, sessionData.agentResponses);
    indicators.push({
      type: 'open_ended_comfort',
      value: openEndedComfort,
      weight: 0.3,
      source: 'observed',
      confidence: 0.8,
      timestamp: new Date(),
      context: 'Patience with questions and ambiguity'
    });
    
    // Response Richness
    const responseRichness = this.calculateResponseRichness(sessionData.userMessages);
    indicators.push({
      type: 'response_richness',
      value: responseRichness,
      weight: 0.25,
      source: 'observed',
      confidence: 0.9,
      timestamp: new Date(),
      context: `Average response length and conceptual depth`
    });
    
    // Metaphor Engagement
    const metaphorWork = this.detectMetaphorEngagement(sessionData.userMessages);
    indicators.push({
      type: 'metaphor_engagement',
      value: metaphorWork,
      weight: 0.2,
      source: 'observed',
      confidence: 0.7,
      timestamp: new Date(),
      context: 'Engagement with symbolic/metaphorical content'
    });
    
    // Paradox Tolerance
    const paradoxComfort = this.assessParadoxTolerance(sessionData.userMessages);
    indicators.push({
      type: 'paradox_tolerance',
      value: paradoxComfort,
      weight: 0.25,
      source: 'observed',
      confidence: 0.6,
      timestamp: new Date(),
      context: 'Comfort holding contradictions'
    });
    
    const rawScore = this.calculateRawScore(indicators);
    const normalizedScore = await this.normalizeScore(userId, 'engagement_depth', rawScore);
    
    return {
      id: this.generateId(),
      userId,
      sessionId,
      signalType: 'engagement_depth',
      indicators,
      rawScore,
      normalizedScore,
      confidence: this.calculateIndicatorConfidence(indicators),
      measurementContext: this.createMeasurementContext(sessionData),
      qualitativeNotes: [
        `Open-ended comfort: ${(openEndedComfort * 100).toFixed(0)}%`,
        `Response richness: ${(responseRichness * 100).toFixed(0)}%`,
        `Metaphor engagement: ${(metaphorWork * 100).toFixed(0)}%`,
        `Paradox tolerance: ${(paradoxComfort * 100).toFixed(0)}%`
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
  }

  /**
   * Measure Integration Skill Signal
   */
  private async measureIntegrationSkill(
    userId: string,
    sessionId: string,
    sessionData: any,
    userHistory: CapacityMeasurement[]
  ): Promise<CapacityMeasurement> {
    
    const indicators: BehavioralIndicator[] = [];
    
    // Reported Actions - "I tried what you suggested"
    const actionReports = this.detectActionReports(sessionData.userMessages);
    indicators.push({
      type: 'action_reports',
      value: actionReports,
      weight: 0.4,
      source: 'self_reported',
      confidence: 0.8,
      timestamp: new Date(),
      context: 'User reports taking actions based on previous sessions'
    });
    
    // Pattern Recognition - "I notice this pattern"
    const patternRecognition = this.detectPatternRecognition(sessionData.userMessages);
    indicators.push({
      type: 'pattern_recognition',
      value: patternRecognition,
      weight: 0.3,
      source: 'observed',
      confidence: 0.9,
      timestamp: new Date(),
      context: 'User identifies patterns across domains'
    });
    
    // Embodied Changes - "I've been feeling different"
    const embodiedChanges = this.detectEmbodiedChanges(sessionData.userMessages);
    indicators.push({
      type: 'embodied_changes',
      value: embodiedChanges,
      weight: 0.3,
      source: 'self_reported',
      confidence: 0.7,
      timestamp: new Date(),
      context: 'User reports felt changes in daily life'
    });
    
    const rawScore = this.calculateRawScore(indicators);
    const normalizedScore = await this.normalizeScore(userId, 'integration_skill', rawScore);
    
    return {
      id: this.generateId(),
      userId,
      sessionId,
      signalType: 'integration_skill',
      indicators,
      rawScore,
      normalizedScore,
      confidence: this.calculateIndicatorConfidence(indicators),
      measurementContext: this.createMeasurementContext(sessionData),
      qualitativeNotes: [
        `Action reports: ${actionReports} instances`,
        `Pattern recognition: ${patternRecognition} instances`,
        `Embodied changes: ${embodiedChanges} instances`
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
  }

  /**
   * Assess Safety - returns boolean flag and details
   */
  private async assessSafety(
    userId: string,
    sessionId: string,
    sessionData: any
  ): Promise<{
    hasSafetyFlag: boolean;
    riskLevel: 'none' | 'low' | 'medium' | 'high';
    concerns: string[];
    recommendations: string[];
  }> {
    
    const concerns: string[] = [];
    let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    
    // Racing meaning-making detection
    const racingPatterns = this.detectRacingMeaningMaking(sessionData.userMessages);
    if (racingPatterns > 0.7) {
      concerns.push('Racing meaning-making patterns detected');
      riskLevel = 'high';
    }
    
    // Grandiosity markers
    const grandiosity = this.detectGrandiosity(sessionData.userMessages);
    if (grandiosity > 0.6) {
      concerns.push('Grandiose thinking patterns');
      riskLevel = Math.max(riskLevel as any, 'medium' as any) as any;
    }
    
    // Overwhelm expression
    const overwhelm = this.detectOverwhelmExpression(sessionData.userMessages);
    if (overwhelm > 0.5) {
      concerns.push('User expressing overwhelm');
      riskLevel = Math.max(riskLevel as any, 'medium' as any) as any;
    }
    
    // Dissociation markers
    const dissociation = this.detectDissociationMarkers(sessionData.userMessages);
    if (dissociation > 0.4) {
      concerns.push('Possible dissociation indicators');
      riskLevel = 'high';
    }
    
    const hasSafetyFlag = riskLevel === 'high' || riskLevel === 'medium';
    
    const recommendations = this.generateSafetyRecommendations(concerns, riskLevel);
    
    return {
      hasSafetyFlag,
      riskLevel,
      concerns,
      recommendations
    };
  }

  /**
   * Helper methods for behavioral detection
   */
  
  private calculateSessionFrequency(sessions: SessionContext[]): number {
    if (sessions.length < 2) return 0.1;
    
    const dates = sessions.map(s => s.createdAt).sort();
    const daysBetween = dates.map((date, i) => 
      i === 0 ? 0 : (date.getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24)
    ).filter(days => days > 0);
    
    const avgDaysBetween = daysBetween.reduce((sum, days) => sum + days, 0) / daysBetween.length;
    return Math.min(7 / avgDaysBetween, 1.0); // Sessions per week, capped at 1.0
  }
  
  private detectPastSessionReferences(messages: string[]): number {
    const referencePatterns = [
      /last time/i,
      /you said/i,
      /we talked about/i,
      /from before/i,
      /previously/i,
      /earlier you/i,
      /when we discussed/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of referencePatterns) {
        if (pattern.test(message)) {
          count++;
          break; // Only count once per message
        }
      }
    }
    
    return Math.min(count / messages.length, 1.0);
  }
  
  private detectComfortExpression(messages: string[]): number {
    const comfortPatterns = [
      /feel safe/i,
      /comfortable/i,
      /feel okay/i,
      /ready to explore/i,
      /trust/i,
      /feel supported/i,
      /this helps/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of comfortPatterns) {
        if (pattern.test(message)) {
          count++;
          break;
        }
      }
    }
    
    return Math.min(count / Math.max(messages.length, 1), 1.0);
  }
  
  private assessOpenEndedComfort(userMessages: string[], agentResponses: string[]): number {
    // Look for patience with questions vs rushing to answers
    const rushPatterns = [
      /just tell me/i,
      /what should i do/i,
      /give me the answer/i,
      /cut to the chase/i,
      /quickly/i
    ];
    
    const patiencePatterns = [
      /interesting/i,
      /tell me more/i,
      /i'm curious/i,
      /let me think/i,
      /that's complex/i,
      /i don't know/i
    ];
    
    let rushCount = 0;
    let patienceCount = 0;
    
    for (const message of userMessages) {
      for (const pattern of rushPatterns) {
        if (pattern.test(message)) {
          rushCount++;
          break;
        }
      }
      for (const pattern of patiencePatterns) {
        if (pattern.test(message)) {
          patienceCount++;
          break;
        }
      }
    }
    
    const total = rushCount + patienceCount;
    return total > 0 ? patienceCount / total : 0.5;
  }
  
  private calculateResponseRichness(messages: string[]): number {
    if (messages.length === 0) return 0;
    
    const avgWordCount = messages.reduce((sum, msg) => sum + msg.split(' ').length, 0) / messages.length;
    const conceptualWords = messages.reduce((sum, msg) => {
      const concepts = (msg.match(/\b(meaning|purpose|connection|pattern|insight|understanding|relationship|significance)\b/gi) || []).length;
      return sum + concepts;
    }, 0) / messages.length;
    
    // Normalize: 50+ words = 1.0, 2+ conceptual words = bonus
    const wordScore = Math.min(avgWordCount / 50, 1.0);
    const conceptScore = Math.min(conceptualWords / 2, 0.5);
    
    return Math.min(wordScore + conceptScore, 1.0);
  }
  
  private detectMetaphorEngagement(messages: string[]): number {
    const metaphorPatterns = [
      /like/i,
      /as if/i,
      /reminds me of/i,
      /feels like/i,
      /imagine/i,
      /picture/i,
      /symbol/i,
      /represents/i
    ];
    
    let metaphorCount = 0;
    for (const message of messages) {
      for (const pattern of metaphorPatterns) {
        if (pattern.test(message)) {
          metaphorCount++;
          break;
        }
      }
    }
    
    return Math.min(metaphorCount / Math.max(messages.length, 1), 1.0);
  }
  
  private assessParadoxTolerance(messages: string[]): number {
    const paradoxComfort = [
      /both.*and/i,
      /contradictory/i,
      /paradox/i,
      /doesn't make sense but/i,
      /strange that/i,
      /opposite/i,
      /tension/i
    ];
    
    const paradoxDiscomfort = [
      /which is right/i,
      /but which/i,
      /that's wrong/i,
      /doesn't make sense/i,
      /contradiction/i
    ];
    
    let comfortCount = 0;
    let discomfortCount = 0;
    
    for (const message of messages) {
      for (const pattern of paradoxComfort) {
        if (pattern.test(message)) {
          comfortCount++;
          break;
        }
      }
      for (const pattern of paradoxDiscomfort) {
        if (pattern.test(message)) {
          discomfortCount++;
          break;
        }
      }
    }
    
    const total = comfortCount + discomfortCount;
    return total > 0 ? comfortCount / total : 0.5;
  }
  
  private detectActionReports(messages: string[]): number {
    const actionPatterns = [
      /i tried/i,
      /i did/i,
      /i started/i,
      /i practiced/i,
      /i implemented/i,
      /i changed/i,
      /i've been/i,
      /i experimented/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of actionPatterns) {
        if (pattern.test(message)) {
          count++;
          break;
        }
      }
    }
    
    return count;
  }
  
  private detectPatternRecognition(messages: string[]): number {
    const patternPatterns = [
      /i notice/i,
      /pattern/i,
      /always/i,
      /tends to/i,
      /similar to/i,
      /happens when/i,
      /connection between/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of patternPatterns) {
        if (pattern.test(message)) {
          count++;
          break;
        }
      }
    }
    
    return count;
  }
  
  private detectEmbodiedChanges(messages: string[]): number {
    const embodiedPatterns = [
      /feel different/i,
      /body/i,
      /physically/i,
      /energy/i,
      /breathing/i,
      /tension/i,
      /relaxed/i,
      /grounded/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of embodiedPatterns) {
        if (pattern.test(message)) {
          count++;
          break;
        }
      }
    }
    
    return count;
  }
  
  // Safety detection methods
  private detectRacingMeaningMaking(messages: string[]): number {
    const racingPatterns = [
      /everything is connected/i,
      /all the signs/i,
      /universe is telling me/i,
      /synchronicity everywhere/i,
      /all makes sense now/i
    ];
    
    let intensity = 0;
    for (const message of messages) {
      for (const pattern of racingPatterns) {
        if (pattern.test(message)) {
          intensity += 0.3;
        }
      }
      // Also check message length and punctuation patterns
      if (message.length > 500 && (message.match(/!/g) || []).length > 3) {
        intensity += 0.2;
      }
    }
    
    return Math.min(intensity, 1.0);
  }
  
  private detectGrandiosity(messages: string[]): number {
    const grandiosityPatterns = [
      /i'm special/i,
      /chosen/i,
      /enlightened/i,
      /gifted/i,
      /understand everything/i,
      /others don't get it/i,
      /i see what they can't/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of grandiosityPatterns) {
        if (pattern.test(message)) {
          count++;
          break;
        }
      }
    }
    
    return Math.min(count / Math.max(messages.length, 1), 1.0);
  }
  
  private detectOverwhelmExpression(messages: string[]): number {
    const overwhelmPatterns = [
      /overwhelmed/i,
      /too much/i,
      /can't handle/i,
      /scared/i,
      /stop/i,
      /pause/i,
      /need a break/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of overwhelmPatterns) {
        if (pattern.test(message)) {
          count++;
          break;
        }
      }
    }
    
    return Math.min(count / Math.max(messages.length, 1), 1.0);
  }
  
  private detectDissociationMarkers(messages: string[]): number {
    const dissociationPatterns = [
      /feel unreal/i,
      /not myself/i,
      /detached/i,
      /floating/i,
      /dream-like/i,
      /out of body/i,
      /not here/i
    ];
    
    let count = 0;
    for (const message of messages) {
      for (const pattern of dissociationPatterns) {
        if (pattern.test(message)) {
          count++;
          break;
        }
      }
    }
    
    return Math.min(count / Math.max(messages.length, 1), 1.0);
  }
  
  private generateSafetyRecommendations(concerns: string[], riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'high') {
      recommendations.push('Immediate fallback to Structured Guide mode');
      recommendations.push('Focus on grounding and practical anchors');
      recommendations.push('Suggest professional support if patterns persist');
    } else if (riskLevel === 'medium') {
      recommendations.push('Reduce intensity and complexity');
      recommendations.push('Increase grounding practices');
      recommendations.push('Monitor for escalation');
    }
    
    if (concerns.some(c => c.includes('overwhelm'))) {
      recommendations.push('Offer explicit permission to slow down');
      recommendations.push('Suggest breaking into smaller pieces');
    }
    
    if (concerns.some(c => c.includes('meaning-making'))) {
      recommendations.push('Gently redirect to concrete present moment');
      recommendations.push('Avoid archetypal or symbolic language temporarily');
    }
    
    return recommendations;
  }
  
  // Utility methods
  private calculateRawScore(indicators: BehavioralIndicator[]): number {
    const weightedSum = indicators.reduce((sum, indicator) => {
      const value = typeof indicator.value === 'number' ? indicator.value : 0;
      return sum + (value * indicator.weight * indicator.confidence);
    }, 0);
    
    const totalWeight = indicators.reduce((sum, indicator) => sum + indicator.weight, 0);
    
    return totalWeight > 0 ? Math.min(weightedSum / totalWeight, 1.0) : 0;
  }
  
  private async normalizeScore(userId: string, signalType: string, rawScore: number): Promise<number> {
    // Get user baseline if available
    const baseline = this.userBaselines.get(userId);
    if (!baseline || !baseline.signals[signalType]) {
      return rawScore; // No baseline, return raw score
    }
    
    const userBaseline = baseline.signals[signalType];
    const userRange = userBaseline.max - userBaseline.min;
    
    if (userRange === 0) return rawScore;
    
    // Normalize within user's historical range
    const normalizedWithinRange = (rawScore - userBaseline.min) / userRange;
    
    // Blend with raw score to avoid over-personalization
    return (normalizedWithinRange * 0.7) + (rawScore * 0.3);
  }
  
  private calculateIndicatorConfidence(indicators: BehavioralIndicator[]): number {
    return indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length;
  }
  
  private createMeasurementContext(sessionData: any): MeasurementContext {
    const hour = new Date().getHours();
    let timeOfDay: MeasurementContext['timeOfDay'];
    
    if (hour < 6) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else if (hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    return {
      timeOfDay,
      sessionLength: sessionData.sessionDuration || 0,
      userReportedEnergy: sessionData.userReportedState?.energy || 0,
      userReportedMood: sessionData.userReportedState?.mood || '',
      environmentalFactors: [],
      previousSessionGap: 0 // Would calculate based on previous session
    };
  }
  
  private calculateOverallConfidence(measurements: CapacityMeasurement[]): number {
    return measurements.reduce((sum, m) => sum + m.confidence, 0) / measurements.length;
  }
  
  private calculateTrajectory(userId: string): 'building' | 'stable' | 'declining' | 'volatile' {
    const history = this.signalHistory.get(userId);
    if (!history || history.length < 3) return 'volatile';
    
    const recent = history.slice(-5);
    const trend = this.calculateTrend(recent.map(m => m.normalizedScore));
    
    if (Math.abs(trend) < 0.1) return 'stable';
    if (trend > 0.1) return 'building';
    if (trend < -0.1) return 'declining';
    return 'volatile';
  }
  
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }
  
  private async getUserMeasurementHistory(userId: string): Promise<CapacityMeasurement[]> {
    const result = await this.storage.query<CapacityMeasurement>({
      entityType: 'CapacityMeasurement',
      userId,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.data;
  }
  
  private updateSignalHistory(userId: string, measurements: CapacityMeasurement[]): void {
    const existing = this.signalHistory.get(userId) || [];
    const updated = [...existing, ...measurements].slice(-50); // Keep last 50
    this.signalHistory.set(userId, updated);
  }
  
  private setupEventHandlers(): void {
    // Listen for session completion to trigger measurement
    this.eventBus.subscribe('session:completed', async (event) => {
      try {
        await this.measureCapacitySignals(
          event.data.userId,
          event.data.sessionId,
          event.data.sessionData
        );
      } catch (error) {
        console.error('Error measuring capacity signals from event:', error);
      }
    });
    
    // Listen for stage change requests
    this.eventBus.subscribe('capacity:stage_change_request', async (event) => {
      const signals = await this.measureCapacitySignals(
        event.data.userId,
        event.data.sessionId,
        event.data.sessionData
      );
      
      const newStage = this.determineStage(signals);
      
      await this.eventBus.emit('capacity:stage_determined', {
        userId: event.data.userId,
        sessionId: event.data.sessionId,
        previousStage: event.data.currentStage,
        newStage,
        signals,
        reason: this.explainStageDecision(signals, newStage)
      });
    });
  }
  
  private explainStageDecision(signals: CapacitySignals, stage: PersonalOracleStage): string {
    if (signals.safetyFlag) {
      return 'Safety flag raised - fallback to structured guidance';
    }
    
    switch (stage) {
      case 'transparent_prism':
        return `High capacity across all signals: Trust ${(signals.trust * 100).toFixed(0)}%, Engagement ${(signals.engagementDepth * 100).toFixed(0)}%, Integration ${(signals.integrationSkill * 100).toFixed(0)}%`;
      case 'co_creative_partner':
        return `Strong capacity for collaboration: Trust ${(signals.trust * 100).toFixed(0)}%, Engagement ${(signals.engagementDepth * 100).toFixed(0)}%`;
      case 'dialogical_companion':
        return `Moderate capacity for exploration: Trust ${(signals.trust * 100).toFixed(0)}%, Engagement ${(signals.engagementDepth * 100).toFixed(0)}%`;
      case 'structured_guide':
        return `Building foundation: Trust ${(signals.trust * 100).toFixed(0)}% - focusing on safety and consistency`;
      default:
        return 'Stage determined by capacity signals';
    }
  }
  
  private generateId(): string {
    return `capacity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Public interface methods
   */
  
  async getCurrentSignals(userId: string): Promise<CapacitySignals | null> {
    const recentMeasurements = await this.getUserMeasurementHistory(userId);
    if (recentMeasurements.length === 0) return null;
    
    // Get most recent measurement of each type
    const trustMeasurement = recentMeasurements.find(m => m.signalType === 'trust');
    const engagementMeasurement = recentMeasurements.find(m => m.signalType === 'engagement_depth');
    const integrationMeasurement = recentMeasurements.find(m => m.signalType === 'integration_skill');
    
    if (!trustMeasurement || !engagementMeasurement || !integrationMeasurement) {
      return null;
    }
    
    return {
      trust: trustMeasurement.normalizedScore,
      engagementDepth: engagementMeasurement.normalizedScore,
      integrationSkill: integrationMeasurement.normalizedScore,
      safetyFlag: false, // Would need recent safety check
      lastUpdated: trustMeasurement.updatedAt,
      sessionCount: recentMeasurements.length,
      confidenceLevel: (trustMeasurement.confidence + engagementMeasurement.confidence + integrationMeasurement.confidence) / 3,
      trajectory: this.calculateTrajectory(userId)
    };
  }
  
  async getSignalHistory(userId: string, days: number = 30): Promise<CapacityMeasurement[]> {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const result = await this.storage.query<CapacityMeasurement>({
      entityType: 'CapacityMeasurement',
      userId,
      dateRange: {
        start: cutoffDate,
        end: new Date()
      },
      sortBy: 'createdAt',
      sortOrder: 'asc'
    });
    
    return result.data;
  }
  
  async explainSignals(userId: string): Promise<{
    explanation: string;
    recommendations: string[];
    nextSteps: string[];
  }> {
    
    const signals = await this.getCurrentSignals(userId);
    if (!signals) {
      return {
        explanation: 'No capacity signals available yet. Participate in a few sessions to build your capacity profile.',
        recommendations: ['Engage authentically in dialogue', 'Share your genuine responses', 'Take time for reflection'],
        nextSteps: ['Continue participating in sessions', 'Notice what resonates with you', 'Allow trust to build naturally']
      };
    }
    
    const currentStage = this.determineStage(signals);
    
    return {
      explanation: this.generateSignalExplanation(signals, currentStage),
      recommendations: this.generateRecommendations(signals, currentStage),
      nextSteps: this.generateNextSteps(signals, currentStage)
    };
  }
  
  private generateSignalExplanation(signals: CapacitySignals, stage: PersonalOracleStage): string {
    const trustDesc = signals.trust > 0.7 ? 'strong' : signals.trust > 0.4 ? 'developing' : 'building';
    const engagementDesc = signals.engagementDepth > 0.7 ? 'deep' : signals.engagementDepth > 0.4 ? 'moderate' : 'surface';
    const integrationDesc = signals.integrationSkill > 0.7 ? 'skilled' : signals.integrationSkill > 0.4 ? 'developing' : 'beginning';
    
    return `Your capacity profile shows ${trustDesc} trust (${(signals.trust * 100).toFixed(0)}%), ${engagementDesc} engagement (${(signals.engagementDepth * 100).toFixed(0)}%), and ${integrationDesc} integration skill (${(signals.integrationSkill * 100).toFixed(0)}%). This indicates readiness for ${stage.replace('_', ' ')} level interactions. Your trajectory is ${signals.trajectory} with ${(signals.confidenceLevel * 100).toFixed(0)}% confidence in these measurements.`;
  }
  
  private generateRecommendations(signals: CapacitySignals, stage: PersonalOracleStage): string[] {
    const recommendations: string[] = [];
    
    if (signals.trust < 0.5) {
      recommendations.push('Focus on building consistency in your practice');
      recommendations.push('Reference previous sessions to build continuity');
    }
    
    if (signals.engagementDepth < 0.5) {
      recommendations.push('Allow more time with questions before seeking answers');
      recommendations.push('Explore metaphorical and symbolic language');
    }
    
    if (signals.integrationSkill < 0.5) {
      recommendations.push('Experiment with small actions based on insights');
      recommendations.push('Notice patterns across different areas of your life');
    }
    
    if (signals.safetyFlag) {
      recommendations.push('Prioritize grounding and safety practices');
      recommendations.push('Consider slowing down the pace of exploration');
    }
    
    return recommendations;
  }
  
  private generateNextSteps(signals: CapacitySignals, stage: PersonalOracleStage): string[] {
    const nextSteps: string[] = [];
    
    switch (stage) {
      case 'structured_guide':
        nextSteps.push('Build trust through consistent, safe interactions');
        nextSteps.push('Develop comfort with open-ended questions');
        break;
      case 'dialogical_companion':
        nextSteps.push('Practice integrating insights between sessions');
        nextSteps.push('Engage more deeply with paradoxical content');
        break;
      case 'co_creative_partner':
        nextSteps.push('Co-create new metaphors and frameworks');
        nextSteps.push('Take leadership in your own exploration');
        break;
      case 'transparent_prism':
        nextSteps.push('Participate in the full mystery of the process');
        nextSteps.push('Help co-investigate the nature of the dialogue itself');
        break;
    }
    
    return nextSteps;
  }
}

interface UserBaseline {
  userId: string;
  signals: Record<string, {
    min: number;
    max: number;
    average: number;
  }>;
  lastUpdated: Date;
}

export default CapacitySignalsFramework;