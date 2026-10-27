import {
  decideEncounterConsent,
  type EncounterConsentEvent,
  type EncounterConsentPurpose,
  type EncounterConsentScope,
} from '../consentDecision';

const scope: EncounterConsentScope = {
  encounterId: 'enc-1',
  participantId: 'participant-1',
  purpose: 'join',
  agreementVersion: 'agreement-v1',
  generation: 3,
};

function event(
  action: EncounterConsentEvent['action'],
  createdAt: number,
  overrides: Partial<EncounterConsentEvent> = {},
): EncounterConsentEvent {
  return {
    ...scope,
    eventId: `event-${action}-${createdAt}`,
    action,
    createdAt,
    ...overrides,
  };
}

describe('Encounter consent decision law', () => {
  it('allows only the exact participant-authored scope after its latest grant', () => {
    expect(decideEncounterConsent([event('grant', 10)], scope)).toMatchObject({
      allowed: true,
      reason: 'granted',
      authoritativeEventId: 'event-grant-10',
    });
  });

  it.each([
    ['encounter', { encounterId: 'enc-2' }],
    ['participant', { participantId: 'participant-2' }],
    ['purpose', { purpose: 'record_audio' as EncounterConsentPurpose }],
    ['agreement version', { agreementVersion: 'agreement-v2' }],
    ['generation', { generation: 4 }],
  ])('does not transfer authority across a wrong %s', (_label, changed) => {
    const wrongScope = { ...scope, ...changed } as EncounterConsentScope;
    expect(decideEncounterConsent([event('grant', 10)], wrongScope)).toEqual({
      allowed: false,
      reason: 'no_decision',
      shutdown: { required: false, state: 'not_required' },
    });
  });

  it('a join grant never grants recording, captions, MAIA, memory, or sharing', () => {
    const joinGrant = event('grant', 10);
    const otherPurposes: EncounterConsentPurpose[] = [
      'record_audio',
      'temporary_captions',
      'retain_transcript',
      'maia_attendance',
      'retain_summary',
      'retain_developmental_memory',
      'share_artifact',
    ];
    for (const purpose of otherPurposes) {
      expect(decideEncounterConsent([joinGrant], { ...scope, purpose }).allowed).toBe(false);
    }
  });

  it('a later refusal replaces an earlier grant for the same exact scope', () => {
    expect(decideEncounterConsent([event('grant', 10), event('refuse', 11)], scope)).toMatchObject({
      allowed: false,
      reason: 'refused',
      shutdown: { required: false, state: 'not_required' },
    });
  });

  it('a later revoke denies new admission and creates an unacknowledged live shutdown obligation', () => {
    expect(decideEncounterConsent([event('grant', 10), event('revoke', 11)], scope)).toMatchObject({
      allowed: false,
      reason: 'revoked',
      authoritativeEventId: 'event-revoke-11',
      shutdown: { required: true, state: 'required_unacknowledged' },
    });
  });

  it('equal-time competing latest events fail closed instead of trusting array order', () => {
    const grant = event('grant', 10, { eventId: 'grant' });
    const revoke = event('revoke', 10, { eventId: 'revoke' });
    expect(decideEncounterConsent([grant, revoke], scope)).toMatchObject({
      allowed: false,
      reason: 'ambiguous_latest_event',
    });
  });

  it('duplicate event identity and invalid scope fail closed', () => {
    const duplicate = event('grant', 10, { eventId: 'same' });
    expect(decideEncounterConsent([duplicate, { ...duplicate, createdAt: 11 }], scope).reason).toBe('invalid_event');
    expect(decideEncounterConsent([], { ...scope, generation: 0 }).reason).toBe('invalid_scope');
  });
});
