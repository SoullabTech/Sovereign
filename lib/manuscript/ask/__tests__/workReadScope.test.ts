import { readFileSync } from 'fs';
import { join } from 'path';
import { activeGrant, selectSections, movedSince, READ_CHAR_BUDGET, type ScopeEventRow } from '../workReadScope';

const ev = (id: string, event: 'grant' | 'revoke', level: 'chapter' | 'work' | null = null): ScopeEventRow =>
  ({ id, event, level, createdAt: '2026-11-08T00:00:00Z' });
const secs = [
  { id: 's1', position: 1, heading: 'The Harbour' },
  { id: 's2', position: 2, heading: 'Salt' },
  { id: 's3', position: 3, heading: 'Return' },
];
const sizes = new Map([['s1', 100], ['s2', 100], ['s3', 100]]);

describe('standing reading scope · decision', () => {
  it('no events means no grant; nothing is inferred', () => expect(activeGrant([])).toBeNull());
  it('the latest event wins; a revoke ends the grant', () => {
    expect(activeGrant([ev('a', 'grant', 'work')])).toEqual({ id: 'a', level: 'work' });
    expect(activeGrant([ev('a', 'grant', 'work'), ev('b', 'revoke')])).toBeNull();
    expect(activeGrant([ev('a', 'grant', 'work'), ev('b', 'revoke'), ev('c', 'grant', 'chapter')]))
      .toEqual({ id: 'c', level: 'chapter' });
  });
  it('chapter level supplies only the locus', () => {
    const r = selectSections({ level: 'chapter', question: 'compare Salt and Return', locusId: 's2', sections: secs, sizes });
    expect(r.ids).toEqual(['s2']);
  });
  it('work level adds sections the question names, and the whole Work only when asked about it', () => {
    expect(selectSections({ level: 'work', question: 'how does Return land?', locusId: 's1', sections: secs, sizes }).ids)
      .toEqual(['s1', 's3']);
    expect(selectSections({ level: 'work', question: 'what holds across the book?', locusId: null, sections: secs, sizes }).ids)
      .toEqual(['s1', 's2', 's3']);
  });
  it('a client-supplied locus that is not the member\'s own section selects nothing', () => {
    expect(selectSections({ level: 'work', question: 'x', locusId: 'forged', sections: secs, sizes }).ids).toEqual([]);
  });
  it('over-budget sections are reported, never silently dropped', () => {
    const big = new Map([['s1', READ_CHAR_BUDGET], ['s2', 10], ['s3', 10]]);
    const r = selectSections({ level: 'work', question: 'the whole book', locusId: 's1', sections: secs, sizes: big });
    expect(r.ids).toEqual(['s1']);
    expect(r.overBudget).toEqual(['s2', 's3']);
  });
  it('movedSince flags only sections whose supplied bytes changed', () => {
    expect(movedSince(new Map([['s1', 'a'], ['s2', 'b']]), new Map([['s1', 'a'], ['s2', 'c']]))).toEqual(['s2']);
  });
});

describe('standing reading scope · route wiring (static)', () => {
  const route = readFileSync(join(__dirname, '..', '..', '..', '..', 'app/api/sovereign/manuscripts/[id]/ask/route.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const turn = route.slice(route.indexOf('async function workTurn'), route.indexOf('async function developmentalTurn'));
  it('receipts are minted before any saved text is loaded', () => {
    expect(turn.indexOf('establishDisclosureBoundary(')).toBeGreaterThan(-1);
    expect(turn.indexOf('establishDisclosureBoundary(')).toBeLessThan(turn.indexOf('loadSuppliedSections('));
  });
  it('the grant is re-read at every Ask and Sanctuary suspends it', () => {
    expect(turn).toMatch(/posture\.sanctuary \? null : await loadActiveGrant\(/);
  });
  it('no scope, level or section list is taken from the request body', () => {
    expect(turn).not.toMatch(/body\.(scope|level|sections|authorizes)/);
  });
  it('the Ask route never imports the scope writer', () => {
    expect(route).not.toContain('workReadScopeWrite');
  });
});
