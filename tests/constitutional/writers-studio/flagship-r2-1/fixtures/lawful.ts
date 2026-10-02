import {
  buildR21Act, composeResponseEnvelope, admitPosture, bindThread, sameSubject,
  sanctuaryDecision, FINGERPRINT_COVERAGE, INFERENCE_POLICY, CONVERSATIONAL_EFFECTS,
  readingId, observationKey, sectionId, sha256, authorizationRef, disclosureReceiptRef,
  type FindingAnchor, type HistoricalEvidence, type DurableReadingOutput,
  type ReadingProvenance, type AuthorizedAsReadObject,
} from '@r2-1/contract';

export const anchor: FindingAnchor = {
  on: 'observation',
  readingId: readingId('rd-A'),
  observationKey: observationKey('o7'),
};

export const then: HistoricalEvidence = {
  role: 'THEN',
  inputClass: 'MEMBER_WORK_TEXT',
  sectionId: sectionId('d-2'),
  revisionNumber: 3,
  revisionDigest: sha256('r'.repeat(64)),
  sectionDigest: sha256('s'.repeat(64)),
  range: { start: 0, end: 30 },
  text: 'Nothing moved on the far bank.',
  verified: 'digest-verified',
  evidenceRefs: ['passage:d-2:0:30'],
};

export const output: DurableReadingOutput = {
  role: 'FINDING',
  inputClass: 'DURABLE_READING_OUTPUT',
  observation: 'The far bank is where the chapter keeps returning.',
  doesNotEstablish: ['author-intent'],
  lens: 'recurrence',
};

export const provenance: ReadingProvenance = {
  role: 'PROVENANCE',
  inputClass: 'READING_PROVENANCE',
  inputFingerprint: 'f'.repeat(64),
  revisionNumber: 3,
  evidenceRefs: ['passage:d-2:0:30'],
  location: { state: 'superseded', moved: ['section-text'] },
};

export const authorized: AuthorizedAsReadObject = {
  posture: 'AS_READ',
  finding: anchor,
  output,
  then,
  provenance,
  authorization: {
    kind: 'R2_REVIEW_DISCUSS_ACT',
    ref: authorizationRef('r2-auth-1'),
    inputRoles: ['FINDING', 'THEN', 'PROVENANCE'],
    disclosureReceiptRefs: [disclosureReceiptRef('receipt-historical-work-1')],
  },
};

export const act = buildR21Act(authorized);
export const envelope = composeResponseEnvelope(act, {
  provider: 'fixture-provider',
  model: 'fixture-model',
  answeredAt: '2026-09-23T20:00:00.000Z',
  answerText: 'The observation was grounded in the passage as read.',
});
export const asReadAdmission = admitPosture('AS_READ');
export const thenVsNowDeferred = admitPosture('THEN_VS_NOW');
export const currentTextOnlyRejected = admitPosture('CURRENT_TEXT_ONLY');
export const thread = bindThread('thread-1', anchor);
export const same = sameSubject(thread, anchor);
export const sanctuaryBlocked = sanctuaryDecision('FORBID');
export const fingerprintCoverage = FINGERPRINT_COVERAGE;
export const inferencePolicy = INFERENCE_POLICY;
export const effects = CONVERSATIONAL_EFFECTS;
