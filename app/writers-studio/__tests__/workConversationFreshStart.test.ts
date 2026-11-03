/**
 * Design 2A (founder ruling 2026-11-02): the Work conversation gets "Start a new
 * conversation", as Passage Focus has. The earlier thread stays saved; the next
 * question opens a new one; the writer's composer text stays. Real component;
 * ask client, identity and keeps are fictional doubles. Not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mockAsk = jest.fn();
const mockThreadsOn = jest.fn();
const mockLoadThread = jest.fn();

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => React.createElement('a', null, children),
}));
jest.mock('@/lib/writersStudio/askClient', () => ({
  ask: (...a: unknown[]) => mockAsk(...a),
  askLivingWork: (...a: unknown[]) => mockAsk(...a),
  loadThread: (...a: unknown[]) => mockLoadThread(...a),
  loadLivingWorkAskThread: (...a: unknown[]) => mockLoadThread(...a),
  threadsOn: (...a: unknown[]) => mockThreadsOn(...a),
  threadsOnLivingWorkAsk: (...a: unknown[]) => mockThreadsOn(...a),
}));
jest.mock('@/app/writers-studio/useMemberIdentity', () => ({
  useMemberIdentity: () => ({ phase: 'ready', memberId: 'fictional-member', name: 'Fictional' }),
}));
jest.mock('@/app/writers-studio/useManuscriptKeeps', () => ({ useManuscriptKeeps: () => ({ keeps: [] }) }));
jest.mock('@/lib/writersStudio/writerCorrectionsClient', () => ({ createWriterCorrection: jest.fn() }));

import WorkConversation from '@/app/writers-studio/canvas/WorkConversation';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no layout; the component scrolls the thread into view.
(Element.prototype as any).scrollIntoView = () => undefined;

const workA = { id: 'fictional-work-a', title: 'Fictional A' } as any;
const workB = { id: 'fictional-work-b', title: 'Fictional B' } as any;

function threadView(id: string, answer: string) {
  return {
    id, anchor: { on: 'work' }, openedAt: '2026-10-30T00:00:00Z',
    turns: [
      { index: 0, speaker: 'author', body: 'question', staleness: 'current' },
      { index: 1, speaker: 'maia', body: answer, staleness: 'current' },
    ],
  };
}
function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

let host: HTMLDivElement;
let root: Root;

async function flush() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}
async function mount(work: any, manuscriptId: string) {
  await act(async () => {
    root.render(React.createElement(WorkConversation, {
      work, manuscriptId, sectionId: null, onClose: () => undefined,
    }));
    await flush();
  });
}
function composer() {
  const el = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message MAIA"]');
  expect(el).not.toBeNull();
  return el!;
}
function type(text: string) {
  const el = composer();
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function enter() {
  composer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
}

beforeEach(() => {
  mockAsk.mockReset();
  mockThreadsOn.mockReset();
  mockLoadThread.mockReset();
  mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [] });
  mockLoadThread.mockResolvedValue(null);
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });


function freshButton() {
  return [...host.querySelectorAll('button')].find((b) => b.textContent === 'Start a new conversation') ?? null;
}
async function click(el: Element) {
  await act(async () => { (el as HTMLElement).click(); await flush(); });
}

describe('Work conversation: Start a new conversation', () => {
  it('is absent before any conversation exists', async () => {
    await mount(workA, 'fictional-ms-a');
    expect(freshButton()).toBeNull();
  });

  it('sets the resumed thread aside; the next question opens a new thread, not the old one', async () => {
    mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [{ id: 'thread-old', openedAt: '2026-10-30T00:00:00Z', turnCount: 2 }] });
    mockLoadThread.mockResolvedValue(threadView('thread-old', 'old answer'));
    await mount(workA, 'fictional-ms-a');
    expect(host.textContent).toContain('old answer');
    await click(freshButton()!);
    expect(host.textContent).not.toContain('old answer');
    expect(composer().getAttribute('data-send-mode')).toBe('open');

    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 'thread-new', thread: threadView('thread-new', 'new answer'), staleness: 'current' });
    type('A fresh question');
    await act(async () => { enter(); await flush(); });
    const call = mockAsk.mock.calls[0][0];
    expect(call.threadId).toBeUndefined();
    expect(call.anchor).toEqual({ on: 'work' });
    expect(host.textContent).toContain('new answer');
  });

  it('keeps the writer’s unsent composer text', async () => {
    mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [{ id: 'thread-old', openedAt: '2026-10-30T00:00:00Z', turnCount: 2 }] });
    mockLoadThread.mockResolvedValue(threadView('thread-old', 'old answer'));
    await mount(workA, 'fictional-ms-a');
    type('Words I have not sent');
    await click(freshButton()!);
    expect(composer().value).toBe('Words I have not sent');
  });

  it('is offered beside the chooser, and starting fresh there opens a new thread', async () => {
    mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [
      { id: 'thread-1', openedAt: '2026-10-30T00:00:00Z', turnCount: 2 },
      { id: 'thread-2', openedAt: '2026-10-29T00:00:00Z', turnCount: 4 },
    ] });
    await mount(workA, 'fictional-ms-a');
    expect(composer().getAttribute('data-send-mode')).toBe('blocked:choosing');
    await click(freshButton()!);
    expect(composer().getAttribute('data-send-mode')).toBe('open');
  });

  it('is not offered while a chosen thread is still loading', async () => {
    mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [
      { id: 'thread-1', openedAt: '2026-10-30T00:00:00Z', turnCount: 2 },
      { id: 'thread-2', openedAt: '2026-10-29T00:00:00Z', turnCount: 4 },
    ] });
    mockLoadThread.mockReturnValue(new Promise(() => undefined));
    await mount(workA, 'fictional-ms-a');
    await click(host.querySelector('[data-resume="thread-1"]')!);
    expect(freshButton()).toBeNull();
  });

  it('cannot be pressed while a question is in flight', async () => {
    mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [{ id: 'thread-old', openedAt: '2026-10-30T00:00:00Z', turnCount: 2 }] });
    mockLoadThread.mockResolvedValue(threadView('thread-old', 'old answer'));
    const reply = deferred<any>();
    mockAsk.mockReturnValue(reply.promise);
    await mount(workA, 'fictional-ms-a');
    type('In flight');
    await act(async () => { enter(); await flush(); });
    expect(freshButton()!.disabled).toBe(true);
    await act(async () => {
      reply.resolve({ ok: true, threadId: 'thread-old', thread: threadView('thread-old', 'answer'), staleness: 'current' });
      await flush();
    });
    expect(freshButton()!.disabled).toBe(false);
  });
});
