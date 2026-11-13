/** Step 5 — the letter's opening. The server keeps only what it can verify (design §19 must-fail list). */
import fs from 'node:fs';
import path from 'node:path';
import { verifyOpening, verifyOpeningWithReason, refsOf, passagesFor, openingFields, OPENING_SYSTEM, OPENING_MAX_TOKENS } from '@/lib/writersStudio/studio/letterOpening';

const sections = [{ id: 's1', text: 'When the river first spoke to me, I did not think of it as speaking.' }, { id: 's2', text: 'Grief is a current to be entered.' }];
const refs = new Set(['E1', 'E2']);
const raw = (over: Record<string, unknown> = {}) => ({
  reachingFor: 'The book reaches for grief as a passage rather than a wound. Is that right?', reachingForRefs: ['E1'],
  working: [{ text: 'The river carries the opening.', quote: 'When the river first spoke to me', refs: ['E2'] }],
  divergence: null, ...over,
});

describe('the opening keeps only what the server can verify', () => {
  it('a grounded opening with a verbatim quotation is kept, and located', () => {
    const o = verifyOpening(raw(), sections, refs, false)!;
    expect(o.working).toEqual([{ text: 'The river carries the opening.', quote: 'When the river first spoke to me', sectionId: 's1' }]);
    expect(o.droppedUnverified).toBe(0);
  });
  it('⭐ MUST FAIL IF a "working" quotation that is not in the current draft is kept', () => {
    const o = verifyOpening(raw({ working: [{ text: 'Lovely.', quote: 'When the sea first spoke to me', refs: ['E2'] }] }), sections, refs, false)!;
    expect(o.working).toEqual([]);
    expect(o.droppedUnverified).toBe(1);
  });
  it('⭐ MUST FAIL IF praise without a quotation is kept', () => {
    const o = verifyOpening(raw({ working: [{ text: 'Beautiful writing throughout.', quote: '', refs: ['E2'] }] }), sections, refs, false)!;
    expect(o.working).toEqual([]);
  });
  it('⭐ an opening that cites no observation is not kept at all', () => {
    expect(verifyOpening(raw({ reachingForRefs: [] }), sections, refs, false)).toBeNull();
    expect(verifyOpening(raw({ reachingForRefs: ['E9'] }), sections, refs, false)).toBeNull();
  });
  it('⭐ a divergence is kept only when the writer has stated an intention', () => {
    const d = 'You told me the book is about the sea. I read chapters 4 to 6 as about the river. Is the book changing, or are these chapters?';
    expect(verifyOpening(raw({ divergence: d }), sections, refs, false)!.divergence).toBeNull();
    expect(verifyOpening(raw({ divergence: d }), sections, refs, true)!.divergence).toBe(d);
  });
  it('her reading always ends as a question to the writer', () => {
    expect(verifyOpening(raw({ reachingFor: 'The book reaches for grief as passage.' }), sections, refs, false)!.reachingFor).toMatch(/Is that right\?$/);
  });
  it('⭐ the instruction keeps the writer\'s intention as orientation, never as a fact about the text', () => {
    expect(OPENING_SYSTEM).toMatch(/orientation only\. Never state it as a fact about the text/);
  });
  it('the opening is composed only where a letter is kept (route and run), never on a client path', () => {
    const route = fs.readFileSync(path.join(process.cwd(), 'app/api/sovereign/manuscripts/[id]/attention-map/route.ts'), 'utf8');
    const run = fs.readFileSync(path.join(process.cwd(), 'lib/writersStudio/studio/passRun.ts'), 'utf8');
    expect(route).toMatch(/const opening = await composeOpening\(memberId, manuscriptId, readingIds\);\s+letterId = await saveLetter\(memberId, manuscriptId, revisionNumber, \{ \.\.\.map, \.\.\.openingFields\(opening\) \}\)/);
    expect(run).toMatch(/const opening = await deps\.opening\(memberId, manuscriptId, synthesis\.readingIds\);/);
  });
});

