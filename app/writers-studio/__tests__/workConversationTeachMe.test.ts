/**
 * WS-CRAFT-CONVENTIONS-01 · G-3 (founder: "whatever is best practice", 2026-11-09): MAIA may OFFER Teach me in the Work
 * conversation. ONLY the writer's click sends a teaching turn; it carries the server-owned anchor and the writer's working
 * style, and it neither sends nor clears the writer's draft. Fictional data only.
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


it('teach-me: offered, nothing is sent until the click', async () => {
  await mount('The withheld feeling does a lot here.\n[[studio:teach-me]]');
  expect(btn('teach-me')!.textContent).toBe('Teach me about this');
  expect(mockAsk).not.toHaveBeenCalled();
});

it('teach-me: the click sends one teaching turn with the passage anchor and the writer\'s working style', async () => {
  mockAsk.mockResolvedValue({ ok: true, threadId: 'thread-a', thread: threadWith('One idea.'), read: [] });
  await mount('The withheld feeling does a lot here.\n[[studio:teach-me]]');
  await act(async () => btn('teach-me')!.click());
  expect(mockAsk).toHaveBeenCalledTimes(1);
  const sent = mockAsk.mock.calls[0]![0] as Record<string, unknown>;
  expect(sent.question).toBe('Teach me about the writing in this passage.');
  expect(sent.teachingAnchor).toBe('passage');
  expect(typeof sent.responseStyle).toBe('string');
});

it('an ordinary question carries the working style but no teaching anchor', async () => {
  mockAsk.mockResolvedValue({ ok: true, threadId: 'thread-a', thread: threadWith('Answer.'), read: [] });
  await mount('Answer.');
  const box = host.querySelector('textarea')!;
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
    setter.call(box, 'What is this scene doing?');
    box.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const sendBtn = Array.from(host.querySelectorAll('button')).find((b) => (b.textContent ?? '').trim() === 'Send')!;
  await act(async () => sendBtn.click());
  const sent = mockAsk.mock.calls.at(-1)![0] as Record<string, unknown>;
  expect(sent.teachingAnchor).toBeUndefined();
  expect(typeof sent.responseStyle).toBe('string');
});

it('teach-me: no button where there is no manuscript (the Living Work route takes no teaching anchor)', async () => {
  mockLoadThread.mockResolvedValue(threadWith('X.\n[[studio:teach-me]]'));
  await act(async () => { root.render(React.createElement(WorkConversation, { work, sectionId: 's1', onClose: jest.fn() })); });
  const cont = Array.from(host.querySelectorAll('button')).find((b) => /continue|Continue/.test(b.textContent ?? ''));
  if (cont) await act(async () => (cont as HTMLElement).click());
  expect(btn('teach-me')).toBeNull();
});
