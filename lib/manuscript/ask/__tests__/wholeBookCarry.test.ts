/**
 * WS-WHOLE-BOOK-CONVERSATION (design approved 2026-11-10, "Approve as recommended") — laws WB1–WB10.
 * docs/programme/WS-WHOLE-BOOK-CONVERSATION_DESIGN_2026-11-10.md §4. Fictional manuscript only.
 *
 * Each law names the wrong implementation it must kill; lethality is proved by mutation (recorded in the design doc).
 */
import { readFileSync } from 'fs';
import {
  selectCarried, buildCarriedSet, WHOLE_BOOK_CARRY_CHARS, MAX_CARRIED_READINGS, MAX_OBSERVATIONS_PER_READING,
  MAX_OBSERVATION_CHARS, type ReadingRow,
} from '../carriedReadings';
import { carriedReadingsSays, withoutCarriedReadings } from '../askReader';

/* A fictional 4-section Work. */
const SECTIONS = [
  { id: 's1', position: 1, heading: 'The Harbour' },
  { id: 's2', position: 2, heading: 'Salt' },
  { id: 's3', position: 3, heading: 'Nets' },
  { id: 's4', position: 4, heading: 'Return' },
];
const ALL = SECTIONS.map((s) => s.id);

let seq = 0;
function row(lens: string, day: number, bodyIds: string[], nObs: number, opts: { chars?: number; keyPrefix?: string } = {}): ReadingRow {
  const cov: Record<string, string> = {};
  for (const id of ALL) cov[id] = bodyIds.includes(id) ? 'body' : 'position';
  const id = `r${++seq}`;
  return {
    id, commissioned_lens: lens, revision_number: 1, frozen_at: new Date(Date.UTC(2026, 9, day)),
    read_state: { sections: Object.fromEntries(bodyIds.map((b) => [b, { digest: `d-${b}` }])) },
    coverage: { sections: cov },
    observations: Array.from({ length: nObs }, (_, i) => ({
      key: `${opts.keyPrefix ?? 'o'}${i + 1}`,
      observation: `${lens} observation ${i + 1} ` + 'x'.repeat(opts.chars ?? 40),
      doesNotEstablish: ['author-intent'],
      position: { sectionPosition: (nObs - i) % 4, codePointStart: i },   // deliberately not in key order
      admissionIndex: i,
      evidenceRefs: [{ kind: 'passage', sectionId: ALL[(nObs - i) % 4] }],
    })),
  };
}
const shapedOf = (rows: ReadingRow[]) => rows.map((r) => ({
  row: r, lens: r.commissioned_lens, frozenAt: new Date(r.frozen_at).toISOString(),
  bodySectionIds: Object.entries(r.coverage.sections ?? {}).filter(([, d]) => d === 'body').map(([id]) => id),
}));
const NOW = new Map(ALL.map((id) => [id, `d-${id}`]));
const build = (rows: ReadingRow[], scope: 'here' | 'whole_book', extra: Partial<Parameters<typeof buildCarriedSet>[1]> = {}) => {
  const picked = selectCarried(shapedOf(rows), scope, scope === 'here' ? ['s1'] : [], ALL);
  return buildCarriedSet(picked, { scope, sections: SECTIONS, currentSectionIds: ALL, dismissed: new Set(), nowDigests: NOW,
    relevant: picked.length, searchFull: false, ...extra });
};

beforeEach(() => { seq = 0; });

