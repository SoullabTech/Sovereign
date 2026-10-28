/**
 * Encounter consent decision law (PURE, no IO).
 *
 * Consent is scoped to one Encounter, participant, purpose, agreement version,
 * and generation. A decision for one purpose never grants another purpose.
 * A revoke denies new admission and creates an explicit, still-unacknowledged
 * live shutdown obligation; it never claims that a live media path has stopped.
 */

export const ENCOUNTER_CONSENT_PURPOSES = [
  'join',
  'record_audio',
  'temporary_captions',
  'retain_transcript',
  'maia_attendance',
  'retain_summary',
  'retain_developmental_memory',
  'share_artifact',
] as const;

export type EncounterConsentPurpose = (typeof ENCOUNTER_CONSENT_PURPOSES)[number];
export type EncounterConsentAction = 'grant' | 'refuse' | 'revoke';

export interface EncounterConsentScope {
  encounterId: string;
  participantId: string;
  purpose: EncounterConsentPurpose;
  agreementVersion: string;
  generation: number;
}

export interface EncounterConsentEvent extends EncounterConsentScope {
  eventId: string;
  actorParticipantId: string;
  action: EncounterConsentAction;
  createdAt: number;
}

export type ConsentDecisionReason =
  | 'granted'
  | 'no_decision'
  | 'refused'
  | 'revoked'
  | 'invalid_scope'
  | 'invalid_event'
  | 'wrong_actor'
  | 'ambiguous_latest_event';

export interface EncounterConsentDecision {
  allowed: boolean;
  reason: ConsentDecisionReason;
  authoritativeEventId?: string;
  shutdown: {
    required: boolean;
    state: 'not_required' | 'required_unacknowledged';
  };
}

const PURPOSES = new Set<string>(ENCOUNTER_CONSENT_PURPOSES);
const ACTIONS = new Set<string>(['grant', 'refuse', 'revoke']);

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validGeneration(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function validScope(scope: EncounterConsentScope): boolean {
  return nonEmpty(scope.encounterId)
    && nonEmpty(scope.participantId)
    && PURPOSES.has(scope.purpose)
    && nonEmpty(scope.agreementVersion)
    && validGeneration(scope.generation);
}

function identifiesScope(event: Partial<EncounterConsentEvent>, scope: EncounterConsentScope): boolean {
  return event.encounterId === scope.encounterId
    && event.participantId === scope.participantId
    && event.purpose === scope.purpose
    && event.agreementVersion === scope.agreementVersion
    && event.generation === scope.generation;
}

function validEvent(event: EncounterConsentEvent): boolean {
  return validScope(event)
    && nonEmpty(event.eventId)
    && nonEmpty(event.actorParticipantId)
    && ACTIONS.has(event.action)
    && Number.isFinite(event.createdAt)
    && event.createdAt >= 0;
}

function denied(reason: ConsentDecisionReason, shutdownRequired = false): EncounterConsentDecision {
  return Object.freeze({
    allowed: false,
    reason,
    shutdown: Object.freeze(shutdownRequired
      ? { required: true, state: 'required_unacknowledged' as const }
      : { required: false, state: 'not_required' as const }),
  });
}

/**
 * Return the current admission decision for one exact consent scope.
 *
 * Events from another Encounter, participant, purpose, version, or generation
 * are never authority for this scope. Equal-timestamp competing latest events
 * are ambiguous and fail closed rather than relying on array order.
 */
export function decideEncounterConsent(
  events: readonly EncounterConsentEvent[],
  scope: EncounterConsentScope,
): EncounterConsentDecision {
  if (!validScope(scope)) return denied('invalid_scope');

  const exact: EncounterConsentEvent[] = [];
  const seenIds = new Set<string>();

  for (const event of events) {
    if (!identifiesScope(event, scope)) continue;
    if (!validEvent(event) || seenIds.has(event.eventId)) return denied('invalid_event');
    if (event.actorParticipantId !== scope.participantId) return denied('wrong_actor');
    seenIds.add(event.eventId);
    exact.push(event);
  }

  if (exact.length === 0) return denied('no_decision');

  // Revocation is terminal for one exact agreement version + generation. A
  // later grant carried by the same threshold capability cannot resurrect the
  // room. Re-entry requires a separately governed new generation and token.
  const revocations = exact.filter((event) => event.action === 'revoke');
  if (revocations.length > 0) {
    const latestRevokeAt = Math.max(...revocations.map((event) => event.createdAt));
    const latestRevokes = revocations.filter((event) => event.createdAt === latestRevokeAt);
    return Object.freeze({
      ...denied('revoked', true),
      ...(latestRevokes.length === 1 ? { authoritativeEventId: latestRevokes[0].eventId } : {}),
    });
  }

  const latestAt = Math.max(...exact.map((event) => event.createdAt));
  const latest = exact.filter((event) => event.createdAt === latestAt);
  if (latest.length !== 1) return denied('ambiguous_latest_event');

  const event = latest[0];
  if (event.action === 'grant') {
    return Object.freeze({
      allowed: true,
      reason: 'granted' as const,
      authoritativeEventId: event.eventId,
      shutdown: Object.freeze({ required: false, state: 'not_required' as const }),
    });
  }

  return Object.freeze({
    ...denied('refused'),
    authoritativeEventId: event.eventId,
  });
}
