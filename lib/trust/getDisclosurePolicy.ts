/**
 * Disclosure Policy
 *
 * Context-shaped but deterministic disclosure decisions.
 * Varies by channel, relationship, inference level, and privacy mode.
 *
 * Replaces the Phase 1/2 static rule with nuanced logic that still
 * flows through shared infrastructure, not route-local strings.
 *
 * Privacy envelope always wins — this layer never loosens a hard constraint.
 */

import type {
  TrustChannel,
  InferenceType,
  MeaningExpansionLevel,
  PrivacyMode,
  RelationshipType,
} from './types';
import { getDisclosureText, type DisclosureContext } from './getDisclosureText';

export interface DisclosurePolicyInput {
  channel: TrustChannel;
  inferenceType: InferenceType;
  expansionLevel: MeaningExpansionLevel;
  relationship: RelationshipType;
  privacyMode?: PrivacyMode;
  aiAssisted: boolean;
  sessionDerived: boolean;
}

export interface DisclosurePolicyResult {
  required: boolean;
  text: string;
  reason: string;
}

/**
 * Resolve disclosure policy for a given context.
 *
 * Rules (from the spec):
 * - Internal summary may require no user-facing disclosure
 * - AI-assisted parent update requires explicit disclosure
 * - Calendar output needs only exposure-level filtering
 * - Confidential privacy mode overrides everything
 */
export function getDisclosurePolicy(input: DisclosurePolicyInput): DisclosurePolicyResult {
  const {
    channel,
    inferenceType,
    expansionLevel,
    relationship,
    privacyMode,
    aiAssisted,
    sessionDerived,
  } = input;

  // Hard constraint: confidential privacy → no outward disclosure needed
  // because nothing should leave the system at all
  if (privacyMode === 'confidential') {
    return { required: false, text: '', reason: 'confidential_no_output' };
  }

  // No expansion → no disclosure needed
  if (expansionLevel === 'none') {
    return { required: false, text: '', reason: 'no_expansion' };
  }

  // ── Channel-specific rules ─────────────────────────────

  // Oracle (internal reflection): only disclose for sensitive synthesis
  if (channel === 'oracle') {
    if (inferenceType === 'sensitive_synthesis' || inferenceType === 'outward_recommendation') {
      const text = getDisclosureText({
        aiAssisted,
        relationalContext: inferenceType === 'sensitive_synthesis',
        sessionDerived,
        channel,
      });
      return { required: true, text, reason: 'oracle_high_inference' };
    }
    return { required: false, text: '', reason: 'oracle_low_inference' };
  }

  // Studio (session artifacts): disclose for anything AI-assisted going outward
  if (channel === 'studio') {
    if (aiAssisted && (relationship !== 'self')) {
      const text = getDisclosureText({
        aiAssisted,
        relationalContext: inferenceType === 'relational_inference' || inferenceType === 'sensitive_synthesis',
        sessionDerived,
        channel,
      });
      return { required: true, text, reason: 'studio_ai_outward' };
    }
    // Internal studio review — low expansion doesn't need disclosure
    if (expansionLevel === 'low') {
      return { required: false, text: '', reason: 'studio_internal_low' };
    }
  }

  // Comms (outward communication): always disclose for AI or high expansion
  if (channel === 'comms') {
    if (aiAssisted || expansionLevel === 'high') {
      const text = getDisclosureText({
        aiAssisted,
        relationalContext: inferenceType !== 'direct_restatement' && inferenceType !== 'structured_summary',
        sessionDerived,
        channel,
      });
      return { required: true, text, reason: 'comms_ai_or_high_expansion' };
    }
    if (expansionLevel === 'moderate') {
      const text = getDisclosureText({
        aiAssisted: false,
        relationalContext: true,
        sessionDerived,
        channel,
      });
      return { required: true, text, reason: 'comms_moderate_expansion' };
    }
    return { required: false, text: '', reason: 'comms_low_expansion' };
  }

  // Session/memory channels: internal, low bar for disclosure
  if (channel === 'session' || channel === 'memory') {
    if (expansionLevel === 'high') {
      const text = getDisclosureText({ aiAssisted, relationalContext: true, sessionDerived, channel });
      return { required: true, text, reason: 'internal_high_expansion' };
    }
    return { required: false, text: '', reason: 'internal_within_bounds' };
  }

  // Default: require disclosure for moderate+ expansion
  if (expansionLevel === 'moderate' || expansionLevel === 'high') {
    const text = getDisclosureText({ aiAssisted, relationalContext: true, sessionDerived, channel });
    return { required: true, text, reason: 'default_elevated_expansion' };
  }

  return { required: false, text: '', reason: 'default_low' };
}
