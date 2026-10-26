import { locateUniquePresentationPassage } from '../presentationPassageLocator';
import { craftProseBlocks, splitActiveParagraph } from '../craftProseLayoutR1';
import { editableManuscriptProjection, typesetProseBlocks } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';

/**
 * Fictional author-text witnesses. A plain numeric line cannot distinguish
 * a printed page folio from authored text without separate Source evidence.
 * The manuscript is always canonical; presentation may not invent an erasure.
 */
const points = (text: string) => Array.from(text);
const cases = [
  { label: 'year', body: 'The year began.\n\n1984\n\nThen the dream continued.', selected: '1984' },
  { label: 'short-count', body: 'I counted\n\n11\n\nand began again.', selected: '11' },
  { label: 'leading-zero', body: 'The label read\n\n007\n\nNothing else.', selected: '007' },
  { label: 'zero', body: 'At the beginning stood\n\n0\n\nand nothing more.', selected: '0' },
  { label: 'decimal', body: 'The reading was\n\n2.0\n\non the scale.', selected: '2.0' },
  { label: 'longer-than-folio', body: 'The code is\n\n12345\n\nand is meaningful.', selected: '12345' },
] as const;

describe('JARVIS P0 — authored numeric lines are not assumed to be printed folios', () => {
  for (const sample of cases) {
    it('preserves the exact authored source, projection and Craft mapping: ' + sample.label, () => {
      const exact = locateUniquePresentationPassage(sample.body, sample.selected);
      expect(exact).not.toBeNull();
      expect(points(sample.body).slice(exact!.start, exact!.end).join('')).toBe(sample.selected);
      const projected = typesetProseBlocks(sample.body);
      expect(projected.map(block => block.text).join(' ')).toContain(sample.selected);
      const craft = craftProseBlocks(sample.body);
      expect(craft.some(block => block.text.includes(sample.selected))).toBe(true);
      const focus = splitActiveParagraph(sample.body, exact!.start, exact!.end);
      expect(focus.mapped).toBe(true);
      expect(sample.body).toContain(sample.selected);
    });
  }

  it('selects across an authored year without deleting the year or changing codepoint offsets', () => {
    const body = 'The room was empty.\r\n\r\n2026\r\n\r\nWe opened the door.';
    const visible = 'empty. 2026 We opened';
    const found = locateUniquePresentationPassage(body, visible);
    expect(found).not.toBeNull();
    expect(points(body).slice(found!.start, found!.end).join(''))
      .toBe('empty.\r\n\r\n2026\r\n\r\nWe opened');
  });

  it('refuses to pretend an unproven page number is invisible', () => {
    const body = 'The river is still\r\n\r\n175\r\n\r\nmoving beside the house.';
    expect(locateUniquePresentationPassage(body, 'still moving beside')).toBeNull();
    const literal = locateUniquePresentationPassage(body, 'still 175 moving beside');
    expect(literal).not.toBeNull();
    expect(points(body).slice(literal!.start, literal!.end).join(''))
      .toBe('still\r\n\r\n175\r\n\r\nmoving beside');
  });

  it('does not infer PDF hard-wrap provenance from the mere presence of a number', () => {
    const body = 'I counted\n\n11\n\nand began again.';
    const projection = editableManuscriptProjection(body);
    expect(projection).toEqual({ text: body, projected: false });
  });
});
