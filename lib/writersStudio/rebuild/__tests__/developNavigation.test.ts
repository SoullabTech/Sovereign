import { describe, expect, it } from 'vitest';
import { developChapterSpanFor, developNavigation } from '../developNavigation';
import type { RebuildSection } from '../model';

const at = (id: string, position: number, heading: string, headingDepth = 1): RebuildSection =>
  ({ draftSectionId: id, sourceSectionId: id, position, heading,
    headingDepth, headingSignal: null, body: 'Original words remain untouched', editable: true });

describe('Develop: navigation-only chapter folding and explicit read boundaries', () => {
  const rows = [
    at('title', 0, 'Elemental Alchemy'),
    at('dedication', 1, 'Dedication', 2),
    at('part-1', 2, 'Part One — The Ground'),
    at('opening', 3, 'The Crystal of Self-Knowledge'),
    at('ch-2', 4, 'Chapter 2: The Torus of Change'),
    at('c2-a', 5, 'The Dance of Transformation'),
    at('c2-b', 6, 'The Nature of Change'),
    at('c2-b-1', 7, 'The Spiral: A Model of Change', 2),
    at('ch-3', 8, 'Chapter 3: Understanding the Trinity'),
    at('c3-a', 9, 'The Field of Becoming'),
    at('part-2', 10, 'Part Two — The Elements'),
    at('water', 11, 'Water Introduction'),
    at('ch-6', 12, 'Chapter 6: Water'),
  ];
  it('folds same-depth imported subsection headings under the explicit chapter without rewriting them', () => {
    const before = JSON.stringify(rows);
    const nav = developNavigation(rows);
    expect(nav.map(n => n.section.draftSectionId)).toEqual(['title', 'dedication', 'part-1', 'part-2']);
    const part = nav[2]!;
    expect(part.children.map(n=>n.section.draftSectionId)).toEqual(['opening', 'ch-2', 'ch-3']);
    expect(part.children[1]!.children.map(n=>n.section.draftSectionId)).toEqual(['c2-a','c2-b','c2-b-1']);
    expect(rows[5]!.headingDepth).toBe(1);
    expect(JSON.stringify(rows)).toBe(before);
  });
  it('reads every section in Chapter 2 to the NEXT EXPLICIT chapter, not merely the heading', () => {
    for (const focus of ['ch-2','c2-a','c2-b-1']) {
      const chapter = developChapterSpanFor(rows,focus);
      expect(chapter?.root.draftSectionId).toBe('ch-2');
      expect(chapter?.sections.map(s=>s.draftSectionId)).toEqual(['ch-2','c2-a','c2-b','c2-b-1']);
    }
  });
  it('stops at an explicit Part boundary and never invents an unlabeled Chapter', () => {
    expect(developChapterSpanFor(rows,'part-1')).toBeNull();
    expect(developChapterSpanFor(rows,'opening')).toBeNull();
    expect(developChapterSpanFor(rows,'part-2')).toBeNull();
    expect(developChapterSpanFor(rows,'water')).toBeNull();
    expect(developChapterSpanFor(rows,'ch-6')?.sections.map(s=>s.draftSectionId)).toEqual(['ch-6']);
  });
  it('preserves all chapter headings while keeping isolated front matter outside', () => {
    const nav=developNavigation(rows);
    const count=(nodes: typeof nav):number=>nodes.reduce((sum,n)=>sum+1+count(n.children),0);
    expect(count(nav)).toBe(rows.length);
    expect(nav[1]!.section.draftSectionId).toBe('dedication');
  });
  it('never invents a chapter from typographic language or an unconfirmed depth', () => {
    const sample=[at('intro',0,'A Chapter of My Life'),at('fake',1,'Chapter 99: Unconfirmed',2),at('ordinary',2,'Water and Wisdom')];
    expect(developChapterSpanFor(sample,'ordinary')).toBeNull();
    expect(developNavigation(sample).some(n=>n.role==='chapter')).toBe(false);
  });
});