describe('a missing opening is named, never silent (founder walk 2026-11-12)', () => {
  it('⭐ MUST FAIL IF a reply that sends its handles as a JSON string loses the whole opening', () => {
    const o = verifyOpening(raw({ reachingForRefs: '["E1","E2"]', working: [{ text: 'The river carries the opening.', quote: 'When the river first spoke to me', refs: '["E2"]' }] }), sections, refs, false);
    expect(o).not.toBeNull();
    expect(o!.working).toHaveLength(1);
    expect(verifyOpening(raw({ reachingForRefs: 'E1, E2' }), sections, refs, false)).not.toBeNull();
  });
  it('⭐ a handle we did not supply is still refused, in any form', () => {
    expect(verifyOpening(raw({ reachingForRefs: '["E1","E9"]' }), sections, refs, false)).toBeNull();
    expect(verifyOpening(raw({ reachingForRefs: 'not json [' }), sections, refs, false)).toBeNull();
    expect(refsOf('[1,2]')).toBeNull();
  });
  it('each refusal has a name', () => {
    expect(verifyOpeningWithReason(null, sections, refs, false)).toEqual({ ok: false, refusal: 'unreadable_reply' });
    expect(verifyOpeningWithReason(raw({ reachingFor: '  ' }), sections, refs, false)).toEqual({ ok: false, refusal: 'reaching_for_missing' });
    expect(verifyOpeningWithReason(raw({ reachingForRefs: [] }), sections, refs, false)).toEqual({ ok: false, refusal: 'reaching_for_uncited' });
  });
  it('a kept letter carries either the opening or the reason it has none', () => {
    expect(openingFields({ ok: false, refusal: 'incomplete' })).toEqual({ opening: null, openingRefusal: 'incomplete' });
    const ok = verifyOpeningWithReason(raw(), sections, refs, false);
    expect(openingFields(ok)).toEqual({ opening: (ok as { opening: unknown }).opening, openingRefusal: null });
  });
  it('⭐ the opening has room to finish, and a cut-off reply is refused by name, not dropped', () => {
    expect(OPENING_MAX_TOKENS).toBeGreaterThanOrEqual(4000);
    const src = fs.readFileSync(path.join(process.cwd(), 'lib/writersStudio/studio/letterOpening.ts'), 'utf8');
    expect(src).toMatch(/stop === 'max_tokens'[^\n]*refusal: 'incomplete'/);
    expect(src).toMatch(/console\.warn\('\[letter-opening\] not kept', \{ refusal: out\.refusal, readings: readingIds\.length \}\)/);
  });
  it('the letter says when it went without its opening', () => {
    const panel = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/EditorialLetterPanel.tsx'), 'utf8');
    expect(panel).toMatch(/pass\.map\.opening === null \? \(/);
    expect(panel).toMatch(/data-letter-opening-missing=/);
  });
});

describe('the opening is given the writer\'s own words, so "what is working" can quote them exactly', () => {
  const body = 'When the river first spoke to me, I did not think of it as speaking.';
  const byId = new Map([['s1', body]]);
  it('passage evidence becomes the exact words', () => {
    expect(passagesFor([{ kind: 'passage', sectionId: 's1', range: { start: 5, end: 32 } }], byId)).toEqual(['the river first spoke to me']);
  });
  it('⭐ MUST FAIL IF section-level or stale evidence offers words that are not there', () => {
    expect(passagesFor([{ kind: 'section', sectionId: 's1' }], byId)).toEqual([]);
    expect(passagesFor([{ kind: 'passage', sectionId: 'gone', range: { start: 0, end: 4 } }], byId)).toEqual([]);
    expect(passagesFor([{ kind: 'passage', sectionId: 's1', range: { start: 60, end: 900 } }], byId)).toEqual([]);
  });
  it('a quotation taken from those words verifies', () => {
    const words = passagesFor([{ kind: 'passage', sectionId: 's1', range: { start: 0, end: 32 } }], byId)[0]!;
    const o = verifyOpening(raw({ working: [{ text: 'The opening line.', quote: words, refs: ['E2'] }] }), [{ id: 's1', text: body }], refs, false)!;
    expect(o.working[0]!.sectionId).toBe('s1');
  });
});
