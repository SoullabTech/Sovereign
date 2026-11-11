/** Step 5 — the letter's opening. The server keeps only what it can verify (design §19 must-fail list). */
import fs from 'node:fs';
import path from 'node:path';
import { verifyOpening, OPENING_SYSTEM } from '@/lib/writersStudio/studio/letterOpening';

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
    expect(route).toMatch(/const opening = await composeOpening\(memberId, manuscriptId, readingIds\);\s+letterId = await saveLetter\(/);
    expect(run).toMatch(/const opening = await deps\.opening\(memberId, manuscriptId, synthesis\.readingIds\);/);
  });
});
