import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ChapterReviewManifest } from '@/lib/writersStudio/rebuild/chapterReviewManifest';
import { mapWholeReview, REVIEW_DEVELOPMENTAL_LENSES } from '../wholeReview';
import {
  ASSESSMENT, HOST, READING, SECTIONS,
} from '../../../../tests/constitutional/writers-studio/flagship-r1-readonly/fixtures';

const idFor = (_lens: DevelopmentalLens, index: number) =>
  `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;

function payloadFor(lens: DevelopmentalLens, index: number) {
  const hasFindings = lens === 'continuity';
  const reading = {
    ...READING,
    id: idFor(lens, index),
    scope: { ...READING.scope, commissionedLens: lens },
    outcome: hasFindings ? 'reading' as const : 'none' as const,
    observations: hasFindings ? READING.observations : [],
  };
  return {
    reading,
    assessment: hasFindings ? ASSESSMENT : { reading: { state: 'current' as const }, observations: {} },
    sections: SECTIONS,
  };
}

const payloads = REVIEW_DEVELOPMENTAL_LENSES.map(payloadFor);
const manifest: ChapterReviewManifest = {
  id: '11111111-1111-4111-8111-111111111111',
  manuscriptId: READING.manuscriptId,  chapterRootSectionId: 's1',
  sectionIds: ['s1', 's2', 's3'],
  draftRevision: 7,
  readingIds: payloads.map((p) => p.reading.id),
  failures: [],
  createdAt: '2026-09-26T20:00:00.000Z',
};

describe('D4R1 whole Review aggregate', () => {
  it('projects one explicit saved run without ranking or inventing readings', () => {
    const out = mapWholeReview({ manifest, payloads, host: HOST, currentRevision: 7 });
    expect(out.kind).toBe('ready');
    if (out.kind !== 'ready') return;

    expect(out.reviewRunId).toBe(manifest.id);
    expect(out.view.findings.map((f) => f.id)).toEqual(['dobs_earlier', 'dobs_later']);
    expect(out.view.lenses).toHaveLength(REVIEW_DEVELOPMENTAL_LENSES.length);
    expect(out.view.lenses.find((l) => l.id === 'continuity')?.availability)
      .toEqual({ kind: 'read', found: 2 });
    expect(out.view.lenses.find((l) => l.id === 'coherence')?.availability)
      .toEqual({ kind: 'read-nothing-noticed' });
    expect(Object.values(out.durable).every((truth) =>
      manifest.readingIds.includes(truth.address.readingId))).toBe(true);
  });


  it('keeps an all-lenses-none Review ready and empty without inventing findings', () => {
    const allNone = REVIEW_DEVELOPMENTAL_LENSES.map((lens, index) => ({
      reading: {
        ...READING,
        id: idFor(lens, index),
        scope: { ...READING.scope, commissionedLens: lens },
        outcome: 'none' as const,
        observations: [],
      },
      assessment: { reading: { state: 'current' as const }, observations: {} },
      sections: SECTIONS,
    }));
    const allNoneManifest: ChapterReviewManifest = {
      ...manifest,
      readingIds: allNone.map((payload) => payload.reading.id),
    };

    const out = mapWholeReview({
      manifest: allNoneManifest,
      payloads: allNone,
      host: HOST,
      currentRevision: 7,
    });
    expect(out.kind).toBe('ready');
    if (out.kind !== 'ready') return;
    expect(out.view.findings).toEqual([]);
    expect(out.view.coverage).toMatchObject({
      read: manifest.sectionIds.length,
      total: manifest.sectionIds.length,
    });
    expect(out.view.lenses.every((lens) =>
      lens.availability.kind === 'read-nothing-noticed')).toBe(true);
    expect(out.durable).toEqual({});
  });

  it('refuses to pose as current after the Work revision moves', () => {
    const out = mapWholeReview({ manifest, payloads, host: HOST, currentRevision: 8 });
    expect(out).toMatchObject({ kind: 'unavailable', reason: 'current_revision_moved' });
  });
  it('refuses a set missing one manifest-named reading instead of silently completing it', () => {
    const out = mapWholeReview({
      manifest,
      payloads: payloads.slice(0, -1),
      host: HOST,
      currentRevision: 7,
    });
    expect(out).toMatchObject({ kind: 'unavailable', reason: 'reading_mismatch' });
  });

  it('refuses duplicate completed lenses rather than selecting one', () => {
    const duplicate = payloads.map((p, i) => i === 1
      ? {
          ...p,
          reading: {
            ...p.reading,
            scope: { ...p.reading.scope, commissionedLens: 'structure' as const },
          },
        }
      : p);
    const out = mapWholeReview({ manifest, payloads: duplicate, host: HOST, currentRevision: 7 });
    expect(out).toMatchObject({ kind: 'unavailable', reason: 'duplicate_lens' });
  });
});
