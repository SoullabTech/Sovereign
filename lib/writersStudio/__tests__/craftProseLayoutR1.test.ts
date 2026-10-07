import { craftProseBlocks, splitActiveParagraph, craftTypographyChunks, craftProseBreaks } from '../craftProseLayoutR1';

const first = 'A possibility opens before us, inviting attention toward a different\nway of participating in ordinary life.';
const middle = 'The possibility gathers energy as we bring it into conversation with\nother people, try something unfamiliar, and listen to what changes.\nSome ideas grow clearer in a real encounter.';
const last = 'Eventually, something that began as a possibility takes a place in our\nordinary actions and changes the way we participate in the world.';
const body = first + '\n' + middle + '\n' + last;
const cp = (s: string) => Array.from(s).length;

describe('Craft focus uses source-mapped whole-section paragraph typography', () => {
  it('keeps paragraph context outside the chosen focus even without blank lines', () => {
    const at = cp(first + '\n');
    const layout = splitActiveParagraph(body, at, at + cp(middle));
    expect(layout.mapped).toBe(true);
    expect(layout.leadingBlocks.map(b => b.text).join('\n')).toBe(first);
    expect(layout.trailingBlocks.map(b => b.text).join('\n')).toBe(last);
    expect(layout.prefix).toBe('');
    expect(layout.suffix).toBe('');
    expect(layout.reflow).toBe(true);
    expect(body).toBe(first + '\n' + middle + '\n' + last);
  });

  it('retains the rest of the same sentence when a focus ends mid-sentence', () => {
    const start = cp(first + '\n');
    const text = 'The possibility gathers energy';
    const layout = splitActiveParagraph(body, start, start + cp(text));
    expect(layout.prefix).toBe('');
    expect(layout.suffix).toContain('as we bring it into conversation');
    expect(layout.suffix).not.toContain('Eventually');
    expect(layout.trailingBlocks.some(b => b.text === last)).toBe(true);
  });

  it('preserves exact code points while rendering paragraph gaps separately', () => {
    const original = '🜂 A first movement.\n\nAnother movement follows.';
    const blocks = craftProseBlocks(original);
    expect(blocks.map(b => b.start)).toEqual([0, cp('🜂 A first movement.\n\n')]);
    const chunks = craftTypographyChunks(original, craftProseBreaks(blocks));
    expect(chunks.map(c => c.text).join('')).toBe(original);
    expect(chunks.filter(c => c.paragraphBreak).map(c => c.text)).toEqual(['\n\n']);
  });

  it('preserves ordered repeated paragraphs without treating them as edit targets', () => {
    const text = 'A repeated paragraph.\n\nA repeated paragraph.';
    const blocks = craftProseBlocks(text);
    expect(blocks).toHaveLength(2);
    expect(blocks[1]!.start).toBe(cp('A repeated paragraph.\n\n'));
  });

  it('does not promote a printed folio into the adjacent prose paragraph', () => {
    const text = first + '\n\n175\n' + middle + '\n' + last;
    const at = cp(first + '\n\n175\n');
    const layout = splitActiveParagraph(text, at, at + cp(middle));
    expect(layout.mapped).toBe(true);
    expect(layout.prefix).not.toContain('175');
    expect(layout.leadingBlocks.map(b => b.text).join('')).not.toContain('175');
    expect(text).toContain('\n175\n');
  });

  it('maps a paragraph bridged across an imported folio to its original span', () => {
    const text = 'The movement continues across a long printed line while we are\n\n175\n\nstill listening to what unfolds in the rest of this sentence.';
    const blocks = craftProseBlocks(text);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.text).not.toContain('175');
    expect(blocks[0]!.start).toBe(0);
    expect(blocks[0]!.end).toBe(cp(text));
  });

  it('does not flatten intentionally short lines', () => {
    const text = 'One breath\nA return\nAnother';
    const layout = splitActiveParagraph(text, 0, cp(text));
    expect(layout.reflow).toBe(false);
    expect(craftTypographyChunks(text, layout.breaks).map(c => c.text).join('')).toBe(text);
  });

  it('does not rewrite CRLF source characters when matching display paragraphs', () => {
    const text = 'A first paragraph.\r\n\r\nA second paragraph.';
    const blocks = craftProseBlocks(text);
    expect(blocks).toHaveLength(2);
    expect(blocks[1]!.start).toBe(cp('A first paragraph.\r\n\r\n'));
  });

  it('clips paragraph gap rendering to the exact diff segment without losing whitespace', () => {
    const gaps = [{ start: 3, end: 5 }];
    const a = craftTypographyChunks('One\n', gaps, 0);
    const b = craftTypographyChunks('\nTwo', gaps, 4);
    expect([...a, ...b].map(c => c.text).join('')).toBe('One\n\nTwo');
    expect([...a, ...b].filter(c => c.paragraphBreak)).toHaveLength(2);
  });
});
