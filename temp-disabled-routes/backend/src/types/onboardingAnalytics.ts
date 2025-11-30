/**
 * TypeScript interfaces for Onboarding Tone Analytics Events
 * 
 * These events track the effectiveness of tone detection, bias application,
 * and decay curves to validate the onboarding system's natural evolution.
 */

export type OnboardingTone = 'curious' | 'hesitant' | 'enthusiastic' | 'neutral';

export type FeedbackPromptType = 'first_session' | 'bias_decay' | 'bias_evolution';

export interface BiasApplication {
  trustDelta: number;
  challengeDelta: number;
  humorDelta: number;
  metaphysicsDelta: number;
  decayFactor: number;
}

export interface ToneFeedbackSubmittedEvent {
  userId: string;
  sessionCount: number;
  promptType: FeedbackPromptType;
  userToneSelection: OnboardingTone | null;
  userCustomResponse: string;
  systemPredictedTone: OnboardingTone;
  biasApplied: BiasApplication;
  resonanceScore: number; // 0-1, how well user response matches predicted tone
  timestamp: string;
  [key: string]: unknown; // Index signature for analytics compatibility
}

export interface BiasDecayEvaluatedEvent {
  userId: string;
  sessionCount: number;
  originalTone: OnboardingTone;
  decayFactor: number;
  activeBias: {
    trustDelta: number;
    challengeDelta: number;
    humorDelta: number;
    metaphysicsDelta: number;
  };
  nextDecayThreshold: number;
  biasStrengthRemaining: number; // 0-1
  timestamp: string;
  [key: string]: unknown; // Index signature for analytics compatibility
}

export interface ToneFeedbackMismatchEvent {
  userId: string;
  sessionCount: number;
  systemPredictedTone: OnboardingTone;
  userReportedTone: OnboardingTone;
  mismatchScore: number; // 0-1, severity of mismatch
  adjustmentSuggested: boolean;
  adjustmentType: 'tone_recalibration' | 'bias_reset' | 'manual_review';
  timestamp: string;
  [key: string]: unknown; // Index signature for analytics compatibility
}

export interface OnboardingResonanceEvent {
  userId: string;
  sessionCount: number;
  overallResonanceIndex: number; // 0-1, cumulative alignment score
  toneAccuracy: number; // % of correct tone predictions so far
  decayCurveStability: number; // 0-1, how smooth the bias decay has been
  userSatisfactionTrend: 'improving' | 'stable' | 'declining';
  timestamp: string;
  [key: string]: unknown; // Index signature for analytics compatibility
}

/**
 * Feedback Collection Schemas
 */

export interface SessionFeedbackPrompt {
  sessionNumber: number;
  promptType: FeedbackPromptType;
  question: string;
  options?: OnboardingTone[];
  allowCustomResponse: boolean;
}

export interface FeedbackResponse {
  userId: string;
  sessionCount: number;
  promptType: FeedbackPromptType;
  selectedTone?: OnboardingTone;
  customResponse?: string;
  timestamp: string;
}

/**
 * Analytics Dashboard Data Structures
 */

export interface OnboardingAnalyticsSummary {
  userId: string;
  totalSessions: number;
  initialTone: OnboardingTone;
  currentBiasStrength: number;
  
  accuracy: {
    toneDetectionRate: number; // % correct predictions
    resonanceScore: number; // avg user satisfaction
    mismatchCount: number;
  };
  
  progression: {
    trustProgression: number[];
    challengeProgression: number[];
    humorProgression: number[];
    metaphysicsProgression: number[];
  };
  
  feedback: {
    session1Response?: string;
    session4Response?: string;
    session8Response?: string;
    customFeedback: string[];
  };
}

export interface OnboardingCohortAnalytics {
  cohortSize: number;
  toneDistribution: Record<OnboardingTone, number>;
  
  accuracy: {
    overallToneDetectionRate: number;
    perToneAccuracy: Record<OnboardingTone, number>;
    avgResonanceScore: number;
  };
  
  retention: {
    session1to4RetentionRate: number;
    session4to8RetentionRate: number;
    session8to10RetentionRate: number;
  };
  
  satisfaction: {
    avgUserSatisfaction: number;
    satisfactionByTone: Record<OnboardingTone, number>;
    commonFeedbackThemes: string[];
  };
}

/**
 * Event Names for Analytics Pipeline
 */

export const ONBOARDING_ANALYTICS_EVENTS = {
  TONE_FEEDBACK_SUBMITTED: 'onboarding.tone_feedback.submitted',
  BIAS_DECAY_EVALUATED: 'onboarding.bias_decay.evaluated', 
  TONE_FEEDBACK_MISMATCH: 'onboarding.tone_feedback.mismatch',
  ONBOARDING_RESONANCE: 'onboarding.resonance.evaluated'
} as const;

/**
 * Utility Functions for Analytics Processing
 */

export function calculateResonanceScore(
  predicted: OnboardingTone, 
  userFeedback: string,
  userSelectedTone?: OnboardingTone
): number {
  // Basic resonance scoring - can be enhanced with ML
  if (userSelectedTone && userSelectedTone === predicted) {
    return 1.0;
  }
  
  const positiveFeedback = [
    'perfect', 'exactly right', 'spot on', 'feels good', 'natural',
    'comfortable', 'understanding', 'matched', 'right level'
  ];
  
  const negativeFeedback = [
    'too much', 'too little', 'off', 'wrong', 'uncomfortable', 
    'not right', 'mismatch', 'forced', 'mechanical'
  ];
  
  const lowerFeedback = userFeedback.toLowerCase();
  
  if (positiveFeedback.some(phrase => lowerFeedback.includes(phrase))) {
    return 0.8;
  }
  
  if (negativeFeedback.some(phrase => lowerFeedback.includes(phrase))) {
    return 0.2;
  }
  
  return 0.5; // Neutral
}

export function calculateMismatchScore(
  predicted: OnboardingTone,
  reported: OnboardingTone
): number {
  if (predicted === reported) return 0.0;
  
  // Define tone similarity matrix
  const toneDistances: Record<OnboardingTone, Record<OnboardingTone, number>> = {
    curious: { curious: 0.0, enthusiastic: 0.3, neutral: 0.5, hesitant: 0.8 },
    enthusiastic: { enthusiastic: 0.0, curious: 0.3, neutral: 0.6, hesitant: 0.9 },
    neutral: { neutral: 0.0, curious: 0.5, hesitant: 0.5, enthusiastic: 0.6 },
    hesitant: { hesitant: 0.0, neutral: 0.5, curious: 0.8, enthusiastic: 0.9 }
  };
  
  return toneDistances[predicted][reported] || 1.0;
}

export function shouldTriggerMismatchAlert(
  mismatchScore: number,
  sessionCount: number
): boolean {
  // More tolerant in early sessions, stricter as relationship develops
  const threshold = sessionCount <= 3 ? 0.8 : 0.6;
  return mismatchScore >= threshold;
}

export function calculateDecayCurveStability(
  progressionData: number[]
): number {
  if (progressionData.length < 3) return 1.0;
  
  // Calculate variance to measure smoothness
  const mean = progressionData.reduce((sum, val) => sum + val, 0) / progressionData.length;
  const variance = progressionData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / progressionData.length;
  
  // Convert variance to stability score (lower variance = higher stability)
  return Math.max(0, 1 - variance);
}