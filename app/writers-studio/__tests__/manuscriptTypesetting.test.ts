import { typesetManuscriptBody } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';

const words = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('Writer Studio manuscript typesetting', () => {
  it('preserves explicit author paragraphs and only reflows soft line wraps', () => {
    const body = 'First line of a paragraph\ncontinues here.\n\nSecond paragraph stays separate.';
    const blocks = typesetManuscriptBody(body);
    expect(blocks.map((b) => b.text)).toEqual([
      'First line of a paragraph\ncontinues here.',
      'Second paragraph stays separate.',
    ]);
    expect(words(blocks.map((b) => b.text).join(' '))).toBe(words(body));
  });

  it('recovers high-confidence blocks from hard-wrapped typeset PDF text', () => {
    const body = [
      '“To be spiritual means essentially to take responsibility for our inner journey while using all',
      'the resources from all the traditions available to us. These great treasures are part of a universal',
      'mystical tradition.” — Wayne Teasdale',
      'I. The Living Spiral',
      'To be human is to move through cycles. Morning turns to midday, midday leads toward dusk, dusk',
      'gives way to nightfall, and night eventually finds its way back to the light of day. These rhythms',
      'surround us so completely that we rarely stop to consider how deeply they shape life itself.',
      'These cycles are not simply happening around us. They are part of us. We come from this cycling',
      'earth, and our lives participate in its movements at every level. Cells continually die and are',
      'replaced.',
    ].join('\n');
    const blocks = typesetManuscriptBody(body);
    expect(blocks[0]?.kind).toBe('epigraph');
    expect(blocks.some((b) => b.kind === 'subhead' && b.text === 'I. The Living Spiral')).toBe(true);
    expect(blocks.filter((b) => b.kind === 'paragraph').length).toBeGreaterThanOrEqual(2);
    expect(words(blocks.map((b) => b.text).join(' '))).toBe(words(body));
  });

  it('renders likely PDF folios as their own quiet block instead of burying them in prose', () => {
    const body = [
      'A long typeset line continues across the page with enough characters to establish the normal measure.',
      'Another long typeset line continues across the page with enough characters to establish the measure.',
      '161',
      'The next page continues with another long typeset line carrying the writer’s actual manuscript text.',
    ].join('\n');
    const blocks = typesetManuscriptBody(body);
    expect(blocks.some((b) => b.kind === 'folio' && b.text === '161')).toBe(true);
  });
});

describe('line-per-paragraph manuscripts (Living Spiral, as imported)', () => {
  const para = (n: string) => `${n} ` + 'The same movement occurs across the longer passages of a human life, and old questions return carrying another depth entirely. '.repeat(2).trim();
  it('keeps each single-newline paragraph separate, with the folio as its own block', () => {
    const body = [para('One.'), para('Two.'), '161', 'them from another place in ourselves. ' + para('Three.'), para('Four.')].join('\n');
    const blocks = typesetManuscriptBody(body);
    expect(blocks.filter((b) => b.kind === 'paragraph')).toHaveLength(4);
    expect(blocks.some((b) => b.kind === 'folio' && b.text === '161')).toBe(true);
    expect(words(blocks.map((b) => b.text).join(' '))).toBe(words(body));
  });
});
