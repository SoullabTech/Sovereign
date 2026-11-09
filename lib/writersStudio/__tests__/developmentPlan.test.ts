import { decideHandoff, HANDOFF_REFUSAL_COPY, stepStanding, locateAnchor, PLAN_HANDOFF_KEY, groundSteps, applyStepEdits, staleStepIds, MAX_STEPS, type PlanChapter, type PlanStep } from '../developmentPlan';

const chapters: PlanChapter[] = [
  { id: 'c2', heading: 'Salt', text: 'Marta left a light on in the hallway, as if someone might yet come home.' },
  { id: 'c7', heading: 'Return', text: 'She found the house. There was no key, and the hallway was dark.' },
];
let n = 0; const id = () => `s${++n}`;

describe('a plan step is real or it does not exist', () => {
  it('keeps a step whose anchor occurs in the named chapter (case, spacing and curly quotes ignored)', () => {
    const r = groundSteps([{ chapterId: 'c2', anchor: 'A LIGHT   on in the hallway', direction: 'echo this in Return' }], chapters, id);
    expect(r.steps).toHaveLength(1); expect(r.dropped).toHaveLength(0); expect(r.steps[0]!.status).toBe('open');
  });
  it('drops an invented anchor, with the reason, and never silently', () => {
    const r = groundSteps([{ chapterId: 'c7', anchor: 'the lighthouse burned all night', direction: 'x' }], chapters, id);
    expect(r.steps).toHaveLength(0); expect(r.dropped[0]!.reason).toMatch(/not in that chapter/);
  });
  it('drops a chapter she was not handed', () => {
    expect(groundSteps([{ chapterId: 'c9', anchor: 'anything', direction: 'x' }], chapters, id).dropped[0]!.reason).toMatch(/not handed/);
  });
  it('drops an incomplete step; and caps the number of steps', () => {
    expect(groundSteps([{ chapterId: 'c2', anchor: 'a light on', direction: '' }], chapters, id).steps).toHaveLength(0);
    const many = Array.from({ length: 9 }, () => ({ chapterId: 'c2', anchor: 'a light on in the hallway', direction: 'try this' }));
    expect(groundSteps(many, chapters, id).steps).toHaveLength(MAX_STEPS);
  });
  it('a step carries a direction in plain words, never replacement prose of its own anchor', () => {
    const r = groundSteps([{ chapterId: 'c2', anchor: 'a light on in the hallway', direction: 'Echo this light in the opening of Return.', why: 'It pays off the promise.' }], chapters, id);
    expect(r.steps[0]!.direction).toContain('Echo'); expect(r.steps[0]!.why).toBe('It pays off the promise.');
  });
});

describe('the writer edits the plan; only the wording, the status, or removal', () => {
  const steps: PlanStep[] = [
    { id: 'a', chapterId: 'c2', anchor: 'a light on', direction: 'one', why: '', status: 'open' },
    { id: 'b', chapterId: 'c7', anchor: 'no key', direction: 'two', why: '', status: 'open' },
  ];
  it('edits wording and status', () => {
    const r = applyStepEdits(steps, [{ id: 'a', direction: 'new wording', status: 'working' }]);
    expect(r[0]).toMatchObject({ direction: 'new wording', status: 'working', anchor: 'a light on', chapterId: 'c2' });
  });
  it('removes a step', () => { expect(applyStepEdits(steps, [{ id: 'b', remove: true }]).map((s) => s.id)).toEqual(['a']); });
  it('can never change an anchor or a chapter, and ignores an unknown status', () => {
    const r = applyStepEdits(steps, [{ id: 'a', status: 'finished', direction: '   ' } as never, { id: 'a', anchor: 'EVIL', chapterId: 'zz' } as never]);
    expect(r[0]).toMatchObject({ anchor: 'a light on', chapterId: 'c2', status: 'open', direction: 'one' });
  });
});

