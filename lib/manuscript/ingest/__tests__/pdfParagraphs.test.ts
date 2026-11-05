import {
  itemsToLines,
  reconstructParagraphs,
  sameNonWhitespace,
  type PositionedLine,
} from '@/lib/manuscript/ingest/pdfParagraphs';

const L = (text: string, y: number, x = 72, xEnd = 540, height = 12): PositionedLine => ({
  text, x, xEnd, y, height,
});

const flat = (pages: PositionedLine[][]) => pages.map((p) => p.map((l) => l.text).join('\n')).join('\n\n');

describe('reconstructParagraphs', () => {
  it('breaks on a first-line indent and joins soft wraps with one space', () => {
    const page = [
      L('It was a cold morning and the', 100, 90),
      L('river had not yet thawed.', 114, 72, 300),
      L('She walked down to the water', 128, 90),
      L('and listened.', 142, 72, 200),
    ];
    expect(reconstructParagraphs([page])).toBe(
      'It was a cold morning and the river had not yet thawed.\n\nShe walked down to the water and listened.',
    );
  });

  it('breaks on a larger vertical gap', () => {
    const page = [
      L('First paragraph line one that fills', 100),
      L('the full measure of the page.', 114),
      L('Second paragraph starts here and', 140),
      L('runs on across the line as well.', 154),
      L('Third paragraph with enough words', 168),
      L('to fill out the measure.', 182),
    ];
    const out = reconstructParagraphs([page])!;
    expect(out.split('\n\n')).toHaveLength(2);
    expect(out).toContain('measure of the page.\n\nSecond');
  });

  it('breaks after a short last line', () => {
    const page = [
      L('A full line of ordinary running prose', 100),
      L('that ends early.', 114, 72, 200),
      L('Next paragraph begins at the margin', 128),
      L('and continues.', 142, 72, 180),
    ];
    expect(reconstructParagraphs([page])!.split('\n\n')).toHaveLength(2);
  });

  it('keeps hyphens: removes only the newline after a trailing hyphen', () => {
    const page = [
      L('The inter-', 100),
      L('national treaty was signed in a well-', 114),
      L('known hall by many people today.', 128, 72, 300),
      L('Another.', 156, 90, 140),
    ];
    const out = reconstructParagraphs([page])!;
    expect(out).toContain('inter-national');
    expect(out).toContain('well-known');
    expect(out).toContain('-');
  });

  it('keeps a bare page number as its own paragraph (not dropped, not spliced)', () => {
    const p1 = [L('The sentence runs across the page and', 100), L('continues onto the next', 114), L('12', 700, 300, 312)];
    const p2 = [L('page without stopping at all.', 100, 72, 300), L('Done here.', 114, 72, 150)];
    const out = reconstructParagraphs([p1, p2])!;
    expect(out).toContain('\n\n12\n\n');
  });

  it('returns null when nothing can be detected', () => {
    expect(reconstructParagraphs([[L('one line', 100)]])).toBeNull();
    expect(reconstructParagraphs([[L('wrap one fills the measure', 100), L('wrap two fills the measure', 114)]])).toBeNull();
  });

  it('is deterministic', () => {
    const page = [L('a b c d e f g', 100, 90), L('tail.', 114, 72, 120), L('Next one here to fill the line', 128, 90)];
    expect(reconstructParagraphs([page])).toBe(reconstructParagraphs([page]));
  });

  it('PROPERTY: whitespace-stripped output equals whitespace-stripped flat text', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
    const words = ['alpha', 'beta.', 'gamma-', 'delta', '12', 'Épsilon', '“quoted”', 'x—y', 'end.'];
    for (let t = 0; t < 200; t++) {
      const pages: PositionedLine[][] = [];
      for (let p = 0; p < 1 + Math.floor(rnd() * 3); p++) {
        const page: PositionedLine[] = [];
        let y = 80;
        for (let i = 0; i < 2 + Math.floor(rnd() * 12); i++) {
          const n = 1 + Math.floor(rnd() * 8);
          const text = Array.from({ length: n }, () => words[Math.floor(rnd() * words.length)]).join(' ');
          y += rnd() < 0.2 ? 30 : 14;
          page.push(L(text, y, rnd() < 0.2 ? 90 : 72, 200 + rnd() * 340));
        }
        pages.push(page);
      }
      const out = reconstructParagraphs(pages);
      if (out !== null) expect(sameNonWhitespace(out, flat(pages))).toBe(true);
    }
  });
});

describe('itemsToLines', () => {
  it('groups same-baseline items into one line, in stream order', () => {
    const lines = itemsToLines([
      { str: 'Hello', x: 72, y: 100, width: 30, height: 12 },
      { str: ' world', x: 102, y: 100.2, width: 36, height: 12, hasEOL: true },
      { str: 'Next', x: 72, y: 114, width: 24, height: 12 },
    ]);
    expect(lines.map((l) => l.text)).toEqual(['Hello world', 'Next']);
    expect(lines[0].xEnd).toBe(138);
  });
});

describe('sameNonWhitespace', () => {
  it('ignores whitespace only', () => {
    expect(sameNonWhitespace('a b\n\nc', 'ab c')).toBe(true);
    expect(sameNonWhitespace('abc', 'abd')).toBe(false);
    expect(sameNonWhitespace('ab', 'ba')).toBe(false);
  });
});
