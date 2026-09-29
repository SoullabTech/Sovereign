import fs from 'node:fs';
import path from 'node:path';
import { projectPc3LiveWrite } from '@/app/writers-studio/full-redesign/liveWriteAdapter';

const sections = [
  { draftSectionId: 'p1', sourceSectionId: null, position: 0, heading: 'Part One — Ground', headingDepth: 1, headingSignal: null, body: '', editable: true },
  { draftSectionId: 'c1', sourceSectionId: null, position: 1, heading: 'Chapter 1: Beginning', headingDepth: 1, headingSignal: null, body: '', editable: true },
  { draftSectionId: 's1', sourceSectionId: null, position: 2, heading: 'First movement', headingDepth: 2, headingSignal: null, body: 'one', editable: true },
  { draftSectionId: 's2', sourceSectionId: null, position: 3, heading: 'Second movement', headingDepth: 2, headingSignal: null, body: 'two', editable: true },
  { draftSectionId: 'c2', sourceSectionId: null, position: 4, heading: 'Chapter 2: Return', headingDepth: 1, headingSignal: null, body: '', editable: true },
  { draftSectionId: 's3', sourceSectionId: null, position: 5, heading: 'Third movement', headingDepth: 2, headingSignal: null, body: 'three', editable: true },
] as const;

describe('C12 hierarchical manuscript navigation', () => {
  it('projects the whole manuscript and carries structural roles', () => {
    const view = projectPc3LiveWrite({
      sections: sections as any,
      activeId: 's1',
      bodyOf: (id) => sections.find((s) => s.draftSectionId === id)?.body ?? '',
      statusOf: () => 'saved',
      workTitle: 'Work',
      manuscriptTitle: 'Manuscript',
    });
    expect(view?.data.chapters).toHaveLength(6);
    expect(view?.data.chapters.map((x) => x.role)).toEqual([
      'part', 'chapter', 'section', 'section', 'chapter', 'section',
    ]);
  });
  it('keeps hierarchy presentation-only and chapter-collapsible', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app/writers-studio/full-redesign/WriteRoom.tsx'),
      'utf8',
    );
    expect(source).toContain('data-manuscript-hierarchy="parts-chapters-sections"');
    expect(source).toContain('aria-expanded={open}');
    expect(source).toContain('fr-write-section-children');
    expect(source).not.toMatch(/INSERT|UPDATE|DELETE/);
  });

  it('does not restore the former seven-section viewport', () => {
    const adapter = fs.readFileSync(
      path.join(process.cwd(), 'app/writers-studio/full-redesign/liveWriteAdapter.ts'),
      'utf8',
    );
    expect(adapter).toContain('const visible = navigable');
    expect(adapter).not.toContain('slice(index, index + 7)');
  });
});
