/**
 * Step 2 — the letter and decision store, and the routes that guard it. The must-fail cases in the design (§10).
 */
import fs from 'node:fs';
import path from 'node:path';

const q = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => q(...a) }));
import { recordDecision, currentDecisions } from '@/lib/writersStudio/letter/letterStore';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const MAP = { items: [{ id: 'a' }, { id: 'b' }] };
beforeEach(() => q.mockReset());

describe('decisions', () => {
  it('⭐ MUST FAIL IF a decision can be written against another member\'s letter: the letter lookup carries member and manuscript', async () => {
    q.mockResolvedValueOnce({ rows: [] });
    expect(await recordDecision('me', 'm', 'L', 'a', 'intended')).toEqual({ ok: false, refusal: 'letter_not_found' });
    expect(q.mock.calls[0][0]).toMatch(/WHERE id = \$1 AND member_id = \$2 AND manuscript_id = \$3/);
    expect(q).toHaveBeenCalledTimes(1);
  });
  it('⭐ a place that is not in the letter is refused, and nothing is written', async () => {
    q.mockResolvedValueOnce({ rows: [{ map: MAP }] });
    expect(await recordDecision('me', 'm', 'L', 'zzz', 'later')).toEqual({ ok: false, refusal: 'place_not_found' });
    expect(q).toHaveBeenCalledTimes(1);
  });
  it('a valid decision is appended as an event', async () => {
    q.mockResolvedValueOnce({ rows: [{ map: MAP }] }).mockResolvedValueOnce({ rows: [] });
    expect(await recordDecision('me', 'm', 'L', 'a', 'intended')).toEqual({ ok: true });
    expect(q.mock.calls[1][0]).toMatch(/INSERT INTO work_place_decision_events/);
  });
  it('"cleared" removes a decision from the current set; newest event wins', async () => {
    q.mockResolvedValueOnce({ rows: [{ place_id: 'a', decision: 'cleared' }, { place_id: 'b', decision: 'later' }] });
    expect(await currentDecisions('me', 'L')).toEqual({ b: 'later' });
    expect(q.mock.calls[0][0]).toMatch(/DISTINCT ON \(place_id\)[\s\S]*ORDER BY place_id, decided_at DESC/);
  });
});

describe('the boundary (source)', () => {
  const route = read('app/api/sovereign/manuscripts/[id]/editorial-letter/decisions/route.ts');
  const synth = read('app/api/sovereign/manuscripts/[id]/attention-map/route.ts');
  const migration = read('database/migrations/20261111000001_work_editorial_letters.sql');
  it('⭐ MUST FAIL IF a decision is written in Sanctuary: the keep gate runs before the write', () => {
    expect(route.indexOf('await keepGate(memberId, body)')).toBeGreaterThan(-1);
    expect(route.indexOf('await keepGate(memberId, body)')).toBeLessThan(route.indexOf('recordDecision('));
  });
  it('⭐ MUST FAIL IF a client can write a letter: only the synthesis route saves one, from the map it built, for a whole-book pass', () => {
    const writers = ['app/api/sovereign/manuscripts/[id]/editorial-letter/route.ts', 'app/api/sovereign/manuscripts/[id]/editorial-letter/decisions/route.ts'];
    for (const w of writers) expect(read(w)).not.toMatch(/saveLetter/);
    expect(synth).toMatch(/if \(deepMode && body\.keepAsLetter === true\) \{[\s\S]{0,200}keepRefusal\(memberId, body\)[\s\S]{0,200}saveLetter\(memberId, manuscriptId, revisionNumber, map\)/);
  });
  it('⭐ letters and decisions are append-only, and a letter keeps the draft it was of', () => {
    expect(migration).toMatch(/BEFORE UPDATE ON work_editorial_letters/);
    expect(migration).toMatch(/BEFORE UPDATE ON work_place_decision_events/);
    expect(migration).toMatch(/draft_revision INTEGER NOT NULL/);
    expect(migration).toMatch(/SET LOCAL lock_timeout/);
  });
});