describe('a step goes stale when its chapter changes', () => {
  it('flags only the steps whose chapter digest moved', () => {
    const steps: PlanStep[] = [{ id: 'a', chapterId: 'c2', anchor: 'x', direction: 'd', why: '', status: 'open' }, { id: 'b', chapterId: 'c7', anchor: 'y', direction: 'd', why: '', status: 'open' }];
    const basis = [{ sectionId: 'c2', digest: 'AAA' }, { sectionId: 'c7', digest: 'BBB' }];
    expect(staleStepIds(steps, basis, new Map([['c2', 'AAA'], ['c7', 'CHANGED']]))).toEqual(['b']);
    expect(staleStepIds(steps, basis, new Map())).toEqual([]);   // cannot be read ⇒ not claimed stale
  });
});

describe('opening a step in the passage desk: the words are found in the text as it is now, exactly once, or not at all', () => {
  const body = 'Marta left a light on in the hallway. Later, the hallway was dark.';
  it('holds an exact, unique passage with its offsets', () => {
    const r = locateAnchor(body, 'a light on in the hallway');
    expect(r).toMatchObject({ ok: true, text: 'a light on in the hallway' });
    if (r.ok) expect(body.slice(r.start, r.end)).toBe(r.text);
  });
  it('ignores case, and returns the writer’s own spelling of it', () => {
    const r = locateAnchor(body, 'A LIGHT ON IN THE HALLWAY'); expect(r.ok && r.text).toBe('a light on in the hallway');
  });
  it('refuses a passage that has moved or been rewritten', () => { expect(locateAnchor('Everything had been moved.', 'a light on')).toEqual({ ok: false, reason: 'missing' }); });
  it('refuses a passage that occurs twice rather than choosing for the writer', () => { expect(locateAnchor(body, 'the hallway')).toEqual({ ok: false, reason: 'ambiguous' }); });
  it('refuses empty words', () => { expect(locateAnchor(body, '   ')).toEqual({ ok: false, reason: 'missing' }); });
  it('the hand-off carries an id only, keyed by manuscript', () => { expect(PLAN_HANDOFF_KEY('m1')).toBe('ws-plan-step:m1'); });
});

describe('the hand-off verdict is strict: a unique phrase is not evidence the proposal still fits', () => {
  const basis = [{ sectionId: 'c2', digest: 'AAA' }];
  it('verified only when the chapter is exactly what MAIA read', () => { expect(stepStanding({ chapterId: 'c2' }, basis, new Map([['c2', 'AAA']]))).toBe('verified'); });
  it('changed when the chapter moved, even if the anchor phrase survived', () => { expect(stepStanding({ chapterId: 'c2' }, basis, new Map([['c2', 'BBB']]))).toBe('changed'); });
  it('unverified when there is no record of what she read', () => { expect(stepStanding({ chapterId: 'c7' }, basis, new Map([['c7', 'AAA']]))).toBe('unverified'); });
  it('unverified when the chapter cannot be read now', () => { expect(stepStanding({ chapterId: 'c2' }, basis, new Map())).toBe('unverified'); });
});

