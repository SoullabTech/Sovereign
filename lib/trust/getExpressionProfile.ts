/**
 * Expression Profile
 *
 * Shapes how output is expressed without changing the core trust decision.
 * This is not a style engine — it is an expression constraint layer
 * attached to trust outcomes.
 *
 * The profile tells downstream generators (oracle, artifact gen, comms draft)
 * how much interpretive latitude they have.
 *
 * Profiles:
 * - minimal: only what is necessary
 * - neutral_clinical: structured, low-interpretation
 * - relationally_gentle: explicit about uncertainty and scope
 * - protective_external: reduced specificity for outward channels
 * - reflective_internal: allows richer synthesis inside protected contexts
 */

import type {
  TrustChannel,
  InferenceType,
  MeaningExpansionLevel,
  PrivacyMode,
  RelationshipType,
  ExpressionProfile,
} from './types';

export interface ExpressionProfileInput {
  channel: TrustChannel;
  inferenceType: InferenceType;
  expansionLevel: MeaningExpansionLevel;
  relationship: RelationshipType;
  privacyMode?: PrivacyMode;
  aiPermitted: boolean;
}

/**
 * Resolve the expression profile for a given trust context.
 *
 * Key principle: outward communication is more conservative than
 * internal reflection. Privacy mode is the hard ceiling.
 */
export function getExpressionProfile(input: ExpressionProfileInput): ExpressionProfile {
  const {
    channel,
    inferenceType,
    expansionLevel,
    relationship,
    privacyMode,
    aiPermitted,
  } = input;

  // Hard constraint: confidential → minimal everywhere
  if (privacyMode === 'confidential') return 'minimal';

  // Sensitive privacy + outward → protective
  if (privacyMode === 'sensitive' && (channel === 'comms' || relationship === 'parent_guardian' || relationship === 'external')) {
    return 'protective_external';
  }

  // AI not permitted → minimal (system can't elaborate)
  if (!aiPermitted) return 'minimal';

  // ── Channel-specific profiles ──────────────────────────

  // Oracle (internal reflection): richest expression allowed
  if (channel === 'oracle') {
    if (relationship === 'self') return 'reflective_internal';
    // Practitioner using oracle for client context
    if (inferenceType === 'sensitive_synthesis') return 'relationally_gentle';
    return 'reflective_internal';
  }

  // Studio (session artifacts): clinical for outward, gentle for review
  if (channel === 'studio') {
    if (relationship === 'parent_guardian' || relationship === 'external') {
      return 'protective_external';
    }
    if (relationship === 'practitioner_to_client') {
      return expansionLevel === 'high' ? 'relationally_gentle' : 'neutral_clinical';
    }
    if (relationship === 'care_team') return 'neutral_clinical';
    return 'neutral_clinical';
  }

  // Comms (outward communication): conservative by default
  if (channel === 'comms') {
    if (relationship === 'parent_guardian' || relationship === 'external') {
      return 'protective_external';
    }
    if (expansionLevel === 'high') return 'protective_external';
    if (inferenceType === 'relational_inference' || inferenceType === 'sensitive_synthesis') {
      return 'relationally_gentle';
    }
    return 'neutral_clinical';
  }

  // Session/memory (internal): generous within bounds
  if (channel === 'session' || channel === 'memory') {
    if (expansionLevel === 'high') return 'relationally_gentle';
    return 'reflective_internal';
  }

  // Default
  return 'neutral_clinical';
}
