/**
 * Meaning Expansion Level
 *
 * Scores how much a given operation expands meaning beyond its
 * original scope. Higher expansion → stronger disclosure,
 * more conservative expression profile.
 *
 * Signals:
 * - single source vs multi-source
 * - paraphrase vs synthesis
 * - descriptive vs interpretive
 * - inward vs outward destination
 *
 * Deterministic, not model-based.
 */

import type { InferenceType, MeaningExpansionLevel, TrustChannel } from './types';

export interface ExpansionContext {
  inferenceType: InferenceType;
  channel: TrustChannel;
  multiSource: boolean;
  outwardBound: boolean;
}

/**
 * Compute meaning expansion level from inference type and context.
 *
 * The score reflects how far meaning has traveled from its origin.
 */
export function getMeaningExpansionLevel(ctx: ExpansionContext): MeaningExpansionLevel {
  const { inferenceType, outwardBound, multiSource } = ctx;

  // No inference → no expansion
  if (inferenceType === 'direct_restatement') return 'none';

  // Outward recommendation is always high — meaning leaves the system
  if (inferenceType === 'outward_recommendation') return 'high';

  // Sensitive synthesis is high when outward, moderate when internal
  if (inferenceType === 'sensitive_synthesis') {
    return outwardBound ? 'high' : 'moderate';
  }

  // Relational inference: moderate baseline, high if multi-source + outward
  if (inferenceType === 'relational_inference') {
    if (multiSource && outwardBound) return 'high';
    return 'moderate';
  }

  // Structured summary: low unless outward
  if (inferenceType === 'structured_summary') {
    return outwardBound ? 'moderate' : 'low';
  }

  return 'none';
}
