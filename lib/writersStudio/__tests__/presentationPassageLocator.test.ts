import { locateUniquePresentationPassage } from '../presentationPassageLocator';

const cp = (text: string) => Array.from(text).length;

describe('exact Craft Source locator despite display-only typography', () => {
  it('maps emoji and soft line-breaks to the original code-point offsets', () => {
    const body = 'Opening.\n\n🜂 Fire\nthen moves toward the horizon.';
    const match = locateUniquePresentationPassage(body, '🜂 Fire then moves');
    const original = '🜂 Fire\nthen moves';
    const start = cp('Opening.\n\n');
    expect(match).toEqual({ start, end: start + cp(original) });
    expect(Array.from(body).slice(match!.start, match!.end).join('')).toBe(original);
  });

  it('preserves the extra CR in CRLF source instead of drifting selection positions', () => {
    const body = 'Prelude.\r\n\r\n🜂 First\r\nstill here.\r\nNext sentence.';
    const exactStart = cp('Prelude.\r\n\r\n');
    const exactText = '🜂 First\r\nstill here.';
    const match = locateUniquePresentationPassage(body, '🜂 First still here.');
    expect(match).toEqual({ start: exactStart, end: exactStart + cp(exactText) });
    expect(Array.from(body).slice(match!.start, match!.end).join('')).toBe(exactText);
  });

  it('does not erase an unverified numeric line to manufacture a cross-page match', () => {
    const body = 'The river is still\r\n\r\n175\r\n\r\nmoving beside the house.';
    // Without trusted page provenance, 175 could be a stanza, year or code.
    expect(locateUniquePresentationPassage(body, 'still moving beside')).toBeNull();
    const match = locateUniquePresentationPassage(body, 'still 175 moving beside');
    expect(match).not.toBeNull();
    const original = Array.from(body).slice(match!.start, match!.end).join('');
    expect(original).toBe('still\r\n\r\n175\r\n\r\nmoving beside');
    expect(locateUniquePresentationPassage(body, 'nonexistent phrase')).toBeNull();
  });

  it('refuses duplicate visible wording even when one occurrence is hard-wrapped', () => {
    const body = 'We notice.\r\n\r\nWe\r\nnotice.';
    expect(locateUniquePresentationPassage(body, 'We notice.')).toBeNull();
  });

  it('never silently corrects punctuation, glyphs or Unicode composition', () => {
    expect(locateUniquePresentationPassage('Cafe\u0301 by the lake.', 'Café by the lake.'))
      .toBeNull();
    expect(locateUniquePresentationPassage('One, two.', 'One two.')).toBeNull();
  });

  it('refuses whitespace-only and ungrounded requests', () => {
    expect(locateUniquePresentationPassage('', 'any')).toBeNull();
    expect(locateUniquePresentationPassage('Words.', ' \n \t')).toBeNull();
  });
});
