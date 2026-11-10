import { readFileSync } from 'fs';
import { join } from 'path';
import { startersFor } from '../workKind';
import { ANONYMISE_OFFER_INSTRUCTION, ANONYMISE_MARKER } from '../practiceOffers';

const root = join(__dirname, '..', '..', '..');
const route = readFileSync(join(root, 'app/api/sovereign/manuscripts/[id]/ask/route.ts'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('starters follow the DECLARED kind, never story words for an argument', () => {
  const all = (k: Parameters<typeof startersFor>[0]) => startersFor(k, 'Chapter 7', 'Chapter 8').join(' ').toLowerCase();
  it('fiction keeps the story', () => expect(all('fiction')).toMatch(/story/));
  it('nonfiction asks about the argument, not the story', () => { expect(all('nonfiction')).toMatch(/claiming|argument/); expect(all('nonfiction')).not.toMatch(/story|plot|character|scene/); });
  it('a helper’s book asks about ideas, readers and stories that earn their point', () => { expect(all('practitioner')).toMatch(/idea|reader|story/); expect(all('practitioner')).not.toMatch(/plot|character|scene/); });
  it('undeclared is neutral', () => { expect(all(null)).not.toMatch(/story|claiming|argument|idea|plot/); });
  it('the last starter of every kind leads to the next chapter or ends the chapter, in the writer’s register', () => {
    expect(startersFor('fiction', 'Return', null).at(-1)).toBe('How does Return end?');
  });
});

describe('the anonymise offer is gentle, once, and only for a declared helper’s book', () => {
  const t = ANONYMISE_OFFER_INSTRUCTION.toLowerCase();
  it('is one short, warm sentence at the end, never a warning or a condition', () => {
    expect(t).toContain('one short sentence'); expect(t).toContain('at the very end'); expect(t).toContain('no answer is needed');
    expect(t).toMatch(/must not be a warning, a rule, a legal or clinical statement, or a condition of anything/);
    expect(t).toContain('must not interrupt');
  });
  it('is only for a passage that really tells a real person’s story, otherwise says nothing', () => {
    expect(t).toContain('if — and only if — the passage you were given tells a real person’s story'); expect(t).toContain('say nothing about this at all');
  });
  it('never asks for, guesses or repeats identifying details', () => expect(t).toContain('never ask for, guess or repeat identifying details'));
  it('uses the words that mark it as made, so "once" is read from what was actually said', () => {
    expect(ANONYMISE_MARKER.test('Case stories are other people’s lives — have you changed what could identify her?')).toBe(true);
    expect(ANONYMISE_MARKER.test('I loved the harbour scene.')).toBe(false);
    expect(t).toContain('“other people’s lives”');
  });
  it('the route offers it only for a DECLARED helper’s book, outside Sanctuary, and only if it has not been made', () => {
    const at = route.indexOf('const practiceOffer');
    const block = route.slice(at, route.indexOf('const workCtx'));
    expect(block).toContain('!posture.sanctuary && postureKnown');
    expect(block).toContain("=== 'practitioner'");
    expect(block).toContain('!(await anonymiseOfferAlreadyMade(');
  });
  it('the kind is never written by the Ask route', () => { expect(route).not.toContain('workKindWrite'); });
});
