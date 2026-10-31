import {
  examineAuthorFirstSaveDesign,
  type ProposedAuthorFirstIntent,
  type ServerBoundEvidenceForReview,
} from '../authorFirstSaveAdmissionCandidate';

/** All values here are invented; no identities, Work, Source, SQL, auth or network. */
const source = 'The lantern 🜂 turns.\r\nAnother fictional line.';
const selected = '🜂 turns.';
const start = Array.from(source).indexOf('🜂');
const end = start + Array.from(selected).length;
const request: ProposedAuthorFirstIntent = {
  sectionId: 'fictional-section-a',
  range: { start, end },
  revisionNumber: 7,
  heldText: selected,
  replacementText: '🜂 becomes flame.\r\nA new author line.',
  supersedes: null,
  sanctuary: false,
  gestureId: '123e4567-e89b-42d3-a456-426614174000',
};
const evidence: ServerBoundEvidenceForReview = {
  memberId: 'fiction-member-a',
  workId: 'fiction-work-a',
  sectionId: request.sectionId,
  ownerCurrent: true,
  grantCurrent: true,
  consentCurrent: true,
  sourcePresent: true,
  sectionEditable: true,
  sourceDeleted: false,
  currentRevision: 7,
  projectedBody: source,
  currentPosture: 'ordinary',
  gestureAlreadyConsumed: false,
};
const review = (overrideRequest: Record<string, unknown> = {},
  overrideServer: Partial<ServerBoundEvidenceForReview> = {}) =>
  examineAuthorFirstSaveDesign({ ...request, ...overrideRequest }, { ...evidence, ...overrideServer });
const refused = (reason: string) => ({ status: 'refused', reason });

describe('AUTHOR-FIRST Class A design falsifier — explicitly NOT wired to persistence', () => {
  it('permits a correctly projected codepoint interval for review, not authorization', () => {
    expect(review()).toEqual({ status: 'candidate_only_NOT_AUTHORIZED' });
  });
  it('does not turn the exact wording or empty author wording into a model proposal', () => {
    expect(review({ replacementText: '' })).toEqual({ status: 'candidate_only_NOT_AUTHORIZED' });
    expect(review({ replacementText: '  \r\n🜂  ' })).toEqual({ status: 'candidate_only_NOT_AUTHORIZED' });
  });
  it.each(['memberId', 'workId', 'chainId', 'threadId', 'author', 'craftKept', 'persisted'])(
    'refuses caller-supplied %s as a forged authority field', field => {
      expect(review({ [field]: 'forged' })).toEqual(refused('unknown_field'));
    },
  );
  it('requires a real object, strict range shape and an explicit root predecessor', () => {
    expect(examineAuthorFirstSaveDesign([], evidence)).toEqual(refused('invalid_request'));
    expect(review({ range: { start, end, cachedOffset: 3 } })).toEqual(refused('invalid_selection'));
    expect(review({ range: { start: end, end: start } })).toEqual(refused('invalid_selection'));
    expect(review({ supersedes: 'fiction-model-version' })).toEqual(refused('not_first_version'));
    expect(review({ supersedes: undefined })).toEqual(refused('not_first_version'));
  });
  it('requires exact safe revision and bounded author text/gesture shape', () => {
    expect(review({ revisionNumber: -1 })).toEqual(refused('invalid_revision'));
    expect(review({ revisionNumber: 2.5 })).toEqual(refused('invalid_revision'));
    expect(review({ replacementText: null })).toEqual(refused('invalid_wording'));
    expect(review({ replacementText: 'x'.repeat(200_001) })).toEqual(refused('invalid_wording'));
    expect(review({ gestureId: 'an-access-token' })).toEqual(refused('invalid_gesture'));
  });
  it('refuses signed-out or missing authenticated member despite apparently valid client selection', () => {
    expect(review({}, { memberId: null })).toEqual(refused('not_authenticated'));
  });
  it.each([
    ['other Work', { workId: null }],
    ['different owned section', { sectionId: 'fictional-section-b' }],
    ['foreign member', { ownerCurrent: false }],
    ['revoked share', { grantCurrent: false }],
    ['consent withdrawn', { consentCurrent: false }],
  ] as const)('refuses %s before any transaction eligibility', (_label, patch) => {
    expect(review({}, patch)).toEqual(refused('not_owned_or_revoked'));
  });
  it.each([
    ['missing original', { sourcePresent: false }],
    ['deleted Work', { sourceDeleted: true }],
    ['noneditable Source', { sectionEditable: false }],
    ['unreadable section body', { projectedBody: null }],
  ] as const)('refuses %s rather than manufacturing an author copy', (_label, patch) => {
    expect(review({}, patch)).toEqual(refused('source_unavailable'));
  });
  it('requires explicit current posture from both the gesture and separately grounded server', () => {
    expect(review({ sanctuary: undefined })).toEqual(refused('posture_unresolved'));
    expect(review({ sanctuary: 'false' })).toEqual(refused('posture_unresolved'));
    expect(review({ sanctuary: true })).toEqual(refused('sanctuary_unavailable'));
    expect(review({}, { currentPosture: 'sanctuary' })).toEqual(refused('sanctuary_unavailable'));
    expect(review({}, { currentPosture: 'unresolved' })).toEqual(refused('posture_unresolved'));
  });
  it('refuses stale Source and replay/missing idempotency evidence', () => {
    expect(review({}, { currentRevision: 8 })).toEqual(refused('stale_revision'));
    expect(review({}, { gestureAlreadyConsumed: true })).toEqual(refused('replayed_or_unproven_gesture'));
    expect(review({}, { gestureAlreadyConsumed: 'unknown' })).toEqual(refused('replayed_or_unproven_gesture'));
  });
  it('refuses a forged heldText even with the same revision and coordinates', () => {
    expect(review({ heldText: 'turns.' })).toEqual(refused('selection_mismatch'));
    expect(review({ heldText: selected.replace('🜂', '') })).toEqual(refused('selection_mismatch'));
  });
  it('preserves original CRLF/Unicode and refuses UTF-16 mistaken offsets', () => {
    expect(review()).toEqual({ status: 'candidate_only_NOT_AUTHORIZED' });
    expect(review({ range: { start: start + 1, end: end + 1 } }))
      .toEqual(refused('selection_mismatch'));
    expect(review({ heldText: '🜂 turns.\n' })).toEqual(refused('selection_mismatch'));
  });
  it('rejects an ambiguous repeated phrase even when its characters match', () => {
    expect(review({
      range: { start: 0, end: 5 }, heldText: 'again',
    }, { projectedBody: 'again and again' })).toEqual(refused('selection_ambiguous'));
  });
  it('does not change fictional server evidence or request source', () => {
    const before = JSON.stringify({ request, evidence });
    review();
    expect(JSON.stringify({ request, evidence })).toBe(before);
  });
});
