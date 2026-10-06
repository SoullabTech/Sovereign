import { editableManuscriptProjection, typesetManuscriptBody, typesetProseBlocks } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';

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

  it('preserves finished-manuscript paragraph lines before falling back to PDF-wrap inference', () => {
    const body = [
      'A finished manuscript paragraph can already arrive as one complete authored line, with its own ending punctuation and no blank-line separator between paragraphs.',
      'The next authored paragraph is likewise complete and should remain visibly distinct rather than being merged merely because the source is already clean prose.',
      'A third finished paragraph confirms this is an authored-paragraph profile rather than a sequence of soft PDF wraps that need reconstruction.',
    ].join('\n');
    const blocks = typesetManuscriptBody(body);
    expect(blocks.map((b) => b.kind)).toEqual(['paragraph', 'paragraph', 'paragraph']);
    expect(blocks).toHaveLength(3);
    expect(blocks.map((b) => b.text).join('\n')).toBe(body);
    expect(words(blocks.map((b) => b.text).join(' '))).toBe(words(body));
  });

  it('keeps a standalone folio structural even when the surrounding source is not PDF-hard-wrapped', () => {
    const body = [
      'A short paragraph ends here.',
      '161',
      'The following paragraph begins on the next source page.',
    ].join('\n');
    const blocks = typesetManuscriptBody(body);
    expect(blocks.some((b) => b.kind === 'folio' && b.text === '161')).toBe(true);
    expect(blocks.map((b) => b.text).join('\n')).toBe(body);
    expect(words(blocks.map((b) => b.text).join(' '))).toBe(words(body));
  });


  it('recovers structure inside blank-separated imported page chunks without styling prose as an epigraph', () => {
    const body = [
      [
        '“To be spiritual means essentially to take responsibility for our inner journey while',
        'using all the resources from all the traditions available to us.” — Wayne Teasdale',
        'I. The Living Spiral',
        'To be human is to move through cycles. Morning turns to midday, midday leads toward dusk, dusk',
        'gives way to nightfall, and night eventually finds its way back to the light of day.',
        'These cycles are not simply happening around us. They are part of us.',
      ].join('\n'),
      [
        '161',
        'Them from another place in ourselves. Being alive means participating in these cycles',
        'rather than somehow standing outside them.',
      ].join('\n'),
    ].join('\n\n');

    const blocks = typesetManuscriptBody(body);
    expect(blocks[0]?.kind).toBe('epigraph');
    expect(blocks.some((b) => b.kind === 'subhead' && b.text === 'I. The Living Spiral')).toBe(true);
    expect(blocks.some((b) => b.kind === 'folio' && b.text === '161')).toBe(true);
    expect(blocks.filter((b) => b.kind === 'paragraph').length).toBeGreaterThanOrEqual(2);
    expect(words(blocks.map((b) => b.text).join(' '))).toBe(words(body));
  });

  it('recognizes markdown-wrapped quotations as epigraphs without changing their source text', () => {
    const body = '*"To be spiritual means essentially to take responsibility for our inner journey." – Wayne Teasdale*';
    const blocks = typesetManuscriptBody(body);
    expect(blocks).toEqual([{ text: body, kind: 'epigraph' }]);
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

describe('Elemental Alchemy imported-page reconstruction', () => {
  it('separates all-caps subsection headings from following prose', () => {
    const body = [
      'The prior paragraph ends here.',
      'GATHERING THE FIRE — MAYA’S “IF”',
      'Fire begins by illuminating possibility. Sometimes this arrives as inspiration: a vision, an intuition,',
      'a sudden sense that something new wants to happen.',
    ].join('\n');
    const blocks = typesetManuscriptBody(body);
    expect(blocks.some((b) => b.kind === 'subhead' && b.text === 'GATHERING THE FIRE — MAYA’S “IF”')).toBe(true);
    const headingIndex = blocks.findIndex((b) => b.text === 'GATHERING THE FIRE — MAYA’S “IF”');
    expect(blocks[headingIndex + 1]?.kind).toBe('paragraph');
    expect(blocks[headingIndex + 1]?.text).toContain('Fire begins by illuminating possibility.');
  });

  it('does not invent a paragraph break at a folio inside a sentence', () => {
    const body = [
      'The situation in front of her was real, but so was the history moving through her response',
      'to it. She was beginning to distinguish between what was happening and what was being awakened.',
      'This did not immediately solve anything, but it gave her another place from which to look. Fire',
      'opens the question of If. Water carries us toward Why. Earth asks How. Air clarifies what has been',
      'learned and opens it into With—with whom, with what community, and within what',
      '',
      '171',
      '',
      'larger field our experience can enter relationship. Aether holds the movement as a whole.',
    ].join('\n');
    const blocks = typesetManuscriptBody(body);
    const prose = blocks.filter((b) => b.kind === 'paragraph').map((b) => b.text);
    expect(prose.join(' ')).toContain('within what\nlarger field our experience can enter relationship');
    expect(blocks.some((b) => b.kind === 'folio' && b.text === '171')).toBe(true);
  });

  it('rejoins a Roman heading split by a print line break', () => {
    const body = [
      'IV. The Architecture Beneath the',
      'Experience',
      'Maya’s journey gives us a way of seeing the Spiralogic Process from inside a life. Having experienced',
      'the process through her, we can now look more closely at the architecture beneath it.',
    ].join('\n');
    const blocks = typesetManuscriptBody(body);
    expect(blocks[0]).toEqual({ text: 'IV. The Architecture Beneath the Experience', kind: 'subhead' });
    expect(blocks[1]?.kind).toBe('paragraph');
    expect(blocks[1]?.text).toContain('Maya’s journey');
  });
});


describe('Edit View imported-manuscript projection', () => {
  it('restores paragraph breathing room and removes a print folio without changing prose words', () => {
    const body = [
      'We are elemental beings. Spirit, emotion, body, mind, relationship, and consciousness continually',
      'shape and inform one another. Our strengths can support us when we find ourselves out of our element.',
      'The Spiralogic Process offers a structured yet flexible way of noticing these movements and bringing',
      'them into relationship. In one sense, it is a knowledge management system for the soul.',
      '',
      '185',
      '',
      'Yet even this description remains only a map. The deeper invitation is simpler: we are nature. We burn,',
      'flow, root, breathe, enter relationship, return to stillness, and begin again.',
    ].join('\n');

    const projection = editableManuscriptProjection(body);
    expect(projection.projected).toBe(true);
    expect(projection.text).not.toContain('\n185\n');
    expect(projection.text).toContain('our element.\n\nThe Spiralogic Process');
    expect(projection.text).toContain('for the soul.\n\nYet even this description');
    expect(words(projection.text)).toBe(words(body.replace(/\n185\n/, '\n')));
  });

  it('leaves already-authored clean paragraphs alone', () => {
    const body = [
      'A complete paragraph already exists on one authored line and ends exactly where the writer put it.',
      '',
      'A second complete paragraph is already separated by an intentional blank line.',
    ].join('\n');
    expect(editableManuscriptProjection(body)).toEqual({ text: body, projected: false });
  });

  it('does not reflow short-line material such as verse', () => {
    const body = ['Burn slowly', 'Flow home', 'Root here', 'Breathe again'].join('\n');
    expect(editableManuscriptProjection(body)).toEqual({ text: body, projected: false });
  });
});

describe('Prose View page-boundary recovery', () => {
  it('collapses a printed folio that interrupts one paragraph', () => {
    const body = [
      'Air clarifies what has been learned and opens it into With—with whom, with what community, and within what',
      '',
      '167',
      '',
      'larger field our experience can enter relationship. Aether holds the movement as a whole.',
    ].join('\n');

    const blocks = typesetProseBlocks(body);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe('paragraph');
    expect(blocks[0]?.text).toContain('within what\nlarger field our experience can enter relationship.');
    expect(blocks.some((b) => b.kind === 'folio')).toBe(false);
  });
});
