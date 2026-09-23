import type { ReviewHostFacts, RealReviewInput, StoredReadingPayload, StoredReadingSummary } from '@/lib/writersStudio/studio/realReview';
import type { DevelopmentalReading } from '@/lib/manuscript/developmentalReading/contract';
import type { ReadingAssessment } from '@/lib/manuscript/developmentalReading/assess';
import type { ObservationId, BasisFingerprint } from '@/lib/manuscript/developmentalReading/observationIdentity';

const MS = '22222222-2222-2222-2222-222222222222';
export const RID = '33333333-3333-3333-3333-333333333333';
const FP = 'f'.repeat(64) as BasisFingerprint;
const oid = (s: string) => s as ObservationId;

export const READING: DevelopmentalReading = {
  id: RID, manuscriptId: MS,
  scope: { commissionedLens: 'continuity', bodyScope: ['s1', 's2', 's3'], withStructure: false },
  readState: {
    draftId: 'draft-1', revisionNumber: 7, revisionDigest: 'r'.repeat(64),
    sectionTopology: ['s1', 's2', 's3'],
    sections: {
      s1: { revisionNumber: 7, range: { start: 0, end: 10 }, digest: 'a'.repeat(64) },
      s2: { revisionNumber: 7, range: { start: 10, end: 20 }, digest: 'b'.repeat(64) },
      s3: { revisionNumber: 7, range: { start: 20, end: 30 }, digest: 'c'.repeat(64) },
    }, inputFingerprint: 'i'.repeat(64),
  },
  coverage: { sections: { s1: 'body', s2: 'body', s3: 'body' } },
  provenance: {
    reader: { provider: 'anthropic', model: 'reader-model', promptHash: 'p', readerVersion: 'DEVELOPMENTAL-READER-01' },
    classifier: { provider: 'anthropic', model: 'reader-model', promptHash: 'c', classifierVersion: 'CLASSIFIER-01' },
    readingContractVersion: 'DEVELOPMENTAL-READING-CONTRACT-03', frozenAt: '2026-09-22T12:00:00.000Z',
  },
  outcome: 'reading',
  /* Admission order deliberately differs from manuscript order. */
  observations: [
    { key: 'o1', observationId: oid('dobs_later'), admissionIndex: 0, basisFingerprint: FP,
      position: { sectionPosition: 1, codePointStart: 0 }, lens: 'continuity', phenomenon: 'movement',
      evidenceRefs: [{ kind: 'section', sectionId: 's2' }],
      observation: 'The river changes from named place to remembered place in this section.',
      doesNotEstablish: ['author-intent', 'editorial-consequence'], structureDependency: { kind: 'independent' } },
    { key: 'o2', observationId: oid('dobs_earlier'), admissionIndex: 1, basisFingerprint: FP,
      position: { sectionPosition: 0, codePointStart: 2 }, lens: 'continuity', phenomenon: 'recurrence',
      evidenceRefs: [{ kind: 'passage', sectionId: 's1', range: { start: 2, end: 8 } }],
      observation: 'The river appears here before it returns in the next section.',
      doesNotEstablish: ['author-intent'], structureDependency: { kind: 'independent' } },
  ],
};

export const ASSESSMENT: ReadingAssessment = {
  reading: { state: 'current' }, observations: { o1: { state: 'current' }, o2: { state: 'current' } },
};

export const SECTIONS = [
  { id: 's1', heading: 'Opening' }, { id: 's2', heading: 'Return' }, { id: 's3', heading: null },
];

export const HOST: ReviewHostFacts = {
  manuscriptId: MS, work: 'The River Between', kind: 'novel', scope: { kind: 'work' },
  context: {
    chapterLabel: 'Current manuscript', chapterTitle: 'The River Between', page: '',
    paragraphs: [{ id: 's1', text: 'Current section one.' }, { id: 's2', text: 'Current section two.' }],
  },
};

export const SUMMARY: StoredReadingSummary = {
  id: RID, outcome: 'reading', commissionedLens: 'continuity',
  frozenAt: READING.provenance.frozenAt, observationCount: 2,
};

export const PAYLOAD: StoredReadingPayload = { reading: READING, assessment: ASSESSMENT, sections: SECTIONS };

export const READY_INPUT: RealReviewInput = {
  summaries: [SUMMARY], selectedReadingId: RID, payload: PAYLOAD, host: HOST,
};

export const NONE_READING: DevelopmentalReading = { ...READING, outcome: 'none', observations: [] };
export const NONE_INPUT: RealReviewInput = {
  summaries: [{ ...SUMMARY, outcome: 'none', observationCount: 0 }], selectedReadingId: RID,
  payload: { reading: NONE_READING, assessment: { reading: { state: 'current' }, observations: {} }, sections: SECTIONS }, host: HOST,
};

export const NO_READING_INPUT: RealReviewInput = { summaries: [], selectedReadingId: null, payload: null, host: HOST };

export const STALE_INPUT: RealReviewInput = {
  ...READY_INPUT,
  payload: {
    reading: READING,
    assessment: {
      reading: { state: 'superseded', moved: [{ what: 'section-text', sectionId: 's1' }] },
      observations: { o1: { state: 'current' }, o2: { state: 'superseded', moved: [{ what: 'section-text', sectionId: 's1' }] } },
    }, sections: SECTIONS,
  },
};

export const WRONG_WORK_INPUT: RealReviewInput = {
  ...READY_INPUT, host: { ...HOST, manuscriptId: '44444444-4444-4444-4444-444444444444' },
};

export const MALFORMED_INPUT: RealReviewInput = {
  ...READY_INPUT, payload: { reading: { id: RID, manuscriptId: MS }, assessment: {}, sections: [] },
};
