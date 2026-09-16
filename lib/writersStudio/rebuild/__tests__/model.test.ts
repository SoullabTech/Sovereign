import { asOutline, chapterSpanFor, type RebuildSection } from '../model';

const row = (position: number, heading: string, depth: number): RebuildSection => ({
  draftSectionId: `d${position}`, sourceSectionId: `s${position}`, position,
  heading, headingDepth: depth, headingSignal: 'markdown', body: 'body', editable: true,
});

const rows = [
  row(197, 'Part Three — The Spiral', 1),
  row(198, 'Chapter 10: The Living Spiral', 1),
  row(199, 'I. The Living Spiral', 2),
  row(200, 'II. Finding Our Place', 2),
  row(201, 'III. A Life Through the Elements', 2),
  row(202, 'Gathering the Fire', 3),
  row(217, 'V. Living the Spiral', 2),
  row(221, 'Living the Spiral', 3),
  row(222, 'Conclusion — Embracing Your Elemental Soul', 1),
];

describe('rebuild book model', () => {
  it('projects the real Part/Chapter depth shape without changing stored depth', () => {
    const tree = asOutline(rows);
    expect(tree[0]?.draftSectionId).toBe('d197');
    expect(tree[0]?.children[0]?.draftSectionId).toBe('d198');
    expect(tree[0]?.children[0]?.children.map((n) => n.draftSectionId))
      .toEqual(['d199', 'd200', 'd201', 'd217']);
  });

  it('the Chapter 10 span closes before the next depth-1 heading', () => {
    const span = chapterSpanFor(rows, 'd200');
    expect(span?.root.draftSectionId).toBe('d198');
    expect(span?.sections.map((s) => s.position)).toEqual([198, 199, 200, 201, 202, 217, 221]);
    expect(span?.sections.some((s) => s.position === 222)).toBe(false);
  });
});
