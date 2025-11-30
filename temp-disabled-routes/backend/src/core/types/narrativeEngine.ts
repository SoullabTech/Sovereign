/**
 * Narrative Engine Types
 * 
 * Defines interfaces for generating layered responses based on encounter
 * signatures and user capacity levels.
 */

import { EncounterSignature } from './encounterEngine';

export interface LayeredResponse {
  phenomenological: string;     // What the user experiences/feels
  dialogical?: string;         // Questions and perspectives
  architectural?: string;      // Structural patterns and contexts
}

export interface NarrativeConfig {
  // Layer permissions based on user capacity
  allowDialogical: boolean;     // Can present multiple perspectives
  allowArchitectural: boolean;  // Can show structural patterns

  // Voice configuration
  applyMasteryFilter: boolean;  // Apply Stage 4 simplification
  toneOverride?: 'gentle' | 'spacious' | 'direct';

  // Content configuration
  maxComplexity: number;        // 0-1 scale for response complexity
  personalizeDepth: number;     // 0-1 scale for personalization
  
  // Safety configuration
  respectSafetyLevel: boolean;  // Honor encounter safety assessment
  fallbackToSimple: boolean;    // Fall back to simple if safety concerns
}

export interface NarrativeContext {
  userStage: string;
  relationshipDepth: number;
  recentInteractions: any[];
  capacitySignals: any[];
  safetyMetrics: any[];
}

export interface NarrativeEngine {
  /**
   * Generate layered response based on encounter and configuration
   */
  generateResponse(
    encounter: EncounterSignature,
    config: NarrativeConfig,
    context?: NarrativeContext,
    agentVoices?: string[]
  ): Promise<LayeredResponse>;

  /**
   * Apply mastery voice simplification
   */
  applyMasteryVoice?(text: string): string;

  /**
   * Validate response safety and appropriateness
   */
  validateResponse?(
    response: LayeredResponse,
    encounter: EncounterSignature
  ): Promise<{
    safe: boolean;
    warnings: string[];
    recommendations: string[];
  }>;
}