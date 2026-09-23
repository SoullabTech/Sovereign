/** R2-0 — the LAWFUL objects. Must compile with zero diagnostics against the reference contract. ⛔ Not executed. */
import {
  admitReviewDiscuss, declareCrossing, postureUnderLocation, threadKeyOf, bindThread, sameSubject, actAdmissible, CONVERSATIONAL_EFFECTS, SEAMS,
  readingId, observationKey, sectionId, sha256,
  type FindingAnchor, type HistoricalEvidence, type CurrentProse, type DurableReadingOutput, type ReadingProvenance,
  type AsReadObject, type ThenVsNowObject, type CurrentTextOnlyObject, type ReviewDiscussObject, type DeclaredCognitionObject,
} from '@r2-0/contract';

export const anchor: FindingAnchor = { on: 'observation', readingId: readingId('rd-A'), observationKey: observationKey('o7') };
export const then: HistoricalEvidence = { role: 'THEN', inputClass: 'MEMBER_WORK_TEXT', sectionId: sectionId('d-2'), revisionNumber: 3, revisionDigest: sha256('r'.repeat(64)), sectionDigest: sha256('s'.repeat(64)), range: { start: 0, end: 30 }, text: 'Nothing moved on the far bank.', verified: 'digest-verified' };
export const now: CurrentProse = { role: 'NOW', inputClass: 'MEMBER_WORK_TEXT', sectionId: sectionId('d-2'), text: 'Nothing moved on the far bank. She waited.', admission: { kind: 'separately_authorized', authorityRef: 'act-1' } };
export const output: DurableReadingOutput = { role: 'FINDING', inputClass: 'DURABLE_READING_OUTPUT', observation: 'The far bank is where the chapter keeps returning.', doesNotEstablish: ['author-intent'], lens: 'recurrence' };
export const provenance: ReadingProvenance = { role: 'PROVENANCE', inputClass: 'READING_PROVENANCE', inputFingerprint: 'f'.repeat(64), revisionNumber: 3, evidenceRefs: ['passage:d-2:0:30'], location: { state: 'superseded', moved: ['section-text'] } };

export const asRead: AsReadObject = { posture: 'AS_READ', finding: anchor, output, then, provenance };
export const thenVsNow: ThenVsNowObject = { posture: 'THEN_VS_NOW', finding: anchor, output, then, now, provenance };
export const currentTextOnly: CurrentTextOnlyObject = { posture: 'CURRENT_TEXT_ONLY', sectionId: sectionId('d-2'), now };

export const reviewObjects: ReviewDiscussObject[] = [asRead, thenVsNow];
export const declared: DeclaredCognitionObject[] = [asRead, thenVsNow, currentTextOnly];

export const admissions = declared.map(admitReviewDiscuss);
export const crossings = reviewObjects.map(declareCrossing);
export const unchanged = postureUnderLocation('AS_READ', { state: 'superseded', moved: ['section-text'] });
export const thread = bindThread('t-1', anchor);
export const same = sameSubject(thread, anchor);
export const key = threadKeyOf(anchor);
export const compareAdmissible = actAdmissible('compare', 'THEN_VS_NOW');
export const effects = CONVERSATIONAL_EFFECTS;
export const seams = SEAMS;
