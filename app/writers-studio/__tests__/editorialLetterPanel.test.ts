/**
 * MAIA's letter and the walk, in Write (founder design 2026-11-11). Real component, jsdom, stubbed clients; not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const scope = jest.fn();
const posture = jest.fn();
const insight = jest.fn();
const runPass = jest.fn();
const fetchLetter = jest.fn();
const postDecision = jest.fn();
const fetchRun = jest.fn();
const startPassRun = jest.fn();
const cancelPassRun = jest.fn();
jest.mock('@/lib/writersStudio/studio/passRunClient', () => ({
  fetchRun: (...a: unknown[]) => fetchRun(...a), startPassRun: (...a: unknown[]) => startPassRun(...a), cancelPassRun: (...a: unknown[]) => cancelPassRun(...a),
}));
jest.mock('@/lib/writersStudio/letter/letterClient', () => ({ fetchLetter: (...a: unknown[]) => fetchLetter(...a), postDecision: (...a: unknown[]) => postDecision(...a) }));
jest.mock('@/lib/writersStudio/readScopeClient', () => ({ getReadScope: (...a: unknown[]) => scope(...a) }));
jest.mock('@/lib/sanctuary/currentClientPosture', () => ({ readCurrentSanctuaryPosture: () => posture() }));
jest.mock('@/lib/writersStudio/insightCanvas', () => ({ ...jest.requireActual('@/lib/writersStudio/insightCanvas'), loadCanvasInsight: (...a: unknown[]) => insight(...a) }));
jest.mock('@/lib/writersStudio/studio/editorialPassRunner', () => ({
  ...jest.requireActual('@/lib/writersStudio/studio/editorialPassRunner'),
  runEditorialPass: (...a: unknown[]) => runPass(...a),
}));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { EditorialLetterPanel } from '@/app/dev/writers-studio-pc3-live/EditorialLetterPanel';
import { savePass, loadPassDecisions } from '@/lib/writersStudio/studio/editorialPassRunner';

const sections = [
  { draftSectionId: 's1', heading: 'Harbour', position: 0 },
  { draftSectionId: 's2', heading: 'Salt', position: 1 },
];
const item = (id: string, sectionId: string) => ({
  id, band: 'next', scale: 'passage', label: `Echo ${id}`, notice: `Notice ${id}.`, whyItMatters: 'It may circle.', uncertainty: null,
  evidence: [{ readingId: 'r1', observationKey: `o-${id}`, sectionIds: [sectionId], lens: 'voice', observation: 'x' }], sectionIds: [sectionId],
});
const MAP = { manuscriptId: 'm', revisionNumber: 5, commissionedAt: 'now', readingIds: ['r1'], items: [item('b', 's2'), item('a', 's1')] };

let root: Root; let host: HTMLDivElement;
const q = (sel: string) => host.querySelector(sel) as HTMLElement | null;
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });
beforeEach(() => {
  window.localStorage.clear();
  scope.mockReset(); posture.mockReset(); insight.mockReset(); runPass.mockReset();
  scope.mockResolvedValue(null); posture.mockReturnValue({ resolved: true, sanctuary: false });
  fetchLetter.mockReset(); postDecision.mockReset();
  fetchLetter.mockResolvedValue({ letter: null, decisions: {} }); postDecision.mockResolvedValue(null);
  fetchRun.mockReset(); startPassRun.mockReset(); cancelPassRun.mockReset();
  fetchRun.mockResolvedValue(null); startPassRun.mockResolvedValue({ ok: false, refusal: 'not_permitted' }); cancelPassRun.mockResolvedValue(true);
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

async function mount(over: Record<string, unknown> = {}) {
  const props = { manuscriptId: 'm', sections, draftRevision: 5, onShowSection: jest.fn(), onEditOptions: jest.fn(), onTalk: jest.fn(), ...over };
  act(() => root.render(React.createElement(EditorialLetterPanel as any, props)));
  await flush();
  return props;
}

describe('automatic reading is off unless the flag is set', () => {
  it('⭐ with whole-Work permission but no flag, she still waits to be asked (a paid job never starts by itself)', async () => {
    delete process.env.NEXT_PUBLIC_WS_AUTO_READ;
    scope.mockResolvedValue({ level: 'work' });
    await mount();
    expect(runPass).not.toHaveBeenCalled();
    expect(q('[data-letter-read]')).not.toBeNull();
  });
});

describe('she reads by herself only with whole-Work permission', () => {
  beforeEach(() => { process.env.NEXT_PUBLIC_WS_AUTO_READ = '1'; });
  afterEach(() => { delete process.env.NEXT_PUBLIC_WS_AUTO_READ; });
  it('⭐ no standing permission: she waits, and says why', async () => {
    await mount();
    expect(runPass).not.toHaveBeenCalled();
    expect(q('[data-editorial-letter="none"]')?.textContent).toContain('I haven’t read this book yet');
    expect(q('[data-letter-read]')).not.toBeNull();
  });
  it('⭐ whole-Work permission, not in Sanctuary, no letter yet: she reads once', async () => {
    scope.mockResolvedValue({ level: 'work' });
    runPass.mockResolvedValue({ ok: true, map: MAP });
    await mount();
    expect(runPass).toHaveBeenCalledTimes(1);
    expect(q('[data-editorial-letter="letter"]')).not.toBeNull();
  });
  it('chapter-only permission is not whole-book permission', async () => {
    scope.mockResolvedValue({ level: 'chapter' });
    await mount();
    expect(runPass).not.toHaveBeenCalled();
  });
  it('⭐ never in Sanctuary, and never when Sanctuary cannot be read', async () => {
    scope.mockResolvedValue({ level: 'work' });
    posture.mockReturnValue({ resolved: true, sanctuary: true });
    await mount();
    posture.mockReturnValue({ resolved: false, reason: 'unreadable' });
    await mount({ manuscriptId: 'm2' });
    expect(runPass).not.toHaveBeenCalled();
  });
  it('a letter that already exists is not read again by herself', async () => {
    scope.mockResolvedValue({ level: 'work' });
    savePass('m', { draftRevision: 5, map: MAP as any });
    await mount();
    expect(runPass).not.toHaveBeenCalled();
  });
});

describe('the letter and the walk', () => {
  beforeEach(() => savePass('m', { draftRevision: 5, map: MAP as any }));
  it('⭐ the letter lists every place in the order of the book, and opens none by itself', async () => {
    await mount();
    const rows = [...host.querySelectorAll('[data-letter-open]')].map((e) => e.textContent);
    expect(rows).toEqual(['Echo a', 'Echo b']);
    expect(q('[data-editorial-letter="place"]')).toBeNull();
  });
  it('⭐ one place at a time: she asks "Is this intended?" and only the writer moves on', async () => {
    await mount();
    act(() => q('[data-letter-start]')!.click());
    expect(q('[data-letter-place="1"]')?.textContent).toContain('Is this intended?');
    expect(q('[data-letter-place="1"]')?.textContent).toContain('Place 1 of 2 · Harbour');
    act(() => q('[data-letter-next]')!.click());
    expect(q('[data-letter-place="2"]')).not.toBeNull();
  });
  it('⭐ opening a place brings its passage into the centre (the writer\'s click); Next does the same; "Talk about it" is the writer\'s call', async () => {
    const p = await mount();
    expect(p.onShowSection).not.toHaveBeenCalled();
    act(() => q('[data-letter-start]')!.click());
    expect(p.onShowSection).toHaveBeenLastCalledWith('s1');
    act(() => q('[data-letter-next]')!.click());
    expect(p.onShowSection).toHaveBeenLastCalledWith('s2');
    act(() => q('[data-letter-prev]')!.click());
    act(() => q('[data-letter-act="where"]')!.click());
    expect(p.onShowSection).toHaveBeenCalledWith('s1');
    act(() => q('[data-letter-act="talk"]')!.click());
    expect((p.onTalk as jest.Mock).mock.calls[0][0]).toContain('Echo a');
  });
  it('⭐ "Show me options" opens the desk only on words verified in the current draft', async () => {
    insight.mockResolvedValue({ passages: [{ sectionId: 's1', verified: true, editable: true, range: { start: 0, end: 5 } }] });
    const p = await mount();
    act(() => q('[data-letter-start]')!.click());
    await act(async () => { q('[data-letter-act="options"]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(p.onEditOptions).toHaveBeenCalledWith({ sectionId: 's1', readingId: 'r1', observationKey: 'o-a' });
  });
  it('⭐ founder direction 2026-11-12: "Talk about it" opens in the centre on the place\'s words, asking nothing of MAIA', async () => {
    insight.mockResolvedValue({ passages: [{ sectionId: 's1', verified: true, editable: true, range: { start: 0, end: 5 } }] });
    const onTalkPassage = jest.fn();
    const p = await mount({ onTalkPassage });
    act(() => q('[data-letter-start]')!.click());
    await act(async () => { q('[data-letter-act="talk"]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(onTalkPassage).toHaveBeenCalledWith({ sectionId: 's1', readingId: 'r1', observationKey: 'o-a' });
    expect(p.onTalk).not.toHaveBeenCalled();
    expect(p.onEditOptions).not.toHaveBeenCalled();
  });
  it('⭐ MUST FAIL IF a place with no verified words loses its conversation: it opens about the Work, carrying the place', async () => {
    insight.mockResolvedValue({ passages: [{ sectionId: 's1', verified: false, editable: true, range: { start: 0, end: 5 } }] });
    const onTalkPassage = jest.fn();
    const p = await mount({ onTalkPassage });
    act(() => q('[data-letter-start]')!.click());
    await act(async () => { q('[data-letter-act="talk"]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(onTalkPassage).not.toHaveBeenCalled();
    expect(p.onTalk).toHaveBeenCalledWith(expect.stringMatching(/^About “.+” in .+: you noticed: /));
  });
  it('⭐ words she cannot verify are never proposed on: she says so instead', async () => {
    insight.mockResolvedValue({ passages: [{ sectionId: 's1', verified: false, editable: true, range: { start: 0, end: 5 } }] });
    const p = await mount();
    act(() => q('[data-letter-start]')!.click());
    await act(async () => { q('[data-letter-act="options"]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(p.onEditOptions).not.toHaveBeenCalled();
    expect(host.textContent).toContain('I can’t tie this to exact words');
  });
  it('"It\'s intended" is remembered, shown in the letter, and changeable', async () => {
    await mount();
    act(() => q('[data-letter-start]')!.click());
    act(() => q('[data-letter-act="intended"]')!.click());
    expect(loadPassDecisions('m')).toEqual({ a: 'intended' });
    act(() => q('[data-letter-back]')!.click());
    expect(host.textContent).toContain('intended');
    expect(host.querySelectorAll('[data-letter-open]').length).toBe(2);
  });
  it('⭐ a letter of an earlier draft says so, and rereading is the writer\'s choice', async () => {
    await mount({ draftRevision: 6 });
    expect(q('[data-letter-stale]')?.textContent).toContain('You’ve changed the book since I read it');
    expect(runPass).not.toHaveBeenCalled();
  });
  it('the panel never scrolls or takes focus', () => {
    const src = require('node:fs').readFileSync(require('node:path').join(process.cwd(), 'app/dev/writers-studio-pc3-live/EditorialLetterPanel.tsx'), 'utf8');
    expect(src.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/\.focus\(|scrollIntoView|scrollTo\(/);
  });
});

describe('step 2: the letter and decisions are kept on the server', () => {
  const SERVER = { id: '11111111-1111-4111-8111-111111111111', draftRevision: 5, map: MAP, createdAt: 'now' };
  it('⭐ a letter on the server is shown on a device that has none, with its decisions', async () => {
    fetchLetter.mockResolvedValue({ letter: SERVER, decisions: { b: 'later' } });
    await mount();
    expect(host.querySelectorAll('[data-letter-open]').length).toBe(2);
    expect(host.textContent).toContain('later');
  });
  it('⭐ a decision on a kept letter goes to the server, not this device', async () => {
    fetchLetter.mockResolvedValue({ letter: SERVER, decisions: {} });
    await mount();
    act(() => q('[data-letter-start]')!.click());
    await act(async () => { q('[data-letter-act="intended"]')!.click(); await Promise.resolve(); });
    expect(postDecision).toHaveBeenCalledWith('m', SERVER.id, 'a', 'intended');
    expect(loadPassDecisions('m')).toEqual({});
    expect(q('[data-letter-decision="intended"]')).not.toBeNull();
  });
  it('⭐ a refused decision (Sanctuary) is said, and nothing is recorded as decided', async () => {
    fetchLetter.mockResolvedValue({ letter: SERVER, decisions: {} });
    postDecision.mockResolvedValue('sanctuary_not_kept');
    await mount();
    act(() => q('[data-letter-start]')!.click());
    await act(async () => { q('[data-letter-act="later"]')!.click(); await Promise.resolve(); });
    expect(q('[data-letter-decision]')).toBeNull();
    expect(host.textContent).toContain('Sanctuary is on');
  });
  it('a letter of an earlier draft on the server is labelled as such', async () => {
    fetchLetter.mockResolvedValue({ letter: { ...SERVER, draftRevision: 4 }, decisions: {} });
    await mount();
    expect(q('[data-letter-stale]')).not.toBeNull();
  });
  it('she reads the book with the letter kept (the keep gate decides on the server)', async () => {
    runPass.mockResolvedValue({ ok: true, map: MAP, letterId: SERVER.id, letterKept: 'kept' });
    await mount();
    await act(async () => { q('[data-letter-read]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(runPass.mock.calls[0][0]).toMatchObject({ keepAsLetter: true });
  });
});


describe('step 4: the pass runs on the server and survives closing the page', () => {
  const running = { id: 'run1', draftRevision: 5, state: 'lens_done', done: 5, total: 9, lens: 'arc', refusal: null, letterId: null, createdAt: 'now' };
  it('⭐ an unfinished run is shown truthfully when the page opens ("5 of 9 readings done"), and can be stopped', async () => {
    fetchRun.mockResolvedValue(running);
    await mount();
    expect(q('[data-editorial-letter="running"]')?.textContent).toContain('5 of 9 readings done');
    expect(host.textContent).toContain('close this page; I’ll carry on');
    await act(async () => { q('[data-letter-cancel]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(cancelPassRun).toHaveBeenCalledWith('m');
  });
  it('⭐ with whole-Work permission, "Read my book" starts the server run, not the page loop', async () => {
    startPassRun.mockResolvedValue({ ok: true, run: { ...running, state: 'queued', done: 0 } });
    await mount();
    fetchRun.mockResolvedValue({ ...running, state: 'reading', done: 1 });   // the server now reports the run it started
    await act(async () => { q('[data-letter-read]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(startPassRun).toHaveBeenCalledWith('m');
    expect(runPass).not.toHaveBeenCalled();
    expect(q('[data-editorial-letter="running"]')).not.toBeNull();
  });
  it('without whole-Work permission, the writer\'s click still reads from this page', async () => {
    runPass.mockResolvedValue({ ok: true, map: MAP, letterId: null, letterKept: 'not_asked' });
    await mount();
    await act(async () => { q('[data-letter-read]')!.click(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });
    expect(runPass).toHaveBeenCalledTimes(1);
  });
  it('⭐ a stopped run says why, keeps what was done, and offers Continue', async () => {
    fetchRun.mockResolvedValue({ ...running, state: 'stopped', refusal: 'permission_withdrawn' });
    await mount();
    expect(q('[data-letter-run-ended="stopped"]')?.textContent).toContain('you withdrew my permission');
    expect(q('[data-letter-continue]')).not.toBeNull();
  });
  it('the daily limit is said in words', async () => {
    startPassRun.mockResolvedValue({ ok: false, refusal: 'daily_limit' });
    await mount();
    await act(async () => { q('[data-letter-read]')!.click(); await Promise.resolve(); await Promise.resolve(); });
    expect(host.textContent).toContain('as many times today as your setting allows');
    expect(runPass).not.toHaveBeenCalled();
  });
});


describe('step 5: the letter opens with her reading of the book, as a question', () => {
  const OPENING = { reachingFor: 'The book reaches for grief as a passage. Is that right?', working: [{ text: 'The opening carries it.', quote: 'Marta held the key', sectionId: 's1' }], divergence: null, droppedUnverified: 0 };
  beforeEach(() => savePass('m', { draftRevision: 5, map: { ...MAP, opening: OPENING } as any }));
  it('⭐ shows what she thinks the book is reaching for, and asks; nothing is decided for the writer', async () => {
    await mount();
    expect(q('[data-letter-opening]')?.textContent).toContain('grief as a passage');
    expect(q('[data-opening-yes]')).not.toBeNull();
    expect(q('[data-letter-working]')?.textContent).toContain('“Marta held the key”');
  });
  it('"Not quite" opens the conversation in the writer\'s own words; it never edits the letter', async () => {
    const p = await mount();
    act(() => q('[data-opening-not-quite]')!.click());
    expect((p.onTalk as jest.Mock).mock.calls[0][0]).toContain('Not quite. What I’m reaching for is');
    expect(q('[data-letter-opening]')?.textContent).toContain('grief as a passage');
  });
  it('"Show me where" on a working quotation is the writer\'s call', async () => {
    const p = await mount();
    act(() => q('[data-working-where="0"]')!.click());
    expect(p.onShowSection).toHaveBeenCalledWith('s1');
  });
});


describe('a letter that could not be gathered (EA walk 2026-11-12)', () => {
  it('⭐ says she read the book and the letter failed, not that the reading failed; offers to try the letter again', async () => {
    fetchRun.mockResolvedValue({ id: 'run1', draftRevision: 5, state: 'failed', done: 9, total: 9, lens: null, refusal: 'synthesis:attention_map_unbound_evidence', letterId: null, createdAt: 'now' });
    await mount();
    expect(host.textContent).toContain('I’ve read your book. My letter isn’t ready yet.');
    expect(host.textContent).toContain('I read all 9 lenses of your book, but I couldn’t gather them into a letter');
    expect(host.textContent).not.toContain('I couldn’t finish the');
    expect(q('[data-letter-continue]')?.textContent).toBe('Try the letter again');
  });
});
