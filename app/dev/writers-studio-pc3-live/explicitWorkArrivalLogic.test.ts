import {
  declaredManuscriptsForWork,
  explicitWorkForArrival,
} from './explicitWorkArrivalLogic';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';

const manuscript = (id: string): CurrentManuscript => ({
  id,
  title: id,
  createdAt: '2026-01-01',
  sectionCount: 1,
  charCount: 100,
  keepCount: 0,
  lastMemberDraftActivityAt: null,
  draftCharCount: null,
  hasDraftWriting: false,
  hasWriting: true,
  hasCurrentMemberContribution: true,
});

const work = (id: string, manuscriptIds: string[]): LivingWork => ({
  id,
  title: id,
  purpose: null,
  form: null,
  stage: null,
  manuscriptState: 'existing-manuscript',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  expressions: manuscriptIds.map((expressionId) => ({
    expressionType: 'manuscript',
    expressionId,
    declaredAt: '2026-01-01',
  })),
  materials: [],
});

describe('explicit Work arrival', () => {
  it('returns exactly the manuscripts explicitly declared in the selected Work', () => {
    const selected = work('work-a', ['m-1', 'm-2']);
    const result = declaredManuscriptsForWork(selected, [
      manuscript('m-2'),
      manuscript('m-3'),
      manuscript('m-1'),
    ]);

    expect(result.map((item) => item.id)).toEqual(['m-2', 'm-1']);
  });

  it('keeps zero, one, and multiple manuscripts distinct', () => {
    expect(explicitWorkForArrival([work('none', [])], [manuscript('m-1')], 'none')?.manuscripts).toEqual([]);
    expect(explicitWorkForArrival([work('one', ['m-1'])], [manuscript('m-1')], 'one')?.manuscripts).toHaveLength(1);
    expect(explicitWorkForArrival([work('many', ['m-1', 'm-2'])], [manuscript('m-1'), manuscript('m-2')], 'many')?.manuscripts).toHaveLength(2);
  });

  it('does not trust an unknown Work id from the URL', () => {
    expect(explicitWorkForArrival([work('known', ['m-1'])], [manuscript('m-1')], 'unknown')).toBeNull();
  });
});