describe('whole-book scope carries her complete account', () => {
  it('WB1 every non-dismissed observation of each selected reading is carried (defeat: the 8-per-reading cap)', () => {
    const set = build([row('arc', 10, ALL, 20)], 'whole_book');
    expect(set.readings[0]!.observations).toHaveLength(20);
    expect(set.readings[0]!.observationsTotal).toBe(20);
  });

  it('WB2 no observation text is shortened (defeat: the 600-char cut)', () => {
    const set = build([row('arc', 10, ALL, 2, { chars: 2_000 })], 'whole_book');
    for (const o of set.readings[0]!.observations) expect(o.text.length).toBeGreaterThan(MAX_OBSERVATION_CHARS);
    expect(set.readings[0]!.cut).toBe(false);
  });

  it('WB1b no lens cap of three: one reading per lens, all lenses', () => {
    const lenses = ['arc', 'themes', 'voice', 'reader', 'coherence'];
    const set = build(lenses.map((l, i) => row(l, 10 + i, ALL, 2)), 'whole_book');
    expect(set.readings.map((r) => r.lens).sort()).toEqual([...lenses].sort());
  });

  it('WB3 a complete reading beats a newer partial one for the same lens; a partial one is labelled with its coverage', () => {
    const complete = row('arc', 10, ALL, 2);
    const newerPartial = row('arc', 20, ['s1'], 2);
    const onlyPartial = row('voice', 15, ['s1', 's2'], 2);
    const set = build([complete, newerPartial, onlyPartial], 'whole_book');
    const arc = set.readings.find((r) => r.lens === 'arc')!;
    const voice = set.readings.find((r) => r.lens === 'voice')!;
    expect(arc.id).toBe(complete.id);
    expect(arc.coverage).toEqual({ read: 4, of: 4 });
    expect(voice.coverage).toEqual({ read: 2, of: 4 });
    const says = carriedReadingsSays(set);
    expect(says).toMatch(/2 of 4 sections/);
  });

  it('WB4 over the ceiling, whole readings drop oldest-first and the drop is stated (defeat: mid-observation cut or silent drop)', () => {
    const big = Math.ceil(WHOLE_BOOK_CARRY_CHARS / 2);   // two of these fit at most just under, three never
    const rows = [row('arc', 10, ALL, 1, { chars: big }), row('themes', 11, ALL, 1, { chars: big }), row('voice', 12, ALL, 1, { chars: big })];
    const set = build(rows, 'whole_book');
    const kept = set.readings.map((r) => r.lens);
    expect(kept).not.toContain('arc');                    // the oldest went first
    expect(set.dropped?.map((d) => d.lens)).toContain('arc');
    for (const r of set.readings) for (const o of r.observations) expect(o.text.endsWith('x')).toBe(true);   // never cut mid-observation
    expect(carriedReadingsSays(set)).toMatch(/left out/i);
  });

  it('WB5 chapter-scoped ("here") turns behave exactly as before: three readings, eight observations, 600 chars', () => {
    const lenses = ['arc', 'themes', 'voice', 'reader'];
    const set = build(lenses.map((l, i) => row(l, 10 + i, ALL, 12, { chars: 900 })), 'here');
    expect(set.readings).toHaveLength(MAX_CARRIED_READINGS);
    for (const r of set.readings) {
      expect(r.observations).toHaveLength(MAX_OBSERVATIONS_PER_READING);
      for (const o of r.observations) expect(o.text.length).toBeLessThanOrEqual(MAX_OBSERVATION_CHARS);
    }
  });

  it('WB10 a changed chapter is flagged, and an older-revision reading says so', () => {
    const stale = row('arc', 10, ALL, 1);
    const set = buildCarriedSet(selectCarried(shapedOf([stale]), 'whole_book', [], ALL), {
      scope: 'whole_book', sections: SECTIONS, currentSectionIds: ALL, dismissed: new Set(),
      nowDigests: new Map([...NOW, ['s2', 'changed']]), relevant: 1, searchFull: false, currentRevision: 3 });
    expect(set.readings[0]!.chapters.find((c) => c.id === 's2')!.changedSince).toBe(true);
    expect(carriedReadingsSays(set)).toMatch(/revision 1.*current draft is revision 3|older revision/i);
  });

  it('observations are ordered by place in the book, never by importance', () => {
    const set = build([row('arc', 10, ALL, 6)], 'whole_book');
    const positions = set.readings[0]!.observations.map((o) => o.place ?? 0);
    expect([...positions]).toEqual([...positions].sort((a, b) => a - b));
  });

  it('each observation names where in the book it was seen (headings only, never quoted text)', () => {
    const set = build([row('arc', 10, ALL, 3)], 'whole_book');
    for (const o of set.readings[0]!.observations) {
      expect(o.where?.length).toBeGreaterThan(0);
      for (const w of o.where ?? []) expect(SECTIONS.map((s) => s.heading)).toContain(w);
    }
  });
});

