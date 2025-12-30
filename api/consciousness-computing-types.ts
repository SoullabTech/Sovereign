/**
 * Type definitions for Consciousness Computing API results
 * Separated from main API file to prevent type drift
 */

import type { ConsciousnessState, ProtocolStep } from './consciousness-types';

export interface DevelopmentTrackingResult {
  userId: string;
  timeRange: string;
  awarenessProgression: Array<{ timestamp: Date; level: number }>;
  insights: string[];
  currentState: ConsciousnessState;
}

export interface DevelopmentRecommendationResult {
  userId: string;
  recommendations: Array<{ title: string; description: string; priority: number }>;
  suggestedProtocols: string[];
  targetLevel: number;
  developmentSteps: ProtocolStep[];
  estimatedTimeframe: string;
}

export interface AnalyticsResult {
  timeRange: string;
  dataPoints: Array<{ timestamp: Date; metrics: Record<string, number> }>;
  aggregations: Record<string, number>;
}
