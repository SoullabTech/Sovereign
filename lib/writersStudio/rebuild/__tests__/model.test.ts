import { asOutline, chapterSpanFor, isConfirmedChapterRoot, type RebuildSection } from '../model';

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


  it('does not promote a flat back-matter Chapter label into a chapter', () => {
    const flat: RebuildSection[] = [
      { ...row(171, 'CHAPTER 9: AETHER', 1), headingDepth: null, headingSignal: null, body: 'Young. Nested Time.' },
      { ...row(172, 'CHAPTER 10: THE LIVING SPIRAL', 1), headingDepth: null, headingSignal: null, body: 'Kierkegaard. The Essential Kierkegaard.' },
      { ...row(173, 'CONCLUSION: EMBRACING YOUR ELEMENTAL SOUL', 1), headingDepth: null, headingSignal: null, body: 'St. John of the Cross.' },
    ];
    expect(isConfirmedChapterRoot(flat[1])).toBe(false);
    expect(chapterSpanFor(flat, 'd172')).toBeNull();
  });

  it('does not turn chapter-summary or TOC labels into real chapters/parts', () => {
    const lookalikes = [
      row(8, 'Part One — The Ground', 3),
      row(10, 'Chapter Summaries by Elemental Type', 1),
      row(11, 'Chapter 1: The Journey Begins', 1),
    ];
    const tree = asOutline(lookalikes);
    const summary = tree.find((n) => n.draftSectionId === 'd10');
    const chapter = tree.find((n) => n.draftSectionId === 'd11');
    expect(summary?.role).toBe('other');
    expect(chapter?.role).toBe('chapter');
  });
});
