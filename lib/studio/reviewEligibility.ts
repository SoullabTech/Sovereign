/**
 * Review Eligibility Gate — Session Room rescue
 *
 * Single source of truth for whether a session can enter review.
 * Used by both the past-sessions list (to disable Review button)
 * and the review panel (to block or show remediation UI).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReviewBlockReason =
  | 'missing_session'
  | 'no_transcript'
  | 'no_segments'
  | 'no_assembled_turns'
  | 'session_too_short';

export interface ReviewEligibility {
  allowed: boolean;
  reason?: ReviewBlockReason;
  /** Human-readable message for the operator */
  message?: string;
}

export interface ReviewableSession {
  id?: string;
  transcript_enabled?: boolean;
  segment_count?: number;
  assembled_turns?: number;
  has_assembled?: boolean;
  duration_seconds?: number;
  marker_count?: number;
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export function getReviewEligibility(session: ReviewableSession | null | undefined): ReviewEligibility {
  if (!session || !session.id) {
    return {
      allowed: false,
      reason: 'missing_session',
      message: 'No session selected.',
    };
  }

  // Sessions under 5 seconds are too short to review meaningfully
  if (session.duration_seconds !== undefined && session.duration_seconds < 5) {
    return {
      allowed: false,
      reason: 'session_too_short',
      message: 'This session was too short to review.',
    };
  }

  // Assembled turns are the strongest signal — if they exist, session is reviewable
  // regardless of transcript_enabled or segment_count (assembled turns = processed content)
  if (session.has_assembled && session.assembled_turns && session.assembled_turns > 0) {
    return { allowed: true };
  }

  // If transcript wasn't enabled AND no segments exist, there's nothing to review
  if (!session.transcript_enabled && (!session.segment_count || session.segment_count < 1)) {
    return {
      allowed: false,
      reason: 'no_transcript',
      message: 'Transcript was not enabled for this session.',
    };
  }

  // No segments captured at all (and no assembled turns — already checked above)
  if (!session.segment_count || session.segment_count < 1) {
    return {
      allowed: false,
      reason: 'no_segments',
      message: 'No transcript segments were captured for this session.',
    };
  }

  // Segments exist but assembly hasn't happened — still allow review
  // (the API falls back to raw segments if assembled turns don't exist)
  // But warn if segment count is very low
  if (session.segment_count > 0) {
    return { allowed: true };
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Helpers for UI
// ---------------------------------------------------------------------------

/** Badge text for the past-sessions list */
export function getSessionStatusBadge(session: ReviewableSession): {
  text: string;
  color: string;
} | null {
  if (session.has_assembled && session.assembled_turns && session.assembled_turns > 0) {
    return { text: 'assembled', color: 'bg-teal-500/10 text-teal-400' };
  }
  if (session.segment_count && session.segment_count > 0) {
    return { text: 'segments only', color: 'bg-amber-500/10 text-amber-400' };
  }
  if (!session.transcript_enabled) {
    return { text: 'no transcript', color: 'bg-red-500/10 text-red-400' };
  }
  return { text: 'empty', color: 'bg-red-500/10 text-red-400' };
}
