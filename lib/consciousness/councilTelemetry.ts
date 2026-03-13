/**
 * Interpretive Council telemetry — fire-and-forget structural logging.
 *
 * What this is: lightweight signal on how the council is actually being used.
 * What this is NOT: session content, message analysis, or psychographic tracking.
 *
 * Two event types:
 *   guide_selected          — member explicitly set a default guide (via settings)
 *   guide_active_at_response — which guide + source was live when MAIA responded
 *
 * Design invariants:
 *   - Never blocks the oracle or the settings route (void return, errors swallowed)
 *   - Never stores message content, user text, or response text
 *   - depth_tier is optional (null for guide_selected events)
 *   - metadata JSONB is available for future enrichment but must stay structural
 */

export type GuideEventType =
  | 'guide_selected'
  | 'guide_active_at_response';

export interface GuideEvent {
  memberId: string;
  eventType: GuideEventType;
  guideId: string;
  source?: string;       // CouncilResolution['source']
  depthTier?: string;    // 'threshold' | 'core' | 'deep'
  metadata?: Record<string, unknown>; // structural only — no content
}

/**
 * Log a council event. Fire-and-forget — never throws, never awaited by callers.
 */
export function logGuideEvent(event: GuideEvent): void {
  _logGuideEvent(event).catch(() => {
    // Telemetry failure must never surface to the user or break the oracle.
  });
}

async function _logGuideEvent(event: GuideEvent): Promise<void> {
  const { query } = await import('@/lib/db/postgres');
  await query(
    `INSERT INTO interpretive_guide_events
       (member_id, event_type, guide_id, source, depth_tier, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.memberId,
      event.eventType,
      event.guideId,
      event.source ?? null,
      event.depthTier ?? null,
      event.metadata ? JSON.stringify(event.metadata) : null,
    ]
  );
}

// ---------------------------------------------------------------------------
// Convenience wrappers — named by the two call sites so intent is clear
// ---------------------------------------------------------------------------

/**
 * Call from PUT /api/settings/approach when a member saves a new default guide.
 */
export function logGuideSelected(memberId: string, guideId: string): void {
  logGuideEvent({ memberId, eventType: 'guide_selected', guideId });
}

/**
 * Call from oracle route after resolveCouncil(), before prompt assembly.
 */
export function logGuideActiveAtResponse(
  memberId: string,
  guideId: string,
  source: string,
  depthTier?: string,
): void {
  logGuideEvent({
    memberId,
    eventType: 'guide_active_at_response',
    guideId,
    source,
    depthTier,
  });
}
