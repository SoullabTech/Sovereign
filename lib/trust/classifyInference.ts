/**
 * Inference Classification
 *
 * Identifies what kind of meaning transformation is happening.
 * Not all meaning expansion is equal — a direct restatement is
 * fundamentally different from a sensitive synthesis.
 *
 * This classification drives disclosure and expression decisions
 * without adding architectural weight.
 *
 * Classification is deterministic and signal-based, not LLM-based.
 */

import type { TrustAction, TrustChannel, TrustResourceType, InferenceType } from './types';

export interface InferenceContext {
  action: TrustAction;
  channel: TrustChannel;
  resourceType: TrustResourceType;
  /** Whether AI is generating or transforming content */
  aiAssisted: boolean;
  /** Whether content draws from multiple sources (sessions, memory, relational context) */
  multiSource: boolean;
  /** Whether content is intended for someone other than the member */
  outwardBound: boolean;
  /** Optional: purpose hint from the caller */
  purpose?: string;
}

/**
 * Classify the type of inference being performed.
 *
 * Precedence (most specific wins):
 * 1. outward_recommendation: outward + AI + generate/send
 * 2. sensitive_synthesis: multi-source + AI
 * 3. relational_inference: AI + session/transcript resource
 * 4. structured_summary: AI + single source
 * 5. direct_restatement: no AI, or read-only
 */
export function classifyInference(ctx: InferenceContext): InferenceType {
  const { action, aiAssisted, multiSource, outwardBound, resourceType } = ctx;

  // Read actions produce no inference
  if (action === 'read') return 'direct_restatement';

  // No AI → content is practitioner-authored, minimal inference
  if (!aiAssisted) return 'direct_restatement';

  // Outward + AI + action intent → recommendation
  if (outwardBound && (action === 'generate' || action === 'send')) {
    return 'outward_recommendation';
  }

  // Multi-source AI synthesis
  if (multiSource) {
    return 'sensitive_synthesis';
  }

  // AI on session/transcript content → relational inference
  if (resourceType === 'session' || resourceType === 'transcript') {
    return 'relational_inference';
  }

  // AI single-source compression
  if (action === 'generate') {
    return 'structured_summary';
  }

  return 'direct_restatement';
}
