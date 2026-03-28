/**
 * Somatic Types — Shared across Coherence, future adaptive routing
 *
 * These types support pre/post session check-ins and session records.
 * No persistence layer yet — stored in component state for MVP.
 */

// =============================================================================
// CHECK-IN
// =============================================================================

export type Activation = 'calm' | 'tense' | 'overwhelmed' | 'shutdown' | 'mixed';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type BodyState = 'grounded' | 'scattered' | 'heavy' | 'agitated' | 'numb';

export interface SomaticCheckIn {
  activation: Activation;
  energy: EnergyLevel;
  bodyState?: BodyState;
  emotionalTone?: string[];
  notes?: string;
}

// =============================================================================
// COHERENCE SESSION
// =============================================================================

export type CoherenceProtocolId =
  | 'quick_reset'
  | 'guided_coherence'
  | 'emotional_coherence';

export type InferredShift = 'downregulated' | 'upregulated' | 'balanced' | 'no_change';

export interface CoherenceSession {
  id: string;
  protocol: CoherenceProtocolId;
  durationSeconds: number;
  preState?: SomaticCheckIn;
  postState?: SomaticCheckIn;
  inferredShift?: InferredShift;
  completedAt: string;
}

// =============================================================================
// SHIFT INFERENCE — simple heuristic, no device data yet
// =============================================================================

export function inferShift(pre?: SomaticCheckIn, post?: SomaticCheckIn): InferredShift {
  if (!pre || !post) return 'no_change';

  const wasActivated = pre.activation === 'overwhelmed' || pre.activation === 'tense';
  const nowCalmer = post.activation === 'calm' || post.activation === 'mixed';

  if (wasActivated && nowCalmer) return 'downregulated';

  const wasLow = pre.energy === 'low';
  const nowHigher = post.energy === 'medium' || post.energy === 'high';

  if (wasLow && nowHigher) return 'upregulated';

  const wasShutdown = pre.activation === 'shutdown';
  const nowPresent = post.activation !== 'shutdown';

  if (wasShutdown && nowPresent) return 'balanced';

  // Check body state improvement
  const ungrounded: BodyState[] = ['scattered', 'agitated', 'numb'];
  if (pre.bodyState && ungrounded.includes(pre.bodyState) && post.bodyState === 'grounded') {
    return 'balanced';
  }

  return 'no_change';
}

/** Human-readable label for inferred shift. */
export function shiftLabel(shift: InferredShift): string {
  switch (shift) {
    case 'downregulated': return 'Your system appears more settled';
    case 'upregulated':   return 'Your system appears more activated';
    case 'balanced':      return 'Your system appears more balanced';
    case 'no_change':     return 'State held steady';
  }
}
