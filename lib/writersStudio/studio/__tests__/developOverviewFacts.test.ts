import { factsOnlyDevelopOverview } from '@/app/writers-studio/develop/liveDevelopOverview';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

const sections: RebuildSection[] = [
  {
    draftSectionId: 'd2', sourceSectionId: 's2', position: 2,
    heading: 'Second', headingDepth: 2, headingSignal: 'markdown',
    body: 'three four five', editable: true,
  },
  {
    draftSectionId: 'd1', sourceSectionId: 's1', position: 1,
    heading: 'First', headingDepth: 1, headingSignal: 'chapter',
    body: 'one two', editable: true,
  },
];

describe('D5A facts-only Develop Overview', () => {
  it('uses only grounded Work/manuscript facts and attaches no reading claims', () => {
    const view = factsOnlyDevelopOverview({
      manuscriptTitle: 'Manuscript title',
      workTitle: 'Declared Work',
      workForm: 'Book',
      sections,
    });

    expect(view.work).toBe('Declared Work');
    expect(view.kind).toBe('Book');
    expect(view.sections).toBe(2);
    expect(view.words).toBe(5);
    expect(view.pages).toBeUndefined();
    expect(view.map).toBeUndefined();
    expect(view.observations).toEqual([]);
    expect(view.readingAttached).toBe(false);
    expect(view.structure).toEqual([
      { sectionId: 'd1', label: 'First', position: 1, depth: 1 },
      { sectionId: 'd2', label: 'Second', position: 2, depth: 2 },
    ]);
    expect(view.coverage.read).toBe(0);
    expect(view.lenses).toHaveLength(8);
    expect(view.lenses.map((lens) => lens.id)).toContain('themes');
    expect(view.lenses.every((lens) => lens.state === 'not-read' && lens.count === 0)).toBe(true);
  });

  it('does not invent Work identity when neither declaration nor manuscript title exists', () => {
    const view = factsOnlyDevelopOverview({
      manuscriptTitle: null,
      workTitle: null,
      workForm: null,
      sections: [],
    });

    expect(view.work).toBe('This work');
    expect(view.kind).toBe('work');
    expect(view.pages).toBeUndefined();
    expect(view.readingAttached).toBe(false);
  });
});
