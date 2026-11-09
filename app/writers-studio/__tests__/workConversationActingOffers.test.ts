/**
 * Design 1B amendment 2 (founder, 2026-11-09): MAIA may OFFER grant-reading, make-plan, note-settled and open-desk in the Work
 * conversation. ONLY the writer's click performs one; none is performed in Sanctuary; a room without a handler shows no button.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
const mockAsk = jest.fn(), mockLoadThread = jest.fn(), mockThreads = jest.fn();
let mockPosture = { resolved: true, sanctuary: false };
jest.mock('@/app/writers-studio/useMemberIdentity', () => ({ useMemberIdentity: () => ({ phase: 'ready', memberId: 'fictional-member' }) }));
jest.mock('@/app/writers-studio/useManuscriptKeeps', () => ({ useManuscriptKeeps: () => ({ keeps: [] }) }));
jest.mock('@/lib/writersStudio/askClient', () => ({
  ask: (...a: unknown[]) => mockAsk(...a), askLivingWork: (...a: unknown[]) => mockAsk(...a),
  loadThread: (...a: unknown[]) => mockLoadThread(...a), loadLivingWorkAskThread: (...a: unknown[]) => mockLoadThread(...a),
  threadsOn: (...a: unknown[]) => mockThreads(...a), threadsOnLivingWorkAsk: (...a: unknown[]) => mockThreads(...a),
}));
jest.mock('@/lib/sanctuary/currentClientPosture', () => ({
  readCurrentSanctuaryPosture: () => mockPosture,
  declaredSanctuaryPosture: () => ({ sanctuary: mockPosture.sanctuary ? 'on' : 'off' }),
}));
jest.mock('@/lib/writersStudio/writerCorrectionsClient', () => ({ createWriterCorrection: jest.fn() }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, ...p }: any) => React.createElement('a', p, children) }));
import WorkConversation, { latestAuthorWords } from '@/app/writers-studio/canvas/WorkConversation';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement, root: Root;
const work = { id: 'fictional-work', title: 'Window and Rain' } as LivingWork;
const threadWith = (maia: string) => ({ id: 'thread-a', anchor: { on: 'work' }, openedAt: '2026-11-09T10:00:00Z', turns: [
  { index: 0, speaker: 'author', body: 'About “the rain kept its counsel”: I have decided the narrator never names the town.', staleness: 'current' },
  { index: 1, speaker: 'maia', body: maia, staleness: 'current' },
] });
beforeEach(() => {
  jest.clearAllMocks(); mockPosture = { resolved: true, sanctuary: false };
  mockThreads.mockResolvedValue({ kind: 'threads', threads: [{ id: 'thread-a', anchor: { on: 'work' }, openedAt: '2026-11-09T10:00:00Z', turnCount: 2 }] });
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: jest.fn() });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

async function mount(maia: string, onStudioAct?: jest.Mock) {
  mockLoadThread.mockResolvedValue(threadWith(maia));
  await act(async () => { root.render(React.createElement(WorkConversation, {
    work, manuscriptId: 'fictional-manuscript', sectionId: 's1', onClose: jest.fn(), ...(onStudioAct ? { onStudioAct } : {}),
  })); });
  // adopt the one earlier thread if the room asks which to continue
  const cont = Array.from(host.querySelectorAll('button')).find((b) => /continue|Continue/.test(b.textContent ?? ''));
  if (cont) await act(async () => (cont as HTMLElement).click());
}
const btn = (id: string) => host.querySelector<HTMLButtonElement>(`[data-studio-action="${id}"]`);

it('extracts the writer’s own words and the passage they asked about', () => {
  expect(latestAuthorWords(threadWith('x').turns)).toEqual({
    question: 'About “the rain kept its counsel”: I have decided the narrator never names the town.', passage: 'the rain kept its counsel' });
});

it('a room without a handler shows no acting button', async () => {
  await mount('Shall I?\n[[studio:make-plan]]');
  expect(btn('make-plan')).toBeNull();
});

it('grant-reading: offered, nothing happens until the click; the click grants exactly the level she named', async () => {
  const act1 = jest.fn().mockResolvedValue({ ok: true, text: 'granted' });
  await mount('I only have this chapter.\n[[studio:grant-reading:work]]', act1);
  expect(btn('grant-reading')!.textContent).toBe('Let MAIA read my whole saved work');
  expect(act1).not.toHaveBeenCalled();
  await act(async () => btn('grant-reading')!.click());
  expect(act1).toHaveBeenCalledWith({ id: 'grant-reading', level: 'work' });
});

it('make-plan: the click asks for a plan whose purpose is the writer’s own latest question', async () => {
  const act1 = jest.fn().mockResolvedValue({ ok: true, text: 'ready' });
  await mount('A plan could help.\n[[studio:make-plan]]', act1);
  await act(async () => btn('make-plan')!.click());
  expect(act1).toHaveBeenCalledWith({ id: 'make-plan', ask: 'About “the rain kept its counsel”: I have decided the narrator never names the town.' });
});

it('note-settled: the click opens a box with the writer’s own words; nothing is recorded until Note it', async () => {
  const act1 = jest.fn().mockResolvedValue({ ok: true, text: 'Noted' });
  await mount('That sounds settled.\n[[studio:note-settled]]', act1);
  await act(async () => btn('note-settled')!.click());
  const box = host.querySelector<HTMLTextAreaElement>('[data-note-settled] textarea')!;
  expect(box.value).toContain('I have decided the narrator never names the town.');
  expect(act1).not.toHaveBeenCalled();
  await act(async () => host.querySelector<HTMLButtonElement>('[data-note-settled-confirm]')!.click());
  expect(act1).toHaveBeenCalledWith({ id: 'note-settled', words: expect.stringContaining('never names the town') });
});

it('open-desk: the click hands over the exact words the writer asked about', async () => {
  const act1 = jest.fn().mockResolvedValue({ ok: true, text: 'Opening' });
  await mount('Work on it at the desk.\n[[studio:open-desk]]', act1);
  await act(async () => btn('open-desk')!.click());
  expect(act1).toHaveBeenCalledWith({ id: 'open-desk', words: 'the rain kept its counsel' });
});

it('in Sanctuary a click does nothing and says so', async () => {
  const act1 = jest.fn();
  await mount('I only have this chapter.\n[[studio:grant-reading:chapter]]', act1);
  mockPosture = { resolved: true, sanctuary: true };
  await act(async () => btn('grant-reading')!.click());
  expect(act1).not.toHaveBeenCalled();
  expect(host.querySelector('[data-studio-act-status]')!.textContent).toMatch(/Sanctuary is on/);
});

describe('standing rule: navigation offers', () => {
  it('go-chapter: a chapter id not in this Work is no button; a known one moves there on the click only', async () => {
    const act1 = jest.fn().mockResolvedValue({ ok: true, text: 'moved' });
    mockLoadThread.mockResolvedValue(threadWith('Let us look there.\n[[studio:go-chapter:s9]]'));
    await act(async () => { root.render(React.createElement(WorkConversation, { work, manuscriptId: 'fictional-manuscript', sectionId: 's1', onClose: jest.fn(), onStudioAct: act1, chapterLabel: (id: string) => (id === 's2' ? 'Salt' : null) })); });
    const cont = Array.from(host.querySelectorAll('button')).find((b) => /continue|Continue/.test(b.textContent ?? ''));
    if (cont) await act(async () => (cont as HTMLElement).click());
    expect(btn('go-chapter')).toBeNull();
    act(() => root.unmount()); root = createRoot(host);
    mockLoadThread.mockResolvedValue(threadWith('Let us look there.\n[[studio:go-chapter:s2]]'));
    await act(async () => { root.render(React.createElement(WorkConversation, { work, manuscriptId: 'fictional-manuscript', sectionId: 's1', onClose: jest.fn(), onStudioAct: act1, chapterLabel: (id: string) => (id === 's2' ? 'Salt' : null) })); });
    const cont2 = Array.from(host.querySelectorAll('button')).find((b) => /continue|Continue/.test(b.textContent ?? ''));
    if (cont2) await act(async () => (cont2 as HTMLElement).click());
    expect(btn('go-chapter')!.textContent).toBe('Go to Salt');
    expect(act1).not.toHaveBeenCalled();
    await act(async () => btn('go-chapter')!.click());
    expect(act1).toHaveBeenCalledWith({ id: 'go-chapter', sectionId: 's2' });
  });

  it('show: opens the named place on the click; navigation is not refused in Sanctuary (nothing is written)', async () => {
    const act1 = jest.fn().mockResolvedValue({ ok: true, text: 'Opened under More.' });
    await mount('Your plan is there.\n[[studio:show:plan]]', act1);
    expect(btn('show')!.textContent).toBe('Show my plan');
    mockPosture = { resolved: true, sanctuary: true };
    await act(async () => btn('show')!.click());
    expect(act1).toHaveBeenCalledWith({ id: 'show', place: 'plan' });
  });

  it('show-keeps and focus are the conversation’s own controls, reached by her offer', async () => {
    await mount('Your keeps may help.\n[[studio:show-keeps]]', jest.fn());
    await act(async () => btn('show-keeps')!.click());
    expect(host.querySelector('[data-keeps-chooser]')).not.toBeNull();
  });
});