describe('the boundaries that do not move', () => {
  it('WB8 the whole-book account never grounds a quotation (it is stripped like any carried block)', () => {
    const set = build([row('arc', 10, ALL, 2)], 'whole_book');
    const says = carriedReadingsSays(set);
    const handed = `SYSTEM START\n${says}\nSYSTEM END`;
    expect(withoutCarriedReadings(handed)).not.toContain('arc observation 1');
    expect(withoutCarriedReadings(handed)).toContain('SYSTEM END');
  });

  it('WB9 dismissed observations stay out in whole-book scope', () => {
    const r = row('arc', 10, ALL, 3);
    const set = build([r], 'whole_book', { dismissed: new Set([`${r.id}:o2`]) });
    expect(set.readings[0]!.observations.map((o) => o.text)).not.toContain(expect.stringContaining('observation 2 '));
    expect(set.readings[0]!.observations).toHaveLength(2);
  });

  it('a reading that read no chapter text is never carried, in either scope', () => {
    const none = row('arc', 10, [], 3);
    expect(selectCarried(shapedOf([none]), 'whole_book', [], ALL)).toHaveLength(0);
    expect(selectCarried(shapedOf([none]), 'here', ['s1'], ALL)).toHaveLength(0);
  });
});

describe('scope is the writer\'s, and it is recorded (route + client source)', () => {
  const strip = (p: string) => readFileSync(`${process.cwd()}/${p}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const ROUTE = strip('app/api/sovereign/manuscripts/[id]/ask/route.ts');
  const CLIENT = strip('lib/writersStudio/askClient.ts');

  it('WB6 the carried scope comes only from the request\'s declared carryScope — never from the question text', () => {
    expect(ROUTE).toMatch(/body\.carryScope === 'whole_book'/);
    const call = ROUTE.slice(ROUTE.indexOf('loadCarriedReadings('), ROUTE.indexOf('loadCarriedReadings(') + 400);
    expect(call).toMatch(/scope: carryScope/);
    expect(ROUTE).not.toMatch(/carryScope\s*=\s*[^;]*question/);
  });

  it('WB7 the scope is recorded on the answer\'s provenance (in that row) and returned to the client', () => {
    /* Inside the answerProvenance object of MAIA's saved turn — not merely somewhere in the file (the response JSON also names it). */
    const start = ROUTE.indexOf('answerProvenance: {');
    const end = ROUTE.indexOf('const thread = await loadThread(liveThreadId, memberId);', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const prov = ROUTE.slice(start, end);
    expect(prov).toMatch(/\.\.\.\(carryScope === 'whole_book' \? \{ carryScope \} : \{\}\)/);
    const response = ROUTE.slice(end, end + 600);
    expect(response).toMatch(/read, \.\.\.\(carryScope === 'whole_book' \? \{ carryScope \} : \{\}\) \}\)/);
    expect(CLIENT).toMatch(/carryScope === 'whole_book' \? \{ carryScope: 'whole_book' \}/);
  });

  it('WB9b Sanctuary or an unstated posture carries nothing, whatever the scope', () => {
    const guard = ROUTE.slice(ROUTE.indexOf('const carriedReadings ='), ROUTE.indexOf('loadCarriedReadings('));
    expect(guard).toMatch(/posture\.sanctuary \|\| !postureKnown/);
  });
});
