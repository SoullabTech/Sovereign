/**
 * Collective Dashboard Types
 * 
 * Types for the collective intelligence dashboard and pattern detection
 */

import { Element, Phase } from "./shift";

export interface CollectivePattern {
  type: 'elemental_wave' | 'archetypal_shift' | 'shadow_pattern' | 'integration_phase';
  data: {
    element?: Element;
    archetype?: string;
    shadow?: string;
    phase?: Phase;
  };
  strength: number;              // 0-1
  participantCount: number;
  confidence: number;            // 0-1
  description: string;
}

export interface CollectiveSnapshot {
  generatedAt: string;
  window: string;
  coherence: CoherenceScore;
  topThemes: Theme[];
  emerging: Theme[];
  shadowSignals: ShadowSignal[];
  timingHint: string;
}

export interface CoherenceScore {
  value: number;                 // 0-1
  trend: 'rising' | 'stable' | 'falling';
  description: string;
}

export interface Theme {
  name: string;
  strength: number;              // 0-1
  participantCount: number;
  description: string;
}

export interface ShadowSignal {
  pattern: string;
  strength: number;              // 0-1
  recommendation: string;
}

export interface Pattern {
  id: string;
  type: string;
  description: string;
  strength: number;
  participantCount: number;
  window: string;
  visual?: PatternVisual;
}

export interface PatternVisual {
  type: 'heatmap' | 'wave' | 'network';
  data: any;
}

export interface TimingWindow {
  phase: string;
  window: string;
  confidence: number;
  description: string;
  practices: string[];
}

export interface DashboardQueryParams {
  expert?: boolean;
  window?: string;
  limit?: number;
  horizon?: string;
}

export interface PatternsResponse {
  generatedAt: string;
  window: string;
  items: Pattern[];
}

export interface TimingResponse {
  generatedAt: string;
  horizon: string;
  windows: TimingWindow[];
}

export interface DashboardError {
  code: string;
  message: string;
  fallback?: any;
}

export interface RawPatternData {
  elementalWaves: any[];
  archetypeShifts: any[];
  shadowPatterns: any[];
  consciousnessLeaps: any[];
  integrationPhases: any[];
}