describe('the hand-off decision (review findings 1–4 on e410f9f06/c09b28986)', () => {
  const st = (over: Partial<PlanStep> = {}): PlanStep => ({ id: 'a', chapterId: 'c7', anchor: 'no key', direction: 'd', why: '', status: 'open', ...over });
  const body = 'She found the house. There was no key, and the hallway was dark.';
  const base = (over: Record<string, unknown> = {}) => ({
    seq: 1, latestSeq: 1, stepId: 'a', sectionIds: ['c2', 'c7'],
    view: { plan: { steps: [st()] }, staleStepIds: [] as string[], unverifiedStepIds: [] as string[], verdict: true },
    saveStateOf: () => 'clean', bodyOf: () => body, ...over,
  });

  it('holds the exact words, and only an OPEN step is marked working — and only on a successful hold', () => {
    expect(decideHandoff(base() as any)).toEqual({ kind: 'hold', sectionId: 'c7', start: body.indexOf('no key'), end: body.indexOf('no key') + 6, text: 'no key', markWorking: true });
    expect(decideHandoff(base({ view: { plan: { steps: [st({ status: 'done' })] }, staleStepIds: [], unverifiedStepIds: [], verdict: true } }) as any)).toMatchObject({ kind: 'hold', markWorking: false });
  });
  it('#1 every refusal changes no status (there is no markWorking on a refusal)', () => {
    for (const d of [decideHandoff(base({ view: { plan: { steps: [st()] }, staleStepIds: ['a'], unverifiedStepIds: [], verdict: true } }) as any),
      decideHandoff(base({ bodyOf: () => 'Everything moved.' }) as any)]) {
      expect(d.kind).toBe('refuse'); expect('markWorking' in d).toBe(false);
    }
  });
  it('#2 a missing server verdict refuses; it is never read as "nothing is stale"', () => {
    expect(decideHandoff(base({ view: { plan: { steps: [st()] }, staleStepIds: [], unverifiedStepIds: [], verdict: false } }) as any)).toMatchObject({ kind: 'refuse', reason: 'no_verdict' });
    expect(decideHandoff(base({ view: undefined }) as any)).toMatchObject({ kind: 'refuse', reason: 'no_plan' });
  });
  it('#3 unsaved, saving or conflicted text refuses: the server verified the saved chapter, not the buffer', () => {
    for (const state of ['dirty', 'saving', 'conflict', 'error'])
      expect(decideHandoff(base({ saveStateOf: () => state }) as any)).toMatchObject({ kind: 'refuse', reason: 'unsaved', focusSectionId: 'c7' });
  });
  it('#4 an older hand-off that resolves after a newer one is dropped, never applied', () => {
    expect(decideHandoff(base({ seq: 1, latestSeq: 2 }) as any)).toEqual({ kind: 'superseded' });
  });
  it('changed and unverified chapters refuse; so do duplicated and missing words; and a step whose chapter is not in this Work', () => {
    expect(decideHandoff(base({ view: { plan: { steps: [st()] }, staleStepIds: ['a'], unverifiedStepIds: [], verdict: true } }) as any)).toMatchObject({ reason: 'changed' });
    expect(decideHandoff(base({ view: { plan: { steps: [st()] }, staleStepIds: [], unverifiedStepIds: ['a'], verdict: true } }) as any)).toMatchObject({ reason: 'unverified' });
    expect(decideHandoff(base({ bodyOf: () => 'no key here, no key there' }) as any)).toMatchObject({ reason: 'ambiguous' });
    expect(decideHandoff(base({ bodyOf: () => 'nothing like it' }) as any)).toMatchObject({ reason: 'missing' });
    expect(decideHandoff(base({ sectionIds: ['c2'] }) as any)).toMatchObject({ reason: 'no_step', focusSectionId: null });
    expect(decideHandoff(base({ stepId: 'zz' }) as any)).toMatchObject({ reason: 'no_step' });
  });
  it('the order of checks is the law: unsaved is reported before stale, and stale before the word search', () => {
    expect(decideHandoff(base({ saveStateOf: () => 'dirty', view: { plan: { steps: [st()] }, staleStepIds: ['a'], unverifiedStepIds: [], verdict: true } }) as any)).toMatchObject({ reason: 'unsaved' });
    expect(decideHandoff(base({ bodyOf: () => 'nothing', view: { plan: { steps: [st()] }, staleStepIds: ['a'], unverifiedStepIds: [], verdict: true } }) as any)).toMatchObject({ reason: 'changed' });
  });
  it('every refusal tells the writer that nothing was changed', () => {
    for (const copy of Object.values(HANDOFF_REFUSAL_COPY)) expect(copy).toMatch(/Nothing was changed\.$/);
  });
});
