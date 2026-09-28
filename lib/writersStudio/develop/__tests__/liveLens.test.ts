import { lensReadingChoices, projectLiveDevelopReading } from '../liveLens';
import { mapRealReview } from '@/lib/writersStudio/studio/realReview';
import {
  ASSESSMENT, HOST, READING, SECTIONS, SUMMARY,
} from '../../../../tests/constitutional/writers-studio/flagship-r1-readonly/fixtures';

describe('D5D–D5H live Develop lens projection', () => {
  it('never chooses across lens identity', () => {
    const choices = lensReadingChoices([
      SUMMARY,
      { ...SUMMARY, id: 'voice-reading', commissionedLens: 'voice' },
    ], 'voice');
    expect(choices.map((item) => item.id)).toEqual(['voice-reading']);
  });

  it('projects current evidence with exact current return addresses', () => {
    const projected = projectLiveDevelopReading('continuity', {
      reading: READING, assessment: ASSESSMENT, sections: SECTIONS,
    });
    expect(projected.ok).toBe(true);
    if (!projected.ok) return;
    expect(projected.reading.observations.map((item) => item.returnTo?.sectionId))
      .toEqual(['s2', 's1']);
    expect(projected.reading.observations.every((item) => item.evidence.length > 0)).toBe(true);
  });

  it('keeps a moved observation but removes current-return authority', () => {
    const projected = projectLiveDevelopReading('continuity', {
      reading: READING,
      assessment: {
        reading: { state: 'superseded', moved: [{ what: 'section-text', sectionId: 's1' }] },
        observations: {
          o1: { state: 'current' },
          o2: { state: 'superseded', moved: [{ what: 'section-text', sectionId: 's1' }] },
        },
      },
      sections: SECTIONS,
    });
    expect(projected.ok).toBe(true);
    if (!projected.ok) return;
    expect(projected.reading.observations[0]?.returnTo?.sectionId).toBe('s2');
    expect(projected.reading.observations[1]?.returnTo).toBeNull();
    expect(projected.reading.observations[1]?.state).toBe('superseded');
  });

  it('admits Coherence into the governed observation family', () => {
    const coherenceReading = {
      ...READING,
      scope: { ...READING.scope, commissionedLens: 'coherence' as const },
      observations: READING.observations.map((observation) => ({
        ...observation, lens: 'coherence' as const,
      })),
    };
    const out = mapRealReview({
      summaries: [{ ...SUMMARY, commissionedLens: 'coherence' }],
      selectedReadingId: SUMMARY.id,
      payload: { reading: coherenceReading, assessment: ASSESSMENT, sections: SECTIONS },
      host: HOST,
    });
    expect(out.kind).toBe('ready');
    if (out.kind !== 'ready') return;
    expect(out.view.findings.every((finding) => finding.domain === 'coherence')).toBe(true);
  });
});
