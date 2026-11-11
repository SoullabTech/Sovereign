/**
 * Step 1 — the coverage map. Each "must fail if" in the design (§9) is a test here, and each was first run against a deliberately
 * wrong derivation to prove it catches it (see the PR).
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { deriveCoverage, type CoverageReading } from '@/lib/manuscript/development/coverageMap';

const h = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const live = [
  { id: 's1', text: 'Marta held the key.' },
  { id: 's2', text: 'The nets were heavy.' },
  { id: 's3', text: 'She walked back slowly.' },
];
const reading = (over: Partial<CoverageReading> & { id: string }): CoverageReading => ({
  lens: 'arc', frozenAt: '2026-11-10T10:00:00.000Z', draftId: 'd1',
  digests: Object.fromEntries(live.map((s) => [s.id, h(s.text)])),
  depths: Object.fromEntries(live.map((s) => [s.id, 'body'])),
  ...over,
});
const derive = (readings: CoverageReading[], text = live) => deriveCoverage({ draftId: 'd1', draftRevision: 5, live: text, readings });
const state = (m: ReturnType<typeof derive>, id: string) => m.sections.find((s) => s.sectionId === id)!.state;

describe('coverage map: what she has read, and whether it is still current', () => {
  it('a body reading of the current text is "read", with its lens and time', () => {
    const m = derive([reading({ id: 'r1' })]);
    expect(m.whole).toEqual({ read: 3, changed: 0, positionOnly: 0, notRead: 0, total: 3 });
    expect(m.sections[0]).toEqual({ sectionId: 's1', state: 'read', readAt: '2026-11-10T10:00:00.000Z', lenses: ['arc'] });
    expect(m.lensesCurrentForWholeDraft).toEqual(['arc']);
  });

  it('⭐ MUST FAIL IF a section edited after its reading still shows "read"', () => {
    const edited = [live[0]!, { id: 's2', text: 'The nets were heavier that winter.' }, live[2]!];
    const m = derive([reading({ id: 'r1' })], edited);
    expect(state(m, 's2')).toBe('changed');
    expect(state(m, 's1')).toBe('read');
    expect(m.lensesCurrentForWholeDraft).toEqual([]);
  });

  it('⭐ MUST FAIL IF a position-only reading counts as read', () => {
    const m = derive([reading({ id: 'r1', depths: { s1: 'position', s2: 'position', s3: 'body' } })]);
    expect(state(m, 's1')).toBe('position_only');
    expect(state(m, 's3')).toBe('read');
    expect(m.whole.read).toBe(1);
  });

  it('⭐ MUST FAIL IF a position-only digest match is treated as a read (digest alone is not depth)', () => {
    const m = derive([reading({ id: 'r1', depths: { s1: 'position' } })]);
    expect(state(m, 's1')).toBe('position_only');
  });

  it('⭐ MUST FAIL IF a reading of another draft counts', () => {
    const m = derive([reading({ id: 'r1', draftId: 'someone-elses-draft' })]);
    expect(m.whole.notRead).toBe(3);
    expect(m.whole.read).toBe(0);
  });

  it('a newer reading of the current text wins over an older stale one, and both lenses that match are named', () => {
    const old = reading({ id: 'r0', lens: 'voice', frozenAt: '2026-11-01T00:00:00.000Z', digests: { s1: h('old text'), s2: h(live[1]!.text), s3: h(live[2]!.text) } });
    const m = derive([old, reading({ id: 'r1', lens: 'arc', frozenAt: '2026-11-10T10:00:00.000Z' })]);
    expect(m.sections[0]).toMatchObject({ state: 'read', lenses: ['arc'] });
    expect(m.sections[1]).toMatchObject({ state: 'read', lenses: ['arc', 'voice'] });
  });

  it('a section no reading covers is "not_read"', () => {
    const m = derive([reading({ id: 'r1', depths: { s1: 'body' }, digests: { s1: h(live[0]!.text) } })]);
    expect(state(m, 's2')).toBe('not_read');
    expect(m.whole).toMatchObject({ read: 1, notRead: 2 });
  });

  it('no readings at all: everything is not_read and no lens is current', () => {
    const m = derive([]);
    expect(m.whole.notRead).toBe(3);
    expect(m.lensesCurrentForWholeDraft).toEqual([]);
  });

  it('⭐ carries no prose: the map holds ids, states, lenses and times only', () => {
    const m = derive([reading({ id: 'r1' })]);
    const json = JSON.stringify(m);
    for (const s of live) expect(json).not.toContain(s.text);
  });
});

describe('the server query (source)', () => {
  const SRC = fs.readFileSync(path.join(process.cwd(), 'lib/manuscript/development/coverageMap.ts'), 'utf8');
  it('⭐ MUST FAIL IF another member\'s readings or draft can be read: member_id is in every predicate', () => {
    expect(SRC).toMatch(/FROM manuscript_working_drafts WHERE manuscript_id = \$1 AND member_id = \$2/);
    expect(SRC).toMatch(/FROM developmental_readings\s+WHERE manuscript_id = \$1 AND member_id = \$2/);
  });
  it('⭐ MUST FAIL IF a state is shown while the draft cannot be established', () => {
    expect(SRC).toMatch(/section_addressable_at === null\) return \{ ok: false, refusal: 'draft_not_established' \}/);
    expect(SRC).toMatch(/rev\.rows\.length !== 1\) return \{ ok: false, refusal: 'draft_not_established' \}/);
  });
});
